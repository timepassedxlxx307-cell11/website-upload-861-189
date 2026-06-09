(function () {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var streamUrl = box.getAttribute('data-stream');
    var hls = null;
    var loaded = false;

    function bindStream() {
      if (loaded || !video || !streamUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        loaded = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
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
        loaded = true;
      }
    }

    function playVideo() {
      bindStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(setupPlayer);
  });
})();
