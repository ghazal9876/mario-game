const canvas = document.querySelector("#sceneCanvas");
const context = canvas.getContext("2d");
const hero = {
  x: 120,
  width: 42,
  height: 78,
  speed: 4,
  y: 0,
  velocityY: 0,
  gravity: 0.55,
  jumpStrength: 14,
  jumpsUsed: 0,
};
const keys = new Set();
const collectedCoins = new Set();
let score = 0;
let gameWon = false;
let gameOver = false;
let restartMessageTimer = 0;
let level = 1;
let level2Lives = 3;
let level3Lives = 2;
const fireballs = [
  { x: 0, y: 0, start: 0.25, radius: 17, initialized: false },
  { x: 0, y: 0, start: 0.58, radius: 17, initialized: false },
  { x: 0, y: 0, start: 0.82, radius: 17, initialized: false },
];
let level2StartX = 55;
const iceBalls = [
  { x: 0, y: 100, start: 0.3, speed: 2.2, radius: 20, initialized: false },
  { x: 0, y: 320, start: 0.58, speed: 2.8, radius: 20, initialized: false },
  { x: 0, y: 540, start: 0.82, speed: 2.4, radius: 20, initialized: false },
  { x: 0, y: 210, start: 0.14, speed: 2.6, radius: 20, initialized: false },
  { x: 0, y: 430, start: 0.7, speed: 2.1, radius: 20, initialized: false },
];
const playAgainButton = { x: 0, y: 0, width: 170, height: 44 };

