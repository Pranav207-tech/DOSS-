/**
 * ReelFinder - Recommendation Engine & Results Controller
 * Implements rule-based movie recommendations matching mood, genre,
 * runtime, language, and content type.
 */

// ─────────────────────────────────────────────
// STATE & GLOBALS
// ─────────────────────────────────────────────

let currentMovies = [];
let alternativeMovies = [];
let preferences = {};
let currentSort = 'rating';
let genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

// Rich sample movie catalog with accurate runtimes & genres for offline / API fallback
const EXPANDED_SAMPLE_MOVIES = [
    {
        id: 550, title: "Fight Club", release_date: "1999-10-15",
        vote_average: 8.4, vote_count: 27000, genre_ids: [18, 53], runtime: 139,
        overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", original_language: "en"
    },
    {
        id: 278, title: "The Shawshank Redemption", release_date: "1994-09-23",
        vote_average: 8.7, vote_count: 26000, genre_ids: [18, 80], runtime: 142,
        overview: "Framed in the 1940s for double murder, upstanding banker Andy Dufresne begins a new life at Shawshank prison where his quiet determination inspires hope.",
        poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg", original_language: "en"
    },
    {
        id: 157336, title: "Interstellar", release_date: "2014-11-05",
        vote_average: 8.4, vote_count: 34000, genre_ids: [878, 12, 18], runtime: 169,
        overview: "A team of explorers travel through a newly discovered wormhole in space to surpass human limitations and ensure mankind's survival.",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg", original_language: "en"
    },
    {
        id: 27205, title: "Inception", release_date: "2010-07-15",
        vote_average: 8.4, vote_count: 36000, genre_ids: [28, 878, 12], runtime: 148,
        overview: "Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given an inverse task: planting an idea into the mind of a CEO.",
        poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", original_language: "en"
    },
    {
        id: 129, title: "Spirited Away", release_date: "2001-07-20",
        vote_average: 8.5, vote_count: 16000, genre_ids: [16, 10751, 14], runtime: 125,
        overview: "A young girl wanders into a strange magical realm of spirits, witches, and gods, where humans are transformed into beasts and she must work to free her parents.",
        poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", backdrop_path: "/bXNvzjYE9rvBA2wh4m7v5V9P799.jpg", original_language: "ja"
    },
    {
        id: 493529, title: "Dungeons & Dragons: Honor Among Thieves", release_date: "2023-03-23",
        vote_average: 7.4, vote_count: 3200, genre_ids: [12, 35, 14], runtime: 134,
        overview: "A charming thief and a band of unlikely adventurers embark on an epic heist to retrieve a lost relic, but things go dangerously awry when they cross the wrong people.",
        poster_path: "/A7cvAH1U5SZB3LhglSg4g651d6S.jpg", backdrop_path: "/a7lb6L980Qc6i9lT7O7G316v7bK.jpg", original_language: "en"
    },
    {
        id: 862, title: "Toy Story", release_date: "1995-10-30",
        vote_average: 8.0, vote_count: 18000, genre_ids: [16, 35, 10751], runtime: 81,
        overview: "Led by Woody, Andy's toys live happily until Andy gets Buzz Lightyear. When both toys become lost, they must work together to find their way home.",
        poster_path: "/uXDfjJbdP4ijW5hWSBrFuVJTkab.jpg", backdrop_path: "/lxD5ak7BOxneaQ8NzcJa2gUMPP1.jpg", original_language: "en"
    },
    {
        id: 77338, title: "The Intouchables", release_date: "2011-11-02",
        vote_average: 8.3, vote_count: 17000, genre_ids: [18, 35], runtime: 112,
        overview: "An unlikely friendship develops between a wealthy quadriplegic aristocrat and a young man from the housing projects hired as his caregiver.",
        poster_path: "/1QU0pX764uV8W2263L2rA0Xl77c.jpg", backdrop_path: "/qU6W2k1k2kQ6u821u0s192s88.jpg", original_language: "fr"
    },
    {
        id: 313369, title: "La La Land", release_date: "2016-11-29",
        vote_average: 7.9, vote_count: 16000, genre_ids: [35, 18, 10749, 10402], runtime: 128,
        overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, struggle to make ends meet in a city known for crushing hopes and breaking hearts.",
        poster_path: "/uDO8zWDdoWNzAcSkzOP4vFTmcfn.jpg", backdrop_path: "/qJeU7KM4nR7v56aX1j94WvH2i8r.jpg", original_language: "en"
    },
    {
        id: 372058, title: "Your Name.", release_date: "2016-08-26",
        vote_average: 8.5, vote_count: 11000, genre_ids: [16, 10749, 18], runtime: 107,
        overview: "High schoolers Mitsuha and Taki are complete strangers living separate lives until they suddenly begin switching bodies across time and space.",
        poster_path: "/q719jXXEzvLnKi3VumS2VHgOL4b.jpg", backdrop_path: "/7b53xWj6cR7t7g0pQ6G867B4mN7.jpg", original_language: "ja"
    },
    {
        id: 429, title: "The Good, the Bad and the Ugly", release_date: "1966-12-23",
        vote_average: 8.5, vote_count: 8200, genre_ids: [37], runtime: 161,
        overview: "During the Civil War, three men search for a buried cache of Confederate gold amid chaos, desert heat, and violent double-crosses.",
        poster_path: "/bX2TxqnBhUTCOAcAp4bTsmHG6Mm.jpg", backdrop_path: "/eoCQUZvflq1iqmC0U8tPdQfN0vU.jpg", original_language: "it"
    },
    {
        id: 496243, title: "Parasite", release_date: "2019-05-30",
        vote_average: 8.5, vote_count: 17500, genre_ids: [35, 53, 18], runtime: 132,
        overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
        poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdrop_path: "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg", original_language: "ko"
    },
    {
        id: 155, title: "The Dark Knight", release_date: "2008-07-16",
        vote_average: 8.5, vote_count: 32000, genre_ids: [18, 28, 80, 53], runtime: 152,
        overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, he sets out to dismantle the remaining criminal organizations that plague the city.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", original_language: "en"
    },
    {
        id: 1124, title: "The Prestige", release_date: "2006-10-19",
        vote_average: 8.2, vote_count: 15500, genre_ids: [18, 9648, 878], runtime: 130,
        overview: "A mysterious story of two magicians whose intense rivalry leads them on a life-long battle for supremacy -- full of obsession, deceit, and deadly consequences.",
        poster_path: "/bdN3gEYLpcU1Rvd8BfO6pZ6sB9z.jpg", backdrop_path: "/meRQL2gE7Q1dE4mE5sV1wA3Q2B7.jpg", original_language: "en"
    },
    {
        id: 769, title: "GoodFellas", release_date: "1990-09-12",
        vote_average: 8.5, vote_count: 12500, genre_ids: [18, 80], runtime: 145,
        overview: "The true story of Henry Hill, a half-Irish, half-Sicilian boy in Brooklyn who is adopted by neighbourhood gangsters and climbs through the mob ranks.",
        poster_path: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", backdrop_path: "/sw7mordbZxgITU877yTp0GeYjTk.jpg", original_language: "en"
    },
    {
        id: 508442, title: "Soul", release_date: "2020-12-25",
        vote_average: 8.1, vote_count: 10200, genre_ids: [16, 35, 18, 10751], runtime: 100,
        overview: "Joe Gardner is a middle school teacher with a passion for jazz music. After a successful gig at the Half Note Club, an accident leads his soul to separate from his body.",
        poster_path: "/hm58Jw4Lw8OIYECBhNTx8KaQvpH.jpg", backdrop_path: "/kf456ZqeC35SVsq9huipA4TaSiO.jpg", original_language: "en"
    },
    {
        id: 530915, title: "1917", release_date: "2019-12-25",
        vote_average: 7.9, vote_count: 12000, genre_ids: [10752, 28, 18], runtime: 119,
        overview: "At the height of the First World War, two young British soldiers are given a seemingly impossible mission: deliver a message deep in enemy territory to stop 1,600 men from walking into a deadly trap.",
        poster_path: "/iZf0KyrE25z1sage4SYFLG68vbt.jpg", backdrop_path: "/2WjKA9qWq1I5nI9A7P7a4h7bL.jpg", original_language: "en"
    },
    {
        id: 244786, title: "Whiplash", release_date: "2014-10-10",
        vote_average: 8.4, vote_count: 14800, genre_ids: [18, 10402], runtime: 107,
        overview: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost.",
        poster_path: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg", backdrop_path: "/fRGxZuo7jyp0RjXo1lM3q7G3A3e.jpg", original_language: "en"
    },
    {
        id: 13, title: "Forrest Gump", release_date: "1994-06-23",
        vote_average: 8.5, vote_count: 27000, genre_ids: [35, 18, 10749], runtime: 142,
        overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events -- in each case, far exceeding what anyone imagined he could do.",
        poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", backdrop_path: "/qdIMwi0vdKQMy6Tbm8DYUMfd7T.jpg", original_language: "en"
    },
    {
        id: 389, title: "12 Angry Men", release_date: "1957-04-10",
        vote_average: 8.5, vote_count: 8500, genre_ids: [18], runtime: 96,
        overview: "The defense and the prosecution have rested and the jury is filing into the jury room to decide if a young Spanish-American is guilty or innocent of murdering his father.",
        poster_path: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg", backdrop_path: "/qqHQsStV6Z9uh0wwY2WvPwbk7j9.jpg", original_language: "en"
    },
    {
        id: 8587, title: "The Lion King", release_date: "1994-06-23",
        vote_average: 8.3, vote_count: 17800, genre_ids: [16, 10751, 18], runtime: 89,
        overview: "A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While the uncle rules with an iron paw, the prince grows beyond his savannah borders.",
        poster_path: "/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg", backdrop_path: "/7c9UVPPiTPltouxSh26Uj3jGkQZ.jpg", original_language: "en"
    },
    {
        id: 19404, title: "Dilwale Dulhania Le Jayenge", release_date: "1995-10-20",
        vote_average: 8.5, vote_count: 4400, genre_ids: [35, 18, 10749], runtime: 189,
        overview: "Raj is a rich, carefree boy who falls in love with Simran on a European trip. Simran's strict father has already arranged her marriage in India, prompting Raj to win over her family.",
        poster_path: "/2CAL2433ZeIihfX1Hb2139CX0pW.jpg", backdrop_path: "/90A8JqQk07aGvK0H5r2C1f6jN9L.jpg", original_language: "hi"
    },
    {
        id: 260514, title: "Baahubali: The Beginning", release_date: "2015-07-10",
        vote_average: 7.6, vote_count: 1200, genre_ids: [28, 12, 18], runtime: 159,
        overview: "In ancient India, an adventurous and daring man becomes involved in a decades-long feud between two warring factions of the Mahishmati royal family.",
        poster_path: "/9FlkLhKqj0Y1uA5gQk8TqHk2v8M.jpg", backdrop_path: "/ba1Gk00y5uC9A78xL7W2V9Q41Jp.jpg", original_language: "te"
    },
    {
        id: 489999, title: "Super Deluxe", release_date: "2019-03-29",
        vote_average: 7.9, vote_count: 320, genre_ids: [53, 18, 80], runtime: 176,
        overview: "An unfaithful wife, an estranged father, a priest and a curious teenager: each faces their most unexpected predicament in one bizarre, fateful day in Chennai.",
        poster_path: "/vjD6JgWbO2XjZ38u1j7wY3v4k3a.jpg", backdrop_path: "/p0sK7qC4k8bY5xH7W3V8z1L4B9A.jpg", original_language: "ta"
    },
    {
        id: 843241, title: "Minnal Murali", release_date: "2021-12-24",
        vote_average: 7.7, vote_count: 380, genre_ids: [28, 35, 14], runtime: 158,
        overview: "A small-town tailor gains special superhero powers after being struck by lightning, but must take down an unexpected foe if he is to become the saviour his village needs.",
        poster_path: "/bT2459PDbld2wJ5c66G7R3b5X7p.jpg", backdrop_path: "/vF5V8C7Y2B5G7J9X2W1q3P5z7H9.jpg", original_language: "ml"
    }
];

