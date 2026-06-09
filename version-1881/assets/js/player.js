var activeHlsPlayer = null;

function setStatus(shell, message) {
  var status = shell.querySelector('.player-status');
  if (!status) {
    return;
  }
  status.textContent = message || '';
  status.classList.toggle('is-visible', Boolean(message));
}

function safePlay(video, shell) {
  var playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(function () {
      setStatus(shell, '点击视频画面继续播放');
    });
  }
}

async function prepareVideo(shell) {
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.player-overlay');
  var streamUrl = shell.getAttribute('data-stream');
  if (!video || !streamUrl) {
    setStatus(shell, '播放暂时无法启动');
    return;
  }

  if (overlay) {
    overlay.classList.add('is-hidden');
  }
  setStatus(shell, '');
  video.setAttribute('controls', 'controls');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
    safePlay(video, shell);
    return;
  }

  try {
    var module = await import('../vendor/hls-vendor-dru42stk.js');
    var Hls = module.H;
    if (activeHlsPlayer) {
      activeHlsPlayer.destroy();
      activeHlsPlayer = null;
    }
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      activeHlsPlayer = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        safePlay(video, shell);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          activeHlsPlayer = null;
          setStatus(shell, '播放暂时无法启动');
        }
      });
      safePlay(video, shell);
    } else {
      setStatus(shell, '播放暂时无法启动');
    }
  } catch (error) {
    setStatus(shell, '播放暂时无法启动');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var overlay = shell.querySelector('.player-overlay');
    var video = shell.querySelector('video');
    var started = false;

    function start() {
      if (started) {
        if (video) {
          safePlay(video, shell);
        }
        return;
      }
      started = true;
      prepareVideo(shell);
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    }
  });
});
