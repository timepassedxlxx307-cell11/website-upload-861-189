(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
      const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
      let current = 0;
      let timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 6200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
      const input = scope.querySelector('[data-search-input]');
      const buttons = Array.from(scope.querySelectorAll('[data-filter-value]'));
      const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
      let filter = '';

      function apply() {
        const query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          const haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-info') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          const matchQuery = !query || haystack.indexOf(query) !== -1;
          const matchFilter = !filter || haystack.indexOf(filter.toLowerCase()) !== -1;
          card.classList.toggle('is-hidden-by-filter', !(matchQuery && matchFilter));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          filter = button.getAttribute('data-filter-value') || '';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });
  });
}());
