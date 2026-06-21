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
    const geo = geoip.lookup(normalizeIP(ip));
    return geo;
  } catch (error) {
    console.error('Error looking up IP:', error);
    return null;
  }
}

function normalizeIP(ip) {
  if (!ip) return ip;
  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }
  return ip;
}

function getClientIP(reqOrSocket) {
  const forwarded = reqOrSocket.headers?.['x-forwarded-for'];
  const rawIP = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
                reqOrSocket.socket?.remoteAddress ||
                reqOrSocket.connection?.remoteAddress ||
                reqOrSocket.handshake?.address;

  return normalizeIP(rawIP);
}

function isLocalhost(clientIP) {
  return clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost';
}

function buildUserLocation(clientIP, geo) {
  if (isLocalhost(clientIP)) {
    return {
      ip: clientIP,
      geo: null,
      isFromMindanao: true,
      isDevelopment: true,
      country: 'DEV',
      region: 'Local',
      city: 'Local',
      timezone: 'Local'
    };
  }

  return {
    ip: clientIP,
    geo: geo,
    isFromMindanao: false,
    isDevelopment: false,
    country: geo?.country || 'Unknown',
    region: geo?.region || 'Unknown',
    city: geo?.city || 'Unknown',
    timezone: geo?.timezone || 'Unknown'
  };
}

/**
 * Validate access based on IP geolocation
 * @returns {{ allowed: boolean, userLocation: object, error?: object }}
 */
function validateMindanaoAccess(clientIP) {
  const normalizedIP = normalizeIP(clientIP);

  if (isLocalhost(normalizedIP)) {
    return { allowed: true, userLocation: buildUserLocation(normalizedIP, null) };
  }

  const geo = getLocationFromIP(normalizedIP);
  const userLocation = buildUserLocation(normalizedIP, geo);

  console.log(`[LocationCheck] IP: ${normalizedIP} | Region: ${geo?.region} | City: ${geo?.city} | Country: ${geo?.country}`);

  // Unknown IPs can't be geolocated — allow rather than block (common on campus/mobile networks)
  if (!geo) {
    userLocation.isFromMindanao = true;
    return { allowed: true, userLocation };
  }

  if (geo.country !== 'PH') {
    return {
      allowed: false,
      userLocation,
      error: {
        error: 'Access Denied',
        message: 'Not from Mindanao',
        details: `You are connecting from ${geo?.country || 'unknown country'}. This service is only available for users in Mindanao, Philippines.`,
        yourLocation: {
          country: geo?.country,
          city: geo?.city,
          region: geo?.region,
          timezone: geo?.timezone
        }
      }
    };
  }

  const isFromMindanao = isAllowedRegion(geo?.region) ||
                         (geo?.ll && isWithinMindanao(geo.ll[0], geo.ll[1]));

  if (!isFromMindanao) {
    return {
      allowed: false,
      userLocation,
      error: {
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
      }
    };
  }

  userLocation.isFromMindanao = true;
  return { allowed: true, userLocation };
}

/**
 * Middleware: Check if user is from Mindanao (Bukidnon area)
 * Returns 405 if not from Mindanao
 */
function locationCheckMiddleware(req, res, next) {
  // Socket.io handles its own location check — skip to avoid breaking polling transport
  if (req.path.startsWith('/socket.io')) {
    return next();
  }

  const clientIP = getClientIP(req);

  const result = validateMindanaoAccess(clientIP);
  req.userLocation = result.userLocation;

  if (!result.allowed) {
    return res.status(405).json(result.error);
  }

  next();
}

/**
 * Socket.IO middleware: Check IP geolocation on connect
 */
function socketLocationCheck(socket, next) {
  const clientIP = getClientIP(socket);

  const result = validateMindanaoAccess(clientIP);

  if (!result.allowed) {
    return next(new Error(result.error.details));
  }

  socket.userLocation = result.userLocation;
  console.log(`[SocketConnection] Client IP: ${clientIP} | Region: ${result.userLocation.region} | City: ${result.userLocation.city}`);
  next();
}

/*
 * Previous socket middleware — allowed all connections; GPS validation happened on join.
 * Re-enable this (and disable IP check above) when switching back to device GPS.
 *
 * function socketLocationCheck(socket, next) {
 *   const clientIP = socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() ||
 *                    socket.handshake.address;
 *   socket.userLocation = {
 *     ip: clientIP,
 *     isDevelopment: clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost'
 *   };
 *   console.log(`[SocketConnection] Client IP: ${clientIP} (GPS validation will happen on join)`);
 *   next();
 * }
 */

module.exports = { socketLocationCheck, locationCheckMiddleware };
