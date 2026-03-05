import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredImages, setFeaturedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef(null);

  // Predefined set of game images to display
  const gameImageIds = [
    { id: 'game1', name: 'Flappy Bird' },
    { id: 'game2', name: 'Snake' },
    { id: 'game3', name: 'Tetris' },
    { id: 'game4', name: 'Pacman' },
  ];

  // Categories based on your Games.js
  const categoryConfig = [
    { id: 'adventure', name: 'Adventure', icon: '🏔️' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
    { id: 'action', name: 'Action', icon: '⚡' },
    { id: 'racing', name: 'Racing', icon: '🏎️' }
  ];

  useEffect(() => {
    fetchFeaturedImages();
  }, []);

  const fetchFeaturedImages = async () => {
    try {
      setLoading(true);
      
      // Instead of fetching game data, we'll just use the image URLs directly
      const imagesWithStatus = await Promise.all(
        gameImageIds.map(async (game) => {
          const bannerUrl = `${api.defaults.baseURL || 'http://localhost:5000/api'}/games/image/${game.id}/banner`;
          const logoUrl = `${api.defaults.baseURL || 'http://localhost:5000/api'}/games/image/${game.id}/logo`;
          
          // Check if banner exists (optional - you can remove this if it causes issues)
          try {
            await api.head(`/games/image/${game.id}/banner`);
            return {
              ...game,
              bannerUrl,
              logoUrl,
              hasImages: true
            };
          } catch {
            return {
              ...game,
              bannerUrl,
              logoUrl,
              hasImages: false
            };
          }
        })
      );

      // Filter to only those with images, or use all if none have images
      const gamesWithImages = imagesWithStatus.filter(g => g.hasImages);
      setFeaturedImages(gamesWithImages.length > 0 ? gamesWithImages : gameImageIds.map(g => ({
        ...g,
        bannerUrl: `${api.defaults.baseURL || 'http://localhost:5000/api'}/games/image/${g.id}/banner`,
        hasImages: false
      })));
      
    } catch (err) {
      // console.error('Failed to load featured images:', err);
      // Fallback: Use placeholder images
      setFeaturedImages(gameImageIds.map(game => ({
        ...game,
        bannerUrl: `https://via.placeholder.com/300x200/151e2f/6366f1?text=${game.name.replace(' ', '+')}`,
        hasImages: false
      })));
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId) => {
    if (user) {
      window.location.href = `http://localhost:5000/games/${gameId}`;
    } else {
      navigate('/games');
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="gv-landing">
      {/* Hero Section */}
      <section className="gv-hero">
        <div className="gv-hero-content">
          <h1>Welcome to Star Games Hub</h1>
          <p>Your ultimate gaming destination with 50+ exciting games. Play, compete, and conquer!</p>
          {!user ? (
            <div className="gv-hero-buttons">
              <Link to="/register" className="gv-btn gv-btn-primary">Start Playing Free</Link>
              <Link to="/login" className="gv-btn gv-btn-secondary">Sign In</Link>
            </div>
          ) : (
            <Link to="/games" className="gv-btn gv-btn-primary">Go to Games</Link>
          )}
        </div>
      </section>

      {/* Featured Games Section - Image Only Scrollable */}
      <section className="gv-featured-scroll">
        <div className="gv-container">
          <div className="gv-section-header">
            <h2 className="gv-section-title">🌟 Featured Games</h2>
            <Link to="/games" className="gv-view-link">View All →</Link>
          </div>
          
          {loading ? (
            <div className="gv-featured-loading">
              <div className="spinner"></div>
              <p>Loading amazing games...</p>
            </div>
          ) : (
            <div className="gv-scroll-wrapper">
              <button className="gv-scroll-btn gv-scroll-left" onClick={scrollLeft}>
                ←
              </button>
              
              <div className="gv-scroll-container" ref={scrollRef}>
                {featuredImages.map((game, index) => (
                  <div 
                    key={game.id || index} 
                    className="gv-scroll-item"
                    onClick={() => handlePlayGame(game.id)}
                  >
                    <div className="gv-scroll-image-wrapper">
                      <img 
                        src={game.bannerUrl}
                        alt={game.name}
                        className="gv-scroll-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/300x200/151e2f/6366f1?text=${game.name.replace(' ', '+')}`;
                        }}
                      />
                      <div className="gv-scroll-overlay">
                        <span className="gv-scroll-game-name">{game.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="gv-scroll-btn gv-scroll-right" onClick={scrollRight}>
                →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Game Categories */}
      <section className="gv-categories">
        <div className="gv-container">
          <h2 className="gv-section-title">🎮 Game Categories</h2>
          <p className="gv-section-subtitle">
            Explore our wide variety of game genres
          </p>
          
          <div className="gv-category-grid">
            {categoryConfig.map((category, index) => (
              <Link 
                to={`/games?category=${category.id}`} 
                key={index} 
                className="gv-category-item"
              >
                <div className="gv-category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>Play {category.name} Games</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gv-cta">
        <div className="gv-cta-content">
          <h2>Ready to Start Playing?</h2>
          <p>Join millions of players and experience the ultimate gaming adventure</p>
          {!user ? (
            <div className="gv-cta-buttons">
              <Link to="/register" className="gv-btn gv-btn-primary">Create Free Account</Link>
              <Link to="/games" className="gv-btn gv-btn-secondary">Browse Games</Link>
            </div>
          ) : (
            <Link to="/games" className="gv-btn gv-btn-primary">Go to Games</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;