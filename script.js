/* ==========================================================================
   Intakhab Nabi — Portfolio
   Vanilla JavaScript only. No libraries, no build step.
   1. Navbar background on scroll
   2. Mobile menu (hamburger)
   3. Smooth scrolling for in-page links
   4. Scroll-spy: highlight the active nav item
   5. Scroll reveal with IntersectionObserver
   6. Back to top + footer year
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Shared references ---------- */
  const nav        = document.getElementById("nav");
  const navToggle  = document.getElementById("navToggle");
  const navMenu    = document.getElementById("navMenu");
  const navLinks   = Array.from(document.querySelectorAll(".nav-link"));
  const sections   = Array.from(document.querySelectorAll("main section[id]"));
  const toTopBtn   = document.getElementById("toTop");
  const yearEl     = document.getElementById("year");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOBILE_QUERY = window.matchMedia("(max-width: 900px)");

  /* ======================================================================
     1. Navbar background once the page is scrolled
     ====================================================================== */
  function updateNavBackground() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  /* ======================================================================
     2. Mobile menu
     ====================================================================== */
  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function openMenu() {
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  }

  navToggle.addEventListener("click", function () {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  // Close the menu on Escape, and return focus to the toggle button
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      navToggle.focus();
    }
  });

  // Reset the menu state when resizing back up to desktop
  MOBILE_QUERY.addEventListener("change", function (e) {
    if (!e.matches) closeMenu();
  });

  /* ======================================================================
     3. Smooth scrolling for every in-page anchor
        (CSS handles it too; this keeps the offset exact and closes the menu)
     ====================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeMenu();

      const navHeight = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

      window.scrollTo({
        top: top,
        behavior: reduceMotion ? "auto" : "smooth"
      });

      // Keep the URL in sync without an extra jump
      history.replaceState(null, "", id);
    });
  });

  /* ======================================================================
     4. Scroll-spy — mark the section currently on screen
     ====================================================================== */
  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        // Pick the visible section closest to the top of the viewport
        const visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });

        if (visible.length) setActiveLink(visible[0].target.id);
      },
      {
        // Activates a section once it crosses the upper third of the screen
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach(function (section) { spy.observe(section); });
  }

  // Edge case: at the very bottom, force the last section active
  function checkBottom() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 4;
    if (atBottom && sections.length) setActiveLink(sections[sections.length - 1].id);
  }

  /* ======================================================================
     5. Scroll reveal
     ====================================================================== */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry, index) {
          if (!entry.isIntersecting) return;

          // Small stagger so grouped cards do not all pop at once
          entry.target.style.transitionDelay = (index * 70) + "ms";
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    // No observer support (or motion turned off): show everything immediately
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* ======================================================================
     6. Back to top + current year
     ====================================================================== */
  toTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", " ");
  });

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ======================================================================
     Scroll listener (throttled with requestAnimationFrame)
     ====================================================================== */
  let ticking = false;

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(function () {
        updateNavBackground();
        checkBottom();
        ticking = false;
      });
    },
    { passive: true }
  );

  // Initial paint
  updateNavBackground();
})();
