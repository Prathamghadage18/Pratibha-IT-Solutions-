/* main.js - smooth scroll, active nav, counters, testimonials, form validation, dynamic year */

/* -------------------------
   Helpers
   ------------------------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

/* Dynamic Year in all pages */
document.addEventListener("DOMContentLoaded", () => {
  const y = new Date().getFullYear();
  ["currentYear", "currentYear2", "currentYear3", "year"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = y;
  });
});

/* -------------------------
   Smooth scrolling for same-page anchors
   ------------------------- */
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute("href");
  // Only smooth-scroll if target exists on this page
  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

/* -------------------------
   Active nav link highlighting (for index page sections)
   ------------------------- */
function activateNavOnScroll() {
  // only if we have section anchors on this page
  const navLinks = $$("a.nav-link");
  const sections = $$("section[id]").filter((s) => s.id);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const navLink = navLinks.find((l) => {
          const href = l.getAttribute("href") || "";
          return (
            href.endsWith("#" + id) ||
            href === "#" + id ||
            href.includes(window.location.pathname + "#" + id)
          );
        });
        if (entry.isIntersecting) {
          // remove active from all similar links
          navLinks.forEach((n) => n.classList.remove("active"));
          if (navLink) navLink.classList.add("active");
        }
      });
    },
    { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}
document.addEventListener("DOMContentLoaded", activateNavOnScroll);

/* -------------------------
   Animated Counters (when visible)
   ------------------------- */
function setupCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;

  const runCounter = (el) => {
    const target = +el.dataset.target;
    const start = 0;
    const duration = 1600;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (target - start) + start);
      el.textContent = value;
      if (progress < 1) window.requestAnimationFrame(step);
      else el.textContent = target;
    }
    window.requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          o.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => obs.observe(c));
}
document.addEventListener("DOMContentLoaded", setupCounters);

/* -------------------------
   Testimonial slider (vanilla JS)
   ------------------------- */
(function testimonialSlider() {
  const slides = $$(".testimonial-slide");
  if (!slides.length) return;

  let idx = 0;
  let interval = null;
  const show = (i) => {
    slides.forEach((s, j) => s.classList.toggle("active", i === j));
  };

  const next = () => {
    idx = (idx + 1) % slides.length;
    show(idx);
  };
  const prev = () => {
    idx = (idx - 1 + slides.length) % slides.length;
    show(idx);
  };

  document.addEventListener("DOMContentLoaded", () => {
    show(idx);
    interval = setInterval(next, 6000);
    const nextBtn = $("#nextTest");
    const prevBtn = $("#prevTest");
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        next();
        resetInterval();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        prev();
        resetInterval();
      });
  });

  function resetInterval() {
    if (interval) {
      clearInterval(interval);
      interval = setInterval(next, 6000);
    }
  }
})();

/* -------------------------
   Simple Form Validation (real-time & on submit)
   ------------------------- */
function setupFormValidation() {
  const forms = $$(".needs-validation, form"); // we'll pick our forms by id too
  // index small form
  const formIndex = $("#contactFormIndex");
  const formPage = $("#contactFormPage");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  function attachGeneral(form, fields) {
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach((f) => {
        const el = form.querySelector(f.selector);
        if (!el) return;
        if (f.type === "email") {
          if (!validateEmail(el.value.trim())) {
            valid = false;
            el.classList.add("is-invalid");
            el.classList.remove("is-valid");
          } else {
            el.classList.remove("is-invalid");
            el.classList.add("is-valid");
          }
        } else {
          if (!el.value.trim()) {
            valid = false;
            el.classList.add("is-invalid");
            el.classList.remove("is-valid");
          } else {
            el.classList.remove("is-invalid");
            el.classList.add("is-valid");
          }
        }
      });

      if (valid) {
        // Replace with real submission (AJAX / fetch) as needed.
        form.reset();
        fields.forEach((f) => {
          const el = form.querySelector(f.selector);
          if (el) el.classList.remove("is-valid");
        });
        alert(
          "Thanks — your message was validated (client-side). Implement backend submit as needed."
        );
      } else {
        // Show first invalid field focus
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
      }
    });

    // Real-time feedback
    fields.forEach((f) => {
      const el = form.querySelector(f.selector);
      if (!el) return;
      el.addEventListener("input", () => {
        if (f.type === "email") {
          if (validateEmail(el.value.trim())) {
            el.classList.remove("is-invalid");
            el.classList.add("is-valid");
          } else {
            el.classList.remove(
              "is-valid"
            ); /* keep invalid until touched further */
          }
        } else {
          if (el.value.trim()) {
            el.classList.remove("is-invalid");
            el.classList.add("is-valid");
          } else {
            el.classList.remove(
              "is-valid"
            ); /* keep invalid until touched further */
          }
        }
      });
    });
  }

  attachGeneral(formIndex, [
    { selector: "#nameIndex" },
    { selector: "#emailIndex", type: "email" },
    { selector: "#messageIndex" },
  ]);

  attachGeneral(formPage, [
    { selector: "#namePage" },
    { selector: "#emailPage", type: "email" },
    { selector: "#subjectPage" },
    { selector: "#messagePage" },
  ]);
}
document.addEventListener("DOMContentLoaded", setupFormValidation);

/* -------------------------
   Mark current page's nav link as active (simple)
   ------------------------- */
function markActiveLinkByPath() {
  const navLinks = $$("a.nav-link, .dropdown-item");
  const path = window.location.pathname.split("/").pop();
  navLinks.forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.endsWith(path) || (href === "" && path === "")) {
      a.classList.add("active");
    } else {
      // if link points to a page and matches
      const anchor = href.split("#")[0];
      if (anchor && anchor === path) a.classList.add("active");
    }
  });
}
document.addEventListener("DOMContentLoaded", markActiveLinkByPath);

document.addEventListener("DOMContentLoaded", function () {
  var servicesLink = document.getElementById("servicesDrop");
  if (servicesLink) {
    servicesLink.addEventListener("click", function (e) {
      // Only navigate if on desktop (not collapsed menu)
      if (window.innerWidth >= 992) {
        window.location = this.getAttribute("href");
      }
      // Otherwise, let Bootstrap handle dropdown for mobile
    });
  }
});
