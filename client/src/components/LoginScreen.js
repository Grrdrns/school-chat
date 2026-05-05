import React, { useState } from 'react';

function LoginScreen({ onLogin }) {
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [interests, setInterests] = useState('');
  const [matchSimilar, setMatchSimilar] = useState(false);

  const handleStart = () => {
    // Generate random anonymous name
    const anonymousNames = ['Stranger', 'Student', 'Anonymous', 'User'];
    const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + Math.floor(Math.random() * 1000);
    
    onLogin({
      nickname: randomName,
      course: course.trim() || interests.trim() || 'general',
      college: college.trim() || 'buksu'
    });
  };

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
        {/* Left - Chat Area Placeholder */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px' }}>
            You're chatting with a random stranger. Say hi!
          </p>
          <p style={{ color: '#999', fontSize: '0.85rem' }}>
            Your identity is completely anonymous.
          </p>
        </div>

        {/* Right - Sidebar */}
        <div style={{
          width: '320px',
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e0e0e0'
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
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
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
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
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
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#666',
              marginBottom: '16px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={matchSimilar}
                onChange={(e) => setMatchSimilar(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Match with similar interests
            </label>

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
              Start Chat
            </button>
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

export default LoginScreen;
