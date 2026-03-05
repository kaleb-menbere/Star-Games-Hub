const Game = require('../models/Game');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../services/logger.service');
const jwt = require('jsonwebtoken'); // Add this for token verification
const env = require('../config/environment');

// ============================================
// PUBLIC/USER ROUTES (require authentication)
// ============================================

// @desc    Get all games
// @route   GET /api/games
// @access  Private (Any authenticated user)
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.findAll({
            where: { isActive: true },
            order: [
                ['category', 'ASC'],
                ['sortOrder', 'ASC'],
                ['name', 'ASC']
            ]
        });

        // Add full image URLs for frontend (using image types, not .jpg)
        const gamesWithUrls = games.map(game => ({
            id: game.id,
            gameId: game.gameId,
            name: game.name,
            category: game.category,
            description: game.description,
            instructions: game.instructions,
            difficulty: game.difficulty,
            playCount: game.playCount,
            rating: game.rating,
            sortOrder: game.sortOrder,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            isActive: game.isActive,
            // Use image types instead of .jpg files
            bannerUrl: game.bannerImage ? `/api/games/image/${game.gameId}/banner` : null,
            logoUrl: game.logoImage ? `/api/games/image/${game.gameId}/logo` : null,
            screenshotUrls: [
                game.screenshot1 ? `/api/games/image/${game.gameId}/screenshot1` : null,
                game.screenshot2 ? `/api/games/image/${game.gameId}/screenshot2` : null,
                game.screenshot3 ? `/api/games/image/${game.gameId}/screenshot3` : null
            ].filter(url => url !== null),
            playUrl: `/games/${game.gameId}`,
            // Check if images exist (based on BLOB data)
            hasBanner: !!game.bannerImage,
            hasLogo: !!game.logoImage,
            hasScreenshots: !!(game.screenshot1 || game.screenshot2 || game.screenshot3)
        }));

        // Group by category for easier frontend display
        const groupedGames = {
            adventure: gamesWithUrls.filter(g => g.category === 'adventure'),
            puzzle: gamesWithUrls.filter(g => g.category === 'puzzle'),
            action: gamesWithUrls.filter(g => g.category === 'action'),
            racing: gamesWithUrls.filter(g => g.category === 'racing')
        };

        res.json({
            success: true,
            data: {
                games: gamesWithUrls,
                grouped: groupedGames,
                total: games.length
            }
        });

    } catch (error) {
        logger.error('Get all games error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch games',
            error: error.message
        });
    }
};

// @desc    Get single game
// @route   GET /api/games/:gameId
// @access  Private (Any authenticated user)
exports.getGame = async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findOne({
            where: { gameId, isActive: true }
        });

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Increment play count
        game.playCount += 1;
        await game.save();

        // Prepare game data for user
        const gameData = {
            id: game.id,
            gameId: game.gameId,
            name: game.name,
            category: game.category,
            description: game.description,
            instructions: game.instructions,
            difficulty: game.difficulty,
            playCount: game.playCount,
            rating: game.rating,
            sortOrder: game.sortOrder,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            // Add URLs for frontend (using image types)
            bannerUrl: game.bannerImage ? `/api/games/image/${game.gameId}/banner` : null,
            logoUrl: game.logoImage ? `/api/games/image/${game.gameId}/logo` : null,
            screenshotUrls: [
                game.screenshot1 ? `/api/games/image/${game.gameId}/screenshot1` : null,
                game.screenshot2 ? `/api/games/image/${game.gameId}/screenshot2` : null,
                game.screenshot3 ? `/api/games/image/${game.gameId}/screenshot3` : null
            ].filter(url => url !== null),
            playUrl: `/games/${game.gameId}`,
            // Image metadata
            hasBanner: !!game.bannerImage,
            hasLogo: !!game.logoImage,
            bannerMimeType: game.bannerMimeType,
            logoMimeType: game.logoMimeType,
            screenshotMimeType: game.screenshotMimeType
        };

        res.json({
            success: true,
            data: gameData
        });

    } catch (error) {
        logger.error('Get game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch game',
            error: error.message
        });
    }
};

