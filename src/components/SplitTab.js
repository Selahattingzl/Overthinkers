// components/SplitTab.js - Masraf paylaşımı bileşeni
import React, { useState, useEffect } from 'react';

const SplitTab = ({ room, user }) => {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [newExpense, setNewExpense] = useState({
    amount: '',
    note: '',
    weight: 1
  });

  // Mock veriler
  useEffect(() => {
    setExpenses([
      { id: 1, user_id: 1, amount: 150, note: 'Pizza', weight: 1 },
      { id: 2, user_id: 2, amount: 45, note: 'İçecekler', weight: 1 }
    ]);
    
    setBalances({
      1: 52.5,
      2: -52.5
    });
  }, []);

  // Yeni masraf ekleme
  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.note) return;

    const expense = {
      id: expenses.length + 1,
      user_id: user.id,
      amount: parseFloat(newExpense.amount),
      note: newExpense.note,
      weight: newExpense.weight || 1
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ amount: '', note: '', weight: 1 });
    
    // Bakiyeleri yeniden hesapla (basit mock hesaplama)
    recalculateBalances([...expenses, expense]);
  };

  // Bakiye hesaplama (mock)
  const recalculateBalances = (expensesList) => {
    // Basit bakiye hesaplama mantığı
    const total = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    const mockBalances = {
      1: total / 3,
      2: -total / 3
    };
    setBalances(mockBalances);
  };

  return (
    <div className="split-tab">
      <div className="expenses-section">
        <h3>Masraflar</h3>
        <div className="expenses-list">
          {expenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <div className="expense-note">{expense.note}</div>
                <div className="expense-amount">{expense.amount} TL</div>
              </div>
              <div className="expense-user">
                {expense.user_id === user.id ? 'Siz' : `Kullanıcı ${expense.user_id}`}
              </div>
            </div>
          ))}
        </div>
        
        <div className="add-expense">
          <h4>Yeni Masraf Ekle</h4>
          <input
            type="number"
            placeholder="Tutar (TL)"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
          />
          <input
            type="text"
            placeholder="Açıklama"
            value={newExpense.note}
            onChange={(e) => setNewExpense({...newExpense, note: e.target.value})}
          />
          <button onClick={handleAddExpense}>Ekle</button>
        </div>
      </div>
      
      <div className="balances-section">
        <h3>Bakiyeler</h3>
        <div className="balances-list">
          {Object.entries(balances).map(([userId, balance]) => (
            <div key={userId} className="balance-item">
              <span>{parseInt(userId) === user.id ? 'Siz' : `Kullanıcı ${userId}`}:</span>
              <span className={balance >= 0 ? 'positive' : 'negative'}>
                {balance >= 0 ? '+' : ''}{balance.toFixed(2)} TL
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplitTab;