//Snake Spiel
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  
const redAppleImg = new Image();
redAppleImg.src = 'red-apple.svg';

const greenAppleImg = new Image();
greenAppleImg.src = 'gruenerApfel.png';

const yellowAppleImg = new Image();
yellowAppleImg.src = 'gelberApfel.png';

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  let snake = [];
  let apple = { x: 0, y: 0 };
  let velocityX = 0;
  let velocityY = 0;
  let score = 0;
  let gameOver = false;
  let gameStarted = false;
  let gameLoop;

  let touchStartX = 0;
  let touchStartY = 0;
  
  // Apfel je nach Theme
  function getThemeAppleImage() {
    const theme = document.documentElement.getAttribute('data-theme') || 'red';
    if (theme === 'green') return greenAppleImg;
    if (theme === 'yellow') return yellowAppleImg;
    return redAppleImg;
  }
  
  

  function initGame() {
    snake = [{ x: 10, y: 10 }];
    placeApple();
    score = 0;
    velocityX = 0;
    velocityY = 0;
    gameOver = false;
    scoreElement.textContent = score;
  }
  
  // Apfel erzeugen
  function placeApple() {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);
    for (let i = 0; i < snake.length; i++) {
      if (apple.x === snake[i].x && apple.y === snake[i].y) {
        placeApple();
        break;
      }
    }
  }
  
  function gameUpdate() {
    if (gameOver) {
      return;
    }
    
    // Bewegt die Schlagne
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    
    // Gameover Überprüfen
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver = true;
      return;
    }
    
    // Gameover wenn er gegen sich selbst Stößt
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver = true;
        return;
      }
    }
    
    // Neuer Kopf
    snake.unshift(head);
    
    if (head.x === apple.x && head.y === apple.y) {
      score++;
      scoreElement.textContent = score;
      placeApple();
    } else {
      snake.pop();
    }
    

    drawGame();
  }
  

  function drawGame() {
  
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Zeichnet Schlange
    ctx.fillStyle = '#27ae60';
    for (let i = 0; i < snake.length; i++) {
      ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Zeichnet Apfel
      const scale = 1.2; // z. B. 1.5 für noch größer
      const size = gridSize * scale;
      const offset = (size - gridSize) / 2;

      function drawApple() {
        const appleImg = getThemeAppleImage();
        ctx.drawImage(
          appleImg,
          apple.x * gridSize,
          apple.y * gridSize,
          gridSize,
          gridSize
        );
      }
      drawApple();


    
    // Draw game over message
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
      ctx.fillText('Press Reset to play again', canvas.width / 2, canvas.height / 2 + 45);
    }
  }
  
  // Steuerung
  document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    

    switch (e.key) {
    case 'ArrowUp':
    case 'w':
      if (velocityY !== 1) {
      velocityX = 0;
      velocityY = -1;
        }
      break;
    case 'ArrowDown':
    case 's':
      if (velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
        }
      break;

    case 'ArrowLeft':
    case 'a':
      if (velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
        }
    break;
    case 'ArrowRight':
    case 'd':
        if (velocityX !== -1) {
          velocityX = 1;
          velocityY = 0;
        }
        break;
    }
  });
  
  // Steuerung Handy/Ipad etc.
  canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    if (!gameStarted || !touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Swipe RIchtung
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontaler swipe
      if (deltaX > 0 && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
      } else if (deltaX < 0 && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
      }
    } else {
      // Vertikaler swipe
      if (deltaY > 0 && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
      } else if (deltaY < 0 && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
      }
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
    e.preventDefault();
  }, { passive: false });
  
  // Start Knopf
  startBtn.addEventListener('click', () => {
    if (!gameStarted) {
      gameStarted = true;
      initGame();
      velocityX = 1;
      velocityY = 0;
      gameLoop = setInterval(gameUpdate, 150);
      startBtn.textContent = 'Pause';
    } else {
      if (gameOver) return;
      
      if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
        startBtn.textContent = 'Weiter';
      } else {
        gameLoop = setInterval(gameUpdate, 150);
        startBtn.textContent = 'Pause';
      }
    }
  });
  
  // Reset Knopf
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
  
  // Damit man nicht scrollt wenn man den Canvas berührt
  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
});
