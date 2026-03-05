import React from 'react';
import api from '../../services/api';

const ImagePreview = ({ game, gameImages, onRemove }) => {
    const getImageUrl = (type) => {
        if (!gameImages[type]) return null;
        // use backend base URL directly; avoid relying on dev-server proxy for <img> tags
        const base = api.defaults.baseURL || '';
        // baseURL is like http://localhost:5000/api
        return `${base.replace(/\/$/, '')}/games/image/${game.gameId}/${type}`;
    };

    // helper for screenshots with index
    const renderScreenshot = (index) => {
        const key = `screenshot${index}`;
        const has = gameImages.screenshots && gameImages.screenshots[index - 1];
        return (
            <div className="image-preview" key={key}>
                <img
                    src={has ? getImageUrl(key) : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="12">No Screenshot</text></svg>'}
                    alt={`Screenshot ${index}`}
                    onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="12">No Screenshot</text></svg>'}
                />
                <span>Screenshot {index}</span>
                {has && (
                    <button className="remove-image" onClick={() => onRemove(key)}>✕</button>
                )}
            </div>
        );
    };

    return (
        <div className="current-images">
            <h4>Current Images:</h4>
            <div className="image-preview-grid">
                <div className="image-preview">
                    <img 
                        src={getImageUrl('banner') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="14">No Banner</text></svg>'} 
                        alt="Banner"
                        onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="14">No Banner</text></svg>'}
                    />
                    <span>Banner</span>
                    {gameImages.banner && (
                        <button className="remove-image" onClick={() => onRemove('banner')}>✕</button>
                    )}
                </div>
                <div className="image-preview">
                    <img 
                        src={getImageUrl('logo') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="12">No Logo</text></svg>'} 
                        alt="Logo"
                        onError={(e) => e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="Arial" font-size="12">No Logo</text></svg>'}
                    />
                    <span>Logo</span>
                    {gameImages.logo && (
                        <button className="remove-image" onClick={() => onRemove('logo')}>✕</button>
                    )}
                </div>
                {/* render three screenshot slots */}
                {renderScreenshot(1)}
                {renderScreenshot(2)}
                {renderScreenshot(3)}
            </div>
        </div>
    );
};

export default ImagePreview;