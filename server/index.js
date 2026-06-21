const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { socketLocationCheck, locationCheckMiddleware } = require('./locationCheck');

const app = express();
app.use(cors());
app.use(locationCheckMiddleware);

// Root route to show server is running
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    service: 'School Chat API',
    endpoints: {
      socket: '/socket.io/'
    }
  });
});

/*
 * GPS Location verification endpoint (disabled — using IP-based check instead)
 * Frontend calls this on load with GPS coordinates when GPS is re-enabled.
 * Requires: app.use(express.json()) if not already added.
 *
 * app.post('/verify-location', (req, res) => {
 *   const { lat, lng, accuracy } = req.body;
 *   if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
 *     return res.status(400).json({
 *       error: 'Invalid Coordinates',
 *       message: 'Please provide valid latitude and longitude',
 *       details: 'Location data is missing or invalid.'
 *     });
 *   }
 *   const inBukidnon = (lat >= 7.9 && lat <= 8.7 && lng >= 124.2 && lng <= 125.3);
 *   const inMisamisOriental = (lat >= 8.7 && lat <= 9.2 && lng >= 124.3 && lng <= 124.6);
 *   if (inBukidnon || inMisamisOriental) {
 *     const region = inBukidnon ? 'Bukidnon' : 'Misamis Oriental';
 *     return res.status(200).json({
 *       success: true,
 *       message: 'Location verified',
 *       region: region,
 *       coordinates: { latitude: lat, longitude: lng, accuracy: accuracy }
 *     });
 *   }
 *   return res.status(405).json({
 *     error: 'Access Denied',
 *     message: 'Outside Service Area',
 *     details: 'This app is only for students in Bukidnon and Misamis Oriental, Philippines.',
 *     yourLocation: { lat, lng, accuracy }
 *   });
 * });
 */

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Apply location check middleware to socket connections
io.use(socketLocationCheck);

// Store waiting users and active chats
const waitingUsers = [];  
const activeChats = new Map();
const userSockets = new Map();

/*
 * GPS campus bounds (disabled — using IP-based check instead)
 *
 * const BUKIDNON_BOUNDS = { minLat: 7.9, maxLat: 8.7, minLng: 124.2, maxLng: 125.3 };
 * const MISAMIS_ORIENTAL_BOUNDS = { minLat: 8.7, maxLat: 9.2, minLng: 124.3, maxLng: 124.6 };
 *
 * function isInBukidnon(lat, lng) {
 *   if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') return false;
 *   const inBukidnon = (
 *     lat >= BUKIDNON_BOUNDS.minLat && lat <= BUKIDNON_BOUNDS.maxLat &&
 *     lng >= BUKIDNON_BOUNDS.minLng && lng <= BUKIDNON_BOUNDS.maxLng
 *   );
 *   const inMisamisOriental = (
 *     lat >= MISAMIS_ORIENTAL_BOUNDS.minLat && lat <= MISAMIS_ORIENTAL_BOUNDS.maxLat &&
 *     lng >= MISAMIS_ORIENTAL_BOUNDS.minLng && lng <= MISAMIS_ORIENTAL_BOUNDS.maxLng
 *   );
 *   return inBukidnon || inMisamisOriental;
 * }
 */

// Calculate match score between two users
// College/course are just INFO - matching is based on interests (optional) or random
function calculateMatchScore(user1, user2) {
  let score = 0;
  
  // If both users want similar interests and have interests, prioritize interest matching
  if (user1.matchSimilar && user2.matchSimilar && user1.interests && user2.interests) {
    const interests1 = user1.interests.split(',').map(i => i.trim().toLowerCase()).filter(i => i);
    const interests2 = user2.interests.split(',').map(i => i.trim().toLowerCase()).filter(i => i);
    
    // Count matching interests
    const commonInterests = interests1.filter(i => interests2.includes(i));
    if (commonInterests.length > 0) {
      score += commonInterests.length * 100; // High score for common interests
    }
  }
  
  // Base score for any match (allows matching with anyone)
  score += 1;
  
  return score;
}

