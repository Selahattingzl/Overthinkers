// Mock API servisi
const mockData = {
  users: [
    { user_id: 1, name: 'Kullanıcı 1', avatar: '' },
    { user_id: 2, name: 'Kullanıcı 2', avatar: '' },
  ],
  catalog: [
    { content_id: 1, title: 'Film 1', type: 'movie', duration_min: 120, tags: 'aksiyon' },
    { content_id: 2, title: 'Dizi 1', type: 'series', duration_min: 45, tags: 'drama' },
    { content_id: 3, title: 'Maç 1', type: 'sports', duration_min: 90, tags: 'futbol' },
  ],
  rooms: [],
  candidates: [],
  votes: [],
  expenses: [],
};

export const mockApi = {
  // Oda oluştur
  createRoom: async (title, start_at, host_id) => {
    const room = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      start_at,
      host_id,
      invite_url: `http://tvplus.social/room/${Math.random().toString(36).substr(2, 9)}`,
    };
    mockData.rooms.push(room);
    return room;
  },

  // Odaya katıl
  joinRoom: async (roomId, userId) => {
    const room = mockData.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Oda bulunamadı');
    // Burada kullanıcıyı odaya ekleme mantığı olacak, şimdilik room'u döndürüyoruz
    return room;
  },

  // Aday içerikleri getir
  getCandidates: async (roomId) => {
    // Bu odadaki aday içerikleri döndür
    const roomCandidates = mockData.candidates.filter(c => c.room_id === roomId);
    const candidateIds = roomCandidates.map(c => c.content_id);
    return mockData.catalog.filter(content => candidateIds.includes(content.content_id));
  },

  // Oy ver
  vote: async (roomId, userId, contentId) => {
    // Önce bu kullanıcının bu odadaki eski oylarını sil
    mockData.votes = mockData.votes.filter(v => !(v.room_id === roomId && v.user_id === userId));
    // Yeni oyu ekle
    mockData.votes.push({ room_id: roomId, user_id: userId, content_id: contentId });
  },

  // Oylama özeti getir
  getVoteSummary: async (roomId) => {
    const roomVotes = mockData.votes.filter(v => v.room_id === roomId);
    const votesCount = {};
    roomVotes.forEach(vote => {
      votesCount[vote.content_id] = (votesCount[vote.content_id] || 0) + 1;
    });

    // En çok oyu alan içerik
    let selectedContentId = null;
    let maxVotes = 0;
    Object.entries(votesCount).forEach(([contentId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        selectedContentId = contentId;
      }
    });

    const selectedContent = mockData.catalog.find(c => c.content_id == selectedContentId);

    return {
      selected_content: selectedContent,
      votes: votesCount,
      members: mockData.users, // Basitçe tüm kullanıcıları döndürdük
      start_at: mockData.rooms.find(r => r.id === roomId)?.start_at,
    };
  },

  // Masrafları getir
  getExpenses: async (roomId) => {
    return mockData.expenses.filter(e => e.room_id === roomId);
  },

  // Masraf ekle
  addExpense: async (roomId, userId, amount, note, weight) => {
    const expense = {
      expense_id: Math.random().toString(36).substr(2, 9),
      room_id: roomId,
      user_id: userId,
      amount,
      note,
      weight: weight || 1,
    };
    mockData.expenses.push(expense);
    return expense;
  },

  // Bakiyeleri getir
  getBalances: async (roomId) => {
    const expenses = mockData.expenses.filter(e => e.room_id === roomId);
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalWeight = expenses.reduce((sum, exp) => sum + (exp.weight || 1), 0);

    const userTotals = {};
    expenses.forEach(exp => {
      userTotals[exp.user_id] = (userTotals[exp.user_id] || 0) + exp.amount;
    });

    const perUser = Object.entries(userTotals).map(([user_id, totalPaid]) => {
      const userWeight = expenses
        .filter(exp => exp.user_id == user_id)
        .reduce((sum, exp) => sum + (exp.weight || 1), 0);
      const share = total * (userWeight / totalWeight);
      const balance = totalPaid - share;
      return { user_id, balance };
    });

    return { totals: { total, totalWeight }, perUser };
  },

  // Hatırlatma gönder (mock)
  sendReminder: async (roomId) => {
    console.log(`Mock reminder sent for room ${roomId}`);
    return { status: 'ok' };
  },
};
const BASE_URL = 'http://localhost:5000/api'; // Backend'in adresi

export const api = {
  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return await response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  // Diğer metodlar (put, delete, vs.) gerekirse ekle
};