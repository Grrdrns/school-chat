import React, { useState } from 'react';

const COURSES = [
  { value: '', label: 'Select your course' },
  { value: 'BSIT', label: 'BS Information Technology (BSIT)' },
  { value: 'BSCS', label: 'BS Computer Science (BSCS)' },
  { value: 'BSCE', label: 'BS Civil Engineering (BSCE)' },
  { value: 'BSEE', label: 'BS Electrical Engineering (BSEE)' },
  { value: 'BSME', label: 'BS Mechanical Engineering (BSME)' },
  { value: 'BSBA', label: 'BS Business Administration (BSBA)' },
  { value: 'BSA', label: 'BS Accountancy (BSA)' },
  { value: 'BSN', label: 'BS Nursing (BSN)' },
  { value: 'BSED', label: 'Bachelor of Secondary Education (BSED)' },
  { value: 'BEED', label: 'Bachelor of Elementary Education (BEED)' },
  { value: 'BSPsych', label: 'BS Psychology (BSPsych)' },
  { value: 'BSPolSci', label: 'BS Political Science (BSPolSci)' },
  { value: 'BSBio', label: 'BS Biology (BSBio)' },
  { value: 'BSChem', label: 'BS Chemistry (BSChem)' },
  { value: 'BSMath', label: 'BS Mathematics (BSMath)' },
  { value: 'other', label: 'Other Course' }
];

const COLLEGES = [
  { value: '', label: 'Select your college' },
  { value: 'CIT', label: 'College of Information Technology' },
  { value: 'COE', label: 'College of Engineering' },
  { value: 'CBA', label: 'College of Business Administration' },
  { value: 'CON', label: 'College of Nursing' },
  { value: 'COED', label: 'College of Education' },
  { value: 'CAS', label: 'College of Arts and Sciences' },
  { value: 'other', label: 'Other College' }
];

function LoginScreen({ onLogin }) {
  const [nickname, setNickname] = useState('');
  const [course, setCourse] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    
    if (!course) {
      setError('Please select your course');
      return;
    }
    
    if (!college) {
      setError('Please select your college');
      return;
    }

    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters');
      return;
    }

    onLogin({
      nickname: nickname.trim(),
      course,
      college
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <h1>📚 School Chat</h1>
          <p>Connect with fellow students anonymously</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nickname">Nickname</label>
            <input
              type="text"
              id="nickname"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="college">College</label>
            <select
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            >
              {COLLEGES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="course">Course</label>
            <select
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              {COURSES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{
              color: '#ff4757',
              fontSize: '0.9rem',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="start-btn">
            Start Chatting
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.85rem',
          color: '#888'
        }}>
          You'll be matched with students from your college or similar courses!
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
