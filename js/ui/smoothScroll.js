export function initSmoothScroll(navLinkElements) {
    if (!navLinkElements || navLinkElements.length === 0) {
        return;
    }

    navLinkElements.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');

            if (href && href.startsWith('#') && href.length > 1) {
                event.preventDefault(); 

                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerElement = document.querySelector('header');
                    const headerOffset = headerElement ? headerElement.offsetHeight : 70;
                    
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}