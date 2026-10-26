const fs = require("node:fs");
const path = require("node:path");
const resolvePage = (file) => file;
const pagePrefix = (file) => (file === "index" ? "" : "../");
const pages = [];
const brandEmblem = require("./brand-emblems.cjs");
const brands = [
  "Hearth & Hound",
  "Mews Studio",
  "Fieldkind",
  "Little Habitat",
  "Tide & Timber",
  "Softkind",
];
const pets = ["Dogs", "Cats", "Birds", "Fish", "Small Animals"];
const products = {
  "treat-pouch": [
    "Little Rewards Treat Pouch",
    "Dogs",
    "Walking",
    24,
    "Fieldkind",
    "Terracotta canvas dog treat pouch with a brass belt clip",
  ],
  "linen-bed": [
    "Restwell Linen Bed",
    "Dogs",
    "Comfort",
    89,
    "Hearth & Hound",
    "An oatmeal linen dog bed with softly padded sides",
  ],
  "ceramic-bowl": [
    "Everyday Ceramic Bowls",
    "Cats",
    "Feeding",
    32,
    "Mews Studio",
    "Terracotta and ivory ceramic pet bowls",
  ],
  "rope-toy": [
    "The Good Play Rope",
    "Dogs",
    "Play",
    16,
    "Fieldkind",
    "Terracotta and cream knotted cotton dog toy",
  ],
  "leather-collar": [
    "Heritage Leather Collar",
    "Dogs",
    "Walking",
    38,
    "Hearth & Hound",
    "Cognac leather pet collar with a brass buckle",
  ],
  "cat-scratcher": [
    "Oak & Sisal Scratching Post",
    "Cats",
    "Play",
    58,
    "Mews Studio",
    "Sisal cat scratching post on an oak base",
  ],
  "bird-feeder": [
    "Perchside Feeding Station",
    "Birds",
    "Feeding",
    24,
    "Little Habitat",
    "Wooden pet bird feeder with a stainless steel cup",
  ],
  "fish-hide": [
    "Terracotta Aquarium Hide",
    "Fish",
    "Comfort",
    18,
    "Tide & Timber",
    "Terracotta aquarium shelter with rounded openings",
  ],
  "rabbit-tunnel": [
    "Willow Explorer Tunnel",
    "Small Animals",
    "Play",
    26,
    "Little Habitat",
    "Woven willow play tunnel for rabbits",
  ],
  "food-pouch": [
    "Everyday Salmon Recipe",
    "Dogs",
    "Feeding",
    36,
    "Fieldkind",
    "Navy pet food pouch with a bowl of dry kibble",
  ],
  "cat-wand": [
    "Linen Ribbon Teaser",
    "Cats",
    "Play",
    14,
    "Mews Studio",
    "Wooden cat wand with a linen ribbon and felt ball",
  ],
  "travel-bowl": [
    "Foldaway Travel Bowl",
    "Dogs",
    "Feeding",
    19,
    "Fieldkind",
    "Clay silicone pet travel bowl with a brass clip",
  ],
  brush: ["Gentle Coat Brush", "Dogs", "Care", 22, "Softkind", "Beech wood pet grooming brush"],
  "felt-ball": [
    "Wool Play Ball Trio",
    "Cats",
    "Play",
    12,
    "Mews Studio",
    "Three muted wool felt cat play balls",
  ],
  harness: [
    "Everyday Walking Harness",
    "Dogs",
    "Walking",
    42,
    "Fieldkind",
    "Padded navy dog walking harness",
  ],
  "seed-blend": [
    "Balanced Bird Seed Blend",
    "Birds",
    "Feeding",
    18,
    "Little Habitat",
    "Paper pouch of bird seeds and wooden scoop",
  ],
  "aquarium-tool": [
    "Clearwater Care Set",
    "Fish",
    "Care",
    28,
    "Tide & Timber",
    "Aquarium cleaning brush and small net",
  ],
  "hamster-house": [
    "Little Oak Hideaway",
    "Small Animals",
    "Comfort",
    29,
    "Little Habitat",
    "Natural wooden hamster hideaway",
  ],
  "treat-jar": [
    "Good Things Treat Jar",
    "Dogs",
    "Feeding",
    34,
    "Hearth & Hound",
    "Ivory ceramic pet treat jar with wooden lid",
  ],
  "cotton-lead": [
    "Weekender Cotton Lead",
    "Dogs",
    "Walking",
    28,
    "Fieldkind",
    "Terracotta cotton dog leash with a brass clip",
  ],
  "cat-cave": [
    "Quiet Corner Cat Cave",
    "Cats",
    "Comfort",
    64,
    "Mews Studio",
    "Gray felt cat cave with a circular entrance",
  ],
};
let prefix = "";
let currentPage = "index";
const href = (file) =>
  prefix + (file === "index" ? "index.html" : `pages/${resolvePage(file)}.html`);
const icon = (name) => `<i class="bi bi-${name}" aria-hidden="true"></i>`;
const arrow = () => icon("arrow-right");
const button = (text, file, style = "primary", extra = "") =>
  `<a class="btn btn-${style}" href="${href(file)}${extra}">${text} ${arrow()}</a>`;
const textLink = (text, file, extra = "") =>
  `<a class="btn-text" href="${href(file)}${extra}">${text} ${arrow()}</a>`;
