import React, { useState, useEffect } from 'react';
import { useMessage } from '../../components/Message';
import api from '../../services/api';
import ImagePreview from './ImagePreview';
import ImageUploadForm from './ImageUploadForm';
import GameModal from './GameModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const GameDetail = ({ game, onBack, onRefresh }) => {
    const [gameImages, setGameImages] = useState({ banner: false, logo: false, screenshots: [] });
    const [loadingImages, setLoadingImages] = useState(false);
    const [images, setImages] = useState({ banner: null, logo: null, screenshots: [] });
    const [uploading, setUploading] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [zipFile, setZipFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteType, setDeleteType] = useState('soft');
    const { showMessage } = useMessage();

    useEffect(() => {
        fetchImages();
    }, [game]);

    const fetchImages = async () => {
        if (!game) return;
        try {
            setLoadingImages(true);
            const res = await api.get(`/admin/games/${game.gameId}/images`);
            setGameImages(res.data.data);
        } catch (err) {
            // console.error(err);
            showMessage('Could not load images', 'error');
        } finally {
            setLoadingImages(false);
        }
    };

    const handleImageUpload = async () => {
        if (!game) return;
        const formData = new FormData();
        if (images.banner) formData.append('banner', images.banner);
        if (images.logo) formData.append('logo', images.logo);
        images.screenshots.forEach((s,i) => {
            if (i < 3) formData.append(`screenshot${i+1}`, s);
        });
        try {
            setUploading(true);
            await api.post(`/admin/games/${game.gameId}/images`, formData, {
                headers:{'Content-Type':'multipart/form-data'}
            });
            showMessage('Images uploaded', 'success');
            setImages({ banner:null, logo:null, screenshots:[] });
            fetchImages();
            if(onRefresh) onRefresh();
        } catch (err) {
            showMessage(err.response?.data?.message||'Upload failed','error');
        } finally { setUploading(false); }
    };

    const handleZipUpload = async () => {
        if (!game || !zipFile) return;
        const fdata = new FormData();
        fdata.append('zipFile', zipFile);
        try {
            await api.post(`/admin/games/upload/${game.gameId}`, fdata, {
                headers:{'Content-Type':'multipart/form-data'}
            });
            showMessage('Zip uploaded', 'success');
            setZipFile(null);
        } catch(err) {
            showMessage(err.response?.data?.message||'Zip upload failed','error');
        }
    };

    const handleRemoveImage = async (imageType) => {
        try {
            const map = {banner:'banner.jpg',logo:'logo.jpg',screenshot1:'screenshot1.jpg',screenshot2:'screenshot2.jpg',screenshot3:'screenshot3.jpg'};
            await api.delete(`/admin/games/${game.gameId}/images/${map[imageType]}`);
            showMessage('Deleted', 'success');
            fetchImages();
        } catch(err){showMessage('Delete failed','error');}
    };

    return (
        <div className="game-detail">
            <button onClick={onBack} className="btn-delete">← Back to list</button>
            <h2>{game.name}</h2>
            <p><strong>ID:</strong> {game.gameId}</p>
            <p><strong>Category:</strong> {game.category}</p>
            <button className="btn-edit" onClick={() => setShowEdit(true)}>Edit details</button>
            <button className="btn-delete" onClick={() => setDeleteConfirm(game.id)} style={{ marginLeft: '10px' }}>Delete Game</button>
            <hr />
            <h3>Images</h3>
            {loadingImages ? <p>Loading...</p> : (
                <ImagePreview game={game} gameImages={gameImages} onRemove={handleRemoveImage} />
            )}
            <ImageUploadForm images={images} setImages={setImages} onUpload={handleImageUpload} uploading={uploading} />
            <hr />
            <h3>Upload Game ZIP</h3>
            <input type="file" accept=".zip" onChange={e=>setZipFile(e.target.files[0])} />
            <button className="btn-upload" onClick={handleZipUpload} disabled={!zipFile}>Upload ZIP</button>
            {showEdit && (
                <GameModal 
                    game={game}
                    onClose={() => setShowEdit(false)}
                    onSave={() => {
                        setShowEdit(false);
                        fetchImages();
                        if(onRefresh) onRefresh();
                        showMessage('Game saved','success');
                    }}
                />
            )}
            {deleteConfirm && (
                <DeleteConfirmModal 
                    deleteConfirm={deleteConfirm}
                    deleteType={deleteType}
                    setDeleteType={setDeleteType}
                    onClose={() => setDeleteConfirm(null)}
                    onRefresh={() => {
                        if(onRefresh) onRefresh();
                        onBack(); // go back to list after delete
                    }}
                />
            )}
        </div>
    );
};

export default GameDetail;