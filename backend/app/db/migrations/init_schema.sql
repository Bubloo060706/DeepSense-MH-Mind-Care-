-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    role        TEXT NOT NULL DEFAULT 'patient',   -- 'patient' | 'clinician'
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PHQ-9 entries (ground truth labels)
CREATE TABLE IF NOT EXISTS phq_entries (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    score       INTEGER NOT NULL CHECK(score >= 0 AND score <= 27),
    severity    TEXT NOT NULL,                     -- minimal/mild/moderate/severe
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk scores (generated on-device, synced here)
CREATE TABLE IF NOT EXISTS risk_scores (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    score       REAL NOT NULL CHECK(score >= 0.0 AND score <= 1.0),
    window_start TIMESTAMP NOT NULL,
    window_end   TIMESTAMP NOT NULL,
    synced_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    risk_score_id TEXT REFERENCES risk_scores(id),
    message     TEXT NOT NULL,
    severity    TEXT NOT NULL,                     -- 'low' | 'medium' | 'high'
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risk_scores_user ON risk_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_phq_entries_user ON phq_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user      ON alerts(user_id);