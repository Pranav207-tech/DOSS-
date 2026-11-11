/**
 * ReelFinder - Main JavaScript (Home Page)
 * Handles index.html functionality
 * Depends on: config.js, api.js
 */

// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// ============================================================
// APP INITIALIZATION
// ============================================================
async function initApp() {
    initNavbar();
    initSearch();
    initScrollAnimations();
    initPageTransitions();
    initSurpriseMe();
    initWatchlistDelegation();

    if (!isAPIKeyConfigured()) {
        showAPIKeyWarning();
    } else {
        await Promise.all([
            loadTrendingMovies(),
            loadPopularMovies(),
            loadHiddenGems()
        ]);
    }
}

// ============================================================
// NAVBAR
// ============================================================
function initNavbar() {
    const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu') || document.querySelector('.mobile-menu');

    // Scroll class
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Hamburger toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('open');
            mobileMenu.classList.toggle('open', !isOpen);
            hamburger.classList.toggle('active', !isOpen);
            hamburger.setAttribute('aria-expanded', String(!isOpen));
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Active link highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============================================================
// SEARCH (Live Overlay Search)
// ============================================================
function initSearch() {
    const openBtn = document.getElementById('nav-search-btn');
    const overlay = document.getElementById('search-overlay');
    const closeBtn = document.getElementById('close-search');
    const input = document.getElementById('search-input');
    const resultsBox = document.getElementById('search-results');

    if (openBtn && overlay) {
        openBtn.addEventListener('click', () => {
            overlay.style.display = 'flex';
            if (input) {
                input.value = '';
                input.focus();
            }
            if (resultsBox) resultsBox.innerHTML = '';
        });
    }

    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    }

    if (input && resultsBox) {
        let debounceTimer;
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (query.length < 2) {
                resultsBox.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                resultsBox.innerHTML = '<div class="search-loading" style="padding: 1rem; color: #9898b8; text-align: center;">Searching...</div>';
                if (isAPIKeyConfigured()) {
                    try {
                        const data = await tmdb.searchMovies(query);
                        renderLiveSearchResults(data.results || [], resultsBox);
                    } catch {
                        renderLocalLiveSearchResults(query, resultsBox);
                    }
                } else {
                    renderLocalLiveSearchResults(query, resultsBox);
                }
            }, 300);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay) {
                overlay.style.display = 'none';
            }
        });
    }
}

function renderLiveSearchResults(movies, container) {
    if (!movies || !movies.length) {
        container.innerHTML = '<div class="no-search-results" style="padding: 1rem; color: #9898b8; text-align: center;">No titles found matching your search.</div>';
        return;
    }
    container.innerHTML = movies.slice(0, 6).map(m => {
        const title = m.title || m.name || 'Untitled';
        const year = (m.release_date || m.first_air_date || '').substring(0, 4);
        const rating = m.vote_average ? m.vote_average.toFixed(1) : '—';
        const posterUrl = m.poster_path ? getImageURL(m.poster_path, 'w185') : getFallbackPoster(title);
        return `
            <a href="details.html?id=${m.id}&type=movie" class="search-item" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 8px; text-decoration: none; color: #f0f0ff; background: rgba(255, 255, 255, 0.04); margin-bottom: 0.5rem; transition: background 0.2s;">
                <img src="${posterUrl}" alt="${escapeHTML(title)}" style="width: 44px; height: 66px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" onerror="this.src='${getFallbackPoster(title)}'">
                <div class="search-item-info">
                    <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem; font-weight: 600;">${escapeHTML(title)}</h4>
                    <span style="font-size: 0.8rem; color: #9898b8;">${year ? year + ' • ' : ''}⭐ ${rating}</span>
                </div>
            </a>
        `;
    }).join('');
}

function renderLocalLiveSearchResults(query, container) {
    const q = query.toLowerCase();
    const matches = (typeof SAMPLE_MOVIES !== 'undefined' ? SAMPLE_MOVIES : []).filter(m => (m.title || '').toLowerCase().includes(q));
    renderLiveSearchResults(matches, container);
}

// ============================================================
// SECTION LOADERS
// ============================================================
async function loadTrendingMovies() {
    const containerId = 'trending-movies-grid';
    showSkeletons(containerId, 6);
    try {
        const data = await tmdb.getTrending();
        const movies = (data && data.results) ? data.results.slice(0, 12) : [];
        hideSkeletons(containerId);
        renderMovieCards(containerId, movies);
    } catch (err) {
        console.error('Failed to load trending movies:', err);
        hideSkeletons(containerId);
        renderMovieCards(containerId, SAMPLE_MOVIES);
        showToast('Using sample data – add your API key for live results.', 'info');
    }
}

