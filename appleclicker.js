// Apple Clicker Game Script

document.addEventListener('DOMContentLoaded', () => {

  const redAppleImg     = new Image(); redAppleImg.src     = 'Apfel.png';
  const greenAppleImg   = new Image(); greenAppleImg.src   = 'GruenerApfel2.png';
  const yellowAppleImg  = new Image(); yellowAppleImg.src  = 'GelberApfel2.png';
  const rainbowAppleImg = new Image(); rainbowAppleImg.src = 'rainbowapple.png';

  // ➋ Bild-Chooser
  function getAppleImageByTheme() {
    const theme = document.documentElement.getAttribute('data-theme') || 'red';
    if (theme === 'green')   return greenAppleImg;
    if (theme === 'yellow')  return yellowAppleImg;
    if (theme === 'rainbow') return rainbowAppleImg;
    return redAppleImg;
  }

  // ➌ Bild im <img> updaten
  function updateAppleImageByTheme() {
    const img = document.querySelector('.apple-clicker');
    if (!img) return;
    img.src = getAppleImageByTheme().src;
  }
  
function changeTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme);
  updateAppleImageByTheme();
}

const themeObserver = new MutationObserver(muts => {
    muts.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        updateAppleImageByTheme();
      }
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true });

  // ➊ Multiplier aus Besitz errechnen (linear)
