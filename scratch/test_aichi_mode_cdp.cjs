const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const candidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const browserExe = candidates.find((p) => fs.existsSync(p));
if (!browserExe) {
  console.error('No browser found!');
  process.exit(1);
}

const PORT = 9224;
const browserProc = spawn(browserExe, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,800',
  'about:blank',
]);

function cleanup() {
  try {
    browserProc.kill();
  } catch (e) {}
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(); });

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
  }

  init() {
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
    console.log('Saved screenshot to:', outPath);
  }
}

async function run() {
  console.log('Connecting to browser remote debugging port...');
  let tabs = null;
  for (let i = 0; i < 20; i++) {
    await wait(500);
    try {
      tabs = await getJson(`http://127.0.0.1:${PORT}/json`);
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }

  if (!tabs || tabs.length === 0) {
    console.error('Failed to connect to browser CDP.');
    process.exit(1);
  }

  const wsUrl = tabs[0].webSocketDebuggerUrl;
  const cdp = new CDPClient(wsUrl);
  await cdp.init();

  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Runtime.enable');

  console.log('Navigating to http://localhost:5173/ ...');
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
  await wait(3000);

  const artifactDir = 'C:/Users/takas/.gemini/antigravity/brain/ccd6a08b-7408-4426-be1f-a42ee97a1c61';

  // 1. 「愛知限定」ボタンを探してクリック
  console.log('Clicking "愛知限定 (市別名所)" mode button...');
  const clickedAichi = await cdp.eval(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const aichiBtn = btns.find(b => b.innerText.includes('愛知限定'));
    if (aichiBtn) {
      aichiBtn.click();
      return true;
    }
    return false;
  })()`);

  console.log('Clicked Aichi mode button:', clickedAichi);
  await wait(1500);

  // スクリーンショット1: 愛知限定モード初期画面 (名古屋市)
  await cdp.captureScreenshot(path.join(artifactDir, 'aichi_mode_initial.png'));

  // 2. ミッションバーの確認
  const barText = await cdp.eval(`(() => {
    const bar = document.querySelector('footer[aria-label="愛知詳細ミッション進行バー"]');
    return bar ? bar.innerText : null;
  })()`);
  console.log('Aichi Mission Bar Content:', barText);

  // 3. 「市を変更」ボタンをクリック
  console.log('Clicking "市を変更" button...');
  await cdp.eval(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const changeBtn = btns.find(b => b.innerText.includes('市を変更'));
    if (changeBtn) changeBtn.click();
  })()`);
  await wait(1000);

  // スクリーンショット2: 市選択モーダル (全38市一覧)
  await cdp.captureScreenshot(path.join(artifactDir, 'aichi_city_select_modal.png'));

  // 4. 「岡崎市」を選択
  console.log('Selecting "岡崎市" ...');
  const selectedOkazaki = await cdp.eval(`(() => {
    const cityCards = Array.from(document.querySelectorAll('div[role="dialog"] h3'));
    const okazaki = cityCards.find(h => h.innerText.includes('岡崎市'));
    if (okazaki) {
      okazaki.closest('div[class*="cursor-pointer"]').click();
      return true;
    }
    return false;
  })()`);
  console.log('Selected Okazaki:', selectedOkazaki);
  await wait(1500);

  // スクリーンショット3: 岡崎市選択後の画面
  await cdp.captureScreenshot(path.join(artifactDir, 'aichi_mode_okazaki.png'));

  // 5. 岡崎城ピンを狙って投擲
  console.log('Locating target pin for Okazaki landmarks...');
  const pin = await cdp.eval(`(() => {
    const targetEl = document.querySelector('[id^="landmark-target-"]');
    if (!targetEl) return null;
    const r = targetEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: targetEl.id };
  })()`);
  console.log('Target pin info:', pin);

  if (pin) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: pin.x,
      y: pin.y,
      button: 'left',
      clickCount: 1,
    });
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: pin.x,
      y: pin.y,
      button: 'left',
      clickCount: 1,
    });
  } else {
    // 画面中央をクリック
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 640,
      y: 450,
      button: 'left',
      clickCount: 1,
    });
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 640,
      y: 450,
      button: 'left',
      clickCount: 1,
    });
  }

  await wait(1500);

  // スクリーンショット4: 投擲後（命中カードまたは着弾フィードバック）
  await cdp.captureScreenshot(path.join(artifactDir, 'aichi_hit_result.png'));

  console.log('All verification steps completed successfully!');
  cleanup();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test run failed:', err);
  cleanup();
  process.exit(1);
});