async function loadPopularMovies() {
    const containerId = 'popular-movies-grid';
    showSkeletons(containerId, 6);
    try {
        const data = await tmdb.getPopular();
        const movies = (data && data.results) ? data.results.slice(0, 12) : [];
        hideSkeletons(containerId);
        renderMovieCards(containerId, movies);
    } catch (err) {
        console.error('Failed to load popular movies:', err);
        hideSkeletons(containerId);
        renderMovieCards(containerId, SAMPLE_MOVIES);
    }
}

async function loadHiddenGems() {
    const containerId = 'hidden-gems-grid';
    showSkeletons(containerId, 6);
    try {
        const data = await tmdb.getTopRated(3);
        let movies = (data && data.results) ? data.results : [];
        // Filter: highly rated but less mainstream
        movies = movies.filter(m =>
            m.vote_average >= 7.5 &&
            m.vote_count >= 500 &&
            m.vote_count <= 5000
        ).slice(0, 12);

        // If not enough results, relax the upper bound
        if (movies.length < 4) {
            movies = (data && data.results) ? data.results.filter(m =>
                m.vote_average >= 7.5 && m.vote_count >= 200
            ).slice(0, 12) : SAMPLE_MOVIES;
        }

        hideSkeletons(containerId);
        renderMovieCards(containerId, movies.length ? movies : SAMPLE_MOVIES);
    } catch (err) {
        console.error('Failed to load hidden gems:', err);
        hideSkeletons(containerId);
        renderMovieCards(containerId, SAMPLE_MOVIES);
    }
}

// ============================================================
// RENDER HELPERS
// ============================================================
function renderMovieCards(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!movies || movies.length === 0) {
        container.innerHTML = `<p class="no-results">No movies found.</p>`;
        return;
    }
    container.innerHTML = movies.map(m => createMovieCard(m)).join('');
    // Trigger scroll animations for newly added cards
    container.querySelectorAll('.movie-card').forEach(card => {
        card.classList.add('animate-in');
    });
}

// ============================================================
// MOVIE CARD
// ============================================================
function createMovieCard(movie, type = 'movie') {
    const id = movie.id;
    const title = movie.title || movie.name || 'Unknown Title';
    const year = formatYear(movie.release_date || movie.first_air_date || '');
    const rating = formatRating(movie.vote_average);
    const overview = truncateText(movie.overview || '', 120);
    const inWatchlist = isInWatchlist(id);
    const heartClass = inWatchlist ? 'heart-btn active' : 'heart-btn';
    const heartIcon = inWatchlist ? '❤️' : '🤍';

    // Genre tags
    const genreMap = (typeof GENRE_IDS !== 'undefined') ? GENRE_IDS : {};
    const genreNames = getGenreNames(movie.genre_ids || [], genreMap);
    const genreTags = genreNames
        ? genreNames.split(', ').slice(0, 3).map(g =>
            `<span class="genre-tag">${escapeHTML(g)}</span>`
          ).join('')
        : '';

    // Poster
    const posterPath = movie.poster_path;
    let posterSrc;
    if (posterPath && typeof getImageURL === 'function') {
        posterSrc = getImageURL(posterPath, 'w342');
    } else if (typeof getFallbackPoster === 'function') {
        posterSrc = getFallbackPoster(title);
    } else {
        posterSrc = `https://via.placeholder.com/342x513/1a1a2e/e94560?text=${encodeURIComponent(title)}`;
    }

    // Serialize movie data for watchlist (safe JSON in data attribute)
    const movieData = encodeURIComponent(JSON.stringify({
        id: movie.id,
        title,
        poster_path: movie.poster_path || null,
        release_date: movie.release_date || movie.first_air_date || '',
        vote_average: movie.vote_average || 0,
        overview: movie.overview || '',
        genre_ids: movie.genre_ids || []
    }));

    return `
<article class="movie-card animate-in" data-movie-id="${id}" data-type="${escapeHTML(type)}">
    <div class="movie-card__poster-wrap">
        <img
            class="movie-card__poster"
            src="${escapeHTML(posterSrc)}"
            alt="${escapeHTML(title)} poster"
            loading="lazy"
            onerror="this.src='${typeof getFallbackPoster === 'function' ? getFallbackPoster(title) : ''}';"
        />
        <div class="movie-card__overlay">
            <div class="movie-card__overlay-actions">
                <button
                    class="btn btn--primary btn--sm view-details-btn"
                    data-id="${id}"
                    data-type="${escapeHTML(type)}"
                    aria-label="View details for ${escapeHTML(title)}"
                >
                    🎬 View Details
                </button>
                <button
                    class="${heartClass} watchlist-btn"
                    data-movie-id="${id}"
                    data-movie="${movieData}"
                    aria-label="${inWatchlist ? 'Remove from' : 'Add to'} watchlist"
                    aria-pressed="${inWatchlist}"
                >
                    <span class="heart-icon">${heartIcon}</span>
                    ${inWatchlist ? 'Saved' : 'Watchlist'}
                </button>
            </div>
            <p class="movie-card__overview">${escapeHTML(overview)}</p>
        </div>
    </div>
    <div class="movie-card__info">
        <h3 class="movie-card__title">${escapeHTML(title)}</h3>
        <div class="movie-card__meta">
            <span class="movie-card__year">${escapeHTML(year)}</span>
            <span class="movie-card__rating">${escapeHTML(rating)}</span>
        </div>
        <div class="movie-card__genres">${genreTags}</div>
    </div>
</article>`;
}

