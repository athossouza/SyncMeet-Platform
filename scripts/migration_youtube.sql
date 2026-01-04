ALTER TABLE organizations ADD COLUMN IF NOT EXISTS youtube_playlist_id TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
