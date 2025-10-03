import React, { useState, useEffect } from 'react';

const Header = ({ room, user, connectionQuality, syncStatus, onLeaveRoom, onSendReminder }) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Geri sayım hesaplama
  useEffect(() => {
    if (!room || !room.start_at) return;

    const calculateTimeLeft = () => {
      const startTime = new Date(room.start_at).getTime();
      const now = new Date().getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      } else {
        setTimeLeft('Başladı!');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [room]);

  return (
    <div className="header">
      <div className="room-info">
        <h2>{room?.title || 'TV+ Sosyal İzleme'}</h2>
        <div className="room-details">
          <span>Başlama: {room?.start_at ? new Date(room.start_at).toLocaleString('tr-TR') : ''}</span>
          {timeLeft && (
            <span className="countdown">
              | Kalan Süre: <strong>{timeLeft}</strong>
            </span>
          )}
        </div>
      </div>
      <div className="connection-status">
        <div className="sync-status">{syncStatus}</div>
        <div className="quality-indicator">%{connectionQuality}</div>
        <div className="user-avatar">{user.name}</div>
        <button className="leave-btn" onClick={onLeaveRoom}>Çıkış</button>
      </div>
    </div>
  );
};

export default Header;