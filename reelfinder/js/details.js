/**
 * ReelFinder - Movie Details Page Controller
 * Displays cinematic backdrop, posters, trailer link, cast,
 * similar movie recommendations, and watchlist integration.
 */

let currentMovieData = null;

// Rich fallback dictionary matching sample movie IDs
const SAMPLE_DETAILS_STORE = {
    550: {
        id: 550, title: "Fight Club", tagline: "Mischief. Mayhem. Soap.",
        release_date: "1999-10-15", runtime: 139, vote_average: 8.4,
        genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }],
        original_language: "en", status: "Released",
        overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground 'fight clubs' forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
        trailerKey: "qtRKdVGuPCQ",
        cast: [
            { name: "Edward Norton", character: "The Narrator" },
            { name: "Brad Pitt", character: "Tyler Durden" },
            { name: "Helena Bonham Carter", character: "Marla Singer" },
            { name: "Meat Loaf", character: "Robert 'Bob' Paulson" }
        ],
        similar: [
            { id: 278, title: "The Shawshank Redemption", release_date: "1994-09-23", vote_average: 8.7, genre_ids: [18, 80], poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" },
            { id: 27205, title: "Inception", release_date: "2010-07-15", vote_average: 8.4, genre_ids: [28, 878], poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
            { id: 769, title: "GoodFellas", release_date: "1990-09-12", vote_average: 8.5, genre_ids: [18, 80], poster_path: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" }
        ]
    },
    278: {
        id: 278, title: "The Shawshank Redemption", tagline: "Fear can hold you prisoner. Hope can set you free.",
        release_date: "1994-09-23", runtime: 142, vote_average: 8.7,
        genres: [{ id: 18, name: "Drama" }, { id: 80, name: "Crime" }],
        original_language: "en", status: "Released",
        overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank State Penitentiary, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his quiet demeanor and hopeful philosophy.",
        poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
        trailerKey: "PLl99DlL6b4",
        cast: [
            { name: "Tim Robbins", character: "Andy Dufresne" },
            { name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding" },
            { name: "Bob Gunton", character: "Warden Samuel Norton" },
            { name: "William Sadler", character: "Heywood" }
        ],
        similar: [
            { id: 550, title: "Fight Club", release_date: "1999-10-15", vote_average: 8.4, genre_ids: [18, 53], poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
            { id: 13, title: "Forrest Gump", release_date: "1994-06-23", vote_average: 8.5, genre_ids: [35, 18], poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
            { id: 389, title: "12 Angry Men", release_date: "1957-04-10", vote_average: 8.5, genre_ids: [18], poster_path: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg" }
        ]
    },
    157336: {
        id: 157336, title: "Interstellar", tagline: "Mankind was born on Earth. It was never meant to die here.",
        release_date: "2014-11-05", runtime: 169, vote_average: 8.4,
        genres: [{ id: 878, name: "Science Fiction" }, { id: 18, name: "Drama" }, { id: 12, name: "Adventure" }],
        original_language: "en", status: "Released",
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage across the cosmos.",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        trailerKey: "zSWdZVtXT7E",
        cast: [
            { name: "Matthew McConaughey", character: "Joseph Cooper" },
            { name: "Anne Hathaway", character: "Dr. Amelia Brand" },
            { name: "Jessica Chastain", character: "Murphy Cooper" },
            { name: "Michael Caine", character: "Professor John Brand" }
        ],
        similar: [
            { id: 27205, title: "Inception", release_date: "2010-07-15", vote_average: 8.4, genre_ids: [28, 878], poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
            { id: 1124, title: "The Prestige", release_date: "2006-10-19", vote_average: 8.2, genre_ids: [18, 9648], poster_path: "/bdN3gEYLpcU1Rvd8BfO6pZ6sB9z.jpg" }
        ]
    },
    27205: {
        id: 27205, title: "Inception", tagline: "Your mind is the scene of the crime.",
        release_date: "2010-07-15", runtime: 148, vote_average: 8.4,
        genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }],
        original_language: "en", status: "Released",
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life in exchange for a task considered impossible: 'inception', the implantation of another person's idea into a target's subconscious.",
        poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        trailerKey: "YoHD9XEInc0",
        cast: [
            { name: "Leonardo DiCaprio", character: "Dom Cobb" },
            { name: "Joseph Gordon-Levitt", character: "Arthur" },
            { name: "Elliot Page", character: "Ariadne" },
            { name: "Tom Hardy", character: "Eames" }
        ],
        similar: [
            { id: 157336, title: "Interstellar", release_date: "2014-11-05", vote_average: 8.4, genre_ids: [878, 12], poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
            { id: 155, title: "The Dark Knight", release_date: "2008-07-16", vote_average: 8.5, genre_ids: [18, 28], poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
        ]
    }
};

// ─────────────────────────────────────────────
// DOM READY & BOOTSTRAP
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initDetailPage();
});

async function initDetailPage() {
    initNavbar();
    initSearch();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type') || 'movie';

    if (!id) {
        // If opened with no id, show sample film (Inception)
        await loadDetails(27205, 'movie');
        return;
    }

    await loadDetails(id, type);
}

// ─────────────────────────────────────────────
// DATA FETCHING & RENDERING
// ─────────────────────────────────────────────

async function loadDetails(id, type = 'movie') {
    try {
        let movie = null;

        if (isAPIKeyConfigured()) {
            try {
                if (type === 'tv') {
                    movie = await tmdb.getTVDetails(id);
                    movie._mediaType = 'tv';
                } else {
                    movie = await tmdb.getMovieDetails(id);
                    movie._mediaType = 'movie';
                }
            } catch (apiError) {
                console.warn('Live API request failed, checking offline fallback:', apiError);
                movie = getOfflineMovieFallback(id);
            }
        } else {
            showAPIKeyNotice();
            movie = getOfflineMovieFallback(id);
        }

        if (!movie) {
            showError("The requested movie or series could not be found.");
            return;
        }

        currentMovieData = movie;
        renderMovieDetails(movie);
        renderCastList(movie.credits?.cast || movie.cast || []);
        renderSimilarMovies(movie.similar?.results || movie.similar || [], movie._mediaType);
        initWatchlistButton(movie);

    } catch (err) {
        console.error('Fatal details error:', err);
        showError("An unexpected error occurred while loading this title.");
    }
}

function getOfflineMovieFallback(id) {
    const numId = Number(id);
    if (SAMPLE_DETAILS_STORE[numId]) {
        return SAMPLE_DETAILS_STORE[numId];
    }

    // Generic fallback for any other ID
    return {
        id: numId,
        title: "Featured Cinema Selection",
        tagline: "A must-watch cinematic journey.",
        release_date: "2023-08-15",
        runtime: 125,
        vote_average: 8.2,
        genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }],
        original_language: "en",
        status: "Released",
        overview: "An immersive narrative following complex individuals caught in extraordinary circumstances, exploring themes of resilience, fate, and human determination.",
        poster_path: null,
        backdrop_path: null,
        trailerKey: "YoHD9XEInc0",
        cast: [
            { name: "Leading Actor", character: "Protagonist" },
            { name: "Supporting Star", character: "Ally" },
            { name: "Acclaimed Performer", character: "Antagonist" }
        ],
        similar: [
            { id: 27205, title: "Inception", release_date: "2010-07-15", vote_average: 8.4, genre_ids: [28, 878] },
            { id: 157336, title: "Interstellar", release_date: "2014-11-05", vote_average: 8.4, genre_ids: [878, 12] }
        ]
    };
}

function renderMovieDetails(movie) {
    const title = movie.title || movie.name || 'Untitled Film';
    document.title = `${title} – ReelFinder`;

    // 1. Backdrop
    const backdropEl = document.getElementById('backdrop-image');
    if (backdropEl) {
        if (movie.backdrop_path) {
            const backdropUrl = getImageURL(movie.backdrop_path, CONFIG.BACKDROP_SIZE);
            backdropEl.style.backgroundImage = `url('${backdropUrl}')`;
        } else {
            backdropEl.style.backgroundImage = 'linear-gradient(135deg, #13111c 0%, #0d1117 100%)';
        }
    }

    // 2. Poster
    const posterEl = document.getElementById('details-poster');
    if (posterEl) {
        posterEl.src = movie.poster_path ? getImageURL(movie.poster_path, CONFIG.POSTER_SIZE) : getFallbackPoster(title);
        posterEl.alt = title;
        posterEl.onerror = function() {
            this.onerror = null;
            this.src = getFallbackPoster(title);
        };
    }

    // 3. Header Info
    const titleEl = document.getElementById('details-title');
    const taglineEl = document.getElementById('details-tagline');
    const typeEl = document.getElementById('details-media-type');
    const yearEl = document.getElementById('details-year');
    const statusEl = document.getElementById('details-status');

    if (titleEl) titleEl.textContent = title;
    if (taglineEl) taglineEl.textContent = movie.tagline ? `"${movie.tagline}"` : '';
    if (typeEl) typeEl.textContent = movie._mediaType === 'tv' ? 'TV Series' : 'Feature Film';

    const rawDate = movie.release_date || movie.first_air_date || '';
    if (yearEl) yearEl.textContent = rawDate ? rawDate.substring(0, 4) : 'N/A';
    if (statusEl) statusEl.textContent = movie.status || 'Released';

    // 4. Stats
    const ratingVal = movie.vote_average ? movie.vote_average.toFixed(1) : '7.5';
    const ratingValueEl = document.getElementById('rating-value');
    const ratingStarsEl = document.getElementById('rating-stars');
    const runtimeEl = document.getElementById('details-runtime');
    const releaseEl = document.getElementById('details-release');
    const langEl = document.getElementById('details-language');

    if (ratingValueEl) ratingValueEl.textContent = ratingVal;
    if (ratingStarsEl) ratingStarsEl.textContent = getStarRating(movie.vote_average || 7.5);

    if (runtimeEl) {
        if (movie.runtime) {
            runtimeEl.textContent = `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`;
        } else if (movie.episode_run_time && movie.episode_run_time.length > 0) {
            runtimeEl.textContent = `~${movie.episode_run_time[0]}m / ep`;
        } else {
            runtimeEl.textContent = '120 min';
        }
    }

    if (releaseEl) releaseEl.textContent = rawDate || 'Announced';
    if (langEl) langEl.textContent = (movie.original_language || 'EN').toUpperCase();

    // 5. Genres
    const genresContainer = document.getElementById('details-genres');
    if (genresContainer && movie.genres) {
        genresContainer.innerHTML = movie.genres.map(g => `
            <span class="genre-pill">${escapeHTML(g.name || g)}</span>
        `).join('');
    }

    // 6. Overview
    const overviewEl = document.getElementById('details-overview');
    if (overviewEl) {
        overviewEl.textContent = movie.overview || 'No detailed overview available for this title.';
    }

    // 7. Trailer Link
    setupTrailer(movie);
}

function setupTrailer(movie) {
    const trailerBtn = document.getElementById('trailer-btn');
    if (!trailerBtn) return;

    let trailerKey = null;

    if (movie.videos && movie.videos.results) {
        const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
                        movie.videos.results.find(v => v.site === 'YouTube');
        if (trailer) trailerKey = trailer.key;
    } else if (movie.trailerKey) {
        trailerKey = movie.trailerKey;
    }

    if (trailerKey) {
        trailerBtn.href = `https://www.youtube.com/watch?v=${trailerKey}`;
        trailerBtn.style.display = 'inline-flex';
    } else {
        // Fallback trailer search on YouTube
        const query = encodeURIComponent(`${movie.title || movie.name} official trailer`);
        trailerBtn.href = `https://www.youtube.com/results?search_query=${query}`;
        trailerBtn.style.display = 'inline-flex';
    }
}

function renderCastList(cast) {
    const castSection = document.getElementById('cast-section');
    const castList = document.getElementById('cast-list');
    if (!castSection || !castList) return;

    if (!cast || cast.length === 0) {
        castSection.style.display = 'none';
        return;
    }

    castSection.style.display = 'block';
    castList.innerHTML = cast.slice(0, 8).map(person => {
        const profileUrl = person.profile_path ? getImageURL(person.profile_path, 'w185') : null;
        return `
            <div class="cast-card">
                <div class="cast-avatar">
                    ${profileUrl
                        ? `<img src="${profileUrl}" alt="${escapeHTML(person.name)}" loading="lazy">`
                        : `<div class="cast-avatar-fallback">🎭</div>`
                    }
                </div>
                <div class="cast-info">
                    <span class="cast-name">${escapeHTML(person.name)}</span>
                    <span class="cast-character">${escapeHTML(person.character || 'Actor')}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderSimilarMovies(similar, type = 'movie') {
    const section = document.getElementById('similar-section');
    const grid = document.getElementById('similar-movies-grid');
    if (!section || !grid) return;

    if (!similar || similar.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = similar.slice(0, 6).map(m => {
        const title = m.title || m.name || 'Untitled';
        const year = (m.release_date || m.first_air_date || '').substring(0, 4);
        const rating = m.vote_average ? m.vote_average.toFixed(1) : '7.5';
        const posterUrl = m.poster_path ? getImageURL(m.poster_path, 'w342') : getFallbackPoster(title);

        return `
            <article class="movie-card" data-movie-id="${m.id}">
                <div class="card-poster-wrap">
                    <img 
                        class="card-poster" 
                        src="${posterUrl}" 
                        alt="${escapeHTML(title)}"
                        loading="lazy"
                        onerror="this.src='${getFallbackPoster(title)}'"
                    >
                    <div class="card-overlay">
                        <a href="details.html?id=${m.id}&type=${type}" class="btn-card-details">View Details</a>
                    </div>
                    <span class="rating-badge">⭐ ${rating}</span>
                </div>
                <div class="card-info">
                    <h3 class="card-title">
                        <a href="details.html?id=${m.id}&type=${type}">${escapeHTML(title)}</a>
                    </h3>
                    <span class="card-year">${year || 'Movie'}</span>
                </div>
            </article>
        `;
    }).join('');
}

// ─────────────────────────────────────────────
// WATCHLIST FUNCTIONALITY
// ─────────────────────────────────────────────

function getWatchlist() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.WATCHLIST);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function isInWatchlist(id) {
    return getWatchlist().some(item => Number(item.id) === Number(id));
}

function initWatchlistButton(movie) {
    const btn = document.getElementById('watchlist-btn');
    if (!btn) return;

    const updateState = () => {
        const saved = isInWatchlist(movie.id);
        btn.classList.toggle('in-watchlist', saved);
        btn.setAttribute('aria-pressed', saved);
        btn.innerHTML = saved ? '❤️ In Watchlist' : '🤍 Add to Watchlist';
    };

    updateState();

    btn.addEventListener('click', () => {
        let list = getWatchlist();
        const id = Number(movie.id);
        const idx = list.findIndex(item => Number(item.id) === id);

        if (idx >= 0) {
            list.splice(idx, 1);
            localStorage.setItem(CONFIG.STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
            showToast(`Removed "${movie.title || movie.name}" from your Watchlist`, 'info');
        } else {
            const entry = {
                id: movie.id,
                title: movie.title || movie.name,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date || movie.first_air_date,
                runtime: movie.runtime,
                genres: movie.genres ? movie.genres.map(g => g.name || g) : [],
                overview: movie.overview,
                _mediaType: movie._mediaType || 'movie',
                addedAt: new Date().toISOString()
            };
            list.unshift(entry);
            localStorage.setItem(CONFIG.STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
            showToast(`Added "${entry.title}" to Watchlist! ❤️`, 'success');
        }

        updateState();
        updateWatchlistBadge();
    });
}

function updateWatchlistBadge() {
    const badge = document.getElementById('watchlist-badge');
    if (!badge) return;
    const count = getWatchlist().length;
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

// ─────────────────────────────────────────────
// HELPERS & SHELL
// ─────────────────────────────────────────────

function getStarRating(voteAverage) {
    const starsOutOf5 = Math.round((voteAverage / 10) * 5);
    return '⭐'.repeat(Math.max(1, Math.min(5, starsOutOf5)));
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
        <span class="toast-message">${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}

function showAPIKeyNotice() {
    const banner = document.getElementById('api-key-warning');
    if (banner) banner.style.display = 'block';
}

function showError(msg) {
    document.getElementById('details-content').style.display = 'none';
    const errBox = document.getElementById('details-error');
    if (errBox) {
        errBox.style.display = 'block';
        const msgEl = document.getElementById('error-message');
        if (msgEl && msg) msgEl.textContent = msg;
    }
}

function initNavbar() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
        });
    }

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    updateWatchlistBadge();
}

function initSearch() {
    const openBtn = document.getElementById('nav-search-btn');
    const overlay = document.getElementById('search-overlay');
    const closeBtn = document.getElementById('close-search');
    const input = document.getElementById('search-input');
    const resultsBox = document.getElementById('search-results');

    if (!openBtn || !overlay) return;

    openBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.style.display = 'none';
    });

    let debounceTimer;
    input.addEventListener('input', e => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query.length < 2) {
            resultsBox.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(async () => {
            resultsBox.innerHTML = '<div class="search-loading">Searching...</div>';
            if (isAPIKeyConfigured()) {
                try {
                    const data = await tmdb.searchMovies(query);
                    renderSearchResults(data.results || [], resultsBox);
                } catch {
                    renderLocalSearchResults(query, resultsBox);
                }
            } else {
                renderLocalSearchResults(query, resultsBox);
            }
        }, 350);
    });
}

function renderSearchResults(movies, container) {
    if (!movies.length) {
        container.innerHTML = '<div class="no-search-results">No titles found.</div>';
        return;
    }
    container.innerHTML = movies.slice(0, 6).map(m => `
        <a href="details.html?id=${m.id}&type=movie" class="search-item">
            <img src="${m.poster_path ? getImageURL(m.poster_path, 'w185') : getFallbackPoster(m.title)}" alt="${escapeHTML(m.title)}">
            <div class="search-item-info">
                <h4>${escapeHTML(m.title)}</h4>
                <span>${m.release_date ? m.release_date.substring(0, 4) : 'N/A'} • ⭐ ${m.vote_average ? m.vote_average.toFixed(1) : '—'}</span>
            </div>
        </a>
    `).join('');
}

function renderLocalSearchResults(query, container) {
    const q = query.toLowerCase();
    const matches = Object.values(SAMPLE_DETAILS_STORE).filter(m => m.title.toLowerCase().includes(q));
    renderSearchResults(matches, container);
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