// @desc    Get games by category
// @route   GET /api/games/category/:category
// @access  Private (Any authenticated user)
exports.getGamesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['adventure', 'puzzle', 'action', 'racing'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const games = await Game.findAll({
            where: { category, isActive: true },
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });

        const gamesWithUrls = games.map(game => ({
            id: game.id,
            gameId: game.gameId,
            name: game.name,
            category: game.category,
            description: game.description,
            difficulty: game.difficulty,
            playCount: game.playCount,
            rating: game.rating,
            bannerUrl: game.bannerImage ? `/api/games/image/${game.gameId}/banner` : null,
            logoUrl: game.logoImage ? `/api/games/image/${game.gameId}/logo` : null,
            playUrl: `/games/${game.gameId}`
        }));

        res.json({
            success: true,
            data: {
                category,
                games: gamesWithUrls,
                total: games.length
            }
        });

    } catch (error) {
        logger.error('Get games by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch games',
            error: error.message
        });
    }
};

// @desc    Get game image from database (BLOB)
// @route   GET /api/games/image/:gameId/:imageType
// @access  Public
// @desc    Get game image from database (BLOB)
// @route   GET /api/games/image/:gameId/:imageType
// @access  Public
exports.getGameImageFromDB = async (req, res) => {
    try {
        const { gameId, imageType } = req.params;
        
        // Validate image type
        const validTypes = ['banner', 'logo', 'screenshot1', 'screenshot2', 'screenshot3'];
        if (!validTypes.includes(imageType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image type'
            });
        }

        // Find game
        const game = await Game.findOne({ where: { gameId } });
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Get image data and mime type
        let imageData, mimeType;
        
        if (imageType === 'banner') {
            imageData = game.bannerImage;
            mimeType = game.bannerMimeType || 'image/jpeg';
        } else if (imageType === 'logo') {
            imageData = game.logoImage;
            mimeType = game.logoMimeType || 'image/jpeg';
        } else {
            imageData = game[imageType];
            mimeType = game.screenshotMimeType || 'image/jpeg';
        }

        if (!imageData) {
            // Return a same-origin SVG placeholder (avoid cross-origin redirects)
            const dimensions = imageType === 'logo' ? { w: 200, h: 200 } : { w: 800, h: 400 };
            const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.w}" height="${dimensions.h}" viewBox="0 0 ${dimensions.w} ${dimensions.h}">\n  <rect width="100%" height="100%" fill="#e2e8f0" />\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-size="24">No Image</text>\n</svg>`;

            const svgBuffer = Buffer.from(svg, 'utf8');
            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Content-Length', svgBuffer.length);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(svgBuffer);
        }

        // The data might be in buffer or already converted
        let imageBuffer;
        if (Buffer.isBuffer(imageData)) {
            imageBuffer = imageData;
        } else if (typeof imageData === 'string') {
            // Check if it's base64
            if (imageData.startsWith('data:')) {
                // data:image/jpeg;base64,/9j/4AAQ...
                const base64Data = imageData.split(',')[1];
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else {
                // Assume raw base64
                imageBuffer = Buffer.from(imageData, 'base64');
            }
        } else {
            imageBuffer = imageData;
        }

        // Set proper headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', imageBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Content-Disposition', 'inline');
        
        // Send the image
        res.send(imageBuffer);

    } catch (error) {
        logger.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get image',
            error: error.message
        });
    }
};

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// @desc    Initialize games from folder structure
// @route   POST /api/games/init
// @access  Private/Admin
exports.initializeGames = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    try {
        const gamesPath = path.join(__dirname, '../../games');
        const folders = await fs.readdir(gamesPath);
        
        // Define game details for each folder based on your descriptions
        const gameDetails = {
            'game1': {
                name: 'Apple & Onion – Cat Rescue',
                category: 'adventure',
                description: 'Apple and Onion: Cat Rescue is a Cartoon Network game based on the animated series, where players control either Apple or Onion to help a cat named Sooty cross a busy highway. The gameplay is "frogger-style," requiring players to jump on cars, avoid road hazards, and safely guide the cat to the other side.',
                difficulty: 'medium',
                instructions: 'Jump on cars to cross the highway. Avoid road hazards. Help Sooty the cat reach the other side safely!'
            },
            'game2': {
                name: 'Avengers Hydra Dash',
                category: 'action',
                description: 'Play as various Marvel superheroes—including Captain America, Iron Man, Thor, Hulk, Black Widow, Black Panther, Falcon, and Hawkeye—teaming up to combat a new threat from a HYDRA project.',
                difficulty: 'hard',
                instructions: 'Choose your hero and dash through levels. Defeat HYDRA enemies and save the day!'
            },
            'game3': {
                name: 'Bat Attitude',
                category: 'action',
                description: 'Pure Heart Valley is under attack and only the cutest hero has the guts to save it! Step into the wings of Adorabat, the five-year-old deputy with a heart of gold and a thirst for chaos. In this fast-paced action-platformer, you are the frontline defense against the Sky Pirates.',
                difficulty: 'medium',
                instructions: 'Use platforming skills to defeat Sky Pirates. Jump, attack, and save Pure Heart Valley!'
            },
            'game4': {
                name: 'Bumblebee Robot Rescue',
                category: 'action',
                description: 'Bumblebee Robot Rescue is a fast-paced microgame. It challenges players to use Bumblebee\'s unique shrinking and flight abilities to neutralize mechanical threats.',
                difficulty: 'easy',
                instructions: 'Use Bumblebee\'s shrinking and flight abilities. Neutralize mechanical threats and rescue robots!'
            },
            'game5': {
                name: 'Bunnicula and the Cursed Diamond',
                category: 'adventure',
                description: 'Players control the vampire bunny or other characters to navigate through spooky environments, avoiding traps, and solving puzzles to break the curse of a magical gem.',
                difficulty: 'medium',
                instructions: 'Navigate spooky environments. Avoid traps and solve puzzles. Break the curse of the magical diamond!'
            },
            'game6': {
                name: 'Car Rush',
                category: 'racing',
                description: 'A fast-paced, often 3D, racing game where players navigate vehicles through traffic-filled tracks, aiming to avoid obstacles and complete laps before time runs out.',
                difficulty: 'medium',
                instructions: 'Race through traffic-filled tracks. Avoid obstacles and complete laps before time runs out!'
            },
            'game7': {
                name: 'Incredible Hulk – Chitauri Takedown',
                category: 'action',
                description: 'An action-oriented mobile or browser-based game where players control the Hulk to smash through waves of Chitauri invaders. As the last Avenger standing, the goal is to launch the Hulk into the air and utilize his immense strength to destroy enemy forces and protect the city.',
                difficulty: 'hard',
                instructions: 'Smash through waves of Chitauri invaders. Launch Hulk into the air to destroy enemies. Protect the city!'
            },
            'game8': {
                name: 'Max Steel – Turbo 360',
                category: 'action',
                description: 'An action-oriented browser game where players control Max Steel fighting waves of Monstro\'s minions. The gameplay focuses on surviving attacks by using three distinct, rechargeable weapons: the Turbo Blaster, Turbo Sword, and Turbo Fists against enemies that either attack close-range or launch energy spheres from a distance.',
                difficulty: 'hard',
                instructions: 'Use Turbo Blaster, Sword, and Fists to defeat enemies. Survive waves of Monstro\'s minions!'
            },
            'game9': {
                name: 'Sandwich Tower – Be Cool Scooby-Doo',
                category: 'puzzle',
                description: 'Dexterity-based stacking game for 1+ players where players build a giant BLT sandwich for Shaggy and Scooby. It features 54 custom wooden blocks representing bread, tomato, bacon, and lettuce and a custom die to determine which piece to move.',
                difficulty: 'easy',
                instructions: 'Stack blocks to build a giant BLT sandwich for Shaggy and Scooby. Take turns moving pieces!'
            },
            'game10': {
                name: 'Spider-Man – Mysterio Rush',
                category: 'action',
                description: 'An action-packed, fast-paced browser game where players help Spider-Man navigate through New York City to stop Mysterio\'s illusions.',
                difficulty: 'medium',
                instructions: 'Swing through New York City. Stop Mysterio\'s illusions and save the day!'
            },
            'game11': {
                name: 'Tom and Jerry Broom Riders',
                category: 'racing',
                description: 'The duo works together to navigate magical skies on a broomstick. Players guide the pair through obstacle-filled levels to collect escaped household items, utilizing teamwork to advance through various stages.',
                difficulty: 'easy',
                instructions: 'Guide Tom and Jerry on a broomstick through magical skies. Collect household items and avoid obstacles!'
            }
        };

        let created = 0;
        let updated = 0;
        const results = [];

        for (const folder of folders) {
            // Skip 'shared' folder
            if (folder === 'shared') continue;

            // Check if folder has index.html
            const indexPath = path.join(gamesPath, folder, 'index.html');
            try {
                await fs.access(indexPath);
            } catch {
                console.log(`Skipping ${folder}: No index.html found`);
                continue; // Skip folders without index.html
            }

            // Create images folder in the separate /images directory
            const imagesPath = path.join(__dirname, '../../images', folder);
            try {
                await fs.access(imagesPath);
            } catch {
                console.log(`Creating images folder for ${folder} in /images directory`);
                await fs.mkdir(imagesPath, { recursive: true });
            }

            // Get game details for this folder
            const details = gameDetails[folder];
            
            if (!details) {
                console.log(`No details defined for ${folder}, skipping...`);
                continue;
            }

            // Check if game exists
            const [game, created_new] = await Game.findOrCreate({
                where: { gameId: folder },
                defaults: {
                    name: details.name,
                    category: details.category,
                    description: details.description,
                    instructions: details.instructions,
                    difficulty: details.difficulty,
                    // Images are stored as BLOBs in DB (uploaded separately)
                    bannerImage: null,
                    logoImage: null,
                    screenshot1: null,
                    screenshot2: null,
                    screenshot3: null,
                    isActive: true,
                    sortOrder: parseInt(folder.replace('game', '')) || 0
                }
            });

            if (created_new) {
                created++;
                results.push({ folder, status: 'created', name: details.name });
            } else {
                // Update existing game
                await game.update({
                    name: details.name,
                    category: details.category,
                    description: details.description,
                    instructions: details.instructions,
                    difficulty: details.difficulty,
                    isActive: true
                });
                updated++;
                results.push({ folder, status: 'updated', name: details.name });
            }
        }

        res.json({
            success: true,
            message: 'Games initialized successfully',
            data: {
                created,
                updated,
                total: created + updated,
                games: results
            }
        });

    } catch (error) {
        console.error('Initialize games error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize games',
            error: error.message
        });
    }
};

