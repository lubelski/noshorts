(() => {
  "use strict";
  const marker = "data-noshorts-relevant";
  const shelves = "ytd-rich-shelf-renderer, ytd-shelf-renderer, grid-shelf-view-model";
  let queued = false;

  function update() {
    queued = false;
    // Clear previous markers first: YouTube can recycle DOM across SPA routes.
    const hidden = new Set();
    if (/^\/feed\/subscriptions\/?$/.test(location.pathname)) {
      for (const shelf of document.querySelectorAll(shelves)) {
        // Never search all shelf text: a video title might contain these words.
        const heading = shelf.querySelector("#title, h2, [role='heading']");
        if (heading?.textContent.trim().replace(/\s+/g, " ").toLowerCase() === "most relevant") {
          hidden.add(shelf.closest("ytd-rich-section-renderer") || shelf);
        }
      }
    }
    for (const element of document.querySelectorAll("[" + marker + "]")) {
      if (!hidden.has(element)) element.removeAttribute(marker);
    }
    for (const element of hidden) {
      if (!element.hasAttribute(marker)) element.setAttribute(marker, "");
    }
  }
  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }
  // Observe content, not attributes, so our own markers cannot trigger a loop.
  new MutationObserver(schedule).observe(document, {
    childList: true, subtree: true, characterData: true,
  });
  document.addEventListener("yt-navigate-finish", schedule);
  window.addEventListener("popstate", schedule);
  window.addEventListener("pageshow", schedule);
  window.navigation?.addEventListener("navigatesuccess", schedule);
  schedule();
})();
