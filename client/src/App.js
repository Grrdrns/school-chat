import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LandingPage from './components/LandingPage';
import ChatSetup from './components/ChatSetup';
import ChatScreen from './components/ChatScreen';
import WaitingScreen from './components/WaitingScreen';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://school-chat-production.up.railway.app');

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('landing'); // 'landing', 'setup', 'waiting', 'chatting', 'disconnected'
  const [userData, setUserData] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

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

    newSocket.on('partnerDisconnected', () => {
      setStatus('disconnected');
      setMessages(prev => [...prev, {
        text: 'Your partner has disconnected.',
        sender: 'System',
        isSystem: true,
        timestamp: Date.now()
      }]);
      setPartner(null);
    });

    newSocket.on('skipped', () => {
      setStatus('waiting');
      setPartner(null);
      setMessages([]);
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
      socket.disconnect();
    }
    setStatus('login');
    setUserData(null);
    setPartner(null);
    setMessages([]);
    
    // Reconnect
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);
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
      
      {status === 'setup' && (
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
      
      {(status === 'waiting' || status === 'chatting' || status === 'disconnected') && (
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
    </div>
  );
}

export default App;
