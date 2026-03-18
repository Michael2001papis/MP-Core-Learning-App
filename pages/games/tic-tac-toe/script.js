/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
// משתנים עיקריים
let turn = true; // true עבור "X", false עבור "O"
let btnClicked = 0;
let board = Array(9).fill("");
let score = { X: 0, O: 0, Tie: 0 };
let gameActive = true;

// בחירת אלמנטים מה-DOM
const btns = document.querySelectorAll(".btn");
const gameModeSelect = document.getElementById("gameMode");
const aiLevelSelect = document.getElementById("aiLevel");
const aiLevelLabel = document.getElementById("aiLevelLabel");
const resetBtn = document.getElementById("resetBtn");
const stopBtn = document.getElementById("stopBtn");
const victoryTableBtn = document.getElementById("victoryTableBtn");
const playerXNameInput = document.getElementById("playerXName");
const playerONameInput = document.getElementById("playerOName");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreTieEl = document.getElementById("scoreTie");
const victoryTable = document.getElementById("victoryTable");
const playerXDisplayName = document.getElementById("playerXDisplayName");
const playerODisplayName = document.getElementById("playerODisplayName");
const scoreXDisplay = document.getElementById("scoreXDisplay");
const scoreODisplay = document.getElementById("scoreODisplay");

// מאזינים ללחיצות
btns.forEach(btn => {
  if (btn) btn.addEventListener("click", () => {
    if (!gameActive) return;
    handleClick(btn);
  });
});

if (resetBtn) resetBtn.addEventListener("click", resetGame);
if (stopBtn) stopBtn.addEventListener("click", stopGame);
if (victoryTableBtn) victoryTableBtn.addEventListener("click", toggleVictoryTable);

// הצגת/הסתרת רמת קושי לפי מצב משחק
if (gameModeSelect) gameModeSelect.addEventListener("change", () => {
  if (gameModeSelect.value === "pvc") {
    if (playerONameInput) { playerONameInput.value = "מחשב"; playerONameInput.disabled = true; }
    if (aiLevelLabel) aiLevelLabel.classList.remove("hidden");
    if (aiLevelSelect) aiLevelSelect.classList.remove("hidden");
  } else {
    if (playerONameInput) { playerONameInput.disabled = false; }
    if (aiLevelLabel) aiLevelLabel.classList.add("hidden");
    if (aiLevelSelect) aiLevelSelect.classList.add("hidden");
  }
});

const GAME_HISTORY_KEY = "tttGameHistory";
const SAVE_STATE_KEY = "gameHubTttState";

