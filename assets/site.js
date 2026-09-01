/* =========================================================================
   Spectra — shared behavior for all pages
   ========================================================================= */
(function () {
  "use strict";

  // Signal that JS is running (gates the .reveal hidden state in CSS).
  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initFaq();
    initDownloadButtons();
    initBuyButtons();
    initYear();
    initSmoothAnchors();
  });

  /* ----------------------------------------------------------------------
     Nav: glass-on-scroll + mobile hamburger
     ---------------------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = nav.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });

      // Close the mobile panel when a link inside it is clicked.
      nav.querySelectorAll(".nav-links a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });

      // Close on Escape.
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("nav-open")) {
          nav.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("reveal-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     FAQ accordion (details/summary enhancement: one open at a time)
     ---------------------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll("details.faq-item").forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        var list = item.closest(".faq-list");
        if (!list) return;
        list.querySelectorAll("details.faq-item[open]").forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     Download buttons: no binaries yet → toast, unless data-live is set
     ---------------------------------------------------------------------- */
  function initDownloadButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-download");
      if (!btn || btn.hasAttribute("data-live")) return;
      e.preventDefault();
      showToast("Coming soon — join the waitlist");
    });
  }

  /* ----------------------------------------------------------------------
     Buy buttons: point SPECTRA_BUY_URL at your merchant-of-record checkout
     (Paddle / Lemon Squeezy / Dodo Payments product link — they handle
     currency conversion and global VAT/GST for you). Empty → helpful toast.
     ---------------------------------------------------------------------- */
  var SPECTRA_BUY_URL = ""; // e.g. "https://spectra.lemonsqueezy.com/buy/xxxx"

  function initBuyButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-buy");
      if (!btn) return;
      if (SPECTRA_BUY_URL) {
        btn.setAttribute("href", SPECTRA_BUY_URL);
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener");
        return; // let the click proceed to checkout
      }
      e.preventDefault();
      showToast("Checkout opens here once the store is connected — see docs → Licensing & Payments");
    });
  }

  var toastEl = null;
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // Restart the animation if the toast is already visible.
    toastEl.classList.remove("show");
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ----------------------------------------------------------------------
     Current year
     ---------------------------------------------------------------------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ----------------------------------------------------------------------
     Smooth anchor scrolling (respects reduced motion)
     ---------------------------------------------------------------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute("href");
      if (id === "#") return; // plain placeholders (e.g. download stubs)
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
      if (history.pushState) history.pushState(null, "", id);
    });
  }
})();
