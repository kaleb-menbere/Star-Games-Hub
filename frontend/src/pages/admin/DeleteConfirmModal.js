import React, { useState } from 'react';
import api from '../../services/api';
import { useMessage } from '../../components/Message';

const DeleteConfirmModal = ({ deleteConfirm, deleteType, setDeleteType, onClose, onRefresh }) => {
    const [deleting, setDeleting] = useState(false);
    const { showMessage } = useMessage();

// In DeleteConfirmModal.js
const handleDelete = async () => {
    setDeleting(true);
    try {
        // console.log('Deleting game with ID:', deleteConfirm);
        // console.log('Delete type:', deleteType);
        
        const response = await api.delete(`/admin/games/${deleteConfirm}?permanent=${deleteType === 'permanent'}`);
        // console.log('Delete response:', response);
        
        showMessage(`Game ${deleteType === 'permanent' ? 'permanently deleted' : 'deactivated'}`, 'success');
        onRefresh();
        onClose();
    } catch (error) {
        // console.error('Full delete error:', error);
        // console.error('Error response:', error.response);
        // console.error('Error request:', error.request);
        
        if (error.code === 'ERR_NETWORK') {
            showMessage('Network error - cannot connect to server. Is the backend running?', 'error');
        } else {
            showMessage(error.response?.data?.message || error.message || 'Delete failed', 'error');
        }
    } finally {
        setDeleting(false);
    }
};

    return (
        <div className="modal-overlay">
            <div className="modal delete-modal">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this game?</p>
                
                <div className="delete-options">
                    <label>
                        <input
                            type="radio"
                            value="soft"
                            checked={deleteType === 'soft'}
                            onChange={() => setDeleteType('soft')}
                        />
                        Soft Delete (hide from users)
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="permanent"
                            checked={deleteType === 'permanent'}
                            onChange={() => setDeleteType('permanent')}
                        />
                        Permanent Delete (remove files)
                    </label>
                </div>

                <div className="modal-actions">
                    <button onClick={handleDelete} className="btn-delete" disabled={deleting}>
                        {deleting ? 'Deleting...' : `Yes, ${deleteType === 'permanent' ? 'Permanently Delete' : 'Deactivate'}`}
                    </button>
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;