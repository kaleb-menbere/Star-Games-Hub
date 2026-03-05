import React, { useState } from 'react';
import api from '../../services/api';
import { useMessage } from '../../components/Message';

const ImageUploadModal = ({ game, onClose, onUploadComplete }) => {
    const [images, setImages] = useState({ banner: null, logo: null, screenshots: [] });
    const [uploading, setUploading] = useState(false);
    const { showMessage } = useMessage();

    const handleUpload = async () => {
        const formData = new FormData();
        if (images.banner) formData.append('banner', images.banner);
        if (images.logo) formData.append('logo', images.logo);
        
        images.screenshots.forEach((screenshot, index) => {
            if (index < 3) {
                formData.append(`screenshot${index + 1}`, screenshot);
            }
        });

        try {
            setUploading(true);
            await api.post(`/admin/games/${game.gameId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showMessage('Images uploaded successfully!', 'success');
            onUploadComplete();
            onClose();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Upload Images for {game.name}</h2>
                
                <div className="modal-content">
                    <div className="form-group">
                        <label>Banner Image:</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setImages({...images, banner: e.target.files[0]})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Logo Image:</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setImages({...images, logo: e.target.files[0]})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Screenshots (max 3):</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={(e) => setImages({...images, screenshots: Array.from(e.target.files)})}
                        />
                    </div>

                    <div className="modal-actions">
                        <button 
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Images'}
                        </button>
                        <button onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;