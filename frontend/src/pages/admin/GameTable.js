import React from 'react';
import api from '../../services/api';
import { useMessage } from '../../components/Message';

const GameTable = ({ games, onEdit, onImageUpload, onDelete, onRowClick }) => {
    const { showMessage } = useMessage();

    const toggleGameStatus = async (game) => {
        try {
            await api.put(`/admin/games/${game.id}`, {
                ...game,
                isActive: !game.isActive
            });
            showMessage(`Game ${!game.isActive ? 'activated' : 'deactivated'}`, 'success');
            window.location.reload(); // Simple refresh
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    return (
        <div className="games-table-wrapper">
            <div className="games-table">
                <table>
                    <thead>
                        <tr>
                            <th>Game ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Difficulty</th>
                            <th>Plays</th>
                            <th>Status</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map(game => (
                            <tr key={game.id} onClick={() => onRowClick && onRowClick(game)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                                <td>{game.gameId}</td>
                                <td>{game.name}</td>
                                <td><span className={`category-badge ${game.category}`}>{game.category}</span></td>
                                <td><span className={`difficulty ${game.difficulty}`}>{game.difficulty}</span></td>
                                <td>{game.playCount?.toLocaleString() || 0}</td>
                                <td>
                                    <button 
                                        className={`status-toggle ${game.isActive ? 'active' : 'inactive'}`}
                                        onClick={(e) => { e.stopPropagation(); toggleGameStatus(game); }}
                                    >
                                        {game.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <button 
                                        className="btn-image"
                                        onClick={(e) => { e.stopPropagation(); onImageUpload(game); }}
                                    >
                                        🖼️ {game.hasBanner ? '✓' : '✗'}
                                    </button>
                                </td>
                                <td className="actions">
                                    <button className="btn-edit" onClick={(e) => { e.stopPropagation(); onEdit(game); }}>Edit</button>
                                    <button className="btn-delete" onClick={(e) => { e.stopPropagation(); onDelete(game.id); }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GameTable;