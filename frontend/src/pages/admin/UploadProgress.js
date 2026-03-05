import React from 'react';

const UploadProgress = ({ progress }) => {
    if (!progress.status) return null;

    return (
        <div className={`upload-progress ${progress.status}`}>
            {progress.status === 'uploading' && (
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percent}%` }}>
                        {progress.percent}%
                    </div>
                </div>
            )}
            {progress.status === 'success' && (
                <div className="success-message">✅ {progress.message}</div>
            )}
            {progress.status === 'error' && (
                <div className="error-message">❌ {progress.message}</div>
            )}
        </div>
    );
};

export default UploadProgress;