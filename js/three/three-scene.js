import * as THREE from "three";
import { createLoomShapes, LOOM_PALETTES } from "./loom-shapes.js";

const VERTEX_SHADER = /* glsl */ `
  attribute float aSeed;
  attribute float aEnergy;
  uniform float uDpr;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vColor;
  varying float vEnergy;
  varying float vDepth;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float perspective = 4.2 / max(1.0, -viewPosition.z);
    gl_PointSize = clamp((2.5 + aSeed * 2.0 + aEnergy * 6.0) * uDpr * perspective, 1.0, 13.0);
    gl_Position = projectionMatrix * viewPosition;
    vColor = mix(uColorA, uColorB, aSeed);
    vEnergy = aEnergy;
    vDepth = clamp((5.2 + viewPosition.z) / 4.5, 0.2, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vEnergy;
  varying float vDepth;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float radius = length(point);
    float body = 1.0 - smoothstep(0.12, 0.5, radius);
    float core = exp(-radius * radius * 78.0);
    if (body < 0.012) discard;
    vec3 color = mix(vColor, vec3(1.0), vEnergy * 0.7);
    float alpha = body * (0.34 + core * 0.72 + vEnergy * 0.35) * vDepth;
    gl_FragColor = vec4(color * (body + core * 1.25), alpha);
  }
`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const damp = (current, target, lambda, delta) => current + (target - current) * (1 - Math.exp(-lambda * delta));

function createStars(coarse) {
  const count = coarse ? 34 : 72;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (Math.random() - 0.5) * 4.5;
    positions[offset + 1] = (Math.random() - 0.5) * 3.4;
    positions[offset + 2] = -0.7 - Math.random() * 2.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x9aa7d8,
    size: coarse ? 0.014 : 0.018,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometry, material);
}