// ============================================================
// EVENT DELEGATION
// ============================================================
function initWatchlistDelegation() {
    document.addEventListener('click', (e) => {
        // View Details button
        const detailsBtn = e.target.closest('.view-details-btn');
        if (detailsBtn) {
            const id = detailsBtn.dataset.id;
            const type = detailsBtn.dataset.type || 'movie';
            if (id) navigateTo('details.html', { id, type });
            return;
        }

        // Clicking on the card itself (not the buttons)
        const card = e.target.closest('.movie-card');
        if (card && !e.target.closest('.watchlist-btn') && !e.target.closest('.view-details-btn')) {
            const id = card.dataset.movieId;
            const type = card.dataset.type || 'movie';
            if (id) navigateTo('details.html', { id, type });
            return;
        }

        // Watchlist button
        const watchBtn = e.target.closest('.watchlist-btn');
        if (watchBtn) {
            e.stopPropagation();
            const movieId = watchBtn.dataset.movieId;
            const encoded = watchBtn.dataset.movie;
            if (!movieId) return;

            if (isInWatchlist(movieId)) {
                removeFromWatchlist(movieId);
                watchBtn.classList.remove('active');
                watchBtn.setAttribute('aria-pressed', 'false');
                watchBtn.innerHTML = `<span class="heart-icon">🤍</span> Watchlist`;
            } else {
                let movieObj = null;
                try {
                    movieObj = encoded ? JSON.parse(decodeURIComponent(encoded)) : { id: movieId };
                } catch {
                    movieObj = { id: movieId };
                }
                addToWatchlist(movieObj);
                watchBtn.classList.add('active');
                watchBtn.setAttribute('aria-pressed', 'true');
                watchBtn.innerHTML = `<span class="heart-icon">❤️</span> Saved`;
            }
        }
    });
}

// ============================================================
// WATCHLIST
// ============================================================
function getWatchlist() {
    try {
        return JSON.parse(localStorage.getItem('reelfinder_watchlist') || '[]');
    } catch {
        return [];
    }
}

function saveWatchlist(list) {
    try {
        localStorage.setItem('reelfinder_watchlist', JSON.stringify(list));
    } catch (e) {
        console.warn('Could not save watchlist to localStorage:', e);
    }
}

function addToWatchlist(movie) {
    const list = getWatchlist();
    if (!list.find(m => String(m.id) === String(movie.id))) {
        list.push({ ...movie, addedAt: new Date().toISOString() });
        saveWatchlist(list);
        showToast(`"${movie.title || 'Movie'}" added to watchlist ❤️`, 'success');
    } else {
        showToast(`Already in your watchlist!`, 'info');
    }
}

function removeFromWatchlist(movieId) {
    const list = getWatchlist().filter(m => String(m.id) !== String(movieId));
    saveWatchlist(list);
    showToast('Removed from watchlist', 'info');
}

function isInWatchlist(movieId) {
    return getWatchlist().some(m => String(m.id) === String(movieId));
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'success') {
    // Ensure container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none'
        });
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span class="toast__msg">${escapeHTML(message)}</span>`;
    Object.assign(toast.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        borderRadius: '10px',
        background: '#1e293b',
        color: '#f8fafc',
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 2px ${colors[type] || colors.info}33`,
        borderLeft: `4px solid ${colors[type] || colors.info}`,
        fontSize: '0.9rem',
        maxWidth: '320px',
        pointerEvents: 'auto',
        opacity: '0',
        transform: 'translateX(40px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        cursor: 'default'
    });

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
    });

    // Auto-dismiss after 3s
    const dismiss = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    };

    setTimeout(dismiss, 3000);
    toast.addEventListener('click', dismiss);
}

