import { hasFinePointer } from "./motion.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const LOOM_MODES = [
  { name: "Agentic AI", label: "Neural mesh", detail: "Reason · review · act" },
  { name: "Big Data", label: "Streaming field", detail: "25–30 TB moving daily" },
  { name: "Cloud Scale", label: "Cloud matrix", detail: "AWS + GCP · resilient scale" }
];

export function initLoomInteractions({ scene, motion }) {
  const stage = document.querySelector("#loom-stage");
  const viewport = document.querySelector("#loom-viewport");
  const buttons = [...document.querySelectorAll("[data-loom-mode]")];
  const indexLabel = document.querySelector("#loom-index");
  const titleLabel = document.querySelector("#loom-label");
  const detailLabel = document.querySelector("#loom-detail");
  const liveRegion = document.querySelector("#loom-live");
  const instruction = document.querySelector("#loom-instruction");
  const controller = new AbortController();
  const { signal } = controller;

  if (!stage || !viewport || !indexLabel || !titleLabel || !detailLabel || !liveRegion) {
    return () => controller.abort();
  }

  const statusLabel = stage.querySelector(".loom-live");
  const drag = {
    active: false,
    intent: null,
    pointerId: null,
    pointerType: "mouse",
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    velocityYaw: 0,
    velocityPitch: 0
  };

  function eventToNdc(event) {
    const rect = viewport.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / Math.max(1, rect.width) * 2 - 1, -1, 1),
      y: clamp(1 - (event.clientY - rect.top) / Math.max(1, rect.height) * 2, -1, 1)
    };
  }

  function updateMeta(nextMode, announce = true) {
    const mode = clamp(Number(nextMode) || 0, 0, 2);
    const meta = LOOM_MODES[mode];
    stage.dataset.mode = String(mode);
    indexLabel.textContent = `0${mode + 1}`;
    titleLabel.textContent = meta.label;
    detailLabel.textContent = meta.detail;
    buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === mode)));
    viewport.setAttribute("aria-label", scene
      ? `Explore the ${meta.name} ${meta.label} and send a signal`
      : `${meta.name} ${meta.label} static preview`);
    scene?.setMode(mode, { immediate: motion.reduced });
    if (announce) liveRegion.textContent = `${meta.name} view selected: ${meta.detail}.`;
    return mode;
  }

  function pulse(event) {
    if (!scene) return;
    const ndc = event ? eventToNdc(event) : { x: 0, y: 0 };
    scene.pulseNDC(ndc.x, ndc.y);
    const mode = LOOM_MODES[Number(stage.dataset.mode) || 0];
    liveRegion.textContent = `${mode.name} signal transmitted.`;
  }

  if (!scene) {
    viewport.removeAttribute("role");
    viewport.removeAttribute("tabindex");
    if (instruction) instruction.textContent = "Static preview · choose a systems view";
    if (statusLabel) statusLabel.textContent = "Static systems map";
  } else {
    viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      drag.active = true;
      drag.intent = event.pointerType === "mouse" ? "horizontal" : null;
      drag.pointerId = event.pointerId;
      drag.pointerType = event.pointerType;
      drag.moved = false;
      drag.startX = drag.lastX = event.clientX;
      drag.startY = drag.lastY = event.clientY;
      drag.lastTime = performance.now();
      drag.velocityYaw = 0;
      drag.velocityPitch = 0;

      if (drag.intent === "horizontal") {
        viewport.classList.add("is-dragging");
        scene.beginDrag();
        const ndc = eventToNdc(event);
        scene.setPointerNDC(ndc.x, ndc.y, true);
        try { viewport.setPointerCapture(event.pointerId); } catch {}
      }
    }, { signal });

    viewport.addEventListener("pointermove", (event) => {
      if (!drag.active || event.pointerId !== drag.pointerId) {
        if (event.pointerType === "mouse") {
          const ndc = eventToNdc(event);
          scene.setPointerNDC(ndc.x, ndc.y, true);
        }
        return;
      }

      const now = performance.now();
      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      const elapsed = Math.max(0.008, (now - drag.lastTime) / 1000);
      const totalX = event.clientX - drag.startX;
      const totalY = event.clientY - drag.startY;

      if (!drag.intent) {
        if (Math.hypot(totalX, totalY) < 7) return;
        if (Math.abs(totalX) > Math.abs(totalY) + 5) {
          drag.intent = "horizontal";
          viewport.classList.add("is-dragging");
          scene.beginDrag();
          try { viewport.setPointerCapture(event.pointerId); } catch {}
        } else if (Math.abs(totalY) > Math.abs(totalX) + 5) {
          drag.intent = "vertical";
          scene.setPointerNDC(0, 0, false);
          return;
        } else {
          return;
        }
      }

      if (drag.intent === "vertical") return;
      if (Math.hypot(totalX, totalY) > 7) drag.moved = true;

      const ndc = eventToNdc(event);
      scene.setPointerNDC(ndc.x, ndc.y, true);
      scene.rotateBy(deltaX * 0.006, deltaY * 0.0045);
      drag.velocityYaw = drag.velocityYaw * 0.55 + deltaX * 0.006 / elapsed * 0.45;
      drag.velocityPitch = drag.velocityPitch * 0.55 + deltaY * 0.0045 / elapsed * 0.45;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastTime = now;
      if (event.cancelable) event.preventDefault();
    }, { signal });

    function endDrag(event, cancelled = false) {
      if (!drag.active || (event.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
      const wasMoved = drag.moved;
      const completedIntent = drag.intent;
      const pointerType = drag.pointerType;
      const pointerId = drag.pointerId;
      drag.active = false;
      drag.pointerId = null;
      drag.intent = null;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture?.(pointerId)) viewport.releasePointerCapture(pointerId);
      if (completedIntent === "horizontal") {
        scene.releaseWithVelocity(cancelled || motion.reduced ? 0 : drag.velocityYaw, cancelled || motion.reduced ? 0 : drag.velocityPitch);
      }
      if (pointerType !== "mouse") scene.setPointerNDC(0, 0, false);
      if (!cancelled && !wasMoved && completedIntent !== "vertical") pulse(event);
    }

    viewport.addEventListener("pointerup", (event) => endDrag(event), { signal });
    viewport.addEventListener("pointercancel", (event) => endDrag(event, true), { signal });
    viewport.addEventListener("lostpointercapture", (event) => {
      if (drag.active) endDrag(event, true);
    }, { signal });
    viewport.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      const ndc = eventToNdc(event);
      scene.setPointerNDC(ndc.x, ndc.y, true);
    }, { signal });
    viewport.addEventListener("pointerleave", () => {
      if (!drag.active) scene.setPointerNDC(0, 0, false);
    }, { signal });

    viewport.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 0.22 : 0.11;
      if (event.key === "ArrowLeft") scene.rotateBy(-step, 0);
      else if (event.key === "ArrowRight") scene.rotateBy(step, 0);
      else if (event.key === "ArrowUp") scene.rotateBy(0, -0.09);
      else if (event.key === "ArrowDown") scene.rotateBy(0, 0.09);
      else if (event.key === "Enter" || event.key === " ") pulse();
      else if (event.key >= "1" && event.key <= "3") updateMeta(Number(event.key) - 1);
      else if (event.key === "Home") scene.resetView();
      else return;
      event.preventDefault();
    }, { signal });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => updateMeta(button.dataset.loomMode), { signal });
  });

  const unsubscribeMotion = motion.subscribe((reduced) => scene?.setReducedMotion(reduced));
  updateMeta(0, false);

  return () => {
    unsubscribeMotion();
    controller.abort();
  };
}

