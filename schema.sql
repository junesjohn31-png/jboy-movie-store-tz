CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'movie',
  price INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '',
  poster_key TEXT NOT NULL, video_key TEXT, trailer_key TEXT,
  poster_url TEXT NOT NULL, video_url TEXT, trailer_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