// ➋ Multiplier aus Besitz errechnen (sublinear)
function computeMultiplier() {
  let baseMultiplier = Object.keys(upgradeCounts).reduce((m, type) => {
    const count = upgradeCounts[type];
    const bonus = upgrades[type].bonusPerBuy || 0;
    return m * Math.pow(1 + bonus * count, 0.6); // sublineares Wachstum
  }, 1);

  baseMultiplier *= getClickMultiplier(); // für Klickkraft
  return baseMultiplier;
}




  // Game state
  let apples = 0;
  let clickPower = 1;
  let applesPerSecond = 0;
  let multiplier = 1;
  let prestigePoints = 0;
  let totalApplesCollected = 0;
  
  // Upgrade costs and multipliers
  const upgrades = {
    click:   { baseCost: 10, multiplier: 1.5, power: 1,   bonusPerBuy: 0.05 },
    auto:    { baseCost: 50, multiplier: 1.5, power: 0.2, bonusPerBuy: 0.02 },
    tree:    { baseCost: 200, multiplier: 1.5, power: 1,   bonusPerBuy: 0.05 },
    farm:    { baseCost: 1000, multiplier: 1.5, power: 5,  bonusPerBuy: 0.10 },
    factory: { baseCost: 5000, multiplier: 1.5, power: 25, bonusPerBuy: 0.15 }
  };
  
  // Upgrade counts
  const upgradeCounts = {
    click: 0,
    auto: 0,
    tree: 0,
    farm: 0,
    factory: 0
  };
  
  // DOM elements
  const appleCount = document.querySelector('.apple-count');
  const applesPerSecondDisplay = document.querySelector('.apples-per-second');
  const clickPowerDisplay = document.getElementById('clickPower');
  let totalApplesDisplay = document.getElementById('totalApples');
  if (!totalApplesDisplay) {
    totalApplesDisplay = document.createElement('div');
    totalApplesDisplay.style.display = 'none';
    document.body.appendChild(totalApplesDisplay);
  }
  const prestigePointsDisplay = document.getElementById('prestigePoints');
  const prestigePointsSummary = document.getElementById('prestigePointsSummary');
  const prestigeGainDisplay = document.getElementById('prestigeGain');
  const prestigeGainSummary = document.getElementById('prestigeGainSummary');
  const prestigeBtnGainDisplay = document.getElementById('prestigeBtnGain');
  const prestigeBtn = document.getElementById('prestigeBtn');
  const clickMultiplierDisplay = document.getElementById('clickMultiplier');
  const passiveMultiplierDisplay = document.getElementById('passiveMultiplier');
  const prestigeHeader = document.getElementById('prestigeHeader');
  const prestigeContent = document.getElementById('prestigeContent');
  const prestigeToggle = document.getElementById('prestigeToggle');

  // FIX: Add these lines to select the missing elements
  const appleClicker = document.querySelector('.apple-clicker');
  const upgradeCards = Array.from(document.querySelectorAll('.upgrade-card'));

   // Prestige menu state
  let prestigeExpanded = false;

   // Toggle prestige menu
  function togglePrestigeMenu() {
    prestigeExpanded = !prestigeExpanded;
    prestigeContent.classList.toggle('expanded', prestigeExpanded);
    prestigeToggle.classList.toggle('expanded', prestigeExpanded);
    
    // Save prestige menu state
    localStorage.setItem('prestigeMenuExpanded', prestigeExpanded);
  }
  
  // Initialize prestige menu state
  function initPrestigeMenu() {
    const savedState = localStorage.getItem('prestigeMenuExpanded');
    if (savedState === 'true') {
      prestigeExpanded = true;
      prestigeContent.classList.add('expanded');
      prestigeToggle.classList.add('expanded');
    }
  }
  
  // Calculate prestige points based on total apples collected
  function calculatePrestigeGain() {
    if (totalApplesCollected < 1000) return 0;
    return Math.floor(Math.sqrt(totalApplesCollected / 1000));
  }
  
  // Calculate multipliers from prestige points
  function getClickMultiplier() {
    return 1 + (prestigePoints * 0.1); // 10% increase per prestige point
  }
  
  function getPassiveMultiplier() {
    return 1 + (prestigePoints * 0.05); // 5% increase per prestige point
  }
  
  // Apply prestige multipliers
  function getEffectiveClickPower() {
    return Math.floor(clickPower * getClickMultiplier());
  }
  
  function getEffectiveApplesPerSecond() {
    return applesPerSecond * getPassiveMultiplier();
  }
  
  // Save game state
  function saveGame() {
    const gameState = {
      apples,
      totalApplesCollected,
      clickPower,
      applesPerSecond,
      prestigePoints,
      upgradeCounts: { ...upgradeCounts },
      lastSaved: Date.now()
    };
    localStorage.setItem('appleClickerSave', JSON.stringify(gameState));
  }
  
  // Load game state
  function loadGame() {
    const savedState = localStorage.getItem('appleClickerSave');
    if (savedState) {
      const state = JSON.parse(savedState);
      
      // Calculate offline progress
      const timeDiff = (Date.now() - state.lastSaved) / 1000; // Convert to seconds
      const offlineApples = Math.floor(state.applesPerSecond * timeDiff);
      
      // Restore state
      apples = state.apples + offlineApples;
      totalApplesCollected = state.totalApplesCollected + offlineApples;
      clickPower = state.clickPower;
      applesPerSecond = state.applesPerSecond;
      prestigePoints = state.prestigePoints || 0;
      Object.assign(upgradeCounts, state.upgradeCounts);
      
    }
  }

    window.resetGame = function() {
    localStorage.removeItem('appleClickerSave');
    apples = 0;
    clickPower = 1;
    applesPerSecond = 0;
    Object.keys(upgradeCounts).forEach(k => upgradeCounts[k] = 0);
    updateDisplays();
    console.log("Game reset done.");
  };

  
  // Format large numbers
  function formatNumber(num) {
    const units = [
      { value: 1e21, symbol: 'Sx' }, // Sextillion
      { value: 1e18, symbol: 'Qi' }, // Quintillion
      { value: 1e15, symbol: 'Qa' }, // Quadrillion
      { value: 1e12, symbol: 'T'  }, // Trillion
      { value: 1e9,  symbol: 'B'  }, // Billion
      { value: 1e6,  symbol: 'M'  }, // Million
      { value: 1e3,  symbol: 'K'  }  // Thousand
    ];
    for (let i = 0; i < units.length; i++) {
      if (num >= units[i].value) {
        return (num / units[i].value).toFixed(1) + units[i].symbol;
      }
    }
    return Math.floor(num);
  }
  
  // Update displays
  function updateDisplays() {
    appleCount.textContent = `${formatNumber(apples)} Äpfel`;
    const m = computeMultiplier();
    const realAPS = applesPerSecond * m;
    applesPerSecondDisplay.textContent = `${formatNumber(realAPS)} Äpfel pro Sekunde`;
    clickPowerDisplay.textContent = formatNumber(clickPower * m);
    totalApplesDisplay.textContent = formatNumber(totalApplesCollected);
    prestigePointsDisplay.textContent = formatNumber(prestigePoints);
    prestigePointsSummary.textContent = formatNumber(prestigePoints);

    // Update prestige gain
    const prestigeGain = calculatePrestigeGain();
    prestigeGainDisplay.textContent = formatNumber(prestigeGain);
    prestigeGainSummary.textContent = formatNumber(prestigeGain);
    prestigeBtnGainDisplay.textContent = formatNumber(prestigeGain);
    
    // Update multipliers
    clickMultiplierDisplay.textContent = `×${getClickMultiplier().toFixed(2)}`;
    passiveMultiplierDisplay.textContent = `×${getPassiveMultiplier().toFixed(2)}`;
    
    // Enable/disable prestige button
    prestigeBtn.disabled = prestigeGain === 0;
    
    // Update upgrade cards
    upgradeCards.forEach(card => {
      const type = card.dataset.upgrade;
      // FIX: Use current upgradeCounts for cost calculation
      const cost = Math.floor(upgrades[type].baseCost * Math.pow(upgrades[type].multiplier, upgradeCounts[type]));
      card.querySelector('.upgrade-cost').textContent = `${formatNumber(cost)} 🍎`;
      card.querySelector('.upgrade-count span').textContent = upgradeCounts[type];
      
      if (cost > apples) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }
    });
    
    // Save after each update
    saveGame();
  }
  
