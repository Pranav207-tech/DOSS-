// ============================================================
// ReelFinder - TMDB API Module
// ============================================================

class TMDBApi {
    constructor() {
        this.baseURL = CONFIG.TMDB_BASE_URL;
        this.apiKey = CONFIG.TMDB_API_KEY;
        this.cache = new Map();
    }

    // Build URL with API key
    buildURL(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        url.searchParams.set('api_key', this.apiKey);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    // Generic fetch with caching and error handling
    async fetch(endpoint, params = {}) {
        if (!isAPIKeyConfigured()) {
            throw new Error('API_KEY_MISSING');
        }

        const url = this.buildURL(endpoint, params);
        const cacheKey = url;

        // Check cache (5 min TTL)
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401) throw new Error('INVALID_API_KEY');
                if (response.status === 404) throw new Error('NOT_FOUND');
                throw new Error(`HTTP_ERROR_${response.status}`);
            }
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            if (error.message.startsWith('API_KEY') || error.message.startsWith('INVALID') || error.message.startsWith('NOT_FOUND') || error.message.startsWith('HTTP_ERROR')) {
                throw error;
            }
            throw new Error('NETWORK_ERROR');
        }
    }

    // Get trending movies
    async getTrending(timeWindow = 'week', page = 1) {
        return this.fetch(`/trending/movie/${timeWindow}`, { page });
    }

    // Get popular movies
    async getPopular(page = 1) {
        return this.fetch('/movie/popular', { page });
    }

    // Get top rated movies (for Hidden Gems - filter by low popularity)
    async getTopRated(page = 1) {
        return this.fetch('/movie/top_rated', { page });
    }

    // Search movies by title
    async searchMovies(query, page = 1) {
        return this.fetch('/search/movie', { query, page, include_adult: false });
    }

    // Search TV shows
    async searchTV(query, page = 1) {
        return this.fetch('/search/tv', { query, page, include_adult: false });
    }

    // Get movie details
    async getMovieDetails(movieId) {
        return this.fetch(`/movie/${movieId}`, { append_to_response: 'credits,similar,videos' });
    }

    // Get TV show details
    async getTVDetails(tvId) {
        return this.fetch(`/tv/${tvId}`, { append_to_response: 'credits,similar,videos' });
    }

    // Get movie videos (trailers)
    async getMovieVideos(movieId) {
        return this.fetch(`/movie/${movieId}/videos`);
    }

    // Get similar movies
    async getSimilarMovies(movieId, page = 1) {
        return this.fetch(`/movie/${movieId}/similar`, { page });
    }

    // Discover movies with filters
    async discoverMovies(params = {}) {
        const defaultParams = {
            include_adult: false,
            include_video: false,
            sort_by: 'popularity.desc',
            'vote_count.gte': 50
        };
        return this.fetch('/discover/movie', { ...defaultParams, ...params });
    }

    // Discover TV shows
    async discoverTV(params = {}) {
        const defaultParams = {
            include_adult: false,
            sort_by: 'popularity.desc',
            'vote_count.gte': 20
        };
        return this.fetch('/discover/tv', { ...defaultParams, ...params });
    }

    // Get movie genres list
    async getGenres() {
        return this.fetch('/genre/movie/list');
    }

    // Get movie by ID (for random picks)
    async getRandomPopularMovie() {
        const page = Math.floor(Math.random() * 5) + 1;
        const data = await this.getPopular(page);
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            return data.results[randomIndex];
        }
        return null;
    }

    // Build discover params from user preferences
    buildDiscoverParams(preferences) {
        const params = {};

        // Genre filtering
        if (preferences.genre && GENRE_IDS[preferences.genre]) {
            params.with_genres = GENRE_IDS[preferences.genre];
        } else if (preferences.mood && MOOD_GENRE_MAP[preferences.mood]) {
            // Use mood-based genre mapping if no specific genre selected
            params.with_genres = MOOD_GENRE_MAP[preferences.mood].join('|');
        }

        // Language filtering
        if (preferences.language && preferences.language !== 'Any language') {
            params.with_original_language = LANGUAGE_CODES[preferences.language];
        }

        // Runtime filtering
        if (preferences.watchTime && RUNTIME_RANGES[preferences.watchTime]) {
            const range = RUNTIME_RANGES[preferences.watchTime];
            if (range.min > 0) params['with_runtime.gte'] = range.min;
            if (range.max < 999) params['with_runtime.lte'] = range.max;
        }

        // Sort by vote_average for quality results
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = 100;

        return params;
    }
}

