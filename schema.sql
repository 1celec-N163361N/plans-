-- خطط سيرك — إنشاء جداول قاعدة البيانات
-- شغّل هذا الملف مرة واحدة على قاعدة بياناتك في CranL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- جدول الجلسات
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- جدول الخطط
CREATE TABLE IF NOT EXISTS plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'مخصص',
  status        TEXT NOT NULL DEFAULT 'خاصة',
  password_hash TEXT,
  has_password  BOOLEAN NOT NULL DEFAULT FALSE,
  share_token   TEXT UNIQUE,
  notes         TEXT,
  activities    JSONB DEFAULT '[]',
  gear_items    JSONB DEFAULT '[]',
  scheduled_at  TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- جدول نقاط التوقف
CREATE TABLE IF NOT EXISTS stops (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id   UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  notes     TEXT,
  lat       REAL,
  lng       REAL,
  "order"   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_plans_user_id    ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_share_token ON plans(share_token);
CREATE INDEX IF NOT EXISTS idx_stops_plan_id    ON stops(plan_id);
