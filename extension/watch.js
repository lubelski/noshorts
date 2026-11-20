(() => {
  "use strict";
  // Watch page related videos:
  // - Keep only the "Related" chip and select it once per video.
  // - In the one-column layout, collapse the list behind a toggle button.
  const hiddenChip = "data-noshorts-hidden-chip";
  const openAttr = "data-noshorts-related-open";
  const videoAttr = "data-noshorts-related-video";
  const toggleClass = "noshorts-related-toggle";
  const chips = "yt-chip-cloud-chip-renderer, chip-view-model";
  let selectedFor = null;
  let queued = false;

  const label = chip => chip.textContent.trim().replace(/\s+/g, " ").toLowerCase();
  const isSelected = chip =>
    chip.hasAttribute("selected") || !!chip.querySelector("[aria-selected='true']");

  function toggleButton(related) {
    let button = related.querySelector(":scope > ." + toggleClass);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = toggleClass;
      button.addEventListener("click", () => {
        if (related.hasAttribute(openAttr)) related.removeAttribute(openAttr);
        else related.setAttribute(openAttr, "");
        schedule();
      });
      related.prepend(button);
    }
    const text = related.hasAttribute(openAttr) ? "Hide related videos" : "Show related videos";
    if (button.textContent !== text) button.textContent = text;
  }

  function update() {
    queued = false;
    if (location.pathname !== "/watch") return;
    const videoId = new URLSearchParams(location.search).get("v");

    for (const results of document.querySelectorAll("ytd-watch-next-secondary-results-renderer")) {
      let related = null;
      for (const chip of results.querySelectorAll(chips)) {
        const keep = label(chip) === "related";
        if (keep) related = chip;
        if (keep === chip.hasAttribute(hiddenChip)) chip.toggleAttribute(hiddenChip, !keep);
      }
      if (related && !isSelected(related) && selectedFor !== videoId) {
        selectedFor = videoId;
        (related.querySelector("button, [role='tab'], a") || related).click();
      } else if (related && isSelected(related)) {
        selectedFor = videoId;
      }
    }

    for (const related of document.querySelectorAll("ytd-watch-flexy #related")) {
      if (!related.querySelector("ytd-watch-next-secondary-results-renderer")) continue;
      // Start each new video collapsed.
      if (related.getAttribute(videoAttr) !== videoId) {
        related.setAttribute(videoAttr, videoId || "");
        related.removeAttribute(openAttr);
      }
      toggleButton(related);
    }
  }
  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }
  // Observe content, not attributes, so our own markers cannot trigger a loop.
  new MutationObserver(schedule).observe(document, { childList: true, subtree: true });
  document.addEventListener("yt-navigate-finish", schedule);
  window.addEventListener("popstate", schedule);
  schedule();
})();
