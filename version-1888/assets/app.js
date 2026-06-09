(function () {
  function getAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = getAll(".hero-slide", hero);
    var dots = getAll(".hero-dot", hero);
    var index = 0;
    var timer = null;
    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function initFilters() {
    getAll("[data-filter-panel]").forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
      if (!scope) {
        return;
      }
      var cards = getAll(".movie-card", scope);
      var empty = scope.querySelector("[data-empty]");
      var inputs = getAll("input, select", panel);
      function apply() {
        var q = normalize(panel.querySelector("[data-filter-search]") && panel.querySelector("[data-filter-search]").value);
        var type = normalize(panel.querySelector("[data-filter-type]") && panel.querySelector("[data-filter-type]").value);
        var region = normalize(panel.querySelector("[data-filter-region]") && panel.querySelector("[data-filter-region]").value);
        var year = normalize(panel.querySelector("[data-filter-year]") && panel.querySelector("[data-filter-year]").value);
        var shown = 0;
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var keywordText = title + " " + cardType + " " + cardRegion + " " + cardYear + " " + cardGenre;
          var visible = true;
          if (q && keywordText.indexOf(q) === -1) {
            visible = false;
          }
          if (type && cardType !== type) {
            visible = false;
          }
          if (region && cardRegion.indexOf(region) === -1) {
            visible = false;
          }
          if (year && cardYear !== year) {
            visible = false;
          }
          card.classList.toggle("hidden-by-filter", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }
      inputs.forEach(function (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      });
      apply();
    });
  }

  function initMoviePlayer(videoId, buttonId, overlayId, m3u8Url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !m3u8Url) {
      return;
    }
    var hls = null;
    var ready = false;
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = m3u8Url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
        return;
      }
      video.src = m3u8Url;
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", play);
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
