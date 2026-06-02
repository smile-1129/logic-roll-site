(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const groups = [
    { selector: ".title-screen", variant: "reveal--fade" },
    { selector: "main .about-intro" },
    { selector: "main .update-block", delay: 0.08 },
    { selector: "main .top-grid .media-block", stagger: 0.12 },
    { selector: "main .page-section .section-header" },
    { selector: "main .platform-strip", delay: 0.08 },
    { selector: "main .system-step", stagger: 0.14 },
    { selector: "main .contact-form", delay: 0.1 },
    { selector: "main .gallery-grid .gallery-item", stagger: 0.05, maxStagger: 8 },
    { selector: ".site-footer .footer-inner", variant: "reveal--fade" },
  ];

  const elements = [];

  groups.forEach((group) => {
    document.querySelectorAll(group.selector).forEach((el, index) => {
      el.classList.add("reveal");
      if (group.variant) el.classList.add(group.variant);

      let delay = group.delay ?? 0;
      if (group.stagger) {
        const cap = group.maxStagger ?? index;
        delay = Math.min(index, cap) * group.stagger;
      }
      if (delay > 0) {
        el.style.setProperty("--reveal-delay", delay + "s");
      }

      elements.push(el);
    });
  });

  if (!elements.length) return;

  if (reducedMotion) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
  );

  elements.forEach((el) => {
    if (el.classList.contains("title-screen")) {
      requestAnimationFrame(() => el.classList.add("is-visible"));
      return;
    }
    observer.observe(el);
  });
})();
