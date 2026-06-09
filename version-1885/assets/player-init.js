const Hls = self.Hls;
const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach((player) => {
  const video = player.querySelector('video');
  const overlay = player.querySelector('[data-player-overlay]');
  const buttons = Array.from(player.querySelectorAll('[data-play-button], video'));
  const errorBox = player.querySelector('[data-player-error]');
  let hlsInstance = null;

  const hideError = () => {
    if (errorBox) {
      errorBox.hidden = true;
    }
  };

  const showError = () => {
    if (errorBox) {
      errorBox.hidden = false;
    }
  };

  const prepareVideo = () => {
    if (!video || video.dataset.ready === 'true') {
      return;
    }

    const src = video.getAttribute('data-src');

    if (!src) {
      showError();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          showError();
        }
      });
    } else {
      video.src = src;
    }

    video.dataset.ready = 'true';
  };

  const startPlayback = async () => {
    hideError();
    prepareVideo();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (!video) {
      return;
    }

    video.controls = true;

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', startPlayback);
  });

  if (video) {
    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', showError);
  }

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
