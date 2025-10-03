import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/api';

const VotingTab = ({ room, user }) => {
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);

  // Aday içerikleri yükle
  useEffect(() => {
    const loadCandidates = async () => {
      if (room?.id) {
        const candidateList = await mockApi.getCandidates(room.id);
        setCandidates(candidateList);
      }
    };
    loadCandidates();
  }, [room]);

  // Oyları yükle
  useEffect(() => {
    const loadVotes = async () => {
      if (room?.id) {
        const voteSummary = await mockApi.getVoteSummary(room.id);
        setVotes(voteSummary.votes);
        setSelectedContent(voteSummary.selected_content);
      }
    };
    loadVotes();
  }, [room]);

  // Oy verme
  const handleVote = async (contentId) => {
    await mockApi.vote(room.id, user.id, contentId);
    // Oyları yeniden yükle
    const voteSummary = await mockApi.getVoteSummary(room.id);
    setVotes(voteSummary.votes);
    setSelectedContent(voteSummary.selected_content);
  };

  return (
    <div className="voting-tab">
      <h3>İçerik Oylaması</h3>
      {selectedContent && (
        <div className="selected-content">
          <h4>Seçilen İçerik: {selectedContent.title}</h4>
        </div>
      )}
      <div className="candidates-list">
        {candidates.map(content => (
          <div key={content.content_id} className="candidate-item">
            <div className="candidate-info">
              <div className="candidate-title">{content.title}</div>
              <div className="candidate-meta">
                {content.type} | {content.duration_min} dakika
              </div>
            </div>
            <div className="candidate-votes">
              <button 
                className="vote-btn"
                onClick={() => handleVote(content.content_id)}
              >
                Oy Ver
              </button>
              <div className="vote-count">
                {votes[content.content_id] || 0} oy
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingTab;