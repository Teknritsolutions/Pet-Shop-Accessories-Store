module.exports =
  ({ getPage, href, img, icon }) =>
  (label, title, description) => {
    const page = getPage();
    const photos = {
      about: "about-hero",
      grooming: "grooming-hero",
      contact: "contact-hero",
      shop: "shop-hero",
      blog: "journal-hero",
      brands: "brands-hero",
    };
    const descriptions = {
      about: "A welcoming pet boutique with a golden retriever and friendly staff",
      grooming: "A calm dog receiving gentle coat care in a bright grooming studio",
      contact: "A welcoming neighborhood pet shop exterior with plants and a visiting dog",
      shop: "Thoughtfully arranged pet beds, bowls, toys, and walking essentials in a warm home",
      blog: "A quiet everyday pet care moment with a relaxed dog and its companion",
      brands:
        "A curated collection of linen pet beds, ceramic bowls, walking accessories, and natural toys",
    };
    const photo = photos[page];
    let artwork = "";
    if (photo) artwork = img(`heroes/${photo}`, descriptions[page], "hero-banner-photo", true);
    return `<section class="page-hero hero-banner hero-banner--${page} ${photo ? "hero-banner--photo" : ""}">${artwork}<div class="container hero-banner-content"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href("index")}">Home</a><span aria-hidden="true">/</span><span>${label}</span></nav><span class="eyebrow">${label}</span><h1>${title}</h1><p class="lead">${description}</p><span class="hero-scroll-cue" aria-hidden="true">${icon("arrow-down")}<span>Discover more below</span></span></div></section>`;
  };