const img = (file, alt, cls = "", eager = false) =>
  `<img src="${prefix}assets/images/${file}.webp" alt="${alt}" class="${cls}" width="1100" height="800" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const design = require("./premium-components.cjs")({
  icon,
  img,
  button,
  textLink,
  href,
  getPage: () => currentPage,
});
const brandMark = () => design.crest();
const logo = () =>
  `<a class="brand" href="${href("index")}" aria-label="Morrow and Paw home">${brandMark()}<span class="brand-name">morrow & paw<small>For their everyday joy</small></span></a>`;
function header(active) {
  const nav = [
    ["About", "about"],
    ["Shop", "shop"],
    ["Featured Brands", "brands"],
    ["Grooming", "grooming"],
    ["Pet Care Tips", "blog"],
    ["Contact", "contact"],
  ];
  return `<!-- Header -->
  <div class="announcement">Thoughtfully chosen. Happily loved. &nbsp; | &nbsp; Discover a better everyday for your pet.</div>
  <header class="site-header">
    <div class="container header-inner">
      ${logo()}
      <nav id="main-navigation" class="main-nav" aria-label="Main navigation">
        <div class="mobile-menu-heading">${logo()}<button type="button" class="icon-button" data-menu-close aria-label="Close navigation">${icon("x-lg")}</button></div>
        <div class="nav-dropdown">
          <button class="nav-dropdown-toggle ${active.startsWith("home") ? "active" : ""}" aria-expanded="false" aria-controls="home-submenu"><span class="mobile-link-icon">${icon("house-door")}</span>Home ${icon("chevron-down")}</button>
          <div id="home-submenu" class="dropdown-menu-custom" hidden>
            <a href="${href("index")}" ${active === "home" ? 'aria-current="page"' : ""}>Home Page 1</a>
            <a href="${href("home-2")}" ${active === "home-2" ? 'aria-current="page"' : ""}>Home Page 2</a>
          </div>
        </div>
        ${nav.map(([text, file], i) => `<a href="${href(file)}" ${active === file ? 'class="active" aria-current="page"' : ""}><span class="mobile-link-icon">${icon(["info-circle", "basket", "box-seam", "scissors", "journal-text", "envelope"][i])}</span>${text}</a>`).join("\n")}
        <div class="mobile-nav-utilities">${button("Shop now", "shop")}</div>
      </nav>
      <button type="button" class="mobile-menu-backdrop" data-menu-close aria-label="Close navigation" tabindex="-1" hidden></button>
      <div class="header-tools">
        <button class="icon-button" id="cart-toggle" aria-label="Open shopping cart" aria-expanded="false" aria-controls="cart-panel">${icon("cart3")}<span class="cart-count" id="cart-count" aria-hidden="true">0</span></button>
        <button class="icon-button" id="theme-toggle" aria-label="Switch color theme">${icon("moon")}</button>
        <button class="icon-button direction-toggle" id="direction-toggle" aria-label="Enable right-to-left layout">RTL</button>
        <a class="btn btn-primary header-shop-button" href="${href("shop")}">Shop now ${arrow()}</a>
        <button class="icon-button menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation">${icon("list")}</button>
      </div>
    </div>
    <div class="cart-panel" id="cart-panel" role="region" aria-labelledby="cart-title" hidden><span class="cart-empty-icon">${icon("bag-heart")}</span><h2 id="cart-title">Your shopping cart</h2><p id="cart-summary" aria-live="polite">Your cart is empty. Discover a few thoughtful favorites for your companion.</p><ul class="cart-items" id="cart-items"></ul>${button("Explore the shop", "shop")}<p class="cart-note">Catalog preview · Purchases are not processed.</p></div>
  </header>`;
}
function footer() {
  return `<!-- Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">${logo()}<p>Considered essentials, good advice, and a little more joy. For the companions who make a house a home.</p><div class="social-links"><a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noopener">${icon("instagram")}</a><a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noopener">${icon("facebook")}</a><a href="https://www.pinterest.com/" aria-label="Pinterest" target="_blank" rel="noopener">${icon("pinterest")}</a></div></div>
        <div><h2>Shop by pet</h2><ul>${pets.map((p) => `<li><a href="${href("shop")}?pet=${encodeURIComponent(p)}">${p}</a></li>`).join("")}</ul></div>
        <div><h2>Discover</h2><ul>${[
          ["Featured brands", "brands"],
          ["Grooming", "grooming"],
          ["Pet care tips", "blog"],
          ["Our story", "about"],
        ]
          .map(([t, f]) => `<li><a href="${href(f)}">${t}</a></li>`)
          .join("")}</ul></div>
        <div><h2>Here to help</h2><ul><li><a href="${href("contact")}">Contact us</a></li><li><a href="${href("contact")}#special-orders">Special orders</a></li><li><a href="${href("contact")}#faq">FAQs</a></li></ul></div>
        <div><h2>Come say hello</h2><address>701 SW 6th Avenue, Portland, OR 97204<br>Mon–Sat: 9am–6pm · Sun: 10am–4pm<br><a href="mailto:hello@example.com">hello@example.com</a><br><a href="tel:+15035550148">(503) 555-0148</a></address><p class="demo-note">Illustrative store details.</p></div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} Morrow & Paw. Made for the love of pets.</span><div><button class="nav-dropdown-toggle" type="button" data-policy="privacy">Privacy</button><button class="nav-dropdown-toggle" type="button" data-policy="terms">Terms</button></div></div>
    </div>
  </footer>
  <div id="toast" class="toast" role="status" hidden></div>
  <div class="dialog" id="policy-dialog" role="dialog" aria-modal="true" aria-labelledby="policy-title" hidden><div class="dialog-box"><button class="icon-button dialog-close" aria-label="Close policy">${icon("x-lg")}</button><h2 id="policy-title"></h2><div id="policy-body"></div></div></div>`;
}
const section = (name, body, cls = "", id = "") =>
  `<!-- ${name} -->\n<section class="section ${cls}" ${id ? `id="${id}"` : ""}><div class="container">${body}</div></section>`;
const heading = (eyebrow, title, desc = "", link = "") =>
  `<div class="section-header"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ""}</div>${link}</div>`;
const pageHero = require("./page-heroes.cjs")({
  getPage: () => currentPage,
  href,
  img,
  icon,
  brandEmblem,
});
function productCard(key, badge = "", filter = false) {
  const [title, pet, type, price, brand, alt] = products[key];
  const target =
    key === "linen-bed"
      ? href("product-details")
      : `${href("contact")}?product=${encodeURIComponent(title)}#special-orders`;
  return `<article class="product-card" ${filter ? `data-product data-name="${title.toLowerCase()}" data-pet="${pet}" data-type="${type}" data-price="${price}" data-brand="${brand}"` : ""}><a class="product-image" href="${target}">${img(`shop/${key}`, alt)}${badge ? `<span class="badge-label">${badge}</span>` : ""}</a><div class="product-body"><span class="eyebrow">${pet} · ${type}</span><h3><a href="${target}">${title}</a></h3><div class="product-bottom"><span class="price">$${price.toFixed(2)}</span><button type="button" class="product-action" data-cart-key="${key}" data-cart-name="${title}" data-cart-price="${price}" aria-pressed="false" aria-label="Add ${title} to cart"><span>Add</span>${icon("plus")}</button></div></div></article>`;
}
const productGrid = (keys, cls = "grid grid-4", filter = false) =>
  `<div class="${cls}">${keys.map((k, i) => productCard(k, i === 0 ? "Thoughtfully chosen" : "", filter)).join("")}</div>`;
const petNav = () =>
  `<div class="pet-nav">${pets.map((p, i) => `<a href="${href("shop")}?pet=${encodeURIComponent(p)}">${icon(["heart", "moon-stars", "feather", "water", "flower1"][i])}${p} ${arrow()}</a>`).join("")}</div>`;
const brandStrip = () =>
  `<div class="brand-strip">${brands.map((b) => `<a class="brand-wordmark" href="${href("brands")}">${brandEmblem(b)}</a>`).join("")}</div>`;
const list = (items) =>
  `<ol class="number-list">${items.map(([t, d], i) => `<li><b>0${i + 1}</b><div><strong>${t}</strong><p>${d}</p></div></li>`).join("")}</ol>`;