// ─────────────────────────────────────────────
// DOM READY & INITIALIZATION
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initResultsPage();
});

async function initResultsPage() {
    initNavbar();
    initSearch();
    loadPreferences();
    renderPreferencesDisplay();
    initSortControls();
    await loadTMDBGenreList();
    await fetchAndProcessRecommendations();
}

// ─────────────────────────────────────────────
// PREFERENCES RETRIEVAL & DISPLAY
// ─────────────────────────────────────────────

function loadPreferences() {
    // 1. First check URL parameters if discover page redirected with params
    const urlParams = new URLSearchParams(window.location.search);
    const moodParam = urlParams.get('mood');
    const genreParam = urlParams.get('genre');
    const timeParam = urlParams.get('time');
    const langParam = urlParams.get('lang');
    const typeParam = urlParams.get('type');

    if (moodParam || genreParam) {
        preferences = {
            mood: moodParam || null,
            genre: genreParam || null,
            watchTime: timeParam || null,
            language: langParam || 'Any language',
            contentType: typeParam || 'movies'
        };
        sessionStorage.setItem('reelfinder_prefs', JSON.stringify(preferences));
        return;
    }

    // 2. Read from sessionStorage
    const saved = sessionStorage.getItem('reelfinder_prefs');
    if (saved) {
        try {
            preferences = JSON.parse(saved);
            return;
        } catch (e) {
            console.warn('Failed to parse saved preferences:', e);
        }
    }

    // 3. Fallback default so results page never breaks
    preferences = {
        mood: 'Excited',
        genre: 'Action',
        watchTime: null,
        language: 'Any language',
        contentType: 'movies'
    };
}

