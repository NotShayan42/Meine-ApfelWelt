// Äpfelschießen Skript

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.clientWidth - 20);
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (maxWidth * 2/3) + 'px';
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  let score = 0;
  let gameOver = false;
  let gameStarted = false;
  let gameLoop;
  let timeLeft = 60; // 60 Sekunden Zeit
  let apples = [];
  let arrows = [];
  let bow = {
    x: 50,
    y: canvas.height / 2,
    width: 50,
    height: 15
  };
  
  // Lade Bilder
  const bowImg = new Image();
  bowImg.src = 'BowFlatIcon.png';

  const redAppleImg = new Image();
  redAppleImg.src = 'red-apple.svg';
  
  const greenAppleImg = new Image();
  greenAppleImg.src = 'gruenerApfel.png';;

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
    gameOver = false;
    timeLeft = 60;
    apples = [];
    arrows = [];
    scoreElement.textContent = score;
  }
  
  // Erzeugt neuen Apfel
  function createApple() {
    if (!gameStarted || gameOver) return;
    
    const size = Math.random() * 20 + 30; // Zufällige Größe
    const apple = {
      x: canvas.width + size,
      y: Math.random() * (canvas.height - 100) + 50,
      size: size,
      speed: Math.random() * 4 + 3, // ZUfällige Geschwindigkeit
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
    
    apples.push(apple);
  }
  
  // Schießt Pfeil
  function shootArrow(clientX, clientY) {
    if (!gameStarted || gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const mouseX = (clientX - rect.left) * scale;
    const mouseY = (clientY - rect.top) * scale;
    
    // Berechnet Winkel
    const angle = Math.atan2(mouseY - bow.y, mouseX - bow.x);
    
    const arrow = {
      x: bow.x + bow.width,
      y: bow.y,
      speed: 10,
      angle: angle,
      width: 30,
      height: 5
    };
    
    arrows.push(arrow);
  }
  
  
  function updateGame() {
    if (gameOver) return;
    
    timeLeft -= 1/60; //60 FPS
    if (timeLeft <= 0) {
      gameOver = true;
      return;
    }
    
    for (let i = apples.length - 1; i >= 0; i--) {
      apples[i].x -= apples[i].speed;
      apples[i].rotation += apples[i].rotationSpeed;
      
      if (apples[i].x + apples[i].size < 0) {
        apples.splice(i, 1);
      }
    }
    
    // Pfeile Aktualisieren
    for (let i = arrows.length - 1; i >= 0; i--) {
      arrows[i].x += Math.cos(arrows[i].angle) * arrows[i].speed;
      arrows[i].y += Math.sin(arrows[i].angle) * arrows[i].speed;
      
      // Pfeile entfernen
      if (arrows[i].x > canvas.width || arrows[i].y < 0 || arrows[i].y > canvas.height) {
        arrows.splice(i, 1);
        continue;
      }
      
      // Wenn Pfeil getroffen wird
      for (let j = apples.length - 1; j >= 0; j--) {
        const apple = apples[j];
        const arrow = arrows[i];
        
        // Einfache Überprüfung
        const dx = (apple.x + apple.size/2) - (arrow.x + arrow.width/2);
        const dy = (apple.y + apple.size/2) - (arrow.y + arrow.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < apple.size/2 + 10) {
          // Getroffen
          score += Math.floor(apple.size / 5); // kleinere Äpfel sind mehr Wert
          scoreElement.textContent = score;
          apples.splice(j, 1);
          arrows.splice(i, 1);
          break;
        }
      }
    }
    
    // Erzeugt zufällig neue Äpfel
    if (Math.random() < 0.06) {
      createApple();
    }
    
    drawGame();
  }
  
  function drawGame() {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Zeichne Bogen
    ctx.save();
    ctx.translate(bow.x, bow.y);
    ctx.drawImage(bowImg, 0, -bow.height, bow.width, bow.height * 2);
    ctx.restore();
    
    // Zeichne Pfeile
    ctx.fillStyle = '#8B4513';
    for (const arrow of arrows) {
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(arrow.angle);
      ctx.fillRect(0, -arrow.height/2, arrow.width, arrow.height);
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(arrow.width, -arrow.height);
      ctx.lineTo(arrow.width + 10, 0);
      ctx.lineTo(arrow.width, arrow.height);
      ctx.fill();
      ctx.restore();
    }

// Zeichne Äpfel
const appleImg = getThemeAppleImage();

for (const apple of apples) {
  ctx.save();
  ctx.translate(apple.x + apple.size / 2, apple.y + apple.size / 2);
  ctx.rotate(apple.rotation);
  ctx.drawImage(appleImg, -apple.size / 2, -apple.size / 2, apple.size, apple.size);
  ctx.restore();
}


    
    // Zeit
    ctx.font = '16px Arial';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${Math.ceil(timeLeft)}s`, canvas.width - 20, 30);
    
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
  function moveBow(clientY) {
    if (!gameStarted) return;
    
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.height / rect.height;
    bow.y = (clientY - rect.top) * scale;
    
    if (bow.y < bow.height) bow.y = bow.height;
    if (bow.y > canvas.height - bow.height) bow.y = canvas.height - bow.height;
  }
  
  // Maus Events
  canvas.addEventListener('mousemove', (e) => moveBow(e.clientY));
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    moveBow(e.touches[0].clientY);
  }, { passive: false });
  
  canvas.addEventListener('click', (e) => shootArrow(e.clientX, e.clientY));
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    shootArrow(touch.clientX, touch.clientY);
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
  
  // Reset Knopf
  resetBtn.addEventListener('click', () => {
    if (gameLoop) {
      clearInterval(gameLoop);
    }
    gameStarted = false;
    initGame();
    drawGame();
    startBtn.textContent = 'Starte Spiel';
  });
  
  initGame();
  drawGame();
  
  // Kein Scrolling innerhalb der Canva
  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
});
