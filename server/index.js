const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store waiting users and active chats
const waitingUsers = [];
const activeChats = new Map();
const userSockets = new Map();

// Calculate match score between two users
function calculateMatchScore(user1, user2) {
  let score = 0;
  
  // Same college = highest priority
  if (user1.college === user2.college) {
    score += 100;
  }
  
  // Same course = high priority
  if (user1.course === user2.course) {
    score += 50;
  }
  
  // Similar course category (e.g., both Engineering, both Arts)
  const courseCategories = {
    'engineering': ['bsce', 'bsee', 'bsme', 'bscpe', 'bsie'],
    'it': ['bsit', 'bscs', 'bsis'],
    'business': ['bsba', 'bsa', 'bsma'],
    'education': ['beed', 'bsed'],
    'arts': ['bspsych', 'bspolsci', 'bsjourn'],
    'sciences': ['bsbio', 'bschem', 'bsmath', 'bsphysics']
  };
  
  const user1Category = Object.keys(courseCategories).find(cat => 
    courseCategories[cat].includes(user1.course.toLowerCase())
  );
  const user2Category = Object.keys(courseCategories).find(cat => 
    courseCategories[cat].includes(user2.course.toLowerCase())
  );
  
  if (user1Category && user2Category && user1Category === user2Category) {
    score += 25;
  }
  
  return score;
}

// Find best match for a user
function findMatch(user) {
  if (waitingUsers.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = -1;
  
  for (let i = 0; i < waitingUsers.length; i++) {
    const candidate = waitingUsers[i];
    
    // Don't match with yourself
    if (candidate.id === user.id) continue;
    
    // Calculate match score
    const score = calculateMatchScore(user, candidate);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { user: candidate, index: i, score };
    }
  }
  
  return bestMatch;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins waiting pool
  socket.on('join', (userData) => {
    const user = {
      id: socket.id,
      nickname: userData.nickname,
      course: userData.course.toLowerCase(),
      college: userData.college.toLowerCase(),
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
      
      // Notify both users
      socket.emit('matched', {
        roomId,
        partner: {
          nickname: partner.nickname,
          course: partner.course,
          college: partner.college
        },
        matchScore: match.score
      });
      
      partner.socket.emit('matched', {
        roomId,
        partner: {
          nickname: user.nickname,
          course: user.course,
          college: user.college
        },
        matchScore: match.score
      });
      
      console.log(`Matched: ${user.nickname} (${user.course}) with ${partner.nickname} (${partner.course}) - Score: ${match.score}`);
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
      partner.socket.emit('partnerDisconnected');
      partner.socket.leave(chat.roomId);
      
      // Remove partner's chat record
      activeChats.delete(partnerId);
      
      // Add partner back to waiting pool
      waitingUsers.push(partner);
      partner.socket.emit('waiting');
    }
    
    socket.leave(chat.roomId);
    activeChats.delete(socket.id);
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
