import { test, expect, chromium } from '@playwright/test';
import { resolve } from 'node:path';

let context;
test.beforeAll(async () => {
  const extension = resolve('extension');
  context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  await context.route('https://www.youtube.com/**', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><title>Fixture</title><main>Regular content</main>',
  }));
});
test.afterAll(async () => { await context?.close(); });

test('hides masthead doodle and Ask controls without hiding neighboring actions', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/watch?v=regular');
  await page.locator('main').evaluate(el => el.insertAdjacentHTML('beforeend', `
    <ytd-masthead><a href="/">YouTube</a><ytd-yoodle-renderer>Artwork</ytd-yoodle-renderer>
    <button aria-label="Ask YouTube">Ask YouTube</button><button>Search</button></ytd-masthead>
    <ytd-watch-metadata><div id="actions"><button>Share</button><button aria-label="Ask about this video">✦</button><button>Save</button></div></ytd-watch-metadata>`));
  for (const selector of ['ytd-yoodle-renderer', '[aria-label="Ask YouTube"]', '[aria-label="Ask about this video"]'])
    await expect(page.locator(selector)).toBeHidden();
  for (const text of ['YouTube', 'Search', 'Share', 'Save'])
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  await page.close();
});

test('hides the Premium wordmark but keeps the logo icon and standard wordmark', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.locator('main').evaluate(el => el.insertAdjacentHTML('beforeend', `
    <ytd-topbar-logo-renderer id="premium"><svg viewBox="0 0 101 20" width="101" height="20">
      <g id="icon"><rect width="29" height="20" fill="red"/></g>
      <g id="youtube-paths_yt9"><rect x="32" width="68" height="20"/></g></svg></ytd-topbar-logo-renderer>
    <ytd-topbar-logo-renderer id="standard"><svg viewBox="0 0 93 20" width="93" height="20">
      <g id="youtube-paths_yt5"><rect x="32" width="60" height="20"/></g></svg></ytd-topbar-logo-renderer>`));
  await expect(page.locator('#premium [id^="youtube-paths"]')).toBeHidden();
  await expect(page.locator('#premium #icon')).toBeVisible();
  await expect(page.locator('#standard [id^="youtube-paths"]')).toBeVisible();
  await page.close();
});

test('video cards have no hover background panel', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.locator('main').evaluate(el => el.insertAdjacentHTML('beforeend', `
    <style>.ytSpecTouchFeedbackShapeHoverEffect { transform: scale(0.9); }</style>
    <yt-lockup-view-model><div class="ytSpecTouchFeedbackShapeHoverEffect" id="card">x</div></yt-lockup-view-model>
    <div class="ytSpecTouchFeedbackShapeHoverEffect" id="other">y</div>`));
  await expect(page.locator('#card')).toBeHidden();
  await expect(page.locator('#other')).toBeVisible();
  await page.close();
});

test('hides the masthead Create, Notifications, and voice buttons but keeps the account menu', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.locator('main').evaluate(el => el.insertAdjacentHTML('beforeend', `
    <ytd-masthead><div id="buttons">
      <ytd-button-renderer id="create"><button aria-label="Create">Create</button></ytd-button-renderer>
      <ytd-notification-topbar-button-renderer id="bell"><button aria-label="Notifications">Bell</button></ytd-notification-topbar-button-renderer>
      <ytd-topbar-menu-button-renderer><button aria-label="Account menu">Avatar</button></ytd-topbar-menu-button-renderer>
    </div><div id="voice-search-button"><button aria-label="Search with your voice">Mic</button></div></ytd-masthead>`));
  for (const id of ['create', 'bell', 'voice-search-button']) await expect(page.locator('#' + id)).toBeHidden();
  await expect(page.getByText('Avatar', { exact: true })).toBeVisible();
  await page.close();
});

test('focused header search box keeps its unfocused size and drops the spyglass', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.locator('main').evaluate(el => el.insertAdjacentHTML('beforeend', `
    <style>.ytSearchboxComponentInputContainerIsFocused { height: 100px; border-radius: 24px; }</style>
    <ytd-masthead unified-searchbox-open><div id="center">
      <yt-searchbox class="ytSearchboxComponentHost ytSearchboxComponentHostIsFocused ytSearchboxComponentHostDark">
        <div class="ytSearchboxComponentInputWrapper"><div id="pill" class="ytSearchboxComponentInputContainer ytSearchboxComponentInputContainerIsFocused">
          <div id="spyglass" class="ytSearchboxComponentInnerSearchIcon">Q</div>
          <div class="ytSearchboxComponentInputBox"><textarea></textarea></div>
        </div></div>
      </yt-searchbox></div></ytd-masthead>`));
  await expect(page.locator('#spyglass')).toBeHidden();
  await expect(page.locator('#pill')).toHaveCSS('height', '48px');
  await expect(page.locator('#pill')).toHaveCSS('border-radius', '40px');
  await expect(page.locator('#pill')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
  await page.close();
});

