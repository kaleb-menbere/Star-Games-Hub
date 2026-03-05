import React, { useState } from 'react';
import GameTable from './GameTable';
import DeleteConfirmModal from './DeleteConfirmModal';

const GamesTab = ({ games, loading, onRefresh, onEdit, onImageUpload, onSelect }) => {
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteType, setDeleteType] = useState('soft');

    if (loading) return <div className="loading">Loading games...</div>;

    return (
        <div className="games-tab">
            <div className="tab-header">
                <h2>Games Management</h2>
                <button className="btn-add" onClick={() => onEdit(null)}>
                    + Add New Game
                </button>
            </div>

            {games.length === 0 ? (
                <div className="no-games">
                    <p>No games found. Click "Add New Game" to create one.</p>
                </div>
            ) : (
                <GameTable 
                    games={games}
                    onEdit={onEdit}
                    onImageUpload={onImageUpload}
                    onDelete={setDeleteConfirm}
                    onRowClick={onSelect}
                />
            )}

            {deleteConfirm && (
                <DeleteConfirmModal 
                    deleteConfirm={deleteConfirm}
                    deleteType={deleteType}
                    setDeleteType={setDeleteType}
                    onClose={() => setDeleteConfirm(null)}
                    onRefresh={onRefresh}
                />
            )}
        </div>
    );
};

export default GamesTab;