function split(eyebrow, title, desc, file, alt, items = [], cta = "", reverse = false) {
  return `<div class="split ${/groom|coat|good care/i.test(eyebrow) ? "split--grooming" : /brand|maker/i.test(eyebrow) ? "split--brand" : /began|story|where/i.test(eyebrow) ? "split--story" : ""} ${reverse ? "reverse" : ""}"><div class="split-copy"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><p class="lead">${desc}</p>${items.length ? list(items) : ""}${cta}</div>${img(file, alt, "editorial-image")}</div>`;
}
function newsletter(
  title = "Good things, in your inbox.",
  desc = "Thoughtful pet care tips, new discoveries, and a little inspiration. No noise, just the good stuff.",
) {
  return design.newsletter(title, desc);
}
const articles = [
  [
    "home/puppy-guide",
    "Nutrition",
    "A good start for little paws",
    "Small changes that make your puppy’s first weeks feel easier.",
    "Golden retriever puppy outdoors",
  ],
  [
    "home/cat-guide",
    "Cats",
    "A happier home for your cat",
    "Simple ways to make room for their natural instincts.",
    "Relaxed cat at home",
  ],
  [
    "home/walking-guide",
    "Training",
    "Make every walk a good one",
    "Build a calmer walking routine, one small step at a time.",
    "Dog enjoying an outdoor walk",
  ],
  [
    "blog/indoor-cat",
    "Cats",
    "Enrichment for the indoor cat",
    "Play, climbing, and quiet places that help cats thrive.",
    "Cat sitting comfortably indoors",
  ],
  [
    "blog/positive-training",
    "Training",
    "Reward the moments that matter",
    "A gentle introduction to positive reinforcement.",
    "Attentive dog ready for training",
  ],
  [
    "blog/small-pet-guide",
    "Small Pets",
    "Big care for small companions",
    "A practical habitat checklist for your smallest friend.",
    "Small companion animal in a natural setting",
  ],
  [
    "blog/senior-companion",
    "Wellness",
    "A softer routine for senior dogs",
    "Comfort, movement, and the everyday signs to watch.",
    "Older dog resting peacefully",
  ],
  [
    "blog/coat-guide",
    "Grooming",
    "A brush routine they can enjoy",
    "Keep sessions short, calm, and suited to their coat.",
    "Dog with a healthy well-kept coat",
  ],
];
const careCopy = [
  [
    "Begin with a familiar rhythm.",
    "Keep the first days quiet and predictable. Make room for rest, offer a comfortable sleeping spot, and ask your veterinarian about a feeding plan suited to your puppy’s age and needs.",
    "Introduce things a little at a time.",
    "A new home can be a lot to take in. Keep introductions short and positive. Supervise exploration and choose toys that are suitable for their size.",
    "Keep a consistent routine|Choose safe, age-appropriate toys|Ask your vet about individual nutrition",
  ],
  [
    "Make room for natural behavior.",
    "Cats need more than floor space. Give them a safe place to climb, a suitable scratching surface, and a quiet retreat where they can watch the world without interruption.",
    "Let them make the first move.",
    "Respect their choice to come closer or step away. Short play sessions and familiar resting places can make a new environment feel more comfortable.",
    "Provide a stable scratching post|Keep litter areas quiet and accessible|Offer an undisturbed resting spot",
  ],
  [
    "Start with a comfortable fit.",
    "Check that walking equipment fits safely and does not restrict movement. A well-fitted harness and a secure lead can help make a walk more comfortable for both of you.",
    "Give curiosity a little time.",
    "When it is safe, make space for sniffing and pauses. Reward the behavior you want to see, keep sessions manageable, and ask a qualified trainer for help with persistent worries.",
    "Check equipment before each walk|Bring water when needed|Reward calm behavior",
  ],
  [
    "A little variety goes a long way.",
    "Rotate a small selection of safe toys and use short supervised play sessions. Provide stable climbing areas and a window perch when it can be made safe.",
    "Give quiet equal importance.",
    "Enrichment includes the freedom to rest. Keep a retreat available and pay attention to the activities your cat chooses for themselves.",
    "Rotate toys rather than adding clutter|Secure climbing furniture|Put string toys away after play",
  ],
  [
    "Notice the good moments.",
    "Reward-based training begins with timing. Offer a suitable reward when your dog does the behavior you are asking for, and keep instructions clear and consistent.",
    "Keep learning manageable.",
    "Short sessions are often easier to enjoy than long ones. End on a comfortable note and work with a qualified professional for fear, aggression, or more complex behavior needs.",
    "Choose a safe reward your dog enjoys|Practice in a calm setting|Keep sessions short and kind",
  ],
  [
    "Think about the whole habitat.",
    "Different small animals have different needs. Research species-specific space, bedding, diet, enrichment, and social requirements before choosing equipment.",
    "Make safety a daily habit.",
    "Check enclosures, water access, and play items regularly. Avoid assuming that products suitable for one species are safe for another; ask an experienced veterinarian for individual guidance.",
    "Check water access every day|Use species-appropriate bedding|Inspect hides and chew items for damage",
  ],
  [
    "Let comfort set the pace.",
    "Older dogs may appreciate a softer resting place and shorter, more frequent opportunities to move. Changes in comfort or mobility should be discussed with a veterinarian.",
    "Keep noticing the little changes.",
    "Watch appetite, sleep, energy, and how easily your dog gets up. A familiar routine can help you spot a change early and share useful details at a veterinary visit.",
    "Make resting spots easy to reach|Avoid slippery routes where possible|Arrange regular veterinary check-ins",
  ],
  [
    "Choose the right tool.",
    "Different coats need different brushes. Ask a professional groomer which tool suits your dog and learn how to use it without pulling or irritating their skin.",
    "Build a calm association.",
    "Begin with a short session when your pet is relaxed. Work gently, stop if they show discomfort, and ask a professional for help with matting rather than forcing a brush through it.",
    "Start with short gentle sessions|Check the manufacturer’s care instructions|Ask for help with persistent tangles",
  ],
];
articles.push([
  "blog/restful-companion",
  "Wellness",
  "Make room for a restful day",
  "Quiet corners and familiar rhythms for everyday comfort.",
  "A relaxed companion enjoying a quiet resting spot",
]);
careCopy.push([
  "Give them a quiet corner.",
  "Choose a comfortable resting spot away from busy walkways. Let your companion settle without interruption and keep their favorite bedding nearby.",
  "Keep the rhythm familiar.",
  "Balance playful moments with opportunities to unwind. Notice which spaces they choose and make room for those small everyday preferences.",
  "Keep a familiar resting place|Allow undisturbed quiet time|Balance play with rest",
]);
const articleCard = ([file, cat, title, desc, alt]) => {
  const [firstTitle, firstCopy, secondTitle, secondCopy, tips] =
    careCopy[articles.findIndex((a) => a[0] === file)];
  return `<article class="article-card" data-article data-category="${cat}" data-title="${title.toLowerCase()}"><div class="article-visual">${img(file, alt)}</div><div class="article-body"><span class="eyebrow">${cat} · Care notes</span><h3>${title}</h3><p>${desc}</p><details class="care-notes"><summary class="btn-text">Read care tips ${arrow()}</summary><div class="care-notes-body"><h4>${firstTitle}</h4><p>${firstCopy}</p><h4>${secondTitle}</h4><p>${secondCopy}</p><ul>${tips
    .split("|")
    .map((t) => `<li>${t}</li>`)
    .join("")}</ul></div></details></div></article>`;
};

const quotes = () =>
  design.quoteCards([
    [
      "“The kind of shop where someone remembers your dog’s name. Our new bed is officially the best seat in the house.”",
      "Clara & Milo · Dog parent",
    ],
    [
      "“Beautiful products, but the honest advice is what keeps us coming back. They really understand our little rescue cat.”",
      "Sam & Olive · Cat parent",
    ],
    [
      "“Our nervous pup came home from grooming relaxed and looking lovely. Such a thoughtful, patient team.”",
      "Jamie & Teddy · Dog parent",
    ],
  ]);
const reassurance = () =>
  `<div class="grid grid-3">${[
    [
      "box-seam",
      "Considered quality",
      "Products selected for usefulness, comfort, and everyday durability.",
    ],
    [
      "chat-heart",
      "Real, helpful advice",
      "Ask a question. We’ll help you choose what suits your companion.",
    ],
    [
      "arrow-repeat",
      "Support beyond the purchase",
      "Ask us about sizing, materials, and care to keep their essentials working well.",
    ],
  ]
    .map(([i, t, d]) => `<div class="info-card">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`)
    .join("")}</div>`;
const faq = (items) =>
  `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>`;
