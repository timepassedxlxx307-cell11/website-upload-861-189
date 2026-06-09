(function() {
    var mobileButton = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function(panel) {
        var section = panel.closest("section") || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
        var empty = section.querySelector("[data-empty-state]");
        var keyword = panel.querySelector("[data-filter-keyword]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var category = panel.querySelector("[data-filter-category]");

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function applyQueryFromUrl() {
            var params = new URLSearchParams(window.location.search);
            if (keyword && params.get("q")) {
                keyword.value = params.get("q");
            }
            if (year && params.get("year")) {
                year.value = params.get("year");
            }
            if (type && params.get("type")) {
                type.value = params.get("type");
            }
            if (region && params.get("region")) {
                region.value = params.get("region");
            }
            if (category && params.get("category")) {
                category.value = params.get("category");
            }
        }

        function filterCards() {
            var keywordValue = normalize(keyword && keyword.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var regionValue = normalize(region && region.value);
            var categoryValue = normalize(category && category.value);
            var visible = 0;

            cards.forEach(function(card) {
                var searchValue = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var matched = true;

                if (keywordValue && searchValue.indexOf(keywordValue) === -1) {
                    matched = false;
                }
                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, type, year, region, category].forEach(function(control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });

        applyQueryFromUrl();
        filterCards();
    });
})();
