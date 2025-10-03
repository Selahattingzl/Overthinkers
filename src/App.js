// App.js - TV+ Sosyal İzleme Ana Uygulama Bileşeni
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Bileşenler
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import Tabs from './components/Tabs';
import VotingTab from './components/VotingTab';
import ChatTab from './components/ChatTab';
import SplitTab from './components/SplitTab';
import PollTab from './components/PollTab';

// Servisler
import { mockApi } from './services/api';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('voting');
  const [user, setUser] = useState({ 
    id: 1, 
    name: 'Kullanıcı', 
    avatar: '',
    isHost: false
  });
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Senkronize');
  const [connectionQuality, setConnectionQuality] = useState(95);
  const [roomIdInput, setRoomIdInput] = useState('');
  const wsRef = useRef(null);

  // Kullanıcı bilgisini başlat
  useEffect(() => {
    const savedUser = localStorage.getItem('tvPlusUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const newUser = {
        id: Math.floor(Math.random() * 1000),
        name: `Kullanıcı${Math.floor(Math.random() * 1000)}`,
        avatar: '',
        isHost: false
      };
      setUser(newUser);
      localStorage.setItem('tvPlusUser', JSON.stringify(newUser));
    }
  }, []);

  // Oda oluşturma
  const createRoom = async (title, startAt) => {
    try {
      const room = await mockApi.createRoom(title, startAt, user.id);
      const roomWithHost = {
        ...room,
        host_id: user.id,
        selected_content: null,
        members: [user]
      };
      
      setCurrentRoom(roomWithHost);
      setUser(prev => ({ ...prev, isHost: true }));
      
      // WebSocket bağlantısını kur (mock)
      wsRef.current = connectWebSocket(room.id, handleWebSocketMessage);
      setIsConnected(true);
      
      console.log('Oda oluşturuldu:', roomWithHost);
      return roomWithHost;
    } catch (error) {
      console.error('Oda oluşturma hatası:', error);
      alert('Oda oluşturulurken bir hata oluştu!');
    }
  };

  // Odaya katılma
  const joinRoom = async (roomId) => {
    if (!roomId.trim()) {
      alert('Lütfen bir oda ID\'si girin!');
      return;
    }

    try {
      const room = await mockApi.joinRoom(roomId, user.id);
      const roomWithMembers = {
        ...room,
        members: [
          { id: 1, name: 'Host', avatar: '', isHost: true },
          user
        ]
      };
      
      setCurrentRoom(roomWithMembers);
      
      // WebSocket bağlantısını kur (mock)
      wsRef.current = connectWebSocket(room.id, handleWebSocketMessage);
      setIsConnected(true);
      
      console.log('Odaya katılındı:', roomWithMembers);
      return roomWithMembers;
    } catch (error) {
      console.error('Odaya katılma hatası:', error);
      alert('Odaya katılırken bir hata oluştu! Oda ID\'sini kontrol edin.');
    }
  };

  // WebSocket mesaj işleyici
  const handleWebSocketMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket mesajı:', data);
      
      switch (data.type) {
        case 'play':
          setSyncStatus('Oynatılıyor');
          break;
        case 'pause':
          setSyncStatus('Duraklatıldı');
          break;
        case 'seek':
          setSyncStatus('Konuma atlanıyor');
          setTimeout(() => setSyncStatus('Senkronize'), 1000);
          break;
        case 'chat':
          // Sohbet mesajı - ChatTab bileşeninde işlenecek
          break;
        case 'emoji':
          // Emoji tepkisi - ChatTab bileşeninde işlenecek
          break;
        case 'sync_ping':
          // Bağlantı kalitesini güncelle (mock)
          const newQuality = 80 + Math.floor(Math.random() * 20);
          setConnectionQuality(newQuality);
          break;
        case 'user_joined':
          // Yeni kullanıcı katıldı
          if (currentRoom && data.user) {
            const updatedMembers = [...currentRoom.members, data.user];
            setCurrentRoom(prev => ({
              ...prev,
              members: updatedMembers
            }));
          }
          break;
        default:
          console.log('Bilinmeyen mesaj tipi:', data.type);
      }
    } catch (error) {
      console.error('WebSocket mesaj işleme hatası:', error);
    }
  };

  // Odadan ayrılma
  const leaveRoom = () => {
    if (wsRef.current) {
      disconnectWebSocket(wsRef.current);
      wsRef.current = null;
    }
    
    setCurrentRoom(null);
    setUser(prev => ({ ...prev, isHost: false }));
    setIsConnected(false);
    setSyncStatus('Senkronize');
    setActiveTab('voting');
  };

  // İçerik seçimi tamamlandığında
  const handleContentSelected = (content) => {
    setCurrentRoom(prev => ({
      ...prev,
      selected_content: content
    }));
  };

  // Bileşen kaldırıldığında WebSocket bağlantısını kapat
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        disconnectWebSocket(wsRef.current);
      }
    };
  }, []);

  // Mock hatırlatma gönderme
  const sendReminder = () => {
    if (currentRoom && user.isHost) {
      alert(`Hatırlatma gönderildi! Oda: ${currentRoom.title}, Saat: ${new Date(currentRoom.start_at).toLocaleTimeString('tr-TR')}`);
    } else {
      alert('Sadece oda sahibi hatırlatma gönderebilir!');
    }
  };

  return (
    <div className="app">
      {!currentRoom ? (
        // Oda Kurulum Sayfası
        <div className="room-setup">
          <div className="setup-header">
            <h1>TV+ Sosyal İzleme</h1>
            <p>Arkadaşlarınızla aynı anda film, dizi ve maç keyfi!</p>
          </div>
          
          <div className="user-info">
            <div className="user-badge">
              <span>Kullanıcı: {user.name}</span>
              <span>ID: {user.id}</span>
            </div>
          </div>

          <div className="setup-options">
            <div className="create-room-section">
              <h3>Yeni Oda Oluştur</h3>
              <button 
                className="btn-primary"
                onClick={() => createRoom('Film Gecesi', new Date(Date.now() + 3600000))} // 1 saat sonra
              >
                🎬 Film Gecesi Başlat
              </button>
              <button 
                className="btn-primary"
                onClick={() => createRoom('Maç Keyfi', new Date(Date.now() + 1800000))} // 30 dakika sonra
              >
                ⚽ Maç İzleme Odası
              </button>
            </div>

            <div className="divider">
              <span>veya</span>
            </div>

            <div className="join-room-section">
              <h3>Mevcut Odaya Katıl</h3>
              <div className="join-room">
                <input 
                  type="text" 
                  placeholder="Oda ID'si girin" 
                  className="input-field"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom(roomIdInput)}
                />
                <button 
                  className="btn-secondary"
                  onClick={() => joinRoom(roomIdInput)}
                >
                  🔗 Odaya Katıl
                </button>
              </div>
              <p className="help-text">
                Oda ID'sini oda sahibinden alabilirsiniz
              </p>
            </div>
          </div>

          <div className="feature-list">
            <h3>Özellikler</h3>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🗳️</span>
                <span>İçerik Oylaması</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎭</span>
                <span>Senkron İzleme</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💬</span>
                <span>Gerçek Zamanlı Sohbet</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💰</span>
                <span>Masraf Paylaşımı</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⏰</span>
                <span>Otomatik Hatırlatma</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Oda İçi Arayüz
        <div className="room-container">
          <Header 
            room={currentRoom}
            user={user}
            connectionQuality={connectionQuality}
            syncStatus={syncStatus}
            onLeaveRoom={leaveRoom}
            onSendReminder={sendReminder}
          />
          
          <div className="main-content">
            <div className="video-section">
              <VideoPlayer 
                room={currentRoom}
                user={user}
                isHost={user.isHost}
                wsConnection={wsRef.current}
                syncStatus={syncStatus}
              />
              
              <div className="room-actions">
                <div className="invite-section">
                  <h4>Davet Linki</h4>
                  <div className="invite-link">
                    <code>{currentRoom.invite_url}</code>
                    <button 
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(currentRoom.invite_url);
                        alert('Link kopyalandı!');
                      }}
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div className="members-section">
                  <h4>Katılımcılar ({currentRoom.members?.length || 1})</h4>
                  <div className="members-list">
                    {currentRoom.members?.map(member => (
                      <div key={member.id} className="member-item">
                        <span className={`member-name ${member.isHost ? 'host' : ''}`}>
                          {member.name} {member.isHost && '👑'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="interaction-section">
              <Tabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={[
                  { id: 'voting', label: '🗳️ Oylama' },
                  { id: 'chat', label: '💬 Sohbet' },
                  { id: 'split', label: '💰 Masraf' },
                  { id: 'poll', label: '📊 Anket' }
                ]}
              />
              
              <div className="tab-content">
                {activeTab === 'voting' && (
                  <VotingTab 
                    room={currentRoom} 
                    user={user}
                    onContentSelected={handleContentSelected}
                  />
                )}
                {activeTab === 'chat' && (
                  <ChatTab 
                    room={currentRoom} 
                    user={user}
                    wsConnection={wsRef.current}
                  />
                )}
                {activeTab === 'split' && (
                  <SplitTab 
                    room={currentRoom} 
                    user={user}
                  />
                )}
                {activeTab === 'poll' && (
                  <PollTab 
                    room={currentRoom} 
                    user={user}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;