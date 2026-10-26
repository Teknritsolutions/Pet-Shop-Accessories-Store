const fs = require("node:fs");
const template = fs.readFileSync("pages/about.html", "utf8");
const main = `
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Template documentation · Version 1.0</span>
    <h1>Make it your own.</h1>
    <p class="lead">Setup, customization, integrations, and the small details that make this template easy to work with.</p>
  </div>
</section>
<section class="section"><div class="container prose">
  <h2>Start here</h2>
  <p>Open <a href="../index.html">index.html</a> directly, or run <code>npm start</code> from the project folder and visit <code>http://127.0.0.1:4173</code>. The public website has no build-time or remote runtime dependency. Bootstrap, icons, fonts, scripts, and photographs are stored locally.</p>
  <p>For development, run <code>npm install</code> once. <code>npm run build</code> regenerates the HTML from <code>scripts/build.cjs</code>. The shipped HTML is editable directly; if using the generator, make content changes there to avoid overwriting edits.</p>
  <h2>The pages</h2>
  <p>Two ten-section homepages, shop, product details, brands, grooming, journal, about, contact, 404, and coming soon. Care tips expand directly inside journal cards. No dashboard is included.</p>
  <h2>Colors, spacing, and type</h2>
  <p>Edit the CSS variables at the top of <code>assets/css/style.css</code>. The shared container is 1240px wide with equal responsive margins. An 8px spacing rhythm, reusable headings, buttons, and grid classes keep pages consistent.</p>
  <p>Dark-theme overrides live in <code>assets/css/dark-mode.css</code>. Theme preference follows the system until manually changed and persists in local storage. The RTL button persists layout direction; logical CSS handles most alignment, with overrides in <code>assets/css/rtl.css</code>.</p>
  <p>DM Sans is hosted locally under the SIL Open Font License in <code>assets/fonts/OFL.txt</code>. Editorial headings use the system Georgia serif font.</p>
  <h2>Catalog and images</h2>
  <p>The refined presentation layer is in <code>assets/css/premium.css</code>: 17px paragraphs, 16px action labels, framed category and product cards, inset journal panels, circular testimonial portraits, and consistent hover and focus states. <code>scripts/premium-components.cjs</code> supplies the original crest and different closing compositions for each page. Portrait origins are recorded in <a href="testimonial-assets.json">testimonial-assets.json</a>. Run <code>node tests/readability.cjs</code> with the preview server running to check text sizes.</p>
  <p>Illustrative products are defined in <code>scripts/build.cjs</code>. Shop controls filter visible items by pet, type, brand, price, and name, with sorting and reset. Restwell opens the detailed product page. The other product cards have View buttons that open the shop; their image and title links open a prefilled special-order enquiry. Original brand emblems are defined in <code>scripts/brand-emblems.cjs</code>.</p>
  <p>All content images are WebP. Each photograph has one independent use across the site. The product gallery changes the main display when a thumbnail is selected; this is one gallery, rather than a second independent use.</p>
  <p><a href="image-usage.json">Image usage map</a> lists page references. <a href="image-sources.txt">Stock source URLs</a> and <a href="generated-assets.json">generated asset manifest</a> identify origins. Original AI photography and product shots were made with the built-in image-generation tool; prompts are summarized in <a href="image-prompts.md">image-prompts.md</a>.</p>
  <h2>Connect the forms</h2>
  <p>The template validates inputs and shows clearly labeled demo success messages. It does not transmit or persist personal information, process orders, or book appointments.</p>
  <ol>
    <li>Choose your form service and configure its endpoint in the relevant form.</li>
    <li>Update the submit handler in <code>assets/js/main.js</code> to send data only after validation, or use a standard POST form supported by the provider.</li>
    <li>Add loading, failure, and genuine delivery success states. Enable appropriate server-side validation and abuse protection.</li>
    <li>Replace demo notices and policy placeholders with accurate business information.</li>
  </ol>
  <p>Formspree or Netlify Forms can handle enquiries; Mailchimp or ConvertKit can handle newsletters. Provider setup is required. The optional image field checks type and a 5 MB limit; no image is uploaded by the demo.</p>
  <h2>Before publishing</h2>
  <ul>
    <li>Replace fictional brands, store address, phone, email, prices, specifications, and customer stories.</li>
    <li>Replace <code>https://example.com</code> in canonical tags, Open Graph metadata, JSON-LD, sitemap, and robots.txt.</li>
    <li>Configure genuine social profile links, your map embed, privacy policy, terms, returns, and service conditions.</li>
    <li>Update the coming-soon launch timestamp in its <code>data-countdown</code> attribute.</li>
    <li>Configure your host’s custom 404 document to <code>pages/404.html</code>. The development server demonstrates a 404 response.</li>
    <li>Verify the current license requirements of stock photography and vendor dependencies for your distribution. For marketplace resale, replace stock photos with assets you have confirmed redistribution rights for.</li>
  </ul>
  <h2>Testing and review</h2>
  <p>Run the local server, then <code>npm test</code>. The audit checks all public pages at 320, 360, 375, 390, 414, 420, 480, 640, 768, 820, 1024, 1280, 1440, and 1920px in light and dark themes. RTL is checked at 320, 820, and 1440px. It also checks local links, H1 counts, metadata, broken images, repeated content-image references, browser errors, and meaningful interaction flows.</p>
  <p>The test uses Microsoft Edge on Windows by default. Set <code>BROWSER_PATH</code> to a Chromium-compatible browser executable for another environment. Reports and page screenshots are saved under <code>tests/</code>.</p>
  <p>Layout audits are not a guarantee of WCAG compliance or a PageSpeed score. Recheck your final content, integrations, and hosting with accessibility and performance tools.</p>
  <h2>Dependencies and credits</h2>
  <p>Bootstrap 5.3.8 and Bootstrap Icons 1.13.1 (MIT), DM Sans (SIL OFL), original Morrow & Paw branding, original AI-generated visuals, and local photographs downloaded from Unsplash. Vendor licenses are included in <code>assets/vendor/</code>.</p>
</div></section>`;
let html = template
  .replace(/<title>[^<]*<\/title>/, "<title>Template Documentation | Morrow &amp; Paw</title>")
  .replace(
    /<meta name="description"[\s\S]*?>/,
    '<meta name="description" content="Setup, customization, integrations, and documentation for the Morrow and Paw HTML template.">',
  )
  .replace(/<main id="main-content">[\s\S]*?<\/main>/, `<main id="main-content">${main}</main>`)
  .replaceAll('class="active" aria-current="page"', "");
html = html.replaceAll(
  "https://example.com/pages/about.html",
  "https://example.com/documentation/",
);
fs.writeFileSync("documentation/index.html", html);
