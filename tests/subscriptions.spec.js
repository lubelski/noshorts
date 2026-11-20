import { test, expect, chromium } from '@playwright/test';
import { resolve } from 'node:path';

test('sidebar and relevance shelf are hidden without touching the chronological feed', async () => {
  const extension = resolve('extension');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    await context.route('https://www.youtube.com/**', route => route.fulfill({
      contentType: 'text/html', body: `<!doctype html>
      <a id="logo" href="/">YouTube</a>
      <ytd-guide-entry-renderer id="shorts-title"><a title="Shorts"><span>Shorts</span></a></ytd-guide-entry-renderer>
      <ytd-guide-entry-renderer id="shorts-label"><a aria-label="Shorts">Shorts</a></ytd-guide-entry-renderer>
      <ytd-guide-entry-renderer id="shorts-text"><a><yt-formatted-string title="Shorts">Shorts</yt-formatted-string></a></ytd-guide-entry-renderer>
      <ytd-mini-guide-entry-renderer id="shorts-mini"><a title="Shorts">Shorts</a></ytd-mini-guide-entry-renderer>
      <ytd-guide-entry-renderer id="shorts-query"><a href="/shorts?feature=guide">Shorts</a></ytd-guide-entry-renderer>
      <ytd-guide-entry-renderer id="channel"><a title="Shorts filmmaking" href="/@creator">Shorts filmmaking</a></ytd-guide-entry-renderer>
      <ytd-guide-entry-renderer id="home"><a href="/">Home</a></ytd-guide-entry-renderer>
      <ytd-mini-guide-entry-renderer id="mini"><a href="/">Home</a></ytd-mini-guide-entry-renderer>
      <ytd-guide-entry-renderer id="subs"><a href="/feed/subscriptions">Subscriptions</a></ytd-guide-entry-renderer>
      <ytd-rich-section-renderer id="relevant"><ytd-rich-shelf-renderer><h2 id="title">Most relevant</h2><p>Suggested video</p><button>Show more</button></ytd-rich-shelf-renderer></ytd-rich-section-renderer>
      <ytd-rich-item-renderer id="latest">Latest video</ytd-rich-item-renderer>
      <ytd-shelf-renderer id="other"><h2>Latest</h2><p>Most relevant</p></ytd-shelf-renderer>
      <ytd-browse page-subtype="subscriptions"><ytd-rich-section-renderer id="page-relevant"><ytd-rich-shelf-renderer><h2 id="title">Most relevant</h2></ytd-rich-shelf-renderer></ytd-rich-section-renderer></ytd-browse>
      <ytd-browse page-subtype="trending"><ytd-rich-shelf-renderer id="trending-relevant"><h2 id="title">Most relevant</h2></ytd-rich-shelf-renderer></ytd-browse>`,
    }));
    const page = await context.newPage();
    await page.goto('https://www.youtube.com/feed/subscriptions');
    for (const id of ['home', 'mini', 'relevant', 'page-relevant', 'shorts-title', 'shorts-label', 'shorts-text', 'shorts-mini', 'shorts-query']) await expect(page.locator('#' + id)).toBeHidden();
    for (const id of ['logo', 'subs', 'latest', 'other', 'channel']) await expect(page.locator('#' + id)).toBeVisible();
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<grid-shelf-view-model id="late"><h2>Most relevant</h2><p>Late shelf</p></grid-shelf-view-model>');
    });
    await expect(page.locator('#late')).toBeHidden();
    await page.locator('#late h2').evaluate(e => { e.firstChild.textContent = 'Recent'; });
    await expect(page.locator('#late')).toBeVisible();
    await page.evaluate(() => {
      history.pushState({}, '', '/results?search_query=example');
      document.dispatchEvent(new Event('yt-navigate-finish'));
    });
    await expect(page.locator('#relevant')).toBeVisible();
    // The Subscriptions page itself stays hidden while the URL moves ahead of it.
    await expect(page.locator('#page-relevant')).toBeHidden();
    await expect(page.locator('#trending-relevant')).toBeVisible();
    await page.evaluate(() => {
      history.pushState({}, '', '/feed/subscriptions');
      document.dispatchEvent(new Event('yt-navigate-finish'));
    });
    await expect(page.locator('#relevant')).toBeHidden();
  } finally {
    await context.close();
  }
});
