module.exports = (name) => {
  const artwork = {
    Softkind:
      '<path d="M22 18Q12 28 22 42Q32 53 43 39Q52 27 42 17M21 28L43 28M23 34L41 34M27 40L37 40"/><path class="maker-solid" d="M29 18Q32 13 35 18Q37 23 32 27Q27 23 29 18Z"/>',
    "Hearth & Hound":
      '<path d="M20 44V20L32 30L44 20V44M25 44V30M39 44V30"/><path d="M17 17L32 10L47 17M23 50H41"/><path class="maker-solid" d="M29 37Q32 33 35 37Q36 40 32 44Q28 40 29 37Z"/>',
    "Mews Studio":
      '<path d="M41 13C23 10 13 26 20 41C26 53 44 52 50 39C35 45 21 30 30 17"/><path d="M34 23L38 14L42 23M34 23Q38 26 42 23"/><path class="maker-solid" d="M43 29l2-4 2 4 4 2-4 2-2 4-2-4-4-2Z"/>',
    Fieldkind:
      '<path d="M32 10L40 27L54 32L40 37L32 54L24 37L10 32L24 27Z"/><path d="M32 10V54M10 32H54"/><path class="maker-solid" d="M32 20L37 32L32 44L27 32Z"/>',
    "Little Habitat":
      '<path d="M19 47V27Q19 12 32 12Q45 12 45 27V47ZM15 51H49M32 45V26"/><path class="maker-solid" d="M31 35C21 35 22 26 22 26C31 26 31 35 31 35ZM33 40C43 40 42 31 42 31C33 31 33 40 33 40Z"/>',
    "Tide & Timber":
      '<path d="M32 12V35M22 22L32 12L42 22M24 30L32 22L40 30M14 40Q23 32 32 40T50 40M14 48Q23 40 32 48T50 48"/><circle class="maker-solid" cx="46" cy="16" r="2"/>',
  };
  return `<span class="brand-lockup"><svg class="maker-emblem" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="31" class="maker-field"/><circle cx="32" cy="32" r="27.5" class="maker-ring"/><g stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${artwork[name]}</g></svg><span class="maker-name">${name}</span></span>`;
};
