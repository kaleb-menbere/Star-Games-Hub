const express = require('express');
const router = express.Router();

const {
    getAllGames,
    getGame,
    getGameImageFromDB,
    getGamesByCategory,
    initializeGames,
    addGame,
    editGame,
    deleteGame,
    restoreGame,
} = require('../controllers/game.controller');

const auth = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth');

/* ===========================
   1️⃣ PUBLIC ROUTES
=========================== */

// Public image route
router.get('/image/:gameId/:imageType', getGameImageFromDB);


/* ===========================
   2️⃣ PROTECTED API ROUTES
=========================== */

router.get('/category/:category', auth.protect, getGamesByCategory);
router.get('/', auth.protect, getAllGames);
router.get('/:gameId', auth.protect, getGame);


/* ===========================
   4️⃣ ADMIN ROUTES
=========================== */

router.post('/init', auth.protect, adminAuth, initializeGames);
router.post('/', auth.protect, adminAuth, addGame);
router.put('/:gameId', auth.protect, adminAuth, editGame);
router.delete('/:gameId', auth.protect, adminAuth, deleteGame);
router.post('/:gameId/restore', auth.protect, adminAuth, restoreGame);

module.exports = router;