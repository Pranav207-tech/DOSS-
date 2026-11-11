/**
 * ReelFinder - Discover Page JavaScript
 * Handles the interactive movie preference selection interface (discover.html)
 * Assumes CONFIG, GENRE_IDS, MOOD_GENRE_MAP, LANGUAGE_CODES, RUNTIME_RANGES,
 * tmdb, isAPIKeyConfigured, getImageURL, getFallbackPoster are loaded from config.js and api.js
 */

// ─────────────────────────────────────────────
// 1. STATE MANAGEMENT
// ─────────────────────────────────────────────

const preferences = {
    mood: null,
    genre: null,
    watchTime: null,
    language: 'Any language',
    contentType: 'movies'
};

// Emoji map for preference summary tags
const PREFERENCE_ICONS = {
    mood: '🎭',
    genre: '🎬',
    watchTime: '⏱',
    language: '🌍',
    contentType: '📺'
};

// Content type display labels
const CONTENT_TYPE_LABELS = {
    movies: 'Movies only',
    tv: 'TV Shows only',
    both: 'Movies & TV'
};

// ─────────────────────────────────────────────
// 2. DOM READY
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initDiscover();
});

function initDiscover() {
    initNavbar();
    initMoodSelection();
    initGenreSelection();
    initTimeSelection();
    initLanguageSelection();
    initContentTypeSelection();
    initFindMovieButton();
    initClearFilters();
    loadSavedPreferences();
    updateFindButtonState();
    initSectionReveal();
}

// ─────────────────────────────────────────────
// 3. NAVBAR (mirrors main.js)
// ─────────────────────────────────────────────

function initNavbar() {
    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger-btn') || document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobile-menu') || document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when any nav link is clicked
        const navLinks = mobileMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', false);
            });
        });
    }

    // Add scroll class to navbar
    const navbar = document.querySelector('.navbar') || document.querySelector('nav');
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load
    }
}

// ─────────────────────────────────────────────
// 4. MOOD SELECTION
// ─────────────────────────────────────────────

