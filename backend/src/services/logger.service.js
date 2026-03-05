const fs = require('fs');
const path = require('path');
const env = require('../config/environment');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Simple logger with file output
 */
class Logger {
    constructor() {
        this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }

    /**
     * Write to log file
     */
    _write(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
        }) + '\n';

        // Write to file (async)
        fs.appendFile(this.logFile, logEntry, (err) => {
            if (err) console.error('Failed to write log:', err);
        });

        // Console output in development
        if (env.IS_DEV) {
            const coloredMessage = this._colorize(level, `[${timestamp}] ${level}: ${message}`);
            console.log(coloredMessage);
        }
    }

    /**
     * Colorize console output
     */
    _colorize(level, message) {
        const colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            http: '\x1b[32m',  // Green
            debug: '\x1b[35m'  // Magenta
        };
        const reset = '\x1b[0m';
        const color = colors[level] || colors.info;
        return color + message + reset;
    }

    info(message, meta = {}) {
        this._write('info', message, meta);
    }

    error(message, meta = {}) {
        this._write('error', message, meta);
    }

    warn(message, meta = {}) {
        this._write('warn', message, meta);
    }

    debug(message, meta = {}) {
        if (env.IS_DEV) {
            this._write('debug', message, meta);
        }
    }

    http(message, meta = {}) {
        this._write('http', message, meta);
    }
}

module.exports = new Logger();