(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function () {
      var input = form.querySelector('input[name="q"]');
      if (input) {
        input.value = input.value.trim();
      }
    });
  });

  document.querySelectorAll(".page-filter-input").forEach(function (input) {
    var scope = input.closest("main") || document;
    var targets = scope.querySelectorAll("[data-search]");

    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      targets.forEach(function (node) {
        var hay = (node.getAttribute("data-search") || "").toLowerCase();
        node.classList.toggle(
          "is-filter-hidden",
          value && hay.indexOf(value) === -1,
        );
      });
    });
  });

  document.querySelectorAll(".hero-slider").forEach(function (slider) {
    var slides = Array.prototype.slice.call(
      slider.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll(".hero-dots button"),
    );
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll(".video-player").forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var source = video ? video.getAttribute("data-play") : "";
    var initialized = false;
    var hls = null;

    function playVideo() {
      if (!video || !source) {
        return;
      }

      if (!initialized) {
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener(
            "loadedmetadata",
            function () {
              video.play().catch(function () {});
            },
            { once: true },
          );
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!initialized) {
          playVideo();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });

  var searchInput = document.getElementById("globalSearch");
  var searchResults = document.getElementById("searchResults");

  if (searchInput && searchResults && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;

    function renderSearch() {
      var value = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = "";

      if (!value) {
        return;
      }

      var result = window.MOVIE_INDEX.filter(function (movie) {
        return movie.search.toLowerCase().indexOf(value) !== -1;
      }).slice(0, 120);

      result.forEach(function (movie) {
        var card = document.createElement("a");
        card.className = "movie-card";
        card.href = movie.url;
        card.setAttribute("data-search", movie.search);
        card.innerHTML = [
          '<span class="poster-wrap">',
          '<img src="' +
            movie.cover +
            '" alt="' +
            movie.title.replace(/"/g, "&quot;") +
            '" loading="lazy">',
          '<span class="poster-gradient"></span>',
          '<span class="type-badge">' + movie.type + "</span>",
          '<span class="year-badge">' + movie.year + "</span>",
          "</span>",
          '<span class="movie-card-body">',
          "<strong>" + movie.title + "</strong>",
          '<span class="movie-meta">' +
            movie.region +
            " · " +
            movie.genre +
            "</span>",
          '<span class="movie-one-line">' + movie.oneLine + "</span>",
          "</span>",
        ].join("");
        searchResults.appendChild(card);
      });
    }

    searchInput.addEventListener("input", renderSearch);
    renderSearch();
  }
})();
