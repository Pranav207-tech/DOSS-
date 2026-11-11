// ============================================================
// ReelFinder - Configuration File
// ============================================================
// IMPORTANT: Replace the placeholder below with your actual
// TMDB API key. Get a free key at: https://www.themoviedb.org/settings/api
//
// Steps to get your API key:
//   1. Go to https://www.themoviedb.org/
//   2. Create a free account
//   3. Go to Settings > API
//   4. Request an API key (choose "Developer")
//   5. Copy your API key (v3 auth) and paste it below
// ============================================================

const CONFIG = {
    // ⚠️  REPLACE THIS WITH YOUR TMDB API KEY ⚠️
    TMDB_API_KEY: 'YOUR_TMDB_API_KEY_HERE',

    // TMDB Base URLs
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',

    // Image sizes
    POSTER_SIZE: 'w500',
    BACKDROP_SIZE: 'w1280',
    THUMBNAIL_SIZE: 'w185',

    // App settings
    APP_NAME: 'ReelFinder',
    APP_VERSION: '1.0.0',
    RESULTS_PER_PAGE: 20,
    MAX_RESULTS: 40,

    // LocalStorage keys
    STORAGE_KEYS: {
        WATCHLIST: 'reelfinder_watchlist',
        PREFERENCES: 'reelfinder_preferences',
        SEARCH_HISTORY: 'reelfinder_search_history'
    }
};

// TMDB Genre IDs mapping
const GENRE_IDS = {
    'Action': 28,
    'Adventure': 12,
    'Animation': 16,
    'Comedy': 35,
    'Crime': 80,
    'Documentary': 99,
    'Drama': 18,
    'Family': 10751,
    'Fantasy': 14,
    'History': 36,
    'Horror': 27,
    'Music': 10402,
    'Mystery': 9648,
    'Romance': 10749,
    'Science Fiction': 878,
    'Thriller': 53,
    'War': 10752,
    'Western': 37,
    'TV Movie': 10770
};

// Mood to Genre mapping for recommendations
const MOOD_GENRE_MAP = {
    'Happy': [35, 16, 10751, 10402],          // Comedy, Animation, Family, Music
    'Sad': [18, 10749, 36],                    // Drama, Romance, History
    'Romantic': [10749, 18, 35],               // Romance, Drama, Comedy
    'Excited': [28, 12, 14, 878],              // Action, Adventure, Fantasy, Sci-Fi
    'Suspenseful': [53, 9648, 27, 80],         // Thriller, Mystery, Horror, Crime
    'Relaxed': [35, 10751, 16, 10402],         // Comedy, Family, Animation, Music
    'Adventurous': [12, 14, 28, 878],          // Adventure, Fantasy, Action, Sci-Fi
    'Thoughtful': [18, 9648, 878, 99]          // Drama, Mystery, Sci-Fi, Documentary
};

// Language code mapping for TMDB
const LANGUAGE_CODES = {
    'English': 'en',
    'Tamil': 'ta',
    'Hindi': 'hi',
    'Telugu': 'te',
    'Malayalam': 'ml',
    'Korean': 'ko',
    'Any language': null
};

// Runtime range mapping
const RUNTIME_RANGES = {
    'Under 90 minutes': { min: 0, max: 90 },
    '90–120 minutes': { min: 90, max: 120 },
    '120–150 minutes': { min: 120, max: 150 },
    'More than 150 minutes': { min: 150, max: 999 }
};

// Check if API key is configured
function isAPIKeyConfigured() {
    return CONFIG.TMDB_API_KEY && 
           CONFIG.TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE' && 
           CONFIG.TMDB_API_KEY.length > 10;
}

// Get image URL
function getImageURL(path, size = CONFIG.POSTER_SIZE) {
    if (!path) return null;
    return `${CONFIG.TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

// Fallback poster SVG (shown when image is unavailable)
function getFallbackPoster(title = '') {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
            <rect width="300" height="450" fill="#1a1a2e"/>
            <rect x="20" y="20" width="260" height="410" fill="none" stroke="#6c3fc5" stroke-width="2" rx="8"/>
            <circle cx="150" cy="160" r="50" fill="#6c3fc5" opacity="0.3"/>
            <text x="150" y="168" font-family="Arial,sans-serif" font-size="40" fill="#6c3fc5" text-anchor="middle" opacity="0.7">🎬</text>
            <text x="150" y="260" font-family="Arial,sans-serif" font-size="14" fill="#8888aa" text-anchor="middle">No Poster</text>
            <text x="150" y="285" font-family="Arial,sans-serif" font-size="11" fill="#6666aa" text-anchor="middle">Available</text>
        </svg>
    `)}`;
}

