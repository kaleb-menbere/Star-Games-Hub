const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;
const env = require('../config/environment');
const logger = require('../services/logger.service');

// Verify if user has access to a specific game
const verifyGameAccess = async (req, res, next) => {
    try {
        const { gameId } = req.params;
        
        // Allow access to shared assets without token
        if (gameId === 'shared') {
            return next();
        }

        // Check for token
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Also check for token in query parameter (for iframe sources)
        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            logger.warn(`No token provided for game access: ${gameId}`);
            return res.status(401).json({
                success: false,
                message: 'Authentication required to access this game'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, env.JWT_SECRET);
            
            // Check if game exists
            const gamePath = path.join(__dirname, '../../games', gameId);
            try {
                await fs.access(gamePath);
            } catch {
                return res.status(404).json({
                    success: false,
                    message: 'Game not found'
                });
            }

            // Check if it's a file request (like index.html, .js, .css)
            const requestedFile = req.path;
            
            // If requesting HTML file, serve it with headers to prevent download
            if (requestedFile.endsWith('.html') || requestedFile === '/' || requestedFile === '') {
                const indexPath = path.join(gamePath, 'index.html');
                
                try {
                    await fs.access(indexPath);
                    
                    // Read and modify HTML to include anti-download measures
                    let html = await fs.readFile(indexPath, 'utf8');
                    
                    // Add meta tags to prevent caching and downloading
                    const metaTags = `
                        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
                        <meta http-equiv="Pragma" content="no-cache">
                        <meta http-equiv="Expires" content="0">
                        <meta name="robots" content="noindex, nofollow">
                        <style>
                            /* Disable text selection and right-click */
                            * {
                                -webkit-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                            }
                            img, video {
                                pointer-events: none;
                            }
                        </style>
                        <script>
                            // Disable right-click
                            document.addEventListener('contextmenu', event => event.preventDefault());
                            
                            // Disable keyboard shortcuts for saving
                            document.addEventListener('keydown', function(e) {
                                if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
                                    e.preventDefault();
                                    return false;
                                }
                            });
                            
                            // Disable drag and drop
                            document.addEventListener('dragstart', event => event.preventDefault());
                        </script>
                    `;
                    
                    // Insert meta tags before closing head
                    html = html.replace('</head>', metaTags + '</head>');
                    
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                    res.setHeader('X-Content-Type-Options', 'nosniff');
                    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
                    
                    return res.send(html);
                } catch (error) {
                    return res.status(404).send('Game not found');
                }
            }

            // For other files (JS, CSS, images), serve with anti-download headers
            const filePath = path.join(gamePath, requestedFile);
            
            try {
                await fs.access(filePath);
                
                // Set headers to prevent downloading
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('Content-Disposition', 'inline');
                
                // Add user info to request for logging
                req.user = decoded;
                next();
            } catch {
                return res.status(404).send('File not found');
            }

        } catch (jwtError) {
            logger.error('JWT verification error in game access:', jwtError);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

    } catch (error) {
        logger.error('Game access middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying game access'
        });
    }
};

module.exports = { verifyGameAccess };