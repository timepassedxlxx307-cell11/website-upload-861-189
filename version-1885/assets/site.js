const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let activeIndex = 0;

  const activate = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => activate(index));
  });

  if (slides.length > 1) {
    setInterval(() => activate(activeIndex + 1), 5600);
  }
}

const filterInputs = Array.from(document.querySelectorAll('[data-filter-input]'));
const filterSelects = Array.from(document.querySelectorAll('[data-filter-select]'));

const applyFilters = () => {
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const empty = document.querySelector('[data-empty-state]');
  const text = filterInputs.map((input) => input.value.trim().toLowerCase()).join(' ');
  const type = filterSelects.map((select) => select.value.trim().toLowerCase()).find(Boolean) || '';
  let visible = 0;

  cards.forEach((card) => {
    const haystack = (card.getAttribute('data-search') || '').toLowerCase();
    const textMatch = !text || text.split(/\s+/).every((part) => haystack.includes(part));
    const typeMatch = !type || haystack.includes(type);
    const matched = textMatch && typeMatch;
    card.hidden = !matched;
    if (matched) {
      visible += 1;
    }
  });

  if (empty) {
    empty.hidden = visible !== 0;
  }
};

filterInputs.forEach((input) => {
  input.addEventListener('input', applyFilters);
});

filterSelects.forEach((select) => {
  select.addEventListener('change', applyFilters);
});
