// ================== BASIC PAGE SETUP ================== 
 
 
const yearEl = document.getElementById("year"); 
const yearFooterEl = document.getElementById("year-footer"); 
const now = new Date(); 
if (yearEl) yearEl.textContent = now.getFullYear(); 
if (yearFooterEl) yearFooterEl.textContent = now.getFullYear(); 
 
 
const pageWrapper = document.querySelector(".page-wrapper"); 
 
 
// ================== MODAL MANAGEMENT ================== 
 
 
const modalFlappy = document.getElementById("modal-flappy"); 
const modalMines = document.getElementById("modal-mines"); 
const modalTable = document.getElementById("modal-table"); 
const modalPacman = document.getElementById("modal-pacman"); 
const modalSnake = document.getElementById("modal-snake");
 
 
let flappyVisible = false; 
let minesVisible = false; 
let tableVisible = false; 
let pacmanVisible = false; 
let snakeVisible = false; 
 
 
function blurPage(on) {
  if (!pageWrapper) return;

  if (on) {
    pageWrapper.classList.add("blurred");
    document.body.classList.add("modal-open");   // lock scroll
  } else {
    pageWrapper.classList.remove("blurred");
    document.body.classList.remove("modal-open"); // unlock scroll
  }
}
 
 
function anyModalOpen() { 
  return ( 
    flappyVisible || 
    minesVisible || 
    tableVisible || 
    pacmanVisible || 
    snakeVisible
  ); 
} 
 
 
function openModal(modalName) {
  if (modalName === "flappy" && modalFlappy) {
    modalFlappy.classList.remove("hidden");
    flappyVisible = true;
    fb_resetGame();
  }
  if (modalName === "mines" && modalMines) {
    modalMines.classList.remove("hidden");
    minesVisible = true;
    ms_makeBoard();
  }
  if (modalName === "table" && modalTable) {
    modalTable.classList.remove("hidden");
    tableVisible = true;
    tt_resetGame();
  }
  if (modalName === "pacman" && modalPacman) {
    modalPacman.classList.remove("hidden");
    pacmanVisible = true;
    pm_resetGame();
    if (pm_monsterTimer) {
      clearInterval(pm_monsterTimer);
    }
    pm_monsterTimer = setInterval(() => {
      if (!pacmanVisible || pm_gameOver) return;
      pm_moveMonster();
    }, 250);
  }
  if (modalName === "snake" && modalSnake) {
    modalSnake.classList.remove("hidden");
    snakeVisible = true;
    sn_resetGame();
    sn_startLoop();
  }

  blurPage(true);
}
 
 
function closeModal(modalName) {
  if (modalName === "flappy" && modalFlappy) {
    modalFlappy.classList.add("hidden");
    flappyVisible = false;
    fb_setRunning(false);
  }
  if (modalName === "mines" && modalMines) {
    modalMines.classList.add("hidden");
    minesVisible = false;
  }
  if (modalName === "table" && modalTable) {
    modalTable.classList.add("hidden");
    tableVisible = false;
  }
  if (modalName === "pacman" && modalPacman) {
    modalPacman.classList.add("hidden");
    pacmanVisible = false;
    if (pm_monsterTimer) {
      clearInterval(pm_monsterTimer);
      pm_monsterTimer = null;
    }
  }
  if (modalName === "snake" && modalSnake) {
    modalSnake.classList.add("hidden");
    snakeVisible = false;
    sn_stopLoop();
  }

  if (!anyModalOpen()) {
    blurPage(false);
  }
}
 
 
function closeAllModals() { 
  closeModal("flappy"); 
  closeModal("mines"); 
  closeModal("table"); 
  closeModal("pacman"); 
  closeModal("snake");
} 
 
 
// Open from cards / buttons 
document.querySelectorAll("[data-game]").forEach((el) => {
  el.addEventListener("click", () => {
    const game = el.getAttribute("data-game");
    if (
      [
        "flappy",
        "mines",
        "table",
        "pacman",
        "snake",   // NEW
      ].includes(game)
    ) {
      openModal(game);
    }
  });
});
 
 
// Close from backdrop / close button 
document.querySelectorAll("[data-close]").forEach((el) => { 
  el.addEventListener("click", () => { 
    const m = el.getAttribute("data-close"); 
    closeModal(m); 
  }); 
}); 
 
 
// ESC closes current modal(s) 
document.addEventListener("keydown", (e) => { 
  if (e.key === "Escape" && anyModalOpen()) { 
    closeAllModals(); 
  } 
}); 
 
 
// ================== FLAPPY RETRO ================== 
 
 
const fb_container = document.getElementById("fb-game-container"); 
const fb_bird = document.getElementById("fb-bird"); 
const fb_scoreEl = document.getElementById("fb-score"); 
const fb_messageEl = document.getElementById("fb-message"); 
 
 
let fb_birdY = 0; 
let fb_velocity = 0; 
let fb_gravity = 0.5; 
let fb_lift = -8; 
let fb_running = false; 
let fb_gameOver = false; 
let fb_pipes = []; 
let fb_lastTime = 0; 
let fb_pipeTimerMs = 0; 
let fb_score = 0; 
 
 
function fb_setRunning(running) { 
  fb_running = running; 
} 
 
 
function fb_resetGame(showIntro = true) { 
  if (!fb_container || !fb_bird) return; 
  const rect = fb_container.getBoundingClientRect(); 
  fb_birdY = rect.height / 2; 
  fb_velocity = 0; 
 
  fb_pipes.forEach((p) => { 
    if (p.topEl.parentNode) p.topEl.parentNode.removeChild(p.topEl); 
    if (p.bottomEl.parentNode) 
p.bottomEl.parentNode.removeChild(p.bottomEl); 
  }); 
  fb_pipes = []; 
  fb_pipeTimerMs = 0; 
  fb_score = 0; 
  fb_gameOver = false; 
 
  if (fb_scoreEl) fb_scoreEl.textContent = "0"; 
 
  if (fb_messageEl) { 
    fb_messageEl.textContent = showIntro 
      ? "Click or press Space to start. Don’t hit the pipes or the ground." 
      : ""; 
  } 
 
  fb_setRunning(false); 
} 
 
 
function fb_spawnPipe() { 
  if (!fb_container) return; 
  const rect = fb_container.getBoundingClientRect(); 
  const gap = 150; // bigger gaps 
  const minTop = 40; 
  const maxTop = rect.height - gap - 40; 
  const topHeight = minTop + Math.random() * (maxTop - minTop); 
  const bottomY = topHeight + gap; 
 
 
  const topEl = document.createElement("div"); 
  topEl.className = "fb-pipe top"; 
  topEl.style.left = rect.width + "px"; 
  topEl.style.top = "0px"; 
  topEl.style.height = topHeight + "px"; 
 
 
  const bottomEl = document.createElement("div"); 
  bottomEl.className = "fb-pipe bottom"; 
  bottomEl.style.left = rect.width + "px"; 
  bottomEl.style.top = bottomY + "px"; 
  bottomEl.style.height = rect.height - bottomY + "px"; 
 
 
  fb_container.appendChild(topEl); 
  fb_container.appendChild(bottomEl); 
 
 
  fb_pipes.push({ x: rect.width, topEl, bottomEl, passed: false }); 
} 
 
 
function fb_update(dt) { 
  if (!flappyVisible || !fb_container || !fb_bird) return; 
  const rect = fb_container.getBoundingClientRect(); 
 
 
  if (!fb_running || fb_gameOver) return; 
 
 
  fb_velocity += fb_gravity * dt; 
  fb_birdY += fb_velocity * dt; 
 
 
  // ground / ceiling 
  const birdHeight = fb_bird.offsetHeight || 18; 
  if (fb_birdY < birdHeight / 2) { 
    fb_birdY = birdHeight / 2; 
    fb_velocity = 0; 
  } 
  if (fb_birdY > rect.height - birdHeight / 2) { 
    fb_birdY = rect.height - birdHeight / 2; 
    fb_gameOver = true; 
    if (fb_messageEl) fb_messageEl.textContent = "Game Over – Click or Space to restart"; 
    return; 
  } 
 
 
  fb_bird.style.top = fb_birdY + "px"; 
 
 
  // pipes 
  fb_pipeTimerMs += dt * 16.67; 
  if (fb_pipeTimerMs > 1400) { 
    fb_spawnPipe(); 
    fb_pipeTimerMs = 0; 
  } 
 
 
  const birdX = fb_bird.offsetLeft + fb_bird.offsetWidth / 2; 
  const birdY = fb_birdY; 
  const birdR = birdHeight / 2; 
 
 
  fb_pipes.forEach((pipe) => { 
    pipe.x -= 3 * dt; 
    pipe.topEl.style.left = pipe.x + "px"; 
    pipe.bottomEl.style.left = pipe.x + "px"; 
 
 
    const pipeWidth = pipe.topEl.offsetWidth; 
    const pipeLeft = pipe.x; 
    const pipeRight = pipe.x + pipeWidth; 
    const topBottom = pipe.topEl.offsetHeight; 
    const bottomTop = parseFloat(pipe.bottomEl.style.top); 
 
 
    // Score 
    if (!pipe.passed && pipeRight < birdX) { 
      pipe.passed = true; 
      fb_score++; 
      if (fb_scoreEl) fb_scoreEl.textContent = String(fb_score); 
    } 
 
 
    // Collision 
    const inX = birdX + birdR > pipeLeft && birdX - birdR < pipeRight; 
    const hitTop = birdY - birdR < topBottom; 
    const hitBottom = birdY + birdR > bottomTop; 
    if (inX && (hitTop || hitBottom)) { 
      fb_gameOver = true; 
      if (fb_messageEl) fb_messageEl.textContent = "Game Over – Click or Space to restart"; 
    } 
  }); 
 
 
  fb_pipes = fb_pipes.filter((p) => p.x + p.topEl.offsetWidth > 0); 
} 
 
 
function fb_loop(timestamp) { 
  const dt = (timestamp - fb_lastTime) / 16.67; 
  fb_lastTime = timestamp; 
 
 
  if (flappyVisible) { 
    fb_update(dt); 
  } 
 
 
  requestAnimationFrame(fb_loop); 
} 
requestAnimationFrame(fb_loop); 
 
 
function fb_flap() { 
  if (!flappyVisible) return; 
 
  // If game is over, reset WITHOUT intro message and immediately start 
  if (fb_gameOver) { 
    fb_resetGame(false);       // no "press Space to start" text 
    fb_setRunning(true); 
    fb_velocity = fb_lift; 
    return; 
  } 
 
  // First start from idle 
  if (!fb_running) { 
    fb_setRunning(true); 
    if (fb_messageEl) fb_messageEl.textContent = ""; 
  } 
 
  // Normal flap 
  fb_velocity = fb_lift; 
} 
 
 
 
