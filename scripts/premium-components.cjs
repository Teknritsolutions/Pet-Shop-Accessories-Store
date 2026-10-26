/* Original presentation components for the Morrow & Paw design system. */
module.exports = ({ icon, img, button, textLink, href, getPage }) => {
  const crest = () =>
    `<svg class="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect class="crest-field" x="3" y="3" width="42" height="42" rx="14"/><rect class="crest-line" x="6.5" y="6.5" width="35" height="35" rx="11"/><path class="crest-monogram" d="M13 32V17L19 24L25 17V32M28 32V17H31.5C38 17 38 25 31.5 25H28"/><path class="crest-detail" d="M20 12H28M21 37H27"/></svg>`;
  const categoryTiles = (pets, files, alts) =>
    `<div class="grid grid-5 category-grid">${pets
      .map(
        (pet, index) => `
    <a class="category-card" href="${href("shop")}?pet=${encodeURIComponent(pet)}">
      <div class="category-visual">${img(files[index], alts[index])}<span class="category-index">0${index + 1}</span></div>
      <div class="category-caption"><h3>${pet}</h3><span class="category-link">Explore ${icon("arrow-up-right")}</span></div>
    </a>`,
      )
      .join("")}</div>`;
  const quoteCards = (stories) =>
    `<div class="grid grid-3 story-grid">${stories
      .map(
        ([quote, name], index) => `
    <figure class="quote-card">
      <div class="story-heading"><span class="stars" aria-label="5 out of 5 stars">★★★★★</span>${icon("quote")}</div>
      <blockquote>${quote}</blockquote>
      <figcaption><div class="story-person">${img(`ui/${["clara-milo", "sam-olive", "jamie-teddy"][index]}`, ["Clara with her golden retriever Milo", "Sam with his cat Olive", "Jamie with her dog Teddy"][index], "story-portrait")}<div><cite>${name}</cite><span class="story-caption">Illustrative customer story</span></div></div></figcaption>
    </figure>`,
      )
      .join("")}</div>`;
  const signup = (label = "Join the letter") => `<form data-form="newsletter" novalidate>
    <label for="newsletter-email">Your email address</label>
    <div class="signup-controls"><input type="email" id="newsletter-email" name="email" placeholder="you@example.com" required autocomplete="email"><button class="btn btn-primary" type="submit">${label} ${icon("arrow-right")}</button></div>
    <p class="signup-note">By joining, you agree to our <button type="button" class="inline-policy" data-policy="privacy">privacy policy</button>. Demo signup.</p>
    <div class="form-message" role="status" aria-live="polite"></div>
  </form>`;
  const newsletter = (title, desc) => {
    const page = getPage();
    if (page === "home-2")
      return `<div class="visit-postcard">
      <div class="postcard-copy"><span class="eyebrow">Your neighborhood, thoughtfully stocked</span><h2>Drop in.<br>Find a little joy.</h2><p>Bring a question, a companion, or simply your curiosity. Good company is always welcome.</p>${button("Plan your visit", "contact")}</div>
      <div class="postcard-address"><span class="postcard-stamp">${icon("geo-alt")}</span><span class="eyebrow">Morrow & Paw · The little shop</span><h3>701 SW 6th Avenue<br>Portland, Oregon</h3><dl><div><dt>Monday–Saturday</dt><dd>9am–6pm</dd></div><div><dt>Sunday</dt><dd>10am–4pm</dd></div></dl><span class="postcard-note">Pets welcome. Questions encouraged.</span></div>
    </div>`;
    if (page === "blog")
      return `<div class="journal-letter">
      <div class="journal-letter-label"><span class="eyebrow">Notes from the journal</span><span class="letter-number">01 / GOOD ADVICE</span></div>
      <div class="journal-letter-copy"><h2>${title}</h2><p>${desc}</p><div class="letter-topics"><span>${icon("flower1")} Everyday wellbeing</span><span>${icon("heart")} Thoughtful little routines</span></div></div>
      <div class="journal-letter-form"><span class="eyebrow">A letter worth opening</span>${signup("Subscribe")}</div>
    </div>`;
    return `<div class="newsletter newsletter--signature">
      <div class="signature-copy"><span class="signature-seal">${crest()}</span><span class="eyebrow">The Morrow & Paw letter</span><h2>${title}</h2><p>${desc}</p><div class="signature-tags"><span>Thoughtful finds</span><span>Useful advice</span><span>Everyday joy</span></div></div>
      <div class="signature-form"><span class="eyebrow">A little good company</span><h3>Make yourself at home.</h3>${signup("Join the list")}</div>
    </div>`;
  };
  const collectionPromo = () =>
    `<div class="collection-promo"><div class="collection-intro"><span class="eyebrow">The comfort edit</span><h2>A softer place<br>to call their own.</h2><p>Considered textures and quieter corners, for the moments when a little rest is everything.</p>${button("Explore comfort", "shop", "primary", "?type=Comfort")}</div><div class="comfort-composition">${img("shop/comfort-rest", "A relaxed dog sleeping in a soft linen bed in a quiet home", "comfort-photo")}<div class="comfort-caption"><span class="comfort-label">The art of a good rest</span><div class="comfort-notes"><span>${icon("check2")} Soft, tactile finishes</span><span>${icon("check2")} Room to stretch out</span><span>${icon("check2")} Everyday ease</span></div></div></div></div>`;
  const cta = (kind) => {
    const layouts = {
      orders: () =>
        `<div class="order-concierge"><div class="concierge-emblem">${icon("bag-heart")}</div><div><span class="eyebrow">The special order desk</span><h2>Some things are worth finding.</h2><p>Have a particular brand, size, or product in mind? Tell us what your companion needs and we’ll help explore the options.</p></div><div class="concierge-action">${button("Request an order", "contact", "primary", "#special-orders")}<span>A personal request. A thoughtful reply.</span></div></div>`,
      help: () =>
        `<div class="fit-advice"><div class="fit-advice-heading"><span class="eyebrow">A little guidance</span><h2>Let’s find<br>their perfect fit.</h2></div><div class="fit-advice-body"><p>From the right size to the right material, good advice makes choosing a little easier. Tell us about your companion.</p><div class="advice-pills"><span>Sizing</span><span>Materials</span><span>Care</span></div></div><div class="fit-advice-action">${icon("chat-heart")}${button("Ask our team", "contact")}</div></div>`,
      promise: () =>
        `<div class="quality-manifesto"><div class="manifesto-mark"><span>OUR<br>POINT OF<br>VIEW</span></div><div><span class="eyebrow">A considered collection</span><h2>Fewer things.<br>Better choices.</h2><p>Useful by design. Chosen with care. Made to earn a place in your companion’s everyday.</p></div><div class="manifesto-actions"><ul><li>Purpose in every detail</li><li>Honest, helpful information</li><li>Care beyond the label</li></ul>${textLink("Ask us about a brand", "contact")}</div></div>`,
      pricing: () =>
        `<div class="grooming-consultation"><div class="consultation-ticket"><span class="eyebrow">A personal quote</span><span class="ticket-word">Care,<br>considered.</span><span>GROOMING / MORROW & PAW</span></div><div class="consultation-copy"><h2>Every coat has<br>its own story.</h2><p>Tell us about their size, coat, and comfort. We’ll help you choose a suitable service and a clear starting point.</p>${button("Talk about their groom", "grooming", "primary", "#enquiry")}<span class="consultation-footnote">A little conversation comes first.</span></div></div>`,
      visit: () =>
        `<div class="visit-window"><div class="visit-window-frame"><span class="eyebrow">A warm welcome</span><span class="window-word">Come in.<br>Stay a while.</span><span class="window-hours">MON–SAT · 9AM–6PM<br>SUNDAY · 10AM–4PM</span></div><div class="visit-window-copy"><span class="eyebrow">A little shop. Your kind of people.</span><h2>Find a favorite.<br>Stay for a chat.</h2><p>Browse a little, ask a question, and enjoy a thoughtful collection made for life with companions.</p><div class="button-row">${button("Plan a visit", "contact")}${button("Explore the shop", "shop", "outline")}</div></div></div>`,
    };
    return layouts[kind]();
  };
  const benefits = () =>
    `<div class="benefit-ribbon"><div><span class="eyebrow">The little details matter</span><h2>Good choices,<br>made easier.</h2></div><div class="benefit-ribbon-items">${[
      ["box-seam", "Considered quality", "Chosen for comfort and everyday usefulness."],
      ["chat-heart", "Practical advice", "A little guidance when you need it."],
      ["arrow-repeat", "Care beyond the purchase", "Ask about sizing, materials, and maintenance."],
    ]
      .map(([i, t, d]) => `<div>${icon(i)}<h3>${t}</h3><p>${d}</p></div>`)
      .join("")}</div></div>`;
  return { crest, categoryTiles, quoteCards, newsletter, collectionPromo, cta, benefits };
};
