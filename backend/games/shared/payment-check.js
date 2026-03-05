// (function() {
//     'use strict';

//     // Configuration
//     const CONFIG = {
//         APP_ID: '1566724827161608',
//         API_URL: '/api/v1/payments/authorize',
//         RETRY_ATTEMPTS: 2,
//         RETRY_DELAY: 1000,
//         SUPERAPP_PACKAGE: 'cn.tydic.ethiopay', // Telebirr package name
//         SUPERAPP_STORE_URL: 'https://play.google.com/store/apps/details?id=cn.tydic.ethiopay'
//     };

//     // Get current game folder from URL
//     const gameFolder = window.location.pathname.match(/\/games\/(game\d+)\//)?.[1];
    
//     if (!gameFolder) {
//         console.error('Could not identify game folder');
//         return;
//     }

//     // State
//     let verificationInProgress = false;
//     let paymentToken = null;

//     // Create and inject styles - Telebirr Brand Colors
//     const styles = `
//         /* Modern Reset */
//         .payment-auth * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
//         }

//         /* Overlay with Telebirr gradient */
//         .payment-auth-overlay {
//             position: fixed;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: linear-gradient(135deg, #00A651 0%, #007AC2 100%);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             z-index: 999999;
//             opacity: 1;
//             transition: opacity 0.5s ease;
//         }

//         .payment-auth-overlay.fade-out {
//             opacity: 0;
//             pointer-events: none;
//         }

//         /* Card Container - Clean white */
//         .payment-auth-card {
//             background: white;
//             border-radius: 24px;
//             box-shadow: 0 20px 40px rgba(0, 87, 44, 0.2);
//             max-width: 420px;
//             width: 90%;
//             padding: 40px 30px;
//             text-align: center;
//             animation: slideUp 0.5s ease;
//             position: relative;
//             overflow: hidden;
//         }

//         .payment-auth-card::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             height: 4px;
//             background: linear-gradient(90deg, #00A651, #007AC2);
//         }

//         /* Telebirr Logo/Icon */
//         .payment-auth-icon {
//             width: 90px;
//             height: 90px;
//             margin: 0 auto 20px;
//             background: linear-gradient(135deg, #00A65110, #007AC210);
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             border: 2px solid #00A65120;
//         }

//         .payment-auth-icon svg {
//             width: 50px;
//             height: 50px;
//         }

//         /* Typography */
//         .payment-auth-title {
//             font-size: 26px;
//             font-weight: 700;
//             color: #1A2E3B;
//             margin-bottom: 10px;
//             letter-spacing: -0.5px;
//         }

//         .payment-auth-subtitle {
//             font-size: 15px;
//             color: #5E6F7D;
//             margin-bottom: 30px;
//             line-height: 1.6;
//         }

//         .payment-auth-subtitle strong {
//             color: #00A651;
//             font-weight: 700;
//         }

//         /* Telebirr Branded Button */
//         .payment-auth-button {
//             background: linear-gradient(135deg, #00A651, #007AC2);
//             color: white;
//             border: none;
//             padding: 16px 32px;
//             border-radius: 50px;
//             font-size: 16px;
//             font-weight: 600;
//             cursor: pointer;
//             transition: transform 0.2s, box-shadow 0.2s;
//             width: 100%;
//             max-width: 260px;
//             margin: 0 auto;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 12px;
//             box-shadow: 0 4px 15px rgba(0, 166, 81, 0.3);
//         }

//         .payment-auth-button:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 8px 25px rgba(0, 122, 194, 0.4);
//         }

//         .payment-auth-button:disabled {
//             opacity: 0.7;
//             cursor: not-allowed;
//             transform: none;
//             box-shadow: none;
//         }

//         .payment-auth-button svg {
//             width: 20px;
//             height: 20px;
//             fill: white;
//         }

//         /* Spinner with Telebirr colors */
//         .payment-auth-spinner {
//             width: 20px;
//             height: 20px;
//             border: 3px solid rgba(255,255,255,0.3);
//             border-radius: 50%;
//             border-top-color: white;
//             animation: spin 1s ease-in-out infinite;
//         }

//         /* Error Message */
//         .payment-auth-error {
//             background: #FFE5E5;
//             color: #D83A3A;
//             padding: 14px;
//             border-radius: 12px;
//             margin-top: 20px;
//             font-size: 14px;
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             text-align: left;
//             border-left: 4px solid #D83A3A;
//         }

//         .payment-auth-error svg {
//             width: 22px;
//             height: 22px;
//             flex-shrink: 0;
//             fill: #D83A3A;
//         }

