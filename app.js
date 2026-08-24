// ===================================================
// HOTMART BURST NOTIFICATIONS ENGINE
// Ultra-Realistic Hotmart App Simulation & Push Notifications
// ===================================================

const state = {
  isRunning: false,
  timerId: null,
  totalSales: 0,
  totalRevenue: 0,
  startTime: null,
  currency: 'USD',
  minAmount: 27,
  maxAmount: 147,
  fixedAmount: null,
  speedMs: 500,
  isRandomSpeed: false,
  soundEnabled: true,
  vibrateEnabled: true,
  pushEnabled: false,
  wakeLock: null,
  products: [
    "Método Tráfico Automático Pro",
    "Fórmula de Lanzamiento Digital",
    "Masterclass High Ticket 2026",
    "Academia E-commerce & Afiliados",
    "IA para Creadores de Contenido",
    "Monetización Digital Express",
    "Copywriting & Ventas Persuasivas",
    "Mentalidad de Éxito y Finanzas",
    "Reto 7 Días Primeras Ventas",
    "Club de Creadores Digitales"
  ],
  buyers: [
    "Carlos Mendoza", "Valentina Gómez", "Mateo Rodríguez", "Sofía Fernández",
    "Lucas Morales", "Camila Silva", "Diego Torres", "Mariana Ríos",
    "Andrés Romero", "Lucía Navarro", "Gabriel Castro", "Elena Vargas"
  ]
};

// DOM Elements
const elements = {
  btnToggleBurst: document.getElementById('btnToggleBurst'),
  btnSingleSale: document.getElementById('btnSingleSale'),
  btnClearFeed: document.getElementById('btnClearFeed'),
  btnEnablePush: document.getElementById('btnEnablePush'),
  statRevenue: document.getElementById('statRevenue'),
  statSales: document.getElementById('statSales'),
  statSpeed: document.getElementById('statSpeed'),
  statRate: document.getElementById('statRate'),
  notificationFeed: document.getElementById('notificationFeed'),
  dynamicIsland: document.getElementById('dynamicIsland'),
  islandTitle: document.getElementById('islandTitle'),
  islandSub: document.getElementById('islandSub'),
  lockTime: document.getElementById('lockTime'),
  lockDate: document.getElementById('lockDate'),
  speedSlider: document.getElementById('speedSlider'),
  speedDisplay: document.getElementById('speedDisplay'),
  currencySelect: document.getElementById('currencySelect'),
  minAmountInput: document.getElementById('minAmountInput'),
  maxAmountInput: document.getElementById('maxAmountInput'),
  customProductInput: document.getElementById('customProductInput'),
  soundToggle: document.getElementById('soundToggle'),
  vibrateToggle: document.getElementById('vibrateToggle'),
  toast: document.getElementById('toast'),
  qrImage: document.getElementById('qrImage')
};

// Currency symbols mapping
const CURRENCY_MAP = {
  USD: { symbol: 'US$', prefix: 'US$ ' },
  EUR: { symbol: '€', prefix: '€ ' },
  BRL: { symbol: 'R$', prefix: 'R$ ' },
  MXN: { symbol: 'MXN', prefix: '$ ' },
  COP: { symbol: 'COP', prefix: '$ ' },
  PEN: { symbol: 'S/', prefix: 'S/ ' },
  ARS: { symbol: 'ARS', prefix: '$ ' },
  CLP: { symbol: 'CLP', prefix: '$ ' }
};

// ===================================================
// AUDIO SYSTEM (High Fidelity Web Audio Ka-Ching / Cash Sound)
// ===================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCashRegister() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1. Initial metallic coin drop / strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1975.53, now + 0.08); // B6
      
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // 2. High-pitch cash shimmer ("Cha-ching!" bell chime)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2093.00, now + 0.07); // C7
      osc2.frequency.setValueAtTime(2637.02, now + 0.14); // E7
      osc2.frequency.setValueAtTime(3135.96, now + 0.22); // G7

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.4, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.65);

      // 3. Resonant sparkle ring
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(4186.01, now + 0.12); // C8
      gain3.gain.setValueAtTime(0.18, now + 0.12);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.12);
      osc3.stop(now + 0.5);

    } catch (e) {
      console.warn("Audio play prevented:", e);
    }
  }
}

const sfx = new SoundFX();

// ===================================================
// VIBRATION & WAKE LOCK
// ===================================================
function triggerVibrate() {
  if (state.vibrateEnabled && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 60, 140]);
    } catch (e) {}
  }
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      state.wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {}
  }
}

