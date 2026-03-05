import React, { useState } from 'react';
import api from '../../services/api';
import { useMessage } from '../../components/Message';

const GameModal = ({ game, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        gameId: game?.gameId || '',
        name: game?.name || '',
        category: game?.category || 'adventure',
        description: game?.description || '',
        instructions: game?.instructions || '',
        difficulty: game?.difficulty || 'medium',
        isActive: game?.isActive !== undefined ? game.isActive : true
    });
    const [loading, setLoading] = useState(false);
    const { showMessage } = useMessage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (game) {
                // Update existing game
                await api.put(`/admin/games/${game.id}`, {
                    name: formData.name,
                    category: formData.category,
                    description: formData.description,
                    instructions: formData.instructions,
                    difficulty: formData.difficulty,
                    isActive: formData.isActive
                });
                showMessage('Game updated successfully!', 'success');
            } else {
                // Create new game
                await api.post('/admin/games', {
                    gameId: formData.gameId,
                    name: formData.name,
                    category: formData.category,
                    description: formData.description,
                    instructions: formData.instructions,
                    difficulty: formData.difficulty,
                    isActive: formData.isActive
                });
                showMessage('Game created successfully!', 'success');
            }
            onSave();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{game ? 'Edit Game' : 'Add New Game'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Game ID (folder name):</label>
                        <input
                            type="text"
                            value={formData.gameId}
                            onChange={(e) => setFormData({...formData, gameId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                            required
                            pattern="[a-z0-9-]+"
                            title="Use only lowercase letters, numbers, and hyphens"
                            disabled={!!game}
                            placeholder="e.g., my-awesome-game"
                        />
                        <small>This will be the folder name and URL</small>
                    </div>

                    <div className="form-group">
                        <label>Game Name:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="e.g., My Awesome Game"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category:</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                required
                            >
                                <option value="adventure">Adventure</option>
                                <option value="puzzle">Puzzle</option>
                                <option value="action">Action</option>
                                <option value="racing">Racing</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Difficulty:</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                required
                            >
                                <option value="easy">Easy 🌱</option>
                                <option value="medium">Medium ⭐</option>
                                <option value="hard">Hard 🔥</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows="4"
                            required
                            placeholder="Describe your game..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Instructions:</label>
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                            rows="3"
                            placeholder="How to play the game..."
                        />
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                            />
                            Active (visible to users)
                        </label>
                    </div>

                    {!game && (
                        <div className="info-box">
                            <p>📁 After creating the game, you can:</p>
                            <ul>
                                <li>Upload game files in the "Upload Game Files" tab</li>
                                <li>Add images in the "Manage Images" tab</li>
                                <li>The game will be available at: /games/{formData.gameId || 'game-id'}</li>
                            </ul>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="submit" disabled={loading} className="btn-save">
                            {loading ? 'Saving...' : (game ? 'Update Game' : 'Create Game')}
                        </button>
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GameModal;