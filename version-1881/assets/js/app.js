(function () {
  var rootPath = document.body.getAttribute('data-root-path') || './';

  function bySelector(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function withRoot(path) {
    return rootPath + String(path || '').replace(/^\.\//, '');
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function movieMatches(movie, query) {
    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      (movie.genres || []).join(' '),
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' ').toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function suggestionMarkup(movie) {
    return [
      '<a class="suggestion-item" href="' + withRoot(movie.url) + '">',
      '<img src="' + withRoot(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
      '<span>',
      '<span class="suggestion-title">' + escapeHtml(movie.title) + '</span>',
      '<span class="suggestion-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function setupSearchForms() {
    bySelector('form[role="search"], .mobile-search').forEach(function (form) {
      var input = form.querySelector('.site-search-input');
      var suggestions = form.querySelector('.search-suggestions');
      if (!input || !suggestions || !window.MOVIE_INDEX) {
        return;
      }
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        if (query.length < 1) {
          suggestions.classList.remove('is-open');
          suggestions.innerHTML = '';
          return;
        }
        var matches = window.MOVIE_INDEX.filter(function (movie) {
          return movieMatches(movie, query);
        }).slice(0, 8);
        suggestions.innerHTML = matches.map(suggestionMarkup).join('');
        suggestions.classList.toggle('is-open', matches.length > 0);
      });
      input.addEventListener('blur', function () {
        window.setTimeout(function () {
          suggestions.classList.remove('is-open');
        }, 180);
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        window.location.href = withRoot('search.html') + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = bySelector('[data-hero-slide]', hero);
    var dots = bySelector('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function optionList(values) {
    return Array.prototype.slice.call(values).filter(Boolean).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  function populateFilterSelect(select, values) {
    if (!select) {
      return;
    }
    var existing = select.value;
    var options = optionList(values).map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }).join('');
    select.innerHTML = select.querySelector('option').outerHTML + options;
    select.value = existing;
  }

  function setupFilters() {
    bySelector('[data-filter-box]').forEach(function (box) {
      var list = box.parentElement.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var cards = bySelector('.movie-card', list);
      var keywordInput = box.querySelector('[data-filter-keyword]');
      var regionSelect = box.querySelector('[data-filter-region]');
      var typeSelect = box.querySelector('[data-filter-type]');
      var yearSelect = box.querySelector('[data-filter-year]');
      var genreSelect = box.querySelector('[data-filter-genre]');
      var empty = box.parentElement.querySelector('[data-empty-state]');

      populateFilterSelect(regionSelect, new Set(cards.map(function (card) { return card.dataset.region; })));
      populateFilterSelect(typeSelect, new Set(cards.map(function (card) { return card.dataset.type; })));
      populateFilterSelect(yearSelect, new Set(cards.map(function (card) { return card.dataset.year; })));
      populateFilterSelect(genreSelect, new Set(cards.map(function (card) { return card.dataset.genre; }).join(' ').split(' ')));

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var genre = genreSelect ? genreSelect.value : '';
        var shown = 0;

        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' ').toLowerCase();
          var visible = true;
          if (keyword && text.indexOf(keyword) === -1) {
            visible = false;
          }
          if (region && card.dataset.region !== region) {
            visible = false;
          }
          if (type && card.dataset.type !== type) {
            visible = false;
          }
          if (year && card.dataset.year !== year) {
            visible = false;
          }
          if (genre && String(card.dataset.genre || '').indexOf(genre) === -1) {
            visible = false;
          }
          card.style.display = visible ? '' : 'none';
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      [keywordInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function renderSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    var formInput = document.querySelector('.search-page-form input[name="q"]');
    var empty = document.querySelector('[data-search-empty]');
    if (formInput) {
      formInput.value = params.get('q') || '';
    }
    if (!query) {
      if (empty) {
        empty.classList.add('is-visible');
      }
      return;
    }
    var matches = window.MOVIE_INDEX.filter(function (movie) {
      return movieMatches(movie, query);
    });
    results.innerHTML = matches.map(searchCardMarkup).join('');
    if (empty) {
      empty.textContent = matches.length ? '' : '没有找到匹配内容';
      empty.classList.toggle('is-visible', matches.length === 0);
    }
    setupImageFallback(results);
  }

  function searchCardMarkup(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-frame" href="' + withRoot(movie.url) + '">',
      '<img class="cover-image" src="' + withRoot(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="' + withRoot(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupImageFallback(context) {
    bySelector('img.cover-image, .suggestion-item img', context || document).forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('cover-image-missing');
        var parent = image.closest('.poster-frame, .hero-slide, .category-tile');
        if (parent) {
          parent.classList.add('is-missing-cover');
        }
      }, { once: true });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    renderSearchPage();
    setupImageFallback(document);
  });
}());
