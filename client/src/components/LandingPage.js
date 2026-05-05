import React, { useState } from 'react';

function LandingPage({ onProceed }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#17a2b8'
          }}>
            BuksuOne
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '1.1rem',
            color: '#555'
          }}>
            Talk to strangers from your campus!
          </p>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.95rem',
          color: '#444',
          lineHeight: '1.7',
          marginBottom: '24px'
        }}>
          BuksuOne is an anon chat platform here sa Buksu that connects you with other 
          people randomly. So kay introvert man ko, gahimo ko ani to gather new friends and 
          etc. Make friends online and meet them in person if you vibe! This is your chance to 
          talk to someone new from your campus without the pressure.
        </p>

        {/* How It Works */}
        <div style={{
          background: '#e8f4f8',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #b8e0e8'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#17a2b8'
          }}>
            How It Works:
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '0.9rem',
            color: '#444',
            lineHeight: '1.8'
          }}>
            <li>Enter your college and course/department</li>
            <li>Optionally add your interests for better matches</li>
            <li>Get randomly matched with another student</li>
            <li>Chat completely anonymously</li>
            <li>Skip and find a new match anytime</li>
          </ul>
        </div>

        {/* Safety Guidelines */}
        <div style={{
          background: '#fffbeb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #fcd34d'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#d97706'
          }}>
            Safety Guidelines:
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '0.9rem',
            color: '#444',
            lineHeight: '1.8'
          }}>
            <li>Never share personal information (name, address, phone number)</li>
            <li>Be respectful and kind to everyone</li>
            <li>Report any inappropriate behavior immediately</li>
            <li>You can disconnect from a chat at any time</li>
          </ul>
        </div>

        {/* Terms Checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          fontSize: '0.85rem',
          color: '#555',
          marginBottom: '20px',
          cursor: 'pointer',
          lineHeight: '1.5'
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ 
              marginRight: '10px',
              marginTop: '2px',
              cursor: 'pointer'
            }}
          />
          <span>
            I agree to the <a href="#" style={{ color: '#17a2b8' }}>Terms and Conditions</a> and{' '}
            <a href="#" style={{ color: '#17a2b8' }}>Privacy Policy</a>. I understand that all chats are 
            anonymous and I will not share personal information. I agree to be respectful and follow 
            community guidelines.
          </span>
        </label>

        {/* Proceed Button */}
        <button
          onClick={onProceed}
          disabled={!agreed}
          style={{
            width: '100%',
            padding: '14px',
            background: agreed ? '#17a2b8' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: agreed ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          Proceed to BuksuOne
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
