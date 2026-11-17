const fileInput = document.querySelector('#game-file');
const fileStatus = document.querySelector('#file-status');
const playerWarning = document.querySelector('#player-warning');

function openGameDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lego-star-wars-arcade', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('selected-game')) {
        db.createObjectStore('selected-game');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSelectedGame(file) {
  const db = await openGameDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('selected-game', 'readwrite');
    transaction.objectStore('selected-game').put(file, 'current');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const size = file.size >= 1024 ** 3
      ? `${(file.size / 1024 ** 3).toFixed(2)} GB`
      : `${(file.size / 1024 ** 2).toFixed(1)} MB`;
    fileStatus.textContent = `SELECTED: ${file.name} · ${size} · LOCAL FILE ONLY`;
    fileStatus.classList.add('selected');
    playerWarning.textContent = 'Saving your game locally for the emulator…';
    saveSelectedGame(file).then(() => {
      playerWarning.textContent = 'Game ready. Open the emulator player to start.';
    }).catch(() => {
      playerWarning.textContent = 'The browser could not store the file. Open the emulator and select it again.';
    });
  });
}

function setCheck(name, label, state) {
  const row = document.querySelector(`[data-check="${name}"] strong`);
  if (!row) return;
  row.textContent = label;
  row.classList.remove('ok', 'warn');
  if (state === 'ok') row.classList.add('ok');
  if (state === 'warn') row.classList.add('warn');
}

setCheck('secure', window.isSecureContext ? 'READY' : 'NEEDS HTTPS', window.isSecureContext ? 'ok' : 'warn');
setCheck('isolation', window.crossOriginIsolated ? 'READY' : 'HEADERS NEEDED', window.crossOriginIsolated ? 'ok' : 'warn');
setCheck('webgpu', navigator.gpu ? 'AVAILABLE' : 'NOT DETECTED', navigator.gpu ? 'ok' : 'warn');
setCheck('gamepad', 'CONNECT A CONTROLLER', 'warn');

function checkGamepads() {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  const status = document.querySelector('#controller-status');
  const row = document.querySelector('[data-check="gamepad"] strong');
  if (pads.length) {
    const pad = pads[0];
    if (status) {
      status.classList.add('connected');
      status.innerHTML = `<span class="controller-dot"></span> CONTROLLER DETECTED: ${pad.id.replace(/[<>]/g, '')}`;
    }
    if (row) { row.textContent = 'CONNECTED'; row.className = 'ok'; }
  }
}
window.addEventListener('gamepadconnected', checkGamepads);
window.addEventListener('gamepaddisconnected', () => {
  const status = document.querySelector('#controller-status');
  if (status) { status.classList.remove('connected'); status.textContent = 'CONTROLLER CHECK: WAITING FOR INPUT'; }
  setCheck('gamepad', 'CONNECT A CONTROLLER', 'warn');
});
checkGamepads();

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}
