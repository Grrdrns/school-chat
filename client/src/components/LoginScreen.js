import React, { useState } from 'react';

function LoginScreen({ onLogin }) {
  const [interests, setInterests] = useState('');

  const handleStart = () => {
    // Generate random anonymous name
    const anonymousNames = ['Stranger', 'Student', 'Anonymous', 'User'];
    const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + Math.floor(Math.random() * 1000);
    
    onLogin({
      nickname: randomName,
      course: interests.trim() || 'general',
      college: 'school'
    });
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ textAlign: 'center' }}>
        <div className="logo">
          <h1>📚 School Chat</h1>
          <p>Talk to strangers!</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ 
            fontSize: '1rem', 
            color: '#333',
            marginBottom: '12px',
            fontWeight: 500
          }}>
            What do you wanna talk about?
          </p>
          <input
            type="text"
            placeholder="Add your interests (optional)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '1rem',
              textAlign: 'center'
            }}
          />
        </div>

        <button 
          onClick={handleStart}
          className="start-btn"
          style={{
            fontSize: '1.2rem',
            padding: '16px 40px'
          }}
        >
          Start Chatting
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.85rem',
          color: '#888'
        }}>
          You'll be connected with a random student
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