function field(label, name, type = "text", required = true, options = "") {
  const id = `field-${name}`;
  const placeholders = {
    name: "Your full name",
    email: "you@example.com",
    phone: "e.g. (503) 555-0123",
    pet: "e.g. Milo, Golden Retriever",
    message:
      "Share their coat condition, sensitivities, or anything that helps us make their visit comfortable.",
    subject: "What would you like help with?",
    product: "Product name, brand, or size",
    quantity: "e.g. 1",
  };
  const placeholder =
    name === "message" && currentPage !== "grooming"
      ? "Tell us how we can help and share any useful details."
      : placeholders[name] || `Enter ${label.toLowerCase()}`;
  return `<div class="field"><label for="${id}">${label}${required ? ' <span aria-hidden="true">*</span>' : ""}</label>${
    type === "textarea"
      ? `<textarea id="${id}" name="${name}" placeholder="${placeholder}" ${required ? "required" : ""}></textarea>`
      : type === "select"
        ? `<select id="${id}" name="${name}" ${required ? "required" : ""}><option value="">${name === "service" ? "Select a grooming service" : `Select ${label.toLowerCase()}`}</option>${options
            .split("|")
            .map((x) => `<option>${x}</option>`)
            .join("")}</select>`
        : `<input id="${id}" type="${type}" name="${name}" ${type !== "date" ? `placeholder="${placeholder}"` : ""} ${required ? "required" : ""} ${type === "password" ? 'minlength="8" autocomplete="new-password"' : type === "email" ? 'autocomplete="email"' : name === "name" ? 'autocomplete="name"' : type === "tel" ? 'autocomplete="tel"' : ""}>`
  }<span class="field-error" id="${id}-error"></span></div>`;
}
function groomingForm() {
  return `<form data-form="grooming" novalidate><div class="form-grid">${field("Your name", "name")}${field("Email address", "email", "email")}${field("Phone number", "phone", "tel")}${field("Preferred service", "service", "select", true, "Bath & Brush|Full Groom|Puppy Introduction|Nail Care")}${field("Pet name and breed", "pet")}${field("Preferred date", "date", "date")}<div class="full">${field("Anything we should know?", "message", "textarea", false)}</div></div><label class="check-label"><input type="checkbox" name="consent" required> I agree to be contacted about this enquiry.</label><button type="submit" class="btn btn-primary">Send an enquiry ${arrow()}</button><p class="demo-note mt-3">Front-end demonstration. No appointment is booked or enquiry delivered.</p><div class="form-message" role="status" aria-live="polite"></div></form>`;
}
const packages = () =>
  `<div class="grid grid-3 pricing-grid">${[
    [
      "Fresh & Fluffy",
      45,
      "Bath & Brush",
      "Gentle bath|Coat brush-out|Warm towel dry|Finishing check",
    ],
    [
      "The Full Refresh",
      75,
      "Full Groom",
      "Everything in Bath & Brush|Breed-suited trim|Nail care|Ear check",
    ],
    [
      "Little First Steps",
      35,
      "Puppy Introduction",
      "Short gentle introduction|Brush and handling practice|Soft towel dry|Advice for pet parents",
    ],
  ]
    .map(
      ([title, price, label, inc], i) =>
        `<article class="pricing-card ${i === 1 ? "featured" : ""}"><span class="eyebrow">${label}${i === 1 ? " · Most loved" : ""}</span><h3>${title}</h3><div class="price">$${price} <small>from / visit</small></div><ul>${inc
          .split("|")
          .map((x) => `<li>${x}</li>`)
          .join(
            "",
          )}</ul>${button("Enquire about a visit", "grooming", "primary", "#enquiry")}</article>`,
    )
    .join("")}</div>`;
const process = () =>
  `<div class="process">${[
    ["A little hello", "We learn about your pet’s coat, comfort, and needs."],
    ["Settle in", "A calm introduction, with time to sniff and relax."],
    ["Thoughtful care", "Gentle techniques and breaks when they need them."],
    ["Home, happy", "A finishing check and practical care advice for home."],
  ]
    .map(
      ([t, d], i) =>
        `<div class="process-step"><span>0${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`,
    )
    .join("")}</div>`;
function write(file, title, description, active, body, schema = {}) {
  const standalone = ["404", "coming-soon"].includes(file);
  currentPage = file;
  prefix = pagePrefix(file);
  file = resolvePage(file);
  // Body is built after setting the prefix by add(), so every local path is portable.
  const canonical = `https://example.com/${file === "index" ? "" : `pages/${file}.html`}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    ...schema,
  };
  const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Morrow & Paw</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title} | Morrow & Paw">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://example.com/assets/images/ui/social-cover.png">
  <meta name="theme-color" content="#172d3c">
  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
  <link rel="alternate icon" href="${prefix}favicon.ico">
  <script>try{var t=localStorage.getItem('mp-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dir=localStorage.getItem('mp-direction')||'ltr'}catch(e){}</script>
  <link rel="stylesheet" href="${prefix}assets/vendor/bootstrap.min.css">
  <link rel="stylesheet" href="${prefix}assets/vendor/bootstrap-icons.css">
  <link rel="stylesheet" href="${prefix}assets/css/style.css">
  <link rel="stylesheet" href="${prefix}assets/css/dark-mode.css">
  <link rel="stylesheet" href="${prefix}assets/css/premium.css">
  <link rel="stylesheet" href="${prefix}assets/css/rtl.css">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  ${
    file !== "index"
      ? `<script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://example.com/",
            },
            { "@type": "ListItem", position: 2, name: title, item: canonical },
          ],
        })}</script>`
      : ""
  }
</head>
<body class="${standalone ? "utility-body" : ""}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${standalone ? "" : header(active)}
  <main id="main-content">${body}</main>
  ${standalone ? "" : footer()}
  <script src="${prefix}assets/vendor/bootstrap.bundle.min.js" defer></script>
  <script src="${prefix}assets/js/${standalone ? "utility" : "main"}.js" defer></script>
</body>
</html>`;
  const destination = file === "index" ? "index.html" : `pages/${file}.html`;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
  pages.push({ file, title, description });
}
function add(file, title, desc, active, build, schema = {}) {
  currentPage = file;
  prefix = pagePrefix(file);
  write(file, title, desc, active, build(), schema);
}

add(
  "index",
  "Thoughtful essentials for a happier pet",
  "Discover beautifully considered pet essentials, independent brands, gentle grooming, and useful care advice.",
  "home",
  () =>
    `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><span class="eyebrow">A little better, every day</span><h1>For the ones who<br>make life <em>lovelier.</em></h1><p class="lead">Thoughtfully chosen essentials for happy pets and the people who love them. Good quality. Gentle care. Everyday joy.</p><div class="button-row">${button("Shop their essentials", "shop")}${button("Meet our groomers", "grooming", "outline")}</div><div class="hero-trust"><span class="stars" aria-label="5 stars">★★★★★</span><span>A little shop. A lot of love.</span></div></div><div class="hero-image">${img("home/ivory-sofa-retriever", "Golden retriever relaxing on an ivory sofa beside a terracotta cushion", "", true)}<div class="image-note">${icon("heart")}<div><strong>Comfort comes naturally.</strong><br><span class="muted">Made for their favorite moments.</span></div></div></div></div></section>` +
    section(
      "Shop by pet",
      heading(
        "Every companion belongs",
        "Their world. Thoughtfully stocked.",
        "Find something just right for your kind of companion.",
      ) +
        design.categoryTiles(
          pets,
          [
            "home/dog-companion",
            "home/cat-at-home",
            "home/companion-bird",
            "home/aquarium-fish",
            "home/rabbit-care",
          ],
          [
            "Dog looking attentively at the camera",
            "Cat resting comfortably",
            "Pet cockatiel on a natural indoor perch",
            "Fish in a planted aquarium",
            "Rabbit with soft fur",
          ],
        ),
      "section-soft",
    ) +
    section(
      "Popular products",
      heading(
        "The everyday favorites",
        "Loved for a reason.",
        "Good things that earn their place in your pet’s daily routine.",
        textLink("Shop all essentials", "shop"),
      ) + productGrid(["linen-bed", "ceramic-bowl", "rope-toy", "leather-collar"]),
    ) +
    section(
      "Why choose us",
      split(
        "More than a pet shop",
        "Small details.<br>A happier everyday.",
        "We believe the best pet care starts with paying attention. To what feels good, what lasts, and what makes your companion’s tail do that thing.",
        "home/our-companions",
        "Two dogs enjoying time together outdoors",
        [
          ["Chosen with care", "Useful, well-made essentials from brands we believe in."],
          ["Advice from pet people", "Friendly guidance for real life with your companion."],
          ["A warm welcome, always", "Bring your questions. And, of course, your pet."],
        ],
        textLink("A little about us", "about"),
      ),
      "section-soft",
    ) +
    section(
      "New arrivals",
      heading(
        "Fresh discoveries",
        "A few new favorites.",
        "Small upgrades for playtime, mealtime, and everything in between.",
        textLink("Discover the collection", "shop"),
      ) + productGrid(["cat-scratcher", "bird-feeder"], "horizontal-products"),
    ) +
    section(
      "Featured brands",
      heading(
        "Good company",
        "Brands with a little more heart.",
        "Independent makers who care about the things we care about.",
        textLink("Meet the makers", "brands"),
      ) + brandStrip(),
    ) +
    section(
      "Grooming feature",
      split(
        "Care, from nose to tail",
        "A fresh coat.<br>A gentle touch.",
        "A calmer grooming experience, built around your pet. Patient people, thoughtful techniques, and plenty of reassurance.",
        "home/salon-care",
        "Professional groomer drying a calm dog with a towel",
        [
          ["Care at their pace", "Time to settle in, with breaks whenever needed."],
          ["Feel-good finishing touches", "From a simple brush-out to a complete refresh."],
        ],
        button("Explore grooming", "grooming"),
        true,
      ),
      "section-soft",
    ) +
    section(
      "Pet care tips",
      heading(
        "A little good advice",
        "For a life well loved.",
        "Practical guidance for the moments, questions, and milestones along the way.",
        textLink("All pet care tips", "blog"),
      ) + `<div class="grid grid-3">${articles.slice(0, 3).map(articleCard).join("")}</div>`,
    ) +
    section(
      "Pet parent stories",
      heading(
        "From our little community",
        "Happy pets. Happy people.",
        "A few illustrative stories from everyday life with pets.",
      ) + quotes(),
      "section-soft",
    ) +
    section("Newsletter and store visit", newsletter()),
  {
    "@type": "PetStore",
    name: "Morrow & Paw",
    address: {
      "@type": "PostalAddress",
      streetAddress: "701 SW 6th Avenue",
      addressLocality: "Portland",
      addressRegion: "OR",
      postalCode: "97205",
      addressCountry: "US",
    },
    telephone: "+1-503-555-0148",
  },
);

