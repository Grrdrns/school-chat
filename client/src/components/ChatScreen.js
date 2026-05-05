import React, { useState, useRef, useEffect } from 'react';

function ChatScreen({
  userData,
  partner,
  messages,
  isTyping,
  isDisconnected,
  onSendMessage,
  onTyping,
  onSkip,
  onStop,
  onReconnect
}) {
  const [inputText, setInputText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
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
    
    // Typing indicator
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <h3>
            {partner ? (
              <>
                Chatting with {partner.nickname}
                <span className="match-badge">{partner.college} • {partner.course}</span>
              </>
            ) : (
              isDisconnected ? 'Partner Disconnected' : 'Finding a match...'
            )}
          </h3>
          <p>{isDisconnected ? 'You can find a new partner' : partner ? 'Say hello! 👋' : 'Please wait...'}</p>
        </div>
        <div className="chat-actions">
          <button className="action-btn next-btn" onClick={onSkip}>
            Next Partner
          </button>
          <button className="action-btn stop-btn" onClick={onStop}>
            Stop
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages">
          {messages.length === 0 && !isDisconnected && (
            <div className="status-message">
              <p>Waiting for your partner to say something...</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.isSystem ? 'system' : msg.isOwn ? 'own' : 'other'}`}
            >
              {!msg.isSystem && !msg.isOwn && (
                <div className="message-sender">{msg.sender}</div>
              )}
              <div>{msg.text}</div>
              <div style={{
                fontSize: '0.7rem',
                marginTop: '4px',
                opacity: 0.6,
                textAlign: msg.isOwn ? 'right' : 'left'
              }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            className="message-input"
            placeholder={isDisconnected ? "Partner disconnected..." : "Type a message..."}
            value={inputText}
            onChange={handleInputChange}
            disabled={isDisconnected}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || isDisconnected}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatScreen;
