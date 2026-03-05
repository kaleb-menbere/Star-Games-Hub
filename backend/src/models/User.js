const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/environment');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Please provide a valid email'
            },
            notEmpty: {
                msg: 'Email is required'
            }
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [3, 20],
                msg: 'Username must be between 3 and 20 characters'
            },
            notEmpty: {
                msg: 'Username is required'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [6, 100],
                msg: 'Password must be at least 6 characters'
            }
        }
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verificationTokenExpire: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    profile: {
        type: DataTypes.JSONB,
        defaultValue: {
            firstName: null,
            lastName: null,
            avatar: null,
            bio: null
        }
    },
    gameStats: {
        type: DataTypes.JSONB,
        defaultValue: {
            gamesPlayed: 0,
            highScores: [],
            achievements: []
        }
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance methods
User.prototype.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this.id, email: this.email, role: this.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRE }
    );
};

User.prototype.generateVerificationToken = function() {
    // Generate a 6-digit numeric code for verification
    const code = crypto.randomInt(100000, 1000000).toString();

    // Store a hashed version in database
    this.verificationToken = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

    // Keep previous 24 hour expiry
    this.verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return code;
};

User.prototype.generateResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    
    return resetToken;
};

User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > new Date());
};

module.exports = User;