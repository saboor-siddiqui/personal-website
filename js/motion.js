export function createMotionPreference() {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener(query.matches));
  };

  query.addEventListener("change", notify);

  return {
    get reduced() {
      return query.matches;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      query.removeEventListener("change", notify);
      listeners.clear();
    }
  };
}

export function hasFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function hasCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}