function renderPreferencesDisplay() {
    const container = document.getElementById('preferences-display');
    const heading = document.getElementById('results-heading');
    const subtitle = document.getElementById('results-subtitle');

    if (!container) return;

    // Dynamic heading
    if (preferences.mood && preferences.genre) {
        heading.innerHTML = `Movies for a <span class="gradient-text">${preferences.mood}</span> Mood &amp; <span class="gradient-text">${preferences.genre}</span>`;
    } else if (preferences.mood) {
        heading.innerHTML = `Movies Curated for Your <span class="gradient-text">${preferences.mood}</span> Mood`;
    } else if (preferences.genre) {
        heading.innerHTML = `Top Rated <span class="gradient-text">${preferences.genre}</span> Recommendations`;
    } else {
        heading.textContent = 'Curated Movie Recommendations';
    }

    if (preferences.watchTime) {
        subtitle.textContent = `Optimized for ${preferences.watchTime} of watching time.`;
    }

    const tags = [];
    if (preferences.mood) {
        tags.push(`<span class="pref-chip">🎭 Mood: <strong>${escapeHTML(preferences.mood)}</strong></span>`);
    }
    if (preferences.genre) {
        tags.push(`<span class="pref-chip">🎬 Genre: <strong>${escapeHTML(preferences.genre)}</strong></span>`);
    }
    if (preferences.watchTime) {
        tags.push(`<span class="pref-chip">⏱ Time: <strong>${escapeHTML(preferences.watchTime)}</strong></span>`);
    }
    if (preferences.language && preferences.language !== 'Any language') {
        tags.push(`<span class="pref-chip">🌍 Language: <strong>${escapeHTML(preferences.language)}</strong></span>`);
    }
    if (preferences.contentType) {
        const typeLabels = { movies: 'Movies only', tv: 'TV series only', both: 'Movies & TV' };
        tags.push(`<span class="pref-chip">📺 Type: <strong>${typeLabels[preferences.contentType] || preferences.contentType}</strong></span>`);
    }

    container.innerHTML = tags.join('');
}

