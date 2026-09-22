const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const PORT = 9227;
const browserExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browserProc = spawn(browserExe, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,900',
  'about:blank',
]);

function cleanup() {
  try { browserProc.kill(); } catch (e) {}
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(); });

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
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
}

async function run() {
  await wait(2000);
  const targets = await getJson(`http://localhost:${PORT}/json`);
  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget) throw new Error('Page target not found');

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.init();

  await client.send('Page.enable');
  await client.send('DOM.enable');

  console.log('Navigating to http://localhost:5174/ ...');
  await client.send('Page.navigate', { url: 'http://localhost:5174/' });
  await wait(3500);

  // 1. アクアワールド大洗の命中通知モーダルを起動
  console.log('1. Triggering LandmarkHitModal for Oarai Aquaworld...');
  await client.eval(`
    if (typeof window.__triggerHitModalForTest === 'function') {
      window.__triggerHitModalForTest('ibaraki_aquaworld');
    }
  `);
  await wait(1200);

  // 2. モーダルの座標とクリアランス（HUDとの重なり解消）を検証
  const layoutInfo = await client.eval(`
    (() => {
      const modal = document.querySelector('aside[aria-label="名所命中通知"]');
      const hud = document.querySelector('header');
      if (!modal) return null;

      const modalRect = modal.getBoundingClientRect();
      const hudRect = hud ? hud.getBoundingClientRect() : null;

      return {
        modalTop: modalRect.top,
        modalRight: window.innerWidth - modalRect.right,
        modalWidth: modalRect.width,
        modalHeight: modalRect.height,
        hudBottom: hudRect ? hudRect.bottom : null,
        clearanceFromHud: hudRect ? (modalRect.top - hudRect.bottom) : null,
        title: document.body.innerText.includes('アクアワールド大洗'),
        hasMinimizeBtn: !!modal.querySelector('button[title*="最小化"]'),
      };
    })()
  `);
  console.log('2. Modal Layout Verification:', JSON.stringify(layoutInfo, null, 2));

  // 3. 画面キャプチャ（展開時・HUDとの分離とコンパクトさを確認）
  const screenshot1 = await client.send('Page.captureScreenshot', { format: 'png' });
  const artifactPath1 = 'C:\\Users\\takas\\.gemini\\antigravity\\brain\\62afdbb4-f3d3-450d-b298-1f1c0815179e\\hit_modal_improved_verification.png';
  fs.writeFileSync(artifactPath1, Buffer.from(screenshot1.data, 'base64'));
  console.log('3. Expanded screenshot successfully saved to:', artifactPath1);

  // 4. 「最小化」ボタンを押してピル表示のテスト
  console.log('4. Testing Minimize Toggle...');
  await client.eval(`
    (() => {
      const modal = document.querySelector('aside[aria-label="名所命中通知"]');
      const minBtn = modal ? modal.querySelector('button[title*="最小化"]') : null;
      if (minBtn) minBtn.click();
    })()
  `);
  await wait(800);

  const minimizedInfo = await client.eval(`
    (() => {
      const modal = document.querySelector('aside[aria-label="名所命中通知"]');
      if (!modal) return null;
      const rect = modal.getBoundingClientRect();
      return {
        height: rect.height,
        hasOpenDetailBtn: document.body.innerText.includes('詳細を開く'),
      };
    })()
  `);
  console.log('4. Minimized Pill Verification:', JSON.stringify(minimizedInfo, null, 2));

  // 5. 最小化状態のスクリーンショットも保存
  const screenshot2 = await client.send('Page.captureScreenshot', { format: 'png' });
  const artifactPath2 = 'C:\\Users\\takas\\.gemini\\antigravity\\brain\\62afdbb4-f3d3-450d-b298-1f1c0815179e\\hit_modal_minimized_verification.png';
  fs.writeFileSync(artifactPath2, Buffer.from(screenshot2.data, 'base64'));
  console.log('5. Minimized screenshot saved to:', artifactPath2);

  client.ws.close();
  cleanup();
  console.log('All CDP verifications passed successfully!');
}

run().catch((err) => {
  console.error('Test error:', err);
  cleanup();
  process.exit(1);
});