if (fb_container) { 
  fb_container.addEventListener("click", () => { 
    fb_flap(); 
  }); 
} 
 
 
document.addEventListener("keydown", (e) => { 
  if (!flappyVisible) return; 
  if (e.code === "Space") { 
    e.preventDefault(); 
    fb_flap(); 
  } 
}); 
 
 
// ================== MINESWEEPER ================== 
 
 
const ms_boardEl = document.getElementById("ms-board"); 
const ms_rowsInput = document.getElementById("ms-rows"); 
const ms_colsInput = document.getElementById("ms-cols"); 
const ms_minesInput = document.getElementById("ms-mines"); 
const ms_newBtn = document.getElementById("ms-newBtn"); 
const ms_resetBtn = document.getElementById("ms-resetBtn"); 
const ms_statsEl = document.getElementById("ms-stats"); 
const ms_messageEl = document.getElementById("ms-message"); 
 
 
let ms_rows = 10, 
  ms_cols = 10, 
  ms_mines = 15; 
let ms_grid = []; 
let ms_gameOver = false; 
let ms_flags = 0; 
let ms_revealedCount = 0; 
 
 
function ms_clamp(v, min, max) { 
  return Math.max(min, Math.min(max, v)); 
} 
 
 
function ms_makeBoard() { 
  if (!ms_boardEl) return; 
 
 
  ms_rows = ms_clamp(parseInt(ms_rowsInput.value) || 10, 5, 14); 
  ms_cols = ms_clamp(parseInt(ms_colsInput.value) || 10, 5, 14); 
  ms_mines = ms_clamp( 
    parseInt(ms_minesInput.value) || 15, 
    1, 
    ms_rows * ms_cols - 1 
  ); 
 
 
  ms_boardEl.style.gridTemplateColumns = `repeat(${ms_cols}, 32px)`; 
  ms_boardEl.innerHTML = ""; 
  ms_grid = new Array(ms_rows * ms_cols) 
    .fill(null) 
    .map(() => ({ 
      mine: false, 
      revealed: false, 
      flag: false, 
      adj: 0, 
      el: null, 
    })); 
 
 
  ms_gameOver = false; 
  ms_flags = 0; 
  ms_revealedCount = 0; 
  if (ms_statsEl) 
    ms_statsEl.textContent = `Mines: ${ms_mines} | Flags: ${ms_flags}`; 
  if (ms_messageEl) 
    ms_messageEl.textContent = 
      "Right-click to place a red flag. Left-click to reveal. Reveal a mine and you lose."; 
 
 
  for (let r = 0; r < ms_rows; r++) { 
    for (let c = 0; c < ms_cols; c++) { 
      const idx = r * ms_cols + c; 
      const cell = document.createElement("div"); 
      cell.className = "ms-cell unrevealed"; 
      cell.dataset.index = String(idx); 
 
 
      cell.addEventListener("click", () => { 
        if (!minesVisible || ms_gameOver) return; 
        ms_reveal(idx); 
      }); 
      cell.addEventListener("contextmenu", (e) => { 
        e.preventDefault(); 
        if (!minesVisible || ms_gameOver) return; 
        ms_flag(idx); 
      }); 
 
 
      ms_boardEl.appendChild(cell); 
      ms_grid[idx].el = cell; 
    } 
  } 
 
 
  // place mines 
  let placed = 0; 
  while (placed < ms_mines) { 
    const i = Math.floor(Math.random() * ms_grid.length); 
    if (!ms_grid[i].mine) { 
      ms_grid[i].mine = true; 
      placed++; 
    } 
  } 
 
 
  // adjacency 
  for (let r = 0; r < ms_rows; r++) { 
    for (let c = 0; c < ms_cols; c++) { 
      const idx = r * ms_cols + c; 
      if (ms_grid[idx].mine) continue; 
      let a = 0; 
      for (let dr = -1; dr <= 1; dr++) { 
        for (let dc = -1; dc <= 1; dc++) { 
          if (dr === 0 && dc === 0) continue; 
          const rr = r + dr; 
          const cc = c + dc; 
          if ( 
            rr >= 0 && 
            rr < ms_rows && 
            cc >= 0 && 
            cc < ms_cols && 
            ms_grid[rr * ms_cols + cc].mine 
          ) 
            a++; 
        } 
      } 
      ms_grid[idx].adj = a; 
    } 
  } 
} 
 
 
function ms_reveal(i) { 
  const c = ms_grid[i]; 
  if (!c || c.revealed || c.flag) return; 
  c.revealed = true; 
  ms_revealedCount++; 
  const el = c.el; 
  el.classList.remove("unrevealed"); 
  el.classList.add("revealed"); 
 
 
  if (c.mine) { 
    el.classList.add("mine"); 
    el.textContent = "💣"; 
    ms_end(false); 
    return; 
  } 
 
 
  if (c.adj > 0) { 
    el.textContent = c.adj; 
    el.classList.add("number-" + c.adj); 
  } else { 
    const r = Math.floor(i / ms_cols); 
    const cc = i % ms_cols; 
    for (let dr = -1; dr <= 1; dr++) { 
      for (let dc = -1; dc <= 1; dc++) { 
        if (dr === 0 && dc === 0) continue; 
        const rr = r + dr; 
        const cc2 = cc + dc; 
        if (rr >= 0 && rr < ms_rows && cc2 >= 0 && cc2 < ms_cols) { 
          ms_reveal(rr * ms_cols + cc2); 
        } 
      } 
    } 
  } 
  ms_checkWin(); 
} 
 
 
function ms_flag(i) { 
  const c = ms_grid[i]; 
  if (!c || c.revealed) return; 
  c.flag = !c.flag; 
  const el = c.el; 
  if (c.flag) { 
    el.classList.add("flag"); 
    el.textContent = "🚩"; 
    ms_flags++; 
  } else { 
    el.classList.remove("flag"); 
    el.textContent = ""; 
    ms_flags--; 
  } 
  if (ms_statsEl) 
    ms_statsEl.textContent = `Mines: ${ms_mines} | Flags: ${ms_flags}`; 
  ms_checkWin(); 
} 
 
 
function ms_end(win) { 
  ms_gameOver = true; 
  for (const c of ms_grid) { 
    if (c.mine) { 
      c.el.classList.add("mine"); 
      if (!c.el.textContent) c.el.textContent = "💣"; 
    } 
  } 
  if (ms_messageEl) 
    ms_messageEl.textContent = win 
      ? "You win!" 
      : "You hit a mine — game over."; 
} 
 
 
function ms_checkWin() { 
  if (ms_revealedCount === ms_rows * ms_cols - ms_mines) { 
    ms_end(true); 
    return; 
  } 
  let correct = 0; 
  let flagTotal = 0; 
  for (const c of ms_grid) { 
    if (c.flag) { 
      flagTotal++; 
      if (c.mine) correct++; 
    } 
  } 
  if (flagTotal === ms_mines && correct === ms_mines) ms_end(true); 
} 
 
 
if (ms_newBtn) ms_newBtn.addEventListener("click", ms_makeBoard); 
if (ms_resetBtn) 
  ms_resetBtn.addEventListener("click", () => { 
    if (!ms_grid.length) return; 
    ms_gameOver = false; 
    ms_flags = 0; 
    ms_revealedCount = 0; 
    for (const c of ms_grid) { 
      c.revealed = false; 
      c.flag = false; 
      c.el.className = "ms-cell unrevealed"; 
      c.el.textContent = ""; 
    } 
    if (ms_statsEl) 
      ms_statsEl.textContent = `Mines: ${ms_mines} | Flags: 
${ms_flags}`; 
    if (ms_messageEl) 
      ms_messageEl.textContent = 
        "Right-click to place a red flag. Left-click to reveal. Reveal a mine and you lose."; 
  }); 
 
 
