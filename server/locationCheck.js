const geoip = require('geoip-lite');

/**
 * Location Check Module
 * Verifies if user is connecting from Bukidnon, Philippines
 */

// Mindanao coordinates (approximate bounding box) - covers entire Mindanao region
// This includes Bukidnon, Davao, Zamboanga, Cotabato, Lanao, Misamis, Surigao regions
const MINDANAO_BOUNDS = {
  minLat: 5.0,
  maxLat: 9.5,
  minLon: 123.5,
  maxLon: 126.5,
  region: 'Mindanao',
  country: 'Philippines'
};

// Fallback: Accept Northern Mindanao region code (XIII) which includes Bukidnon
const ALLOWED_REGIONS = ['XIII']; // Region XIII = Northern Mindanao

/**
 * Check if coordinates are within Mindanao
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
function isWithinMindanao(latitude, longitude) {
  if (!latitude || !longitude) return false;
  
  return (
    latitude >= MINDANAO_BOUNDS.minLat &&
    latitude <= MINDANAO_BOUNDS.maxLat &&
    longitude >= MINDANAO_BOUNDS.minLon &&
    longitude <= MINDANAO_BOUNDS.maxLon
  );
}

/**
 * Check if region code is in allowed list
 * @param {string} regionCode 
 * @returns {boolean}
 */
function isAllowedRegion(regionCode) {
  return ALLOWED_REGIONS.includes(regionCode);
}

/**
 * Get user location from IP address
 * @param {string} ip - User's IP address
 * @returns {object} Location data or null
 */
function getLocationFromIP(ip) {
  try {
    const geo = geoip.lookup(ip);
    return geo;
  } catch (error) {
    console.error('Error looking up IP:', error);
    return null;
  }
}

/**
 * Middleware: Check if user is from Mindanao (Bukidnon area)
 * Returns 405 if not from Mindanao
 */
function locationCheckMiddleware(req, res, next) {
  // Get user's real IP (works behind proxies)
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.socket.remoteAddress || 
                   req.connection.remoteAddress;

  // Allow localhost for development
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost') {
    req.userLocation = {
      ip: clientIP,
      geo: null,
      isFromMindanao: true,
      isDevelopment: true,
      country: 'DEV',
      timezone: 'Local'
    };
    return next();
  }

  // Lookup location
  const geo = getLocationFromIP(clientIP);

  // Store location info in request for later use
  req.userLocation = {
    ip: clientIP,
    geo: geo,
    isFromMindanao: false,
    isDevelopment: false,
    country: geo?.country || 'Unknown',
    region: geo?.region || 'Unknown',
    city: geo?.city || 'Unknown',
    timezone: geo?.timezone || 'Unknown'
  };

  console.log(`[LocationCheck] IP: ${clientIP} | Region: ${geo?.region} | City: ${geo?.city} | Country: ${geo?.country}`);

  // Check if from Philippines first
  if (geo?.country !== 'PH') {
    return res.status(405).json({
      error: 'Access Denied',
      message: 'Not from Mindanao',
      details: `You are connecting from ${geo?.country || 'unknown country'}. This service is only available for users in Mindanao, Philippines.`,
      yourLocation: {
        country: geo?.country,
        city: geo?.city,
        region: geo?.region,
        timezone: geo?.timezone
      }
    });
  }

  // Check if from Mindanao using region code (more reliable) OR coordinates
  const isFromMindanao = isAllowedRegion(geo?.region) || 
                         (geo?.ll && isWithinMindanao(geo.ll[0], geo.ll[1]));

  if (!isFromMindanao) {
    return res.status(405).json({
      error: 'Access Denied',
      message: 'Not from Mindanao',
      details: `You are in ${geo?.city || 'unknown city'}, ${geo?.region || 'unknown region'}, Philippines. This service is only available for users in Mindanao (Bukidnon area).`,
      yourLocation: {
        country: geo?.country,
        city: geo?.city,
        region: geo?.region,
        timezone: geo?.timezone,
        coordinates: geo?.ll ? {
          latitude: geo.ll[0],
          longitude: geo.ll[1]
        } : null
      }
    });
  }

  // User is from Mindanao - allow access
  req.userLocation.isFromMindanao = true;
  next();
}

/**
 * Socket.IO middleware: Check location on socket connection
 */
function socketLocationCheck(socket, next) {
  // Get user's real IP from socket handshake
  const clientIP = socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() ||
                   socket.handshake.address;

  // Allow localhost for development
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost') {
    socket.userLocation = {
      ip: clientIP,
      geo: null,
      isFromMindanao: true,
      isDevelopment: true,
      country: 'DEV',
      region: 'Local',
      timezone: 'Local'
    };
    return next();
  }

  // Lookup location
  const geo = getLocationFromIP(clientIP);

  // Store on socket for later use
  socket.userLocation = {
    ip: clientIP,
    geo: geo,
    isFromMindanao: false,
    isDevelopment: false,
    country: geo?.country || 'Unknown',
    region: geo?.region || 'Unknown',
    city: geo?.city || 'Unknown',
    timezone: geo?.timezone || 'Unknown'
  };

  console.log(`[SocketLocationCheck] IP: ${clientIP} | Region: ${geo?.region} | City: ${geo?.city} | Country: ${geo?.country}`);

  // Check if from Philippines
  if (geo?.country !== 'PH') {
    const error = new Error('Access Denied: Not from Mindanao');
    error.data = {
      code: 405,
      message: 'Not from Mindanao',
      details: `You are connecting from ${geo?.country || 'unknown country'}. This service is only available for users in Mindanao, Philippines.`,
      yourLocation: {
        country: geo?.country,
        city: geo?.city,
        region: geo?.region,
        timezone: geo?.timezone
      }
    };
    return next(error);
  }

  // Check if from Mindanao using region code (more reliable) OR coordinates
  const isFromMindanao = isAllowedRegion(geo?.region) || 
                         (geo?.ll && isWithinMindanao(geo.ll[0], geo.ll[1]));

  if (!isFromMindanao) {
    const error = new Error('Access Denied: Not from Mindanao');
    error.data = {
      code: 405,
      message: 'Not from Mindanao',
      details: `You are in ${geo?.city || 'unknown city'}, ${geo?.region || 'unknown region'}, Philippines. This service is only available for users in Mindanao (Bukidnon area).`,
      yourLocation: {
        country: geo?.country,
        city: geo?.city,
        region: geo?.region,
        timezone: geo?.timezone,
        coordinates: geo?.ll ? {
          latitude: geo.ll[0],
          longitude: geo.ll[1]
        } : null
      }
    };
    return next(error);
  }

  // User is from Mindanao
  socket.userLocation.isFromMindanao = true;
  next();
}

module.exports = {
  locationCheckMiddleware,
  socketLocationCheck,
  getLocationFromIP,
  isWithinMindanao,
  isAllowedRegion,
  MINDANAO_BOUNDS,
  ALLOWED_REGIONS
};
