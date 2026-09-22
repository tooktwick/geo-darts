const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const candidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const browserExe = candidates.find((p) => fs.existsSync(p));
if (!browserExe) {
  console.error('No Chrome or Edge browser executable found!');
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
    return res.result?.value;
  }
}

async function main() {
  await wait(1500);
  const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
  const page = list.find((item) => item.type === 'page') || list[0];
  console.log('Connecting to page:', page.webSocketDebuggerUrl);

  const client = new CDPClient(page.webSocketDebuggerUrl);
  await client.init();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  console.log('Navigating to http://localhost:5174/ ...');
  await client.send('Page.navigate', { url: 'http://localhost:5174/' });
  await wait(4000);

  // 基本モードのミッションバーの描画検証
  const res = await client.eval(`(() => {
    const bar = document.querySelector('.glass-panel-gold');
    const text = bar ? bar.innerText : '';
    const badges = Array.from(document.querySelectorAll('span')).map(s => s.innerText);
    const fameBadges = badges.filter(b => b.includes('🌟') || b.includes('🗺️') || b.includes('🌿'));
    const poolBadge = badges.find(b => b.includes('選出') || b.includes('候補'));

    return {
      barFound: !!bar,
      poolBadge: poolBadge || 'none',
      fameBadges: fameBadges.slice(0, 5),
      barSnippet: text.substring(0, 150)
    };
  })()`);

  console.log('UI Verification Result:', JSON.stringify(res, null, 2));

  // スクリーンショット保存
  const screenshotRes = await client.send('Page.captureScreenshot', { format: 'png' });
  if (screenshotRes.data) {
    fs.writeFileSync('scratch/ui_verification.png', Buffer.from(screenshotRes.data, 'base64'));
    console.log('Screenshot saved to scratch/ui_verification.png');
  }

  cleanup();
  console.log('Verification completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  cleanup();
  process.exit(1);
});

