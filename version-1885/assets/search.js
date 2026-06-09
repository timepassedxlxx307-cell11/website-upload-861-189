const movies = Array.isArray(self.TT_MOVIES) ? self.TT_MOVIES : [];
const input = document.querySelector('[data-search-page-input]');
const results = document.querySelector('[data-search-results]');
const empty = document.querySelector('[data-search-empty]');
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
})[char]);

const renderCard = (movie) => {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="movie-card">
      <a class="poster-wrap" href="${escapeHtml(movie.url)}" aria-label="${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-shade"></span>
        <span class="play-mark">▶</span>
      </a>
      <div class="movie-info">
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p class="movie-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</p>
        <p class="movie-desc">${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
};

const search = () => {
  if (!results) {
    return;
  }

  const query = (input ? input.value : '').trim().toLowerCase();
  const parts = query.split(/\s+/).filter(Boolean);
  const matched = movies.filter((movie) => {
    const haystack = `${movie.title} ${movie.region} ${movie.type} ${movie.year} ${movie.genre} ${movie.category} ${movie.tags.join(' ')}`.toLowerCase();
    return parts.every((part) => haystack.includes(part));
  }).slice(0, 240);

  const list = matched.length ? matched : movies.slice(0, 40);
  results.innerHTML = list.map(renderCard).join('');

  if (empty) {
    empty.hidden = matched.length !== 0 || query === '';
  }
};

if (input) {
  input.value = initialQuery;
  input.addEventListener('input', search);
}

search();
