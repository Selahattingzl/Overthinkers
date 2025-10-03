import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ room, user, isHost, wsConnection, syncStatus }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  // Kalan kodlar aynı...
  
  return (
    <div className="video-player">
      <div className="video-container">
        {/* Geri sayım göstergesi */}
        {timeLeft && timeLeft !== 'Başladı!' && (
          <div className="video-countdown">
            ⏱️ {timeLeft}
          </div>
        )}
        
        <div className="mock-video">
          <div className="video-placeholder">
            <div className="video-info">
              <h3>{room?.selected_content?.title || 'İçerik Seçilmedi'}</h3>
              {timeLeft && (
                <div className="countdown-info">
                  {timeLeft === 'Başladı!' ? '🎬 Watch Party Başladı!' : `⏳ ${timeLeft}`}
                </div>
              )}
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Kalan video kontrol kodları... */}
      </div>
    </div>
  );
};

// Zaman formatlama fonksiyonu
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default VideoPlayer;