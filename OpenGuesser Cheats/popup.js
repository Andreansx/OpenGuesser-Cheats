/* global chrome */
const statusText = document.getElementById('status');
const fetchBtn = document.getElementById('btnFetch');
const openTabBtn = document.getElementById('btnOpenTab');
const langBtn = document.getElementById('btnLang');
const output = document.getElementById('output');

let lastCoords = null;
let lang = localStorage.getItem('openguesser_lang') || 'en';

const texts = {
  en: {
    status: "Status: Ready",
    getLocation: "Get location",
    openTab: "Open in new tab",
    pl: "Polski",
    github: "GitHub",
    fetching: "Fetching...",
    error: "Extension is disabled.",
    notFound: "No response from content script. Refresh the page or check if you are on the correct page.",
    noCoords: "Coordinates not found in iframe.",
    result: loc => `📍 ${loc}`,
    unknown: "Unknown city",
    unknownCountry: "Unknown country"
  },
  pl: {
    status: "Status: Gotowe",
    getLocation: "Pobierz lokalizację",
    openTab: "Otwórz w nowej karcie",
    pl: "English",
    github: "GitHub",
    fetching: "Pobieranie...",
    error: "Rozszerzenie jest wyłączone.",
    notFound: "Brak odpowiedzi z content script. Odśwież stronę lub sprawdź, czy jesteś na właściwej stronie.",
    noCoords: "Nie znaleziono współrzędnych w iframe.",
    result: loc => `📍 ${loc}`,
    unknown: "Nieznane miasto",
    unknownCountry: "Nieznany kraj"
  }
};

function setLang(newLang) {
  lang = newLang;
  localStorage.setItem('openguesser_lang', lang);
  statusText.textContent = texts[lang].status;
  fetchBtn.textContent = texts[lang].getLocation;
  openTabBtn.textContent = texts[lang].openTab;
  langBtn.textContent = texts[lang === 'en' ? 'pl' : 'en'].pl;
  document.querySelector('.github-link').textContent = texts[lang].github;
  if (!lastCoords) output.textContent = "—";
}

langBtn.addEventListener('click', () => {
  setLang(lang === 'en' ? 'pl' : 'en');
});

setLang(lang);

fetchBtn.addEventListener('click', () => {
  output.textContent = texts[lang].fetching;
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { command: 'fetch' }, async response => {
      if (!response) {
        output.textContent = texts[lang].notFound;
        lastCoords = null;
        return;
      }
      if (response.error) {
        output.textContent = response.error;
        lastCoords = null;
        return;
      }
      lastCoords = { lat: response.lat, lng: response.lng };
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${response.lat}&lon=${response.lng}&format=json`);
        const data = await res.json();
        const address = data.address;
        const location = `${address.city || address.town || address.village || texts[lang].unknown}, ${address.country || texts[lang].unknownCountry}`;
        output.textContent = texts[lang].result(location);
      } catch {
        output.textContent = texts[lang].noCoords;
      }
    });
  });
});

openTabBtn.addEventListener('click', () => {
  if (!lastCoords) {
    output.textContent = texts[lang].noCoords;
    return;
  }
  const url = `https://www.google.com/maps/search/?api=1&query=${lastCoords.lat},${lastCoords.lng}`;
  chrome.tabs.create({ url });
});