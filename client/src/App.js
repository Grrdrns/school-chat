import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LandingPage from './components/LandingPage';
import ChatSetup from './components/ChatSetup';
import MobileSetup from './components/MobileSetup';
import MobileChat from './components/MobileChat';
import ChatScreen from './components/ChatScreen';
import WaitingScreen from './components/WaitingScreen';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://school-chat-production.up.railway.app');

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('landing'); // 'landing', 'setup', 'waiting', 'chatting', 'ended', 'disconnected'
  const [userData, setUserData] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [connectionError, setConnectionError] = useState(null);
  const userDataRef = useRef(null);
  const statusRef = useRef('landing');

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  /*
   * GPS location check (disabled — using IP-based check on server instead)
   * Uncomment to re-enable device GPS verification on app load.
   *
   * const [locationError, setLocationError] = useState(null);
   * const [isVerifying, setIsVerifying] = useState(true);
   *
   * const requestGPSWithRetry = (onSuccess, onError, retries = 3) => {
   *   const attemptGPS = (retriesLeft) => {
   *     if ('geolocation' in navigator) {
   *       navigator.geolocation.getCurrentPosition(
   *         (position) => {
   *           const { latitude, longitude, accuracy } = position.coords;
   *           if (accuracy < 100 || retriesLeft === 0) {
   *             onSuccess({ latitude, longitude, accuracy });
   *           } else if (retriesLeft > 0) {
   *             setTimeout(() => attemptGPS(retriesLeft - 1), 2000);
   *           }
   *         },
   *         (error) => {
   *           if (retriesLeft > 0) {
   *             setTimeout(() => attemptGPS(retriesLeft - 1), 2000);
   *           } else {
   *             onError(error);
   *           }
   *         },
   *         { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
   *       );
   *     } else {
   *       onError(new Error('Geolocation not supported'));
   *     }
   *   };
   *   attemptGPS(retries);
   * };
   *
   * useEffect(() => {
   *   const verifyLocation = () => {
   *     requestGPSWithRetry(
   *       async (position) => {
   *         const { latitude, longitude, accuracy } = position;
   *         try {
   *           const response = await fetch(`${SERVER_URL}/verify-location`, {
   *             method: 'POST',
   *             headers: { 'Content-Type': 'application/json' },
   *             body: JSON.stringify({ lat: latitude, lng: longitude, accuracy })
   *           });
   *           if (!response.ok) {
   *             setLocationError(await response.json());
   *             setIsVerifying(false);
   *             return;
   *           }
   *           setLocationError(null);
   *           setIsVerifying(false);
   *         } catch (error) {
   *           setLocationError({
   *             error: 'Connection Error',
   *             message: 'Unable to verify your location',
   *             details: 'Could not connect to the server to verify your location.'
   *           });
   *           setIsVerifying(false);
   *         }
   *       },
   *       () => {
   *         setLocationError({
   *           error: 'Location Permission Denied',
   *           message: 'Please enable location access',
   *           details: 'You must enable GPS/location access to use this app.'
   *         });
   *         setIsVerifying(false);
   *       }
   *     );
   *   };
   *   verifyLocation();
   * }, []);
   *
   * if (isVerifying) {
   *   return ( ... "Verifying location..." screen ... );
   * }
   * if (locationError) {
   *   return ( ... location error screen with lat/lng/accuracy ... );
   * }
   */

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    const rejoinIfNeeded = () => {
      const data = userDataRef.current;
      const currentStatus = statusRef.current;
      if (data && ['waiting', 'chatting', 'ended'].includes(currentStatus)) {
        newSocket.emit('join', data);
      }
    };

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Connected to server');
      rejoinIfNeeded();
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      const isAccessDenied = error.message?.includes('Mindanao') ||
        error.message?.includes('Philippines') ||
        error.message?.includes('service is only available');
      if (isAccessDenied) {
        setConnectionError({
          message: 'Access Denied',
          details: error.message
        });
      }
      console.error('Connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      // Partner leaving sets status to 'ended' — don't overwrite that with 'disconnected'
      if (statusRef.current !== 'ended') {
        setStatus('disconnected');
      }
      console.log('Disconnected from server:', reason);
    });

    newSocket.on('waiting', () => {
      setStatus('waiting');
      setMessages([]);
    });

    newSocket.on('matched', (data) => {
      setPartner(data.partner);
      setStatus('chatting');
      
      // Build match message
      let matchText = `You matched with ${data.partner.nickname} from ${data.partner.college}! (${data.partner.course})`;
      if (data.commonInterests && data.commonInterests.length > 0) {
        matchText += `\nYou both like: ${data.commonInterests.join(', ')}`;
      }
      
      setMessages([
        {
          text: matchText,
          sender: 'System',
          isSystem: true,
          timestamp: Date.now()
        }
      ]);
    });

    newSocket.on('message', (data) => {
      setMessages(prev => [...prev, {
        text: data.text,
        sender: data.sender,
        isOwn: false,
        timestamp: data.timestamp
      }]);
      setIsTyping(false);
    });

    newSocket.on('typing', (typing) => {
      setIsTyping(typing);
    });

    newSocket.on('chatEnded', (data) => {
      setStatus('ended'); // Chat ended - show "Find New Match" button
      setMessages(prev => [...prev, {
        text: data.message || 'Your partner has left the conversation.',
        sender: 'System',
        isSystem: true,
        timestamp: Date.now()
      }]);
      // Don't clear partner - keep it to show who left
    });

    newSocket.on('skipped', () => {
      setStatus('waiting');
      setPartner(null);
      setMessages([]);
    });

    newSocket.on('findNewMatch', () => {
      // User clicked Find New Match, now waiting
      setStatus('waiting');
      setPartner(null);
      setMessages([]);
    });

    /*
     * GPS: re-enable when using device location on join
     * newSocket.on('access_denied', (data) => {
     *   setLocationError(data);
     *   setStatus('setup');
     * });
     */

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (data) => {
    setUserData(data);
    userDataRef.current = data;
    if (!socket) return;

    const emitJoin = () => socket.emit('join', data);

    if (socket.connected) {
      emitJoin();
    } else {
      socket.once('connect', emitJoin);
      socket.connect();
    }
  };

  const handleSendMessage = (text) => {
    if (socket && text.trim()) {
      socket.emit('message', { text });
      setMessages(prev => [...prev, {
        text,
        sender: userData?.nickname || 'You',
        isOwn: true,
        timestamp: Date.now()
      }]);
    }
  };

  const handleTyping = (isTypingNow) => {
    if (socket) {
      socket.emit('typing', isTypingNow);
    }
  };

  const handleSkip = () => {
    if (socket) {
      socket.emit('skip');
    }
  };

  const handleStop = () => {
    if (socket) {
      socket.emit('skip'); // Use skip instead of disconnect to properly end chat
    }
    setStatus('setup'); // Go back to setup, not login
    setPartner(null);
    setMessages([]);
  };

  const handleFindNewMatch = () => {
    if (!socket || !userData) return;

    setStatus('waiting');
    setMessages([]);

    if (socket.connected) {
      socket.emit('findNewMatch');
    } else {
      socket.once('connect', () => socket.emit('join', userData));
      socket.connect();
    }
  };

  const handleReconnect = () => {
    if (socket) {
      socket.connect();
      if (userData) {
        socket.emit('join', userData);
      }
    }
  };

  const handleProceed = () => {
    setStatus('setup');
  };

  return (
    <div className="App">
      {connectionError && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff3cd'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#d32f2f', marginBottom: '20px', fontSize: '48px' }}>⛔</h1>
            <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>{connectionError.message}</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>
              {connectionError.details}
            </p>
          </div>
        </div>
      )}

      {!connectionError && !isConnected && (status === 'waiting' || status === 'chatting' || status === 'disconnected') && (
        <div style={{
          background: '#ff4757',
          color: 'white',
          textAlign: 'center',
          padding: '10px',
          fontSize: '0.9rem'
        }}>
          Disconnected from server. Trying to reconnect...
        </div>
      )}
      
      {!connectionError && status === 'landing' && (
        <LandingPage onProceed={handleProceed} />
      )}
      
      {!connectionError && isMobile && status === 'setup' && (
        <MobileSetup 
          onLogin={handleLogin}
          status={status}
          userData={userData}
        />
      )}
      
      {!connectionError && isMobile && (status === 'waiting' || status === 'chatting' || status === 'ended' || status === 'disconnected') && (
        <MobileChat 
          status={status}
          partner={partner}
          messages={messages}
          isTyping={isTyping}
          isDisconnected={status === 'ended' || status === 'disconnected'}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onSkip={handleSkip}
          onStop={handleStop}
          onFindNewMatch={handleFindNewMatch}
          onBackToSetup={() => setStatus('setup')}
        />
      )}
      
      {!connectionError && !isMobile && status === 'setup' && (
        <ChatSetup 
          onLogin={handleLogin}
          status={status}
          userData={userData}
          partner={partner}
          messages={messages}
          isTyping={isTyping}
          isDisconnected={status === 'disconnected'}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onSkip={handleSkip}
          onStop={handleStop}
        />
      )}
      
      {!connectionError && !isMobile && (status === 'waiting' || status === 'chatting' || status === 'ended' || status === 'disconnected') && (
        <ChatSetup 
          onLogin={handleLogin}
          status={status}
          userData={userData}
          partner={partner}
          messages={messages}
          isTyping={isTyping}
          isDisconnected={status === 'ended' || status === 'disconnected'}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onSkip={handleSkip}
          onStop={handleStop}
          onFindNewMatch={handleFindNewMatch}
        />
      )}
    </div>
  );
}

export default App;