// Find best match for a user
// Match anyone randomly, but prioritize interest matches if both want it
function findMatch(user) {
  if (waitingUsers.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = -1;
  
  // First pass: look for interest matches if user wants similar interests
  if (user.matchSimilar && user.interests) {
    for (let i = 0; i < waitingUsers.length; i++) {
      const candidate = waitingUsers[i];
      
      // Don't match with yourself
      if (candidate.id === user.id) continue;
      
      // Calculate match score (prioritizes interests)
      const score = calculateMatchScore(user, candidate);
      
      if (score > bestScore && score > 1) { // Score > 1 means interest match
        bestScore = score;
        bestMatch = { user: candidate, index: i, score };
      }
    }
    
    // If found interest match, return it
    if (bestMatch) return bestMatch;
  }
  
  // Second pass: match with anyone (random pick from waiting)
  // Find first available user that's not yourself
  for (let i = 0; i < waitingUsers.length; i++) {
    const candidate = waitingUsers[i];
    if (candidate.id !== user.id) {
      return { user: candidate, index: i, score: 1 };
    }
  }
  
  return null;
}

io.on('connection', (socket) => {
  // Location already verified by io.use(socketLocationCheck) middleware
  // User's location info is available at socket.userLocation
  
  console.log(`User connected from ${socket.userLocation.region}, ${socket.userLocation.country}: ${socket.id}`);
  
  // User joins waiting pool
  socket.on('join', (userData) => {
    /*
     * GPS check on join (disabled — using IP-based check on connect instead)
     *
     * const { lat, lng } = userData;
     * if (!isInBukidnon(lat, lng)) {
     *   socket.emit('access_denied', {
     *     message: 'Access Denied',
     *     details: 'This app is only for students at BUKSU campuses in Bukidnon and Misamis Oriental.',
     *     userLocation: { lat, lng, accuracy: userData.accuracy }
     *   });
     *   socket.disconnect(true);
     *   return;
     * }
     */

    const user = {
      id: socket.id,
      nickname: userData.nickname,
      course: userData.course.toLowerCase(),
      college: userData.college.toLowerCase(),
      interests: userData.interests ? userData.interests.toLowerCase() : '',
      matchSimilar: userData.matchSimilar || false,
      socket: socket
    };
    
    userSockets.set(socket.id, user);
    
    // Try to find a match
    const match = findMatch(user);
    
    if (match && match.score > 0) {
      // Remove matched user from waiting pool
      waitingUsers.splice(match.index, 1);
      
      const partner = match.user;
      const roomId = `${socket.id}-${partner.id}`;
      
      // Create chat room
      socket.join(roomId);
      partner.socket.join(roomId);
      
      // Store active chat
      const chatInfo = {
        roomId,
        user1: user,
        user2: partner,
        createdAt: Date.now()
      };
      
      activeChats.set(socket.id, chatInfo);
      activeChats.set(partner.id, chatInfo);
      
      // Calculate common interests for display
      let commonInterests = [];
      if (user.interests && partner.interests) {
        const userInterests = user.interests.split(',').map(i => i.trim()).filter(i => i);
        const partnerInterests = partner.interests.split(',').map(i => i.trim()).filter(i => i);
        commonInterests = userInterests.filter(i => partnerInterests.includes(i));
      }
      
      // Notify both users
      socket.emit('matched', {
        roomId,
        partner: {
          nickname: partner.nickname,
          course: partner.course,
          college: partner.college
        },
        commonInterests: commonInterests,
        matchScore: match.score
      });
      
      partner.socket.emit('matched', {
        roomId,
        partner: {
          nickname: user.nickname,
          course: user.course,
          college: user.college
        },
        commonInterests: commonInterests,
        matchScore: match.score
      });
      
      console.log(`Matched: ${user.nickname} (${user.course}) with ${partner.nickname} (${partner.course}) - Score: ${match.score}${commonInterests.length > 0 ? ` - Common: ${commonInterests.join(', ')}` : ''}`);
    } else {
      // No match found, add to waiting pool
      waitingUsers.push(user);
      socket.emit('waiting');
      console.log(`${user.nickname} added to waiting pool (${waitingUsers.length} waiting)`);
    }
  });
  
  // Handle messages
  socket.on('message', (data) => {
    const chat = activeChats.get(socket.id);
    if (chat) {
      const user = userSockets.get(socket.id);
      socket.to(chat.roomId).emit('message', {
        text: data.text,
        sender: user.nickname,
        timestamp: Date.now()
      });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    const chat = activeChats.get(socket.id);
    if (chat) {
      socket.to(chat.roomId).emit('typing', isTyping);
    }
  });
  
  // Skip/Next partner
  socket.on('skip', () => {
    handleDisconnect(socket);
    socket.emit('skipped');
  });
  
  // Find new match after chat ended
  socket.on('findNewMatch', () => {
    const user = userSockets.get(socket.id);
    if (user) {
      // Try to find a match immediately
      const match = findMatch(user);
      
      if (match && match.score > 0) {
        // Remove matched user from waiting pool
        waitingUsers.splice(match.index, 1);
        
        const partner = match.user;
        const roomId = `${socket.id}-${partner.id}`;
        
        // Create chat room
        socket.join(roomId);
        partner.socket.join(roomId);
        
        // Store active chat
        const chatInfo = {
          roomId,
          user1: user,
          user2: partner,
          createdAt: Date.now()
        };
        
        activeChats.set(socket.id, chatInfo);
        activeChats.set(partner.id, chatInfo);
        
        // Calculate common interests for display
        let commonInterests = [];
        if (user.interests && partner.interests) {
          const userInterests = user.interests.split(',').map(i => i.trim()).filter(i => i);
          const partnerInterests = partner.interests.split(',').map(i => i.trim()).filter(i => i);
          commonInterests = userInterests.filter(i => partnerInterests.includes(i));
        }
        
        // Notify both users
        socket.emit('matched', {
          roomId,
          partner: {
            nickname: partner.nickname,
            course: partner.course,
            college: partner.college
          },
          commonInterests: commonInterests,
          matchScore: match.score
        });
        
        partner.socket.emit('matched', {
          roomId,
          partner: {
            nickname: user.nickname,
            course: user.course,
            college: user.college
          },
          commonInterests: commonInterests,
          matchScore: match.score
        });
        
        console.log(`Matched: ${user.nickname} with ${partner.nickname} - Score: ${match.score}${commonInterests.length > 0 ? ` - Common: ${commonInterests.join(', ')}` : ''}`);
      } else {
        // No match found, add to waiting pool
        waitingUsers.push(user);
        socket.emit('waiting');
        console.log(`${user.nickname} added to waiting pool (${waitingUsers.length} waiting)`);
      }
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    handleDisconnect(socket);
    userSockets.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

function handleDisconnect(socket) {
  // Remove from waiting pool if present
  const waitingIndex = waitingUsers.findIndex(u => u.id === socket.id);
  if (waitingIndex !== -1) {
    waitingUsers.splice(waitingIndex, 1);
  }
  
  // Handle active chat
  const chat = activeChats.get(socket.id);
  if (chat) {
    const partnerId = chat.user1.id === socket.id ? chat.user2.id : chat.user1.id;
    const partner = userSockets.get(partnerId);
    
    if (partner) {
      // Notify partner that chat ended - DON'T auto-queue them
      partner.socket.emit('chatEnded', { 
        reason: 'partner_left',
        message: 'Your partner has left the conversation'
      });
      partner.socket.leave(chat.roomId);
      
      // Remove partner's chat record
      activeChats.delete(partnerId);
      // Partner stays in 'chatEnded' state until they click "Find New Match"
    }
    
    socket.leave(chat.roomId);
    activeChats.delete(socket.id);
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