export function initPremiumInteractions({ motion }) {
  const finePointer = hasFinePointer();
  const controller = new AbortController();
  const { signal } = controller;
  const aura = document.querySelector(".pointer-aura");
  const magneticElements = [...document.querySelectorAll("[data-magnetic]")];
  const tiltElements = [...document.querySelectorAll("[data-tilt]")];
  let pointerFrame = 0;
  let pointerX = -400;
  let pointerY = -400;

  if (finePointer && aura) {
    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(() => {
          document.documentElement.style.setProperty("--pointer-x", `${pointerX}px`);
          document.documentElement.style.setProperty("--pointer-y", `${pointerY}px`);
          aura.classList.toggle("is-visible", !motion.reduced);
          pointerFrame = 0;
        });
      }
    }, { passive: true, signal });

    document.documentElement.addEventListener("mouseleave", () => aura.classList.remove("is-visible"), { signal });
  }

  magneticElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (!finePointer || motion.reduced) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.classList.add("is-magnetic");
      element.style.setProperty("--magnetic-x", `${(x * 7).toFixed(2)}px`);
      element.style.setProperty("--magnetic-y", `${(y * 6).toFixed(2)}px`);
    }, { signal });

    element.addEventListener("pointerleave", () => {
      element.classList.remove("is-magnetic");
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    }, { signal });
  });

  tiltElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (!finePointer || motion.reduced) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      element.classList.add("is-interacting");
      element.style.setProperty("--tilt-ry", `${((x - 0.5) * 5.5).toFixed(2)}deg`);
      element.style.setProperty("--tilt-rx", `${((0.5 - y) * 5.5).toFixed(2)}deg`);
      element.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
      element.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
    }, { signal });

    element.addEventListener("pointerleave", () => {
      element.classList.remove("is-interacting");
      element.style.setProperty("--tilt-rx", "0deg");
      element.style.setProperty("--tilt-ry", "0deg");
    }, { signal });
  });

  const unsubscribeMotion = motion.subscribe((reduced) => {
    if (!reduced) return;
    aura?.classList.remove("is-visible");
    magneticElements.forEach((element) => {
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    });
    tiltElements.forEach((element) => {
      element.style.setProperty("--tilt-rx", "0deg");
      element.style.setProperty("--tilt-ry", "0deg");
    });
  });

  return () => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    unsubscribeMotion();
    controller.abort();
  };
}