// Make sure the board exists at least once initially 
if (ms_boardEl) ms_makeBoard(); 
 
 
// ================== 2D TABLE TENNIS ================== 
 
 
const tt_canvas = document.getElementById("tt-game-canvas");
const tt_ctx = tt_canvas ? tt_canvas.getContext("2d") : null;
const tt_p1ScoreEl = document.getElementById("tt-p1-score");
const tt_p2ScoreEl = document.getElementById("tt-p2-score");
const tt_restartBtn = document.getElementById("tt-restart");




let tt_p1Score = 0;
let tt_p2Score = 0;




const TT_PADDLE_WIDTH = 12;
const TT_PADDLE_HEIGHT = 80;




let tt_paddle1 = { x: 20, y: 0, speed: 5 };
let tt_paddle2 = { x: 0, y: 0, speed: 5 };




const TT_FLOOR_Y = 330;




let tt_ball = {
  x: 0,
  y: 0,
  radius: 10,
  vx: 4,
  vy: -6,
  gravity: 0.2,
  bounce: 0.92,
};




let tt_hasBounced = false;
let tt_keys = {};




function tt_resetBall() {
  if (!tt_canvas) return;
  tt_ball.x = tt_canvas.width / 2;
  tt_ball.y = 200;
  tt_ball.vx = Math.random() > 0.5 ? 4 : -4;
  tt_ball.vy = -6;
  tt_hasBounced = false;
}




