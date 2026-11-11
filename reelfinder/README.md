# 🎬 ReelFinder – Smart Movie Discovery Platform

> **"Don't search for movies. Find your next favourite."**

ReelFinder is a modern, responsive, and cinematic movie discovery web application designed to help users answer questions like:
- *"I have only 90 minutes. What can I watch?"*
- *"I am in the mood for a suspense thriller. Suggest something."*
- *"I want a feel-good movie for tonight."*
- *"I don't know what to watch. Surprise me!"*

---

## 🌟 Key Features

1. **🎭 Mood-Based Rule Engine**:
   - 8 Curated Moods: **Happy**, **Sad**, **Romantic**, **Excited**, **Suspenseful**, **Relaxed**, **Adventurous**, and **Thoughtful**.
   - Intelligent mood-to-genre scoring algorithm that influences ranking without prematurely eliminating films.

2. **⏱️ Strict Watching Time Filter**:
   - Options: *Under 90 minutes*, *90–120 minutes*, *120–150 minutes*, and *More than 150 minutes*.
   - Evaluates actual film runtimes to match the user's available window.

3. **🌍 Multilingual & Format Filters**:
   - Filter by original language: English, Tamil, Hindi, Telugu, Malayalam, Korean, or Any Language.
   - Format toggle: *Movies only*, *TV series only*, or *Both*.

4. **📊 Intelligent Match Reason Banner**:
   - Clear, human-readable explanations detailing *why* each movie was selected for the user's specific mood and runtime targets.

5. **🎲 "Surprise Me" Instant Discovery**:
   - One-click randomizer that surfaces a high-rated cinematic gem directly into the details view.

6. **🔍 Live Real-Time Search**:
   - Fullscreen keyboard-accessible search overlay with debounced queries, live poster previews, and rating badges.

7. **📋 Offline Watchlist (LocalStorage)**:
   - Bookmark movies and TV shows across browsing sessions.
   - Sort by *Recently Added*, *Rating*, or *Alphabetical*.
   - Live badge counter in the navigation bar.

8. **🎬 Deep Cinematic Movie Details**:
   - High-resolution dynamic backdrops and posters.
   - Official YouTube trailer integration.
   - Cast avatars and character breakdowns.
   - Similar movie recommendations.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic, accessible markup.
- **CSS3**: Custom design tokens, glassmorphism, fluid typography (`clamp()`), and responsive CSS Grid & Flexbox.
- **Vanilla JavaScript (ES6+)**: Zero external JS frameworks (no React/Vue/Angular), completely modular and beginner-friendly.
- **TMDB API**: Integration for movie posters, genres, trailers, runtime, and ratings.
- **LocalStorage**: Persistent watchlist and session storage for preference hand-off.

---

## 📁 Project Structure

```
reelfinder/
│
├── index.html              # Landing page (Trending, Popular, Hidden Gems, Hero)
├── discover.html           # Interactive 5-step movie preference selector
├── results.html            # Curated recommendation results & match explanations
├── details.html            # Cinematic movie details with trailer & cast
├── watchlist.html          # LocalStorage-backed personal watchlist
├── README.md               # Documentation & project guide
│
├── css/
│   ├── style.css           # Global design system, tokens, animations, navbar
│   ├── discover.css        # Interactive preference UI, mood cards & grids
│   ├── details-extra.css   # Polish for results, details, cast & watchlist
│   └── responsive.css      # Fluid breakpoints from mobile (360px) to 4K
│
└── js/
    ├── config.js           # API configuration, genre maps, runtime ranges
    ├── api.js              # TMDB API client with caching & fallback catalog
    ├── main.js             # Homepage controller, trending loaders, surprise-me
    ├── discover.js         # State management & interactive mood/genre picker
    ├── recommendations.js  # Rule-based scoring engine & results renderer
    ├── details.js          # Details page controller, trailers, similar movies
    └── watchlist.js        # LocalStorage watchlist CRUD & multi-criteria sorting
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Opening
Double-click `index.html` to open it directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Using a Local HTTP Server (Recommended)
Running through a local web server ensures all API fetch requests and localStorage behave seamlessly without CORS restrictions.

**Using Python:**
```bash
cd "c:\Users\admin\Downloads\DOS CLUB\reelfinder"
python -m http.server 8000
```
Then open: [http://localhost:8000](http://localhost:8000)

**Using Node.js (`npx serve`):**
```bash
cd "c:\Users\admin\Downloads\DOS CLUB\reelfinder"
npx serve .
```

---

## 🔑 Adding Your TMDB API Key

ReelFinder comes pre-loaded with an offline curated catalog of 25+ acclaimed movies with real poster paths, ratings, and runtimes so it functions out-of-the-box even without an API key.

To connect live data from The Movie Database (over 500,000+ titles):
1. Sign up for a free account at [themoviedb.org](https://www.themoviedb.org/).
2. Navigate to **Settings > API** and request a free Developer API Key.
3. Open `js/config.js` in any text editor.
4. Replace `'YOUR_TMDB_API_KEY_HERE'` with your key:
   ```javascript
   const CONFIG = {
       TMDB_API_KEY: 'your_actual_32_character_api_key_here',
       ...
   };
   ```
5. Save `config.js` and reload your browser!

---

## 💡 Recommendation System Architecture

ReelFinder uses a multi-factor **Rule-Based Recommendation Engine** (`js/recommendations.js`):

$$\text{Total Score} = \text{Rating Base} + \text{Mood Bonus} + \text{Genre Match} + \text{Runtime Proximity} + \text{Language Fit}$$

1. **Rating Foundation (0–85 pts)**: Scales TMDB vote averages to prioritize critically acclaimed films.
2. **Mood Resonance (+20 to +40 pts)**: Matches the user's emotional state against predefined genre vectors (e.g., *Happy* boosts Comedy & Family; *Suspenseful* boosts Thriller & Mystery).
3. **Explicit Genre (+35 pts)**: Prioritizes explicit genre choices.
4. **Runtime Fit (+15 to +30 pts)**: Rewards titles conforming to the selected watch time window.
5. **Language Fit (+25 pts)**: Ensures selected regional languages (English, Tamil, Hindi, Telugu, Malayalam, Korean) rank first.
6. **Graceful Fallback**: If strict constraints produce fewer than 3 movies, softer boundaries are applied to guarantee the user is never left with an empty screen.
