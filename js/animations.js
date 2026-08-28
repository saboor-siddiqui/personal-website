import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PAGE_PROGRESS_PROPERTY = "--page-progress";

function splitStatement() {
  const element = document.querySelector("[data-scrub-text]");
  if (!element) return { element: null, words: [] };

  if (!element.dataset.splitReady) {
    const text = element.textContent.trim();
    element.textContent = "";

    const accessibleText = document.createElement("span");
    accessibleText.className = "sr-only";
    accessibleText.textContent = text;
    element.append(accessibleText);

    text.split(/\s+/).forEach((word) => {
      const span = document.createElement("span");
      span.className = "statement-word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = word;
      element.append(span, document.createTextNode(" "));
    });

    element.dataset.splitReady = "true";
  }

  return { element, words: [...element.querySelectorAll(".statement-word")] };
}

function formatCounter(element, progress) {
  const range = element.dataset.countRange?.split(",").map(Number);
  if (range?.length === 2 && range.every(Number.isFinite)) {
    element.textContent = `${Math.round(range[0] * progress)}–${Math.round(range[1] * progress)}`;
    return;
  }

  const target = Number(element.dataset.countTo) || 0;
  const suffix = element.dataset.countSuffix || "";
  element.textContent = `${Math.round(target * progress)}${suffix}`;
}

function setFinalStates(statementWords) {
  const revealTargets = document.querySelectorAll("[data-reveal], [data-hero]");
  gsap.set(revealTargets, { clearProps: "opacity,visibility,transform,clip-path" });
  gsap.set(statementWords, { "--word-opacity": 1, clearProps: "will-change" });
  document.querySelectorAll("[data-count-to], [data-count-range]").forEach((element) => formatCounter(element, 1));
  document.querySelector("[data-timeline]")?.style.setProperty("--timeline-progress", "1");
  document.querySelectorAll(".timeline-item").forEach((item, index) => item.classList.toggle("is-current", index === 0));
  document.querySelectorAll("[data-project-parallax]").forEach((element) => element.style.setProperty("--project-shift", "0px"));
  document.querySelector(".signal-rail")?.style.setProperty("--signal-sweep", "235%");
}

export function initScrollAnimations({ motion }) {
  const { element: statement, words: statementWords } = splitStatement();
  const pageRoot = document.documentElement;
  let context = null;
  let progressFrame = 0;
  let rebuildFrame = 0;

  function updatePageProgress() {
    progressFrame = 0;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    pageRoot.style.setProperty(PAGE_PROGRESS_PROPERTY, progress.toFixed(4));
  }

  function schedulePageProgress() {
    if (!progressFrame) progressFrame = requestAnimationFrame(updatePageProgress);
  }

  function destroyContext() {
    context?.revert();
    context = null;
  }

  function build() {
    destroyContext();

    if (motion.reduced) {
      setFinalStates(statementWords);
      ScrollTrigger.refresh();
      return;
    }

    context = gsap.context(() => {
      const heroTargets = gsap.utils.toArray("[data-hero]");
      gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.08 })
        .from(heroTargets, {
          autoAlpha: 0,
          y: 24,
          duration: 0.82,
          stagger: 0.09,
          clearProps: "opacity,visibility,transform"
        });

      const groupedTargets = new Set();
      document.querySelectorAll("[data-reveal-group]").forEach((group) => {
        const children = [...group.querySelectorAll(":scope > [data-reveal]")];
        children.forEach((child) => groupedTargets.add(child));
        if (!children.length) return;

        gsap.from(children, {
          autoAlpha: 0,
          y: 16,
          scale: 0.985,
          duration: 0.72,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: group,
            start: "top 82%",
            once: true
          }
        });
      });

      document.querySelectorAll("[data-reveal]").forEach((element) => {
        if (groupedTargets.has(element)) return;
        const family = element.dataset.reveal;
        const values = family === "heading"
          ? { y: 23, duration: 0.78 }
          : family === "line"
            ? { y: 9, duration: 0.88, clipPath: "inset(0 100% 0 0)" }
            : { y: 14, scale: 0.985, duration: 0.72 };

        gsap.from(element, {
          autoAlpha: 0,
          ...values,
          ease: "power3.out",
          clearProps: "opacity,visibility,transform,clip-path",
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
            once: true
          }
        });
      });

      const hero = document.querySelector("#hero");
      if (hero) {
        gsap.to(".hero-copy", {
          y: -34,
          opacity: 0.62,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom 28%",
            scrub: 0.65
          }
        });
      }

      const signalRail = document.querySelector(".signal-rail");
      if (signalRail) {
        gsap.fromTo(signalRail, { "--signal-sweep": "-100%" }, {
          "--signal-sweep": "235%",
          duration: 1.4,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: signalRail,
            start: "top 86%",
            once: true
          }
        });
      }

      document.querySelectorAll("[data-count-to], [data-count-range]").forEach((element) => {
        const counter = { progress: 0 };
        formatCounter(element, 0);
        gsap.to(counter, {
          progress: 1,
          duration: 1.25,
          ease: "power2.out",
          onUpdate: () => formatCounter(element, counter.progress),
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        });
      });

      document.querySelectorAll("[data-project-parallax]").forEach((visual, index) => {
        gsap.fromTo(visual, { "--project-shift": "-12px" }, {
          "--project-shift": "12px",
          ease: "none",
          scrollTrigger: {
            trigger: visual,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.75 + index * 0.04
          }
        });
      });

      const timeline = document.querySelector("[data-timeline]");
      const timelineItems = timeline ? [...timeline.querySelectorAll(".timeline-item")] : [];
      if (timeline && timelineItems.length) {
        gsap.fromTo(timeline, { "--timeline-progress": 0 }, {
          "--timeline-progress": 1,
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 69%",
            end: "bottom 58%",
            scrub: 0.45,
            onUpdate: (self) => {
              const activeIndex = Math.min(timelineItems.length - 1, Math.floor(self.progress * timelineItems.length));
              timelineItems.forEach((item, index) => item.classList.toggle("is-current", index === activeIndex));
            }
          }
        });
      }

      if (statement && statementWords.length) {
        gsap.fromTo(statementWords, { "--word-opacity": 0.13 }, {
          "--word-opacity": 1,
          ease: "none",
          stagger: 0.055,
          scrollTrigger: {
            trigger: statement,
            start: "top 78%",
            end: "bottom 58%",
            scrub: 0.55
          }
        });
      }
    }, document.body);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function scheduleBuild() {
    if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
    rebuildFrame = requestAnimationFrame(() => {
      rebuildFrame = 0;
      build();
    });
  }

  window.addEventListener("scroll", schedulePageProgress, { passive: true });
  window.addEventListener("resize", schedulePageProgress, { passive: true });
  const unsubscribeMotion = motion.subscribe(scheduleBuild);
  build();
  updatePageProgress();

  return () => {
    if (progressFrame) cancelAnimationFrame(progressFrame);
    if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
    window.removeEventListener("scroll", schedulePageProgress);
    window.removeEventListener("resize", schedulePageProgress);
    unsubscribeMotion();
    destroyContext();
    setFinalStates(statementWords);
    pageRoot.style.removeProperty(PAGE_PROGRESS_PROPERTY);
  };
}
