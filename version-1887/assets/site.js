(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function siteRoot() {
    return document.body.getAttribute("data-site-root") || "";
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function renderSearchResults(form, items) {
    var root = siteRoot();
    var box = form.querySelector(".search-results");
    if (!box) {
      return;
    }
    if (!items.length) {
      box.innerHTML = '<span class="search-result-item"><span class="search-result-title">未找到相关影片</span><span class="search-result-meta">可尝试搜索地区、年份或类型</span></span>';
      box.classList.add("is-open");
      return;
    }
    box.innerHTML = items.slice(0, 8).map(function (item) {
      return '<a class="search-result-item" href="' + root + item.url + '">' +
        '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
        '<span class="search-result-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span>' +
        '</a>';
    }).join("");
    box.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    var data = window.movieSearchData || [];
    forms.forEach(function (form) {
      var input = form.querySelector(".site-search-input");
      var box = form.querySelector(".search-results");
      if (!input || !box) {
        return;
      }
      input.addEventListener("input", function () {
        var q = normalizeText(input.value);
        if (!q) {
          box.classList.remove("is-open");
          box.innerHTML = "";
          return;
        }
        var terms = q.split(/\s+/).filter(Boolean);
        var results = data.filter(function (item) {
          var haystack = normalizeText([item.title, item.year, item.region, item.type, item.genre, item.oneLine].join(" "));
          return terms.every(function (term) {
            return haystack.indexOf(term) !== -1;
          });
        });
        renderSearchResults(form, results);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = normalizeText(input.value);
        if (!q) {
          window.location.href = siteRoot() + "all.html";
          return;
        }
        var result = data.find(function (item) {
          return normalizeText(item.title).indexOf(q) !== -1;
        }) || data.find(function (item) {
          return normalizeText([item.title, item.year, item.region, item.type, item.genre, item.oneLine].join(" ")).indexOf(q) !== -1;
        });
        window.location.href = result ? siteRoot() + result.url : siteRoot() + "all.html";
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player || !window.__moviePlayback) {
      return;
    }
    var video = player.querySelector("video");
    var cover = player.querySelector("[data-player-cover]");
    var url = window.__moviePlayback.url;
    var hls = null;
    var started = false;
    function attachSource() {
      if (!video || !url) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
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
      } else {
        video.src = url;
      }
    }
    function play() {
      if (!started) {
        attachSource();
        started = true;
      }
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initSearch();
    initPlayer();
  });
})();