function releaseWakeLock() {
  if (state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
}

// ===================================================
// NATIVE PUSH NOTIFICATIONS (Web Notification API)
// ===================================================
async function setupNativePush() {
  if (!("Notification" in window)) {
    showToast("⚠️ Tu navegador no soporta notificaciones de sistema.");
    return false;
  }

  if (Notification.permission === "granted") {
    state.pushEnabled = true;
    updatePushBtnState(true);
    showToast("✅ Notificaciones activas en tu celular.");
    return true;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    state.pushEnabled = true;
    updatePushBtnState(true);
    showToast("🎉 ¡Permiso concedido! Ahora recibirás las ráfagas.");
    sendSingleNotification("¡Bienvenido a Hotmart!", "Notificaciones en ráfaga configuradas con éxito.");
    return true;
  } else {
    state.pushEnabled = false;
    updatePushBtnState(false);
    showToast("❌ Permiso denegado por el navegador.");
    return false;
  }
}

function updatePushBtnState(active) {
  if (active) {
    elements.btnEnablePush.classList.add('active');
    elements.btnEnablePush.innerHTML = `<span>🔔</span> Notificaciones del Celular: <strong>ACTIVADAS</strong>`;
  } else {
    elements.btnEnablePush.classList.remove('active');
    elements.btnEnablePush.innerHTML = `<span>📲</span> Activar Notificaciones en mi Celular`;
  }
}

function sendNativePush(title, body) {
  if (!state.pushEnabled || Notification.permission !== "granted") return;
  try {
    const iconUrl = window.location.origin + '/hotmart-icon.svg';
    const notif = new Notification(title, {
      body: body,
      icon: './hotmart-icon.svg',
      badge: './hotmart-icon.svg',
      tag: 'hotmart-sale-' + Date.now(),
      renotify: true,
      silent: false
    });
    notif.onclick = function() {
      window.focus();
      this.close();
    };
  } catch (e) {
    console.warn("Push delivery error:", e);
  }
}

// ===================================================
// HOTMART NOTIFICATION BUILDER
// ===================================================
function generateSaleData() {
  const curr = CURRENCY_MAP[state.currency] || CURRENCY_MAP.USD;
  
  // Amount calculation
  let amount = 0;
  if (state.fixedAmount && state.fixedAmount > 0) {
    amount = state.fixedAmount;
  } else {
    const min = Math.min(state.minAmount, state.maxAmount);
    const max = Math.max(state.minAmount, state.maxAmount);
    amount = (Math.random() * (max - min) + min).toFixed(2);
  }

  // Product Selection
  let product = "";
  if (state.customProduct && state.customProduct.trim().length > 0) {
    product = state.customProduct.trim();
  } else {
    product = state.products[Math.floor(Math.random() * state.products.length)];
  }

  // Realistic Hotmart Body Formats
  const formattedAmount = `${curr.prefix}${Number(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const title = "¡Venta realizada!";
  const body = `Has recibido una comisión de ${formattedAmount} por el producto "${product}".`;

  return {
    title,
    body,
    amount: parseFloat(amount),
    formattedAmount,
    product,
    time: "ahora"
  };
}

// ===================================================
// NOTIFICATION DISPATCHER & UI ANIMATIONS
// ===================================================
function triggerSingleSale() {
  const sale = generateSaleData();

  // 1. Play Sound & Vibration
  sfx.playCashRegister();
  triggerVibrate();

  // 2. Dispatch Native Phone Push Notification
  sendNativePush(sale.title, sale.body);

  // 3. Update Metrics
  state.totalSales += 1;
  state.totalRevenue += sale.amount;
  updateStatsDisplay();

  // 4. Trigger Dynamic Island Animation
  triggerDynamicIsland(sale);

  // 5. Add to Simulator Lockscreen Stream
  renderBannerToFeed(sale);
}

function triggerDynamicIsland(sale) {
  elements.islandTitle.textContent = "¡Venta Realizada!";
  elements.islandSub.textContent = `+${sale.formattedAmount}`;
  
  elements.dynamicIsland.classList.add('expanded');
  clearTimeout(elements.dynamicIsland._timeout);
  elements.dynamicIsland._timeout = setTimeout(() => {
    elements.dynamicIsland.classList.remove('expanded');
  }, 1400);
}

function renderBannerToFeed(sale) {
  const feed = elements.notificationFeed;
  
  const banner = document.createElement('div');
  banner.className = 'hotmart-banner';
  banner.innerHTML = `
    <img src="./hotmart-icon.svg" alt="Hotmart" class="banner-app-icon" />
    <div class="banner-content">
      <div class="banner-header">
        <span class="banner-app-name">HOTMART</span>
        <span class="banner-time">ahora</span>
      </div>
      <div class="banner-title">${sale.title}</div>
      <div class="banner-body">
        Has recibido una comisión de <span class="banner-commission">${sale.formattedAmount}</span> por el producto <span class="banner-product">"${sale.product}"</span>.
      </div>
    </div>
  `;

  // Prepend to top of feed
  feed.insertBefore(banner, feed.firstChild);

  // Keep max 25 items in DOM for peak performance
  if (feed.children.length > 25) {
    feed.removeChild(feed.lastChild);
  }
}

// ===================================================
// BURST ENGINE LOOP
// ===================================================
function startBurst() {
  sfx.init();
  state.isRunning = true;
  state.startTime = Date.now();
  requestWakeLock();

  elements.btnToggleBurst.classList.add('running');
  elements.btnToggleBurst.innerHTML = `<span>⏹️</span> Detener Ráfaga`;

  showToast("🔥 ¡Ráfaga de notificaciones iniciada!");

  function loop() {
    if (!state.isRunning) return;
    triggerSingleSale();

    // Compute next interval
    let nextDelay = state.speedMs;
    if (state.isRandomSpeed) {
      nextDelay = Math.floor(Math.random() * (state.speedMs * 1.5 - 200) + 200);
    }

    state.timerId = setTimeout(loop, Math.max(150, nextDelay));
  }

  loop();
}

function stopBurst() {
  state.isRunning = false;
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
  releaseWakeLock();

  elements.btnToggleBurst.classList.remove('running');
  elements.btnToggleBurst.innerHTML = `<span>⚡</span> Iniciar Ráfaga en Vivo`;

  showToast("⏸️ Ráfaga pausada.");
}

function toggleBurst() {
  if (state.isRunning) {
    stopBurst();
  } else {
    startBurst();
  }
}

// ===================================================
// METRICS & STATS
// ===================================================
function updateStatsDisplay() {
  const curr = CURRENCY_MAP[state.currency] || CURRENCY_MAP.USD;
  elements.statRevenue.textContent = `${curr.prefix}${state.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  elements.statSales.textContent = state.totalSales.toLocaleString();

  // Speed calculation
  const speedSec = (state.speedMs / 1000).toFixed(1);
  elements.statSpeed.textContent = state.isRandomSpeed ? 'Aleatorio' : `${speedSec}s`;

  // Sales per minute rate
  if (state.startTime && state.totalSales > 0) {
    const elapsedMins = Math.max(0.05, (Date.now() - state.startTime) / 60000);
    const rate = Math.round(state.totalSales / elapsedMins);
    elements.statRate.textContent = `${rate}/min`;
  } else {
    elements.statRate.textContent = `0/min`;
  }
}

// ===================================================
// CLOCK & TIME SYNC
// ===================================================
function updatePhoneClock() {
  const now = new Date();
  
  // Format 12h/24h time: e.g. 20:15 or 08:15
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  elements.lockTime.textContent = `${hours}:${minutes}`;

  // Format Date: "Lunes, 24 de agosto"
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  let dateStr = now.toLocaleDateString('es-ES', options);
  dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  elements.lockDate.textContent = dateStr;
}

// ===================================================
// TOAST NOTIFICATIONS
// ===================================================
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(elements.toast._timeout);
  elements.toast._timeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2800);
}

