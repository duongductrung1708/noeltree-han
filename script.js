const mainSvg = document.querySelector(".mainSVG");
const pContainer = document.querySelector(".pContainer");
const sparkle = document.querySelector(".sparkle");
const treePathEl = document.querySelector(".treePath");
const treeBottomPathEl = document.querySelector(".treeBottomPath");
const treePathMask = document.querySelector(".treePathMask");
const treePotMask = document.querySelector(".treePotMask");
const treeBottomMask = document.querySelector(".treeBottomMask");
const starTemplate = document.querySelector("#star");
const merryText = document.querySelector(".merryText");
const merryTextBg = document.querySelector(".merryTextBg");
const snowman = document.querySelector(".snowman");
const santa = document.querySelector(".santa");

const colors = [
  "#E8F6F8",
  "#ACE8F8",
  "#F6FBFE",
  "#A2CBDC",
  "#B74551",
  "#5DBA72",
  "#910B28",
  "#446D39",
];

const particlePool = [];
let poolIndex = 0;
const poolSize = 200;
const currentPos = { x: 0, y: -100 };

let snowCanvas;
let snowCtx;
let snowWidth = 0;
let snowHeight = 0;
let snowFlakes = [];
const snowCount = 160;

const greetings = [
  "MERRY CHRISTMAS HANG!",
  "CHÚC GIÁNG SINH AN LÀNH!",
  "MÃI YÊU EM!",
  "CHÚC VỢ LUÔN VUI VẺ VÀ KHỎE MẠNH!",
  "ANH LUÔN Ở BÊN VỢ!"
];
const typingSpeed = 80;
const messagePause = 1500;

function setVisible() {
  if (mainSvg) {
    mainSvg.style.visibility = "visible";
  }
}

function drawStroke(el, duration, delay) {
  if (!el) return;
  const length = el.getTotalLength();
  el.style.strokeDasharray = length;
  el.style.strokeDashoffset = length;

  anime({
    targets: el,
    strokeDashoffset: [length, 0],
    duration,
    delay,
    easing: "linear",
  });
}

function createParticles() {
  for (let i = 0; i < poolSize; i += 1) {
    const clone = starTemplate.cloneNode(true);
    clone.setAttribute("fill", colors[i % colors.length]);
    clone.classList.add("particle");
    clone.style.opacity = 0;
    mainSvg.appendChild(clone);
    particlePool.push(clone);
  }
}

function emitParticle() {
  const p = particlePool[poolIndex];
  poolIndex = (poolIndex + 1) % poolSize;

  const spreadX = anime.random(-60, 60);
  const spreadY = anime.random(-60, 60);
  const scaleStart = anime.random(5, 20) / 10;
  const rotate = anime.random(-180, 360);
  const duration = anime.random(900, 1800);

  anime.remove(p);
  anime({
    targets: p,
    translateX: [currentPos.x, currentPos.x + spreadX],
    translateY: [currentPos.y, currentPos.y + spreadY],
    scale: [scaleStart, scaleStart * 0.2],
    rotate,
    opacity: [
      { value: 1, duration: 0 },
      { value: 0, duration },
    ],
    easing: "easeOutQuad",
    duration,
  });
}

function startEmitter() {
  setInterval(emitParticle, 80);
}

function moveStar() {
  const topPath = anime.path(treePathEl);
  const bottomPath = anime.path(treeBottomPathEl);

  anime
    .timeline({
      loop: true,
      easing: "linear",
      duration: 4000,
    })
    .add({
      targets: [pContainer, sparkle],
      translateX: topPath("x"),
      translateY: topPath("y"),
    })
    .add({
      targets: [pContainer, sparkle],
      translateX: bottomPath("x"),
      translateY: bottomPath("y"),
      duration: 1500,
    });

  anime({
    targets: {},
    duration: Infinity,
    easing: "linear",
    update() {
      const x = anime.get(pContainer, "translateX") || 0;
      const y = anime.get(pContainer, "translateY") || 0;
      currentPos.x = x;
      currentPos.y = y;
    },
  });
}

function fadeInText() {
  anime({
    targets: [".treeStarOutline", ".messageText"],
    opacity: [0, 1],
    duration: 1200,
    delay: 2500,
    easing: "easeInOutSine",
    complete: startMessageLoop
  });
}