function tt_resetGame() {
  tt_p1Score = 0;
  tt_p2Score = 0;
  if (tt_p1ScoreEl) tt_p1ScoreEl.textContent = "0";
  if (tt_p2ScoreEl) tt_p2ScoreEl.textContent = "0";
  tt_resetBall();
  if (tt_canvas) {
    tt_paddle1.y = tt_canvas.height / 2 - TT_PADDLE_HEIGHT / 2;
    tt_paddle2.y = tt_canvas.height / 2 - TT_PADDLE_HEIGHT / 2;
    tt_paddle2.x = tt_canvas.width - 32;
  }
}




document.addEventListener("keydown", (e) => {
  tt_keys[e.key] = true;
});




document.addEventListener("keyup", (e) => {
  tt_keys[e.key] = false;
});




if (tt_restartBtn) {
  tt_restartBtn.addEventListener("click", () => {
    tt_resetGame();
  });
}




function tt_movePaddles() {
    if (!tt_canvas) return;
  
    // Move paddles based on keys
    if (tt_keys["w"] || tt_keys["W"]) tt_paddle1.y -= tt_paddle1.speed;
    if (tt_keys["s"] || tt_keys["S"]) tt_paddle1.y += tt_paddle1.speed;
    if (tt_keys["ArrowUp"]) tt_paddle2.y -= tt_paddle2.speed;
    if (tt_keys["ArrowDown"]) tt_paddle2.y += tt_paddle2.speed;
  
    // Clamp so paddles don’t go below the table line
    const maxPaddleY = TT_FLOOR_Y - TT_PADDLE_HEIGHT;
  
    tt_paddle1.y = Math.max(0, Math.min(maxPaddleY, tt_paddle1.y));
    tt_paddle2.y = Math.max(0, Math.min(maxPaddleY, tt_paddle2.y));
  }
  




