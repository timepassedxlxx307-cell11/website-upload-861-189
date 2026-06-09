(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
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
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var search = document.getElementById("movie-search");
    var region = document.getElementById("region-filter");
    var type = document.getElementById("type-filter");
    var year = document.getElementById("year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function applyFilters() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }
        if (typeValue && haystack.indexOf(typeValue) === -1 && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }
        if (yearValue && cardYear.indexOf(yearValue) === -1) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
      });
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var layer = document.querySelector("[data-play-layer]");
      var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
      var hls = null;
      var loaded = false;

      if (!video || !streamUrl) {
        return;
      }

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        load();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", play);
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  };
})();
