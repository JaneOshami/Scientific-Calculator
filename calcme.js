const input = document.querySelector('.calc-input');
let currentExpression = '';
let previousResult = 0;
let isShiftActive = false;
let isPoweredOn = false;
let currentAngleMode = 'DEG'; // Toggles between DEG and RAD
let lastAnswer = 0;
let isFractionDisplay = false;
const calculationHistory = []; // Stores max 20 entries
const themeDots = document.querySelectorAll('.theme-dot');

function updateAngleModeDisplay() {
  const indicator = document.getElementById('angle-mode-indicator');
  const degRadBtn = document.getElementById('deg-rad-btn');
  const shiftIndicator = document.getElementById('shift-indicator');

  if (indicator) indicator.textContent = isPoweredOn ? currentAngleMode : '';
  if (degRadBtn) degRadBtn.textContent = currentAngleMode;
  if (shiftIndicator) shiftIndicator.textContent = isPoweredOn && isShiftActive ? 'SHIFT' : '';
}

function onFunction() {
  isPoweredOn = !isPoweredOn;
  if (!isPoweredOn) {
    currentExpression = '';
    isShiftActive = false;
    document.getElementById('shift-btn').classList.remove('active-shift');
    input.value = '';
  }
  updateDisplay();
  updateAngleModeDisplay();
}

function replayFunction() {
  updateDisplay();
}

function shiftFunction() {
  isShiftActive = !isShiftActive;
  document.getElementById('shift-btn').classList.toggle('active-shift', isShiftActive);
  updateAngleModeDisplay();
}

function toggleShift() {
  shiftFunction();
}

function updateDisplay() {
  const displayExpression = currentExpression.replace(/root\(/g, '√(');
  input.value = isPoweredOn ? (displayExpression || '0') : ''; // Nothing shows when OFF, 0 shows when ON
}

function appendValue(value) {
  if (!isPoweredOn) return;
  if (value === 'x10^') {
    value = /[\d)]$/.test(currentExpression) ? '*10^' : '10^';
  }
  currentExpression += value;
  updateDisplay();
}

function deleteLast() {
  currentExpression = currentExpression.slice(0, -1);
  updateDisplay();
}

function autoCloseParentheses(expression) { 
  if (!expression) return expression;
  const openCount = (expression.match(/\(/g) || []).length;
  const closeCount = (expression.match(/\)/g) || []).length;
  const missingClosures = Math.max(0, openCount - closeCount);
  return missingClosures ? `${expression}${')'.repeat(missingClosures)}` : expression;
}

function clearScreen() {
  currentExpression = '';
  updateDisplay();
}

function previousAnswer() {
  appendValue(String(previousResult));
}

function toggleAngleMode() {
  if (!isPoweredOn) return;
  currentAngleMode = currentAngleMode === 'DEG' ? 'RAD' : 'DEG';
  updateAngleModeDisplay();
}

// Convert input angle to normalized degrees (0 to 360)
function toDegrees(angle) {
  if (currentAngleMode === 'RAD') {
    angle = (angle * 180) / Math.PI;
  }
  let deg = angle % 360;
  if (deg < 0) deg += 360;
  return Math.round(deg * 1e9) / 1e9; // Clean precision
}

// Exact Casio-style representations for standard angles
function customSin(angle) {
  const deg = toDegrees(angle);
  const exact = {
    0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1',
    120: '√3/2', 135: '√2/2', 150: '1/2', 180: '0',
    210: '-1/2', 225: '-√2/2', 240: '-√3/2', 270: '-1',
    300: '-√3/2', 315: '-√2/2', 330: '-1/2', 360: '0'
  };
  if (exact[deg] !== undefined) return exact[deg];
  
  const rad = currentAngleMode === 'DEG' ? (angle * Math.PI) / 180 : angle;
  return Number(Math.sin(rad).toFixed(8)).toString();
}

function customCos(angle) {
  const deg = toDegrees(angle);
  const exact = {
    0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0',
    120: '-1/2', 135: '-√2/2', 150: '-√3/2', 180: '-1',
    210: '-√3/2', 225: '-√2/2', 240: '-1/2', 270: '0',
    300: '1/2', 315: '√2/2', 330: '√3/2', 360: '1'
  };
  if (exact[deg] !== undefined) return exact[deg];

  const rad = currentAngleMode === 'DEG' ? (angle * Math.PI) / 180 : angle;
  return Number(Math.cos(rad).toFixed(8)).toString();
}

function customTan(angle) {
  const deg = toDegrees(angle);
  const exact = {
    0: '0', 30: '√3/3', 45: '1', 60: '√3', 90: 'Math ERROR',
    120: '-√3', 135: '-1', 150: '-√3/3', 180: '0',
    210: '√3/3', 225: '1', 240: '√3', 270: 'Math ERROR',
    300: '-√3', 315: '-1', 330: '-√3/3', 360: '0'
  };
  if (exact[deg] !== undefined) return exact[deg];

  const rad = currentAngleMode === 'DEG' ? (angle * Math.PI) / 180 : angle;
  return Number(Math.tan(rad).toFixed(8)).toString();
}