// ===================================================
// EVENT LISTENERS & CONFIGURATION
// ===================================================
function initEvents() {
  // Burst Controls
  elements.btnToggleBurst.addEventListener('click', toggleBurst);
  elements.btnSingleSale.addEventListener('click', () => {
    sfx.init();
    triggerSingleSale();
  });
  
  elements.btnClearFeed.addEventListener('click', () => {
    elements.notificationFeed.innerHTML = '';
    state.totalSales = 0;
    state.totalRevenue = 0;
    state.startTime = null;
    updateStatsDisplay();
    showToast("🧹 Historial limpiado");
  });

  elements.btnEnablePush.addEventListener('click', setupNativePush);

  // Speed Slider
  elements.speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (val === 0) {
      state.isRandomSpeed = true;
      state.speedMs = 400;
      elements.speedDisplay.textContent = "Modo Locura / Aleatorio (0.2s - 0.6s)";
    } else {
      state.isRandomSpeed = false;
      state.speedMs = val;
      elements.speedDisplay.textContent = `${(val / 1000).toFixed(1)} segundos por notificación`;
    }
    updateStatsDisplay();
  });

  // Currency
  elements.currencySelect.addEventListener('change', (e) => {
    state.currency = e.target.value;
    updateStatsDisplay();
  });

  // Amounts
  elements.minAmountInput.addEventListener('change', (e) => {
    state.minAmount = parseFloat(e.target.value) || 10;
  });
  elements.maxAmountInput.addEventListener('change', (e) => {
    state.maxAmount = parseFloat(e.target.value) || 100;
  });

  // Custom Product
  elements.customProductInput.addEventListener('input', (e) => {
    state.customProduct = e.target.value;
  });

  // Toggles
  elements.soundToggle.addEventListener('change', (e) => {
    state.soundEnabled = e.target.checked;
    if (state.soundEnabled) sfx.playCashRegister();
  });
  elements.vibrateToggle.addEventListener('change', (e) => {
    state.vibrateEnabled = e.target.checked;
    if (state.vibrateEnabled) triggerVibrate();
  });

  // Update QR Code with current URL
  if (elements.qrImage) {
    const currentUrl = encodeURIComponent(window.location.href);
    elements.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${currentUrl}`;
  }
}

// Initial Kickoff
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  updatePhoneClock();
  setInterval(updatePhoneClock, 1000);
  updateStatsDisplay();

  // Initial greeting preview
  setTimeout(() => {
    renderBannerToFeed({
      title: "¡Venta realizada!",
      body: `Has recibido una comisión de US$ 87.50 por el producto "Método Venta Automática Pro".`,
      formattedAmount: "US$ 87.50",
      product: "Método Venta Automática Pro",
      time: "ahora"
    });
  }, 300);
});
