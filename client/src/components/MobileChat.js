import React, { useState, useRef, useEffect } from 'react';

function MobileChat({
  status,
  partner,
  messages,
  isTyping,
  isDisconnected,
  onSendMessage,
  onTyping,
  onSkip,
  onStop,
  onFindNewMatch,
  onBackToSetup
}) {
  const [inputText, setInputText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      onTyping(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value) {
      onTyping(true);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      const timeout = setTimeout(() => {
        onTyping(false);
      }, 1000);
      setTypingTimeout(timeout);
    } else {
      onTyping(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Waiting state
  if (status === 'waiting') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e0e0e0',
          borderTopColor: '#17a2b8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }}></div>
        <h3 style={{ color: '#333', fontSize: '1.2rem', marginBottom: '8px' }}>
          Looking for someone...
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
          Finding a match
        </p>
        <button
          onClick={onBackToSetup}
          style={{
            padding: '12px 24px',
            background: '#fff',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  // Chat ended state
  if (status === 'ended' || status === 'disconnected') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#ffebee',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          fontSize: '40px'
        }}>
          👋
        </div>
        <h3 style={{ color: '#333', fontSize: '1.3rem', marginBottom: '12px' }}>
          Chat Ended
        </h3>
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px' }}>
          {partner ? `${partner.nickname} has left` : 'Your partner has left'}
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onFindNewMatch}
            style={{
              padding: '14px 28px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Find New Match
          </button>
          <button
            onClick={onBackToSetup}
            style={{
              padding: '14px 28px',
              background: '#fff',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Settings
          </button>
        </div>
      </div>
    );
  }

  // Active chat
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: '#17a2b8',
        padding: '12px 16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>BukChat</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
            {partner ? `${partner.nickname} • ${partner.college}` : 'Chatting...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onSkip}
            style={{
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Next
          </button>
          <button
            onClick={onStop}
            style={{
              padding: '8px 14px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'white'
      }}>
        {messages.length === 0 && !isDisconnected && (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
            Waiting for your partner to say something...
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: '16px',
              alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
              background: msg.isOwn ? '#17a2b8' : '#f0f0f0',
              color: msg.isOwn ? 'white' : '#333',
              wordWrap: 'break-word',
              fontSize: '0.95rem'
            }}
          >
            {!msg.isSystem && !msg.isOwn && (
              <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '3px', opacity: 0.8 }}>
                {msg.sender}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            <div style={{
              fontSize: '0.65rem',
              marginTop: '3px',
              opacity: 0.6,
              textAlign: msg.isOwn ? 'right' : 'left'
            }}>
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#f0f0f0',
            padding: '10px 14px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0s' }}></span>
            <span style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></span>
            <span style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '12px 16px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '10px',
        background: '#f5f5f5'
      }}>
        <input
          type="text"
          placeholder={isDisconnected ? "Partner disconnected..." : "Type a message..."}
          value={inputText}
          onChange={handleInputChange}
          disabled={isDisconnected}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '16px',
            background: isDisconnected ? '#f5f5f5' : 'white'
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isDisconnected}
          style={{
            padding: '12px 20px',
            background: (!inputText.trim() || isDisconnected) ? '#ccc' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: (!inputText.trim() || isDisconnected) ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MobileChat;
