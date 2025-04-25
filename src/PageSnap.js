import throttle from "lodash.throttle";
import TinyGesture from "tinygesture";

export default function pagesnap(containerSelector, options = {}) {
  // Select the container and its child sections
  const container = document.querySelector(containerSelector);
  const sections = Array.from(container?.children ?? []);

  // Configuration options
  const delay = options.delay || 700; // Transition delay in ms
  const loop = options.loop ?? false; // Whether to loop from last to first
  const useHash = options.hash ?? false; // Enable URL hash tracking
  const disableBelow = options.disableBelow || 0; // Disable if screen width < this

  // Optional lifecycle callbacks
  const onBeforeLeave = options.onBeforeLeave || null;
  const onAfterLoad = options.onAfterLoad || null;

  if (!container || sections.length === 0) {
    throw new Error("pagesnap error: Container or sections not found.");
  }

  // Internal state
  let current = 0; // Current section index
  let lastHash = ""; // Cached hash to avoid unnecessary updates
  let rafId = null; // requestAnimationFrame ID
  let gesture = null; // Touch gesture instance
  let destroyed = false; // Track destroy state

  // Apply base transition style to the container
  container.style.transition = `transform ${delay}ms ease`;
  container.classList.add("pagesnap-container");

  // Create and insert vertical navigation UI
  const navContainer = document.createElement("div");
  navContainer.className = "pagesnap-nav";
  document.body.appendChild(navContainer);

  /**
   * Determines if pagesnap is currently active based on screen width
   */
  function isEnabled() {
    return window.innerWidth >= disableBelow;
  }

  /**
   * Scroll to a specific section index with animation
   * Handles boundary, callbacks, hash updates, and nav state
   */
  function goTo(index) {
    if (!isEnabled()) return;

    const max = sections.length - 1;

    // Loop or clamp
    if (index < 0) index = loop ? max : 0;
    if (index > max) index = loop ? 0 : max;
    if (index === current) return;

    if (onBeforeLeave) onBeforeLeave(current, index);
    current = index;

    // Schedule transform update using requestAnimationFrame
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      container.style.transform = `translateY(-${current * 100}vh)`;
      updateNav();
      if (useHash) updateHash();
      if (onAfterLoad) onAfterLoad(current);
    });
  }

  /**
   * Updates the browser hash based on the section's `id`
   */
  function updateHash() {
    const id = sections[current].id;
    if (id && id !== lastHash) {
      lastHash = id;
      history.replaceState(null, "", `#${id}`);
    }
  }

  /**
   * On hashchange or page load, scroll to the section that matches the hash
   */
  function checkHash() {
    if (!useHash) return;
    const hash = window.location.hash.slice(1); // Remove `#`
    const targetIndex = sections.findIndex((s) => s.id === hash);
    if (targetIndex !== -1) {
      goTo(targetIndex);
    }
  }

  /**
   * Checks if a section has reached scroll boundary (top or bottom)
   * to allow triggering next/previous page scroll
   */
  function isAtBoundary(el, deltaY) {
    const { scrollTop, scrollHeight, clientHeight } = el;
    return deltaY > 0
      ? scrollTop + clientHeight >= scrollHeight - 1
      : scrollTop <= 1;
  }

  /**
   * Handles mouse wheel scrolling
   */
  const onWheel = throttle(
    (e) => {
      if (!isEnabled()) return;
      const section = sections[current];
      if (isAtBoundary(section, e.deltaY)) {
        e.preventDefault();
        goTo(current + (e.deltaY > 0 ? 1 : -1));
      }
    },
    delay,
    { trailing: false }
  );

  /**
   * Handles keyboard up/down arrow navigation
   */
  const onKey = throttle(
    (e) => {
      if (!isEnabled()) return;
      const dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (dir) goTo(current + dir);
    },
    delay,
    { trailing: false }
  );

  /**
   * Enables vertical swipe gestures using TinyGesture
   */
  function setupSwipe() {
    if (!isEnabled()) return;

    gesture = new TinyGesture(window, {
      threshold: 50,
      velocityThreshold: 0.3,
    });

    gesture.on("swipeup", () => goTo(current + 1));
    gesture.on("swipedown", () => goTo(current - 1));
  }

  /**
   * Updates the active nav dot to match current section
   */
  function updateNav() {
    navContainer.childNodes.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  /**
   * Builds vertical navigation dots UI
   */
  function buildNav() {
    const frag = document.createDocumentFragment();
    sections.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "pagesnap-dot";
      dot.addEventListener("click", () => goTo(i));
      frag.appendChild(dot);
    });

    navContainer.innerHTML = "";
    navContainer.appendChild(frag);
    updateNav();
  }

  /**
   * Bind all event listeners and swipe
   */
  function bindEvents() {
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", checkHash);
    setupSwipe();
  }

  /**
   * Remove all event listeners and destroy gestures
   */
  function unbindEvents() {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", checkHash);
    if (gesture) gesture.destroy();
  }

  /**
   * Fully disable pagesnap and clean up DOM/event listeners
   */
  function destroy() {
    unbindEvents();
    destroyed = true;
    container.style.transform = "";
    navContainer.remove();
  }

  /**
   * Re-initialize pagesnap after destroy
   */
  function rebuild() {
    if (!destroyed) return;
    destroyed = false;
    document.body.appendChild(navContainer);
    buildNav();
    bindEvents();
    checkHash();
  }

  // INITIALIZE
  buildNav();
  bindEvents();
  checkHash();

  // Public API
  return {
    goTo,
    getCurrent: () => current,
    destroy,
    rebuild,
  };
}
