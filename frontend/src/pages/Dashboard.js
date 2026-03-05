import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      // You can create an API endpoint to list available games
      // For now, using static data
      const availableGames = [
        { id: 'memory-game', name: 'Memory Game', icon: '🧠', description: 'Test your memory', path: '/games/memory-game' },
        { id: 'snake-game', name: 'Snake Game', icon: '🐍', description: 'Classic snake', path: '/games/snake-game' },
        { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '❌', description: 'Challenge a friend', path: '/games/tic-tac-toe' },
        { id: 'quiz-game', name: 'Quiz Game', icon: '❓', description: 'Test knowledge', path: '/games/quiz-game' },
      ];
      setGames(availableGames);
      setLoading(false);
    } catch (err) {
      setError('Failed to load games');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your games...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username || 'Player'}!</h1>
        <p>Ready to play? Choose a game below</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="games-section">
        <h2>Available Games</h2>
        <div className="games-grid">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <div className="game-icon-large">{game.icon}</div>
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <Link to={game.path} className="btn-play">
                Play Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h2>Your Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Games Played</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">High Scores</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Achievements</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;