// @desc    Add new game
// @route   POST /api/games
// @access  Private/Admin
exports.addGame = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    try {
        const { 
            gameId, 
            name, 
            category, 
            description, 
            instructions, 
            difficulty,
            gamePath,
            bannerImage,
            logoImage,
            screenshot1,
            screenshot2,
            screenshot3,
            sortOrder 
        } = req.body;

        // Validate required fields
        if (!gameId || !name || !category || !gamePath) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: gameId, name, category, and gamePath are required'
            });
        }

        // Check if game already exists
        const existingGame = await Game.findOne({ where: { gameId } });
        if (existingGame) {
            return res.status(400).json({
                success: false,
                message: 'Game with this ID already exists'
            });
        }

        // Create game folder structure
        const gamesPath = path.join(__dirname, '../../games', gameId);
        const imagesPath = path.join(__dirname, '../../images', gameId); // Use separate images folder

        try {
            // Create game folder
            await fs.mkdir(gamesPath, { recursive: true });
            // Create images folder in separate location
            await fs.mkdir(imagesPath, { recursive: true });

            // Create a basic index.html file if gamePath is just the folder
            if (gamePath === gameId || gamePath === `/${gameId}`) {
                const indexPath = path.join(gamesPath, 'index.html');
                const basicHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${name}</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>${name}</h1>
    <p>${description || 'Game coming soon!'}</p>
    <div>Game content will be placed here</div>
</body>
</html>`;
                await fs.writeFile(indexPath, basicHtml);
            }
        } catch (error) {
            logger.error('Error creating game folders:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create game directory structure'
            });
        }

        // Create game in database
        const newGame = await Game.create({
            gameId,
            name,
            category,
            description,
            instructions,
            difficulty: difficulty || 'medium',
            // Images are stored as BLOBs in DB (uploaded separately)
            bannerImage: null,
            logoImage: null,
            screenshot1: null,
            screenshot2: null,
            screenshot3: null,
            isActive: true,
            sortOrder: sortOrder || 0,
            playCount: 0
        });

        // Prepare response with URLs (exclude internal paths)
        const gameData = {
            id: newGame.id,
            gameId: newGame.gameId,
            name: newGame.name,
            category: newGame.category,
            description: newGame.description,
            instructions: newGame.instructions,
            difficulty: newGame.difficulty,
            playCount: newGame.playCount,
            sortOrder: newGame.sortOrder,
            createdAt: newGame.createdAt,
            updatedAt: newGame.updatedAt,
            bannerUrl: newGame.bannerImage ? `/api/games/image/${gameId}/banner` : null,
            logoUrl: newGame.logoImage ? `/api/games/image/${gameId}/logo` : null,
            screenshotUrls: [
                newGame.screenshot1 ? `/api/games/image/${gameId}/screenshot1` : null,
                newGame.screenshot2 ? `/api/games/image/${gameId}/screenshot2` : null,
                newGame.screenshot3 ? `/api/games/image/${gameId}/screenshot3` : null
            ].filter(Boolean),
            playUrl: `/games/${gameId}`
        };

        res.status(201).json({
            success: true,
            message: 'Game added successfully',
            data: gameData
        });

    } catch (error) {
        logger.error('Add game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add game',
            error: error.message
        });
    }
};

// @desc    Edit game
// @route   PUT /api/games/:gameId
// @access  Private/Admin
exports.editGame = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    try {
        const { gameId } = req.params;
        const updateData = req.body;

        // Find game
        const game = await Game.findOne({ where: { gameId } });
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Remove protected fields from update data
        delete updateData.gameId;
        delete updateData.playCount;
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Update game
        await game.update(updateData);

        // Prepare response with URLs
        const gameData = {
            ...game.toJSON(),
            bannerUrl: `/api/games/image/${gameId}/banner.jpg`,
            logoUrl: `/api/games/image/${gameId}/logo.jpg`,
            screenshotUrls: [
                game.screenshot1 ? `/api/games/image/${gameId}/screenshot1.jpg` : null,
                game.screenshot2 ? `/api/games/image/${gameId}/screenshot2.jpg` : null,
                game.screenshot3 ? `/api/games/image/${gameId}/screenshot3.jpg` : null
            ].filter(url => url !== null),
            playUrl: `/games/${gameId}`
        };

        res.json({
            success: true,
            message: 'Game updated successfully',
            data: gameData
        });

    } catch (error) {
        logger.error('Edit game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update game',
            error: error.message
        });
    }
};

// @desc    Delete game (soft delete)
// @route   DELETE /api/games/:gameId
// @access  Private/Admin
exports.deleteGame = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    try {
        const { gameId } = req.params;
        const { permanent } = req.query; // Optional query param for permanent delete

        // Find game
        const game = await Game.findOne({ 
            where: { gameId },
            paranoid: false // Include soft-deleted records
        });
        
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (permanent === 'true') {
            // Permanent delete - remove from database and file system
            const gamesPath = path.join(__dirname, '../../games', gameId);
            const imagesPath = path.join(__dirname, '../../images', gameId);
            
            try {
                // Delete game folder
                await fs.rm(gamesPath, { recursive: true, force: true });
                // Delete images folder
                await fs.rm(imagesPath, { recursive: true, force: true });
            } catch (error) {
                logger.error('Error deleting game folders:', error);
                // Continue with database deletion even if folder deletion fails
            }

            // Permanently delete from database
            await game.destroy({ force: true });

            res.json({
                success: true,
                message: 'Game permanently deleted successfully'
            });
        } else {
            // Soft delete - just mark as inactive
            await game.update({ isActive: false });
            
            res.json({
                success: true,
                message: 'Game deactivated successfully'
            });
        }

    } catch (error) {
        logger.error('Delete game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete game',
            error: error.message
        });
    }
};

// @desc    Restore soft-deleted game
// @route   POST /api/games/:gameId/restore
// @access  Private/Admin
exports.restoreGame = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    try {
        const { gameId } = req.params;

        // Find game (including soft-deleted)
        const game = await Game.findOne({ 
            where: { gameId },
            paranoid: false
        });
        
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Restore game
        await game.update({ isActive: true });

        res.json({
            success: true,
            message: 'Game restored successfully',
            data: {
                gameId: game.gameId,
                name: game.name,
                isActive: game.isActive
            }
        });

    } catch (error) {
        logger.error('Restore game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore game',
            error: error.message
        });
    }
};
