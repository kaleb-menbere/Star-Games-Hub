const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const cookieParser = require('cookie-parser');

const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const env = require('./config/environment');
const logger = require('./services/logger.service');
const { User } = require('./models');

// Import all models to establish associations
require('./models');

const app = express();

/* ===============================
   MIDDLEWARE
=================================*/

app.use(cookieParser());

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: false,
    debug: env.IS_DEV
}));

// Allow cross-origin resource loading for game images served on a different port
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
}));

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

/* ===============================
   AUTH MIDDLEWARE
=================================*/

const authenticateUser = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Authorization header
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2️⃣ Cookie
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        // 3️⃣ Query (fallback)
        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        req.token = token;

        // Ensure the browser has an auth cookie for subsequent game asset requests
        // (assets won't send Authorization headers).
        res.cookie('token', token, {
            httpOnly: true,
            secure: env.IS_PROD,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        next();
    } catch (err) {
        logger.error('Authentication failed:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/* ===============================
   GAME FILE SERVING
=================================*/

app.get('/games/:gameId/*', authenticateUser, async (req, res) => {
    const { gameId } = req.params;
    const filePath = req.params[0] || 'index.html';

    try {
        const fullPath = path.join(__dirname, '../games', gameId, filePath);

        await fs.access(fullPath);

        const ext = path.extname(fullPath).toLowerCase();

        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.mp3': 'audio/mpeg',
            '.mp4': 'video/mp4',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf'
        };

        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');

        if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }

        if (ext === '.html') {
            let html = await fs.readFile(fullPath, 'utf8');

            // Inject token automatically if needed
            html = html.replace('</head>', `
                <script>
                    window.AUTH_TOKEN = "${req.token}";
                </script>
            </head>`);

            res.send(html);
        } else {
            res.sendFile(fullPath);
        }

        logger.debug(`Game access granted: ${req.user.email} → ${gameId}/${filePath}`);

    } catch (error) {
        logger.error('Game file error:', error.message);
        res.status(404).json({
            success: false,
            message: 'Game file not found'
        });
    }
});

/* ===============================
   GAME ROOT
=================================*/

app.get('/games/:gameId', authenticateUser, (req, res) => {
    const queryIndex = req.originalUrl.indexOf('?');
    const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
    res.redirect(`/games/${req.params.gameId}/index.html${query}`);
});

/* ===============================
   API ROUTES
=================================*/

app.use('/api', apiLimiter, routes);

/* ===============================
   HEALTH
=================================*/

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV
    });
});

/* ===============================
   404 & ERROR
=================================*/

app.use(notFound);
app.use(errorHandler);

module.exports = app;