function roundedRect(x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function drawCloud(x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(255, 255, 255, 0.94)";
  context.beginPath();
  context.arc(30, 30, 27, 0, Math.PI * 2);
  context.arc(65, 18, 38, 0, Math.PI * 2);
  context.arc(106, 31, 29, 0, Math.PI * 2);
  context.closePath();
  context.fill();
  roundedRect(8, 28, 120, 34, 17);
  context.restore();
}

function drawHeart(x, y, size) {
  context.save();
  context.translate(x, y);
  context.fillStyle = "#e53950";
  context.beginPath();
  context.moveTo(0, size * 0.82);
  context.bezierCurveTo(-size * 1.15, size * 0.12, -size * 0.55, -size * 0.5, 0, -size * 0.05);
  context.bezierCurveTo(size * 0.55, -size * 0.5, size * 1.15, size * 0.12, 0, size * 0.82);
  context.fill();
  context.restore();
}

function getPlatforms(width, height) {
  if (level === 3) {
    return [
      { x: width * 0.06, y: height * 0.62, width: 125, height: 14 },
      { x: width * 0.22, y: height * 0.48, width: 110, height: 14 },
      { x: width * 0.37, y: height * 0.64, width: 125, height: 14 },
      { x: width * 0.53, y: height * 0.39, width: 105, height: 14 },
      { x: width * 0.68, y: height * 0.56, width: 115, height: 14 },
      { x: width * 0.83, y: height * 0.34, width: 100, height: 14 },
    ];
  }
  if (level === 2) {
    return [
      { x: width * 0.07, y: height * 0.48, width: 170, height: 16, gear: true },
      { x: width * 0.24, y: height * 0.62, width: 165, height: 16, gear: true },
      { x: width * 0.36, y: height * 0.56, width: 190, height: 16, gear: true },
      { x: width * 0.6, y: height * 0.42, width: 190, height: 16, gear: true },
      { x: width * 0.77, y: height * 0.32, width: 160, height: 16, gear: true },
    ];
  }
  return [
    { x: width * 0.18, y: height * 0.67, width: 190, height: 16 },
    { x: width * 0.35, y: height * 0.58, width: 200, height: 16 },
    { x: width * 0.52, y: height * 0.49, width: 190, height: 16 },
    { x: width * 0.68, y: height * 0.4, width: 170, height: 16 },
  ];
}

function drawPlatforms(width, height) {
  for (const platform of getPlatforms(width, height)) {
    if (platform.gear) continue;
    context.fillStyle = "#b96d3c";
    context.fillRect(platform.x, platform.y, platform.width, platform.height);
    context.fillStyle = "#e6a54f";
    context.fillRect(platform.x, platform.y, platform.width, 6);
  }
}

function getCoins(width, height) {
  if (level === 3) {
    return [
      { x: width * 0.16, y: height * 0.55 }, { x: width * 0.27, y: height * 0.41 },
      { x: width * 0.42, y: height * 0.57 }, { x: width * 0.58, y: height * 0.32 },
      { x: width * 0.73, y: height * 0.49 }, { x: width * 0.88, y: height * 0.27 },
    ];
  }
  if (level === 2) {
    return [
      { x: width * 0.25, y: height * 0.59 },
      { x: width * 0.49, y: height * 0.45 },
      { x: width * 0.74, y: height * 0.38 },
      { x: width * 0.86, y: height * 0.27 },
    ];
  }
  return [
    { x: width * 0.27, y: height * 0.61 },
    { x: width * 0.45, y: height * 0.52 },
    { x: width * 0.63, y: height * 0.43 },
    { x: width * 0.76, y: height * 0.34 },
    { x: width * 0.86, y: height * 0.7 },
  ];
}

function drawLevel2Details(width, height, groundTop) {
  // Ice-world ground from the sketch: a solid strip with pointed ice along its top.
  context.fillStyle = "#d9f5ff";
  context.fillRect(0, groundTop, width, height - groundTop);
  context.fillStyle = "#8bd7f3";
  for (let x = 0; x < width; x += 42) {
    context.beginPath();
    context.moveTo(x, groundTop);
    context.lineTo(x + 21, groundTop + 32);
    context.lineTo(x + 42, groundTop);
    context.closePath();
    context.fill();
  }

  for (const gear of getPlatforms(width, height)) {
    const gearX = gear.x + gear.width / 2;
    const gearY = gear.y + 72;
    context.save();
    context.translate(gearX, gearY);
    context.fillStyle = "#b8e8f7";
    context.strokeStyle = "#4387a6";
    context.lineWidth = 5;
    context.beginPath();
    for (let i = 0; i < 24; i += 1) {
      const angle = (i * Math.PI) / 12;
      const radius = i % 2 ? 72 : 84;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = "#eafaff";
    context.beginPath();
    context.arc(0, 0, 20, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  // Horizontal main platforms resting on top of each gear wheel.
  for (const gear of getPlatforms(width, height)) {
    context.fillStyle = "#9edff3";
    context.fillRect(gear.x, gear.y, gear.width, 12);
    context.fillStyle = "#eafaff";
    context.fillRect(gear.x, gear.y, gear.width, 4);
    context.strokeStyle = "#4387a6";
    context.lineWidth = 3;
    context.strokeRect(gear.x, gear.y, gear.width, 12);
  }
}

function drawLevel2Exit(width, groundTop) {
  const x = width - 58;
  const exitBottom = groundTop - 120;
  context.fillStyle = "#72b9d6";
  context.fillRect(x, exitBottom - 82, 38, 82);
  context.fillStyle = "#eafaff";
  context.fillRect(x + 7, exitBottom - 68, 24, 45);
  context.fillStyle = "#4387a6";
  context.fillRect(x + 5, exitBottom - 16, 28, 6);
}

function drawLevel3Details(width, height, groundTop) {
  context.fillStyle = "#ef7951";
  context.fillRect(0, groundTop, width, height - groundTop);
  context.fillStyle = "#a93635";
  context.fillRect(0, groundTop, width, 10);
  for (let x = 0; x < width; x += 46) {
    context.fillStyle = x % 92 ? "#ffb347" : "#ffd05c";
    context.beginPath();
    context.arc(x + 18, groundTop + 38, 7, 0, Math.PI * 2);
    context.fill();
  }
  for (const platform of getPlatforms(width, height)) {
    context.fillStyle = "#543b52";
    context.fillRect(platform.x, platform.y, platform.width, platform.height);
    context.fillStyle = "#e76945";
    context.fillRect(platform.x, platform.y, platform.width, 5);
  }
  context.fillStyle = "#f7d34f";
  for (const x of [width * .31, width * .47, width * .79]) {
    context.beginPath(); context.moveTo(x, groundTop); context.lineTo(x + 13, groundTop - 22);
    context.lineTo(x + 26, groundTop); context.closePath(); context.fill();
  }
}

function updateFireballs(width, groundTop) {
  if (level !== 3) return;
  for (const ball of fireballs) {
    if (!ball.initialized) {
      ball.x = width * ball.start;
      ball.y = 90 + Math.random() * Math.max(40, groundTop - 180);
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.2 + Math.random() * 1.8;
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
      ball.initialized = true;
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.x < ball.radius || ball.x > width - ball.radius) {
      ball.vx *= -1;
      ball.vy += (Math.random() - 0.5) * 1.2;
      ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
    }
    if (ball.y < 55 || ball.y > groundTop - ball.radius - 12) {
      ball.vy *= -1;
      ball.vx += (Math.random() - 0.5) * 1.2;
      ball.y = Math.max(55, Math.min(groundTop - ball.radius - 12, ball.y));
    }
    const cx = hero.x + hero.width / 2;
    const cy = groundTop - hero.y - hero.height / 2;
    if (Math.hypot(cx - ball.x, cy - ball.y) < ball.radius + 20) loseLevel3Life(width, groundTop);
  }
}

function drawFireballs() {
  if (level !== 3) return;
  for (const ball of fireballs) {
    context.fillStyle = "#ffb52e"; context.strokeStyle = "#9d2e2e"; context.lineWidth = 4;
    context.beginPath(); context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); context.fill(); context.stroke();
    context.fillStyle = "#fff1a3"; context.beginPath(); context.arc(ball.x - 5, ball.y - 5, 5, 0, Math.PI * 2); context.fill();
  }
}

function updateIceBalls(width, groundTop) {
  if (level !== 2) return;
  for (const ball of iceBalls) {
    if (!ball.initialized) {
      ball.x = width * ball.start;
      ball.initialized = true;
    }
    ball.y += ball.speed;
    if (ball.y - ball.radius > groundTop) ball.y = -ball.radius;
    const heroCenterX = hero.x + hero.width / 2;
    const heroCenterY = groundTop - hero.y - hero.height / 2;
    if (Math.hypot(heroCenterX - ball.x, heroCenterY - ball.y) < ball.radius + 20) {
      loseLevel2Life(width, groundTop);
    }
  }
}

function drawIceBalls() {
  if (level !== 2) return;
  for (const ball of iceBalls) {
    context.fillStyle = "#75c9ed";
    context.strokeStyle = "#2879aa";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#eafaff";
    context.beginPath();
    context.arc(ball.x - 5, ball.y - 5, 4, 0, Math.PI * 2);
    context.fill();
  }
}

function drawCoins(width, height) {
  for (const [index, coin] of getCoins(width, height).entries()) {
    if (collectedCoins.has(index)) continue;
    context.fillStyle = "#ffd447";
    context.strokeStyle = "#c9871d";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(coin.x, coin.y, 11, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#fff1a3";
    context.fillRect(coin.x - 3, coin.y - 7, 3, 8);
  }
}

function drawFlag(width, groundTop) {
  const flagX = width - 92;
  context.strokeStyle = "#6d4935";
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(flagX, groundTop);
  context.lineTo(flagX, groundTop - 142);
  context.stroke();
  context.fillStyle = "#f2c94c";
  context.beginPath();
  context.arc(flagX, groundTop - 148, 7, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ed527d";
  context.beginPath();
  context.moveTo(flagX + 3, groundTop - 140);
  context.lineTo(flagX + 62, groundTop - 119);
  context.lineTo(flagX + 3, groundTop - 99);
  context.closePath();
  context.fill();
}

function placeHeroAtLevel2Start(width, groundTop) {
  const firstPlatform = getPlatforms(width, window.innerHeight)[0];
  level2StartX = firstPlatform.x + firstPlatform.width / 2 - hero.width / 2;
  hero.x = level2StartX;
  hero.y = groundTop - firstPlatform.y;
  hero.velocityY = 0;
  hero.jumpsUsed = 0;
}

function loseLevel2Life(width, groundTop) {
  if (restartMessageTimer > 0 || gameOver || gameWon) return;
  level2Lives -= 1;
  if (level2Lives === 0) {
    gameOver = true;
    return;
  }
  placeHeroAtLevel2Start(width, groundTop);
  restartMessageTimer = 75;
}

function placeHeroAtLevel3Start(width, groundTop) {
  const first = getPlatforms(width, window.innerHeight)[0];
  hero.x = first.x + 12; hero.y = groundTop - first.y; hero.velocityY = 0; hero.jumpsUsed = 0;
}

function loseLevel3Life(width, groundTop) {
  if (restartMessageTimer > 0 || gameOver || gameWon) return;
  level3Lives -= 1;
  if (level3Lives <= 0) { gameOver = true; return; }
  placeHeroAtLevel3Start(width, groundTop); restartMessageTimer = 75;
}

function checkWin(width, groundTop) {
  if (level === 1 && hero.x + hero.width >= width - 100) {
    level = 2;
    placeHeroAtLevel2Start(width, groundTop);
    collectedCoins.clear();
    return;
  }
  if (level === 2 && hero.x + hero.width >= width - 75) {
    level = 3; level3Lives = 2; collectedCoins.clear(); placeHeroAtLevel3Start(width, groundTop);
    return;
  }
  if (level === 3 && !gameWon && hero.x + hero.width >= width - 65) gameWon = true;
}

function collectCoins(width, groundTop) {
  for (const [index, coin] of getCoins(width, window.innerHeight).entries()) {
    if (collectedCoins.has(index)) continue;
    const heroCenterX = hero.x + hero.width / 2;
    const heroCenterY = groundTop - hero.y - hero.height / 2;
    if (Math.hypot(heroCenterX - coin.x, heroCenterY - coin.y) < 30) {
      collectedCoins.add(index);
      score += 1;
    }
  }
}

function drawHero(x, groundTop) {
  const footY = groundTop;
  const center = x + hero.width / 2;

  context.save();
  context.lineWidth = 2;
  context.strokeStyle = "#34243d";

  // Pink dress and little sleeves.
  context.fillStyle = "#f26dba";
  context.beginPath();
  context.moveTo(center - 10, footY - 48);
  context.lineTo(center - 22, footY - 4);
  context.quadraticCurveTo(center, footY + 3, center + 22, footY - 4);
  context.lineTo(center + 10, footY - 48);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = "#f78bc9";
  context.beginPath();
  context.ellipse(center - 14, footY - 40, 8, 4, -0.35, 0, Math.PI * 2);
  context.ellipse(center + 14, footY - 40, 8, 4, 0.35, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  // Short blonde hair behind the face.
  context.fillStyle = "#f1c44f";
  context.beginPath();
  context.ellipse(center, footY - 61, 15, 22, 0, 0, Math.PI * 2);
  context.fill();

  // Face and front hair.
  context.fillStyle = "#f6c6a7";
  context.beginPath();
  context.arc(center, footY - 61, 12, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#f1c44f";
  context.beginPath();
  context.arc(center, footY - 67, 13, Math.PI, Math.PI * 2);
  context.lineTo(center + 12, footY - 61);
  context.lineTo(center - 12, footY - 61);
  context.closePath();
  context.fill();

  // Crown, eyes, and shoes.
  context.fillStyle = "#ffd34e";
  context.beginPath();
  context.moveTo(center - 9, footY - 77);
  context.lineTo(center - 5, footY - 84);
  context.lineTo(center, footY - 78);
  context.lineTo(center + 5, footY - 84);
  context.lineTo(center + 9, footY - 77);
  context.closePath();
  context.fill();
  context.fillStyle = "#34243d";
  context.beginPath();
  context.arc(center - 5, footY - 62, 2, 0, Math.PI * 2);
  context.arc(center + 5, footY - 62, 2, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#b45d75";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(center, footY - 57, 3, 0.15, Math.PI - 0.15);
  context.stroke();
  context.fillStyle = "#4c315a";
  context.fillRect(center - 10, footY - 2, 8, 4);
  context.fillRect(center + 2, footY - 2, 8, 4);
  context.restore();
}

function updateHero(width, groundTop) {
  const direction = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
  hero.x = Math.max(0, Math.min(width - hero.width, hero.x + direction * hero.speed));
  collectCoins(width, groundTop);
  checkWin(width, groundTop);
  updateIceBalls(width, groundTop);
  updateFireballs(width, groundTop);
  if (restartMessageTimer > 0) restartMessageTimer -= 1;

  const oldFoot = groundTop - hero.y;
  const wasAirborne = hero.y > 0;
  if (hero.y > 0 || hero.velocityY > 0) {
    hero.velocityY -= hero.gravity;
    hero.y += hero.velocityY;

    const newFoot = groundTop - hero.y;
    if (hero.velocityY <= 0) {
      for (const platform of getPlatforms(width, window.innerHeight)) {
        const overlaps = hero.x + hero.width > platform.x && hero.x < platform.x + platform.width;
        if (overlaps && oldFoot <= platform.y && newFoot >= platform.y) {
          hero.y = groundTop - platform.y;
          hero.velocityY = 0;
          hero.jumpsUsed = 0;
          break;
        }
      }
    }

    if (hero.y <= 0) {
      if ((level === 2 || level === 3) && wasAirborne && hero.velocityY <= 0) {
        if (level === 3) loseLevel3Life(width, groundTop); else loseLevel2Life(width, groundTop);
        return;
      }
      hero.y = 0;
      hero.velocityY = 0;
      hero.jumpsUsed = 0;
    }
  }
}

function drawScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const groundHeight = Math.max(120, height * 0.2);
  const groundTop = height - groundHeight;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  // Sky gradient.
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, level === 2 ? "#b8ecff" : level === 3 ? "#ff9b70" : "#51c9f1");
  sky.addColorStop(0.72, level === 2 ? "#e8fbff" : level === 3 ? "#ffd08a" : "#a7e7f7");
  sky.addColorStop(1, "#d5f4f6");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  // Static clouds at different depths.
  drawCloud(width * 0.12, height * 0.16, 1.05);
  drawCloud(width * 0.65, height * 0.1, 0.82);
  drawCloud(width * 0.42, height * 0.32, 0.65);
  drawCloud(width * 0.86, height * 0.4, 0.56);

  // Solid ground strip along the bottom.
  context.fillStyle = "#57bd4f";
  context.fillRect(0, groundTop, width, groundHeight);
  context.fillStyle = "#38923d";
  context.fillRect(0, groundTop, width, 12);
  if (level === 2) drawLevel2Details(width, height, groundTop);
  if (level === 3) drawLevel3Details(width, height, groundTop);
  drawPlatforms(width, height);
  drawCoins(width, height);
  if (level === 1) drawFlag(width, groundTop);
  if (level === 2) {
    drawIceBalls();
    drawLevel2Exit(width, groundTop);
  }
  if (level === 3) drawFireballs();
  hero.x = Math.max(0, Math.min(width - hero.width, hero.x));
  drawHero(hero.x, groundTop - hero.y);
  context.fillStyle = "#ffffff";
  context.font = "bold 22px sans-serif";
  context.shadowColor = "rgba(0, 0, 0, 0.25)";
  context.shadowBlur = 4;
  context.fillText(`Coins: ${score}`, 20, 34);
  context.fillText(`LEVEL ${level}`, width - 120, 34);
  if (level === 2 || level === 3) {
    const heartSize = 14;
    const heartGap = 34;
    const heartsStartX = width / 2 - ((level2Lives - 1) * heartGap) / 2;
    const lives = level === 3 ? level3Lives : level2Lives;
    for (let index = 0; index < lives; index += 1) {
      drawHeart(heartsStartX + index * heartGap, 28, heartSize);
    }
  }
  context.shadowBlur = 0;

  if (gameWon || gameOver) {
    context.fillStyle = "rgba(28, 35, 76, 0.8)";
    context.fillRect(width / 2 - 210, height / 2 - 105, 420, 210);
    context.fillStyle = "#ffe16b";
    context.font = "bold 42px sans-serif";
    context.textAlign = "center";
    context.fillText(gameWon ? "YOU WIN!" : "GAME OVER", width / 2, height / 2 - 30);

    playAgainButton.x = width / 2 - playAgainButton.width / 2;
    playAgainButton.y = height / 2 + 15;
    context.fillStyle = "#ed527d";
    context.fillRect(playAgainButton.x, playAgainButton.y, playAgainButton.width, playAgainButton.height);
    context.fillStyle = "#ffffff";
    context.font = "bold 18px sans-serif";
    context.fillText("PLAY AGAIN", width / 2, playAgainButton.y + 29);
    context.textAlign = "start";
  }

  if (restartMessageTimer > 0 && !gameWon) {
    context.fillStyle = "rgba(28, 35, 76, 0.82)";
    context.fillRect(width / 2 - 150, height * 0.2 - 38, 300, 76);
    context.fillStyle = "#ffffff";
    context.font = "bold 34px sans-serif";
    context.textAlign = "center";
    context.fillText("RESTART", width / 2, height * 0.2 + 12);
    context.textAlign = "start";
  }
}

drawScene();
window.addEventListener("resize", drawScene);

function gameLoop() {
  updateHero(window.innerWidth, window.innerHeight - Math.max(120, window.innerHeight * 0.2));
  drawScene();
  requestAnimationFrame(gameLoop);
}
gameLoop();

window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    event.preventDefault();
    if (!event.repeat && hero.jumpsUsed < 2) {
      hero.velocityY = hero.jumpStrength;
      hero.jumpsUsed += 1;
    }
    return;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

canvas.addEventListener("click", (event) => {
  if (!gameWon && !gameOver) return;
  const bounds = canvas.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const insideButton = x >= playAgainButton.x && x <= playAgainButton.x + playAgainButton.width &&
    y >= playAgainButton.y && y <= playAgainButton.y + playAgainButton.height;
  if (!insideButton) return;

  if (level === 2) {
    level2Lives = 3;
    placeHeroAtLevel2Start(window.innerWidth, window.innerHeight - Math.max(120, window.innerHeight * 0.2));
  } else if (level === 3) {
    level3Lives = 2; fireballs.forEach((ball) => { ball.initialized = false; });
    placeHeroAtLevel3Start(window.innerWidth, window.innerHeight - Math.max(120, window.innerHeight * 0.2));
  } else {
    hero.x = 120;
    hero.y = 0;
    hero.velocityY = 0;
    hero.jumpsUsed = 0;
  }
  collectedCoins.clear();
  score = 0;
  gameWon = false;
  gameOver = false;
});
