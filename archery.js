// Apple Archery Game Script

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const gameContainer = document.getElementById('gameContainerArchery');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');

function enterFullscreen() {
  gameContainer.classList.add('fullscreen');
  fullscreenBtn.style.display = 'none';
  exitFullscreenBtn.style.display = 'inline-block';

  // ⛔ KEINE Änderung von canvas.width / height!
  // ✅ Nur visuelle Skalierung:
  canvas.style.width = '47vw';
  canvas.style.height = '85vh';

  drawGame(); // Optional neu zeichnen
}


function exitFullscreen() {
  gameContainer.classList.remove('fullscreen');
  fullscreenBtn.style.display = 'inline-block';
  exitFullscreenBtn.style.display = 'none';

  canvas.style.width = '';
  canvas.style.height = '';

  drawGame(); // Optional neu zeichnen
}


fullscreenBtn.addEventListener('click', enterFullscreen);
exitFullscreenBtn.addEventListener('click', exitFullscreen);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && gameContainer.classList.contains('fullscreen')) {
    exitFullscreen();
  }
});
  
  // Make canvas responsive
  function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.clientWidth - 20);
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (maxWidth * 2/3) + 'px';
  }
  
  // Call resize on load and window resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Game variables
  // Game variables
  let score = 0;
  let gameOver = false;
  let gameStarted = false;
  let gameLoop;
  let lives = 5;
  let combo = 0;
  let activePowerup = null;
  let powerupTimer = null;
  let autoShootInterval = null;
  let powerupCooldown = false;
  let apples = [];
  let arrows = [];
  let particles = [];
  let explosions = [];
  let bow = {
    x: 50,
    y: canvas.height / 2,
    width: 50,
    height: 15
  };

  // Load images
  const bowImg = new Image();
  bowImg.src = 'BowFlatIcon.png';

  const redAppleImg = new Image();
  redAppleImg.src = 'red-apple.svg';
  
  const greenAppleImg = new Image();
  greenAppleImg.src = 'gruenerApfel.png';

  const yellowAppleImg = new Image();
  yellowAppleImg.src = 'gelberApfel.png';

  const rainbowAppleImg = new Image();
  rainbowAppleImg.src = 'rainbowapple.png';

  const galaxyAppleImg = new Image();
  galaxyAppleImg.src = 'Galaxyappel.png';;

  const camoAppleImg = new Image();
  camoAppleImg.src = 'camoapple.png';
  
  function getAppleImageByTheme() {
    const theme = document.documentElement.getAttribute('data-theme') || 'red';
    if (theme === 'green') return greenAppleImg;
    if (theme === 'yellow') return yellowAppleImg;
      if (theme === 'rainbow') return rainbowAppleImg;
    return redAppleImg; // fallback
  }
  
  // Apple types with emojis
  const appleTypes = {
    normal:  { get image() {
      return getAppleImageByTheme();
    },
    size: 40,
    speed: 3,
    points: 10 },
    large:   { image: camoAppleImg, size: 55, speed: 3, points: 5 },
    special: { image: galaxyAppleImg,  size: 35, speed: 3, points: 50 }
  };
  
  // Initialize game
   function initGame() {
    score = 0;
    lives = 5;
    combo = 0;
    gameOver = false;
    apples = [];
    arrows = [];
    particles = [];
    explosions = [];
    activePowerup = null;
    powerupCooldown = false;
    if (powerupTimer) clearTimeout(powerupTimer);
    if (autoShootInterval) clearInterval(autoShootInterval);
    scoreElement.textContent = score;
    enablePowerupButtons(true);
  }
  
  // Create particles
  function createParticles(x, y, color = 'grey', count = 10) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        color,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        life: 1
      });
    }
  }
  
  // Update particles
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.life -= 0.02;
      
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // Create explosion
  function createExplosion(x, y) {
    explosions.push({
      x,
      y,
      radius: 0,
      maxRadius: 400,
      life: 1
    });
  }

  // Update explosions
  function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const explosion = explosions[i];
      explosion.radius += 5;
      explosion.life -= 0.02;
      
      if (explosion.life <= 0) {
        explosions.splice(i, 1);
        continue;
      }
      
      // Check for apples in explosion radius
      for (let j = apples.length - 1; j >= 0; j--) {
        const apple = apples[j];
        const dx = (apple.x + apple.size/2) - explosion.x;
        const dy = (apple.y + apple.size/2) - explosion.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < explosion.radius + apple.size/2) {
          createParticles(apple.x, apple.y, apple.emoji);
          combo++;
          const comboMultiplier = Math.max(1, Math.log2(combo + 1));
          score += Math.round(apple.points * comboMultiplier);
          scoreElement.textContent = score;
          apples.splice(j, 1);
        }
      }
    }
  }
  
  // Create a new apple
  function createApple() {
    if (!gameStarted || gameOver) return;
    
    const types = Object.keys(appleTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const props = appleTypes[type];
    
    const randomSize = Math.random() * 15 + 40;
    const adjustedSpeed = props.speed + Math.min(score / 10000, 8)


    const apple = {
      x: canvas.width + props.size,
      y: Math.random() * (canvas.height - 100) + 50,
      type,
      ...props,
      rotation: 0,
      size: randomSize,
      speed: adjustedSpeed,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      glow: type === 'special' || type === 'large',
 // oder je nach Wunsch
      glowPhase: 0             // <- Wichtig für den Glow!
    };    
    
    apples.push(apple);
  }
  
  // Shoot arrow
  function shootArrow(clientX, clientY) {
    if (!gameStarted || gameOver) return;
    
    const arrowSize = activePowerup === 'bigArrow' ? 5 : 1;
    const isExplosive = activePowerup === 'explosive';
    
    if (activePowerup === 'multiShot') {
      // Shoot 3 arrows with slight spread
      for (let i = -1; i <= 1; i++) {
        arrows.push({
          x: bow.x + bow.width,
          y: bow.y,
          velocityX: 15,
          velocityY: i * 2,
          width: 30 * arrowSize,
          height: 5 * arrowSize,
          explosive: isExplosive
        });
      }
    } else {
      arrows.push({
        x: bow.x + bow.width,
        y: bow.y,
        velocityX: 15,
        velocityY: 0,
        width: 30 * arrowSize,
        height: 5 * arrowSize,
        explosive: isExplosive
      });
    }
  }
  
  // Auto shoot function
  function autoShoot() {
    if (!gameStarted || gameOver) return;
    const targetY = apples.length > 0 ? apples[0].y : canvas.height / 2;
    bow.y = targetY;
    shootArrow(canvas.width, targetY);
  }
  
  // Enable/disable powerup buttons
  function enablePowerupButtons(enabled) {
    document.querySelectorAll('.powerup-btn').forEach(btn => {
      btn.disabled = !enabled || powerupCooldown;
      btn.style.opacity = enabled && !powerupCooldown ? '1' : '0.5';
    });
  }
  
  // Activate powerup
  function activatePowerup(type) {
    if (activePowerup || !gameStarted || gameOver || powerupCooldown) return;
    
    activePowerup = type;
    enablePowerupButtons(false);
    
    if (type === 'autoShoot') {
      autoShootInterval = setInterval(autoShoot, 100); // Faster auto-shooting (100ms)
    }
    
    powerupTimer = setTimeout(() => {
      activePowerup = null;
      if (autoShootInterval) {
        clearInterval(autoShootInterval);
        autoShootInterval = null;
      }
      
      // Start cooldown
      powerupCooldown = true;
      setTimeout(() => {
        powerupCooldown = false;
        enablePowerupButtons(true);
      }, 7000); // 7 second cooldown
    }, 10000);
  }
  
  // Update game state
  function updateGame() {
    if (gameOver) return;
    
    // Update apples
    for (let i = apples.length - 1; i >= 0; i--) {
      const apple = apples[i];
      apple.x -= apple.speed;
      apple.rotation += apple.rotationSpeed;
      if (apple.glow) {
        apple.glowPhase = (apple.glowPhase + 0.05) % (Math.PI * 2);
      }
      
      // Remove apples that are off screen
      if (apple.x + apple.size < 0) {
        apples.splice(i, 1);
        lives--;
        combo = 0;
        
        if (lives <= 0) {
          gameOver = true;
          if (autoShootInterval) {
            clearInterval(autoShootInterval);
            autoShootInterval = null;
          }
        }
      }
    }
    
    // Update arrows
    for (let i = arrows.length - 1; i >= 0; i--) {
      const arrow = arrows[i];
      arrow.x += arrow.velocityX;
      arrow.y += arrow.velocityY;
      
      // Remove arrows that are off screen
      if (arrow.x > canvas.width || arrow.y < 0 || arrow.y > canvas.height) {
        arrows.splice(i, 1);
        continue;
      }
      
      // Check for collisions with apples
      for (let j = apples.length - 1; j >= 0; j--) {
        const apple = apples[j];
        const dx = (apple.x + apple.size/2) - (arrow.x + arrow.width/2);
        const dy = (apple.y + apple.size/2) - (arrow.y + arrow.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < apple.size/2 + arrow.height) {
          // Hit!
          createParticles(apple.x, apple.y, apple.emoji);
          if (arrow.explosive) {
            createExplosion(apple.x + apple.size/2, apple.y + apple.size/2);
          }
          combo++;
          const comboMultiplier = Math.max(1, Math.log2(combo + 1));
          score += Math.round(apple.points * comboMultiplier);
          scoreElement.textContent = score;
          apples.splice(j, 1);
          arrows.splice(i, 1);
          break;
        }
      }
    }
    
    // Update particles
    updateParticles();
    updateExplosions();
    
    // Randomly create new apples
    let baseChance = 0.02;           // Startwahrscheinlichkeit = 2%
    let maxChance = 0.05;             // Maximal 20% Spawnchance
    let incrementPerScore = 0.01 / 15000;         // Wie stark die Wahrscheinlichkeit mit dem Score wächst

// Dynamische Spawnchance, begrenzt auf maxChance
    let dynamicChance = Math.min(baseChance + score * incrementPerScore, maxChance);

    if (Math.random() < dynamicChance) {
      createApple();
    }


    
    // Draw everything
    drawGame();
  }
  
  // Draw game
  function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw explosions
    ctx.save();
    for (const explosion of explosions) {
      const gradient = ctx.createRadialGradient(
        explosion.x, explosion.y, 0,
        explosion.x, explosion.y, explosion.radius
      );
      gradient.addColorStop(0, `rgba(255, 69, 0, ${explosion.life})`);
      gradient.addColorStop(0.5, `rgba(255, 140, 0, ${explosion.life * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // Draw bow
    ctx.save();
    ctx.translate(bow.x, bow.y);
    ctx.drawImage(bowImg, 0, -bow.height, bow.width, bow.height * 2);
    ctx.restore();
    
    // Draw arrows
    ctx.fillStyle = '#8B4513';
    for (const arrow of arrows) {
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(Math.atan2(arrow.velocityY, arrow.velocityX));
      ctx.fillRect(0, -arrow.height/2, arrow.width, arrow.height);

      // Draw arrow shaft
      ctx.fillStyle = arrow.explosive ? '#ff4500' : '#8B4513';
      ctx.fillRect(0, -arrow.height/2, arrow.width, arrow.height);

      // Draw arrow head
      ctx.beginPath();
      ctx.moveTo(arrow.width, -arrow.height);
      ctx.lineTo(arrow.width + 10, 0);
      ctx.lineTo(arrow.width, arrow.height);
      ctx.fill();
      
      if (arrow.explosive) {
        // Draw explosive indicator
        ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(arrow.width/2, 0, arrow.height * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }

    
  // Draw apples
for (const apple of apples) {
  ctx.save();
  ctx.translate(apple.x + apple.size / 2, apple.y + apple.size / 2);
  ctx.rotate(apple.rotation);

  // Optional: Glow-Effekt
  if (apple.glow) {
    const glowIntensity = Math.sin(apple.glowPhase) * 0.5 + 0.5;
    ctx.shadowColor = apple.type === 'large' ? 'purple' : 'yellow';
    ctx.shadowBlur = 15 * glowIntensity;
  } else {
    ctx.shadowBlur = 0;
  }

  // Apfel zeichnen
  ctx.drawImage(apple.image, -apple.size / 2, -apple.size / 2, apple.size, apple.size);

  // Optional: Emoji überlagern
  if (apple.emoji) {
    ctx.font = `${apple.size}px Arial`;
    ctx.fillText(apple.emoji, -apple.size / 2, apple.size / 2);
  }

  ctx.restore();
}

    
    // Draw particles
    for (const particle of particles) {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw lives
    ctx.font = '24px Arial';
    ctx.fillStyle = '#e74c3c';
    for (let i = 0; i < lives; i++) {
      ctx.fillText('❤️', 20 + i * 30, 30);
    }
    
    // Draw combo
    if (combo > 1) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#e67e22';
      const multiplier = Math.max(1, Math.log2(combo + 1)).toFixed(1);
      ctx.fillText(`Combo x${combo} (${multiplier}x)`, canvas.width - 150, 30);
    }
    
    // Draw active powerup
    if (activePowerup) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#3498db';
      ctx.fillText(`${activePowerup} active!`, 20, 60);
    }
    
    // Draw game over message
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
  
  // Handle mouse/touch movement
  function moveBow(clientY) {
    if (!gameStarted || gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.height / rect.height;
    bow.y = (clientY - rect.top) * scale;
    
    // Keep bow within canvas
    if (bow.y < bow.height) bow.y = bow.height;
    if (bow.y > canvas.height - bow.height) bow.y = canvas.height - bow.height;
  }
  
  canvas.addEventListener('mousemove', (e) => moveBow(e.clientY));
  canvas.addEventListener('click', (e) => shootArrow(e.clientX, e.clientY));
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    moveBow(e.touches[0].clientY);
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    shootArrow(touch.clientX, touch.clientY);
  }, { passive: false });
  
  // Add powerup button event listeners
  document.querySelectorAll('.powerup-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const powerupType = btn.dataset.powerup;
      activatePowerup(powerupType);
    });
  });
  
  // Start button
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
  
  // Initial draw
  initGame();
  drawGame();
  
  // Prevent scrolling when touching the canvas
  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
});