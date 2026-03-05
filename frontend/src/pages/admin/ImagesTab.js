import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useMessage } from '../../components/Message';
import ImagePreview from './ImagePreview';
import ImageUploadForm from './ImageUploadForm';

const ImagesTab = ({ games, onRefresh }) => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [images, setImages] = useState({ banner: null, logo: null, screenshots: [] });
    const [uploading, setUploading] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [gameImages, setGameImages] = useState({ banner: false, logo: false, screenshots: [] });
    const { showMessage } = useMessage();

    useEffect(() => {
        if (selectedGame) fetchGameImages();
    }, [selectedGame]);

// Add this to handle case when game not found
const fetchGameImages = async () => {
    if (!selectedGame) return;
    
    try {
        setLoadingImages(true);
        const response = await api.get(`/admin/games/${selectedGame.gameId}/images`);
        setGameImages(response.data.data || { banner: false, logo: false, screenshots: [] });
    } catch (error) {
        console.error('Fetch images error:', error);
        if (error.response?.status === 404) {
            setGameImages({ banner: false, logo: false, screenshots: [] });
        }
        showMessage(error.response?.data?.message || 'Failed to load images', 'error');
    } finally {
        setLoadingImages(false);
    }
};

    const handleUpload = async () => {
        if (!selectedGame) return;

        const formData = new FormData();
        if (images.banner) formData.append('banner', images.banner);
        if (images.logo) formData.append('logo', images.logo);
        
        images.screenshots.forEach((screenshot, index) => {
            if (index < 3) formData.append(`screenshot${index + 1}`, screenshot);
        });

        try {
            setUploading(true);
            await api.post(`/admin/games/${selectedGame.gameId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showMessage('Images uploaded successfully!', 'success');
            setImages({ banner: null, logo: null, screenshots: [] });
            await fetchGameImages();
            if (onRefresh) onRefresh();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (imageType) => {
        try {
            // Map type to filename if needed
            // Map to backend expected filenames (backend expects banner.jpg, logo.jpg, screenshot1.jpg etc.)
            const map = {
                banner: 'banner.jpg',
                logo: 'logo.jpg',
                screenshot1: 'screenshot1.jpg',
                screenshot2: 'screenshot2.jpg',
                screenshot3: 'screenshot3.jpg'
            };
            const fileName = map[imageType] || imageType;
            await api.delete(`/admin/games/${selectedGame.gameId}/images/${fileName}`);
            showMessage('Image removed successfully', 'success');
            await fetchGameImages();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Failed to remove image', 'error');
        }
    };

    return (
        <div className="images-tab">
            <h2>Manage Game Images</h2>
            
            <div className="image-upload-form">
                <div className="form-group">
                    <label>Select Game:</label>
                    <select onChange={(e) => {
                        const game = games.find(g => g.gameId === e.target.value);
                        setSelectedGame(game);
                        setImages({ banner: null, logo: null, screenshots: [] });
                    }} value={selectedGame?.gameId || ''}>
                        <option value="">Choose a game</option>
                        {games.map(game => (
                            <option key={game.id} value={game.gameId}>{game.name}</option>
                        ))}
                    </select>
                </div>

                {selectedGame && (
                    <>
                        {loadingImages ? (
                            <div>Loading images...</div>
                        ) : (
                            <ImagePreview 
                                game={selectedGame}
                                gameImages={gameImages}
                                onRemove={handleRemoveImage}
                            />
                        )}
                        
                        <ImageUploadForm 
                            images={images}
                            setImages={setImages}
                            onUpload={handleUpload}
                            uploading={uploading}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ImagesTab;
