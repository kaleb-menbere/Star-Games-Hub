const nodemailer = require('nodemailer');
const env = require('../config/environment');
const logger = require('./logger.service');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: env.EMAIL_USERNAME,
                pass: env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        // Verify connection on startup
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('Email transporter verification failed:', error);
            } else {
                logger.info('Email transporter is ready to send messages');
            }
        });
    }

    async sendVerificationEmail(email, username, verificationCode) {
        // Add # for HashRouter - still include link to verify page (user will enter code there)
        const verificationPage = `${env.FRONTEND_URL}/#/verify-email`;
        
        const mailOptions = {
            from: env.EMAIL_FROM,
            to: email,
            subject: 'Verify Your Email - Star Games Hub',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 10px;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #667eea;
                            margin: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: #667eea;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .button:hover {
                            background: #5a67d8;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                        .token {
                            background: #f3f4f6;
                            padding: 10px;
                            border-radius: 5px;
                            font-family: monospace;
                            word-break: break-all;
                        }
                        .note {
                            background: #e6f7ff;
                            border: 1px solid #91d5ff;
                            color: #0050b3;
                            padding: 10px;
                            border-radius: 5px;
                            margin: 15px 0;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <h1>🎮 Star Games Hub</h1>
                            </div>
                            
                            <h2>Welcome, ${username}!</h2>
                            
                            <p>Thank you for registering at Star Games Hub. Please verify your email address to start playing games.</p>
                            
                            <div class="note">
                                <strong>🔢 Your verification code:</strong>
                            </div>

                            <div style="text-align: center; margin: 20px 0;">
                                <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; background:#f7fafc; padding:12px 20px; display:inline-block; border-radius:8px;">
                                    ${verificationCode}
                                </div>
                            </div>

                            <p>Enter the above 6-digit code on the verification page to activate your account.</p>

                            <div class="note">
                                <strong>🔗 Verify page:</strong> <a href="${verificationPage}">${verificationPage}</a>
                            </div>

                            <p>This code will expire in 24 hours.</p>
                            
                            <p>If you didn't create an account at Star Games Hub, please ignore this email.</p>
                            
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Star Games Hub. All rights reserved.</p>
                                <p>This is an automated message, please do not reply.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Verification email sent to ${email}`);
            return true;
        } catch (error) {
            logger.error('Error sending verification email:', error);
            throw error;
        }
    }

    async sendPasswordResetEmail(email, username, resetToken) {
        // Add # for HashRouter
        const resetUrl = `${env.FRONTEND_URL}/#/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: env.EMAIL_FROM,
            to: email,
            subject: 'Reset Your Password - Star Games Hub',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 10px;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #667eea;
                            margin: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: #667eea;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .button:hover {
                            background: #5a67d8;
                        }
                        .warning {
                            color: #e53e3e;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                        .note {
                            background: #e6f7ff;
                            border: 1px solid #91d5ff;
                            color: #0050b3;
                            padding: 10px;
                            border-radius: 5px;
                            margin: 15px 0;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <h1>🎮 Star Games Hub</h1>
                            </div>
                            
                            <h2>Hello, ${username}!</h2>
                            
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            
                            <div class="note">
                                <strong>🔗 Hash Router Link:</strong> This link includes # for our single-page app.
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </div>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <div style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
                                ${resetUrl}
                            </div>
                            
                            <p class="warning">⚠️ This link will expire in 10 minutes.</p>
                            
                            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
                            
                            <div class="note">
                                <strong>📧 Gmail Users:</strong> If you use Gmail, make sure you've enabled "Less secure app access" or use an app password for authentication.
                            </div>
                            
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Star Games Hub. All rights reserved.</p>
                                <p>This is an automated message, please do not reply.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Password reset email sent to ${email}`);
            return true;
        } catch (error) {
            logger.error('Error sending password reset email:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(email, username) {
        // Add # for HashRouter
        const dashboardUrl = `${env.FRONTEND_URL}/#/dashboard`;
        
        const mailOptions = {
            from: env.EMAIL_FROM,
            to: email,
            subject: 'Welcome to Star Games Hub!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 10px;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #667eea;
                            margin: 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: #667eea;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .features {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin: 30px 0;
                        }
                        .feature {
                            text-align: center;
                        }
                        .feature-icon {
                            font-size: 32px;
                            margin-bottom: 10px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                        .note {
                            background: #e6f7ff;
                            border: 1px solid #91d5ff;
                            color: #0050b3;
                            padding: 10px;
                            border-radius: 5px;
                            margin: 15px 0;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <h1>🎮 Welcome to Star Games Hub!</h1>
                            </div>
                            
                            <h2>Hi ${username}!</h2>
                            
                            <p>Your email has been successfully verified. You can now enjoy all the features of Star Games Hub!</p>
                            
                            <div class="note">
                                <strong>📱 Access your dashboard:</strong> Click the button below or visit ${dashboardUrl}
                            </div>
                            
                            <div class="features">
                                <div class="feature">
                                    <div class="feature-icon">🎮</div>
                                    <h3>Play Games</h3>
                                    <p>Access all our exciting games</p>
                                </div>
                                <div class="feature">
                                    <div class="feature-icon">🏆</div>
                                    <h3>Earn Achievements</h3>
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Star Games Hub. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Welcome email sent to ${email}`);
            return true;
        } catch (error) {
            logger.error('Error sending welcome email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();