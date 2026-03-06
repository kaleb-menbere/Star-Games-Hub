const Game = require('../models/Game');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const logger = require('../services/logger.service');

// @desc    Get all games (admin view)
// @route   GET /api/admin/games
// @access  Private/Admin
exports.getAllGamesAdmin = async (req, res) => {
    try {
        const games = await Game.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: games
        });
    } catch (error) {
        logger.error('Get all games admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch games',
            error: error.message
        });
    }
};

// @desc    Create new game
// @route   POST /api/admin/games
// @access  Private/Admin
exports.createGame = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            instructions,
            difficulty,
            gameId
        } = req.body;

        // Check if gameId already exists
        const existingGame = await Game.findOne({ where: { gameId } });
        if (existingGame) {
            return res.status(400).json({
                success: false,
                message: 'Game ID already exists'
            });
        }

        // Create game folder
        const gamesPath = path.join(__dirname, '../../games', gameId);
        const imagesPath = path.join(gamesPath, 'images');
        
        await fs.mkdir(imagesPath, { recursive: true });

        // Create placeholder files
        await createPlaceholderFiles(gamesPath, gameId, name);

        // Create game in database
        const game = await Game.create({
            gameId,
            name,
            category,
            description,
            instructions,
            difficulty,
            // Images are stored as BLOBs in DB (uploaded separately)
            bannerImage: null,
            logoImage: null,
            screenshot1: null,
            screenshot2: null,
            screenshot3: null,
            isActive: false
        });

        // Log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'CREATE',
            gameId: game.id,
            gameFolder: gameId,
            details: { name, category },
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            data: game
        });

    } catch (error) {
        logger.error('Create game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create game',
            error: error.message
        });
    }
};

// @desc    Upload game zip file
// @route   POST /api/admin/games/upload/:gameId
// @access  Private/Admin
exports.uploadGameZip = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        if (!req.files || !req.files.zipFile) {
            return res.status(400).json({
                success: false,
                message: 'No zip file uploaded'
            });
        }

        const zipFile = req.files.zipFile;
        const game = await Game.findOne({ where: { gameId } });

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Validate file type
        if (!zipFile.name.endsWith('.zip')) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a ZIP file'
            });
        }

        const gamesPath = path.join(__dirname, '../../games', gameId);


        // prepare temporary extraction area
        const tmpPath = path.join(__dirname, '../../games', `tmp_upload_${Date.now()}`);
        await fs.mkdir(tmpPath, { recursive: true });

        // extract the zip contents into temp folder
        const zip = new AdmZip(zipFile.data);
        try {
            zip.extractAllTo(tmpPath, true);
            logger.info('ZIP extracted to:', tmpPath);
        } catch (extractError) {
            logger.error('ZIP extraction failed:', extractError);
            await fs.rm(tmpPath, { recursive: true, force: true });
            return res.status(400).json({
                success: false,
                message: 'Invalid ZIP file or extraction failed'
            });
        }

        // helper that finds the directory containing index.html by walking recursively
        const findIndexDir = async (dir) => {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                const p = path.join(dir, item.name);
                if (item.isFile() && item.name.toLowerCase() === 'index.html') {
                    return dir;
                }
                if (item.isDirectory()) {
                    const found = await findIndexDir(p);
                    if (found) return found;
                }
            }
            return null;
        };

        const indexDir = await findIndexDir(tmpPath);
        logger.info('indexDir found:', indexDir);
        if (!indexDir) {
            await fs.rm(tmpPath, { recursive: true, force: true });
            return res.status(400).json({
                success: false,
                message: 'ZIP file must contain an index.html file'
            });
        }

        // create the destination folder and copy only the relevant files
        await fs.mkdir(gamesPath, { recursive: true });
        logger.info('gamesPath created:', gamesPath);

        const copyRecursive = async (src, dest) => {
            const stat = await fs.stat(src);
            if (stat.isDirectory()) {
                await fs.mkdir(dest, { recursive: true });
                const children = await fs.readdir(src);
                for (const child of children) {
                    await copyRecursive(path.join(src, child), path.join(dest, child));
                }
            } else {
                await fs.copyFile(src, dest);
            }
        };

        if (indexDir === tmpPath) {
            // files were at root of zip
            await copyRecursive(tmpPath, gamesPath);
            logger.info('Copied from root');
        } else {
            const children = await fs.readdir(indexDir);
            logger.info('Children to copy:', children);
            for (const child of children) {
                await copyRecursive(path.join(indexDir, child), path.join(gamesPath, child));
            }
        }

        // remove temporary extraction directory
        await fs.rm(tmpPath, { recursive: true, force: true });
        logger.info('Upload completed for gameId:', gameId);

        // Log admin action (successful extraction)
        await AdminLog.create({
            adminId: req.user.id,
            action: 'UPLOAD',
            gameId: game.id,
            gameFolder: game.gameId,
            details: {
                type: 'zip',
                fileCount: zip.getEntries().length
            },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Game files uploaded and extracted successfully',
            data: {
                gameId,
                files: zip.getEntries().map(entry => entry.entryName)
            }
        });

    } catch (error) {
        logger.error('Upload game zip error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload game files',
            error: error.message
        });
    }
};

