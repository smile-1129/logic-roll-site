(function () {
  const COLLAPSED_COUNT = 3;
  const EXPANDED_COUNT = 10;

  const panel = document.getElementById("update-list-panel");
  const list = document.getElementById("update-list");
  const moreBtn = document.getElementById("update-more-btn");
  if (!panel || !list || !moreBtn) return;

  const items = [...list.querySelectorAll(".update-item")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function measureHeight(count) {
    const n = Math.min(count, items.length);
    if (n <= 0) return 0;
    const first = items[0];
    const last = items[n - 1];
    return last.offsetTop + last.offsetHeight - first.offsetTop;
  }

  function setPanelHeight(count, animate) {
    const height = measureHeight(count);
    if (!animate || prefersReducedMotion) {
      panel.style.transition = "none";
    }
    panel.style.maxHeight = `${height}px`;
    if (!animate || prefersReducedMotion) {
      requestAnimationFrame(() => {
        panel.style.transition = "";
      });
    }
  }

  function init() {
    const total = items.length;

    if (total <= COLLAPSED_COUNT) {
      panel.style.maxHeight = "none";
      panel.classList.add("is-expanded");
      moreBtn.hidden = true;
      return;
    }

    moreBtn.hidden = false;
    panel.classList.remove("is-expanded");
    setPanelHeight(COLLAPSED_COUNT, false);
    moreBtn.setAttribute("aria-expanded", "false");
  }

  moreBtn.addEventListener("click", () => {
    const expandCount = Math.min(EXPANDED_COUNT, items.length);
    panel.classList.add("is-expanded");
    setPanelHeight(expandCount, true);
    moreBtn.hidden = true;
    moreBtn.setAttribute("aria-expanded", "true");

    if (expandCount >= items.length) {
      requestAnimationFrame(() => {
        panel.addEventListener(
          "transitionend",
          () => {
            panel.style.maxHeight = "none";
          },
          { once: true }
        );
      });
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (moreBtn.hidden && panel.classList.contains("is-expanded")) {
        if (panel.style.maxHeight === "none") return;
        const expandCount = Math.min(EXPANDED_COUNT, items.length);
        setPanelHeight(expandCount, false);
      } else if (!moreBtn.hidden) {
        setPanelHeight(COLLAPSED_COUNT, false);
      }
    }, 150);
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