function tt_update() {
  if (!tableVisible || !tt_canvas) return;




  tt_movePaddles();




  tt_ball.x += tt_ball.vx;
  tt_ball.y += tt_ball.vy;
  tt_ball.vy += tt_ball.gravity;




  // Table bounce
  if (tt_ball.y + tt_ball.radius >= TT_FLOOR_Y) {
    tt_ball.y = TT_FLOOR_Y - tt_ball.radius;
    let bounce = Math.abs(tt_ball.vy) * tt_ball.bounce;
    if (bounce < 6) bounce = 6;
    tt_ball.vy = -bounce;
    tt_hasBounced = true;
  }




  // Left / right walls -> scoring
  if (tt_ball.x - tt_ball.radius < 0) {
    tt_p2Score++;
    if (tt_p2ScoreEl) tt_p2ScoreEl.textContent = String(tt_p2Score);
    tt_resetBall();
  }




  if (tt_ball.x + tt_ball.radius > tt_canvas.width) {
    tt_p1Score++;
    if (tt_p1ScoreEl) tt_p1ScoreEl.textContent = String(tt_p1Score);
    tt_resetBall();
  }




  // Ceiling
  if (tt_ball.y - tt_ball.radius < 0) {
    tt_ball.y = tt_ball.radius;
    tt_ball.vy *= -1;
  }




  // Paddle collisions
  function paddleHit(p) {
    return (
      tt_ball.x - tt_ball.radius < p.x + TT_PADDLE_WIDTH &&
      tt_ball.x + tt_ball.radius > p.x &&
      tt_ball.y > p.y &&
      tt_ball.y < p.y + TT_PADDLE_HEIGHT
    );
  }




  if (paddleHit(tt_paddle1)) {
    if (!tt_hasBounced) {
      tt_p2Score++;
      if (tt_p2ScoreEl) tt_p2ScoreEl.textContent = String(tt_p2Score);
      tt_resetBall();
      return;
    }
    tt_ball.vx = Math.abs(tt_ball.vx) + 0.5;
    tt_hasBounced = false;
  }




  if (paddleHit(tt_paddle2)) {
    if (!tt_hasBounced) {
      tt_p1Score++;
      if (tt_p1ScoreEl) tt_p1ScoreEl.textContent = String(tt_p1Score);
      tt_resetBall();
      return;
    }
    tt_ball.vx = -Math.abs(tt_ball.vx) - 0.5;
    tt_hasBounced = false;
  }
}