function initMoodSelection() {
    const moodCards = document.querySelectorAll('.mood-card');
    if (!moodCards.length) return;

    moodCards.forEach(card => {
        card.addEventListener('click', () => {
            const mood = card.dataset.mood || card.getAttribute('data-mood');
            if (!mood) return;

            if (preferences.mood === mood) {
                // Deselect if clicking the same mood
                preferences.mood = null;
                card.classList.remove('selected');
            } else {
                // Deselect previously selected
                moodCards.forEach(c => c.classList.remove('selected'));
                // Select new
                preferences.mood = mood;
                card.classList.add('selected');
                scrollToNextSection(card);
            }

            updateFindButtonState();
        });

        // Keyboard accessibility
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// ─────────────────────────────────────────────
// 5. GENRE SELECTION
// ─────────────────────────────────────────────

function initGenreSelection() {
    const genreBtns = document.querySelectorAll('.genre-btn');
    if (!genreBtns.length) return;

    genreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const genre = btn.dataset.genre || btn.getAttribute('data-genre') || btn.textContent.trim();
            if (!genre) return;

            if (preferences.genre === genre) {
                // Deselect if clicking the same genre
                preferences.genre = null;
                btn.classList.remove('selected');
            } else {
                // Deselect previously selected
                genreBtns.forEach(b => b.classList.remove('selected'));
                // Select new
                preferences.genre = genre;
                btn.classList.add('selected');
                scrollToNextSection(btn);
            }

            updateFindButtonState();
        });

        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// ─────────────────────────────────────────────
// 6. TIME / WATCH TIME SELECTION
// ─────────────────────────────────────────────

function initTimeSelection() {
    const timeCards = document.querySelectorAll('.time-card');
    if (!timeCards.length) return;

    timeCards.forEach(card => {
        card.addEventListener('click', () => {
            const time = card.dataset.time || card.getAttribute('data-time');
            if (!time) return;

            if (preferences.watchTime === time) {
                preferences.watchTime = null;
                card.classList.remove('selected');
            } else {
                timeCards.forEach(c => c.classList.remove('selected'));
                preferences.watchTime = time;
                card.classList.add('selected');
            }

            updateFindButtonState();
        });

        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// ─────────────────────────────────────────────
// 7. LANGUAGE SELECTION
// ─────────────────────────────────────────────

function initLanguageSelection() {
    const langBtns = document.querySelectorAll('.language-btn');
    if (!langBtns.length) return;

    // Ensure default "Any language" is visually selected
    langBtns.forEach(btn => {
        const lang = btn.dataset.language || btn.getAttribute('data-language') || btn.textContent.trim();
        if (lang === 'Any language' || lang === preferences.language) {
            btn.classList.add('selected');
        }
    });

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.language || btn.getAttribute('data-language') || btn.textContent.trim();
            if (!lang) return;

            langBtns.forEach(b => b.classList.remove('selected'));
            preferences.language = lang;
            btn.classList.add('selected');
            updateFindButtonState();
        });

        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// ─────────────────────────────────────────────
// 8. CONTENT TYPE SELECTION
// ─────────────────────────────────────────────

function initContentTypeSelection() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    if (!toggleBtns.length) return;

    // Ensure default is visually selected
    toggleBtns.forEach(btn => {
        const type = btn.dataset.type || btn.getAttribute('data-type');
        if (type === preferences.contentType) {
            btn.classList.add('selected');
        }
    });

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type || btn.getAttribute('data-type');
            if (!type) return;

            toggleBtns.forEach(b => b.classList.remove('selected'));
            preferences.contentType = type;
            btn.classList.add('selected');
            updateFindButtonState();
        });

        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// ─────────────────────────────────────────────
// 9. FIND MOVIE BUTTON
// ─────────────────────────────────────────────

function initFindMovieButton() {
    const btn = document.getElementById('find-movie-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (!preferences.mood && !preferences.genre) {
            showValidationMessage('Please select at least a mood or genre!');
            return;
        }

        // Save preferences to sessionStorage for results page
        sessionStorage.setItem('reelfinder_prefs', JSON.stringify(preferences));

        // Add loading animation to button
        btn.innerHTML = '<span class="spinner"></span> Finding your movies...';
        btn.disabled = true;
        btn.classList.add('loading');

        // Navigate to results page
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 800);
    });
}

// ─────────────────────────────────────────────
// 10. CLEAR FILTERS
// ─────────────────────────────────────────────

function initClearFilters() {
    const btn = document.getElementById('clear-filters-btn');
    if (!btn) return;
    btn.addEventListener('click', clearAllFilters);
}

function clearAllFilters() {
    // Reset preferences object
    preferences.mood = null;
    preferences.genre = null;
    preferences.watchTime = null;
    preferences.language = 'Any language';
    preferences.contentType = 'movies';

    // Remove .selected from all selection elements
    document.querySelectorAll('.mood-card, .genre-btn, .time-card, .language-btn, .toggle-btn')
        .forEach(el => el.classList.remove('selected'));

    // Re-apply defaults for language and content type
    document.querySelectorAll('.language-btn').forEach(btn => {
        const lang = btn.dataset.language || btn.getAttribute('data-language') || btn.textContent.trim();
        if (lang === 'Any language') btn.classList.add('selected');
    });

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        const type = btn.dataset.type || btn.getAttribute('data-type');
        if (type === 'movies') btn.classList.add('selected');
    });

    // Clear sessionStorage entry
    sessionStorage.removeItem('reelfinder_prefs');

    // Update UI
    updateFindButtonState();

    // Visual feedback
    showClearConfirmation();
}

function showClearConfirmation() {
    const btn = document.getElementById('clear-filters-btn');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = '✓ Cleared!';
    btn.classList.add('cleared');
    setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('cleared');
    }, 1500);
}

// ─────────────────────────────────────────────
// 11. UPDATE BUTTON STATE
// ─────────────────────────────────────────────

function updateFindButtonState() {
    const btn = document.getElementById('find-movie-btn');
    if (!btn) return;

    const hasSelection = !!(preferences.mood || preferences.genre);
    btn.classList.toggle('ready', hasSelection);

    // Reset button text if previously in loading state
    if (!btn.disabled) {
        btn.innerHTML = hasSelection
            ? '🎬 Find My Movies'
            : '🎬 Find My Movies';
    }

    updatePreferenceSummary();
}