function customAsin(value) {
  const angle = Math.asin(value);
  return currentAngleMode === 'DEG' ? (angle * 180) / Math.PI : angle;
}

function customAcos(value) {
  const angle = Math.acos(value);
  return currentAngleMode === 'DEG' ? (angle * 180) / Math.PI : angle;
}

function customAtan(value) {
  const angle = Math.atan(value);
  return currentAngleMode === 'DEG' ? (angle * 180) / Math.PI : angle;
}


// Factorial: x!
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Permutations: nPr(n, r)
function nPr(n, r) {
  if (n < r || n < 0 || r < 0) return NaN;
  return factorial(n) / factorial(n - r);
}

// Combinations: nCr(n, r)
function nCr(n, r) {
  if (n < r || n < 0 || r < 0) return NaN;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// Log with custom base: logBase(base, value)
function logBase(base, value) {
  if (!Number.isFinite(base) || !Number.isFinite(value)) return NaN;
  if (base <= 0 || base === 1 || value <= 0) return NaN;
  return Math.log(value) / Math.log(base);
}

// nth Root: root(n, x) -> n-th root of x
function root(n, x) {
  return Math.pow(x, 1 / n);
}

// Square Root
function sqrt(x) {
  return Math.sqrt(x);
}

// Fraction to Decimal (F↔D) Toggle
function fractionToDecimal() {
  if (!isPoweredOn || !currentExpression) return;

  const exactValues = {
    '1/2': 0.5,
    '√2/2': Math.SQRT2 / 2,
    '√3/2': Math.sqrt(3) / 2,
    '√3/3': Math.sqrt(3) / 3,
    '√3': Math.sqrt(3),
    '-1/2': -0.5,
    '-√2/2': -Math.SQRT2 / 2,
    '-√3/2': -Math.sqrt(3) / 2,
    '-√3/3': -Math.sqrt(3) / 3,
    '-√3': -Math.sqrt(3)
  };

  if (exactValues[currentExpression] !== undefined) {
    currentExpression = String(exactValues[currentExpression]);
    isFractionDisplay = false;
    updateDisplay();
    return;
  }
  
  if (!currentExpression.includes('/')) {
    const value = Number(currentExpression);
    if (!Number.isFinite(value)) return;

    let bestNumerator = Math.round(value);
    let bestDenominator = 1;
    let bestError = Math.abs(value - bestNumerator);

    for (let denominator = 2; denominator <= 10000; denominator++) {
      const numerator = Math.round(value * denominator);
      const error = Math.abs(value - numerator / denominator);

      if (error < bestError) {
        bestNumerator = numerator;
        bestDenominator = denominator;
        bestError = error;
      }
      if (error === 0) break;
    }

    currentExpression = `${bestNumerator}/${bestDenominator}`;
    isFractionDisplay = true;
  } else {
    const [numerator, denominator] = currentExpression.split('/').map(Number);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return;

    currentExpression = String(numerator / denominator);
    isFractionDisplay = false;
  }
  updateDisplay();
}

const shiftLabels = {
  'sin(': 'sin⁻¹',
  'cos(': 'cos⁻¹',
  'tan(': 'tan⁻¹'
};

function appendFunc(funcName) {
  if (!isPoweredOn) return;

  if (funcName === '√(') {
    funcName = 'root(';
  } else if (funcName === '√') {
    funcName = '√(';
  }

  if (isShiftActive && shiftLabels[funcName]) {
    const shiftedValues = {
      'sin(': 'asin(',
      'cos(': 'acos(',
      'tan(': 'atan('
    };

    if (funcName === 'fractodec') {
      previousAnswer();
      toggleShift();
      return;
    }

    funcName = shiftedValues[funcName];
    toggleShift();
  }

  const funcsWithParen = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', 'exp(', 'sqrt(', 'root(', 'logBase(', '√('];
  const normalizedFunc = funcsWithParen.includes(funcName) ? funcName : funcName;
  appendValue(normalizedFunc);
}

function calculate() {
  if (!isPoweredOn || !currentExpression) return;

  try {
    const originalExpression = currentExpression;
    let expression = autoCloseParentheses(currentExpression);
    expression = expression.replace(/(\d|\))(?=\s*(?:π|e)(?![\w]))/g, '$1*');
    expression = expression
      .replace(/π/g, 'Math.PI')
      .replace(/(?<![\w.])e(?![\w])/g, 'Math.E')
      .replace(/÷/g, '/')
      .replace(/x/g, '*')
      .replace(/\^/g, '**')
      .replace(/√\(/g, 'sqrt(')
      .replace(/√/g, 'sqrt(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/asin\(/g, 'customAsin(')
      .replace(/acos\(/g, 'customAcos(')
      .replace(/atan\(/g, 'customAtan(');

    expression = expression
      .replace(/(?<![a-zA-Z])sin\(/g, 'customSin(')
      .replace(/(?<![a-zA-Z])cos\(/g, 'customCos(')
      .replace(/(?<![a-zA-Z])tan\(/g, 'customTan(');

    expression = expression
      .replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)')
      .replace(/(\d+(?:\.\d+)?)%/g, '($1 / 100)');
      
    // Convert permutation and combination notation to function calls.
    expression = expression.replace(/(\d+)\s*(?:P|nPr)\s*(\d+)/g, 'nPr($1, $2)');
    expression = expression.replace(/(\d+)\s*(?:C|nCr)\s*(\d+)/g, 'nCr($1, $2)');


    expression = expression.replace(/(\d+(?:\.\d+)?)\*10\*\*(\d+)/g, '$1 * 10 ** $2');
    const result = Function(
      'factorial', 'nPr', 'nCr', 'logBase', 'root', 'sqrt', 'customSin', 'customCos', 'customTan',
      'customAsin', 'customAcos', 'customAtan',
      `"use strict"; return (${expression});`
    )(factorial, nPr, nCr, logBase, root, sqrt, customSin, customCos, customTan,
      customAsin, customAcos, customAtan);

    if (typeof result === 'number') {
      if (!Number.isFinite(result)) throw new Error('Invalid result');
      previousResult = Math.round(result * 1e10) / 1e10;
      currentExpression = String(previousResult);
    } else {
      currentExpression = String(result);
    }
    saveToHistory(originalExpression, currentExpression);
    updateDisplay();
  } catch (error) {
    input.value = 'Error';
  }
}

document.querySelectorAll('button').forEach((button) => {
  const label = button.textContent.trim();
  if (shiftLabels[label]) button.dataset.shift = shiftLabels[label];
});

document.addEventListener('keydown', (event) => {
  // Number keys (0 - 9) & Operators (+, -, .)
  if (/^[0-9.,+\-]$/.test(event.key)) {
    event.preventDefault();
    appendValue(event.key);
  } else if (event.key === '*') { // Asterisk -> multiplication
    event.preventDefault();
    appendValue('x');
  } else if (event.key === '/') { // Slash -> division 
    event.preventDefault(); // Prevents Quick Find in Firefox
    appendValue('÷');
  } else if (event.key === 'Enter' || event.key === '=') { // Calculate (= or Enter)
    event.preventDefault(); // Prevents default form submissions/clicks
    calculate();
  } else if (event.key === 'Backspace') { // Backspace -> DEL
    event.preventDefault();
    deleteLast();
  } else if (event.key === 'Escape' || event.key === 'Delete') { // Escape / Delete -> AC (All Clear)
    event.preventDefault();
    clearScreen();
  }
});

// Toggle the sidebar open/closed
function replayHistory() {
  if (!isPoweredOn) return;
  const panel = document.getElementById("history-panel");
  if (panel) {
    panel.classList.toggle("hidden");
  }
}

document.addEventListener('click', (event) => {
  const panel = document.getElementById('history-panel');
  const target = event.target;

  if (!panel || panel.classList.contains('hidden')) return;
  if (target.closest('.history-panel, .btn-replay')) return;

  panel.classList.add('hidden');
});

// Save calculation entry
function saveToHistory(expr, res) {
  // Prevent saving errors or empty runs
  if (res === "Error" || res === "Math ERROR" || !expr) return;

  // Keep maximum 20 calculations (FIFO)
  if (calculationHistory.length >= 20) {
    calculationHistory.shift();
  }

  calculationHistory.push({ expression: expr, result: res });
  renderHistory();
}

// Render the last 20 entries (newest on top)
function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;

  if (calculationHistory.length === 0) {
    list.innerHTML = '<li class="history-empty">No calculations yet</li>';
    return;
  }

  list.innerHTML = "";

  // Reverse so newest calculation appears at the top
  [...calculationHistory].reverse().forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <span class="hist-expr">${item.expression}</span>
      <span class="hist-res">${item.result}</span>
    `;

    // Clicking an item pastes the result back onto the screen
    li.onclick = () => selectHistoryResult(item.result);
    list.appendChild(li);
  });
}

// Insert clicked result back to calculator
function selectHistoryResult(val) {
  if (!isPoweredOn) return;

  if (currentExpression === "0" || currentExpression === "") {
    currentExpression = val.toString();
  } else {
    currentExpression += val.toString();
  }

  updateDisplay();
  replayHistory(); // Close panel after selection
}

// Theme Switcher Logic
function applyTheme(themeName) {
  document.body.setAttribute('data-theme', themeName);

  // Update active dot ring indicator
  themeDots.forEach(dot => {
    if (dot.getAttribute('data-theme') === themeName) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  //Save preference
  localStorage.setItem('jescalculator_theme', themeName);
}

// Attach click listeners to all 3 dots
themeDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const selectedTheme = dot.getAttribute('data-theme');
    applyTheme(selectedTheme);
  });
});

// Load saved theme on startup (defaulting to pink)
const savedTheme = localStorage.getItem('jescalculator_theme') || 'pink';
applyTheme(savedTheme);

updateDisplay();
updateAngleModeDisplay();