// @desc    Update game details
// @route   PUT /api/admin/games/:id
// @access  Private/Admin
exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            category,
            description,
            instructions,
            difficulty,
            isActive
        } = req.body;

        const game = await Game.findByPk(id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const oldData = { ...game.toJSON() };
        
        await game.update({
            name,
            category,
            description,
            instructions,
            difficulty,
            isActive
        });

        // Log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'UPDATE',
            gameId: game.id,
            gameFolder: game.gameId,
            details: { old: oldData, new: req.body },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Game updated successfully',
            data: game
        });

    } catch (error) {
        logger.error('Update game error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update game',
            error: error.message
        });
    }
};

// @desc    Delete game
// @route   DELETE /api/admin/games/:id
// @access  Private/Admin
exports.deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        const permanent = req.query.permanent === 'true';

        const game = await Game.findByPk(id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const gamesPath = path.join(__dirname, '../../games', game.gameId);
        const trashPath = path.join(__dirname, '../../games/trash', `${game.gameId}_${Date.now()}`);

        if (permanent) {
            // Permanently remove files (if any) and destroy DB row
            try {
                await fs.rm(gamesPath, { recursive: true, force: true });
            } catch (err) {
                // ignore
            }

            // Also try removing any trash copies (best-effort)
            try {
                const trashDir = path.join(__dirname, '../../games/trash');
                const entries = await fs.readdir(trashDir);
                for (const entry of entries) {
                    if (entry.startsWith(game.gameId + '_')) {
                        await fs.rm(path.join(trashDir, entry), { recursive: true, force: true });
                    }
                }
            } catch (err) {
                // ignore
            }

            await AdminLog.create({
                adminId: req.user.id,
                action: 'DELETE_PERMANENT',
                gameId: game.id,
                gameFolder: game.gameId,
                details: { name: game.name },
                ipAddress: req.ip
            });

            await game.destroy();

            return res.json({
                success: true,
                message: 'Game permanently deleted'
            });
        } else {
            // Soft-delete: move files to trash (if any) and mark as inactive
            try {
                await fs.access(gamesPath);
                await fs.cp(gamesPath, trashPath, { recursive: true });
                await fs.rm(gamesPath, { recursive: true, force: true });
            } catch (error) {
                // Game folder doesn't exist or other issue
            }

            await game.update({ isActive: false });

            // Log admin action
            await AdminLog.create({
                adminId: req.user.id,
                action: 'DELETE_SOFT',
                gameId: game.id,
                gameFolder: game.gameId,
                details: { name: game.name },
                ipAddress: req.ip
            });

            return res.json({
                success: true,
                message: 'Game soft-deleted (moved to trash)'
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

// @desc    Get game images list (checking BLOB data)
// @route   GET /api/admin/games/:gameId/images
// @access  Private/Admin
exports.getGameImages = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const game = await Game.findOne({ where: { gameId } });
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        // Check BLOB data directly, not file paths
        const images = {
            banner: !!game.bannerImage,  // Check if BLOB exists
            logo: !!game.logoImage,
            screenshots: [
                !!game.screenshot1,
                !!game.screenshot2,
                !!game.screenshot3
            ]
        };

        res.json({
            success: true,
            data: images
        });

    } catch (error) {
        logger.error('Get game images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get images',
            error: error.message
        });
    }
};
// @desc    Delete game image
// @route   DELETE /api/admin/games/:gameId/images/:imageName
// @access  Private/Admin
exports.deleteGameImage = async (req, res) => {
    try {
        const { gameId, imageName } = req.params;
        
        // Validate image name
        const validImages = ['banner.jpg', 'logo.jpg', 'screenshot1.jpg', 'screenshot2.jpg', 'screenshot3.jpg'];
        if (!validImages.includes(imageName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image name'
            });
        }

        const game = await Game.findOne({ where: { gameId } });
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }
        
        const updates = {};
        if (imageName === 'banner.jpg') {
            updates.bannerImage = null;
            updates.bannerMimeType = null;
        } else if (imageName === 'logo.jpg') {
            updates.logoImage = null;
            updates.logoMimeType = null;
        } else if (imageName === 'screenshot1.jpg') {
            updates.screenshot1 = null;
        } else if (imageName === 'screenshot2.jpg') {
            updates.screenshot2 = null;
        } else if (imageName === 'screenshot3.jpg') {
            updates.screenshot3 = null;
        }

        await game.update(updates);
        await game.reload();

        // If all screenshots are cleared, clear the shared screenshot mime type
        if (!game.screenshot1 && !game.screenshot2 && !game.screenshot3) {
            await game.update({ screenshotMimeType: null });
        }

        // Log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'DELETE_IMAGE',
            gameId: game.id,
            gameFolder: game.gameId,
            details: { deleted: imageName },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        logger.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
};


