const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initParallax({ scene, motion }) {
  const elements = [...document.querySelectorAll("[data-parallax-depth]")].map((element) => ({
    element,
    depth: Number(element.dataset.parallaxDepth) || 0
  }));
  const hero = document.querySelector("#hero");
  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;

  function reset() {
    elements.forEach(({ element }) => element.style.setProperty("--parallax-y", "0px"));
    scene?.setScrollProgress(0);
  }

  function render() {
    frame = 0;
    if (motion.reduced || window.innerWidth < 700) {
      reset();
      return;
    }

    const viewportCenter = window.innerHeight * 0.5;
    elements.forEach(({ element, depth }) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -180 || rect.top > window.innerHeight + 180) return;
      const elementCenter = rect.top + rect.height * 0.5;
      const shift = clamp((viewportCenter - elementCenter) * depth, -88, 88);
      element.style.setProperty("--parallax-y", `${shift.toFixed(2)}px`);
    });

    if (hero) {
      const rect = hero.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(1, rect.height), 0, 1);
      scene?.setScrollProgress(progress);
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("resize", schedule, { passive: true, signal });
  const unsubscribeMotion = motion.subscribe(schedule);
  schedule();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    unsubscribeMotion();
    controller.abort();
    reset();
  };
}
