/* Theme switcher for the design-system pages.
   Choices persist in localStorage. No framework, no build step.
   Markup contract: [data-theme-set="professional|section9"],
   [data-mode-set="dark|light"], and [data-theme-toggle] for the single button. */
(function () {
  var root = document.documentElement;
  var KEY = "s9-design-theme";
  var MODE_KEY = "s9-design-mode";

  function read(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }
  function apply(theme, mode) {
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    document.querySelectorAll("[data-theme-set]").forEach(function (el) {
      el.setAttribute("aria-pressed", String(el.dataset.themeSet === theme));
    });
    document.querySelectorAll("[data-mode-set]").forEach(function (el) {
      el.setAttribute("aria-pressed", String(el.dataset.modeSet === mode));
    });
    document.querySelectorAll("[data-mode-wrap]").forEach(function (el) {
      el.hidden = theme === "section9";
    });
    document.querySelectorAll("[data-theme-name]").forEach(function (el) {
      el.textContent = theme === "section9" ? "Section 9" : "Professional";
    });
    var t = document.querySelector("[data-theme-toggle]");
    if (t) {
      var next = theme === "section9" ? "professional" : "section9";
      t.setAttribute("aria-label", "Switch to the " + (next === "section9" ? "Section 9" : "Professional") + " theme");
      t.textContent = next === "section9" ? "Section 9" : "Professional";
    }
  }

  var params = new URLSearchParams(location.search);
  var theme = params.get("theme") || read(KEY, root.dataset.theme || "professional");
  var mode = params.get("mode") || read(MODE_KEY, root.dataset.mode || "dark");
  if (!/^(professional|section9)$/.test(theme)) theme = "professional";
  if (!/^(dark|light)$/.test(mode)) mode = "dark";
  apply(theme, mode);

  document.addEventListener("click", function (ev) {
    var themeBtn = ev.target.closest("[data-theme-set]");
    var modeBtn = ev.target.closest("[data-mode-set]");
    var toggle = ev.target.closest("[data-theme-toggle]");
    if (themeBtn) { theme = themeBtn.dataset.themeSet; write(KEY, theme); apply(theme, mode); }
    if (modeBtn && theme !== "section9") { mode = modeBtn.dataset.modeSet; write(MODE_KEY, mode); apply(theme, mode); }
    if (toggle) {
      theme = theme === "section9" ? "professional" : "section9";
      write(KEY, theme);
      apply(theme, mode);
    }
    if (themeBtn || modeBtn || toggle) {
      var live = document.getElementById("theme-status");
      if (live) live.textContent = "Theme: " + theme + (theme === "section9" ? ", dark only" : ", " + mode + " mode") + ".";
    }
  });
})();