// @desc    Upload game images (store in database as BLOB)
// @route   POST /api/admin/games/:gameId/images
// @access  Private/Admin
exports.uploadGameImages = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const game = await Game.findOne({ where: { gameId } });
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const updateData = {};
        const uploadedFiles = [];

        // Handle banner upload
        if (req.files.banner) {
            updateData.bannerImage = req.files.banner.data;
            updateData.bannerMimeType = req.files.banner.mimetype;
            uploadedFiles.push('banner');
        }

        // Handle logo upload
        if (req.files.logo) {
            updateData.logoImage = req.files.logo.data;
            updateData.logoMimeType = req.files.logo.mimetype;
            uploadedFiles.push('logo');
        }

        // Handle screenshots
        if (req.files.screenshot1) {
            updateData.screenshot1 = req.files.screenshot1.data;
            updateData.screenshotMimeType = req.files.screenshot1.mimetype;
            uploadedFiles.push('screenshot1');
        }
        
        if (req.files.screenshot2) {
            updateData.screenshot2 = req.files.screenshot2.data;
            updateData.screenshotMimeType = req.files.screenshot2.mimetype;
            uploadedFiles.push('screenshot2');
        }
        
        if (req.files.screenshot3) {
            updateData.screenshot3 = req.files.screenshot3.data;
            updateData.screenshotMimeType = req.files.screenshot3.mimetype;
            uploadedFiles.push('screenshot3');
        }

        // Update game in database
        await game.update(updateData);
        
        // Fetch the updated game to confirm
        const updatedGame = await Game.findOne({ where: { gameId } });
        
        // Log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'UPLOAD_IMAGES',
            gameId: game.id,
            gameFolder: game.gameId,
            details: { uploaded: uploadedFiles },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Images uploaded successfully to database',
            data: { 
                uploaded: uploadedFiles,
                gameId: game.gameId,
                verification: {
                    banner: !!updatedGame.bannerImage,
                    logo: !!updatedGame.logoImage,
                    screenshot1: !!updatedGame.screenshot1
                }
            }
        });

    } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
};

// @desc    Get admin logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLog.findAll({
            include: [
                {
                    model: Game,
                    as: 'game',
                    attributes: ['id', 'name', 'gameId']
                },
                {
                    model: User,
                    as: 'admin',
                    attributes: ['id', 'username', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        res.json({
            success: true,
            data: logs
        });

    } catch (error) {
        logger.error('Get admin logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch logs',
            error: error.message
        });
    }
};

// @desc    Get all users (for admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'username', 'role', 'isVerified', 'profile', 'createdAt', 'updatedAt']
        });
        res.json({ success: true, data: users });
    } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// @desc    Update a user's information (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, username, role, isVerified, profile } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldData = { ...user.toJSON() };

        await user.update({
            email: email !== undefined ? email : user.email,
            username: username !== undefined ? username : user.username,
            role: role !== undefined ? role : user.role,
            isVerified: isVerified !== undefined ? isVerified : user.isVerified,
            profile: profile !== undefined ? profile : user.profile
        });

        // log admin action
        await AdminLog.create({
            adminId: req.user.id,
            action: 'UPDATE_USER',
            details: { old: oldData, new: req.body, userId: user.id },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        logger.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting self
        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Log before deleting
        await AdminLog.create({
            adminId: req.user.id,
            action: 'DELETE_USER',
            details: { userId: user.id, username: user.username, email: user.email },
            ipAddress: req.ip
        });

        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// Helper function to create placeholder files
async function createPlaceholderFiles(gamePath, gameId, gameName) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
        }
        .container {
            max-width: 800px;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }
        p {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            padding: 15px 40px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 18px;
            transition: transform 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 ${gameName}</h1>
        <p>Welcome to ${gameName}! This game is being set up. Please upload the game files through the admin panel.</p>
        <a href="#" class="button" onclick="alert('Game files coming soon!')">Play Demo</a>
    </div>
</body>
</html>`;

    await fs.writeFile(path.join(gamePath, 'index.html'), htmlContent);
}