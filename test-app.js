import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/c9df5347-1cc3-4692-9fa1-63a8c74d54e0';

async function run() {
  console.log('Launching browser for full UI inspection...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  // 1. Home Screen
  console.log('1. Loading Home Screen...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_1_home.png') });
  console.log('Captured screen_1_home.png');

  // 2. Click Start -> Registration Screen
  console.log('2. Opening Registration Screen...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('ప్రారంభించండి')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_2_registration.png') });
  console.log('Captured screen_2_registration.png');

  // 3. Fill in registration using page.type
  console.log('3. Typing User Details...');
  const textInputs = await page.$$('input[type="text"]');
  if (textInputs.length >= 2) {
    await textInputs[0].type('మహమ్మద్ అబ్దుల్లా', { delay: 30 });
    await textInputs[1].type('హైదరాబాద్ (Hyderabad)', { delay: 30 });
  }

  // Select occupation dropdown
  await page.select('select', 'సాఫ్ట్‌వేర్ ఇంజనీర్ / ఐటీ (Software / IT)');
  await new Promise(r => setTimeout(r, 400));

  // Click submit registration button
  const regButtons = await page.$$('button[type="submit"]');
  if (regButtons.length > 0) {
    await regButtons[0].click();
  }
  await new Promise(r => setTimeout(r, 1000));

  // 4. Quiz Screen
  console.log('4. In Quiz Screen...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_3_quiz.png') });
  console.log('Captured screen_3_quiz.png');

  // Answer first 2 questions
  for (let q = 0; q < 2; q++) {
    const optButtons = await page.$$('button');
    for (const ob of optButtons) {
      const text = await page.evaluate(el => el.innerText, ob);
      if (text.startsWith('B') || text.includes('5 స్తంభాలు') || text.includes('రంజాన్')) {
        await ob.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 400));

    // Click next
    const allBtns = await page.$$('button');
    for (const nb of allBtns) {
      const txt = await page.evaluate(el => el.innerText, nb);
      if (txt.includes('తదుపరి')) {
        await nb.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Jump to question 20
  console.log('5. Jumping to question 20...');
  const numBtns = await page.$$('button');
  for (const nb of numBtns) {
    const txt = await page.evaluate(el => el.innerText.trim(), nb);
    if (txt === '20') {
      await nb.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Pick answer for question 20
  const optBtns20 = await page.$$('button');
  for (const ob of optBtns20) {
    const text = await page.evaluate(el => el.innerText, ob);
    if (text.includes('మదీనా మునవ్వరా')) {
      await ob.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 400));

  // Click Submit
  console.log('6. Submitting Quiz...');
  const submitBtns = await page.$$('button');
  for (const sb of submitBtns) {
    const txt = await page.evaluate(el => el.innerText, sb);
    if (txt.includes('సమర్పించండి')) {
      await sb.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // Click confirm dialog "అవును, సమర్పించు"
  const confBtns = await page.$$('button');
  for (const cb of confBtns) {
    const txt = await page.evaluate(el => el.innerText, cb);
    if (txt.includes('అవును, సమర్పించు')) {
      await cb.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));

  // 7. Result Screen
  console.log('7. In Result Screen...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_4_result.png') });
  console.log('Captured screen_4_result.png');

  await browser.close();
  console.log('DONE!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
