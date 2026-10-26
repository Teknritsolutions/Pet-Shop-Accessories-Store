(() => {
  const root = document.documentElement,
    theme = document.querySelector("#theme-toggle"),
    direction = document.querySelector("#direction-toggle");
  const save = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  };
  const sync = () => {
    const dark = root.dataset.theme === "dark",
      rtl = root.dir === "rtl";
    theme.innerHTML = `<i class="bi bi-${dark ? "sun" : "moon"}" aria-hidden="true"></i>`;
    theme.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
    theme.setAttribute("aria-pressed", String(dark));
    direction.setAttribute(
      "aria-label",
      `Enable ${rtl ? "left-to-right" : "right-to-left"} layout`,
    );
    direction.setAttribute("aria-pressed", String(rtl));
    direction.textContent = rtl ? "LTR" : "RTL";
  };
  theme.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    save("mp-theme", root.dataset.theme);
    sync();
  });
  direction.addEventListener("click", () => {
    root.dir = root.dir === "rtl" ? "ltr" : "rtl";
    save("mp-direction", root.dir);
    sync();
  });
  sync();
  document
    .querySelector("#go-back")
    ?.addEventListener("click", () =>
      history.length > 1 ? history.back() : location.assign("../index.html"),
    );
  const countdown = document.querySelector("[data-countdown]");
  if (countdown) {
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((Date.parse(countdown.dataset.countdown) - Date.now()) / 1000),
      );
      const values = {
        days: Math.floor(seconds / 86400),
        hours: Math.floor(seconds / 3600) % 24,
        minutes: Math.floor(seconds / 60) % 60,
        seconds: seconds % 60,
      };
      Object.entries(values).forEach(
        ([key, value]) =>
          (countdown.querySelector(`[data-time=${key}]`).textContent = String(value).padStart(
            2,
            "0",
          )),
      );
    };
    tick();
    setInterval(tick, 1000);
  }
  document.querySelector("#launch-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector("#launch-message").textContent =
      "Thank you! This is a preview form; your email has not been sent.";
  });
})();