export function createDataLoom({ canvas, coarse = false, reducedMotion = false } = {}) {
  if (!canvas) return null;

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !coarse,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
  } catch (error) {
    console.warn("The spatial data scene could not start.", error);
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0.02, 3.75);

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const field = new THREE.Group();
  field.rotation.set(-0.13, 0.28, 0.02);
  scene.add(field);

  const stars = createStars(coarse);
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0x667199, 0.6));
  const violetLight = new THREE.PointLight(0xb7a2ff, 12, 7, 2);
  violetLight.position.set(-1.7, 1.7, 2.2);
  scene.add(violetLight);
  const cyanLight = new THREE.PointLight(0x67e8f9, 9, 6, 2);
  cyanLight.position.set(1.8, -1.1, 1.8);
  scene.add(cyanLight);

  const shapeData = createLoomShapes({ coarse });
  const basePositions = new Float32Array(shapeData.targets[0]);
  const displayPositions = new Float32Array(basePositions);
  const energies = new Float32Array(shapeData.count);
  const positionAttribute = new THREE.BufferAttribute(displayPositions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  const energyAttribute = new THREE.BufferAttribute(energies, 1);
  energyAttribute.setUsage(THREE.DynamicDrawUsage);

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", positionAttribute);
  pointGeometry.setAttribute("aSeed", new THREE.BufferAttribute(shapeData.seeds, 1));
  pointGeometry.setAttribute("aEnergy", energyAttribute);

  const palette = LOOM_PALETTES[0];
  const pointMaterial = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uDpr: { value: 1 },
      uColorA: { value: new THREE.Color(palette.primary) },
      uColorB: { value: new THREE.Color(palette.secondary) }
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(pointGeometry, pointMaterial);
  points.frustumCulled = false;
  field.add(points);

  const lineMaterials = LOOM_PALETTES.map((modePalette, index) => new THREE.LineBasicMaterial({
    color: modePalette.secondary,
    transparent: true,
    opacity: index === 0 ? 0.24 : 0,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending
  }));

  const lineObjects = shapeData.lineIndices.map((indices, index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positionAttribute);
    geometry.setIndex(indices);
    const lines = new THREE.LineSegments(geometry, lineMaterials[index]);
    lines.frustumCulled = false;
    field.add(lines);
    return lines;
  });

  const kernelGeometry = new THREE.IcosahedronGeometry(0.22, 2);
  const kernelMaterial = new THREE.MeshStandardMaterial({
    color: palette.primary,
    emissive: palette.secondary,
    emissiveIntensity: 0.35,
    metalness: 0.66,
    roughness: 0.2,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  });
  const kernel = new THREE.Mesh(kernelGeometry, kernelMaterial);
  field.add(kernel);

  const kernelEdgesGeometry = new THREE.EdgesGeometry(kernelGeometry, 18);
  const kernelEdgesMaterial = new THREE.LineBasicMaterial({
    color: palette.secondary,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const kernelEdges = new THREE.LineSegments(kernelEdgesGeometry, kernelEdgesMaterial);
  kernel.add(kernelEdges);

  const state = {
    mode: 0,
    reducedMotion,
    visible: true,
    contextLost: false,
    destroyed: false,
    running: false,
    dragging: false,
    yaw: 0.28,
    pitch: -0.13,
    targetYaw: 0.28,
    targetPitch: -0.13,
    velocityYaw: 0,
    velocityPitch: 0,
    pointerInside: false,
    pointerStrength: 0,
    targetPointerStrength: 0,
    scroll: 0,
    targetScroll: 0,
    pulseActive: false,
    reducedPulseActive: false,
    pulseStart: 0,
    lastTime: performance.now(),
    lastRendered: 0,
    firstRender: true
  };
  let reducedPulseTimeout = 0;

  const pointerNdc = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const localPlane = new THREE.Plane();
  const planeNormal = new THREE.Vector3();
  const hitWorld = new THREE.Vector3();
  const pointerLocal = new THREE.Vector3(0, 0, 0);
  const pulseLocal = new THREE.Vector3(0, 0, 0);
  const paletteA = new THREE.Color(palette.primary);
  const paletteB = new THREE.Color(palette.secondary);
  const targetPaletteA = new THREE.Color(palette.primary);
  const targetPaletteB = new THREE.Color(palette.secondary);
  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    syncLoop();
  }, { rootMargin: "140px" });

  function updateDpr() {
    const maxDpr = coarse ? 1.2 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    renderer.setPixelRatio(dpr);
    pointMaterial.uniforms.uDpr.value = dpr;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    updateDpr();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    invalidate();
  }

  function projectNdcToLocal(x, y, target) {
    pointerNdc.set(x, y);
    raycaster.setFromCamera(pointerNdc, camera);
    planeNormal.set(0, 0, 1).applyQuaternion(field.quaternion).normalize();
    localPlane.setFromNormalAndCoplanarPoint(planeNormal, field.position);
    if (!raycaster.ray.intersectPlane(localPlane, hitWorld)) return false;
    target.copy(hitWorld);
    field.worldToLocal(target);
    return true;
  }

  function updatePositions(now, delta) {
    const target = shapeData.targets[state.mode];
    const morphEase = state.reducedMotion ? 1 : 1 - Math.exp(-6.6 * delta);
    const pointerEase = state.reducedMotion ? 1 : 1 - Math.exp(-8 * delta);
    state.pointerStrength = damp(state.pointerStrength, state.targetPointerStrength, 8, delta);

    const pulseProgress = state.pulseActive ? clamp((now - state.pulseStart) / 980, 0, 1) : 1;
    if (pulseProgress >= 1) state.pulseActive = false;
    const pulseRadius = pulseProgress * 2.25;
    const pulseStrength = state.pulseActive ? 1 - pulseProgress : 0;

    for (let index = 0; index < shapeData.count; index += 1) {
      const offset = index * 3;
      basePositions[offset] += (target[offset] - basePositions[offset]) * morphEase;
      basePositions[offset + 1] += (target[offset + 1] - basePositions[offset + 1]) * morphEase;
      basePositions[offset + 2] += (target[offset + 2] - basePositions[offset + 2]) * morphEase;

      let x = basePositions[offset];
      let y = basePositions[offset + 1];
      let z = basePositions[offset + 2];
      const seed = shapeData.seeds[index];

      if (!state.reducedMotion) {
        const drift = now * 0.00034 + seed * 18;
        x += Math.sin(drift) * 0.008;
        y += Math.cos(drift * 0.79) * 0.007;
        z += Math.sin(drift * 0.63) * 0.008;
      }

      if (state.pointerStrength > 0.001) {
        const dx = x - pointerLocal.x;
        const dy = y - pointerLocal.y;
        const dz = z - pointerLocal.z;
        const distance = Math.hypot(dx, dy, dz) || 1;
        if (distance < 0.58) {
          const force = Math.pow(1 - distance / 0.58, 2) * 0.12 * state.pointerStrength;
          x += dx / distance * force;
          y += dy / distance * force;
          z += dz / distance * force;
        }
      }

      let energy = state.reducedPulseActive ? 0.65 : 0;
      if (state.pulseActive) {
        const dx = x - pulseLocal.x;
        const dy = y - pulseLocal.y;
        const dz = z - pulseLocal.z;
        const distance = Math.hypot(dx, dy, dz) || 1;
        const band = Math.exp(-Math.pow((distance - pulseRadius) / 0.12, 2)) * pulseStrength;
        x += dx / distance * band * 0.2;
        y += dy / distance * band * 0.2;
        z += dz / distance * band * 0.2;
        energy = band;
      }

      displayPositions[offset] = x;
      displayPositions[offset + 1] = y;
      displayPositions[offset + 2] = z;
      energies[index] += (energy - energies[index]) * pointerEase;
    }

    positionAttribute.needsUpdate = true;
    energyAttribute.needsUpdate = true;
  }

  function renderFrame(now, force = false) {
    if (state.destroyed || state.contextLost || document.hidden) return;
    if (!force && !state.visible) return;
    const frameBudget = coarse ? 30 : 16;
    if (!force && now - state.lastRendered < frameBudget) return;
    state.lastRendered = now;

    const delta = Math.min(0.034, Math.max(0.001, (now - state.lastTime) / 1000));
    state.lastTime = now;

    if (!state.reducedMotion) {
      if (!state.dragging) {
        state.targetYaw += 0.026 * delta;
        state.targetYaw += state.velocityYaw * delta;
        state.targetPitch = clamp(state.targetPitch + state.velocityPitch * delta, -0.82, 0.82);
        const friction = Math.exp(-4.8 * delta);
        state.velocityYaw *= friction;
        state.velocityPitch *= friction;
      }
      state.yaw = damp(state.yaw, state.targetYaw, state.dragging ? 18 : 8, delta);
      state.pitch = damp(state.pitch, state.targetPitch, state.dragging ? 18 : 8, delta);
      state.scroll = damp(state.scroll, state.targetScroll, 5, delta);
    } else {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
      state.scroll = state.targetScroll;
    }

    field.rotation.y = state.yaw;
    field.rotation.x = state.pitch;
    field.rotation.z = 0.018 + state.scroll * 0.035;
    field.position.y = 0.05 + state.scroll * 0.17;
    field.scale.setScalar(1 - state.scroll * 0.08);
    camera.position.z = 3.75 + state.scroll * 0.34;
    stars.rotation.y = now * 0.000018;
    stars.position.y = state.scroll * 0.1;

    updatePositions(now, delta);

    const colorEase = state.reducedMotion ? 1 : 1 - Math.exp(-5.5 * delta);
    paletteA.lerp(targetPaletteA, colorEase);
    paletteB.lerp(targetPaletteB, colorEase);
    pointMaterial.uniforms.uColorA.value.copy(paletteA);
    pointMaterial.uniforms.uColorB.value.copy(paletteB);
    kernelMaterial.color.lerp(targetPaletteA, colorEase);
    kernelMaterial.emissive.lerp(targetPaletteB, colorEase);
    kernelEdgesMaterial.color.lerp(targetPaletteB, colorEase);
    lineMaterials.forEach((material, index) => {
      const targetOpacity = index === state.mode ? 0.24 : 0;
      material.opacity = damp(material.opacity, targetOpacity, 7, delta);
      material.color.lerp(index === state.mode ? targetPaletteB : targetPaletteA, colorEase);
    });

    kernel.rotation.x = now * (state.reducedMotion ? 0 : 0.00012);
    kernel.rotation.y = now * (state.reducedMotion ? 0 : 0.00018);
    const targetKernelScale = [1, 0.76, 1.08][state.mode];
    const nextScale = damp(kernel.scale.x, targetKernelScale, 5, delta);
    kernel.scale.setScalar(nextScale);

    renderer.render(scene, camera);
    if (state.firstRender) {
      state.firstRender = false;
      document.documentElement.classList.add("webgl-ready");
    }
  }

  function animate(now) {
    renderFrame(now);
  }

  function start() {
    if (state.running || state.reducedMotion || !state.visible || document.hidden || state.contextLost) return;
    state.running = true;
    state.lastTime = performance.now();
    renderer.setAnimationLoop(animate);
  }

  function stop() {
    if (!state.running) return;
    state.running = false;
    renderer.setAnimationLoop(null);
  }

  function syncLoop() {
    if (state.reducedMotion || !state.visible || document.hidden || state.contextLost) {
      stop();
      if (!state.contextLost && state.visible && !document.hidden) renderFrame(performance.now(), true);
    } else {
      start();
    }
  }

  function invalidate() {
    if (state.reducedMotion) renderFrame(performance.now(), true);
    else start();
  }

  function setMode(index, { immediate = false } = {}) {
    state.mode = clamp(Number(index) || 0, 0, 2);
    const nextPalette = LOOM_PALETTES[state.mode];
    targetPaletteA.setHex(nextPalette.primary);
    targetPaletteB.setHex(nextPalette.secondary);
    if (immediate || state.reducedMotion) {
      basePositions.set(shapeData.targets[state.mode]);
      displayPositions.set(shapeData.targets[state.mode]);
      paletteA.copy(targetPaletteA);
      paletteB.copy(targetPaletteB);
      lineMaterials.forEach((material, materialIndex) => {
        material.opacity = materialIndex === state.mode ? 0.24 : 0;
      });
      positionAttribute.needsUpdate = true;
    }
    invalidate();
  }

  function setPointerNDC(x, y, inside = true) {
    state.pointerInside = inside;
    state.targetPointerStrength = inside && !state.reducedMotion ? 1 : 0;
    if (inside) projectNdcToLocal(x, y, pointerLocal);
    invalidate();
  }

  function beginDrag() {
    state.dragging = true;
    state.velocityYaw = 0;
    state.velocityPitch = 0;
    start();
  }

  function rotateBy(deltaX, deltaY) {
    state.targetYaw += deltaX;
    state.targetPitch = clamp(state.targetPitch + deltaY, -0.82, 0.82);
    invalidate();
  }

  function releaseWithVelocity(yaw = 0, pitch = 0) {
    state.dragging = false;
    if (!state.reducedMotion) {
      state.velocityYaw = clamp(yaw, -3.2, 3.2);
      state.velocityPitch = clamp(pitch, -2.4, 2.4);
    }
    invalidate();
  }

  function pulseNDC(x = 0, y = 0) {
    if (!projectNdcToLocal(x, y, pulseLocal)) pulseLocal.set(0, 0, 0);
    if (state.reducedMotion) {
      state.reducedPulseActive = true;
      renderFrame(performance.now(), true);
      window.clearTimeout(reducedPulseTimeout);
      reducedPulseTimeout = window.setTimeout(() => {
        if (state.destroyed || state.contextLost) return;
        state.reducedPulseActive = false;
        renderFrame(performance.now(), true);
      }, 140);
      return;
    }
    state.pulseActive = true;
    state.pulseStart = performance.now();
    start();
  }

  function resetView() {
    state.targetYaw = 0.28;
    state.targetPitch = -0.13;
    state.velocityYaw = 0;
    state.velocityPitch = 0;
    invalidate();
  }

  function setScrollProgress(progress) {
    state.targetScroll = clamp(progress, 0, 1);
    invalidate();
  }

  function setReducedMotion(reduced) {
    state.reducedMotion = reduced;
    state.velocityYaw = 0;
    state.velocityPitch = 0;
    setMode(state.mode, { immediate: true });
    syncLoop();
  }

  function handleVisibility() {
    syncLoop();
  }

  function handleContextLost(event) {
    event.preventDefault();
    state.contextLost = true;
    stop();
    document.documentElement.classList.remove("webgl-ready");
  }

  function handleContextRestored() {
    if (state.destroyed) return;
    state.contextLost = false;
    state.firstRender = true;
    resize();
    syncLoop();
  }

  function destroy() {
    if (state.destroyed) return;
    state.destroyed = true;
    window.clearTimeout(reducedPulseTimeout);
    stop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener("visibilitychange", handleVisibility);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    pointGeometry.dispose();
    pointMaterial.dispose();
    lineObjects.forEach((lines) => lines.geometry.dispose());
    lineMaterials.forEach((material) => material.dispose());
    kernelEdgesGeometry.dispose();
    kernelEdgesMaterial.dispose();
    kernelGeometry.dispose();
    kernelMaterial.dispose();
    stars.geometry.dispose();
    stars.material.dispose();
    renderer.dispose();
    document.documentElement.classList.remove("webgl-ready");
  }

  resizeObserver.observe(canvas);
  visibilityObserver.observe(canvas);
  document.addEventListener("visibilitychange", handleVisibility);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);
  resize();
  setMode(0, { immediate: true });
  syncLoop();

  return {
    setMode,
    setPointerNDC,
    beginDrag,
    rotateBy,
    releaseWithVelocity,
    pulseNDC,
    resetView,
    setScrollProgress,
    setReducedMotion,
    invalidate,
    destroy
  };
}
