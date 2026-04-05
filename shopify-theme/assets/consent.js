// Studio Sabotage — Cookie Consent + GTM Loader
// Shared across all pages. Banner HTML comes from snippets/cookie-consent.liquid.

(function() {
  'use strict';

  function init() {
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieSettings = document.getElementById('cookie-settings');
    if (!cookieBanner || !cookieSettings) return;

    function getCookieConsent() {
      try { return JSON.parse(localStorage.getItem('cookie-consent')); } catch { return null; }
    }

    function saveCookieConsent(consent) {
      localStorage.setItem('cookie-consent', JSON.stringify(consent));
      cookieBanner.classList.add('hidden');
      cookieSettings.classList.remove('visible');
      applyConsent(consent);
    }

    function loadScript(src) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    }

    function applyConsent(consent) {
      if (!consent) return;

      if (consent.analytics && !window._ssAnalyticsLoaded) {
        window._ssAnalyticsLoaded = true;
        // GTM Container — verwaltet GA4, Meta Pixel, etc.
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        loadScript('https://www.googletagmanager.com/gtm.js?id=GTM-MGCNGSVV');
        console.log('[Consent] Analytics: erlaubt');
      }

      if (consent.marketing && !window._ssMarketingLoaded) {
        window._ssMarketingLoaded = true;
        // Meta Pixel — replace PIXEL_ID with your pixel ID
        const pixelId = 'PIXEL_ID';
        if (pixelId !== 'PIXEL_ID') {
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', pixelId);
          fbq('track', 'PageView');
        }
        console.log('[Consent] Marketing: erlaubt');
      }
    }

    // Show banner if no consent stored, otherwise apply saved consent
    const savedConsent = getCookieConsent();
    if (!savedConsent) {
      cookieBanner.style.display = 'flex';
    } else {
      cookieBanner.classList.add('hidden');
      applyConsent(savedConsent);
    }

    document.getElementById('cookie-accept').addEventListener('click', () => {
      saveCookieConsent({ necessary: true, analytics: true, marketing: true });
    });

    document.getElementById('cookie-reject').addEventListener('click', () => {
      saveCookieConsent({ necessary: true, analytics: false, marketing: false });
    });

    document.getElementById('cookie-close').addEventListener('click', () => {
      saveCookieConsent({ necessary: true, analytics: false, marketing: false });
    });

    document.getElementById('cookie-open-settings').addEventListener('click', () => {
      cookieSettings.classList.add('visible');
    });

    document.getElementById('cookie-save-settings').addEventListener('click', () => {
      saveCookieConsent({
        necessary: true,
        analytics: document.getElementById('cookie-analytics').checked,
        marketing: document.getElementById('cookie-marketing').checked
      });
    });

    cookieSettings.addEventListener('click', (e) => {
      if (e.target === cookieSettings) cookieSettings.classList.remove('visible');
    });

    document.getElementById('cookie-ds-link').addEventListener('click', (e) => {
      e.preventDefault();
      cookieBanner.classList.add('hidden');
      // On gallery page Datenschutz-Overlay exists inline; elsewhere navigate with hash.
      const dsOverlay = document.getElementById('datenschutz-overlay');
      const dsClose = document.getElementById('datenschutz-close');
      if (dsOverlay && dsClose) {
        document.exitPointerLock && document.exitPointerLock();
        dsOverlay.classList.add('visible');
        dsClose.classList.add('visible');
      } else {
        window.location.href = '/pages/gallery#datenschutz';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
