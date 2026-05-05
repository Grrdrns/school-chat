import React from 'react';

function WaitingScreen({ userData }) {
  return (
    <div className="chat-container">
      <div className="waiting-screen">
        <div className="spinner"></div>
        <h3>Looking for someone to chat with...</h3>
        <p>Finding a match based on your course ({userData?.course}) and college ({userData?.college})</p>
      </div>
    </div>
  );
}

export default WaitingScreen;
