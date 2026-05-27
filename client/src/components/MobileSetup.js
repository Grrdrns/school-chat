import React, { useState } from 'react';

function MobileSetup({ onLogin, status }) {
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [interestTags, setInterestTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [matchSimilar, setMatchSimilar] = useState(false);

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
    // Generate random anonymous name
    const anonymousNames = ['Stranger', 'Student', 'Anonymous', 'User'];
    const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + Math.floor(Math.random() * 1000);
    
    onLogin({
      nickname: randomName,
      course: course.trim() || 'general',
      college: college.trim() || 'buksu',
      interests: interestTags.join(','),
      matchSimilar: matchSimilar
    });
  };

  const isWaiting = status === 'waiting';

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
        padding: '16px 20px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>BukChat</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Talk to strangers!</p>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* About */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
            Connect with random students. Chat anonymously and make new connections!
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
            Start a chat
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '6px' }}>
              College
            </label>
            <input
              type="text"
              placeholder="Enter college name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              disabled={isWaiting}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                background: isWaiting ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '6px' }}>
              Course/Department
            </label>
            <input
              type="text"
              placeholder="e.g., IT, EMC"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={isWaiting}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                background: isWaiting ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '6px' }}>
              What do you wanna talk about?
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '10px',
              background: isWaiting ? '#f5f5f5' : 'white',
              minHeight: '50px',
              alignItems: 'center'
            }}>
              {interestTags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: '#17a2b8',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isWaiting}
                    style={{
                      background: 'rgba(255,255,255,0.3)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
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
                disabled={isWaiting}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  background: 'transparent',
                  padding: '6px'
                }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#999', margin: '6px 0 0 0' }}>
              Press Enter, comma, or space to add
            </p>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '20px',
            cursor: isWaiting ? 'default' : 'pointer'
          }}>
            <input
              type="checkbox"
              checked={matchSimilar}
              onChange={(e) => setMatchSimilar(e.target.checked)}
              disabled={isWaiting}
              style={{ 
                marginRight: '10px',
                width: '20px',
                height: '20px'
              }}
            />
            Find strangers with common interests
          </label>

          {isWaiting ? (
            <div style={{
              padding: '16px',
              background: '#fff3e0',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '0.95rem',
              color: '#e65100'
            }}>
              Searching for match...
            </div>
          ) : (
            <button 
              onClick={handleStart}
              style={{
                width: '100%',
                padding: '16px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Start Chat
            </button>
          )}
        </div>

        {/* Safety Tips */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600, color: '#333' }}>
            Safety Tips
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#666', lineHeight: '1.6' }}>
            <li>Don't share personal information</li>
            <li>Be respectful to others</li>
            <li>Report inappropriate behavior</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MobileSetup;