//         /* Success Message */
//         .payment-auth-success {
//             background: #E8F5E9;
//             color: #00A651;
//             padding: 14px;
//             border-radius: 12px;
//             margin-top: 20px;
//             font-size: 14px;
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             text-align: left;
//             border-left: 4px solid #00A651;
//         }

//         .payment-auth-success svg {
//             width: 22px;
//             height: 22px;
//             flex-shrink: 0;
//             fill: #00A651;
//         }

//         /* Loader for game content */
//         .payment-auth-game-loader {
//             position: fixed;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: rgba(255,255,255,0.95);
//             display: none;
//             align-items: center;
//             justify-content: center;
//             z-index: 999998;
//             backdrop-filter: blur(5px);
//         }

//         .payment-auth-game-loader.active {
//             display: flex;
//         }

//         .payment-auth-game-loader-spinner {
//             width: 50px;
//             height: 50px;
//             border: 4px solid #E0E0E0;
//             border-radius: 50%;
//             border-top-color: #00A651;
//             border-right-color: #007AC2;
//             animation: spin 1s ease-in-out infinite;
//         }

//         /* Telebirr Mini App Badge */
//         .payment-auth-badge {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 8px;
//             margin-top: 25px;
//             padding-top: 20px;
//             border-top: 1px solid #E0E0E0;
//             color: #5E6F7D;
//             font-size: 13px;
//         }

//         .payment-auth-badge svg {
//             width: 18px;
//             height: 18px;
//             fill: #00A651;
//         }

//         /* Animations */
//         @keyframes slideUp {
//             from {
//                 opacity: 0;
//                 transform: translateY(30px);
//             }
//             to {
//                 opacity: 1;
//                 transform: translateY(0);
//             }
//         }

//         @keyframes spin {
//             to { transform: rotate(360deg); }
//         }

//         /* Mobile Responsive */
//         @media (max-width: 480px) {
//             .payment-auth-card {
//                 padding: 30px 20px;
//             }
            
//             .payment-auth-title {
//                 font-size: 22px;
//             }
            
//             .payment-auth-subtitle {
//                 font-size: 14px;
//             }
            
//             .payment-auth-button {
//                 padding: 14px 28px;
//                 font-size: 15px;
//             }
//         }
//     `;

//     // Inject styles
//     const styleSheet = document.createElement('style');
//     styleSheet.textContent = styles;
//     document.head.appendChild(styleSheet);

//     // Create overlay with Telebirr branding
//     const overlay = document.createElement('div');
//     overlay.className = 'payment-auth-overlay';
//     overlay.innerHTML = `
//         <div class="payment-auth-card">
//             <div class="payment-auth-icon">
//                 <!-- Telebirr style logo -->
//                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#00A651"/>
//                     <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#007AC2"/>
//                     <circle cx="12" cy="12" r="2" fill="#00A651"/>
//                 </svg>
//             </div>
//             <h2 class="payment-auth-title">telebirr Mini App</h2>
//             <div class="payment-auth-subtitle">
//                 This game is exclusively available through <strong>telebirr SuperApp</strong><br>
//                 Please launch from the SuperApp to play
//             </div>
//             <button class="payment-auth-button" id="paymentAuthRetry">
//                 <svg viewBox="0 0 24 24">
//                     <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
//                 </svg>
//                 Open in telebirr
//             </button>
//             <div class="payment-auth-error" style="display: none;">
//                 <svg viewBox="0 0 24 24">
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
//                 </svg>
//                 <span id="paymentAuthErrorMessage"></span>
//             </div>
//             <div class="payment-auth-badge">
//                 <svg viewBox="0 0 24 24">
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
//                 </svg>
//                 <span>Secure • Fast • Convenient</span>
//             </div>
//         </div>
//     `;

//     // Create game loader
//     const gameLoader = document.createElement('div');
//     gameLoader.className = 'payment-auth-game-loader';
//     gameLoader.innerHTML = '<div class="payment-auth-game-loader-spinner"></div>';

//     document.body.appendChild(overlay);
//     document.body.appendChild(gameLoader);

//     // Hide original game content initially
//     const gameContent = document.getElementById('game-content');
//     if (gameContent) {
//         gameContent.style.display = 'none';
//     }

//     // Get DOM elements
//     const retryButton = document.getElementById('paymentAuthRetry');
//     const errorDiv = document.querySelector('.payment-auth-error');
//     const errorMessage = document.getElementById('paymentAuthErrorMessage');

//     // Initialize when DOM is ready
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', init);
//     } else {
//         init();
//     }

//     function init() {
//         // Check if running in SuperApp
//         if (!window.consumerapp) {
//             // Show unauthorized UI with Telebirr branding
//             showUnauthorizedUI();
//             return;
//         }
        
