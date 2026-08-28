import { initLoomInteractions, initPremiumInteractions } from "./interactions.js";
import { createMotionPreference, hasCoarsePointer } from "./motion.js";
import { initNavigation } from "./navigation.js";
import { initParallax } from "./parallax.js";

const cleanups = [];
let disposed = false;
let scene = null;

function register(initializer, label) {
  try {
    const cleanup = initializer();
    if (typeof cleanup === "function") {
      if (disposed) cleanup();
      else cleanups.push(cleanup);
    }
    return cleanup;
  } catch (error) {
    console.error(`${label} could not start.`, error);
    return null;
  }
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const motion = createMotionPreference();
const canvas = document.querySelector("#loom-canvas");
const forceFallback = new URLSearchParams(window.location.search).has("no-webgl");

function canUseWebGL() {
  if (forceFallback || !canvas || !("WebGLRenderingContext" in window)) return false;

  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

register(() => initNavigation(), "Navigation");
register(() => initPremiumInteractions({ motion }), "Pointer interactions");
document.documentElement.classList.add("experience-ready");

async function startSpatialExperience() {
  if (canUseWebGL()) {
    try {
      const { createDataLoom } = await import("./three/three-scene.js");
      if (disposed) return;
      scene = createDataLoom({
        canvas,
        coarse: hasCoarsePointer(),
        reducedMotion: motion.reduced
      });
    } catch (error) {
      console.warn("Using the static systems observatory fallback.", error);
    }
  }

  if (disposed) {
    scene?.destroy();
    return;
  }

  if (!scene) document.documentElement.classList.add("webgl-unavailable");
  register(() => initLoomInteractions({ scene, motion }), "Observatory interactions");
  register(() => initParallax({ scene, motion }), "Parallax");
}

async function startScrollExperience() {
  try {
    const { initScrollAnimations } = await import("./animations.js");
    if (!disposed) register(() => initScrollAnimations({ motion }), "Scroll animation");
  } catch (error) {
    console.error("Scroll animation could not start.", error);
  }
}

startSpatialExperience();
startScrollExperience();

function handlePageHide(event) {
  if (event.persisted || disposed) return;
  disposed = true;
  while (cleanups.length) cleanups.pop()?.();
  scene?.destroy();
  motion.destroy();
}

window.addEventListener("pagehide", handlePageHide);