// ─────────────────────────────────────────────
// 12. PREFERENCE SUMMARY
// ─────────────────────────────────────────────

function updatePreferenceSummary() {
    const summaryEl = document.getElementById('preference-summary');
    if (!summaryEl) return;

    const tags = [];

    if (preferences.mood) {
        tags.push(buildTag('mood', `${PREFERENCE_ICONS.mood} Mood: ${capitalize(preferences.mood)}`));
    }
    if (preferences.genre) {
        tags.push(buildTag('genre', `${PREFERENCE_ICONS.genre} Genre: ${capitalize(preferences.genre)}`));
    }
    if (preferences.watchTime) {
        const timeLabel = getTimeLabel(preferences.watchTime);
        tags.push(buildTag('watchTime', `${PREFERENCE_ICONS.watchTime} Time: ${timeLabel}`));
    }
    if (preferences.language && preferences.language !== 'Any language') {
        tags.push(buildTag('language', `${PREFERENCE_ICONS.language} Language: ${preferences.language}`));
    }
    if (preferences.contentType) {
        const typeLabel = CONTENT_TYPE_LABELS[preferences.contentType] || capitalize(preferences.contentType);
        tags.push(buildTag('contentType', `${PREFERENCE_ICONS.contentType} Type: ${typeLabel}`));
    }

    if (tags.length === 0) {
        summaryEl.innerHTML = '<span class="summary-placeholder">Your selections will appear here…</span>';
        summaryEl.classList.remove('has-tags');
    } else {
        summaryEl.innerHTML = tags.join('');
        summaryEl.classList.add('has-tags');
    }
}

function buildTag(key, label) {
    return `<span class="pref-tag pref-tag--${key}" title="${label}">${label}</span>`;
}

function getTimeLabel(watchTime) {
    // Try to match against RUNTIME_RANGES if available
    if (typeof RUNTIME_RANGES !== 'undefined' && RUNTIME_RANGES[watchTime]) {
        return RUNTIME_RANGES[watchTime].label || watchTime;
    }
    // Fallback labels based on common values
    const fallback = {
        short: 'Under 90 min',
        medium: '90–120 min',
        long: 'Over 2 hours',
        any: 'Any length'
    };
    return fallback[watchTime] || capitalize(watchTime);
}

// ─────────────────────────────────────────────
// 13. LOAD SAVED PREFERENCES
// ─────────────────────────────────────────────