// ============================================================
// LOADING SKELETONS
// ============================================================
function showSkeletons(containerId, count = 6) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Array.from({ length: count }).map(() => `
<div class="movie-card movie-card--skeleton" aria-hidden="true">
    <div class="movie-card__poster-wrap skeleton-box"></div>
    <div class="movie-card__info">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--meta"></div>
        <div class="skeleton-line skeleton-line--genre"></div>
    </div>
</div>`).join('');
}

function hideSkeletons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const skeletons = container.querySelectorAll('.movie-card--skeleton');
    skeletons.forEach(s => s.remove());
}

// ============================================================
// API KEY WARNING
// ============================================================
function showAPIKeyWarning() {
    // Banner
    const banner = document.createElement('div');
    banner.id = 'api-key-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
<div class="api-banner__inner">
    <span class="api-banner__icon">🔑</span>
    <div class="api-banner__text">
        <strong>TMDB API Key Required</strong>
        <span>Open <code>js/config.js</code> and set your <code>TMDB_API_KEY</code> to load live movie data.
        Get a free key at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">themoviedb.org</a>.</span>
    </div>
    <button class="api-banner__close" aria-label="Close banner">✕</button>
</div>`;
    Object.assign(banner.style, {
        position: 'sticky',
        top: '0',
        zIndex: '1000',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: '#1a1a1a',
        padding: '12px 24px',
        fontFamily: 'inherit'
    });
    document.body.prepend(banner);

    banner.querySelector('.api-banner__close').addEventListener('click', () => {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    });

    // Show sample movies in all grids
    ['trending-movies-grid', 'popular-movies-grid', 'hidden-gems-grid'].forEach(id => {
        hideSkeletons(id);
        renderMovieCards(id, SAMPLE_MOVIES);
    });

    showToast('Showing sample movies. Add your TMDB API key for live data!', 'warning');
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    // Observe existing elements
    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // Also observe future elements added dynamically
    const mutationObs = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.classList && node.classList.contains('animate-in')) {
                        observer.observe(node);
                    }
                    node.querySelectorAll && node.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
                }
            });
        });
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });
}

// ============================================================
// PAGE TRANSITIONS
// ============================================================
function initPageTransitions() {
    // Fade-in on load
    document.body.classList.add('page-transition-enter');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('page-transition-enter-active');
        });
    });

    // Fade-out on navigation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
            const href = link.getAttribute('href');
            const isExternal = href.startsWith('http') || href.startsWith('//');
            const isAnchor = href.startsWith('#');
            const isMail = href.startsWith('mailto:');
            const isTel = href.startsWith('tel:');
            if (isExternal || isAnchor || isMail || isTel) return;

            e.preventDefault();
            document.body.classList.add('page-transition-exit');
            setTimeout(() => { window.location.href = href; }, 250);
        }
    });
}

// ============================================================
// SURPRISE ME
// ============================================================
function initSurpriseMe() {
    const btn = document.getElementById('surprise-btn') || document.getElementById('surprise-me-btn') || document.querySelector('.surprise-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = '🎲 Finding...';

        try {
            const page = Math.floor(Math.random() * 5) + 1;
            const data = await tmdb.getPopular(page);
            const movies = (data && data.results) ? data.results : SAMPLE_MOVIES;
            if (movies.length) {
                const pick = movies[Math.floor(Math.random() * movies.length)];
                navigateTo('details.html', { id: pick.id, type: 'movie' });
            } else {
                showToast('Could not find a movie. Try again!', 'error');
                btn.disabled = false;
                btn.textContent = '🎲 Surprise Me!';
            }
        } catch (err) {
            console.error('Surprise Me error:', err);
            // Fallback to sample movies
            const pick = SAMPLE_MOVIES[Math.floor(Math.random() * SAMPLE_MOVIES.length)];
            if (pick) {
                navigateTo('details.html', { id: pick.id, type: 'movie' });
            } else {
                showToast('Something went wrong. Try again!', 'error');
                btn.disabled = false;
                btn.textContent = '🎲 Surprise Me!';
            }
        }
    });
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page, params = {}) {
    const url = new URL(page, window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    window.location.href = url.toString();
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatYear(dateString) {
    if (!dateString) return 'N/A';
    const year = dateString.split('-')[0];
    return year || 'N/A';
}

function formatRating(rating) {
    if (rating == null || isNaN(rating)) return 'N/A';
    const num = parseFloat(rating);
    return `${num.toFixed(1)} ★`;
}

function formatRuntime(minutes) {
    if (!minutes || isNaN(minutes)) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function getGenreNames(genreIds, genreMap) {
    if (!genreIds || !genreIds.length) return '';
    if (!genreMap || typeof genreMap !== 'object') return '';
    return genreIds
        .map(id => genreMap[id])
        .filter(Boolean)
        .join(', ');
}

function truncateText(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '…';
}

function debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
