// VerifyEmail.jsx - Fixed Version (6-digit code only)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../components/Message';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { verifyEmail, resendVerification } = useAuth();
    const { showMessage } = useMessage();
    
    const [email, setEmail] = useState('');
    const [codeDigits, setCodeDigits] = useState(new Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [verified, setVerified] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    
    const inputsRef = useRef([]);

    // Load email from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('verificationEmail');
        if (stored) setEmail(stored);
    }, []);

    // Resend timer
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Handle verify button click
    const handleVerify = async () => {
        const code = codeDigits.join('');
        
        // Validate
        if (!email) {
            showMessage('Please enter your email', 'warning');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'warning');
            return;
        }
        
        if (code.length !== 6) {
            showMessage('Please enter the 6-digit verification code', 'warning');
            return;
        }

        setLoading(true);
        const result = await verifyEmail(code);
        setLoading(false);

        if (result.success) {
            setVerified(true);
            showMessage('Email verified successfully!', 'success');
            setTimeout(() => navigate('/login'), 3000);
        } else {
            showMessage(result.error || 'Verification failed. Please try again.', 'error');
            // Clear code on error
            setCodeDigits(new Array(6).fill(''));
            inputsRef.current[0]?.focus();
        }
    };

    // Handle resend code
    const handleResend = async () => {
        if (!email) {
            showMessage('Please enter your email', 'warning');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'warning');
            return;
        }

        setResendTimer(60);
        setCodeSent(true);
        
        const result = await resendVerification(email);
        
        if (result.success) {
            showMessage(`Verification code sent to ${email}`, 'success');
            // Clear old code
            setCodeDigits(new Array(6).fill(''));
            inputsRef.current[0]?.focus();
        } else {
            showMessage(result.error || 'Failed to send code. Please try again.', 'error');
            setResendTimer(0);
        }
    };

    // Handle digit input change
    const handleDigitChange = (e, idx) => {
        let val = e.target.value;
        
        // Allow only numbers
        val = val.replace(/[^0-9]/g, '');
        
        // Handle paste (multiple digits)
        if (val.length > 1) {
            const chars = val.split('');
            const newDigits = [...codeDigits];
            
            for (let i = 0; i < chars.length && idx + i < 6; i++) {
                newDigits[idx + i] = chars[i];
            }
            
            setCodeDigits(newDigits);
            
            // Focus last filled input
            const lastIndex = Math.min(5, idx + chars.length - 1);
            inputsRef.current[lastIndex]?.focus();
            return;
        }

        // Single digit
        const newDigits = [...codeDigits];
        newDigits[idx] = val;
        setCodeDigits(newDigits);

        // Auto-focus next input
        if (val && idx < 5) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    // Handle key down (backspace, arrows)
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            
            if (codeDigits[idx]) {
                // Clear current
                const newDigits = [...codeDigits];
                newDigits[idx] = '';
                setCodeDigits(newDigits);
            } else if (idx > 0) {
                // Move to previous and clear it
                const newDigits = [...codeDigits];
                newDigits[idx - 1] = '';
                setCodeDigits(newDigits);
                inputsRef.current[idx - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        } else if (e.key === 'ArrowRight' && idx < 5) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const digits = pastedText.replace(/[^0-9]/g, '');
        
        if (digits.length === 6) {
            setCodeDigits(digits.split(''));
            inputsRef.current[5]?.focus();
        } else if (digits.length > 0) {
            showMessage('Please paste a valid 6-digit code', 'warning');
        }
    };

    // Success View
    if (verified) {
        return (
            <div className="verify-email-container">
                <div className="verify-email-card">
                    <div className="verify-email-success">
                        <div className="success-icon">✅</div>
                        <h2>Email Verified!</h2>
                        <p>Your email has been successfully verified.</p>
                        <p className="redirect-text">Redirecting to login in 3 seconds...</p>
                        <Link to="/login" className="verify-email-btn">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Main View
    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <h2>Verify Your Email</h2>
                
                {codeSent && (
                    <div className="info-message">
                        📧 Verification code sent to <strong>{email}</strong>
                    </div>
                )}

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>6-Digit Verification Code</label>
                    <div className="code-inputs" onPaste={handlePaste}>
                        {codeDigits.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputsRef.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleDigitChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="digit-input"
                                disabled={loading}
                            />
                        ))}
                    </div>
                    <small>Enter the 6-digit code sent to your email</small>
                </div>

                <div className="button-group">
                    <button 
                        onClick={handleVerify} 
                        className="verify-btn"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </div>

                <div className="links">
                    <Link to="/login">Back to Login</Link>
                    <span>•</span>
                    <Link to="/register">Create Account</Link>
                </div>

                <div className="help-text">
                    <p>Check your spam folder if you don't see the email.</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;