function loadSavedPreferences() {
    // 1. Check URL query parameters (e.g. ?mood=happy or ?genre=Action)
    const urlParams = new URLSearchParams(window.location.search);
    const moodUrl = urlParams.get('mood');
    const genreUrl = urlParams.get('genre');

    if (moodUrl || genreUrl) {
        if (moodUrl) {
            const formattedMood = moodUrl.charAt(0).toUpperCase() + moodUrl.slice(1).toLowerCase();
            preferences.mood = formattedMood;
            const moodCard = document.querySelector(`.mood-card[data-mood="${formattedMood}"]`) ||
                             document.querySelector(`.mood-card[data-mood="${moodUrl}"]`);
            if (moodCard) moodCard.classList.add('selected');
        }
        if (genreUrl) {
            const formattedGenre = genreUrl.charAt(0).toUpperCase() + genreUrl.slice(1);
            preferences.genre = formattedGenre;
            const genreBtn = document.querySelector(`.genre-btn[data-genre="${formattedGenre}"]`) ||
                             document.querySelector(`.genre-btn[data-genre="${genreUrl}"]`);
            if (genreBtn) genreBtn.classList.add('selected');
        }
        updateFindButtonState();
        return;
    }

    const saved = sessionStorage.getItem('reelfinder_prefs');
    if (!saved) return;

    let prefs;
    try {
        prefs = JSON.parse(saved);
    } catch {
        sessionStorage.removeItem('reelfinder_prefs');
        return;
    }

    // Restore mood
    if (prefs.mood) {
        preferences.mood = prefs.mood;
        const moodCard = document.querySelector(`.mood-card[data-mood="${prefs.mood}"]`);
        if (moodCard) moodCard.classList.add('selected');
    }

    // Restore genre
    if (prefs.genre) {
        preferences.genre = prefs.genre;
        const genreBtn = document.querySelector(
            `.genre-btn[data-genre="${prefs.genre}"]`
        );
        if (genreBtn) {
            genreBtn.classList.add('selected');
        } else {
            // Try matching by text content
            document.querySelectorAll('.genre-btn').forEach(btn => {
                if (btn.textContent.trim() === prefs.genre) {
                    btn.classList.add('selected');
                }
            });
        }
    }

    // Restore watch time
    if (prefs.watchTime) {
        preferences.watchTime = prefs.watchTime;
        const timeCard = document.querySelector(`.time-card[data-time="${prefs.watchTime}"]`);
        if (timeCard) timeCard.classList.add('selected');
    }

    // Restore language
    if (prefs.language) {
        preferences.language = prefs.language;
        document.querySelectorAll('.language-btn').forEach(btn => {
            const lang = btn.dataset.language || btn.getAttribute('data-language') || btn.textContent.trim();
            btn.classList.toggle('selected', lang === prefs.language);
        });
    }

    // Restore content type
    if (prefs.contentType) {
        preferences.contentType = prefs.contentType;
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            const type = btn.dataset.type || btn.getAttribute('data-type');
            btn.classList.toggle('selected', type === prefs.contentType);
        });
    }
}

// ─────────────────────────────────────────────
// 14. VALIDATION MESSAGES
// ─────────────────────────────────────────────

function showValidationMessage(message) {
    const btn = document.getElementById('find-movie-btn');
    if (!btn) return;

    // Shake animation
    btn.classList.remove('shake');
    // Trigger reflow to restart animation
    void btn.offsetWidth;
    btn.classList.add('shake');

    // Remove shake class after animation completes
    btn.addEventListener('animationend', () => btn.classList.remove('shake'), { once: true });

    // Show tooltip / message below button
    let tooltip = document.getElementById('validation-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'validation-tooltip';
        tooltip.className = 'validation-tooltip';
        btn.parentNode.insertBefore(tooltip, btn.nextSibling);
    }

    tooltip.textContent = message;
    tooltip.classList.add('visible');

    // Auto-hide after 3 seconds
    clearTimeout(tooltip._hideTimer);
    tooltip._hideTimer = setTimeout(() => {
        tooltip.classList.remove('visible');
    }, 3000);
}

// ─────────────────────────────────────────────
// 15. SECTION SCROLL & REVEAL
// ─────────────────────────────────────────────

function scrollToNextSection(triggerElement) {
    const currentSection = triggerElement.closest('section') || triggerElement.closest('[data-section]');
    if (!currentSection) return;

    const allSections = Array.from(document.querySelectorAll('section, [data-section]'));
    const currentIndex = allSections.indexOf(currentSection);
    const nextSection = allSections[currentIndex + 1];

    if (nextSection) {
        setTimeout(() => {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

function initSectionReveal() {
    const sections = document.querySelectorAll('.discover-section, .preference-section, section');
    if (!sections.length) return;

    // Use IntersectionObserver for reveal animations
    if (!('IntersectionObserver' in window)) {
        // Fallback: show all immediately
        sections.forEach(s => s.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    sections.forEach((section, index) => {
        // Stagger the initial reveal so sections animate in sequence
        section.style.transitionDelay = `${index * 60}ms`;
        observer.observe(section);
    });
}

// ─────────────────────────────────────────────
// 16. UTILITY HELPERS
// ─────────────────────────────────────────────

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ─────────────────────────────────────────────
// EXPORTED / GLOBAL HELPERS (for inline onclick if needed)
// ─────────────────────────────────────────────

window.ReelFinder = window.ReelFinder || {};
window.ReelFinder.discover = {
    preferences,
    clearAllFilters,
    updateFindButtonState,
    updatePreferenceSummary
};