function init() {
  setVisible();
  setCharacterPositions();
  drawStroke(treePathMask, 1800, 400);
  drawStroke(treePotMask, 800, 2200);
  drawStroke(treeBottomMask, 800, 2200);
  createParticles();
  startEmitter();
  moveStar();
  fadeInText();
  startSnow();
  animateCharacters();
}

document.addEventListener("DOMContentLoaded", init);

async function startMessageLoop() {
  if (!merryText || !merryTextBg) return;
  // ensure empty before starting loop
  merryText.textContent = "";
  merryTextBg.textContent = "";
  while (true) {
    // eslint-disable-next-line no-restricted-syntax
    for (const message of greetings) {
      await typeMessage(message);
      await pause(messagePause);
    }
  }
}

function typeMessage(message) {
  return new Promise((resolve) => {
    let idx = 0;
    const timer = setInterval(() => {
      if (idx <= message.length) {
        const value = message.slice(0, idx);
        merryText.textContent = value;
        merryTextBg.textContent = value;
        idx += 1;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, typingSpeed);
  });
}

function pause(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function startSnow() {
  snowCanvas = document.createElement("canvas");
  snowCanvas.className = "snow-canvas";
  document.body.prepend(snowCanvas);
  snowCtx = snowCanvas.getContext("2d");
  handleResize();
  window.addEventListener("resize", handleResize);
  snowFlakes = Array.from({ length: snowCount }, createFlake);
  requestAnimationFrame(drawSnow);
}

function handleResize() {
  snowWidth = window.innerWidth;
  snowHeight = window.innerHeight;
  snowCanvas.width = snowWidth;
  snowCanvas.height = snowHeight;
}

function createFlake() {
  return {
    x: Math.random() * snowWidth,
    y: Math.random() * snowHeight,
    r: Math.random() * 2 + 1,
    vy: Math.random() * 0.7 + 0.6,
    vx: Math.random() * 0.6 - 0.3,
    drift: Math.random() * 1.2 + 0.4,
  };
}

function resetFlake(flake) {
  flake.x = Math.random() * snowWidth;
  flake.y = -flake.r;
  flake.vy = Math.random() * 0.7 + 0.6;
  flake.vx = Math.random() * 0.6 - 0.3;
}

function drawSnow() {
  snowCtx.clearRect(0, 0, snowWidth, snowHeight);
  const time = Date.now() * 0.001;

  snowFlakes.forEach((flake) => {
    flake.y += flake.vy;
    flake.x += flake.vx + Math.sin(time + flake.drift) * 0.2;

    if (flake.y > snowHeight) {
      resetFlake(flake);
    }
    if (flake.x > snowWidth) {
      flake.x = 0;
    } else if (flake.x < 0) {
      flake.x = snowWidth;
    }

    snowCtx.beginPath();
    snowCtx.fillStyle = "rgba(255,255,255,0.85)";
    snowCtx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    snowCtx.fill();
  });

  requestAnimationFrame(drawSnow);
}

function animateCharacters() {
  if (snowman) {
    const { x, y } = getBaseTranslate(snowman, 620, 500);
    anime.set(snowman, { translateX: x, translateY: y });
    anime({
      targets: snowman,
      translateX: x,
      translateY: [y, y - 6],
      duration: 2600,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
    });
    anime({
      targets: snowman,
      opacity: [0, 0.9],
      duration: 1200,
      easing: "easeOutQuad",
      delay: 400,
    });
  }
  if (santa) {
    const { x, y } = getBaseTranslate(santa, 180, 500);
    anime.set(santa, { translateX: x, translateY: y });
    anime({
      targets: santa,
      translateX: x,
      translateY: [y, y - 5],
      duration: 2400,
      easing: "easeInOutSine",
      direction: "alternate",
      loop: true,
      delay: 200,
    });
    anime({
      targets: santa,
      opacity: [0, 0.9],
      duration: 1200,
      easing: "easeOutQuad",
      delay: 600,
    });
  }
}

function setCharacterPositions() {
  // Position characters relative to the 800x700 viewBox
  if (snowman) {
    snowman.setAttribute("transform", "translate(620 500)");
  }
  if (santa) {
    santa.setAttribute("transform", "translate(180 500)");
  }
}

function getBaseTranslate(el, defaultX, defaultY) {
  const t = el.getAttribute("transform");
  const match = t && t.match(/translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)/i);
  if (match) {
    const [, sx, sy] = match;
    return { x: parseFloat(sx), y: parseFloat(sy) };
  }
  return { x: defaultX, y: defaultY };
}
