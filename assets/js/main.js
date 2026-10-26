/* Morrow & Paw — shared, dependency-free interactions. */
(() => {
  "use strict";
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const root = document.documentElement;
  const updateHeaderHeight = () =>
    root.style.setProperty(
      "--header-stack-height",
      `${document.querySelector(".announcement").offsetHeight + document.querySelector(".site-header").offsetHeight}px`,
    );
  const headerResize = new ResizeObserver(updateHeaderHeight);
  headerResize.observe(document.querySelector(".site-header"));
  headerResize.observe(document.querySelector(".announcement"));
  updateHeaderHeight();
  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Private browsing is supported. */
      }
    },
  };
  let toastTimer;
  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      element.hidden = true;
    }, 5000);
  }

  /* Theme and direction */
  const themeButton = $("#theme-toggle");
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  function updateTheme() {
    const dark = root.dataset.theme === "dark";
    themeButton.innerHTML = `<i class="bi bi-${dark ? "sun" : "moon"}" aria-hidden="true"></i>`;
    themeButton.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
    themeButton.setAttribute("aria-pressed", String(dark));
  }
  themeButton.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("mp-theme", root.dataset.theme);
    updateTheme();
  });
  systemTheme.addEventListener("change", () => {
    if (!store.get("mp-theme")) {
      root.dataset.theme = systemTheme.matches ? "dark" : "light";
      updateTheme();
    }
  });
  updateTheme();
  const directionButton = $("#direction-toggle");
  function updateDirection() {
    directionButton.textContent = root.dir === "rtl" ? "LTR" : "RTL";
    directionButton.setAttribute(
      "aria-label",
      `Enable ${root.dir === "rtl" ? "left-to-right" : "right-to-left"} layout`,
    );
  }
  directionButton.addEventListener("click", () => {
    root.dir = root.dir === "rtl" ? "ltr" : "rtl";
    store.set("mp-direction", root.dir);
    updateDirection();
  });
  updateDirection();

  /* Accessible navigation */
  const menuButton = $("#menu-toggle");
  const nav = $("#main-navigation");
  const dropdownButton = $('.nav-dropdown-toggle[aria-controls="home-submenu"]');
  const submenu = $("#home-submenu");
  const cartButton = $("#cart-toggle");
  const cartPanel = $("#cart-panel");
  let cart = {};
  try {
    const saved = JSON.parse(store.get("mp-cart") || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved))
      for (const [key, item] of Object.entries(saved))
        if (item && typeof item.name === "string" && Number.isFinite(item.price)) cart[key] = item;
  } catch {
    /* Start with an empty cart when saved data is invalid. */
  }
  function renderCart() {
    const entries = Object.entries(cart);
    $("#cart-count").textContent = String(entries.length);
    cartButton.setAttribute(
      "aria-label",
      `Open shopping cart, ${entries.length} ${entries.length === 1 ? "item" : "items"}`,
    );
    $("#cart-summary").textContent = entries.length
      ? `${entries.length} ${entries.length === 1 ? "essential" : "essentials"} selected · $${entries.reduce((sum, [, item]) => sum + item.price, 0).toFixed(2)}`
      : "Your cart is empty. Discover a few thoughtful favorites for your companion.";
    const items = $("#cart-items");
    items.replaceChildren();
    for (const [key, item] of entries) {
      const row = document.createElement("li"),
        label = document.createElement("span"),
        remove = document.createElement("button");
      label.textContent = `${item.name} · $${item.price.toFixed(2)}`;
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${item.name} from cart`);
      remove.addEventListener("click", () => {
        delete cart[key];
        saveCart();
        cartButton.focus();
      });
      row.append(label, remove);
      items.append(row);
    }
    $$("[data-cart-key]").forEach((button) => {
      const added = Object.hasOwn(cart, button.dataset.cartKey);
      button.classList.toggle("is-added", added);
      button.setAttribute("aria-pressed", String(added));
      button.setAttribute(
        "aria-label",
        `${added ? "Remove" : "Add"} ${button.dataset.cartName} ${added ? "from" : "to"} cart`,
      );
      $("span", button).textContent = added ? "Added" : "Add";
      $(".bi", button).className = `bi bi-${added ? "check2" : "plus"}`;
    });
  }
  function saveCart() {
    store.set("mp-cart", JSON.stringify(cart));
    renderCart();
  }
  $$("[data-cart-key]").forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.cartKey;
      if (Object.hasOwn(cart, key)) delete cart[key];
      else cart[key] = { name: button.dataset.cartName, price: Number(button.dataset.cartPrice) };
      saveCart();
      toast(
        `${button.dataset.cartName} ${Object.hasOwn(cart, key) ? "added to" : "removed from"} your cart.`,
      );
    }),
  );
  renderCart();
  function closeDropdown() {
    submenu.hidden = true;
    dropdownButton.setAttribute("aria-expanded", "false");
  }
  function closeMenu() {
    nav.classList.remove("open");
    document.body.classList.remove("navigation-open");
    $(".mobile-menu-backdrop").hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    menuButton.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
    closeDropdown();
  }
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    document.body.classList.toggle("navigation-open", open);
    $(".mobile-menu-backdrop").hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuButton.innerHTML = `<i class="bi bi-${open ? "x-lg" : "list"}" aria-hidden="true"></i>`;
    cartPanel.hidden = true;
    cartButton.setAttribute("aria-expanded", "false");
    if (open) $(".mobile-menu-heading [data-menu-close]").focus();
  });
  $$("[data-menu-close]").forEach((button) =>
    button.addEventListener("click", () => {
      closeMenu();
      menuButton.focus();
    }),
  );
  nav.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !nav.classList.contains("open")) return;
    const focusable = [...nav.querySelectorAll("a, button")].filter(
      (el) => el.getClientRects().length && !el.closest("[hidden]"),
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dropdownButton.addEventListener("click", () => {
    submenu.hidden = matchMedia("(hover: hover) and (min-width: 1280px)").matches
      ? false
      : !submenu.hidden;
    dropdownButton.setAttribute("aria-expanded", String(!submenu.hidden));
  });
  const homeDropdown = dropdownButton.closest(".nav-dropdown");
  let hoverClose;
  const openDropdown = () => {
    clearTimeout(hoverClose);
    submenu.hidden = false;
    dropdownButton.setAttribute("aria-expanded", "true");
  };
  homeDropdown.addEventListener("mouseenter", () => {
    if (matchMedia("(hover: hover) and (min-width: 1280px)").matches) openDropdown();
  });
  homeDropdown.addEventListener("mouseleave", () => {
    if (matchMedia("(hover: hover) and (min-width: 1280px)").matches)
      hoverClose = setTimeout(closeDropdown, 160);
  });
  homeDropdown.addEventListener("focusout", (event) => {
    if (!homeDropdown.contains(event.relatedTarget)) closeDropdown();
  });
  dropdownButton.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      submenu.hidden = false;
      dropdownButton.setAttribute("aria-expanded", "true");
      $("a", submenu).focus();
    }
  });
  cartButton.addEventListener("click", () => {
    cartPanel.hidden = !cartPanel.hidden;
    cartButton.setAttribute("aria-expanded", String(!cartPanel.hidden));
    if (!cartPanel.hidden) {
      closeMenu();
      $("a", cartPanel).focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-dropdown")) closeDropdown();
    if (!event.composedPath().some((node) => node.classList?.contains("site-header"))) {
      closeMenu();
      cartPanel.hidden = true;
      cartButton.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!submenu.hidden) {
      closeDropdown();
      dropdownButton.focus();
    } else if (nav.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    } else if (!cartPanel.hidden) {
      cartPanel.hidden = true;
      cartButton.setAttribute("aria-expanded", "false");
      cartButton.focus();
    }
  });
  matchMedia("(min-width: 1280px)").addEventListener("change", closeMenu);

  /* Catalog filters and sorting */
  const filters = $("#product-filters");
  if (filters) {
    const params = new URLSearchParams(location.search);
    for (const name of ["q", "pet", "type", "brand"]) {
      if (params.has(name)) filters.elements[name].value = params.get(name);
    }
    const cards = $$("[data-product]");
    const grid = cards[0].parentElement;
    const update = () => {
      const values = Object.fromEntries(new FormData(filters));
      let count = 0;
      cards.forEach((card) => {
        const data = card.dataset;
        const show =
          (!values.q || data.name.includes(values.q.toLowerCase().trim())) &&
          (!values.pet || data.pet === values.pet) &&
          (!values.type || data.type === values.type) &&
          (!values.brand || data.brand === values.brand) &&
          (!values.price || Number(data.price) < Number(values.price));
        card.hidden = !show;
        if (show) count++;
      });
      const sorted = [...cards].sort((a, b) =>
        values.sort === "low"
          ? a.dataset.price - b.dataset.price
          : values.sort === "high"
            ? b.dataset.price - a.dataset.price
            : values.sort === "name"
              ? a.dataset.name.localeCompare(b.dataset.name)
              : cards.indexOf(a) - cards.indexOf(b),
      );
      sorted.forEach((card) => grid.append(card));
      $("#product-count").textContent =
        `${count} ${count === 1 ? "essential" : "essentials"} found`;
      $("#product-empty").hidden = count !== 0;
    };
    filters.addEventListener("submit", (event) => event.preventDefault());
    filters.addEventListener("input", update);
    filters.addEventListener("change", update);
    filters.addEventListener("reset", () => setTimeout(update, 0));
    update();
  }

  /* Journal search and topics */
  const articleSearch = $("#article-search");
  if (articleSearch) {
    let category = "All";
    const cards = $$("[data-article]");
    const update = () => {
      let count = 0;
      cards.forEach((card) => {
        const show =
          (category === "All" || card.dataset.category === category) &&
          card.dataset.title.includes(articleSearch.value.trim().toLowerCase());
        card.hidden = !show;
        if (show) count++;
      });
      $("#article-count").textContent = `${count} ${count === 1 ? "story" : "stories"}`;
      $("#article-empty").hidden = count !== 0;
    };
    const choose = (value) => {
      category = value;
      $$("[data-article-filter]").forEach((button) => {
        const active = button.dataset.articleFilter === value;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      update();
    };
    articleSearch.addEventListener("input", update);
    $$("[data-article-filter]").forEach((button) =>
      button.addEventListener("click", () => choose(button.dataset.articleFilter)),
    );
    $$("[data-topic]").forEach((button) =>
      button.addEventListener("click", () => {
        choose(button.dataset.topic);
        articleSearch.scrollIntoView({
          block: "center",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
        articleSearch.focus({ preventScroll: true });
      }),
    );
    update();
  }

  /* Product gallery and keyboard-accessible tabs */
  if (!articleSearch)
    $$("[data-topic]").forEach((button) =>
      button.addEventListener("click", () => {
        const card = $$("[data-article]").find((e) => e.dataset.category === button.dataset.topic);
        const target = card || $("#journal");
        target?.scrollIntoView({
          block: "center",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
        if (card) {
          const summary = $("summary", card);
          summary?.focus({ preventScroll: true });
        }
      }),
    );
  $$("[data-gallery-src]").forEach((button) =>
    button.addEventListener("click", () => {
      $("#gallery-main").src = button.dataset.gallerySrc;
      $("#gallery-main").alt = button.dataset.galleryAlt;
      $$("[data-gallery-src]").forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
    }),
  );
  const tabs = $$('[role="tab"]');
  function activateTab(tab) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      const next =
        event.key === "ArrowRight"
          ? (index + 1) % tabs.length
          : event.key === "ArrowLeft"
            ? (index + tabs.length - 1) % tabs.length
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? tabs.length - 1
                : null;
      if (next !== null) {
        event.preventDefault();
        activateTab(tabs[next]);
        tabs[next].focus();
      }
    });
  });
  $$("[data-quantity]").forEach((button) =>
    button.addEventListener("click", () => {
      const input = $("#quantity");
      input.value = Math.min(
        10,
        Math.max(1, (Number(input.value) || 1) + Number(button.dataset.quantity)),
      );
    }),
  );
  $("#quantity")?.addEventListener("change", (event) => {
    event.target.value = Math.min(10, Math.max(1, Number(event.target.value) || 1));
  });
  $("#product-enquiry")?.addEventListener("click", () => {
    const params = new URLSearchParams({
      product: "Restwell Linen Bed",
      quantity: $("#quantity").value,
    });
    location.href = `contact.html?${params}#special-orders`;
  });
  const orderForm = $('[data-form="special-order"]');
  if (orderForm) {
    const params = new URLSearchParams(location.search);
    if (params.has("product")) orderForm.elements.product.value = params.get("product");
    orderForm.elements.quantity.min = "1";
    orderForm.elements.quantity.max = "100";
    orderForm.elements.quantity.value = params.get("quantity") || "1";
    orderForm.elements.photo.accept = "image/jpeg,image/png,image/webp";
  }
  const dateInput = $('input[type="date"]');
  if (dateInput) {
    const today = new Date();
    dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  /* Accessible form validation. Demo forms never transmit or persist personal data. */
  function clearErrors(form) {
    $$("[aria-invalid]", form).forEach((input) => input.removeAttribute("aria-invalid"));
    $$(".field-error", form).forEach((error) => (error.textContent = ""));
    $$(".generated-error", form).forEach((error) => error.remove());
  }
  function setError(input, message) {
    input.setAttribute("aria-invalid", "true");
    let error = document.getElementById(`${input.id}-error`);
    if (!error) {
      error = document.createElement("span");
      error.className = "field-error generated-error";
      if (!input.id) input.id = `error-${input.form.dataset.form}-${input.name}`;
      error.id = `${input.id}-error`;
      (input.closest(".field") || input.closest("label") || input.parentElement).append(error);
    }
    error.textContent = message;
    input.setAttribute("aria-describedby", error.id);
  }
  $$("[data-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);
      let firstInvalid;
      $$("input,select,textarea", form).forEach((input) => {
        let message = "";
        if (input.type !== "checkbox" && input.type !== "file") input.value = input.value.trim();
        if (input.validity.valueMissing)
          message =
            input.type === "checkbox"
              ? "Please check this box to continue."
              : "Please complete this field.";
        else if (input.validity.typeMismatch) message = "Please enter a valid email address.";
        else if (input.validity.tooShort || (input.type === "password" && input.value.length < 8))
          message = "Please use at least 8 characters.";
        else if (input.validity.rangeUnderflow || input.validity.rangeOverflow)
          message = "Please choose a value within the allowed range.";
        else if (input.validity.badInput) message = "Please enter a valid value.";
        if (input.name === "confirm" && input.value !== form.elements.password?.value)
          message = "Your passwords need to match.";
        if (input.type === "file" && input.files[0]) {
          if (!["image/jpeg", "image/png", "image/webp"].includes(input.files[0].type))
            message = "Choose a JPEG, PNG, or WebP image.";
          else if (input.files[0].size > 5 * 1024 * 1024)
            message = "Choose an image smaller than 5 MB.";
        }
        if (message) {
          setError(input, message);
          if (!firstInvalid) firstInvalid = input;
        }
      });
      const feedback = $(".form-message", form);
      feedback.classList.remove("success");
      if (firstInvalid) {
        feedback.textContent = "Please check the highlighted fields.";
        (firstInvalid._selectTrigger || firstInvalid).focus();
        return;
      }
      const messages = {
        newsletter:
          "Thanks! Your email passed validation. This demo does not subscribe you or send data.",
        notification:
          "You’re ready for launch news! This demo does not store your email or send notifications.",
        grooming:
          "Your enquiry is ready. This demo does not send it or book an appointment. Connect a form service for delivery.",
        "special-order":
          "Your enquiry passed validation. This demo does not send data or upload files. Connect a form service for delivery.",
        login:
          "Demo sign-in validated. No authentication was performed and no credentials were stored.",
        register:
          "Demo registration validated. No account was created and no personal information was stored.",
        reset: "Demo reset request validated. No reset email was sent.",
      };
      feedback.textContent = messages[form.dataset.form];
      feedback.classList.add("success");
      if (["login", "register"].includes(form.dataset.form))
        $$('input[type="password"]', form).forEach((input) => (input.value = ""));
    });
    form.addEventListener("input", (event) => {
      if (event.target.hasAttribute("aria-invalid")) {
        event.target.removeAttribute("aria-invalid");
        const error = document.getElementById(`${event.target.id}-error`);
        if (error) error.textContent = "";
      }
    });
  });
  $("#forgot-password")?.addEventListener("click", () => {
    $("#reset-form").hidden = !$("#reset-form").hidden;
    if (!$("#reset-form").hidden) $("input", $("#reset-form")).focus();
  });

  /* Countdown */
  const countdown = $("[data-countdown]");
  if (countdown) {
    const target = new Date(countdown.dataset.countdown).getTime();
    const tick = () => {
      const seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const values = {
        days: Math.floor(seconds / 86400),
        hours: Math.floor(seconds / 3600) % 24,
        minutes: Math.floor(seconds / 60) % 60,
        seconds: seconds % 60,
      };
      Object.entries(values).forEach(
        ([name, value]) =>
          ($(`[data-time="${name}"]`, countdown).textContent = String(value).padStart(2, "0")),
      );
      if (seconds === 0)
        countdown.setAttribute("aria-label", "The illustrative launch date has arrived");
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Policy placeholder dialog with focus management */
  const dialog = $("#policy-dialog");
  let lastFocused;
  const closeDialog = () => {
    dialog.hidden = true;
    document.body.style.overflow = "";
    lastFocused?.focus();
  };
  $$("[data-policy]").forEach((button) =>
    button.addEventListener("click", () => {
      lastFocused = button;
      $("#policy-title").textContent =
        button.dataset.policy === "privacy" ? "Privacy information" : "Terms of use";
      $("#policy-body").innerHTML =
        button.dataset.policy === "privacy"
          ? "<p>This template is a front-end demonstration. Forms do not send or store personal data. Theme and layout preferences are saved in your browser’s local storage.</p><p>Replace this placeholder with your business privacy policy, including details of any connected form, analytics, or newsletter services, before publishing.</p>"
          : "<p>Products, prices, brands, store details, and customer stories are illustrative. No purchase, appointment, authentication, or registration is processed by this template.</p><p>Replace this placeholder with your business terms, shipping and returns policies, and applicable service conditions before publishing.</p>";
      dialog.hidden = false;
      document.body.style.overflow = "hidden";
      $(".dialog-close", dialog).focus();
    }),
  );
  $(".dialog-close", dialog).addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDialog();
    if (event.key === "Tab") {
      const focusable = $$("button,a[href],input", dialog);
      if (focusable.length === 1) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  });
  // Match content baselines within each visible card row, including filtered grids.
  const alignCardRows = () => {
    document.querySelectorAll(".grid, .horizontal-products").forEach((grid) => {
      const cards = [...grid.children].filter(
        (card) =>
          card.matches(".article-card,.product-card,.info-card,.pricing-card") && !card.hidden,
      );
      cards.forEach((card) => {
        card
          .querySelectorAll(".eyebrow,h3,.btn-text,.btn")
          .forEach((element) => (element.style.minHeight = ""));
      });
      const rows = new Map();
      cards.forEach((card) => {
        const key = Math.round(card.getBoundingClientRect().top);
        if (!rows.has(key)) rows.set(key, []);
        rows.get(key).push(card);
      });
      rows.forEach((row) => {
        if (row.length < 2) return;
        for (const selector of [".eyebrow", "h3", ".btn-text,.btn"]) {
          const elements = row.map((card) => card.querySelector(selector)).filter(Boolean);
          const height = Math.max(
            ...elements.map((element) => element.getBoundingClientRect().height),
          );
          elements.forEach((element) => (element.style.minHeight = `${height}px`));
        }
      });
    });
  };
  let alignmentFrame;
  const scheduleAlignment = () => {
    cancelAnimationFrame(alignmentFrame);
    alignmentFrame = requestAnimationFrame(alignCardRows);
  };
  window.addEventListener("resize", scheduleAlignment);
  document.fonts.ready.then(scheduleAlignment);
  document.querySelectorAll("[data-article],[data-product]").forEach((card) =>
    new MutationObserver(scheduleAlignment).observe(card, {
      attributes: true,
      attributeFilter: ["hidden"],
    }),
  );
  scheduleAlignment();
  // Consistent dropdown styling while native selects retain form values and validation.
  $$("select").forEach((select, index) => {
    const wrapper = document.createElement("div"),
      trigger = document.createElement("button"),
      menu = document.createElement("div");
    wrapper.className = "site-select";
    select.before(wrapper);
    wrapper.append(select);
    select.classList.add("select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    trigger.type = "button";
    trigger.className = "select-trigger";
    menu.className = "select-options";
    menu.id = `select-options-${index}`;
    menu.hidden = true;
    menu.setAttribute("role", "listbox");
    trigger.setAttribute("aria-controls", menu.id);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const label = document.querySelector(`label[for="${select.id}"]`);
    if (label) {
      label.id ||= `select-label-${index}`;
      trigger.setAttribute("aria-labelledby", `${label.id} select-value-${index}`);
      label.addEventListener("click", () => trigger.focus());
    }
    const value = document.createElement("span"),
      arrow = document.createElement("i");
    value.id = `select-value-${index}`;
    arrow.className = "bi bi-chevron-down";
    arrow.setAttribute("aria-hidden", "true");
    trigger.append(value, arrow);
    wrapper.append(trigger, menu);
    select._selectTrigger = trigger;
    const close = () => {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };
    const options = [...select.options].map((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = option.textContent;
      item.setAttribute("role", "option");
      item.disabled = option.disabled;
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        close();
        trigger.focus();
      });
      menu.append(item);
      return item;
    });
    const sync = () => {
      value.textContent = select.selectedOptions[0]?.textContent || "Choose an option";
      options.forEach((item, i) =>
        item.setAttribute("aria-selected", String(i === select.selectedIndex)),
      );
    };
    const open = () => {
      document.querySelectorAll('.select-trigger[aria-expanded="true"]').forEach((e) => {
        if (e !== trigger) e.click();
      });
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    };
    trigger.addEventListener("click", () => (menu.hidden ? open() : close()));
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
        event.preventDefault();
      }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        open();
        const enabled = options.filter((e) => !e.disabled);
        let next = enabled.indexOf(document.activeElement);
        next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? enabled.length - 1
              : (next + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length;
        enabled[next]?.focus();
      }
    });
    wrapper.addEventListener("focusout", (event) => {
      if (!wrapper.contains(event.relatedTarget)) close();
    });
    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) close();
    });
    select.addEventListener("change", sync);
    select.form?.addEventListener("reset", () => setTimeout(sync, 0));
    sync();
  });
})();