test('Premium logo link shrinks to the play icon', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.locator('main').evaluate(el => el.insertAdjacentHTML('beforeend', `
    <ytd-topbar-logo-renderer><a id="logo" href="/" style="display:inline-flex">
      <span id="logo-icon" style="display:inline-flex;width:131px"><span class="yt-icon-shape" style="display:flex"><div>
        <svg viewBox="0 0 101 20" width="101" height="20"><rect width="29" height="20" fill="red"/></svg>
      </div></span></span></a></ytd-topbar-logo-renderer>`));
  const width = await page.locator('#logo').evaluate(a => a.getBoundingClientRect().width);
  expect(width).toBeLessThan(40);
  await page.close();
});

for (const [path, target] of [
  ['/?feature=home', '/feed/subscriptions'],
  ['/shorts', '/feed/subscriptions'],
  ['/shorts/abc_DEF-123?t=12#hello', '/watch?t=12&v=abc_DEF-123#hello'],
  ['/watch?v=regular', '/watch?v=regular'],
  ['/results?search_query=cats', '/results?search_query=cats'],
  ['/@someone/videos', '/@someone/videos'],
]) {
  test(`initial navigation ${path}`, async () => {
    const page = await context.newPage();
    await page.goto('https://www.youtube.com' + path).catch(error => {
      if (!String(error).includes('ERR_ABORTED')) throw error;
    });
    await expect(page).toHaveURL('https://www.youtube.com' + target);
    await page.close();
  });
}

test('SPA Home navigation, then Back, does not trap the user', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/watch?v=regular');
  await page.evaluate(() => {
    history.pushState({}, '', '/');
    document.dispatchEvent(new Event('yt-navigate-finish'));
  });
  await expect(page).toHaveURL('https://www.youtube.com/feed/subscriptions');
  await page.goBack();
  await expect(page).toHaveURL('https://www.youtube.com/watch?v=regular');
  await page.close();
});

test('SPA Shorts navigation uses the regular player', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.evaluate(() => {
    history.pushState({}, '', '/shorts/abc123');
    document.dispatchEvent(new Event('yt-navigate-finish'));
  });
  await expect(page).toHaveURL('https://www.youtube.com/watch?v=abc123');
  await page.close();
});

test('hides shelves, cards, sidebar, channel tabs, and late content without hiding neighbors', async () => {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/feed/subscriptions');
  await page.evaluate(() => {
    document.querySelector('main').innerHTML = `
      <ytd-reel-shelf-renderer id="shelf">Shorts</ytd-reel-shelf-renderer>
      <ytd-rich-section-renderer id="section"><ytd-rich-shelf-renderer is-shorts>Shorts</ytd-rich-shelf-renderer></ytd-rich-section-renderer>
      <ytd-rich-item-renderer id="short"><a href="/shorts/abc">Short</a></ytd-rich-item-renderer>
      <ytd-rich-item-renderer id="regular"><a href="/watch?v=abc">Regular</a></ytd-rich-item-renderer>
      <ytd-video-renderer id="search"><a id="thumbnail" href="/shorts/abc">Short</a></ytd-video-renderer>
      <ytd-video-renderer id="mention"><a id="thumbnail" href="/watch?v=regular">Regular</a><p><a href="/shorts/abc">Mention in description</a></p></ytd-video-renderer>
      <ytd-guide-entry-renderer id="sidebar"><a href="/shorts">Shorts</a></ytd-guide-entry-renderer>
      <yt-tab-shape id="tab"><a href="/@creator/shorts">Shorts</a></yt-tab-shape>
      <yt-shorts-lockup-view-model id="modern">Short</yt-shorts-lockup-view-model>
      <grid-shelf-view-model id="new-shelf"><h2>Shorts</h2><ytm-shorts-lockup-view-model-v2><ytm-shorts-lockup-view-model>Short</ytm-shorts-lockup-view-model></ytm-shorts-lockup-view-model-v2></grid-shelf-view-model>
      <ytd-mini-guide-entry-renderer id="trailing-sidebar"><a href="/shorts/">Shorts</a></ytd-mini-guide-entry-renderer>`;
  });
  for (const id of ['shelf', 'section', 'short', 'search', 'sidebar', 'tab', 'modern', 'new-shelf', 'trailing-sidebar']) {
    await expect(page.locator('#' + id)).toBeHidden();
  }
  await expect(page.locator('#regular')).toBeVisible();
  await expect(page.locator('#mention')).toBeVisible();
  await page.evaluate(() => {
    document.querySelector('main').insertAdjacentHTML('beforeend', '<ytd-rich-item-renderer id="late"><a href="/shorts/late">Late short</a></ytd-rich-item-renderer>');
  });
  await expect(page.locator('#late')).toBeHidden();
  // A recycled tile must become visible again when its href changes.
  await page.locator('#late a').evaluate(a => a.setAttribute('href', '/watch?v=regular'));
  await expect(page.locator('#late')).toBeVisible();
  await page.close();
});

test('does not inject on unrelated sites', async () => {
  await context.route('https://example.com/**', route => route.fulfill({contentType: 'text/html', body: '<ytd-reel-shelf-renderer>Visible</ytd-reel-shelf-renderer>'}));
  const page = await context.newPage();
  await page.goto('https://example.com/');
  await expect(page).toHaveURL('https://example.com/');
  await expect(page.locator('ytd-reel-shelf-renderer')).toBeVisible();
  await page.close();
});
