import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../components/Message';
import Sidebar from './admin/Sidebar';
import GamesTab from './admin/GamesTab';
// removed UploadTab and ImagesTab per new UI
import LogsTab from './admin/LogsTab';
import GameModal from './admin/GameModal';
import ImageUploadModal from './admin/ImageUploadModal';
import UsersTab from './admin/UsersTab';
import GameDetail from './admin/GameDetail';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showMessage } = useMessage();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('games');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageGame, setImageGame] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            showMessage('Access denied. Admin only.', 'error');
            navigate('/dashboard');
        }
        fetchGames();
    }, [user, navigate]);

    // clear selected game when not viewing detail
    useEffect(() => {
        if (view !== 'gameDetail') {
            setSelectedGame(null);
        }
    }, [view]);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/games');
            setGames(response.data.data || []);
        } catch (error) {
            // console.error('Fetch games error:', error);
            showMessage(error.response?.data?.message || 'Failed to fetch games', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (game) => {
        setImageGame(game);
        setShowImageModal(true);
    };

    const refreshGames = async () => {
        setRefreshing(true);
        await fetchGames();
        setRefreshing(false);
    };

    const tabs = {
        games: <GamesTab 
            games={games} 
            loading={loading || refreshing}
            onRefresh={refreshGames}
            onSelect={(game) => {
                setSelectedGame(game);
                setView('gameDetail');
            }}
            onEdit={(game) => {
                setSelectedGame(game);
                setShowAddModal(true);
            }}
            onImageUpload={handleImageUpload}
        />,
        users: <UsersTab />,
        logs: <LogsTab />,
        gameDetail: selectedGame ? (
            <GameDetail 
                game={selectedGame} 
                onBack={() => setView('games')}
                onRefresh={() => {
                    refreshGames();
                    setView('games');
                }}
            />
        ) : null
    };

    return (
        <div className="admin-dashboard">
            <Sidebar activeTab={view} onTabChange={setView} />
            
            <div className="admin-content">
                {tabs[view]}
            </div>

            {showAddModal && (
                <GameModal 
                    game={selectedGame}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedGame(null);
                    }}
                    onSave={() => {
                        refreshGames();
                        setShowAddModal(false);
                        setSelectedGame(null);
                        showMessage('Game saved successfully!', 'success');
                    }}
                />
            )}

            {showImageModal && imageGame && (
                <ImageUploadModal 
                    game={imageGame}
                    onClose={() => {
                        setShowImageModal(false);
                        setImageGame(null);
                    }}
                    onUploadComplete={() => {
                        refreshGames();
                        showMessage('Images uploaded successfully!', 'success');
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;