// ─────────────────────────────────────────────
// GENRE MAP LOADING
// ─────────────────────────────────────────────

async function loadTMDBGenreList() {
    if (!isAPIKeyConfigured()) return;
    try {
        const res = await tmdb.getGenres();
        if (res && res.genres) {
            res.genres.forEach(g => {
                genreMap[g.id] = g.name;
            });
        }
    } catch (e) {
        console.warn('Could not load remote genres, using local map', e);
    }
}

// ─────────────────────────────────────────────
// RECOMMENDATION ALGORITHM (RULE-BASED)
// ─────────────────────────────────────────────

async function fetchAndProcessRecommendations() {
    showLoading();

    try {
        let pool = [];
        let isRemote = false;

        if (isAPIKeyConfigured()) {
            try {
                pool = await fetchCandidateMoviesFromTMDB();
                isRemote = true;
            } catch (err) {
                console.warn('TMDB API request failed, falling back to local dataset', err);
                showAPIKeyBanner('API connection error. Displaying verified curated catalog.');
                pool = [...EXPANDED_SAMPLE_MOVIES];
            }
        } else {
            showAPIKeyBanner('No TMDB API key detected. Showing curated demonstration catalog.');
            pool = [...EXPANDED_SAMPLE_MOVIES];
        }

        // Apply Rule-Based Scoring Engine
        const scoredMovies = pool.map(movie => {
            const scoreDetails = calculateRecommendationScore(movie, preferences);
            return {
                ...movie,
                _score: scoreDetails.score,
                _matchReasons: scoreDetails.reasons
            };
        });

        // Split into exact matches & alternatives
        let matching = applyStrictFilters(scoredMovies, preferences);

        // If strict filtering gives too few results, relax filters but sort by relevance
        if (matching.length < 3) {
            alternativeMovies = scoredMovies
                .filter(m => !matching.some(match => match.id === m.id))
                .sort((a, b) => b._score - a._score)
                .slice(0, 6);
        } else {
            alternativeMovies = [];
        }

        // Final sorting
        currentMovies = sortMovieList(matching, currentSort);

        // Display results
        renderResults(currentMovies, alternativeMovies);
        renderMatchReason(preferences);

    } catch (error) {
        console.error('Recommendation process failed:', error);
        showErrorState();
    }
}

