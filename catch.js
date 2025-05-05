// Äfpelfangen Script

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  let lastAppleTime = 0;
  const appleCooldown = 300; // in Millisekunden
  let score = 0;
  let gameOver = false;
  let gameStarted = false;
  let gameLoop;
  let lives = 3;
  
  function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.clientWidth - 20);
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (maxWidth * 2/3) + 'px';
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Korb properties
  const basket = {
    width: 80,
    height: 50,
    x: canvas.width / 2 - 40,
    y: canvas.height - 60
  };
  
  let apples = [];
  
  // Lade Bilder
  const basketImg = new Image();
  basketImg.src = 'basket-noto-512.png';
  
  const redAppleImg = new Image();
  redAppleImg.src = 'red-apple.svg';
  
  const greenAppleImg = new Image();
  greenAppleImg.src = 'gruenerApfel.png';
  
  const yellowAppleImg = new Image();
  yellowAppleImg.src = 'gelberApfel.png';
  
  
  // Apfel je nach Theme
  function getThemeAppleImage() {
    const theme = document.documentElement.getAttribute('data-theme') || 'red';
    if (theme === 'green') return greenAppleImg;
    if (theme === 'yellow') return yellowAppleImg;
    return redAppleImg;
  }
  
  function initGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    apples = [];
    basket.x = canvas.width / 2 - basket.width / 2;
    scoreElement.textContent = score;
  }
  
  // Neuer Apfel Erzeugen
  function createApple() {
    if (!gameStarted || gameOver) return;
    
    const apple = {
      x: Math.random() * (canvas.width - 30),
      y: -30,
      size: 30,
      speed: Math.min(Math.random() * 2 + 3 + Math.floor(score / 100)*0.5, 20)
    };
    
    apples.push(apple);
  }
  
  // Aktualisiert Spielzustand
  function updateGame() {
    if (gameOver) return;
    
    // Aktualisiert Äpfel
    for (let i = apples.length - 1; i >= 0; i--) {
      const apple = apples[i];
      apple.y += apple.speed;
      
      // Wenn Apfel Korb berührt
      if (apple.y + apple.size > basket.y &&
          apple.x + apple.size > basket.x &&
          apple.x < basket.x + basket.width) {
        score += 10;
        scoreElement.textContent = score;
        apples.splice(i, 1);
        continue;
      }
      
      // Wenn Apfel Boden berührt
      if (apple.y > canvas.height) {
        lives--;
        apples.splice(i, 1);
        
        if (lives <= 0) {
          gameOver = true;
        }
      }
    }
    
    // Neuer Apfel Zufällig
    // Apfel-Spawn-Chance steigt mit Score: +0.01 pro 1000 Punkte
  const baseChance = 0.04;
  const extraChance = Math.floor(score / 300) * 0.01;
  const spawnChance = Math.min(baseChance + extraChance, 0.2); // Optional: Begrenzung auf max. 20%

 // Max. Anzahl Äpfel abhängig vom Score: +1 Apfel pro 500 Punkte, max. 10 Äpfel
const maxApples = Math.min(2 + Math.floor(score / 300), 10);

const now = Date.now();
if (
  apples.length < maxApples &&
  Math.random() < spawnChance &&
  now - lastAppleTime > appleCooldown
) {
  createApple();
  lastAppleTime = now;
}

    drawGame();
  }
  
  function drawGame() {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);
    
    // Zeichne Äpfel
    const themedAppleImg = getThemeAppleImage();
    for (const apple of apples) {
      ctx.drawImage(themedAppleImg, apple.x, apple.y, apple.size, apple.size);
    }
    
    
    // Zeichen Leben
    ctx.font = '20px Arial';
    ctx.fillStyle = '#e74c3c';
    for (let i = 0; i < lives; i++) {
      ctx.fillText('❤️', 10 + i * 30, 30);
    }
    
    // GameOver
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
      ctx.font = '20px Arial';
      ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
      ctx.fillText('Press Reset to play again', canvas.width / 2, canvas.height / 2 + 45);
    }
  }
  
  // Maus Movement
  function moveBasket(clientX) {
    if (!gameStarted || gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const mouseX = (clientX - rect.left) * scale;
    
    // Korb bleibt innerhalb der Canva API
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, mouseX - basket.width / 2));
  }
  
  canvas.addEventListener('mousemove', (e) => moveBasket(e.clientX));
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    moveBasket(e.touches[0].clientX);
  }, { passive: false });
  
  // Start Knopf
  startBtn.addEventListener('click', () => {
    if (!gameStarted) {
      gameStarted = true;
      initGame();
      gameLoop = setInterval(updateGame, 1000/60); // 60 FPS
      startBtn.textContent = 'Pause';
    } else {
      if (gameOver) return;
      
      if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
        startBtn.textContent = 'Resume';
      } else {
        gameLoop = setInterval(updateGame, 1000/60);
        startBtn.textContent = 'Pause';
      }
    }
  });
  
  // Reset button
  resetBtn.addEventListener('click', () => {
    if (gameLoop) {
      clearInterval(gameLoop);
    }
    gameStarted = false;
    initGame();
    drawGame();
    startBtn.textContent = 'Start Game';
  });
  
  
  initGame();
  drawGame();
  
  // Kein Scrolling im Canva möglich
  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
});
