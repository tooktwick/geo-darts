const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const PORT = 9223;
const browserExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

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
    return res.result?.value;
  }
}

async function main() {
  await wait(1500);
  const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
  const page = list.find((item) => item.type === 'page') || list[0];
  const client = new CDPClient(page.webSocketDebuggerUrl);
  await client.init();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  await client.send('Page.navigate', { url: 'http://localhost:5174/' });
  await wait(3000);

  // Normal ボタンをクリック
  console.log('Clicking Normal button...');
  await client.eval(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const normalBtn = buttons.find(b => b.innerText.includes('Normal'));
    if (normalBtn) normalBtn.click();
  })()`);
  await wait(1000);

  const normalRes = await client.eval(`(() => {
    const badges = Array.from(document.querySelectorAll('span')).map(s => s.innerText);
    const poolBadge = badges.find(b => b.includes('選出') || b.includes('候補'));
    const fameBadges = badges.filter(b => b.includes('🌟') || b.includes('🗺️') || b.includes('🌿'));
    return { poolBadge, fameBadges: fameBadges.slice(0, 3) };
  })()`);
  console.log('Normal Mode Test:', normalRes);

  // Hard ボタンをクリック
  console.log('Clicking Hard button...');
  await client.eval(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hardBtn = buttons.find(b => b.innerText.includes('Hard'));
    if (hardBtn) hardBtn.click();
  })()`);
  await wait(1000);

  const hardRes = await client.eval(`(() => {
    const badges = Array.from(document.querySelectorAll('span')).map(s => s.innerText);
    const poolBadge = badges.find(b => b.includes('選出') || b.includes('候補'));
    const fameBadges = badges.filter(b => b.includes('🌟') || b.includes('🗺️') || b.includes('🌿'));
    return { poolBadge, fameBadges: fameBadges.slice(0, 3) };
  })()`);
  console.log('Hard Mode Test:', hardRes);

  // 推理クイズモードに切り替え
  console.log('Switching to Quiz mode...');
  await client.eval(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const quizBtn = buttons.find(b => b.innerText.includes('推理クイズ'));
    if (quizBtn) quizBtn.click();
  })()`);
  await wait(2000);

  // クイズ画面のスクリーンショット
  const quizScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
  if (quizScreenshot.data) {
    fs.writeFileSync('scratch/quiz_verification.png', Buffer.from(quizScreenshot.data, 'base64'));
    console.log('Screenshot saved to scratch/quiz_verification.png');
  }

  cleanup();
  console.log('All tests finished successfully!');
  process.exit(0);
}

main().catch(e => { console.error(e); cleanup(); process.exit(1); });
