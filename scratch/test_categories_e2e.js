import puppeteer from 'puppeteer';
import path from 'path';

async function testCategoryImages() {
  console.log('Launching browser to test category images and blessings...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. トップページを開く
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

  await new Promise(r => setTimeout(r, 2000));

  // スクリーンショット1: 初期ロード画面
  const screenshot1 = path.resolve('C:/Users/takas/.gemini/antigravity/brain/ccd6a08b-7408-4426-be1f-a42ee97a1c61/category_gameplay_initial.png');
  await page.screenshot({ path: screenshot1 });
  console.log('Saved screenshot 1:', screenshot1);

  // 2. 目標名所の要素（例: landmark-target-*）を探してクリック
  const targetSelector = '[id^="landmark-target-"]';
  const hasTarget = await page.$(targetSelector);
  
  if (hasTarget) {
    console.log('Found target landmark pin, clicking to hit...');
    await hasTarget.click();
  } else {
    console.log('No direct pin found, clicking center of map...');
    await page.mouse.click(640, 450);
  }

  // ダーツ飛行および着弾アニメーション待機
  await new Promise(r => setTimeout(r, 1200));

  // スクリーンショット2: 命中後の名所紹介カード（種類別画像＆旅の加護表示）
  const screenshot2 = path.resolve('C:/Users/takas/.gemini/antigravity/brain/ccd6a08b-7408-4426-be1f-a42ee97a1c61/category_hit_card.png');
  await page.screenshot({ path: screenshot2 });
  console.log('Saved screenshot 2:', screenshot2);

  // 3. 名所紹介カードを閉じる、または自動フェード後に加護バッジが表示されているか確認
  // カードを閉じるボタン、または背景クリック
  const closeBtn = await page.$('button[aria-label="閉じる"]');
  if (closeBtn) {
    await closeBtn.click();
  } else {
    // 画面外クリック
    await page.mouse.click(200, 200);
  }

  await new Promise(r => setTimeout(r, 800));

  // スクリーンショット3: 発動中の旅の加護バッジ画面
  const screenshot3 = path.resolve('C:/Users/takas/.gemini/antigravity/brain/ccd6a08b-7408-4426-be1f-a42ee97a1c61/category_blessing_active.png');
  await page.screenshot({ path: screenshot3 });
  console.log('Saved screenshot 3:', screenshot3);

  await browser.close();
  console.log('Testing completed successfully!');
}

testCategoryImages().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