//         // Request payment token from SuperApp
//         requestPaymentToken();
//     }

//     function showUnauthorizedUI() {
//         // Update UI for unauthorized access
//         document.querySelector('.payment-auth-title').textContent = 'Access via telebirr Only';
//         document.querySelector('.payment-auth-subtitle').innerHTML = 
//             'This mini app is only available inside <strong>telebirr SuperApp</strong>.<br>' +
//             'Download the app to start playing.';
        
//         // Change icon to download/phone icon
//         document.querySelector('.payment-auth-icon').innerHTML = `
//             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" fill="#00A651"/>
//                 <path d="M16 13h-3V8h-2v5H8l4 4 4-4z" fill="#007AC2"/>
//             </svg>
//         `;
        
//         // Update button for download
//         retryButton.innerHTML = `
//             <svg viewBox="0 0 24 24">
//                 <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
//             </svg>
//             Download telebirr
//         `;
        
//         retryButton.onclick = () => {
//             window.location.href = CONFIG.SUPERAPP_STORE_URL;
//         };
//     }

//     function requestPaymentToken() {
//         showLoading(true);
        
//         const payload = JSON.stringify({
//             functionName: 'js_fun_h5GetAccessToken',
//             params: {
//                 appId: CONFIG.APP_ID,
//                 functionCallBackName: 'handlePaymentToken'
//             }
//         });

//         window.consumerapp.evaluate(payload);
//     }

//     async function verifyWithServer(paymentToken, attempt = 1) {
//         if (verificationInProgress) return;
//         verificationInProgress = true;

//         try {
//             showLoading(true);

//             const response = await fetch(CONFIG.API_URL, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     game: gameFolder,
//                     paymentToken: paymentToken
//                 })
//             });

//             const result = await response.json();

//             if (response.ok && result.data?.allowed) {
//                 // Game is authorized - start the game
//                 startGame();
//             } else if (response.status === 429 && attempt <= CONFIG.RETRY_ATTEMPTS) {
//                 // Rate limited - retry after delay
//                 verificationInProgress = false;
//                 showLoading(false);
                
//                 setTimeout(() => {
//                     verifyWithServer(paymentToken, attempt + 1);
//                 }, CONFIG.RETRY_DELAY * attempt);
//             } else {
//                 // Authorization failed
//                 showError(result.error?.message || 'Subscription required');
//             }
//         } catch (error) {
//             console.error('Verification failed:', error);
            
//             if (attempt <= CONFIG.RETRY_ATTEMPTS) {
//                 // Retry on network error
//                 verificationInProgress = false;
//                 showLoading(false);
                
//                 setTimeout(() => {
//                     verifyWithServer(paymentToken, attempt + 1);
//                 }, CONFIG.RETRY_DELAY * attempt);
//             } else {
//                 showError('Verification failed. Please check your connection.');
//             }
//         } finally {
//             verificationInProgress = false;
//         }
//     }

//     function startGame() {
//         // Fade out overlay
//         overlay.classList.add('fade-out');
        
//         // Hide loader
//         gameLoader.classList.remove('active');
        
//         // Show game content after fade
//         setTimeout(() => {
//             overlay.style.display = 'none';
//             if (gameContent) {
//                 gameContent.style.display = 'block';
//             }
//         }, 500);
        
//         // Dispatch event for game to start
//         document.dispatchEvent(new CustomEvent('game-authorized', {
//             detail: { game: gameFolder }
//         }));
//     }

//     function showError(message) {
//         errorMessage.textContent = message;
//         errorDiv.style.display = 'flex';
//         showLoading(false);
        
//         // Update button for retry
//         retryButton.innerHTML = `
//             <svg viewBox="0 0 24 24">
//                 <path d="M17.65 6.35A8 8 0 1 0 19 12h-2a6 6 0 1 1-2.23-4.69l2.64-2.64 1.42 1.42-3.54 3.54-3.54-3.54 1.41-1.41L16.44 6.1c.38.36.73.76 1.04 1.18l.17.24z"/>
//             </svg>
//             Try Again
//         `;
        
//         retryButton.onclick = () => {
//             errorDiv.style.display = 'none';
//             init();
//         };
//     }

//     function showLoading(show) {
//         if (show) {
//             gameLoader.classList.add('active');
//             retryButton.disabled = true;
//         } else {
//             gameLoader.classList.remove('active');
//             retryButton.disabled = false;
//         }
//     }

//     // Make handler available globally (called by SuperApp)
//     window.handlePaymentToken = function(token) {
//         if (!token) {
//             showError('Failed to obtain payment token from telebirr');
//             return;
//         }
//         paymentToken = token;
//         verifyWithServer(paymentToken);
//     };

// })();