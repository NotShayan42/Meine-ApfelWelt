// Hauptscript für mein Kunstprojekt

// Überprüft den Login Status
function checkLogin() {
  // Überprüft, ob der Benutzer eingeloggt ist und nicht bereits auf der Login-Seite ist
  if (localStorage.getItem('isLoggedIn') !== 'true' && !window.location.pathname.includes('index.html')) {
    // Weiterleitung zur Login-Seite
    window.location.href = 'index.html';  // Nutze relative Pfade für GitHub Pages oder lokale Tests
    return;
  }
}

// Überprüft Login Status beim Laden
window.addEventListener('load', () => {
  checkLogin();
  
  // Logout Knopf
  const nav = document.querySelector('.nav-controls');
  if (nav && !document.querySelector('.logout-btn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = () => {

      localStorage.removeItem('isLoggedIn');

      window.location.href = 'index.html';  // Nutze relative Pfade
    };
    nav.appendChild(logoutBtn);
  }
});

let appleFallInterval;

// Theme switcher
window.setTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('apple-theme', theme);

  document.querySelectorAll('.theme-btn').forEach(btn => btn.style.transform = 'scale(1)');
  const activeBtn = document.querySelector(`.theme-btn.${theme}`);
  if (activeBtn) {
    activeBtn.style.transform = 'scale(1.1)';
  }
  // Bild aktualisieren
  const appleImage = document.querySelector('.hero img');
  if (appleImage) {
    const imageMap = {
      red: 'Apfel.png',
      green: 'GruenerApfel2.png',
      yellow: 'GelberApfel2.png'
    };
    appleImage.src = imageMap[theme] || imageMap.red;
  }

  // Äpfel regnen lassen
  const rainEnabled = localStorage.getItem('apple-rain') === 'true';
  toggleAppleRain(rainEnabled);
};

// Aktuelles Theme-Emoji
function getThemeApple() {
  const theme = document.documentElement.getAttribute('data-theme') || 'red';
  return theme === 'green' ? '🍏' : '🍎';
}

// Äpfelregen erzeugen
function createFallingApple() {
  const container = document.querySelector('.apple-container');
  if (!container) return;

  const apple = document.createElement('div');
  apple.className = 'falling-apple';
  apple.textContent = getThemeApple();

  const pos = Math.random() * 100;
  const rot = Math.random() * 360;
  const size = Math.random() * (2 - 1) + 1;

  apple.style.left = `${pos}%`;
  apple.style.transform = `rotate(${rot}deg)`;
  apple.style.fontSize = `${size}rem`;

  container.appendChild(apple);

  setTimeout(() => apple.remove(), 3000);
}

// Regen starten
function toggleAppleRain(enabled) {
  const container = document.querySelector('.apple-container');
  if (!container) return;

  if (enabled) {
    if (appleFallInterval) clearInterval(appleFallInterval);
    createFallingApple();
    appleFallInterval = setInterval(() => {
      createFallingApple();
    }, Math.random() * 100 + 300);
  } else {
    if (appleFallInterval) clearInterval(appleFallInterval);
    appleFallInterval = null;
    container.innerHTML = '';
  }

  // Zustand speichern und Button aktualisieren
  localStorage.setItem('apple-rain', enabled ? 'true' : 'false');
  const btn = document.querySelector('.rain-toggle');
  if (btn) {
    btn.classList.toggle('active', enabled);
    btn.title = enabled ? 'Regen deaktivieren' : 'Regen aktivieren';
  }
}

// Theme beim Start setzen
function initTheme() {
  const savedTheme = localStorage.getItem('apple-theme') || 'red';
  setTheme(savedTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Apple World initialized');

  const nav = document.querySelector('nav');

  // Steuerungs-Container
  const controls = document.createElement('div');
  controls.className = 'nav-controls';

  // Theme-Switcher
  const themeSwitcher = document.createElement('div');
  themeSwitcher.className = 'theme-switcher';
  themeSwitcher.innerHTML = `
    <button class="theme-btn red" onclick="setTheme('red')" title="Roter Apfel"></button>
    <button class="theme-btn green" onclick="setTheme('green')" title="Grüner Apfel"></button>
    <button class="theme-btn yellow" onclick="setTheme('yellow')" title="Gelber Apfel"></button>
  `;

  // Regen-Toggle
  const rainToggle = document.createElement('button');
  rainToggle.className = 'rain-toggle';
  rainToggle.innerHTML = '🍎';
  rainToggle.title = 'Regen aktivieren';
  rainToggle.onclick = () => {
    const isActive = !rainToggle.classList.contains('active');
    toggleAppleRain(isActive);
  };

  controls.appendChild(themeSwitcher);
  controls.appendChild(rainToggle);
  nav.appendChild(controls);

  // Klick zum Apfelfallen
  function createTouchApple(x, y) {
    const container = document.querySelector('.apple-container');
    if (!container) return;
  
    const apple = document.createElement('div');
    apple.className = 'falling-apple';
    apple.textContent = getThemeApple();
    apple.style.left = `${x}px`;
    apple.style.top = `${y}px`;
  
    container.appendChild(apple);
    setTimeout(() => apple.remove(), 3000);
  }
  
  function handleAppleTouch(event) {
    if (!document.querySelector('.rain-toggle')?.classList.contains('active')) return;
  
    // Für Touchscreen
    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      createTouchApple(touch.clientX, touch.clientY);
    } else {
      // Für Mausklick
      createTouchApple(event.clientX, event.clientY);
    }
  }
  
  document.addEventListener('click', handleAppleTouch);
  document.addEventListener('touchstart', handleAppleTouch);
  


  initTheme();

  const rainEnabled = localStorage.getItem('apple-rain') === 'true';
  toggleAppleRain(rainEnabled);
});