/**
 * Fetch candidate movies from TMDB API
 */
async function fetchCandidateMoviesFromTMDB() {
    const params = tmdb.buildDiscoverParams(preferences);
    const promises = [
        tmdb.discoverMovies({ ...params, page: 1 }),
        tmdb.discoverMovies({ ...params, page: 2 })
    ];

    if (preferences.contentType === 'tv' || preferences.contentType === 'both') {
        const tvParams = { ...params };
        delete tvParams['with_runtime.gte'];
        delete tvParams['with_runtime.lte'];
        promises.push(tmdb.discoverTV({ ...tvParams, page: 1 }));
    }

    const responses = await Promise.all(promises);
    let aggregated = [];

    responses.forEach((resp, index) => {
        if (resp && resp.results) {
            const isTV = index === 2 || preferences.contentType === 'tv';
            resp.results.forEach(item => {
                if (isTV) item._mediaType = 'tv';
                aggregated.push(item);
            });
        }
    });

    // Remove duplicates
    const seen = new Set();
    const unique = aggregated.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });

    // For movies where runtime is missing, fetch brief detail for top candidates
    const topBatch = unique.slice(0, 12);
    await Promise.all(
        topBatch.map(async m => {
            if (!m.runtime && m._mediaType !== 'tv') {
                try {
                    const detail = await tmdb.getMovieDetails(m.id);
                    if (detail && detail.runtime) {
                        m.runtime = detail.runtime;
                    }
                } catch {
                    // Ignore runtime fetch errors
                }
            }
        })
    );

    return unique;
}

/**
 * Rule-based recommendation scoring system:
 * 1. Base score from TMDB rating (0 - 100 points)
 * 2. Mood compatibility bonus (+20 to +40 points per matching genre)
 * 3. User genre bonus (+35 points)
 * 4. Runtime proximity bonus (+30 points)
 * 5. Language compatibility (+25 points)
 */
function calculateRecommendationScore(movie, prefs) {
    let score = 0;
    const reasons = [];

    // 1. Rating Foundation (0 - 85)
    const rating = movie.vote_average || 7.0;
    score += rating * 8.5;

    // 2. Mood Resonance
    if (prefs.mood && MOOD_GENRE_MAP[prefs.mood]) {
        const targetGenres = MOOD_GENRE_MAP[prefs.mood];
        const movieGenres = movie.genre_ids || [];
        const matchingMoodGenres = movieGenres.filter(g => targetGenres.includes(g));

        if (matchingMoodGenres.length > 0) {
            score += matchingMoodGenres.length * 20;
            const names = matchingMoodGenres.map(id => genreMap[id] || '').filter(Boolean);
            reasons.push(`Resonates with your ${prefs.mood} mood via ${names.join(' & ')} tones`);
        }
    }

    // 3. Explicit Genre Preference
    if (prefs.genre && GENRE_IDS[prefs.genre]) {
        const targetGenreId = GENRE_IDS[prefs.genre];
        if ((movie.genre_ids || []).includes(targetGenreId)) {
            score += 35;
            reasons.push(`Direct match for ${prefs.genre}`);
        }
    }

    // 4. Runtime Fit
    if (prefs.watchTime && RUNTIME_RANGES[prefs.watchTime]) {
        const range = RUNTIME_RANGES[prefs.watchTime];
        const runtime = movie.runtime || 110;
        if (runtime >= range.min && runtime <= range.max) {
            score += 30;
            reasons.push(`Perfect runtime fit (${runtime} min within your ${prefs.watchTime} target)`);
        } else if (runtime >= range.min - 15 && runtime <= range.max + 15) {
            score += 15;
            reasons.push(`Close runtime proximity (${runtime} min)`);
        }
    }

    // 5. Language Fit
    if (prefs.language && prefs.language !== 'Any language') {
        const targetLang = LANGUAGE_CODES[prefs.language];
        if (movie.original_language === targetLang) {
            score += 25;
            reasons.push(`Original language: ${prefs.language}`);
        }
    }

    return { score, reasons };
}

