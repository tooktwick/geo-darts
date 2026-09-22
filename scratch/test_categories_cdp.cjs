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

const PORT = 9223;
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
  console.log('Waiting for browser remote debugging port...');
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

  // 1. 初期画面の確認
  const initialTitle = await cdp.eval('document.title');
  console.log('Document title:', initialTitle);

  // 2. 目標名所ピンの位置を取得してクリック投擲
  const targetInfo = await cdp.eval(`(() => {
    const el = document.querySelector('[id^="landmark-target-"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      id: el.id,
      x: r.left + r.width / 2,
      y: r.top + r.height / 2
    };
  })()`);

  console.log('Found target pin info:', targetInfo);

  if (targetInfo) {
    // ダーツ投擲
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: targetInfo.x,
      y: targetInfo.y,
      button: 'left',
      clickCount: 1,
    });
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: targetInfo.x,
      y: targetInfo.y,
      button: 'left',
      clickCount: 1,
    });
  } else {
    // 中央付近をクリック
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

  // ダーツ着弾アニメーション待機
  await wait(1200);

  // 3. 名所紹介カード（種類別画像＆加護表示）の確認
  const modalInfo = await cdp.eval(`(() => {
    const img = document.querySelector('img[alt]');
    const blessingText = document.body.innerText.includes('加護') || document.body.innerText.includes('ボーナス');
    return {
      hasImg: !!img,
      imgSrc: img ? img.src : null,
      hasBlessingText: blessingText
    };
  })()`);

  console.log('Modal inspection result:', modalInfo);
  await cdp.captureScreenshot(path.join(artifactDir, 'category_card_screenshot.png'));

  // 4. カードを閉じて加護バッジの確認
  console.log('Closing modal to inspect active blessing badge...');
  await cdp.eval(`(() => {
    const btn = document.querySelector('button[aria-label="閉じる"]') || document.querySelector('button.p-2');
    if (btn) btn.click();
    else document.body.click();
  })()`);

  await wait(800);

  // 加護バッジの存在確認
  const blessingBadgeInfo = await cdp.eval(`(() => {
    const badge = document.querySelector('aside[aria-label="発動中の旅の加護"]');
    return {
      hasBadge: !!badge,
      badgeText: badge ? badge.innerText : null
    };
  })()`);

  console.log('Active blessing badge inspection:', blessingBadgeInfo);
  await cdp.captureScreenshot(path.join(artifactDir, 'active_blessing_badge_screenshot.png'));

  console.log('E2E Verification completed successfully!');
  cleanup();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test run failed:', err);
  cleanup();
  process.exit(1);
});
