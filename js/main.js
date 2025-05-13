import { animateHeroText } from './animations/textAnimator.js';
import { initLoadingScreen } from './ui/loadingHandler.js';
import { initSmoothScroll } from './ui/smoothScroll.js';

document.addEventListener('DOMContentLoaded', function() {
    const loadingScreenElement = document.querySelector('.loading-screen');
    const heroContentElement = document.querySelector('.hero-content');
    const animatedTextContainerElement = document.getElementById('animated-text-container');
    const heroCtaButtonElement = document.getElementById('hero-animated-cta');
    const blobElements = document.querySelectorAll('.blob');
    const navLinkElements = document.querySelectorAll('.nav-links a');

    if (loadingScreenElement) {
        initLoadingScreen(loadingScreenElement, heroContentElement, blobElements, () => {
            if (animatedTextContainerElement && heroCtaButtonElement) {
                animateHeroText(animatedTextContainerElement, heroCtaButtonElement);
            } else if (animatedTextContainerElement) {
                animateHeroText(animatedTextContainerElement, null);
            }
        });
    }

    if (navLinkElements.length > 0) {
        initSmoothScroll(navLinkElements);
    }
});