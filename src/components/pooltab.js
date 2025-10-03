import React from 'react';

const PollTab = ({ room, user }) => {
  return (
    <div className="poll-tab">
      <h3>Mini Anket</h3>
      <div className="poll-question">Altyazı mı dublaj mı tercih edersiniz?</div>
      <div className="poll-options">
        <button>Altyazı</button>
        <button>Dublaj</button>
      </div>
    </div>
  );
};

export default PollTab;