/**
 * Filter pool according to hard constraints (with graceful fallback)
 */
function applyStrictFilters(movies, prefs) {
    let filtered = [...movies];

    // Language constraint
    if (prefs.language && prefs.language !== 'Any language') {
        const code = LANGUAGE_CODES[prefs.language];
        const langMatches = filtered.filter(m => m.original_language === code);
        if (langMatches.length > 0) {
            filtered = langMatches;
        }
    }

    // Runtime constraint
    if (prefs.watchTime && RUNTIME_RANGES[prefs.watchTime]) {
        const range = RUNTIME_RANGES[prefs.watchTime];
        const timeMatches = filtered.filter(m => {
            const rt = m.runtime;
            if (!rt) return true; // Keep unknown if pool is small
            return rt >= range.min && rt <= range.max;
        });

        // Only enforce strictly if we have enough matching candidates
        if (timeMatches.length >= 2) {
            filtered = timeMatches;
        } else {
            // Soft runtime boundary (+/- 25 min)
            const softMatches = filtered.filter(m => {
                const rt = m.runtime;
                if (!rt) return true;
                return rt >= Math.max(0, range.min - 25) && rt <= range.max + 35;
            });
            if (softMatches.length > 0) {
                filtered = softMatches;
            }
        }
    }

    // Genre constraint if specified
    if (prefs.genre && GENRE_IDS[prefs.genre]) {
        const gId = GENRE_IDS[prefs.genre];
        const genreMatches = filtered.filter(m => (m.genre_ids || []).includes(gId));
        if (genreMatches.length >= 2) {
            filtered = genreMatches;
        }
    }

    return filtered;
}

/**
 * Sorting dispatcher
 */
function sortMovieList(movies, criteria) {
    const list = [...movies];
    switch (criteria) {
        case 'rating':
            return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        case 'newest':
            return list.sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01');
                const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01');
                return dateB - dateA;
            });
        case 'runtime':
            return list.sort((a, b) => {
                const rtA = a.runtime || 999;
                const rtB = b.runtime || 999;
                return rtA - rtB;
            });
        default:
            return list.sort((a, b) => (b._score || 0) - (a._score || 0));
    }
}

// ─────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────

