(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

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
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFiltering() {
        var input = document.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        var count = document.querySelector('[data-filter-count]');
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

        if (!input || !cards.length) {
            return;
        }

        var empty = document.createElement('div');
        empty.className = 'empty-result is-hidden';
        empty.textContent = '没有找到匹配的影片，请换一个关键词。';
        cards[0].parentNode.appendChild(empty);

        function getText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-channel')
            ].join(' '));
        }

        function applyFilter() {
            var query = normalize(input.value);
            var visible = 0;

            cards.forEach(function (card) {
                var matched = !query || getText(card).indexOf(query) !== -1;
                card.dataset.filterMatched = matched ? '1' : '0';
                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部';
            }

            empty.classList.toggle('is-hidden', visible !== 0);
            refreshLoadMore(true);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                input.value = chip.getAttribute('data-filter-chip') || chip.textContent || '';
                applyFilter();
                input.focus();
            });
        });

        input.addEventListener('input', applyFilter);
        applyFilter();
    }

    function refreshLoadMore(reset) {
        var wrappers = Array.prototype.slice.call(document.querySelectorAll('[data-load-more]'));

        wrappers.forEach(function (wrapper) {
            var button = document.querySelector('[data-load-more-button]');
            var initial = parseInt(wrapper.getAttribute('data-initial') || '72', 10);
            var step = parseInt(wrapper.getAttribute('data-step') || String(initial), 10);
            var shown = parseInt(wrapper.getAttribute('data-shown') || String(initial), 10);
            var cards = Array.prototype.slice.call(wrapper.querySelectorAll('[data-filter-card]'));
            var matched = cards.filter(function (card) {
                return card.dataset.filterMatched !== '0';
            });

            if (reset) {
                shown = initial;
            }

            wrapper.setAttribute('data-shown', String(shown));

            matched.forEach(function (card, index) {
                card.classList.toggle('is-hidden', index >= shown);
            });

            if (button) {
                button.classList.toggle('is-hidden', shown >= matched.length);
                button.onclick = function () {
                    wrapper.setAttribute('data-shown', String(shown + step));
                    refreshLoadMore(false);
                };
            }
        });
    }

    function setupLoadMore() {
        refreshLoadMore(true);
    }

    function setupVideoPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var playButton = shell.querySelector('[data-video-play]');
            var source = video ? video.getAttribute('data-src') : '';
            var initialized = false;

            function init() {
                if (!video || !source || initialized) {
                    return;
                }

                initialized = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    shell._hls = hls;
                } else {
                    video.src = source;
                }
            }

            function play() {
                init();
                shell.classList.add('is-playing');

                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }

            if (playButton) {
                playButton.addEventListener('click', play);
            }

            if (video) {
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    if (video.currentTime === 0 || video.ended) {
                        shell.classList.remove('is-playing');
                    }
                });
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupLoadMore();
        setupFiltering();
        setupVideoPlayers();
    });
}());
