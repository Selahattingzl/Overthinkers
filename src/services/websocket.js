// Mock WebSocket servisi
export const connectWebSocket = (roomId, onMessage) => {
  // Gerçek uygulamada burada WebSocket bağlantısı kurulacak
  // Şimdilik mock bir nesne döndürüyoruz
  const mockWebSocket = {
    addEventListener: (event, callback) => {
      if (event === 'message') {
        // Mock mesajlar simüle et
        setTimeout(() => {
          callback({ data: JSON.stringify({ type: 'sync_ping', room_id: roomId }) });
        }, 1000);
      }
    },
    removeEventListener: (event, callback) => {
      // Mock: event listener kaldırma
    },
    send: (data) => {
      console.log('WebSocket send (mock):', data);
    },
    close: () => {
      console.log('WebSocket closed (mock)');
    },
  };

  return mockWebSocket;
};

export const disconnectWebSocket = (webSocket) => {
  if (webSocket) {
    webSocket.close();
  }
};