// components/ChatTab.js - Sohbet bileşeni
import React, { useState, useEffect, useRef } from 'react';

const ChatTab = ({ room, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef(null);

  // Mock mesajlar
  useEffect(() => {
    setMessages([
      { id: 1, user_id: 1, message: 'Merhaba!', created_at: new Date() },
      { id: 2, user_id: 2, message: 'Herkese merhaba!', created_at: new Date() },
    ]);
  }, []);

  // Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mesaj gönderme
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Rate-limit kontrolü (2 saniye)
    const now = Date.now();
    if (now - lastMessageTime < 2000) {
      alert('Lütfen biraz yavaşlayın! Ardışık mesajlar arasında 2 saniye bekleyin.');
      return;
    }

    const message = {
      id: messages.length + 1,
      user_id: user.id,
      message: newMessage,
      created_at: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setLastMessageTime(now);
  };

  // Emoji gönderme
  const handleSendEmoji = (emoji) => {
    const now = Date.now();
    if (now - lastMessageTime < 2000) {
      alert('Lütfen biraz yavaşlayın! Ardışık mesajlar arasında 2 saniye bekleyin.');
      return;
    }

    const emojiMessage = {
      id: messages.length + 1,
      user_id: user.id,
      message: emoji,
      isEmoji: true,
      created_at: new Date()
    };

    setMessages([...messages, emojiMessage]);
    setLastMessageTime(now);
  };

  return (
    <div className="chat-tab">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-sender">
              {msg.user_id === user.id ? 'Siz' : `Kullanıcı ${msg.user_id}`}
            </div>
            <div className={`message-content ${msg.isEmoji ? 'emoji' : ''}`}>
              {msg.message}
            </div>
            <div className="message-time">
              {msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="emoji-bar">
        {['😂', '😍', '😮', '😢', '👏', '🔥'].map(emoji => (
          <button
            key={emoji}
            className="emoji-btn"
            onClick={() => handleSendEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Gönder</button>
      </div>
    </div>
  );
};

export default ChatTab;