function createFloatingNumber(x, y, amount) {
  const themeImg = getAppleImageByTheme();

  const element = document.createElement('div');
  element.className = 'click-effect';
  element.style.left = `${x}px`;
  element.style.top = `${y-20}px`;
  
  // Bild hinzufügen
  const img = document.createElement('img');
  img.src = themeImg.src;
  img.style.width = '24px';    // Größe anpassen
  img.style.height = '24px';
  img.style.verticalAlign = 'middle';
  img.style.marginRight = '6px';

  // Text hinzufügen
  const text = document.createElement('span');
  text.textContent = `+${formatNumber(amount)}`;

  // Bild und Text zusammenfügen
  element.appendChild(img);
  element.appendChild(text);

  document.body.appendChild(element);

  setTimeout(() => element.remove(), 1000);
}

  
  // Handle apple click
    appleClicker.addEventListener('click', e => {
  const m = computeMultiplier();
  const gain = clickPower * m;
  apples += gain;
  totalApplesCollected += gain;
  createFloatingNumber(e.pageX, e.pageY, Math.floor(gain));
  updateDisplays();
});
  
  // Handle upgrade purchase
  upgradeCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('disabled')) return;
      
      const type = card.dataset.upgrade;
      const cost = Math.floor(upgrades[type].baseCost * Math.pow(upgrades[type].multiplier, upgradeCounts[type]));
      
      if (apples >= cost) {
        apples -= cost;
        upgradeCounts[type]++;
        
        if (type === 'click') {
     clickPower += upgrades[type].power;
   } else {
     applesPerSecond += upgrades[type].power;
   }
        
        // Add click effect animation
        const rect = card.getBoundingClientRect();
        createFloatingNumber(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          -cost
        );
        
        updateDisplays();
      }
    });
  });
  
   // Handle prestige menu toggle
  prestigeHeader.addEventListener('click', togglePrestigeMenu);
  
  // Handle prestige
  prestigeBtn.addEventListener('click', () => {
    const prestigeGain = calculatePrestigeGain();
    if (prestigeGain === 0) return;

    // Confirm prestige
    const confirmed = confirm(
      `Are you sure you want to prestige?\n\n` +
      `You will gain ${prestigeGain} Prestige Points.\n` +
      `This will reset all your apples and upgrades!\n\n` +
      `New multipliers:\n` +
      `• Click Power: ×${(1 + ((prestigePoints + prestigeGain) * 0.1)).toFixed(2)}\n` +
      `• Passive Generation: ×${(1 + ((prestigePoints + prestigeGain) * 0.05)).toFixed(2)}`
    );
    
    if (confirmed) {
      // Add prestige points
      prestigePoints += prestigeGain;
      
      // Reset progress
      apples = 0;
      totalApplesCollected = 0;
      clickPower = 1;
      applesPerSecond = 0;
      
      // Reset upgrade counts
      Object.keys(upgradeCounts).forEach(key => {
        upgradeCounts[key] = 0;
      });
      
      // Show prestige effect
      createFloatingNumber(
        window.innerWidth / 2,
        window.innerHeight / 2,
        `+${prestigeGain} PP!`
      );
      
      // FIX: Immediately update displays and save
      updateDisplays();
      
      alert(`Congratulations! You gained ${prestigeGain} Prestige Points!\nYour new multipliers are now active.`);
    }
  });

  // Auto-generate apples
  setInterval(() => {
    if (applesPerSecond > 0) {
      const effectiveAPS = getEffectiveApplesPerSecond();
      apples += effectiveAPS;
      totalApplesCollected += effectiveAPS;
      updateDisplays();
    }
  }, 1000);
  
  
  // Auto-save every 30 seconds
  setInterval(saveGame, 30000);
  
  // Load saved game on start
  initPrestigeMenu();
  loadGame();
   
 changeTheme('green');

  // Save game before page unload
  window.addEventListener('beforeunload', saveGame);
});