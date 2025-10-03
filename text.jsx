// App.js - Ana uygulama bileşeni
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
  const [user, setUser] = useState({ id: 1, name: 'Kullanıcı', avatar: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Senkronize');
  const [connectionQuality, setConnectionQuality] = useState(95); // Mock ping değeri
  const wsRef = useRef(null);

  // Oda oluşturma
  const createRoom = async (title, startAt) => {
    try {
      const room = await mockApi.createRoom(title, startAt, user.id);
      setCurrentRoom(room);
      
      // WebSocket bağlantısını kur
      wsRef.current = connectWebSocket(room.id, handleWebSocketMessage);
      setIsConnected(true);
      
      return room;
    } catch (error) {
      console.error('Oda oluşturma hatası:', error);
    }
  };

  // WebSocket mesaj işleyici
  const handleWebSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'play':
      case 'pause':
      case 'seek':
        // Video senkronizasyonu
        break;
      case 'chat':
        // Sohbet mesajı
        break;
      case 'emoji':
        // Emoji tepkisi
        break;
      case 'sync_ping':
        // Senkronizasyon ping'i
        break;
      default:
        console.log('Bilinmeyen mesaj tipi:', data.type);
    }
  };

  // Odaya katılma
  const joinRoom = async (roomId) => {
    try {
      const room = await mockApi.joinRoom(roomId, user.id);
      setCurrentRoom(room);
      
      // WebSocket bağlantısını kur
      wsRef.current = connectWebSocket(room.id, handleWebSocketMessage);
      setIsConnected(true);
      
      return room;
    } catch (error) {
      console.error('Odaya katılma hatası:', error);
    }
  };

  // Bileşen kaldırıldığında WebSocket bağlantısını kapat
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        disconnectWebSocket(wsRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      {!currentRoom ? (
        <div className="room-setup">
          <h1>TV+ Sosyal İzleme</h1>
          <div className="setup-options">
            <button 
              className="btn-primary"
              onClick={() => createRoom('Film Gecesi', new Date())}
            >
              Yeni Oda Oluştur
            </button>
            <div className="join-room">
              <input 
                type="text" 
                placeholder="Oda ID'si girin" 
                className="input-field"
              />
              <button 
                className="btn-secondary"
                onClick={() => joinRoom('mock-room-id')}
              >
                Odaya Katıl
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="room-container">
          <Header 
            room={currentRoom}
            user={user}
            connectionQuality={connectionQuality}
            syncStatus={syncStatus}
          />
          
          <div className="main-content">
            <div className="video-section">
              <VideoPlayer 
                room={currentRoom}
                user={user}
                isHost={user.id === currentRoom.host_id}
                wsConnection={wsRef.current}
              />
            </div>
            
            <div className="interaction-section">
              <Tabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={[
                  { id: 'voting', label: 'Oylama' },
                  { id: 'chat', label: 'Sohbet' },
                  { id: 'split', label: 'Masraf Paylaşımı' },
                  { id: 'poll', label: 'Anket' }
                ]}
              />
              
              <div className="tab-content">
                {activeTab === 'voting' && (
                  <VotingTab room={currentRoom} user={user} />
                )}
                {activeTab === 'chat' && (
                  <ChatTab room={currentRoom} user={user} />
                )}
                {activeTab === 'split' && (
                  <SplitTab room={currentRoom} user={user} />
                )}
                {activeTab === 'poll' && (
                  <PollTab room={currentRoom} user={user} />
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