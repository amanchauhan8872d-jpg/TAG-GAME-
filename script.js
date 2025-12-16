let players = [];
let scores = [];
let itIndex = 0;
let time = 0;
let totalPlayers = 0;
let gameRunning = false;
let keys = {};
let powerUpActive = false;
let shrinkInterval = null;
let gameArea = document.getElementById("game-area");
let powerUpEl = document.getElementById("power-up");

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function startGame(count) {
  totalPlayers = count;
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-ui").style.display = "block";
  initPlayers();
  updateScoresUI();
  gameRunning = true;
  setInterval(updateTimer, 1000);
  setInterval(randomItSwitch, 10000);
  setTimeout(spawnPowerUp, 5000);
  shrinkInterval = setInterval(shrinkArena, 10000);
  requestAnimationFrame(gameLoop);
}

function initPlayers() {
  const positions = [
    { x: 50, y: 50 },
    { x: 700, y: 50 },
    { x: 50, y: 400 },
    { x: 700, y: 400 }
  ];

  players = [];
  scores = [];

  for (let i = 0; i < totalPlayers; i++) {
    let el = document.getElementById("player" + (i + 1));
    el.style.display = "flex";
    let p = {
      id: i + 1,
      el,
      x: positions[i].x,
      y: positions[i].y,
      speed: 4,
      hasPower: false,
    };
    players.push(p);
    scores.push(0);
  }

  for (let i = totalPlayers; i < 4; i++) {
    document.getElementById("player" + (i + 1)).style.display = "none";
  }

  itIndex = 0;
  document.getElementById("it-player").textContent = `Player ${players[itIndex].id}`;
  updatePositions();
}

function updatePositions() {
  players.forEach(p => {
    p.el.style.left = p.x + "px";
    p.el.style.top = p.y + "px";
  });
}

function movePlayers() {
  players.forEach(p => {
    let s = p.hasPower ? p.speed * 1.5 : p.speed;

    if (p.id === 1) {
      if (keys["w"]) p.y -= s;
      if (keys["s"]) p.y += s;
      if (keys["a"]) p.x -= s;
      if (keys["d"]) p.x += s;
    }
    if (p.id === 2) {
      if (keys["arrowup"]) p.y -= s;
      if (keys["arrowdown"]) p.y += s;
      if (keys["arrowleft"]) p.x -= s;
      if (keys["arrowright"]) p.x += s;
    }
    if (p.id === 3) {
      if (keys["i"]) p.y -= s;
      if (keys["k"]) p.y += s;
      if (keys["j"]) p.x -= s;
      if (keys["l"]) p.x += s;
    }
    if (p.id === 4) {
      if (keys["t"]) p.y -= s;
      if (keys["g"]) p.y += s;
      if (keys["f"]) p.x -= s;
      if (keys["h"]) p.x += s;
    }

    // Boundaries
    p.x = Math.max(0, Math.min(p.x, gameArea.clientWidth - 40));
    p.y = Math.max(0, Math.min(p.y, gameArea.clientHeight - 40));
    p.el.style.left = p.x + "px";
    p.el.style.top = p.y + "px";
  });
}

function checkTag() {
  const it = players[itIndex];
  players.forEach((p, idx) => {
    if (idx !== itIndex) {
      let dx = p.x - it.x;
      let dy = p.y - it.y;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        itIndex = idx;
        document.getElementById("it-player").textContent = `Player ${players[itIndex].id}`;
      }
    }
  });
}

function updateTimer() {
  if (!gameRunning) return;
  time++;
  document.getElementById("timer").textContent = time;

  // Score update
  players.forEach((p, idx) => {
    if (idx !== itIndex) scores[idx]++;
  });

  updateScoresUI();

  if (time >= 90) endGame();
}

function updateScoresUI() {
  let html = scores.map((s, i) => `P${i + 1}: ${s}`).join(' | ');
  document.getElementById("scores").innerHTML = html;
}

function spawnPowerUp() {
  if (powerUpActive) return;
  powerUpActive = true;
  let x = Math.random() * (gameArea.clientWidth - 30);
  let y = Math.random() * (gameArea.clientHeight - 30);
  powerUpEl.style.left = x + "px";
  powerUpEl.style.top = y + "px";
  powerUpEl.style.display = "block";
}

function checkPowerUpCollection() {
  if (!powerUpActive) return;
  players.forEach(p => {
    const dx = p.x - powerUpEl.offsetLeft;
    const dy = p.y - powerUpEl.offsetTop;
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
      p.hasPower = true;
      powerUpEl.style.display = "none";
      powerUpActive = false;

      // Power lasts 5 seconds
      setTimeout(() => {
        p.hasPower = false;
      }, 5000);

      // Respawn power-up
      setTimeout(spawnPowerUp, 8000);
    }
  });
}

function randomItSwitch() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * totalPlayers);
  } while (newIndex === itIndex);

  itIndex = newIndex;
  document.getElementById("it-player").textContent = `Player ${players[itIndex].id}`;
}

function shrinkArena() {
  let width = gameArea.clientWidth;
  let height = gameArea.clientHeight;
  if (width > 400 && height > 250) {
    gameArea.style.width = (width - 40) + "px";
    gameArea.style.height = (height - 25) + "px";
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(shrinkInterval);
  document.getElementById("game-over").style.display = "block";

  // Find winner
  let maxScore = Math.max(...scores);
  let winnerIndex = scores.indexOf(maxScore);

  document.getElementById("winner-name").textContent = `Player ${players[winnerIndex].id}`;
  document.getElementById("final-scores").textContent = scores.map((s, i) => `P${i + 1}: ${s}`).join(' | ');
}

function gameLoop() {
  if (!gameRunning) return;
  movePlayers();
  checkTag();
  checkPowerUpCollection();
  requestAnimationFrame(gameLoop);
}
