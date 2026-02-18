
import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: Request) {
  try {
    const { url, selector, login, headless = true } = await req.json(); // Default to true if not sent

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Launch with user reference for headless
    const browser = await chromium.launch({ headless: headless });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    if (login && login.enabled) {
        console.log('Performing Login...');
        await page.goto(login.url || url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(login.usernameSelector);
        await page.fill(login.usernameSelector, login.username);
        await page.fill(login.passwordSelector, login.password);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            page.click(login.submitSelector)
        ]);
    }

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    let data;
    if (selector) {
      try {
          await page.waitForSelector(selector, { timeout: 5000 });
          data = await page.$$eval(selector, (elements) => elements.map(el => el.textContent?.trim()));
      } catch (e) {
          data = { warning: `Selector "${selector}" not found.` };
      }
    } else {
      data = { 
          title: await page.title(),
          url: page.url(),
      };
    }

    await browser.close();

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
