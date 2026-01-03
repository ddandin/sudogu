/**
 * INSTAGRAM WEBVIEW DETECTION & VIEWPORT FIXES
 *
 * This script:
 * 1. Detects if app is running in Instagram's in-app browser
 * 2. Applies specific fixes for WebView
 * 3. Calculates and updates CSS custom properties for viewport height
 * 4. Handles orientation changes and resize events
 */

(function() {
    'use strict';

    /**
     * Detect if running in Instagram WebView
     */
    function isInstagramWebView() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;

        // Check for Instagram user agent
        if (ua.indexOf('Instagram') > -1) {
            return true;
        }

        // Check for FBAN (Facebook App - Instagram uses this too)
        if (ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1) {
            return true;
        }

        // Additional check for Instagram-specific properties
        if (window.navigator.standalone === false && /iPhone|iPad|iPod/.test(ua)) {
            // Might be iOS WebView
            return true;
        }

        return false;
    }

    /**
     * Detect any mobile WebView (not just Instagram)
     */
    function isAnyWebView() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;

        // Check for common WebView indicators
        const webViewPatterns = [
            'Instagram',
            'FBAN',
            'FBAV',
            'Twitter',
            'Line',
            'wv', // Android WebView
            'WebView'
        ];

        return webViewPatterns.some(pattern => ua.indexOf(pattern) > -1);
    }

    /**
     * Calculate actual viewport height (accounting for browser UI)
     */
    function setViewportHeight() {
        // Get actual viewport height
        const vh = window.innerHeight * 0.01;

        // Set CSS custom property
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // Also set full height
        document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`);

        // Log for debugging
        if (window.DEBUG_VIEWPORT) {
            console.log('Viewport height set:', {
                innerHeight: window.innerHeight,
                vh: vh,
                screenHeight: window.screen.height
            });
        }
    }

    /**
     * Apply Instagram-specific fixes
     */
    function applyInstagramFixes() {
        document.body.classList.add('instagram-webview');
        document.body.classList.add('mobile-webview');

        console.log('Instagram WebView detected - applying fixes');

        // Force height recalculation after a short delay
        setTimeout(() => {
            setViewportHeight();
            // Force a reflow
            document.body.style.display = 'none';
            document.body.offsetHeight; // Trigger reflow
            document.body.style.display = '';
        }, 100);
    }

    /**
     * Apply general WebView fixes
     */
    function applyWebViewFixes() {
        document.body.classList.add('mobile-webview');

        console.log('Mobile WebView detected - applying fixes');
    }

    /**
     * Disable pull-to-refresh on iOS
     */
    function disablePullToRefresh() {
        let lastTouchY = 0;
        let preventPullToRefresh = false;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            lastTouchY = e.touches[0].clientY;
            preventPullToRefresh = window.pageYOffset === 0;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchYDelta = touchY - lastTouchY;
            lastTouchY = touchY;

            if (preventPullToRefresh) {
                // Prevent pull-to-refresh
                if (touchYDelta > 0) {
                    e.preventDefault();
                    return;
                }
                preventPullToRefresh = false;
            }
        }, { passive: false });
    }

    /**
     * Handle resize events (orientation change, keyboard show/hide)
     */
    function handleResize() {
        setViewportHeight();

        // Add a small delay to ensure layout has settled
        setTimeout(() => {
            setViewportHeight();
        }, 100);
    }

    /**
     * Prevent iOS zoom on double tap
     */
    function preventDoubleTapZoom() {
        let lastTouchEnd = 0;

        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Fix viewport units on mobile browsers
     * This addresses the 100vh issue by using JavaScript
     */
    function fixMobileViewportUnits() {
        // Only run on mobile
        if (window.innerWidth > 768) return;

        // Set initial value
        setViewportHeight();

        // Update on resize (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });

        // Update on orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 200);
        });

        // Update when page becomes visible (iOS background tab issue)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(setViewportHeight, 100);
            }
        });
    }

    /**
     * Main initialization
     */
    function init() {
        console.log('WebView detection initializing...');
        console.log('User Agent:', navigator.userAgent);

        // Detect WebView
        const isIG = isInstagramWebView();
        const isWebView = isAnyWebView();

        if (isIG) {
            applyInstagramFixes();
        } else if (isWebView) {
            applyWebViewFixes();
        }

        // Apply mobile viewport fixes
        if (window.innerWidth <= 768) {
            fixMobileViewportUnits();
            disablePullToRefresh();
            preventDoubleTapZoom();
        }

        // Log detection results
        console.log('Detection results:', {
            isInstagram: isIG,
            isWebView: isWebView,
            isMobile: window.innerWidth <= 768,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API for debugging
    window.webviewDetection = {
        isInstagram: isInstagramWebView,
        isWebView: isAnyWebView,
        recalculateHeight: setViewportHeight,
        enableDebug: () => { window.DEBUG_VIEWPORT = true; }
    };
})();
