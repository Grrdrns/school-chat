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
  const [locationError, setLocationError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify location on app load using GPS coordinates
  useEffect(() => {
    const verifyLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            try {
              const response = await fetch(`${SERVER_URL}/verify-location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: latitude, lng: longitude, accuracy })
              });

              if (!response.ok) {
                const errorData = await response.json();
                setLocationError(errorData);
                setIsVerifying(false);
                return;
              }

              const data = await response.json();
              console.log('Location verified:', data);
              setLocationError(null);
              setIsVerifying(false);
            } catch (error) {
              console.error('Location verification error:', error);
              setLocationError({
                error: 'Connection Error',
                message: 'Unable to verify your location',
                details: 'Could not connect to the server to verify your location.'
              });
              setIsVerifying(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationError({
              error: 'Location Permission Denied',
              message: 'Please enable location access',
              details: 'You must enable GPS/location access to use this app. This service is only available for students at BUKSU campuses in Bukidnon and Misamis Oriental.'
            });
            setIsVerifying(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setLocationError({
          error: 'Geolocation Not Supported',
          message: 'Your browser does not support geolocation',
          details: 'Please use a modern browser that supports GPS location services.'
        });
        setIsVerifying(false);
      }
    };

    verifyLocation();
  }, []);

  // Show location error screen if not from allowed region
  if (isVerifying) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Verifying location...</h2>
          <p>Please wait while we verify your location.</p>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
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
          <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>{locationError.message || 'Access Denied'}</h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
            {locationError.details || 'You do not have access to this service.'}
          </p>
          {locationError.yourLocation && (
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '4px',
              marginTop: '20px',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <p><strong>Your Location:</strong></p>
              <p>Latitude: {locationError.yourLocation.lat?.toFixed(4)}°</p>
              <p>Longitude: {locationError.yourLocation.lng?.toFixed(4)}°</p>
              <p>Accuracy: {locationError.yourLocation.accuracy?.toFixed(0)}m</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setStatus('disconnected');
      console.log('Disconnected from server');
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

    newSocket.on('access_denied', (data) => {
      setLocationError(data);
      setStatus('setup'); // Go back to setup so they can try again
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (data) => {
    setUserData(data);
    if (socket) {
      socket.emit('join', data);
    }
  };

  const handleSendMessage = (text) => {
    if (socket && text.trim()) {
      socket.emit('message', { text });
      setMessages(prev => [...prev, {
        text,
        sender: 'You',
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
    if (socket) {
      socket.emit('findNewMatch');
    }
    setStatus('waiting');
    setMessages([]);
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
      {!isConnected && status !== 'landing' && status !== 'setup' && (
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
      
      {status === 'landing' && (
        <LandingPage onProceed={handleProceed} />
      )}
      
      {/* Mobile Layout */}
      {isMobile && status === 'setup' && (
        <MobileSetup 
          onLogin={handleLogin}
          status={status}
        />
      )}
      
      {isMobile && (status === 'waiting' || status === 'chatting' || status === 'ended' || status === 'disconnected') && (
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
      
      {/* Desktop Layout - Two Column */}
      {!isMobile && status === 'setup' && (
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
      
      {!isMobile && (status === 'waiting' || status === 'chatting' || status === 'ended' || status === 'disconnected') && (
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
