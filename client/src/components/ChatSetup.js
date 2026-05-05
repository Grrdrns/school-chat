import React, { useState, useRef, useEffect } from 'react';

function ChatSetup({ 
  onLogin, 
  status, 
  userData, 
  partner, 
  messages, 
  isTyping, 
  isDisconnected,
  onSendMessage,
  onTyping,
  onSkip,
  onStop,
  onFindNewMatch
}) {
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [interests, setInterests] = useState('');
  const [matchSimilar, setMatchSimilar] = useState(false);
  const [inputText, setInputText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStart = () => {
    // Generate random anonymous name
    const anonymousNames = ['Stranger', 'Student', 'Anonymous', 'User'];
    const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + Math.floor(Math.random() * 1000);
    
    onLogin({
      nickname: randomName,
      course: course.trim() || 'general',
      college: college.trim() || 'buksu',
      interests: interests.trim(),
      matchSimilar: matchSimilar
    });
  };

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

  const showChatArea = status === 'waiting' || status === 'chatting' || status === 'ended' || status === 'disconnected';
  const canChat = status === 'chatting'; // Only allow typing when actively chatting
  const chatEnded = status === 'ended' || status === 'disconnected';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#17a2b8',
        padding: '12px 24px',
        borderRadius: '0 0 20px 20px',
        margin: '0 20px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>BuksuOne</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Talk to strangers!</p>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '0 20px',
        gap: '20px',
        minHeight: 'calc(100vh - 120px)'
      }}>
        {/* Left - Chat Area */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {!showChatArea ? (
            // Placeholder when not chatting
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px'
            }}>
              <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px' }}>
                You're chatting with a random stranger. Say hi!
              </p>
              <p style={{ color: '#999', fontSize: '0.85rem' }}>
                Your identity is completely anonymous.
              </p>
            </div>
          ) : chatEnded ? (
            // Chat ended - show ended state with Find New Match button
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px'
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
                {partner ? `${partner.nickname} has left the conversation` : 'Your partner has left'}
              </p>
              <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '24px' }}>
                You can find a new match to continue chatting
              </p>
              <button
                onClick={onFindNewMatch}
                style={{
                  padding: '14px 32px',
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
            </div>
          ) : status === 'waiting' ? (
            // Waiting for match
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px'
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
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Finding a match based on your preferences
              </p>
            </div>
          ) : (
            // Active chat
            <>
              {/* Disconnected Banner */}
              {isDisconnected && (
                <div style={{
                  background: '#ffebee',
                  border: '1px solid #ef5350',
                  padding: '12px 20px',
                  textAlign: 'center',
                  color: '#c62828',
                  fontSize: '0.9rem'
                }}>
                  Your partner has left the chat
                </div>
              )}

              {/* Chat Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: isDisconnected ? '#999' : '#333' }}>
                    {isDisconnected 
                      ? 'Partner disconnected' 
                      : (partner ? `Chatting with ${partner.nickname}` : 'Finding a match...')
                    }
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: isDisconnected ? '#bbb' : '#666' }}>
                    {isDisconnected 
                      ? 'Start a new chat to find someone else'
                      : (partner ? `${partner.college} • ${partner.course}` : 'Please wait...')
                    }
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={onSkip}
                    style={{
                      padding: '8px 16px',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Next
                  </button>
                  <button
                    onClick={onStop}
                    style={{
                      padding: '8px 16px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
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
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {messages.length === 0 && !isDisconnected && (
                  <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                    Waiting for your partner to say something...
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                      background: msg.isOwn ? '#17a2b8' : '#f0f0f0',
                      color: msg.isOwn ? 'white' : '#333',
                      wordWrap: 'break-word'
                    }}
                  >
                    {!msg.isSystem && !msg.isOwn && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', opacity: 0.8 }}>
                        {msg.sender}
                      </div>
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
                  <div style={{
                    alignSelf: 'flex-start',
                    background: '#f0f0f0',
                    padding: '12px 16px',
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

              {/* Input Area - only show when actually chatting */}
              {canChat && (
                <form onSubmit={handleSend} style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  gap: '12px'
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
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isDisconnected}
                    style={{
                      padding: '12px 24px',
                      background: (!inputText.trim() || isDisconnected) ? '#ccc' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: (!inputText.trim() || isDisconnected) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Send
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Right - Sidebar */}
        <div style={{
          width: '320px',
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e0e0e0',
          height: 'fit-content'
        }}>
          {/* Start a chat */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
              Start a chat
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                College/University
              </label>
              <input
                type="text"
                placeholder="Enter your college name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={status === 'chatting' || status === 'waiting'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: (status === 'chatting' || status === 'waiting') ? '#f5f5f5' : 'white'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                Course/Department
              </label>
              <input
                type="text"
                placeholder="e.g., Computer Science, Engineering"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={status === 'chatting' || status === 'waiting'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: (status === 'chatting' || status === 'waiting') ? '#f5f5f5' : 'white'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                Interests (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., gaming, music, coding"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                disabled={status === 'chatting' || status === 'waiting'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: (status === 'chatting' || status === 'waiting') ? '#f5f5f5' : 'white'
                }}
              />
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#666',
              marginBottom: '16px',
              cursor: (status === 'chatting' || status === 'waiting') ? 'default' : 'pointer'
            }}>
              <input
                type="checkbox"
                checked={matchSimilar}
                onChange={(e) => setMatchSimilar(e.target.checked)}
                disabled={status === 'chatting' || status === 'waiting'}
                style={{ marginRight: '8px' }}
              />
              Match with similar interests
            </label>

            {(status === 'setup' || status === 'ended') ? (
              <button 
                onClick={handleStart}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {status === 'ended' ? 'Start New Chat' : 'Start Chat'}
              </button>
            ) : (
              status === 'waiting' ? (
                <div style={{
                  padding: '12px',
                  background: '#fff3e0',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#e65100'
                }}>
                  Searching for match...
                </div>
              ) : status === 'ended' ? (
                <div style={{
                  padding: '12px',
                  background: '#ffebee',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#c62828'
                }}>
                  Chat ended - Find new match
                </div>
              ) : status === 'disconnected' ? (
                <div style={{
                  padding: '12px',
                  background: '#ffebee',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#c62828'
                }}>
                  Partner left - Start new chat
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: '#e8f5e9',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#2e7d32'
                }}>
                  Chat active!
                </div>
              )
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

          {/* About BuksuOne */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>
              About BuksuOne
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: '1.5' }}>
              BuksuOne connects you with random students from your campus. Chat anonymously and make new connections.
            </p>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>
              How it works
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#666', lineHeight: '1.6' }}>
              <li>Enter your college and course</li>
              <li>Add interests (optional)</li>
              <li>Get matched with a random student</li>
              <li>Start chatting anonymously</li>
            </ul>
          </div>

          {/* Safety Tips */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>
              Safety Tips
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#666', lineHeight: '1.6' }}>
              <li>Don't share personal information</li>
              <li>Be respectful to others</li>
              <li>Report inappropriate behavior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatSetup;
