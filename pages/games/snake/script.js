/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * משחק נחש – גרסה מקצועית
 * כלל ברזל: רק index.html, script.js, style.css
 */
(function() {
  "use strict";

  const GRID = 20;
  const SIZE = 400;
  const SAVE_KEY = "gameHubSnakeState";
  const LEADERBOARD_KEY = "snakeLeaderboard";
  const SAVE_MAX_HOURS = 24;

  const STATE = { READY: "READY", RUNNING: "RUNNING", PAUSED: "PAUSED", GAME_OVER: "GAME_OVER" };

  let canvas, ctx;
  let snake, direction, fruit, obstacles;
  let score, gameTime, highScore, gameSpeed, baseSpeed;
  let state = STATE.READY;
  let gameIntervalId = null;
  let lastTickTime = 0;
  let lastEffectiveSpeed = 0;
  let elapsedMs = 0;
  let comboCount = 0;
  let comboTimeoutId = null;
  const COMBO_DELAY_MS = 1500;
  let powerUp = null;
  let powerUpEndTime = 0;
  let lastDifficultyLevel = 0;

  function getEl(id) { return document.getElementById(id); }

  function clearAllIntervals() {
    if (gameIntervalId !== null) {
      clearInterval(gameIntervalId);
      gameIntervalId = null;
    }
    if (comboTimeoutId !== null) {
      clearTimeout(comboTimeoutId);
      comboTimeoutId = null;
    }
  }

  function setState(newState) {
    state = newState;
    updateStateDisplay();
  }

  function updateStateDisplay() {
    const el = getEl("stateDisplay");
    if (el) {
      const labels = { READY: "מוכן", RUNNING: "משחק", PAUSED: "מושהה", GAME_OVER: "סיום" };
      el.textContent = labels[state] || state;
    }
  }

  function getSpeed() {
    const sel = getEl("speedSelect");
    if (!sel) return 85;
    const v = parseInt(sel.value, 10);
    return (v === 120 || v === 85 || v === 55) ? v : 85;
  }

  function spawnFruit() {
    var free = [];
    for (var gx = 0; gx < SIZE; gx += GRID) {
      for (var gy = 0; gy < SIZE; gy += GRID) {
        if (!isOccupied(gx, gy, false)) free.push({ x: gx, y: gy });
      }
    }
    var p = free.length > 0 ? free[Math.floor(Math.random() * free.length)] : { x: 0, y: 0 };
    var x = p.x, y = p.y;
    var attempts = 0;
    while (attempts < 100 && isOccupied(x, y, false)) {
      x = Math.floor(Math.random() * (SIZE / GRID)) * GRID;
      y = Math.floor(Math.random() * (SIZE / GRID)) * GRID;
      attempts++;
    }
    const types = ["normal", "bonus", "double", "slow", "fast"];
    const r = Math.random();
    let type = "normal";
    if (r < 0.15) type = "bonus";
    else if (r < 0.22) type = "double";
    else if (r < 0.28) type = "slow";
    else if (r < 0.34) type = "fast";
    return { x: x, y: y, type: type };
  }

  function isOccupied(x, y, excludeHead) {
    var bodyArr = (snake && Array.isArray(snake)) ? (excludeHead ? snake.slice(1) : snake) : [];
    var obsArr = (obstacles && Array.isArray(obstacles)) ? obstacles : [];
    if (bodyArr.some(function(s) { return s && s.x === x && s.y === y; })) return true;
    if (obsArr.some(function(o) { return o && o.x === x && o.y === y; })) return true;
    if (fruit && typeof fruit.x === "number" && typeof fruit.y === "number" && fruit.x === x && fruit.y === y) return true;
    return false;
  }

  function spawnObstacles(count) {
    const obs = [];
    const maxObs = 5 + Math.floor(score / 50);
    const n = Math.min(count, maxObs);
    for (let i = 0; i < n; i++) {
      let o;
      let attempts = 0;
      do {
        o = {
          x: Math.floor(Math.random() * (SIZE / GRID)) * GRID,
          y: Math.floor(Math.random() * (SIZE / GRID)) * GRID
        };
        attempts++;
      } while (attempts < 100 && isOccupied(o.x, o.y, false));
      obs.push(o);
    }
    return obs;
  }

  let lastObstacleScore = 0;

  function addObstacleIfNeeded() {
    if (!obstacles || !Array.isArray(obstacles)) obstacles = [];
    var level = Math.floor(score / 50);
    var currentTotal = obstacles.length;
    var target = 5 + level;
    if (level > lastObstacleScore && currentTotal < target) {
      lastObstacleScore = level;
      let o;
      let attempts = 0;
      do {
        o = {
          x: Math.floor(Math.random() * (SIZE / GRID)) * GRID,
          y: Math.floor(Math.random() * (SIZE / GRID)) * GRID
        };
        attempts++;
      } while (attempts < 100 && isOccupied(o.x, o.y, false));
      if (attempts < 100) obstacles.push(o);
    }
  }

  function getComboMultiplier() {
    return 1 + Math.min(comboCount, 5);
  }

  function resetCombo() {
    comboCount = 0;
    if (comboTimeoutId) clearTimeout(comboTimeoutId);
    comboTimeoutId = null;
  }

  function onEatFruit() {
    comboCount++;
    if (comboTimeoutId) clearTimeout(comboTimeoutId);
    comboTimeoutId = setTimeout(resetCombo, COMBO_DELAY_MS);
  }

  function activatePowerUp(type, durationMs) {
    powerUp = type;
    powerUpEndTime = Date.now() + durationMs;
  }

  function updatePowerUp() {
    if (powerUp && Date.now() >= powerUpEndTime) {
      powerUp = null;
    }
  }

  function getEffectiveSpeed() {
    if (powerUp === "slow") return Math.min(gameSpeed + 40, 150);
    if (powerUp === "fast") return Math.max(gameSpeed - 30, 35);
    return gameSpeed;
  }

  function getScoreMultiplier() {
    let m = 1;
    if (powerUp === "double") m = 2;
    return m * getComboMultiplier();
  }

  function saveGameState() {
    if (state !== STATE.RUNNING && state !== STATE.PAUSED) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        snake: snake, direction: direction, fruit: fruit, obstacles: obstacles,
        score: score, gameTime: gameTime, gameSpeed: gameSpeed, baseSpeed: baseSpeed,
        state: state, ts: Date.now()
      }));
    } catch (e) {}
  }

  function loadGameState() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.snake || !Array.isArray(s.snake) || s.snake.length < 1) return null;
      if (Date.now() - (s.ts || 0) > SAVE_MAX_HOURS * 60 * 60 * 1000) return null;
      if (!s.fruit || typeof s.fruit.x !== "number" || typeof s.fruit.y !== "number") return null;
      var validDir = ["LEFT", "RIGHT", "UP", "DOWN"];
      if (!validDir.includes(s.direction)) return null;
      return s;
    } catch (e) { return null; }
  }

  function clearSavedState() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  function loadHighScore() {
    try {
      var data = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
      if (data.length) return data[0].score || 0;
    } catch (e) {}
    return 0;
  }

  function initGame(fromSave) {
    clearAllIntervals();
    resetCombo();
    powerUp = null;
    lastDifficultyLevel = 0;
    lastObstacleScore = 0;

    if (fromSave) {
      var saved = loadGameState();
      if (saved) {
        snake = (saved.snake && Array.isArray(saved.snake) && saved.snake.length > 0) ? saved.snake : [{ x: 200, y: 200 }];
        direction = saved.direction || "RIGHT";
        score = saved.score || 0;
        gameTime = saved.gameTime || 0;
        gameSpeed = saved.gameSpeed || getSpeed();
        baseSpeed = saved.baseSpeed || gameSpeed;
        obstacles = Array.isArray(saved.obstacles) ? saved.obstacles : [];
        fruit = (saved.fruit && typeof saved.fruit.x === "number" && typeof saved.fruit.y === "number") ? saved.fruit : null;
        if (!fruit) fruit = spawnFruit();
        if (obstacles.length === 0) obstacles = spawnObstacles(5);
      } else {
        fromSave = false;
      }
    }
    if (!fromSave) {
      baseSpeed = getSpeed();
      gameSpeed = baseSpeed;
      snake = [{ x: 200, y: 200 }];
      direction = "RIGHT";
      obstacles = [];
      fruit = spawnFruit();
      obstacles = spawnObstacles(5);
      score = 0;
      gameTime = 0;
      lastDifficultyLevel = 0;
    } else {
      lastDifficultyLevel = Math.floor(score / 50);
      lastObstacleScore = lastDifficultyLevel;
    }

    highScore = loadHighScore();
    if (score > highScore) highScore = score;

    setState(STATE.RUNNING);
    const sel = getEl("speedSelect");
    if (sel) sel.disabled = true;

    if (!fromSave) clearSavedState();
    hideOverlay("startOverlay");
    hideOverlay("pauseOverlay");
    hideOverlay("gameOverOverlay");
    updateUI();
    updateBtns();

    elapsedMs = 0;
    lastEffectiveSpeed = getEffectiveSpeed();
    gameIntervalId = setInterval(gameLoop, lastEffectiveSpeed);
  }

  function gameLoop() {
    if (state === STATE.GAME_OVER) {
      clearAllIntervals();
      return;
    }
    if (state === STATE.PAUSED) return;

    var eff = getEffectiveSpeed();
    elapsedMs += eff;
    while (elapsedMs >= 1000) {
      gameTime++;
      elapsedMs -= 1000;
    }

    updatePowerUp();
    var wrap = document.querySelector(".canvas-wrap");
    if (wrap) {
      if (powerUp) wrap.classList.add("powerup-glow");
      else wrap.classList.remove("powerup-glow");
    }
    updateUI();

    if (eff !== lastEffectiveSpeed) {
      lastEffectiveSpeed = eff;
      clearInterval(gameIntervalId);
      gameIntervalId = setInterval(gameLoop, eff);
    }

    ctx.clearRect(0, 0, SIZE, SIZE);

    var head = { x: snake[0].x, y: snake[0].y };
    if (direction === "LEFT") head.x -= GRID;
    else if (direction === "UP") head.y -= GRID;
    else if (direction === "RIGHT") head.x += GRID;
    else head.y += GRID;

    snake.unshift(head);

    if (head.x === fruit.x && head.y === fruit.y) {
      if (typeof SOUNDS !== "undefined" && SOUNDS.eat) SOUNDS.eat();
      var wrap = document.querySelector(".canvas-wrap");
      if (wrap) { wrap.classList.add("eat-flash"); setTimeout(function() { wrap.classList.remove("eat-flash"); }, 150); }
      var mult = getScoreMultiplier();
      var base = fruit.type === "bonus" ? 20 : fruit.type === "double" ? 15 : fruit.type === "slow" || fruit.type === "fast" ? 25 : 10;
      score += Math.floor(base * mult);
      onEatFruit();
      if (fruit.type === "double") activatePowerUp("double", 5000);
      else if (fruit.type === "slow") activatePowerUp("slow", 4000);
      else if (fruit.type === "fast") activatePowerUp("fast", 3000);
      if (fruit.type === "bonus" && gameSpeed > 35) gameSpeed = Math.max(35, gameSpeed - 5);
      var newLevel = Math.floor(score / 50);
      if (newLevel > lastDifficultyLevel && gameSpeed > 35) {
        lastDifficultyLevel = newLevel;
        gameSpeed = Math.max(35, gameSpeed - 3);
      }
      fruit = spawnFruit();
      addObstacleIfNeeded();
    } else {
      snake.pop();
    }

    snake.forEach(function(seg, i) {
      var a = 1 - (i / snake.length) * 0.5;
      ctx.fillStyle = "rgba(74, 222, 128, " + a + ")";
      ctx.shadowColor = i === 0 ? "rgba(34, 197, 94, 0.5)" : "transparent";
      ctx.shadowBlur = i === 0 ? 8 : 0;
      ctx.fillRect(seg.x + 2, seg.y + 2, GRID - 4, GRID - 4);
    });
    ctx.shadowBlur = 0;

    var fruitColor = "#ef4444";
    if (fruit.type === "bonus") fruitColor = "#3b82f6";
    else if (fruit.type === "double") fruitColor = "#a855f7";
    else if (fruit.type === "slow") fruitColor = "#06b6d4";
    else if (fruit.type === "fast") fruitColor = "#f59e0b";
    ctx.fillStyle = fruitColor;
    ctx.shadowColor = fruitColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(fruit.x + GRID / 2, fruit.y + GRID / 2, GRID / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
    obstacles.forEach(function(o) {
      ctx.fillRect(o.x + 2, o.y + 2, GRID - 4, GRID - 4);
    });

    var collision = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE ||
      snake.slice(1).some(function(s) { return s.x === head.x && s.y === head.y; }) ||
      obstacles.some(function(o) { return o.x === head.x && o.y === head.y; });

    if (collision) {
      var wrap = document.querySelector(".canvas-wrap");
      if (wrap) { wrap.classList.add("collision-shake"); setTimeout(function() { wrap.classList.remove("collision-shake"); }, 400); }
      setState(STATE.GAME_OVER);
      clearAllIntervals();
      drawGameOverScreen();
      showGameOverOverlay();
      saveToLeaderboard();
      clearSavedState();
      updateBtns();
      if (typeof window.ANALYTICS !== "undefined" && window.ANALYTICS.track) {
        try { window.ANALYTICS.track("snake_game_over", { score: score }); } catch (e) {}
      }
      return;
    }

    if (score > highScore) highScore = score;
  }

  function drawGameOverScreen() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.font = "bold 28px Heebo";
    ctx.fillStyle = "#ef4444";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", SIZE / 2, SIZE / 2 - 25);
    ctx.font = "18px Heebo";
    ctx.fillStyle = "#fff";
    ctx.fillText("ניקוד: " + score, SIZE / 2, SIZE / 2 + 5);
    ctx.fillText("שיא: " + highScore, SIZE / 2, SIZE / 2 + 35);
  }

  function drawPausedScreen() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.font = "bold 24px Heebo";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("המשחק הוקפא", SIZE / 2, SIZE / 2 - 10);
    ctx.font = "16px Heebo";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("לחץ המשך להמשך", SIZE / 2, SIZE / 2 + 20);
  }

  function stopGame(pause) {
    clearAllIntervals();
    if (pause) {
      setState(STATE.PAUSED);
      saveGameState();
      drawPausedScreen();
      showOverlay("pauseOverlay");
    } else {
      setState(STATE.GAME_OVER);
    }
    var sel = getEl("speedSelect");
    if (sel) sel.disabled = false;
    updateBtns();
  }

  function resumeGame() {
    if (state !== STATE.PAUSED) return;
    hideOverlay("pauseOverlay");
    setState(STATE.RUNNING);
    updateBtns();
    lastEffectiveSpeed = getEffectiveSpeed();
    gameIntervalId = setInterval(gameLoop, lastEffectiveSpeed);
  }

  function resetGame() {
    clearAllIntervals();
    setState(STATE.READY);
    clearSavedState();
    baseSpeed = getSpeed();
    gameSpeed = baseSpeed;
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    obstacles = [];
    fruit = spawnFruit();
    obstacles = spawnObstacles(5);
    score = 0;
    gameTime = 0;
    highScore = loadHighScore();
    resetCombo();
    powerUp = null;
    lastDifficultyLevel = 0;
    lastObstacleScore = 0;
    var sel = getEl("speedSelect");
    if (sel) sel.disabled = false;
    showOverlay("startOverlay");
    hideOverlay("pauseOverlay");
    hideOverlay("gameOverOverlay");
    updateUI();
    updateBtns();
    if (ctx) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      snake.forEach(function(seg, i) {
        var a = 1 - (i / (snake.length || 1)) * 0.5;
        ctx.fillStyle = "rgba(74, 222, 128, " + a + ")";
        ctx.fillRect(seg.x + 2, seg.y + 2, GRID - 4, GRID - 4);
      });
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(fruit.x + GRID / 2, fruit.y + GRID / 2, GRID / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      obstacles.forEach(function(o) {
        ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
        ctx.fillRect(o.x + 2, o.y + 2, GRID - 4, GRID - 4);
      });
    }
  }

  function showOverlay(id) {
    var ov = getEl(id);
    if (ov) ov.classList.remove("hidden");
  }

  function hideOverlay(id) {
    var ov = getEl(id);
    if (ov) ov.classList.add("hidden");
  }

  function showGameOverOverlay() {
    var ov = getEl("gameOverOverlay");
    if (ov) {
      var scoreEl = ov.querySelector(".game-over-score");
      var highEl = ov.querySelector(".game-over-high");
      if (scoreEl) scoreEl.textContent = score;
      if (highEl) highEl.textContent = highScore;
      ov.classList.remove("hidden");
    }
  }

  function updateUI() {
    var sd = getEl("scoreDisplay");
    var td = getEl("timerDisplay");
    var hs = getEl("highScoreDisplay");
    var lv = getEl("levelDisplay");
    if (sd) sd.textContent = score;
    if (td) td.textContent = gameTime;
    if (hs) hs.textContent = highScore;
    if (lv) {
      var level = Math.floor(score / 50) + 1;
      lv.textContent = level;
    }
    var pu = getEl("powerUpDisplay");
    if (pu) {
      if (powerUp) {
        var labels = { double: "x2 ניקוד", slow: "האטה", fast: "האצה" };
        pu.textContent = labels[powerUp] || powerUp;
        pu.style.display = "";
      } else pu.style.display = "none";
    }
    var comboEl = getEl("comboDisplay");
    if (comboEl) {
      if (comboCount > 1) {
        comboEl.textContent = "x" + getComboMultiplier() + " קומבו!";
        comboEl.style.display = "";
      } else comboEl.style.display = "none";
    }
  }

  function updateBtns() {
    var btnStart = getEl("btnStart");
    var btnStop = getEl("btnStop");
    var btnReset = getEl("btnReset");
    if (btnStart) {
      if (state === STATE.RUNNING) {
        btnStart.innerHTML = '<span>⏸</span> עצור';
        btnStart.setAttribute("aria-label", "השהה משחק");
      } else {
        btnStart.innerHTML = '<span>▶</span> התחל';
        btnStart.setAttribute("aria-label", "התחל משחק");
      }
    }
    if (btnStop) btnStop.disabled = state !== STATE.RUNNING;
    if (btnReset) btnReset.disabled = false;
  }

  function getLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    } catch (e) { return []; }
  }

  function saveToLeaderboard() {
    var data = getLeaderboard();
    var name = "אורח";
    if (typeof window.__loggedUserName === "string" && window.__loggedUserName.trim()) {
      name = window.__loggedUserName.trim();
    } else if (typeof AUTH !== "undefined" && AUTH.getLoggedUser) {
      var u = AUTH.getLoggedUser();
      if (u && u.name) name = String(u.name).trim() || name;
    }
    data.push({ score: score, name: name });
    data.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
    data = data.slice(0, 5);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
    renderLeaderboard(data);
  }

  function renderLeaderboard(data) {
    var tbody = getEl("leaderboardBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    var list = (data && data.length) ? data : [];
    for (var i = 0; i < 5; i++) {
      var row = document.createElement("tr");
      var ent = list[i] || { score: 0, name: "-" };
      if (i === 0 && (ent.score || 0) > 0) row.className = "leader-first";
      row.innerHTML = "<td>" + (i + 1) + "</td><td>" + (ent.name || "-") + "</td><td>" + (ent.score || 0) + "</td>";
      tbody.appendChild(row);
    }
  }

  function changeDir(e) {
    if (state !== STATE.RUNNING) return;
    var k = e.keyCode || e.key;
    if (k === 37 || k === "ArrowLeft") { if (direction !== "RIGHT") direction = "LEFT"; }
    else if (k === 38 || k === "ArrowUp") { if (direction !== "DOWN") direction = "UP"; }
    else if (k === 39 || k === "ArrowRight") { if (direction !== "LEFT") direction = "RIGHT"; }
    else if (k === 40 || k === "ArrowDown") { if (direction !== "UP") direction = "DOWN"; }
    else if (k === 87 || k === "w") { if (direction !== "DOWN") direction = "UP"; }
    else if (k === 83 || k === "s") { if (direction !== "UP") direction = "DOWN"; }
    else if (k === 65 || k === "a") { if (direction !== "RIGHT") direction = "LEFT"; }
    else if (k === 68 || k === "d") { if (direction !== "LEFT") direction = "RIGHT"; }
  }

  function doStart() {
    if (state === STATE.PAUSED) resumeGame();
    else if (state === STATE.READY || state === STATE.GAME_OVER) {
      var saved = loadGameState();
      if (saved && state === STATE.READY) initGame(true);
      else initGame(false);
    }
  }

  function doStop() {
    if (state === STATE.RUNNING) stopGame(true);
  }

  function doReset() {
    resetGame();
  }

  var bootRetries = 0;
  var BOOT_MAX_RETRIES = 20;
  function boot() {
    canvas = getEl("gameCanvas");
    if (!canvas) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
      } else if (bootRetries < BOOT_MAX_RETRIES) {
        bootRetries++;
        setTimeout(boot, 50);
      }
      return;
    }
    ctx = canvas.getContext("2d");
    if (!ctx) return;

    window.addEventListener("beforeunload", function() {
      if (state === STATE.RUNNING || state === STATE.PAUSED) saveGameState();
    });

    document.addEventListener("touchmove", function(e) {
      if ((state === STATE.RUNNING || state === STATE.PAUSED) && e.target.closest(".snake-card")) {
        e.preventDefault();
      }
    }, { passive: false });

    var meta = document.querySelector('meta[name="viewport"]');
    if (meta && !meta.getAttribute("content").includes("maximum-scale")) {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    }

    canvas.width = SIZE;
    canvas.height = SIZE;

    var btnOverlay = getEl("btnStartOverlay");
    var btnStart = getEl("btnStart");
    var btnStop = getEl("btnStop");
    var btnReset = getEl("btnReset");
    var btnPauseResume = getEl("btnPauseResume");
    var btnGameOverRestart = getEl("btnGameOverRestart");

    if (btnOverlay) btnOverlay.addEventListener("click", doStart);
    if (btnStart) btnStart.addEventListener("click", function() {
      if (state === STATE.PAUSED) resumeGame();
      else if (state === STATE.RUNNING) doStop();
      else doStart();
    });
    if (btnStop) btnStop.addEventListener("click", doStop);
    if (btnReset) btnReset.addEventListener("click", doReset);
    if (btnPauseResume) btnPauseResume.addEventListener("click", resumeGame);
    if (btnGameOverRestart) btnGameOverRestart.addEventListener("click", function() {
      hideOverlay("gameOverOverlay");
      initGame(false);
    });

    document.addEventListener("keydown", function(e) {
      if (state === STATE.RUNNING && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) >= 0) {
        e.preventDefault();
      }
      if (e.key === "Enter") {
        if (state === STATE.READY || state === STATE.GAME_OVER) doStart();
        else if (state === STATE.PAUSED) resumeGame();
      } else if (e.key === "r" || e.key === "R") {
        doReset();
      } else if (e.key === "p" || e.key === "P") {
        if (state === STATE.RUNNING) doStop();
        else if (state === STATE.PAUSED) resumeGame();
      }
      changeDir(e);
    });

    document.querySelectorAll(".touch-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        if (state !== STATE.RUNNING) return;
        var d = this.getAttribute("data-dir");
        if (d === "UP" && direction !== "DOWN") direction = "UP";
        else if (d === "DOWN" && direction !== "UP") direction = "DOWN";
        else if (d === "LEFT" && direction !== "RIGHT") direction = "LEFT";
        else if (d === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
      });
    });

    if (typeof AUTH !== "undefined" && AUTH.getLoggedUser) {
      var u = AUTH.getLoggedUser();
      if (u && u.name) window.__loggedUserName = String(u.name).trim();
    }

    renderLeaderboard(getLeaderboard());
    highScore = loadHighScore();

    var saved = loadGameState();
    var btnOvl = getEl("btnStartOverlay");
    var ov = getEl("startOverlay");
    var overlayTitle = getEl("overlayTitle");
    var overlayDesc = ov ? ov.querySelector(".overlay-desc") : null;
    if (saved && btnOvl && state === STATE.READY) {
      btnOvl.innerHTML = '<span>▶</span> המשך משחק';
      if (overlayTitle) overlayTitle.textContent = "משחק שמור";
      if (overlayDesc) overlayDesc.textContent = "לחץ להמשך (ניקוד: " + (saved.score || 0) + ")";
    }

    baseSpeed = getSpeed();
    gameSpeed = baseSpeed;
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    obstacles = [];
    fruit = spawnFruit();
    obstacles = spawnObstacles(5);
    score = 0;
    gameTime = 0;
    updateStateDisplay();
    updateUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