function saveGameState() {
  if (!gameActive && btnClicked === 0) return;
  try {
    var data = {
      board: board.slice(),
      turn: turn,
      score: { X: score.X, O: score.O, Tie: score.Tie },
      btnClicked: btnClicked,
      gameMode: gameModeSelect ? gameModeSelect.value : "pvc",
      aiLevel: aiLevelSelect ? aiLevelSelect.value : "hard",
      playerX: playerXNameInput ? playerXNameInput.value : "",
      playerO: playerONameInput ? playerONameInput.value : "",
      ts: Date.now()
    };
    localStorage.setItem(SAVE_STATE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function loadGameState() {
  try {
    var raw = localStorage.getItem(SAVE_STATE_KEY);
    if (!raw) return null;
    var s = JSON.parse(raw);
    if (!s || !Array.isArray(s.board) || s.board.length !== 9) return null;
    if (Date.now() - (s.ts || 0) > 24 * 60 * 60 * 1000) return null;
    return s;
  } catch (e) { return null; }
}

function clearSavedState() {
  try { localStorage.removeItem(SAVE_STATE_KEY); } catch (e) {}
}

function restoreBoardFromState(s) {
  board = s.board.slice();
  turn = s.turn;
  score = { X: s.score.X || 0, O: s.score.O || 0, Tie: s.score.Tie || 0 };
  btnClicked = s.btnClicked || 0;
  gameActive = true;
  btns.forEach(function(btn, i) {
    var v = board[i];
    if (v) setCell(btn, v); else { btn.textContent = ""; btn.classList.remove("win", "x", "o", "filled"); }
  });
  updateScore();
  updateVictoryTable();
  if (gameModeSelect) gameModeSelect.value = s.gameMode || "pvc";
  if (aiLevelSelect) aiLevelSelect.value = s.aiLevel || "hard";
  if (playerXNameInput) playerXNameInput.value = s.playerX || "";
  if (playerONameInput) { playerONameInput.value = s.playerO || "מחשב"; playerONameInput.disabled = s.gameMode === "pvc"; }
  if (aiLevelLabel) aiLevelLabel.classList.toggle("hidden", s.gameMode !== "pvc");
  if (aiLevelSelect) aiLevelSelect.classList.toggle("hidden", s.gameMode !== "pvc");
}

function getGameHistory() {
  try {
    return JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || '{"total":0,"wins":0}');
  } catch { return { total: 0, wins: 0 }; }
}

function saveGameHistory(result) {
  const h = getGameHistory();
  h.total++;
  if (result === "win") h.wins++;
  localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(h));
}

function updateGameStats() {
  const el = document.getElementById("gameStats");
  if (!el) return;
  const h = getGameHistory();
  const pct = h.total ? Math.round((h.wins / h.total) * 100) : 0;
  el.textContent = "משחקים: " + h.total + " | ניצחונות: " + pct + "%";
}

function showConfetti() {
  const colors = ["#f59e0b", "#22d3ee", "#22c55e", "#6366f1"];
  for (let i = 0; i < 35; i++) {
    const p = document.createElement("div");
    const angle = (i / 35) * Math.PI * 2;
    const dist = 120 + Math.random() * 180;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.cssText = `
      position:fixed;width:10px;height:10px;background:${colors[i % colors.length]};
      left:50%;top:50%;margin-left:-5px;margin-top:-5px;border-radius:2px;
      pointer-events:none;z-index:9999;animation:cf${i} 1s ease-out forwards;
    `;
    const keyframes = `@keyframes cf${i}{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(${dx}px,${dy}px) rotate(360deg);opacity:0}}`;
    const st = document.createElement("style");
    st.textContent = keyframes;
    document.head.appendChild(st);
    document.body.appendChild(p);
    setTimeout(() => { p.remove(); st.remove(); }, 1000);
  }
}

function updateVictoryTable() {
  if (playerXDisplayName) playerXDisplayName.textContent = (playerXNameInput && playerXNameInput.value) || "שחקן X";
  if (playerODisplayName) playerODisplayName.textContent = (playerONameInput && playerONameInput.value) || "שחקן O";
  if (scoreXDisplay) scoreXDisplay.textContent = score.X;
  if (scoreODisplay) scoreODisplay.textContent = score.O;
}

function setCell(btn, value) {
  if (!btn) return;
  btn.textContent = "";
  btn.classList.remove("x", "o", "filled");
  btn.classList.add("filled");
  const span = document.createElement("span");
  span.textContent = value;
  span.className = value === "X" ? "x" : "o";
  btn.appendChild(span);
}

function handleClick(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  if (board[index] !== "") return;

  const symbol = turn ? "X" : "O";
  board[index] = symbol;
  setCell(btn, symbol);
  btnClicked++;
  if (typeof SOUNDS !== "undefined") SOUNDS.click();

  const result = checkWin();
  if (result.win) {
    updateScore(symbol);
    highlightWin(result.pos);
    if (typeof SOUNDS !== "undefined") SOUNDS.win();
    if (typeof showConfetti === "function") showConfetti();
    saveGameHistory("win");
    setTimeout(() => {
      showMessage((turn ? playerXNameInput.value : playerONameInput.value) + " ניצח/ה!");
      updateVictoryTable();
      updateGameStats();
      resetBoard();
    }, 400);
    return;
  } else if (result.tie) {
    score.Tie++;
    updateScore();
    if (typeof SOUNDS !== "undefined") SOUNDS.tie();
    saveGameHistory("tie");
    setTimeout(() => {
      showMessage("תיקו!", "info");
      updateVictoryTable();
      updateGameStats();
      resetBoard();
    }, 400);
    return;
  }

  turn = !turn;


  if (gameModeSelect.value === "pvc" && !turn) {
    setTimeout(computerMove, 400);
  }
}

// אלגוריתם Minimax - מחשב בלתי מנוצח
function minimax(boardState, depth, isMaximizing) {
  const result = checkWinState(boardState);
  if (result !== null) {
    if (result === "X") return -10 + depth;
    if (result === "O") return 10 - depth;
    return 0; // תיקו
  }

  const available = boardState.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  if (available.length === 0) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const idx of available) {
      const newBoard = [...boardState];
      newBoard[idx] = "O";
      best = Math.max(best, minimax(newBoard, depth + 1, false));
    }
    return best;
  } else {
    let best = Infinity;
    for (const idx of available) {
      const newBoard = [...boardState];
      newBoard[idx] = "X";
      best = Math.min(best, minimax(newBoard, depth + 1, true));
    }
    return best;
  }
}