function renderResults(movies, alternatives = []) {
    const grid = document.getElementById('results-grid');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');
    const visibleCount = document.getElementById('visible-count');
    const altSection = document.getElementById('alternatives-section');
    const altGrid = document.getElementById('alternatives-grid');

    if (!grid) return;

    if (!movies || movies.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        if (resultsCount) resultsCount.textContent = '0 movies found';
        if (visibleCount) visibleCount.textContent = '0';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    if (resultsCount) resultsCount.textContent = `${movies.length} movies curated`;
    if (visibleCount) visibleCount.textContent = movies.length.toString();

    // Render primary result cards
    grid.innerHTML = movies.map(movie => createResultCard(movie)).join('');

    // Render alternatives if available
    if (alternatives && alternatives.length > 0 && altSection && altGrid) {
        altSection.style.display = 'block';
        altGrid.innerHTML = alternatives.map(movie => createResultCard(movie)).join('');
    } else if (altSection) {
        altSection.style.display = 'none';
    }

    initWatchlistButtons();
    initFallbackImages();
}

function createResultCard(movie) {
    const title = movie.title || movie.name || 'Untitled Film';
    const year = movie.release_date ? movie.release_date.substring(0, 4) : (movie.first_air_date ? movie.first_air_date.substring(0, 4) : 'N/A');
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '7.5';
    const runtimeText = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : (movie._mediaType === 'tv' ? 'Series' : 'Feature');
    const overview = movie.overview ? truncate(movie.overview, 160) : 'An engaging cinematic story crafted to entertain and inspire.';
    const type = movie._mediaType || 'movie';
    const inWatchlist = isInWatchlist(movie.id);

    // Genres
    const genres = (movie.genre_ids || [])
        .slice(0, 3)
        .map(id => genreMap[id])
        .filter(Boolean);

    // Image URL
    const posterUrl = movie.poster_path ? getImageURL(movie.poster_path, 'w500') : getFallbackPoster(title);

    // First match reason if available
    const matchTag = movie._matchReasons && movie._matchReasons.length > 0
        ? `<div class="match-tag">✨ ${escapeHTML(movie._matchReasons[0])}</div>`
        : '';

    return `
        <article class="result-card" data-movie-id="${movie.id}">
            <div class="result-poster-wrap">
                <img 
                    class="result-poster" 
                    src="${posterUrl}" 
                    alt="${escapeHTML(title)}"
                    loading="lazy"
                    onerror="this.src='${getFallbackPoster(title)}'"
                >
                <span class="rating-badge">⭐ ${rating}</span>
            </div>

            <div class="result-content">
                <div class="result-header">
                    <h2 class="result-title">
                        <a href="details.html?id=${movie.id}&type=${type}">${escapeHTML(title)}</a>
                    </h2>
                    <span class="result-year">${year}</span>
                </div>

                <div class="result-meta-row">
                    <span class="meta-item runtime-badge">⏱ ${runtimeText}</span>
                    <span class="meta-item lang-badge">🌍 ${movie.original_language ? movie.original_language.toUpperCase() : 'EN'}</span>
                    <span class="meta-item format-badge">${type === 'tv' ? '📺 TV Series' : '🎬 Movie'}</span>
                </div>

                ${matchTag}

                <div class="result-genres">
                    ${genres.map(g => `<span class="genre-tag">${escapeHTML(g)}</span>`).join('')}
                </div>

                <p class="result-overview">${escapeHTML(overview)}</p>

                <div class="result-actions">
                    <button 
                        type="button" 
                        class="btn-watchlist ${inWatchlist ? 'in-watchlist' : ''}" 
                        data-movie-id="${movie.id}"
                        aria-pressed="${inWatchlist}"
                        aria-label="Add to watchlist"
                    >
                        ${inWatchlist ? '❤️ In Watchlist' : '🤍 Add to Watchlist'}
                    </button>
                    <a href="details.html?id=${movie.id}&type=${type}" class="btn-details">
                        View Details →
                    </a>
                </div>
            </div>
        </article>
    `;
}

function renderMatchReason(prefs) {
    const reasonBox = document.getElementById('match-reason');
    const reasonTitle = document.getElementById('reason-title');
    const reasonDesc = document.getElementById('reason-desc');

    if (!reasonBox || (!prefs.mood && !prefs.genre)) {
        if (reasonBox) reasonBox.style.display = 'none';
        return;
    }

    const descriptions = {
        Happy: "We emphasized upbeat comedies, vibrant animation, and light-hearted family adventures with high feel-good ratings.",
        Sad: "Curated poignant dramas, heartfelt romances, and deeply moving stories meant for an emotional and cathartic watch.",
        Romantic: "Selected passionate love stories and charming romantic comedies with exceptional chemistry and warm aesthetics.",
        Excited: "Loaded with high-octane action set-pieces, thrilling adventures, and dynamic pacing to keep your adrenaline pumping.",
        Suspenseful: "Ranked high-tension mystery thrillers, psychological puzzles, and edge-of-your-seat nail-biters with gripping twists.",
        Relaxed: "Filtered for gentle narratives, comforting comedy, and low-conflict feel-good films to help you unwind effortlessly.",
        Adventurous: "Selected sweeping exploratory epics, fantastical quests, and boundless journeys across uncharted territories.",
        Thoughtful: "Handpicked mind-bending sci-fi, philosophical narratives, and intelligent mysteries that linger long after the credits."
    };

    reasonBox.style.display = 'flex';
    reasonTitle.textContent = prefs.mood ? `Why these fit your ${prefs.mood} mood` : `Why these match ${prefs.genre}`;
    reasonDesc.textContent = (prefs.mood && descriptions[prefs.mood])
        ? `${descriptions[prefs.mood]} Every film has been screened against your ${prefs.watchTime || 'desired'} time allowance.`
        : `Selected based on high audience acclaim, genre resonance, and optimal pacing.`;
}

// ─────────────────────────────────────────────
// SORT CONTROLS
// ─────────────────────────────────────────────

function initSortControls() {
    const buttons = document.querySelectorAll('.sort-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;

            currentMovies = sortMovieList(currentMovies, currentSort);
            renderResults(currentMovies, alternativeMovies);
        });
    });

    const popularBtn = document.getElementById('btn-show-popular');
    if (popularBtn) {
        popularBtn.addEventListener('click', () => {
            preferences = { mood: null, genre: null, watchTime: null, language: 'Any language', contentType: 'movies' };
            fetchAndProcessRecommendations();
        });
    }
}