function tt_render() {
  if (!tt_canvas || !tt_ctx) return;
  tt_ctx.clearRect(0, 0, tt_canvas.width, tt_canvas.height);




  // Court background
  tt_ctx.fillStyle = "#020617";
  tt_ctx.fillRect(0, 0, tt_canvas.width, tt_canvas.height);




  // Table line
  tt_ctx.fillStyle = "#ffffff";
  tt_ctx.fillRect(0, TT_FLOOR_Y + 2, tt_canvas.width, 4);
  tt_ctx.fillRect(tt_canvas.width / 2 - 2, TT_FLOOR_Y - 80, 4, 80);




  // Paddles
  tt_ctx.fillStyle = "#22c55e";
  tt_ctx.fillRect(tt_paddle1.x, tt_paddle1.y, TT_PADDLE_WIDTH, TT_PADDLE_HEIGHT);
  tt_ctx.fillRect(tt_paddle2.x, tt_paddle2.y, TT_PADDLE_WIDTH, TT_PADDLE_HEIGHT);




  // Ball
  tt_ctx.fillStyle = "#ef4444";
  tt_ctx.beginPath();
  tt_ctx.arc(tt_ball.x, tt_ball.y, tt_ball.radius, 0, Math.PI * 2);
  tt_ctx.fill();
}




function tt_loop() {
  if (tableVisible) {
    tt_update();
    tt_render();
  }
  requestAnimationFrame(tt_loop);
}
requestAnimationFrame(tt_loop);




if (tt_canvas) {
  tt_resetGame();
}



 
 
// ================== MINI PAC-MAN ==================

const pm_boardEl =
  document.getElementById("pm-game-board") ||
  document.getElementById("pm-board");
const pm_scoreEl = document.getElementById("pm-score");
const pm_restartBtn = document.getElementById("pm-restart");
const pm_messageEl = document.querySelector(".pm-hint"); // <— HUD style message




const PM_ROWS = 15;
const PM_COLS = 20;




let pm_score = 0;
let pm_pacman = { row: 7, col: 10 };
let pm_monster = { row: 1, col: 1 };
let pm_cells = [];
let pm_gameOver = false;
let pm_monsterTimer = null;




// layout: 0 = dot / empty, 1 = wall
const pm_layout = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];




function pm_createBoard() {
  if (!pm_boardEl) return;
  pm_boardEl.innerHTML = "";
  pm_cells = [];




  // Ensure grid styling even if CSS uses #pm-board
  pm_boardEl.style.display = "grid";
  pm_boardEl.style.gridTemplateColumns = "repeat(20, 20px)";
  pm_boardEl.style.gridTemplateRows = "repeat(15, 20px)";
  pm_boardEl.style.gap = "2px";




  for (let r = 0; r < PM_ROWS; r++) {
    pm_cells[r] = [];
    for (let c = 0; c < PM_COLS; c++) {
      const div = document.createElement("div");
      div.classList.add("pm-cell");
      if (pm_layout[r][c] === 1) {
        div.classList.add("pm-wall");
      } else {
        div.classList.add("pm-dot");
      }
      pm_boardEl.appendChild(div);
      pm_cells[r][c] = div;
    }
  }




  pm_drawPacman();
  pm_drawMonster();
}




function pm_drawPacman() {
  const cell = pm_cells[pm_pacman.row][pm_pacman.col];
  cell.classList.remove("pm-dot");
  cell.classList.add("pm-pacman");
}




function pm_clearPacman() {
  const cell = pm_cells[pm_pacman.row][pm_pacman.col];
  cell.classList.remove("pm-pacman");
}




function pm_drawMonster() {
  pm_cells[pm_monster.row][pm_monster.col].classList.add("pm-monster");
}




function pm_clearMonster() {
  pm_cells[pm_monster.row][pm_monster.col].classList.remove("pm-monster");
}




function pm_checkCollision() {
  if (pm_pacman.row === pm_monster.row && pm_pacman.col === pm_monster.col) {
    pm_gameOver = true;
    if (pm_messageEl) {
      pm_messageEl.textContent =
        "Game Over – the monster caught Pac-Man. Press Restart to play again.";
    }
  }
}




function pm_checkWin() {
  if (!pm_boardEl || pm_gameOver) return;
  const remainingDot = pm_boardEl.querySelector(".pm-dot");
  if (!remainingDot) {
    pm_gameOver = true;
    if (pm_messageEl) {
      pm_messageEl.textContent = "You win! Press Restart to play again.";
    }
  }
}




function pm_movePacman(e) {
  if (!pacmanVisible || pm_gameOver) return;




  let newRow = pm_pacman.row;
  let newCol = pm_pacman.col;




  if (e.key === "ArrowUp") newRow--;
  else if (e.key === "ArrowDown") newRow++;
  else if (e.key === "ArrowLeft") newCol--;
  else if (e.key === "ArrowRight") newCol++;
  else return;




  if (pm_layout[newRow][newCol] !== 1) {
    pm_clearPacman();
    pm_pacman.row = newRow;
    pm_pacman.col = newCol;




    const cell = pm_cells[newRow][newCol];
    if (cell.classList.contains("pm-dot")) {
      cell.classList.remove("pm-dot");
      pm_score++;
      if (pm_scoreEl) pm_scoreEl.textContent = String(pm_score);
    }




    pm_drawPacman();
    pm_checkCollision();
    if (!pm_gameOver) {
      pm_checkWin();
    }
  }
}