function checkWinState(b) {
  const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a, x, c] of combos) {
    if (b[a] && b[a] === b[x] && b[a] === b[c]) return b[a];
  }
  if (b.every(c => c !== "")) return "tie";
  return null;
}

function computerMove() {
  const level = aiLevelSelect.value;
  const available = board.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  if (available.length === 0) return;

  let move;
  if (level === "easy") {
    move = available[Math.floor(Math.random() * available.length)];
  } else if (level === "medium") {
    // 50% minimax, 50% random
    move = Math.random() < 0.5
      ? available[Math.floor(Math.random() * available.length)]
      : getBestMove();
  } else {
    move = getBestMove();
  }

  var btn = document.querySelector(".btn[data-index=\"" + move + "\"]");
  if (!btn) return;
  board[move] = "O";
  setCell(btn, "O");
  btnClicked++;

  const result = checkWin();
  if (result.win) {
    updateScore("O");
    highlightWin(result.pos);
    if (typeof SOUNDS !== "undefined") SOUNDS.win();
    if (typeof showConfetti === "function") showConfetti();
    saveGameHistory("win");
    setTimeout(() => {
      showMessage(playerONameInput.value + " ניצח!");
      updateVictoryTable();
      updateGameStats();
      resetBoard();
    }, 400);
    return;
  } else if (result.tie) {
    score.Tie++;
    updateScore();
    if (typeof SOUNDS !== "undefined") SOUNDS.tie();
    saveGameHistory("tie");
    setTimeout(() => {
      showMessage("תיקו!", "info");
      updateVictoryTable();
      updateGameStats();
      resetBoard();
    }, 400);
    return;
  }
  turn = !turn;
}

function getBestMove() {
  const available = board.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  let bestScore = -Infinity;
  let bestMove = available[0];
  for (const idx of available) {
    const newBoard = [...board];
    newBoard[idx] = "O";
    const score = minimax(newBoard, 0, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }
  return bestMove;
}

function checkWin() {
  const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let result = { win: false, tie: false, pos: [] };
  for (const combo of combos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      result.win = true;
      result.pos = combo;
      return result;
    }
  }
  if (btnClicked === 9) result.tie = true;
  return result;
}

function highlightWin(posArray) {
  posArray.forEach(i => {
    const btn = document.querySelector(`.btn[data-index="${i}"]`);
    btn.classList.add("win");
  });
}

function updateScore(winner) {
  if (winner === "X") score.X++;
  if (winner === "O") score.O++;
  if (scoreXEl) scoreXEl.textContent = "X: " + score.X;
  if (scoreOEl) scoreOEl.textContent = "O: " + score.O;
  if (scoreTieEl) scoreTieEl.textContent = "תיקו: " + score.Tie;
}

function resetBoard() {
  board = Array(9).fill("");
  btnClicked = 0;
  turn = true;
  btns.forEach(btn => {
    btn.textContent = "";
    btn.classList.remove("win", "x", "o", "filled");
  });
  gameActive = true;
  clearSavedState();
}

function resetGame() {
  score = { X: 0, O: 0, Tie: 0 };
  updateScore();
  updateVictoryTable();
  updateGameStats();
  resetBoard();
}

document.addEventListener("DOMContentLoaded", function() {
  updateGameStats();
  var saved = loadGameState();
  if (saved) {
    restoreBoardFromState(saved);
    showMessage("המשך משחק שמור", "info");
  }
  window.addEventListener("beforeunload", function() {
    if (gameActive && btnClicked > 0) saveGameState();
  });
});

function stopGame() {
  gameActive = false;
  saveGameState();
  showMessage("המשחק נעצר!", "info");
}

function toggleVictoryTable() {
  if (victoryTable) victoryTable.classList.toggle("hidden");
}

function showMessage(msg, type = "success") {
  const existing = document.getElementById("game-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "game-toast";
  toast.textContent = msg;
  const bg = type === "success" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#f59e0b,#d97706)";
  toast.style.cssText = `
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    padding: 1rem 2rem; background: ${bg};
    color: #fff; font-weight: 600; border-radius: 12px; z-index: 9999;
    box-shadow: 0 10px 40px rgba(0,0,0,0.4); animation: toastIn 0.3s ease;
  `;
  if (!document.getElementById("toast-style")) {
    const s = document.createElement("style");
    s.id = "toast-style";
    s.textContent = "@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}";
    document.head.appendChild(s);
  }
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
