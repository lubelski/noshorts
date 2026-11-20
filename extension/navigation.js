(() => {
  "use strict";
  function redirect() {
    const url = new URL(location.href);
    if (url.pathname === "/") {
      location.replace(url.origin + "/feed/subscriptions");
      return;
    }
    const short = url.pathname.match(/^\/shorts\/([\w-]+)\/?$/);
    if (short) {
      url.pathname = "/watch";
      url.searchParams.set("v", short[1]);
      location.replace(url.href);
    } else if (/^\/shorts\/?$/.test(url.pathname)) {
      location.replace(url.origin + "/feed/subscriptions");
    }
  }
  // YouTube is a SPA. Both browser history and YouTube's own navigation
  // events matter; replacing the URL prevents a Back-button redirect loop.
  document.addEventListener("yt-navigate-finish", redirect);
  window.addEventListener("popstate", redirect);
  window.addEventListener("pageshow", redirect);
  window.navigation?.addEventListener("navigatesuccess", redirect);
  redirect();
})();