function pm_moveMonster() {
  if (pm_gameOver || !pm_cells.length) return;




  pm_clearMonster();
  let dr = pm_pacman.row - pm_monster.row;
  let dc = pm_pacman.col - pm_monster.col;
  let newRow = pm_monster.row;
  let newCol = pm_monster.col;




  if (Math.abs(dr) > Math.abs(dc)) {
    if (dr > 0 && pm_layout[pm_monster.row + 1][pm_monster.col] !== 1) {
      newRow++;
    } else if (dr < 0 && pm_layout[pm_monster.row - 1][pm_monster.col] !== 1) {
      newRow--;
    } else if (dc > 0 && pm_layout[pm_monster.row][pm_monster.col + 1] !== 1) {
      newCol++;
    } else if (dc < 0 && pm_layout[pm_monster.row][pm_monster.col - 1] !== 1) {
      newCol--;
    }
  } else {
    if (dc > 0 && pm_layout[pm_monster.row][pm_monster.col + 1] !== 1) {
      newCol++;
    } else if (dc < 0 && pm_layout[pm_monster.row][pm_monster.col - 1] !== 1) {
      newCol--;
    } else if (dr > 0 && pm_layout[pm_monster.row + 1][pm_monster.col] !== 1) {
      newRow++;
    } else if (dr < 0 && pm_layout[pm_monster.row - 1][pm_monster.col] !== 1) {
      newRow--;
    }
  }




  pm_monster.row = newRow;
  pm_monster.col = newCol;
  pm_drawMonster();
  pm_checkCollision();
}




function pm_resetGame() {
  pm_score = 0;
  if (pm_scoreEl) pm_scoreEl.textContent = "0";
  pm_pacman = { row: 7, col: 10 };
  pm_monster = { row: 1, col: 1 };
  pm_gameOver = false;
  if (pm_messageEl) {
    pm_messageEl.textContent =
      "Use the arrow keys to move Pac-Man. Eat all the dots and avoid the red monster.";
  }
  pm_createBoard();
}




document.addEventListener("keydown", pm_movePacman);




if (pm_restartBtn) {
  pm_restartBtn.addEventListener("click", () => {
    pm_resetGame();
  });
}




// initialise once so it's ready when modal opens
if (pm_boardEl) {
  pm_resetGame();
}


 
 
// ================== NEON SNAKE ==================

const sn_canvas = document.getElementById("sn-game-canvas");
const sn_ctx = sn_canvas ? sn_canvas.getContext("2d") : null;
const sn_scoreEl = document.getElementById("sn-score");
const sn_restartBtn = document.getElementById("sn-restart");

const SN_COLS = 20;
const SN_ROWS = 20;

let sn_snake = [];
let sn_direction = { x: 1, y: 0 };
let sn_nextDirection = { x: 1, y: 0 };
let sn_food = null;
let sn_score = 0;
let sn_gameOver = false;
let sn_loopId = null;
let sn_speedMs = 150;

function sn_placeFood() {
  if (!sn_canvas) return;
  while (true) {
    const x = Math.floor(Math.random() * SN_COLS);
    const y = Math.floor(Math.random() * SN_ROWS);
    const onSnake = sn_snake.some((seg) => seg.x === x && seg.y === y);
    if (!onSnake) {
      sn_food = { x, y };
      break;
    }
  }
}

function sn_resetGame() {
  if (!sn_canvas) return;

  sn_score = 0;
  sn_speedMs = 150;
  sn_gameOver = false;
  sn_direction = { x: 1, y: 0 };
  sn_nextDirection = { x: 1, y: 0 };

  const startX = Math.floor(SN_COLS / 2);
  const startY = Math.floor(SN_ROWS / 2);

  sn_snake = [
    { x: startX - 1, y: startY },
    { x: startX, y: startY },
  ];

  if (sn_scoreEl) sn_scoreEl.textContent = "0";
  sn_placeFood();
  sn_draw();
}

function sn_step() {
  if (!snakeVisible || sn_gameOver || !sn_canvas) return;

  // apply buffered direction
  sn_direction = sn_nextDirection;

  const head = sn_snake[sn_snake.length - 1];
  const newHead = {
    x: head.x + sn_direction.x,
    y: head.y + sn_direction.y,
  };

  // Wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= SN_COLS ||
    newHead.y < 0 ||
    newHead.y >= SN_ROWS
  ) {
    sn_gameOver = true;
    sn_draw(true);
    sn_stopLoop();
    return;
  }

  // Self collision
  if (sn_snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
    sn_gameOver = true;
    sn_draw(true);
    sn_stopLoop();
    return;
  }

  // Move snake
  sn_snake.push(newHead);

  // Eat food or move tail
  if (sn_food && newHead.x === sn_food.x && newHead.y === sn_food.y) {
    sn_score += 10;
    if (sn_scoreEl) sn_scoreEl.textContent = String(sn_score);

    // slightly speed up as score increases
    if (sn_speedMs > 70) {
      sn_speedMs -= 5;
      sn_restartLoopWithNewSpeed();
    }

    sn_placeFood();
  } else {
    sn_snake.shift();
  }

  sn_draw();
}