add(
  "home-2",
  "The art of a good everyday",
  "An editorial collection of pet essentials, gentle routines, and little things that make life together better.",
  "home-2",
  () =>
    `<section class="hero hero-2"><div class="container hero-grid"><div class="hero-image">${img("home/home-two-cat", "A curious cat in a peaceful warm home", "", true)}<div class="image-note">${icon("sun")}<span>A home, a companion, a little joy.</span></div></div><div class="hero-copy"><span class="eyebrow">The art of a good everyday</span><h1>Little rituals.<br><em>Big love.</em></h1><p class="lead">The morning stretch. The favorite toy. The long way home. Discover essentials made for the moments you share.</p><div class="button-row">${button("Find their favorites", "shop")}${textLink("Our point of view", "about")}</div><div class="hero-trust">${icon("flower1")}<span>Considered things for companion-filled lives.</span></div></div></div></section>` +
    section("Quick pet navigation", petNav(), "section-soft") +
    section(
      "Editors picks",
      heading(
        "The considered edit",
        "Good design. Great company.",
        "Our current favorites for curious little lives.",
        textLink("Browse the shop", "shop"),
      ) + productGrid(["fish-hide", "rabbit-tunnel", "food-pouch"], "grid grid-3"),
    ) +
    section(
      "Lifestyle banner",
      `<div class="wide-banner">${img("home/adventure-dog", "Dog enjoying a bright outdoor adventure")}<div class="banner-copy"><span class="eyebrow">Take the scenic route</span><h2>More fresh air.<br>More wagging tails.</h2><p>Make room for a little adventure, every day.</p>${button("Explore walking essentials", "shop", "primary", "?type=Walking")}</div></div>`,
    ) +
    section(
      "Best sellers",
      heading(
        "Easy to love",
        "The everyday, elevated.",
        "Simple, useful things you’ll reach for again and again.",
      ) + productGrid(["cat-wand", "travel-bowl"], "horizontal-products"),
    ) +
    section(
      "Grooming story",
      split(
        "The comfort of good care",
        "A little patience<br>goes a long way.",
        "A grooming visit should feel as good as a freshly brushed coat. We make room for quiet introductions and individual needs.",
        "home/calm-grooming",
        "Dog relaxing with a well-groomed coat",
        [
          ["Listen first", "Tell us about your pet, their routine, and their worries."],
          ["Keep it gentle", "Calm handling and a pace that suits them."],
        ],
        textLink("Discover our approach", "grooming"),
      ),
      "section-soft",
    ) +
    section(
      "Brand spotlight",
      heading(
        "Maker of the month",
        "Fieldkind. Ready for real life.",
        "Thoughtful essentials inspired by walks, playtime, and the simple pleasure of being together.",
      ) +
        `<div class="split"><div class="fieldkind-feature brand-wordmark">${img("home/fieldkind-outdoors", "A border collie on a peaceful woodland trail wearing a navy harness", "fieldkind-background")}<div class="fieldkind-brand">${brandEmblem("Fieldkind")}<span class="fieldkind-tagline">Good things for the great everyday</span></div></div><div><h3>Made for the way you live.</h3><p class="lead">Honest materials. Useful details. A refreshingly simple approach to the things our pets use every day.</p>${list(
          [
            ["Natural textures", "Comfortable materials with an understated finish."],
            ["Purpose in every detail", "Easy to use, easy to bring along, easy to love."],
          ],
        )}${textLink("Meet our featured brands", "brands")}</div></div>`,
    ) +
    section(
      "Wellness guide",
      split(
        "Wellness starts small",
        "A good routine<br>is a kind of love.",
        "Good food, quiet rest, playful moments, and regular check-ins. A few small habits can make a big difference.",
        "home/wellness-dog",
        "Healthy dog looking attentively at its pet parent",
        [],
        `<div class="routine-notes"><div class="routine-note">${icon("moon-stars")}<div><h3>Make room for a little rest.</h3><p>A quiet corner and a familiar rhythm bring comfort to their everyday.</p></div></div><div class="routine-note">${icon("heart")}<div><h3>Keep a little time for connection.</h3><p>Gentle play, curious walks, and moments together make a routine worth looking forward to.</p></div></div></div>${button("Explore our care guides", "blog")}`,
        true,
      ),
      "section-soft",
    ) +
    section(
      "Community stories",
      heading(
        "Life, with companions",
        "The best kind of company.",
        "A collection of ordinary moments that mean everything.",
      ) +
        `<div class="grid grid-2">${[
          [
            "home/community-dog",
            "A dog relaxing outdoors",
            "The afternoon wander",
            "For the walks with no destination and all the good smells.",
          ],
          [
            "home/community-cat",
            "Cat enjoying a quiet moment",
            "The quiet companion",
            "For the little shadow who makes a slow morning better.",
          ],
        ]
          .map(
            ([f, a, t, d]) =>
              `<article class="companion-moment">${img(f, a, "article-cover")}<div class="moment-caption"><span class="moment-mark">${icon("heart")}</span><div><h3>${t}</h3><p class="muted">${d}</p></div></div></article>`,
          )
          .join("")}</div>`,
    ) +
    section("Newsletter", newsletter("A little inspiration, delivered.")),
);

add(
  "shop",
  "Shop considered pet essentials",
  "Browse quality essentials for dogs, cats, birds, fish, and small animals. Filter by pet, product type, price, and brand.",
  "shop",
  () =>
    pageHero(
      "The shop",
      "Good things for their everyday.",
      "Comfort, play, mealtimes, and little adventures. Find thoughtfully chosen essentials for every kind of companion.",
    ) +
    section("Pet categories", petNav()) +
    section(
      "Product filters and catalog",
      `<div class="catalog-finder"><div class="finder-heading"><span class="finder-icon">${icon("sliders2")}</span><div><span class="eyebrow">Their everyday, made easier</span><h2>Find the right essentials.</h2><p>Choose your companion, narrow the collection, and find something that fits their routine.</p></div></div><form class="filter-toolbar" id="product-filters" autocomplete="off"><div class="field"><label for="shop-search">Search</label><input id="shop-search" name="q" type="search" placeholder="Search beds, toys, bowls…" autocomplete="off"></div><div class="field"><label for="pet-filter">Pet</label><select id="pet-filter" name="pet"><option value="">All pets</option>${pets.map((p) => `<option>${p}</option>`).join("")}</select></div><div class="field"><label for="type-filter">Type</label><select id="type-filter" name="type"><option value="">All types</option>${["Comfort", "Play", "Feeding", "Walking", "Care"].map((p) => `<option>${p}</option>`).join("")}</select></div><div class="field"><label for="brand-filter">Brand</label><select id="brand-filter" name="brand"><option value="">All brands</option>${brands.map((p) => `<option>${p}</option>`).join("")}</select></div><div class="field"><label for="price-filter">Budget</label><select id="price-filter" name="price"><option value="">Any price</option><option value="25">Under $25</option><option value="50">Under $50</option></select></div><div class="field"><label for="sort-filter">Sort</label><select id="sort-filter" name="sort"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A–Z</option></select></div><button class="btn btn-outline" type="reset">${icon("arrow-counterclockwise")}Reset filters</button></form></div><div class="catalog-status"><span id="product-count" aria-live="polite">8 considered essentials</span><span>Demo catalog · USD</span></div>${productGrid(["brush", "felt-ball", "harness", "seed-blend", "aquarium-tool", "hamster-house", "treat-jar", "cat-cave"], "grid grid-4", true)}<p id="product-empty" class="empty-state" hidden>No matching essentials yet. Try another pet or clear your filters.</p>`,
      "",
      "catalog",
    ) +
    section("Featured collection", design.collectionPromo()) +
    section(
      "Shop reassurance",
      heading(
        "Chosen with care",
        "A little confidence in every choice.",
        "Thoughtful products and friendly guidance for life with your companion.",
      ) + reassurance(),
      "section-soft",
    ) +
    section("Special orders", design.cta("orders")),
);

