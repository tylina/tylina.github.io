export function setupSiteNavigation(closeLanguagePickers) {
  const nav = document.querySelector(".site-nav");
  if (!nav) return { close() {} };
  const toggle = nav.querySelector(".site-nav-toggle");
  const links = nav.querySelector(".site-nav-links");
  const compact = matchMedia("(max-width: 1080px)");
  // CSS can hide the active link before matchMedia fires, moving focus to body.
  // Keep its ownership until focus explicitly enters a different control.
  let focusOwner = null;
  document.addEventListener("focusin", (event) => {
    focusOwner = links.contains(event.target) ? "links" : event.target === toggle ? "toggle" : null;
  });

  function close(restoreFocus = false) {
    toggle.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    closeLanguagePickers();
    toggle.setAttribute("aria-expanded", String(willOpen));
    nav.dataset.open = String(willOpen);
  });
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      close(true);
    }
  });
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) close();
  });
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) close(compact.matches);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!nav.contains(event.target)) { focusOwner = null; close(); }
  });
  compact.addEventListener("change", () => {
    const previousOwner = focusOwner;
    close(compact.matches && previousOwner === "links");
    if (!compact.matches && previousOwner === "toggle") links.querySelector("a").focus();
  });
  return { close };
}
