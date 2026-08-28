export function initNavigation() {
  const header = document.querySelector("#site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navPanel = document.querySelector("#nav-panel");
  const main = document.querySelector("main");
  const sectionLinks = [...document.querySelectorAll("[data-nav-section]")];
  const sections = [...document.querySelectorAll("[data-nav-observe]")];
  const controller = new AbortController();
  const { signal } = controller;
  let headerFrame = 0;
  let menuOpen = false;
  const desktopQuery = window.matchMedia("(min-width: 901px)");

  if (!header || !menuButton || !navPanel) return () => controller.abort();

  function syncHeader() {
    headerFrame = 0;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function closeMenu({ restoreFocus = false } = {}) {
    if (!menuOpen) return;
    menuOpen = false;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navPanel.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    main.inert = false;
    if (restoreFocus) menuButton.focus();
  }

  function openMenu() {
    menuOpen = true;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation");
    navPanel.classList.add("is-open");
    document.body.classList.add("menu-open");
    main.inert = true;
    navPanel.querySelector("a")?.focus();
  }

  function handleMenuKeydown(event) {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [menuButton, ...navPanel.querySelectorAll("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  window.addEventListener("scroll", () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(syncHeader);
  }, { passive: true, signal });

  menuButton.addEventListener("click", () => {
    if (menuOpen) closeMenu({ restoreFocus: true });
    else openMenu();
  }, { signal });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(), { signal });
  });

  document.addEventListener("keydown", handleMenuKeydown, { signal });
  const handleDesktopChange = (event) => {
    if (event.matches) closeMenu();
  };
  desktopQuery.addEventListener("change", handleDesktopChange);

  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    sectionLinks.forEach((link) => {
      const current = link.dataset.navSection === active.target.id;
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-28% 0px -58%", threshold: [0, 0.15, 0.4] });

  sections.forEach((section) => sectionObserver.observe(section));
  syncHeader();

  return () => {
    if (headerFrame) cancelAnimationFrame(headerFrame);
    sectionObserver.disconnect();
    desktopQuery.removeEventListener("change", handleDesktopChange);
    main.inert = false;
    controller.abort();
  };
}