add(
  "product-details",
  "Restwell Linen Bed — product details",
  "Explore the Restwell Linen Bed, its materials, sizing, care instructions, and thoughtful comfort details.",
  "shop",
  () =>
    `<section class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href("index")}">Home</a><span>/</span><a href="${href("shop")}">Shop</a><span>/</span><span id="product-breadcrumb">Restwell Linen Bed</span></nav><span class="eyebrow">Thoughtful by design</span><h1 id="product-heading">Restwell Linen Bed</h1></div></section>` +
    section(
      "Product gallery and details",
      `<div class="split" style="align-items:start"><div><img id="gallery-main" class="gallery-main" src="${prefix}assets/images/shop/bed-detail.webp" alt="Restwell oatmeal linen bed viewed from the front" width="900" height="900" fetchpriority="high"><div class="gallery-thumbs"><button class="active" data-gallery-src="${prefix}assets/images/shop/bed-detail.webp" data-gallery-alt="Restwell oatmeal linen bed viewed from the front" aria-label="Show front view" aria-pressed="true"><span class="small">Front view</span></button><button data-gallery-src="${prefix}assets/images/shop/bed-overhead.webp" data-gallery-alt="Restwell oatmeal linen bed viewed from above" aria-label="Show overhead view" aria-pressed="false">${img("shop/bed-overhead", "Overhead preview of the linen bed")}</button></div></div><div class="product-detail"><span class="eyebrow" id="detail-brand">Hearth & Hound · Comfort</span><h2 id="detail-title">Their new favorite spot.</h2><p class="stars">★★★★★ <span class="muted small">Illustrative product rating</span></p><p class="price" id="detail-price">$89.00</p><p class="lead" id="detail-description">A quietly beautiful place to curl up. A soft linen-blend cover, supportive cushioning, and raised edges for a little extra reassurance.</p><div class="detail-list"><span>${icon("check2")}Thoughtful materials</span><span>${icon("check2")}Made for everyday use</span><span>${icon("check2")}Easy-care finish</span><span>${icon("check2")}Selected with care</span></div><div class="field"><label for="product-size">Size</label><select id="product-size"><option>Medium · 75 × 55 cm</option><option>Small · 55 × 40 cm</option><option>Large · 95 × 70 cm</option></select></div><div class="button-row"><div class="quantity-control"><button type="button" data-quantity="-1" aria-label="Decrease quantity">−</button><input id="quantity" type="number" value="1" min="1" max="10" aria-label="Quantity"><button type="button" data-quantity="1" aria-label="Increase quantity">+</button></div><button class="btn btn-primary" id="product-enquiry">Enquire about this product ${arrow()}</button></div><p class="small muted mt-3">Catalog demonstration. No payment or purchase is processed.</p></div></div>`,
    ) +
    section(
      "Description specifications and care",
      `<div class="tab-buttons" role="tablist" aria-label="Product information"><button role="tab" id="tab-description" aria-selected="true" aria-controls="panel-description">Description</button><button role="tab" id="tab-specifications" aria-selected="false" aria-controls="panel-specifications" tabindex="-1">Specifications</button><button role="tab" id="tab-care" aria-selected="false" aria-controls="panel-care" tabindex="-1">Care guide</button></div><div role="tabpanel" id="panel-description" aria-labelledby="tab-description"><div class="narrow"><h2>Comfort in the little details.</h2><p class="lead" id="product-long-copy">Designed to look at home in your space and feel like home to your dog. The linen-blend cover has a soft, natural hand, while a cushioned base supports long afternoon naps.</p><p class="muted">Choose a size that allows your pet to stretch out comfortably. This is an illustrative product specification; replace it with verified manufacturer information before selling.</p></div></div><div role="tabpanel" id="panel-specifications" aria-labelledby="tab-specifications" hidden><div class="table-scroll"><table><tbody><tr><th>Material</th><td id="spec-material">Linen-blend outer, recycled fiber fill</td></tr><tr><th>Color</th><td>Natural oatmeal</td></tr><tr><th>Size options</th><td>Small, medium, large</td></tr><tr><th>Origin</th><td>Illustrative demo specification</td></tr></tbody></table></div></div><div role="tabpanel" id="panel-care" aria-labelledby="tab-care" hidden><div class="narrow"><h2>A little care goes a long way.</h2><p class="muted">Check the manufacturer’s label before cleaning. For this demo bed: unzip the cover, wash gently at 30°C, and air dry. Inspect regularly and replace damaged items.</p></div></div>`,
      "section-soft",
    ) +
    section("Benefits", design.benefits()) +
    section(
      "Related products",
      heading(
        "A good match",
        "A few thoughtful additions.",
        "Small things that make everyday life a little better.",
      ) + productGrid(["cotton-lead", "treat-pouch"], "horizontal-products"),
    ) +
    section("Product help", design.cta("help"), "section-soft"),
  {
    "@type": "Product",
    name: "Restwell Linen Bed",
    image: "https://example.com/assets/images/shop/bed-detail.webp",
    description: "Illustrative oatmeal linen dog bed with supportive raised sides.",
    brand: { "@type": "Brand", name: "Hearth & Hound" },
    offers: {
      "@type": "Offer",
      price: "89.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
);

add(
  "brands",
  "Featured independent pet brands",
  "Meet the thoughtful makers behind our pet essentials, from natural comfort to everyday play and care.",
  "brands",
  () =>
    pageHero(
      "Featured brands",
      "Good makers. Better everyday things.",
      "A small collection of independent brands who put care, purpose, and quality into what they make.",
    ) +
    section(
      "Brand introduction",
      `<div class="split"><div><span class="eyebrow">Our point of view</span><h2>Chosen for what<br>they stand for.</h2></div><div><p class="lead">We look beyond the label. We ask how something is made, what it’s useful for, and whether it makes life with a pet better.</p><p class="muted">All brands on this template are original fictional demo identities, created to show how your own collection could be presented.</p></div></div>`,
    ) +
    section(
      "Brand directory",
      heading("The collection", "Meet the good company.") +
        `<div class="grid grid-3 brand-directory">${brands.map((b, i) => `<article class="info-card brand-photo-card" style="background-image:url('${prefix}assets/images/${["shop/linen-bed", "home/cat-at-home", "home/adventure-dog", "home/rabbit-care", "home/aquarium-fish", "shop/brush"][i]}.webp')"><span class="brand-wordmark mb-4">${brandEmblem(b)}</span><h3>${["Comfort with character", "Designed for curious cats", "Essentials for real life", "Small companions, big care", "A calmer underwater world", "Gentle care, every day"][i]}</h3><p>${["Tactile materials and quietly timeless details for a cozy home.", "Considered play and comfort pieces that belong in your space.", "Useful things for fresh-air adventures and everyday routines.", "Habitat and play essentials for birds, rabbits, and small pets.", "Simple aquarium care and natural habitat details.", "Thoughtful coat-care tools for a calmer, more comfortable routine."][i]}</p>${textLink("Explore the shop", "shop", `?brand=${encodeURIComponent(b)}`)}</article>`).join("")}</div>`,
      "section-soft",
    ) +
    section(
      "Featured brand story",
      split(
        "Brand spotlight · Hearth & Hound",
        "A softer place<br>to call home.",
        "A collection built around the simple idea that pet essentials can feel good, work beautifully, and belong in a thoughtful home.",
        "brands/brand-story",
        "A beloved dog enjoying a comfortable moment at home",
        [
          ["Texture, with purpose", "Soft finishes chosen for everyday comfort."],
          ["Simple things, done well", "No fuss. Just useful details and a considered finish."],
        ],
        `<p class="spotlight-note">Choose a restful spot with room to curl up, stretch out, and settle in. Thoughtful textures and a comfortable fit help make their favorite corner feel like home.</p>` +
          button("Discover the collection", "shop", "primary", "?brand=Hearth%20%26%20Hound"),
      ),
    ) +
    section(
      "Brand product edit",
      `<div class="split makers-edit"><div><span class="eyebrow">The makers’ edit</span><h2>Find your kind<br>of everyday.</h2><p class="lead">Start with what your companion needs, then discover the makers who share your point of view.</p><div class="maker-guidance"><span>${icon("heart")}Chosen for their routine</span><p>Begin with one everyday moment: a cozy nap, a playful afternoon, or a little coat care. Explore essentials with comfort and purpose in mind.</p></div></div><div>${list(
        [
          ["Comfort & rest", "Beds, hideaways, and quiet little corners."],
          ["Play & curiosity", "Things to chase, explore, and make their own."],
          ["Care & routine", "Helpful essentials for everyday wellbeing."],
        ],
      )}${textLink("Browse all essentials", "shop")}</div></div>`,
      "section-soft",
    ) +
    section("Quality promise", design.cta("promise")),
);

add(
  "grooming",
  "Gentle grooming services",
  "Discover gentle grooming for dogs: baths, coat care, nail care, puppy introductions, and thoughtful service packages.",
  "grooming",
  () =>
    pageHero(
      "Grooming",
      "Good care, from nose to tail.",
      "A patient, personal approach to grooming. Because feeling safe is just as important as looking lovely.",
    ) +
    section(
      "Grooming services",
      heading(
        "A little refresh",
        "Care that suits your companion.",
        "From a quick tidy to a complete groom, we start with what your pet needs.",
      ) +
        `<div class="grid grid-3 grooming-services">${[
          ["droplet", "Bath & Brush", "A gentle bath, coat brush-out, and careful drying."],
          ["scissors", "Full Groom", "A complete refresh with a trim suited to their coat."],
          ["heart", "Puppy Introduction", "A short, reassuring first visit for little companions."],
          ["hand-index", "Nail Care", "A careful nail trim with calm, patient handling."],
          [
            "ear",
            "Ear Check & Cleaning",
            "Gentle external care when appropriate; concerns are referred to a vet.",
          ],
          ["stars", "Coat Care", "Help with seasonal shedding and everyday coat maintenance."],
        ]
          .map(
            ([i, t, d], index) =>
              `<article class="info-card grooming-service" style="background-image:url('${prefix}assets/images/${["grooming/services/bath", "grooming/services/full", "grooming/services/puppy", "grooming/services/nails", "grooming/services/ears", "grooming/services/coat"][index]}.webp')">${icon(i)}<h3>${t}</h3><p>${d}</p></article>`,
          )
          .join("")}</div>`,
    ) +
    section(
      "Professional grooming care",
      split(
        "Their comfort comes first",
        "Gentle hands.<br>Thoughtful care.",
        "Good grooming is about more than a tidy coat. It’s a chance to notice changes, support comfort, and build confidence through a familiar routine.",
        "grooming/bath-and-brush",
        "Professional groomer gently brushing a calm cream dog",
        [
          [
            "An individual approach",
            "We talk about coat type, health considerations, and handling preferences.",
          ],
          [
            "Calm, considered techniques",
            "No rushing. Breaks when needed. A little extra patience.",
          ],
        ],
        textLink("Ask about grooming", "grooming", "#enquiry"),
      ),
      "section-soft",
    ) +
    section(
      "Grooming process",
      heading("What to expect", "A calmer kind of visit.") +
        `<div class="grooming-process">${process()}</div>`,
    ) +
    section(
      "Grooming packages",
      heading(
        "Simple starting points",
        "A little care, clearly priced.",
        "Illustrative prices. Final quotes depend on size, coat condition, and time required.",
        textLink("Request a personal quote", "grooming", "#enquiry"),
      ) + packages(),
      "section-soft",
    ) +
    section(
      "Grooming enquiry",
      `<div class="grooming-enquiry"><div class="grooming-enquiry-intro"><span class="eyebrow">Let’s plan a little refresh</span><h2>Tell us about<br>your companion.</h2><p class="lead">Share their needs and your preferred date so the team can discuss a suitable visit.</p><div class="callout"><h3>Before their visit</h3><p class="muted">Tell us about allergies, health conditions, or handling worries. Grooming is not a substitute for veterinary care.</p></div><div class="enquiry-companion" style="background-image:url('${prefix}assets/images/home/dog-companion.webp')"><span>Comfort comes first.<br>A little patience makes all the difference.</span></div></div>${groomingForm()}</div>`,
      "",
      "enquiry",
    ),
);

add(
  "blog",
  "Pet care tips and stories",
  "Practical pet care stories about nutrition, training, grooming, enrichment, and everyday wellbeing.",
  "blog",
  () =>
    pageHero(
      "Pet care journal",
      "A little knowledge. A happier everyday.",
      "Practical ideas, thoughtful advice, and small ways to make life with your companion better.",
    ) +
    section(
      "Featured article",
      `<div class="journal-feature"><div class="journal-feature-copy"><span class="eyebrow">The featured read · Everyday care</span><h2>Small rituals.<br>Happy companions.</h2><p class="lead">A comfortable routine doesn’t need to be complicated. Start with a few good habits, and build from there.</p><p class="muted">Make time for a little play, a familiar resting spot, and quiet moments together. The small things you repeat can make everyday life feel more settled.</p>${button("Browse care tips", "blog", "primary", "#journal")}</div>${img("blog/nutrition-guide", "A happy dog relaxing outdoors", "journal-feature-image")}</div>`,
    ) +
    section(
      "Care stories",
      heading("The journal", "Find a little good advice.") +
        `<div class="grid grid-3">${articles.slice(3).map(articleCard).join("")}</div>`,
      "section-soft",
      "journal",
    ) +
    section(
      "Popular topics",
      heading("Start here", "A few useful places to begin.") +
        `<div class="pet-nav">${[
          ["Nutrition", "Mealtime matters"],
          ["Training", "Learning together"],
          ["Grooming", "Feel-good care"],
          ["Wellness", "Everyday wellbeing"],
        ]
          .map(([c, t]) => `<button class="chip" data-topic="${c}">${t} ${arrow()}</button>`)
          .join("")}</div>`,
    ) +
    section("Newsletter", newsletter("Good advice, a little more often.")),
);

add(
  "about",
  "Our story and point of view",
  "Meet Morrow & Paw, a thoughtful neighborhood pet shop built around considered quality, gentle care, and everyday joy.",
  "about",
  () =>
    pageHero(
      "Our story",
      "A little shop.<br>A lot of love.",
      "For the companions who greet us at the door, make us take a break, and turn ordinary days into something better.",
    ) +
    section(
      "Our story",
      split(
        "Where it began",
        "Good things.<br>For good company.",
        "Morrow & Paw began with a simple question: what if a pet shop felt a little more considered? Less noise, more useful things. Less guessing, more good advice.",
        "about/shop-origin",
        "Independent pet shop owner arranging thoughtful pet essentials",
        [],
        `<p class="muted">Our fictional neighborhood store brings together a thoughtful collection, a gentle grooming approach, and a team who care about the small details.</p><p class="muted">This is an original demo brand, ready to become your own.</p>`,
      ),
    ) +
    section(
      "Mission and values",
      heading("What matters to us", "Care is in the details.") +
        `<div class="grid grid-3">${[
          [
            "heart",
            "Companions first",
            "We start with comfort, safety, and the individual pet in front of us.",
          ],
          [
            "flower1",
            "Thoughtfully chosen",
            "Useful products with honest materials and a purpose in everyday life.",
          ],
          [
            "chat-heart",
            "Kind, practical advice",
            "Friendly guidance, without the pressure or the complicated language.",
          ],
        ]
          .map(([i, t, d]) => `<div class="info-card">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`)
          .join("")}</div>`,
      "section-soft",
    ) +
    section(
      "Why pet parents trust us",
      `<div class="split about-collection"><div><span class="eyebrow">A considered collection</span><h2>Every item has<br>a reason to be here.</h2><p class="lead">We keep things simple. Useful essentials, clear information, and room to ask questions.</p></div><div>${list(
        [
          ["Quality over quantity", "A smaller collection makes better choices easier."],
          ["A personal approach", "There’s no one-size-fits-all when it comes to pets."],
          ["A welcome for everyone", "Dogs, cats, birds, fish, and the little companions too."],
        ],
      )}</div></div>`,
    ) +
    section(
      "Team and store story",
      split(
        "The people behind the counter",
        "Pet people.<br>Your kind of people.",
        "Come in with a question, a story, or a muddy-pawed friend. Our team is here to make choosing feel a little easier.",
        "about/team-store",
        "Friendly independent pet store staff with a calm dog",
        [
          [
            "A conversation comes first",
            "Tell us about their habits, favorites, and little quirks. We’ll help you find essentials that suit your companion.",
          ],
          [
            "Help for the everyday",
            "From choosing a comfortable bed to finding a well-fitting collar, our team is happy to talk through the details.",
          ],
        ],
        button("Come say hello", "contact"),
        true,
      ),
      "section-soft",
    ) +
    section("Final store CTA", design.cta("visit")),
);

add(
  "contact",
  "Contact and special order enquiries",
  "Contact Morrow & Paw, see illustrative opening hours, plan a store visit, or enquire about a special pet product order.",
  "contact",
  () =>
    pageHero(
      "Come say hello",
      "A good conversation starts here.",
      "A question, a special request, or a little advice—we’re happy to help.",
    ) +
    section(
      "Contact information",
      `<div class="grid grid-3">${[
        ["geo-alt", "Find the shop", "701 SW 6th Avenue<br>Portland, OR 97204"],
        [
          "telephone",
          "Give us a call",
          '<a href="tel:+15035550148">(503) 555-0148</a><br>During store hours',
        ],
        [
          "envelope",
          "Drop us a note",
          '<a href="mailto:hello@example.com">hello@example.com</a><br>Illustrative contact information',
        ],
      ]
        .map(([i, t, d]) => `<div class="info-card">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`)
        .join("")}</div>`,
    ) +
    section(
      "Store location",
      `<div class="split store-location">${img("contact/boutique-store", "Warm independent pet boutique with oak shelving and thoughtfully arranged pet products", "editorial-image")}<div><span class="eyebrow">Your little neighborhood shop</span><h2>Find a favorite.<br>Stay for a chat.</h2><p class="lead">Pets welcome. Questions encouraged. There’s always room for a little browsing.</p><div class="store-map"><iframe title="Example location: Pioneer Courthouse Square, Portland" src="https://maps.google.com/maps?q=Pioneer%20Courthouse%20Square%2C%20701%20SW%206th%20Ave%2C%20Portland%20OR%2097204&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-address"><span>${icon("geo-alt")}701 SW 6th Avenue, Portland, OR 97204</span><a href="https://www.google.com/maps/search/?api=1&amp;query=Pioneer+Courthouse+Square+Portland" target="_blank" rel="noopener">Open map ${icon("arrow-up-right")}</a><p class="small muted">Illustrative location · Pioneer Courthouse Square.</p></div></div></div></div>`,
      "section-soft",
    ) +
    section(
      "Opening hours",
      `<div class="split"><div><span class="eyebrow">When we’re here</span><h2>Make time for<br>a little visit.</h2><p class="lead">For holiday hours or a specific appointment, get in touch before you head over.</p></div><ul class="hours-list"><li><span>Monday – Friday</span><strong>9am – 6pm</strong></li><li><span>Saturday</span><strong>9am – 6pm</strong></li><li><span>Sunday</span><strong>10am – 4pm</strong></li><li><span>Grooming</span><strong>By appointment</strong></li></ul></div>`,
    ) +
    section(
      "Special order enquiry",
      `<div class="order-enquiry"><div class="order-intro"><div><span class="eyebrow">Something a little specific?</span><h2>Let’s track it down.</h2><p class="lead">Tell us about the product, brand, or size you’re looking for. Include a photo if it helps.</p></div><div class="callout"><h3>Special order enquiries</h3><p class="muted">Availability, pricing, and delivery time would be confirmed before a real order is placed.</p></div></div><form data-form="special-order" novalidate><div class="form-grid">${field("Full name", "name")}${field("Email address", "email", "email")}${field("Phone number", "phone", "tel")}${field("Pet type", "pet", "select", true, pets.join("|"))}<div class="full">${field("Product or brand requested", "product")}</div>${field("Quantity", "quantity", "number")}${field("Reference photo (optional)", "photo", "file", false)}<div class="full">${field("A few more details", "message", "textarea")}</div></div><label class="check-label"><input type="checkbox" name="consent" required> I agree to be contacted about this enquiry and have read the privacy information.</label><button type="submit" class="btn btn-primary">Send enquiry ${arrow()}</button><p class="demo-note mt-3">Demo form. Nothing is uploaded or sent. Connect a form service for delivery.</p><div class="form-message" role="status" aria-live="polite"></div></form></div>`,
      "section-soft",
      "special-orders",
    ) +
    section(
      "Frequently asked questions",
      `<div class="contact-faq"><div class="faq-intro"><span class="eyebrow">Here to help</span><h2>A few quick answers.</h2><p>Planning a visit or looking for something special? Start here, or send the team a little note.</p>${button("Send an enquiry", "contact", "primary", "#special-orders")}</div>` +
        faq([
          [
            "Can I bring my pet into the shop?",
            "Yes—this demo store welcomes well-supervised pets. Replace this information with your own store policy.",
          ],
          [
            "Can you order a product you don’t stock?",
            "Use the special order form above. A real store would check availability and confirm the details with you.",
          ],
          [
            "How do I arrange grooming?",
            "Visit our grooming page and complete the enquiry form. The demo does not create a booking.",
          ],
          [
            "Do you offer returns?",
            "This is a template placeholder. Add a clear return policy based on your business and local requirements before launching.",
          ],
        ]) +
        `</div>`,
      "",
      "faq",
    ),
);

const utilityPage = require("./utility-pages.cjs")({ img, button, icon });
add("404", "Page not found", "Find your way back to everyday pet essentials.", "", () =>
  utilityPage("404"),
);
add(
  "coming-soon",
  "Something good is coming",
  "Thoughtful pet essentials are on their way.",
  "",
  () => utilityPage("coming-soon"),
);

// Matching text-first reading pages use their own content and avoid repeated photography.

fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .filter((p) => !["404", "coming-soon"].includes(p.file))
    .map(
      (p) =>
        `  <url><loc>https://example.com/${p.file === "index" ? "" : `pages/${p.file}.html`}</loc></url>`,
    )
    .join("\n")}\n</urlset>\n`,
);
fs.writeFileSync(
  "robots.txt",
  "User-agent: *\nAllow: /\nDisallow: /pages/coming-soon.html\nSitemap: https://example.com/sitemap.xml\n",
);
fs.writeFileSync("documentation/page-manifest.json", JSON.stringify(pages, null, 2));
console.log(`Built ${pages.length} complete pages.`);
