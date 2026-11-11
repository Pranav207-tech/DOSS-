/**
 * ReelFinder - Watchlist Manager
 * Handles local storage persistence, sorting, rendering, and removal of saved titles.
 */

let currentWatchlist = [];
let currentSort = 'added';

// ─────────────────────────────────────────────
// DOM READY & BOOTSTRAP
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initWatchlistPage();
});

function initWatchlistPage() {
    initNavbar();
    initSearch();
    initWatchlistSortControls();
    initClearAllButton();
    loadAndRenderWatchlist();
}

// ─────────────────────────────────────────────
// STORAGE ACCESS
// ─────────────────────────────────────────────

function getStoredWatchlist() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.WATCHLIST);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading watchlist from localStorage:', e);
        return [];
    }
}

function saveWatchlist(list) {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    } catch (e) {
        console.error('Error saving watchlist to localStorage:', e);
    }
}

// ─────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────

function loadAndRenderWatchlist() {
    currentWatchlist = getStoredWatchlist();
    updateWatchlistCount(currentWatchlist.length);

    const grid = document.getElementById('watchlist-grid');
    const emptyState = document.getElementById('watchlist-empty');
    const controls = document.getElementById('watchlist-controls');

    if (!currentWatchlist || currentWatchlist.length === 0) {
        if (grid) grid.style.display = 'none';
        if (controls) controls.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (controls) controls.style.display = 'block';
    if (grid) grid.style.display = 'grid';

    // Sort according to active selection
    const sorted = sortWatchlist(currentWatchlist, currentSort);
    grid.innerHTML = sorted.map(movie => createWatchlistCard(movie)).join('');

    initRemoveButtons();
    initCardImageFallbacks();
}

function createWatchlistCard(movie) {
    const title = movie.title || movie.name || 'Untitled';
    const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '—';
    const type = movie._mediaType || 'movie';
    const posterUrl = movie.poster_path ? getImageURL(movie.poster_path, 'w500') : getFallbackPoster(title);
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

    return `
        <article class="watchlist-card" data-movie-id="${movie.id}">
            <div class="watchlist-poster-wrap">
                <img 
                    class="watchlist-poster" 
                    src="${posterUrl}" 
                    alt="${escapeHTML(title)}"
                    loading="lazy"
                    onerror="this.src='${getFallbackPoster(title)}'"
                >
                <div class="watchlist-card-overlay">
                    <a href="details.html?id=${movie.id}&type=${type}" class="btn-card-details">
                        View Details
                    </a>
                </div>
                <span class="rating-badge">⭐ ${rating}</span>
            </div>

            <div class="watchlist-card-content">
                <h2 class="watchlist-card-title">
                    <a href="details.html?id=${movie.id}&type=${type}">${escapeHTML(title)}</a>
                </h2>

                <div class="watchlist-meta-row">
                    <span class="watchlist-year">${year}</span>
                    ${runtime ? `<span class="watchlist-runtime">⏱ ${runtime}</span>` : ''}
                    <span class="watchlist-type">${type === 'tv' ? '📺 TV' : '🎬 Film'}</span>
                </div>

                <div class="watchlist-card-actions">
                    <button 
                        type="button" 
                        class="btn-remove-item" 
                        data-movie-id="${movie.id}"
                        aria-label="Remove ${escapeHTML(title)} from watchlist"
                    >
                        🗑 Remove
                    </button>
                    <a href="details.html?id=${movie.id}&type=${type}" class="btn-quick-view">
                        Details →
                    </a>
                </div>
            </div>
        </article>
    `;
}

function updateWatchlistCount(count) {
    const countEl = document.getElementById('watchlist-count');
    if (countEl) countEl.textContent = count;

    const badge = document.getElementById('watchlist-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ─────────────────────────────────────────────
// SORTING
// ─────────────────────────────────────────────

function sortWatchlist(list, criteria) {
    const copy = [...list];
    switch (criteria) {
        case 'rating':
            return copy.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        case 'title':
            return copy.sort((a, b) => {
                const titleA = (a.title || a.name || '').toLowerCase();
                const titleB = (b.title || b.name || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });
        case 'added':
        default:
            return copy.sort((a, b) => {
                const dateA = new Date(a.addedAt || '2024-01-01');
                const dateB = new Date(b.addedAt || '2024-01-01');
                return dateB - dateA;
            });
    }
}

function initWatchlistSortControls() {
    const buttons = document.querySelectorAll('.sort-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            loadAndRenderWatchlist();
        });
    });
}

// ─────────────────────────────────────────────
// REMOVAL & CLEAR ACTIONS
// ─────────────────────────────────────────────

function initRemoveButtons() {
    const buttons = document.querySelectorAll('.btn-remove-item');
    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const movieId = Number(btn.dataset.movieId);
            const card = btn.closest('.watchlist-card');

            // Slide and fade out animation
            if (card) {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.85) translateY(20px)';
            }

            setTimeout(() => {
                removeMovieFromWatchlist(movieId);
            }, 280);
        });
    });
}

function removeMovieFromWatchlist(id) {
    let list = getStoredWatchlist();
    const target = list.find(item => Number(item.id) === id);
    const title = target ? (target.title || target.name) : 'Title';

    list = list.filter(item => Number(item.id) !== id);
    saveWatchlist(list);
    showToast(`Removed "${title}" from watchlist`, 'info');
    loadAndRenderWatchlist();
}

function initClearAllButton() {
    const clearBtn = document.getElementById('clear-watchlist-btn');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
        const count = getStoredWatchlist().length;
        if (count === 0) return;

        const confirmClear = window.confirm(`Are you sure you want to remove all ${count} titles from your watchlist?`);
        if (confirmClear) {
            saveWatchlist([]);
            showToast('Watchlist cleared completely', 'info');
            loadAndRenderWatchlist();
        }
    });
}

// ─────────────────────────────────────────────
// NAVBAR & SEARCH UTILITIES
// ─────────────────────────────────────────────

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
                    renderLocalWatchlistSearchResults(query, resultsBox);
                }
            } else {
                renderLocalWatchlistSearchResults(query, resultsBox);
            }
        }, 350);
    });
}

function renderSearchResults(movies, container) {
    if (!movies.length) {
        container.innerHTML = '<div class="no-search-results">No movies found.</div>';
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

function renderLocalWatchlistSearchResults(query, container) {
    const q = query.toLowerCase();
    const stored = getStoredWatchlist();
    const matches = stored.filter(m => (m.title || m.name || '').toLowerCase().includes(q));
    renderSearchResults(matches, container);
}

function initCardImageFallbacks() {
    document.querySelectorAll('.watchlist-poster').forEach(img => {
        img.onerror = function() {
            this.onerror = null;
            this.src = getFallbackPoster(this.alt || 'Movie');
        };
    });
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
    }, 3000);
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