// ─────────────────────────────────────────────
// WATCHLIST INTERACTION
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
    const list = getWatchlist();
    return list.some(item => Number(item.id) === Number(id));
}

function toggleWatchlistMovie(movieData) {
    let list = getWatchlist();
    const id = Number(movieData.id);
    const existingIndex = list.findIndex(item => Number(item.id) === id);

    if (existingIndex >= 0) {
        list.splice(existingIndex, 1);
        localStorage.setItem(CONFIG.STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
        updateWatchlistBadge();
        showToast(`Removed "${movieData.title || movieData.name}" from your Watchlist`, 'info');
        return false;
    } else {
        const itemToSave = {
            id: movieData.id,
            title: movieData.title || movieData.name,
            poster_path: movieData.poster_path,
            vote_average: movieData.vote_average,
            release_date: movieData.release_date || movieData.first_air_date,
            runtime: movieData.runtime,
            genres: movieData.genre_ids ? movieData.genre_ids.map(gid => genreMap[gid]).filter(Boolean) : [],
            overview: movieData.overview,
            _mediaType: movieData._mediaType || 'movie',
            addedAt: new Date().toISOString()
        };
        list.unshift(itemToSave);
        localStorage.setItem(CONFIG.STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
        updateWatchlistBadge();
        showToast(`Saved "${itemToSave.title}" to your Watchlist! ❤️`, 'success');
        return true;
    }
}

function initWatchlistButtons() {
    const buttons = document.querySelectorAll('.btn-watchlist');
    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const movieId = Number(btn.dataset.movieId);
            const movieObj = currentMovies.find(m => Number(m.id) === movieId) ||
                             alternativeMovies.find(m => Number(m.id) === movieId) ||
                             EXPANDED_SAMPLE_MOVIES.find(m => Number(m.id) === movieId);

            if (!movieObj) return;

            const isSaved = toggleWatchlistMovie(movieObj);
            btn.classList.toggle('in-watchlist', isSaved);
            btn.setAttribute('aria-pressed', isSaved);
            btn.innerHTML = isSaved ? '❤️ In Watchlist' : '🤍 Add to Watchlist';
        });
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
// TOAST & UI HELPERS
// ─────────────────────────────────────────────

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

function showLoading() {
    const grid = document.getElementById('results-grid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
    `;
    grid.style.display = 'grid';
    document.getElementById('no-results').style.display = 'none';
}

function showAPIKeyBanner(message) {
    const banner = document.getElementById('api-key-warning');
    if (banner) {
        banner.style.display = 'block';
        const p = banner.querySelector('p');
        if (p && message) p.textContent = message;
    }
}

function showErrorState() {
    const grid = document.getElementById('results-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-notice">
                <p>Could not retrieve recommendations. Showing top rated selections.</p>
            </div>
        `;
    }
    renderResults(EXPANDED_SAMPLE_MOVIES.slice(0, 8), []);
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
        container.innerHTML = '<div class="no-search-results">No movies found matching query.</div>';
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
    const matches = EXPANDED_SAMPLE_MOVIES.filter(m => m.title.toLowerCase().includes(q));
    renderSearchResults(matches, container);
}

function initFallbackImages() {
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.onerror = null;
            this.src = getFallbackPoster(this.alt || 'Movie');
        };
    });
}

function truncate(str, max = 150) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max).trim() + '...' : str;
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
