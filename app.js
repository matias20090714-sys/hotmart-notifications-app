// ===================================================
// HOTMART LIVE BURST NOTIFICATION ENGINE (iOS 16+ & Android)
// ===================================================

let swRegistration = null;

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
  ]
};

// Elements
const elements = {
  btnToggleBurst: document.getElementById('btnToggleBurst'),
  btnSingleSale: document.getElementById('btnSingleSale'),
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
  iosGuideModal: document.getElementById('iosGuideModal')
};

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
// AUDIO SYSTEM (Real Hotmart Cash Register Ka-Ching)
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
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCashRegister() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1. Moneda inicial / Impacto de caja registradora
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      osc1.frequency.exponentialRampToValueAtTime(1975.53, now + 0.08);
      
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // 2. Timbre brillante clásico de Hotmart ("Ka-Ching!")
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2093.00, now + 0.06);
      osc2.frequency.setValueAtTime(2637.02, now + 0.12);
      osc2.frequency.setValueAtTime(3135.96, now + 0.18);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.45, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.7);

      // 3. Campana armónica final
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(4186.01, now + 0.1);
      gain3.gain.setValueAtTime(0.2, now + 0.1);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.1);
      osc3.stop(now + 0.55);

    } catch (e) {
      console.warn("Audio error:", e);
    }
  }
}

const sfx = new SoundFX();

// ===================================================
// SERVICE WORKER & NATIVE NOTIFICATIONS REGISTRATION
// ===================================================
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log("Service Worker registrado con éxito:", swRegistration);
    } catch (err) {
      console.warn("Error al registrar Service Worker:", err);
    }
  }
}

async function requestNativePushPermission() {
  sfx.init();

  // Detect iOS Safari standalone requirement
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && !isStandalone) {
    if (elements.iosGuideModal) {
      elements.iosGuideModal.classList.add('show');
    }
    showToast("📱 En iPhone: Toca Compartir y luego 'Agregar a Inicio'");
  }

  if (!("Notification" in window)) {
    showToast("⚠️ Este navegador no soporta notificaciones de sistema.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      state.pushEnabled = true;
      updatePushBtnState(true);
      showToast("🔔 ¡Notificaciones nativas activadas en tu iPhone!");
      
      // Test notification
      dispatchNativeNotification("¡Venta realizada!", "Has recibido una comisión de US$ 97.00 por el producto 'Método Pro'.");
      return true;
    } else {
      state.pushEnabled = false;
      updatePushBtnState(false);
      showToast("❌ Permiso de notificaciones no concedido.");
      return false;
    }
  } catch (e) {
    console.error("Error al solicitar permiso:", e);
    return false;
  }
}

function updatePushBtnState(active) {
  if (!elements.btnEnablePush) return;
  if (active) {
    elements.btnEnablePush.classList.add('active');
    elements.btnEnablePush.innerHTML = `<span>🔔</span> Notificaciones iPhone: <strong>ACTIVADAS</strong>`;
  } else {
    elements.btnEnablePush.classList.remove('active');
    elements.btnEnablePush.innerHTML = `<span>📲</span> Activar Notificaciones en mi iPhone`;
  }
}

function dispatchNativeNotification(title, body) {
  if (!state.pushEnabled && Notification.permission !== "granted") return;

  const iconUrl = new URL('./hotmart-icon.svg', window.location.href).href;

  // 1. Try Service Worker Show Notification (Primary for iOS)
  if (swRegistration && swRegistration.showNotification) {
    swRegistration.showNotification(title, {
      body: body,
      icon: iconUrl,
      badge: iconUrl,
      tag: 'hotmart-' + Date.now(),
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200]
    }).catch(() => {
      // Fallback
      try {
        new Notification(title, { body, icon: iconUrl });
      } catch (e) {}
    });
  } else {
    // 2. Direct Notification Fallback
    try {
      new Notification(title, {
        body: body,
        icon: iconUrl,
        badge: iconUrl,
        tag: 'hotmart-' + Date.now(),
        renotify: true
      });
    } catch (e) {
      console.warn("Direct notification failed:", e);
    }
  }
}