// Global API instance
const tmdb = new TMDBApi();

// ============================================================
// Fallback sample data for development (when no API key)
// ============================================================
const SAMPLE_MOVIES = [
    {
        id: 550, title: "Fight Club", release_date: "1999-10-15",
        vote_average: 8.4, genre_ids: [18, 53, 80], runtime: 139,
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg", original_language: "en"
    },
    {
        id: 238, title: "The Godfather", release_date: "1972-03-14",
        vote_average: 8.7, genre_ids: [18, 80], runtime: 175,
        overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
        poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg", original_language: "en"
    },
    {
        id: 278, title: "The Shawshank Redemption", release_date: "1994-09-23",
        vote_average: 8.7, genre_ids: [18, 80], runtime: 142,
        overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank State Penitentiary.",
        poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg", backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg", original_language: "en"
    },
    {
        id: 157336, title: "Interstellar", release_date: "2014-11-05",
        vote_average: 8.4, genre_ids: [878, 12, 18], runtime: 169,
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg", original_language: "en"
    },
    {
        id: 603, title: "The Matrix", release_date: "1999-03-30",
        vote_average: 8.2, genre_ids: [28, 878], runtime: 136,
        overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
        poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", backdrop_path: "/oMQGarB5R3q260D4P21Fz9VfO5i.jpg", original_language: "en"
    },
    {
        id: 27205, title: "Inception", release_date: "2010-07-15",
        vote_average: 8.4, genre_ids: [28, 878, 9648], runtime: 148,
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
        poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", original_language: "en"
    },
    {
        id: 299536, title: "Avengers: Infinity War", release_date: "2018-04-25",
        vote_average: 8.3, genre_ids: [28, 12, 878], runtime: 149,
        overview: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged.",
        poster_path: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", backdrop_path: "/mDfJG3LC3Dqb67AZ52x3Z0jQl0Q.jpg", original_language: "en"
    },
    {
        id: 346364, title: "It", release_date: "2017-09-05",
        vote_average: 7.3, genre_ids: [27, 9648], runtime: 135,
        overview: "In the Town of Derry, the local children are disappearing one by one. In a place known as the Barrens, a group of seven kids are united by their horrifying and strange encounters with an entity.",
        poster_path: "/9E2STxgVa2nmKN8vf9G17FwD2wk.jpg", backdrop_path: "/tcheoA2nPATCm2vvXw2IjVQoaEF.jpg", original_language: "en"
    },
    {
        id: 155, title: "The Dark Knight", release_date: "2008-07-16",
        vote_average: 8.5, genre_ids: [18, 28, 80, 53], runtime: 152,
        overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, he sets out to dismantle the remaining criminal organizations that plague the city.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", original_language: "en"
    },
    {
        id: 496243, title: "Parasite", release_date: "2019-05-30",
        vote_average: 8.5, genre_ids: [35, 53, 18], runtime: 132,
        overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
        poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdrop_path: "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg", original_language: "ko"
    },
    {
        id: 129, title: "Spirited Away", release_date: "2001-07-20",
        vote_average: 8.5, genre_ids: [16, 10751, 14], runtime: 125,
        overview: "A young girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", backdrop_path: "/bXNvzjYE9rvBA2wh4m7v5V9P799.jpg", original_language: "ja"
    },
    {
        id: 313369, title: "La La Land", release_date: "2016-11-29",
        vote_average: 7.9, genre_ids: [35, 18, 10749, 10402], runtime: 128,
        overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, struggle to make ends meet in a city known for crushing hopes and breaking hearts.",
        poster_path: "/uDO8zWDdoWNzAcSkzOP4vFTmcfn.jpg", backdrop_path: "/qJeU7KM4nR7v56aX1j94WvH2i8r.jpg", original_language: "en"
    }
];

