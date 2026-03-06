import React, { useState, useEffect } from 'react';
import gameService from '../services/game.service';
import './Games.css';

const Games = () => {
  const [games, setGames] = useState({
    adventure: [],
    puzzle: [],
    action: [],
    racing: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredGame, setHoveredGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gameService.getAllGames();
      
      if (response?.data?.games) {
        const processedGames = response.data.games.map(game => 
          gameService.formatGameForDisplay(game)
        );
        
        const grouped = {
          adventure: processedGames.filter(g => g.category === 'adventure'),
          puzzle: processedGames.filter(g => g.category === 'puzzle'),
          action: processedGames.filter(g => g.category === 'action'),
          racing: processedGames.filter(g => g.category === 'racing')
        };
        
        setGames(grouped);
      }
    } catch (err) {
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId) => {
    window.location.href = `https://games.startechnologies.et/games/${gameId}`;
  };

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮', count: Object.values(games).flat().length },
    { id: 'adventure', name: 'Adventure', icon: '🏔️', count: games.adventure?.length || 0 },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩', count: games.puzzle?.length || 0 },
    { id: 'action', name: 'Action', icon: '⚡', count: games.action?.length || 0 },
    { id: 'racing', name: 'Racing', icon: '🏎️', count: games.racing?.length || 0 }
  ];

  const getAllGames = () => [
    ...(games.adventure || []),
    ...(games.puzzle || []),
    ...(games.action || []),
    ...(games.racing || [])
  ];

  const getFilteredGames = () => {
    const allGames = getAllGames();
    if (!searchQuery.trim()) return allGames;
    
    return allGames.filter(game => 
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getDisplayGames = () => {
    const filtered = getFilteredGames();
    if (selectedCategory === 'all') return filtered;
    return filtered.filter(game => game.category === selectedCategory);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ecc94b';
      case 'hard': return '#f56565';
      default: return '#6366f1';
    }
  };

  const renderBanner = (game) => {
    const bannerUrl = game.bannerUrl || gameService.getGameImageUrl(game.gameId || game.id, 'banner');
    
    return (
      <div className="gvh-banner" style={{ backgroundColor: getDifficultyColor(game.difficulty) }}>
        <img
          src={bannerUrl}
          alt={game.name}
          className="gvh-banner-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          loading="lazy"
        />
        <div className="gvh-banner-fallback" style={{ display: 'none' }}>
          <span className="gvh-fallback-emoji">🎮</span>
          <span className="gvh-fallback-text">{game.name}</span>
        </div>
      </div>
    );
  };

  const renderLogo = (game) => {
    const logoUrl = game.logoUrl || gameService.getGameImageUrl(game.gameId || game.id, 'logo');
    
    return (
      <div className="gvh-logo-wrapper">
        <img
          src={logoUrl}
          alt={`${game.name} logo`}
          className="gvh-logo-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          loading="lazy"
        />
        <div className="gvh-logo-fallback" style={{ display: 'none', backgroundColor: getDifficultyColor(game.difficulty) }}>
          <span>{game.name.charAt(0)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="gvh-container">
        <div className="gvh-loading-grid">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="gvh-skeleton-card">
              <div className="gvh-skeleton-banner"></div>
              <div className="gvh-skeleton-content">
                <div className="gvh-skeleton-logo"></div>
                <div className="gvh-skeleton-text">
                  <div className="gvh-skeleton-title"></div>
                  <div className="gvh-skeleton-description"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayGames = getDisplayGames();

  return (
    <div className="gvh-container">
      <div className="gvh-header">
        <h1>🎮 Star Games Hub</h1>
        <p>Discover and play amazing games online</p>
        
        <div className="gvh-search-wrapper">
          <input
            type="text"
            placeholder="Search games by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gvh-search-input"
          />
          <span className="gvh-search-icon">🔍</span>
        </div>
      </div>

      {error && <div className="gvh-error">{error}</div>}

      <div className="gvh-categories">
        <h2>Categories</h2>
        <div className="gvh-category-grid">
          {categories.map(category => (
            <button
              key={category.id}
              className={`gvh-category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="gvh-category-icon">{category.icon}</span>
              <span className="gvh-category-name">{category.name}</span>
              <span className="gvh-category-count">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gvh-section-header">
        <h2>
          {selectedCategory === 'all' 
            ? 'All Games' 
            : `${categories.find(c => c.id === selectedCategory)?.name} Games`}
        </h2>
        <span className="gvh-game-count">
          {displayGames.length} {displayGames.length === 1 ? 'game' : 'games'} available
        </span>
      </div>

      {displayGames.length > 0 ? (
        <div className="gvh-grid">
          {displayGames.map(game => (
            <div 
              key={game.gameId || game.id} 
              className={`gvh-game-card ${hoveredGame === game.gameId ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredGame(game.gameId)}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <div className="gvh-banner-wrapper">
                {renderBanner(game)}
                
                <span
                  className="gvh-difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(game.difficulty) }}
                >
                  {game.difficulty || 'Medium'}
                </span>

                <span className="gvh-playcount-badge">
                  {game.playCount?.toLocaleString() || 0} plays
                </span>
              </div>

              <div className="gvh-game-info">
                {renderLogo(game)}
                <div className="gvh-game-details">
                  <h3 className="gvh-game-title">{game.name}</h3>
                  <p className="gvh-game-description">
                    {game.description?.substring(0, 80) || 'No description available'}...
                  </p>
                </div>
              </div>

              <div className="gvh-game-meta">
                <span className="gvh-category-tag">
                  {categories.find(c => c.id === game.category)?.icon} {game.category}
                </span>
              </div>

              <button 
                className="gvh-play-button"
                onClick={() => handlePlayGame(game.gameId)}
              >
                ▶ PLAY NOW
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="gvh-empty-state">
          <span className="gvh-empty-icon">🎮</span>
          <h3>No games found</h3>
          <p>
            {searchQuery 
              ? `No games match "${searchQuery}" in this category` 
              : 'No games available in this category'}
          </p>
          {searchQuery && (
            <button 
              className="gvh-clear-button"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Games;