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
  jumpStrength: 11,
};
const keys = new Set();

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
  context.ellipse(center, footY - 62, 14, 17, 0, 0, Math.PI * 2);
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

  if (hero.y > 0 || hero.velocityY > 0) {
    hero.velocityY -= hero.gravity;
    hero.y += hero.velocityY;
    if (hero.y <= 0) {
      hero.y = 0;
      hero.velocityY = 0;
    }
  }
}

function drawScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  // Sky gradient.
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#51c9f1");
  sky.addColorStop(0.72, "#a7e7f7");
  sky.addColorStop(1, "#d5f4f6");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  // Static clouds at different depths.
  drawCloud(width * 0.12, height * 0.16, 1.05);
  drawCloud(width * 0.65, height * 0.1, 0.82);
  drawCloud(width * 0.42, height * 0.32, 0.65);
  drawCloud(width * 0.86, height * 0.4, 0.56);

  // Solid ground strip along the bottom.
  const groundHeight = Math.max(120, height * 0.2);
  const groundTop = height - groundHeight;
  context.fillStyle = "#57bd4f";
  context.fillRect(0, groundTop, width, groundHeight);
  context.fillStyle = "#38923d";
  context.fillRect(0, groundTop, width, 12);
  hero.x = Math.max(0, Math.min(width - hero.width, hero.x));
  drawHero(hero.x, groundTop - hero.y);
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
    if (!event.repeat && hero.y === 0) hero.velocityY = hero.jumpStrength;
    return;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  keys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});