function sn_draw(showGameOver = false) {
  if (!sn_canvas || !sn_ctx) return;

  const cellSizeX = sn_canvas.width / SN_COLS;
  const cellSizeY = sn_canvas.height / SN_ROWS;
  const cell = Math.min(cellSizeX, cellSizeY);

  // background
  sn_ctx.fillStyle = "#020617";
  sn_ctx.fillRect(0, 0, sn_canvas.width, sn_canvas.height);

  // neon grid
  sn_ctx.strokeStyle = "rgba(148,163,184,0.2)";
  sn_ctx.lineWidth = 1;
  sn_ctx.beginPath();
  for (let c = 0; c <= SN_COLS; c++) {
    const x = c * cell;
    sn_ctx.moveTo(x, 0);
    sn_ctx.lineTo(x, SN_ROWS * cell);
  }
  for (let r = 0; r <= SN_ROWS; r++) {
    const y = r * cell;
    sn_ctx.moveTo(0, y);
    sn_ctx.lineTo(SN_COLS * cell, y);
  }
  sn_ctx.stroke();

  // food
  if (sn_food) {
    sn_ctx.fillStyle = "#38bdf8";
    sn_ctx.shadowColor = "#38bdf8";
    sn_ctx.shadowBlur = 12;
    sn_ctx.beginPath();
    sn_ctx.rect(
      sn_food.x * cell + cell * 0.2,
      sn_food.y * cell + cell * 0.2,
      cell * 0.6,
      cell * 0.6
    );
    sn_ctx.fill();
    sn_ctx.shadowBlur = 0;
  }

  // snake
  sn_snake.forEach((seg, idx) => {
    const isHead = idx === sn_snake.length - 1;
    sn_ctx.fillStyle = isHead ? "#facc15" : "#22c55e";
    sn_ctx.shadowColor = isHead ? "#facc15" : "#22c55e";
    sn_ctx.shadowBlur = isHead ? 18 : 10;

    sn_ctx.beginPath();
    sn_ctx.roundRect(
      seg.x * cell + cell * 0.1,
      seg.y * cell + cell * 0.1,
      cell * 0.8,
      cell * 0.8,
      4
    );
    sn_ctx.fill();
    sn_ctx.shadowBlur = 0;
  });

  // Game over overlay
  if (showGameOver) {
    sn_ctx.fillStyle = "rgba(15,23,42,0.85)";
    sn_ctx.fillRect(0, sn_canvas.height / 2 - 40, sn_canvas.width, 80);

    sn_ctx.fillStyle = "#facc15";
    sn_ctx.font = "bold 20px system-ui";
    sn_ctx.textAlign = "center";
    sn_ctx.fillText(
      "Game Over",
      sn_canvas.width / 2,
      sn_canvas.height / 2 - 5
    );

    sn_ctx.fillStyle = "#e5e7eb";
    sn_ctx.font = "14px system-ui";
    sn_ctx.fillText(
      "Press Restart or Space to play again",
      sn_canvas.width / 2,
      sn_canvas.height / 2 + 18
    );
  }
}

function sn_startLoop() {
  sn_stopLoop();
  if (!snakeVisible) return;
  sn_loopId = setInterval(sn_step, sn_speedMs);
}

function sn_stopLoop() {
  if (sn_loopId) {
    clearInterval(sn_loopId);
    sn_loopId = null;
  }
}

function sn_restartLoopWithNewSpeed() {
  if (!snakeVisible || sn_gameOver) return;
  sn_startLoop();
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (!snakeVisible) return;

  // restart on Space if game over
  if (sn_gameOver && e.code === "Space") {
    sn_resetGame();
    sn_startLoop();
    e.preventDefault();
    return;
  }

  if (sn_gameOver) return;

  let newDir = null;
  if (e.key === "ArrowUp") newDir = { x: 0, y: -1 };
  else if (e.key === "ArrowDown") newDir = { x: 0, y: 1 };
  else if (e.key === "ArrowLeft") newDir = { x: -1, y: 0 };
  else if (e.key === "ArrowRight") newDir = { x: 1, y: 0 };
  else return;

  // prevent immediate reversal
  if (
    (newDir.x === -sn_direction.x && newDir.y === 0) ||
    (newDir.y === -sn_direction.y && newDir.x === 0)
  ) {
    return;
  }

  e.preventDefault();
  sn_nextDirection = newDir;
});

// Restart button
if (sn_restartBtn) {
  sn_restartBtn.addEventListener("click", () => {
    sn_resetGame();
    if (snakeVisible) sn_startLoop();
  });
}

// Prepare canvas once
if (sn_canvas) {
  sn_resetGame();
}

