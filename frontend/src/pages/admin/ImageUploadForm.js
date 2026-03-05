import React from 'react';

const ImageUploadForm = ({ images, setImages, onUpload, uploading }) => {
    const handleImageSelect = (type, files) => {
        if (type === 'screenshots') {
            // Replace screenshots array with up to 3 selected files
            setImages(prev => ({
                ...prev,
                screenshots: Array.from(files).slice(0, 3)
            }));
        } else {
            setImages(prev => ({ ...prev, [type]: files[0] }));
        }
    };

    return (
        <div className="upload-section">
            <h4>Upload New Images:</h4>
            
            <div className="form-group">
                <label>Banner Image (800x400 recommended):</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageSelect('banner', e.target.files)} />
            </div>

            <div className="form-group">
                <label>Logo Image (200x200 recommended):</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageSelect('logo', e.target.files)} />
            </div>

            <div className="form-group">
                <label>Screenshots (max 3):</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleImageSelect('screenshots', e.target.files)} />
            </div>

            <button 
                className="btn-upload"
                onClick={onUpload}
                disabled={uploading || (!images.banner && !images.logo && images.screenshots.length === 0)}
            >
                {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
        </div>
    );
};

export default ImageUploadForm;