import api from './api';

class GameService {
    // ===== PUBLIC METHODS (For all authenticated users) =====
    
    // Get all games
    async getAllGames() {
        try {
            const response = await api.get('/games');
            return response.data;
        } catch (error) {
            // console.error('Get all games error:', error);
            throw this.handleError(error);
        }
    }

    // Get single game
    async getGame(gameId) {
        try {
            const response = await api.get(`/games/${gameId}`);
            return response.data;
        } catch (error) {
            // console.error('Get game error:', error);
            throw this.handleError(error);
        }
    }

    // Get games by category
    async getGamesByCategory(category) {
        try {
            const response = await api.get(`/games/category/${category}`);
            return response.data;
        } catch (error) {
            // console.error('Get games by category error:', error);
            throw this.handleError(error);
        }
    }

    // Get game play URL with token
// In frontend/src/services/game.service.js
        getGamePlayUrl(gameId) {
            const token = localStorage.getItem('token');
            return `https://games.startechnologies.et/games/${gameId}?token=${token}`;
        }

    // Get game image URL - WITHOUT .jpg extension (as per your routes)
// Get game image URL - WITHOUT .jpg extension (as per your routes)
getGameImageUrl(gameId, imageType) {
    return `https://games.startechnologies.et/api/games/image/${gameId}/${imageType}`;
}

    // Get fallback image
    getFallbackImage(type = 'banner') {
        const fallbacks = {
            banner: 'https://via.placeholder.com/800x400?text=Game+Banner',
            logo: 'https://via.placeholder.com/200x200?text=🎮',
            screenshot: 'https://via.placeholder.com/400x300?text=Screenshot'
        };
        return fallbacks[type] || fallbacks.banner;
    }

    // Search games
    async searchGames(query) {
        try {
            const response = await api.get(`/games/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            // console.error('Search games error:', error);
            throw this.handleError(error);
        }
    }

    // ===== ADMIN METHODS (All prefixed with /admin) =====

    // Get all games for admin
    async getAdminGames() {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.get('/admin/games');
            return response.data;
        } catch (error) {
            // console.error('Get admin games error:', error);
            throw this.handleError(error);
        }
    }

    // Create new game
    async createGame(gameData) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.post('/admin/games', gameData);
            return response.data;
        } catch (error) {
            // console.error('Create game error:', error);
            throw this.handleError(error);
        }
    }

    // Update game
    async updateGame(gameId, gameData) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.put(`/admin/games/${gameId}`, gameData);
            return response.data;
        } catch (error) {
            // console.error('Update game error:', error);
            throw this.handleError(error);
        }
    }

    // Delete game
    async deleteGame(gameId, permanent = false) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.delete(`/admin/games/${gameId}?permanent=${permanent}`);
            return response.data;
        } catch (error) {
            // console.error('Delete game error:', error);
            throw this.handleError(error);
        }
    }

    // Upload game ZIP file
    async uploadGameZip(gameId, zipFile) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        const formData = new FormData();
        formData.append('zipFile', zipFile);

        try {
            const response = await api.post(`/admin/games/upload/${gameId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    // console.log(`Upload progress: ${percentCompleted}%`);
                }
            });
            return response.data;
        } catch (error) {
            // console.error('Upload game zip error:', error);
            throw this.handleError(error);
        }
    }

    // Upload game images (for BLOB storage)
    async uploadGameImages(gameId, formData) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.post(`/admin/games/${gameId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            // console.error('Upload images error:', error);
            throw this.handleError(error);
        }
    }

    // Get game images list
    async getGameImages(gameId) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.get(`/admin/games/${gameId}/images`);
            return response.data;
        } catch (error) {
            // console.error('Get game images error:', error);
            throw this.handleError(error);
        }
    }

    // Delete game image
    async deleteGameImage(gameId, imageType) {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.delete(`/admin/games/${gameId}/images/${imageType}`);
            return response.data;
        } catch (error) {
            // console.error('Delete image error:', error);
            throw this.handleError(error);
        }
    }

    // Get admin logs
    async getAdminLogs() {
        if (!this.isAdmin()) {
            throw { status: 403, message: 'Admin access required' };
        }

        try {
            const response = await api.get('/admin/logs');
            return response.data;
        } catch (error) {
            // console.error('Get admin logs error:', error);
            throw this.handleError(error);
        }
    }

    // ===== HELPER METHODS =====

    // Error handler
    handleError(error) {
        if (error.response) {
            return {
                status: error.response.status,
                message: error.response.data?.message || 'Server error',
                data: error.response.data
            };
        } else if (error.request) {
            return {
                status: 503,
                message: 'Network error - no response from server',
                data: null
            };
        } else {
            return {
                status: 500,
                message: error.message || 'Unknown error occurred',
                data: null
            };
        }
    }

    // Check if user is admin
    isAdmin() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            return payload.role === 'admin';
        } catch (error) {
            // console.error('Check admin error:', error);
            return false;
        }
    }

    // Get current user
    getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            return {
                id: payload.id,
                role: payload.role,
                exp: payload.exp
            };
        } catch (error) {
            // console.error('Get user error:', error);
            return null;
        }
    }

    // Get categories
    getCategories() {
        return [
            { id: 'adventure', name: 'Adventure', icon: '🏔️' },
            { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
            { id: 'action', name: 'Action', icon: '⚡' },
            { id: 'racing', name: 'Racing', icon: '🏎️' }
        ];
    }

    // Get difficulties
    getDifficulties() {
        return [
            { id: 'easy', name: 'Easy', color: '#48bb78' },
            { id: 'medium', name: 'Medium', color: '#ecc94b' },
            { id: 'hard', name: 'Hard', color: '#f56565' }
        ];
    }

    // Validate game data
    validateGameData(gameData) {
        const errors = [];

        if (!gameData.gameId) {
            errors.push('Game ID is required');
        } else if (!/^[a-z0-9-]+$/.test(gameData.gameId)) {
            errors.push('Game ID can only contain lowercase letters, numbers, and hyphens');
        }

        if (!gameData.name) {
            errors.push('Game name is required');
        }

        if (!gameData.category) {
            errors.push('Category is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

// Format game for display (for BLOB storage)
// Format game for display
formatGameForDisplay(game) {
    return {
        ...game,
        hasBanner: game.hasBanner || false,
        hasLogo: game.hasLogo || false,
        bannerUrl: this.getGameImageUrl(game.gameId, 'banner'),
        logoUrl: this.getGameImageUrl(game.gameId, 'logo'),
        screenshotUrls: game.screenshotUrls || [],
        playUrl: this.getGamePlayUrl(game.gameId)
    };
}

    // Format play count
    formatPlayCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }
}

export default new GameService();