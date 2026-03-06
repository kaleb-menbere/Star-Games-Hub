const express = require('express');
const router = express.Router();
const {
    getAllGamesAdmin,
    createGame,
    updateGame,
    getGameImages,
    deleteGameImage,
    deleteGame,
    uploadGameZip,
    uploadGameImages,
    getAdminLogs,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../controllers/admin.controller');

const { protect } = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require authentication and admin privileges
router.use(protect, adminAuth);

// Game management
router.get('/games', getAllGamesAdmin);
router.post('/games', createGame);
router.put('/games/:id', updateGame);
router.delete('/games/:id', deleteGame);

// Image management
router.get('/games/:gameId/images', getGameImages);
router.post('/games/:gameId/images', uploadGameImages);
router.delete('/games/:gameId/images/:imageName', deleteGameImage);

// ZIP upload
router.post('/games/upload/:gameId', uploadGameZip);

// Logs
router.get('/logs', getAdminLogs);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;