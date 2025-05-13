export function initLoadingScreen(
    loadingScreenElement,
    contentToRevealElement = null,
    blobElements = null,
    onLoadedCallback = null
) {
    if (!loadingScreenElement) {
        if (onLoadedCallback) onLoadedCallback();
        return;
    }

    const initialDelay = 2000; 
    const fadeOutDuration = 600; 

    setTimeout(() => {
        loadingScreenElement.classList.add('hidden'); 

        setTimeout(() => {
            loadingScreenElement.style.display = 'none'; 

            if (contentToRevealElement) {
                contentToRevealElement.style.opacity = '1';
                contentToRevealElement.style.filter = 'blur(0)';
            }

            if (blobElements && blobElements.length > 0) {
                blobElements.forEach(blob => {
                    blob.style.opacity = '0.6'; 
                });
            }

            if (onLoadedCallback) {
                onLoadedCallback();
            }
        }, fadeOutDuration);
    }, initialDelay);
}