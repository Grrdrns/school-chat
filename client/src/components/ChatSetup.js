import React, { useState, useRef, useEffect } from 'react';

// BUKSU Colleges and Courses (Undergraduate Only)
const COLLEGES_DATA = {
  'College of Arts and Sciences': [
    'Bachelor of Arts in Economics',
    'Bachelor of Arts in English Language',
    'Bachelor of Arts in Philosophy Pre-Law',
    'Bachelor of Arts in Philosophy Teaching Track',
    'Bachelor of Arts in Sociology',
    'Bachelor of Science in Biology Major in Biotechnology',
    'Bachelor of Science in Community Development',
    'Bachelor of Science in Development Communication',
    'Bachelor of Science in Environmental Science major in Environmental Heritage Studies',
    'Bachelor of Science in Mathematics'
  ],
  'College of Business': [
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Business Administration major in Financial Management',
    'Bachelor of Science in Hospitality Management'
  ],
  'College of Education': [
    'Bachelor of Early Childhood Education',
    'Bachelor of Elementary Education',
    'Bachelor of Physical Education',
    'Bachelor of Secondary Education Major in English',
    'Bachelor of Secondary Education Major in Filipino',
    'Bachelor of Secondary Education Major in Mathematics',
    'Bachelor of Secondary Education Major in Science',
    'Bachelor of Secondary Education Major in Social Studies'
  ],
  'College of Nursing': [
    'Bachelor of Science in Nursing'
  ],
  'College of Law': [
    'Juris Doctor'
  ],
  'College of Technologies': [
    'Bachelor of Science in Automotive Technology',
    'Bachelor of Science in Electronics Technology',
    'Bachelor of Science in Entertainment and Multimedia Computing Major in Digital Animation Technology',
    'Bachelor of Science in Food Technology',
    'Bachelor of Science in Information Technology'
  ],
  'College of Public Administration and Governance': [
    'Bachelor of Public Administration'
  ]
};

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
  onFindNewMatch,
  onCancelSearch
}) {
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [nickname, setNickname] = useState('');
  const [interests, setInterests] = useState('');
  const [interestTags, setInterestTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [matchSimilar, setMatchSimilar] = useState(false);
  const [inputText, setInputText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  // Reset course when college changes
  useEffect(() => {
    setCourse('');
  }, [college]);

  useEffect(() => {
    if (userData?.nickname) {
      setNickname(userData.nickname);
    }
  }, [userData?.nickname]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !interestTags.includes(tag)) {
        setInterestTags([...interestTags, tag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setInterestTags(interestTags.filter(tag => tag !== tagToRemove));
  };

  const handleStart = () => {
    const trimmedNickname = nickname.trim().slice(0, 20);
    const anonymousNames = ['Stranger', 'Student', 'Anonymous', 'User'];
    const fallbackName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + Math.floor(Math.random() * 1000);

    onLogin({
      nickname: trimmedNickname || fallbackName,
      course: course.trim() || 'general',
      college: college.trim() || 'buksu',
      interests: interestTags.join(','),
      matchSimilar: matchSimilar
    });

    /*
     * GPS location check (disabled — server uses IP-based check instead)
     * Uncomment block below and comment out the onLogin() call above to re-enable.
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
     * requestGPSWithRetry(
     *   (position) => {
     *     const { latitude, longitude, accuracy } = position;
     *     onLogin({
     *       nickname: randomName,
     *       course: course.trim() || 'general',
     *       college: college.trim() || 'buksu',
     *       interests: interestTags.join(','),
     *       matchSimilar: matchSimilar,
     *       lat: latitude,
     *       lng: longitude,
     *       accuracy: accuracy
     *     });
     *   },
     *   (error) => {
     *     alert('Please enable location access to use this app. You must be at a BUKSU campus in Bukidnon or Misamis Oriental.');
     *     console.error('Geolocation error:', error);
     *   }
     * );
     */
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
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>BukChat</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Talk to strangers!</p>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{
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
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
                Finding a match based on your preferences
              </p>
              <button
                onClick={onCancelSearch}
                style={{
                  padding: '12px 32px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel Search
              </button>
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
        <div className="sidebar" style={{
          width: '320px',
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e0e0e0',
          height: 'fit-content',
          flexShrink: 0
        }}>
          {/* Start a chat */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
              Start a chat
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="Choose a nickname (optional)"
                disabled={status === 'chatting' || status === 'waiting'}
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: (status === 'chatting' || status === 'waiting') ? '#f5f5f5' : 'white'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '4px 0 0 0' }}>
                Shown to your chat partner. Leave blank for a random name.
              </p>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                College
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={status === 'chatting' || status === 'waiting'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: (status === 'chatting' || status === 'waiting') ? '#f5f5f5' : 'white',
                  cursor: (status === 'chatting' || status === 'waiting') ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Select a college</option>
                {Object.keys(COLLEGES_DATA).map((collegeName) => (
                  <option key={collegeName} value={collegeName}>
                    {collegeName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                Course/Department
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={status === 'chatting' || status === 'waiting' || !college}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  background: (status === 'chatting' || status === 'waiting' || !college) ? '#f5f5f5' : 'white',
                  cursor: (status === 'chatting' || status === 'waiting' || !college) ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Select a course</option>
                {college && COLLEGES_DATA[college] && COLLEGES_DATA[college].map((courseName) => (
                  <option key={courseName} value={courseName}>
                    {courseName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                 What do you wanna talk about?
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: (status === 'chatting' || status === 'waiting') ? '#f5f5f5' : 'white',
                minHeight: '42px',
                alignItems: 'center'
              }}>
                {interestTags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      disabled={status === 'chatting' || status === 'waiting'}
                      style={{
                        background: 'rgba(255,255,255,0.3)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'white'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={interestTags.length === 0 ? "Type and press Enter..." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={status === 'chatting' || status === 'waiting'}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: 'transparent',
                    padding: '4px'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '4px 0 0 0' }}>
                Press Enter, comma, or space to add
              </p>
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
              Find strangers with common interests
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
                <div>
                  <button
                    onClick={onCancelSearch}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: '8px'
                    }}
                  >
                    Cancel Search
                  </button>
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

          {/* About BukChat */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>
              About BukChat
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: '1.5' }}>
              BukChat connects you with random students from your campus. Chat anonymously and make new connections.
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