// ===================================================
// VIBRATION & WAKE LOCK
// ===================================================
function triggerVibrate() {
  if (state.vibrateEnabled && 'vibrate' in navigator) {
    try {
      navigator.vibrate([140, 60, 160]);
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
// HOTMART DATA GENERATOR
// ===================================================
function generateSaleData() {
  const curr = CURRENCY_MAP[state.currency] || CURRENCY_MAP.USD;
  
  let amount = 0;
  if (state.fixedAmount && state.fixedAmount > 0) {
    amount = state.fixedAmount;
  } else {
    const min = Math.min(state.minAmount, state.maxAmount);
    const max = Math.max(state.minAmount, state.maxAmount);
    amount = (Math.random() * (max - min) + min).toFixed(2);
  }

  let product = "";
  if (state.customProduct && state.customProduct.trim().length > 0) {
    product = state.customProduct.trim();
  } else {
    product = state.products[Math.floor(Math.random() * state.products.length)];
  }

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
// SALE DISPATCHER
// ===================================================
function triggerSingleSale() {
  const sale = generateSaleData();

  // Sound & Vibration
  sfx.playCashRegister();
  triggerVibrate();

  // Real iPhone Notification
  dispatchNativeNotification(sale.title, sale.body);

  // Metrics
  state.totalSales += 1;
  state.totalRevenue += sale.amount;
  updateStatsDisplay();

  // Dynamic Island
  triggerDynamicIsland(sale);

  // Lockscreen Feed
  renderBannerToFeed(sale);
}

function triggerDynamicIsland(sale) {
  if (!elements.dynamicIsland) return;
  elements.islandTitle.textContent = "¡Venta Realizada!";
  elements.islandSub.textContent = `+${sale.formattedAmount}`;
  
  elements.dynamicIsland.classList.add('expanded');
  clearTimeout(elements.dynamicIsland._timeout);
  elements.dynamicIsland._timeout = setTimeout(() => {
    elements.dynamicIsland.classList.remove('expanded');
  }, 1300);
}

function renderBannerToFeed(sale) {
  const feed = elements.notificationFeed;
  if (!feed) return;
  
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

  feed.insertBefore(banner, feed.firstChild);

  if (feed.children.length > 30) {
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

  showToast("🔥 ¡Ráfaga iniciada en tu iPhone!");

  function loop() {
    if (!state.isRunning) return;
    triggerSingleSale();

    let nextDelay = state.speedMs;
    if (state.isRandomSpeed) {
      nextDelay = Math.floor(Math.random() * (state.speedMs * 1.4 - 150) + 150);
    }

    state.timerId = setTimeout(loop, Math.max(120, nextDelay));
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

  showToast("⏸️ Ráfaga detenida.");
}

function toggleBurst() {
  if (state.isRunning) {
    stopBurst();
  } else {
    startBurst();
  }
}

function updateStatsDisplay() {
  const curr = CURRENCY_MAP[state.currency] || CURRENCY_MAP.USD;
  if (elements.statRevenue) {
    elements.statRevenue.textContent = `${curr.prefix}${state.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (elements.statSales) {
    elements.statSales.textContent = state.totalSales.toLocaleString();
  }
  if (elements.statSpeed) {
    const speedSec = (state.speedMs / 1000).toFixed(1);
    elements.statSpeed.textContent = state.isRandomSpeed ? 'Ráfaga' : `${speedSec}s`;
  }
  if (elements.statRate) {
    if (state.startTime && state.totalSales > 0) {
      const elapsedMins = Math.max(0.05, (Date.now() - state.startTime) / 60000);
      const rate = Math.round(state.totalSales / elapsedMins);
      elements.statRate.textContent = `${rate}/min`;
    } else {
      elements.statRate.textContent = `0/min`;
    }
  }
}

function updatePhoneClock() {
  const now = new Date();
  if (elements.lockTime) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    elements.lockTime.textContent = `${hours}:${minutes}`;
  }
  if (elements.lockDate) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    let dateStr = now.toLocaleDateString('es-ES', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    elements.lockDate.textContent = dateStr;
  }
}

function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(elements.toast._timeout);
  elements.toast._timeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2800);
}

// ===================================================
// INITIALIZATION
// ===================================================
function initEvents() {
  registerServiceWorker();

  // Check if permission already granted
  if ("Notification" in window && Notification.permission === "granted") {
    state.pushEnabled = true;
    updatePushBtnState(true);
  }

  elements.btnToggleBurst.addEventListener('click', toggleBurst);
  elements.btnSingleSale.addEventListener('click', () => {
    sfx.init();
    triggerSingleSale();
  });
  
  elements.btnEnablePush.addEventListener('click', requestNativePushPermission);

  elements.speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (val === 0) {
      state.isRandomSpeed = true;
      state.speedMs = 350;
      elements.speedDisplay.textContent = "Modo Extremo (Ráfaga continua)";
    } else {
      state.isRandomSpeed = false;
      state.speedMs = val;
      elements.speedDisplay.textContent = `${(val / 1000).toFixed(1)}s por notificación`;
    }
    updateStatsDisplay();
  });

  elements.currencySelect.addEventListener('change', (e) => {
    state.currency = e.target.value;
    updateStatsDisplay();
  });

  elements.minAmountInput.addEventListener('change', (e) => {
    state.minAmount = parseFloat(e.target.value) || 10;
  });
  elements.maxAmountInput.addEventListener('change', (e) => {
    state.maxAmount = parseFloat(e.target.value) || 100;
  });

  elements.customProductInput.addEventListener('input', (e) => {
    state.customProduct = e.target.value;
  });

  elements.soundToggle.addEventListener('change', (e) => {
    state.soundEnabled = e.target.checked;
    if (state.soundEnabled) sfx.playCashRegister();
  });

  elements.vibrateToggle.addEventListener('change', (e) => {
    state.vibrateEnabled = e.target.checked;
    if (state.vibrateEnabled) triggerVibrate();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  updatePhoneClock();
  setInterval(updatePhoneClock, 1000);
  updateStatsDisplay();

  setTimeout(() => {
    renderBannerToFeed({
      title: "¡Venta realizada!",
      body: `Has recibido una comisión de US$ 87.50 por el producto "Método Venta Automática Pro".`,
      formattedAmount: "US$ 87.50",
      product: "Método Venta Automática Pro",
      time: "ahora"
    });
  }, 200);
});
