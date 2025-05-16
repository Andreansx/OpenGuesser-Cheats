/*global chrome */
console.log('OpenGuesser content script loaded');
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.command === 'fetch') {
        const iframe = document.querySelector('#PanoramaIframe');
        if (iframe) {
            const src = iframe.getAttribute('src');
            const match = src.match(/location=([-\d.]+),([-\d.]+)/);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                sendResponse({ lat, lng });
            } else {
                sendResponse({ error: 'Nie znaleziono współrzędnych w adresie URL.' });
            }
        } else {
            sendResponse({ error: 'Nie znaleziono iframe z mapą.' });
        }
        return true;
    }
});
