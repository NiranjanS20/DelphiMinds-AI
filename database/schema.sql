CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  name VARCHAR(120),
  headline VARCHAR(255),
  country_code VARCHAR(2),
  timezone VARCHAR(64),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_has_at CHECK (POSITION('@' IN email::text) > 1)
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  name CITEXT NOT NULL UNIQUE,
  category VARCHAR(64) NOT NULL DEFAULT 'general',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skills_name_not_blank CHECK (CHAR_LENGTH(TRIM(name::text)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency SMALLINT NOT NULL DEFAULT 5 CHECK (proficiency BETWEEN 1 AND 10),
  source VARCHAR(20) NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'resume', 'ml', 'import')),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000 CHECK (confidence BETWEEN 0 AND 1),
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills (user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_source ON user_skills (source);

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type VARCHAR(150),
  file_size_bytes BIGINT CHECK (file_size_bytes > 0),
  checksum_sha256 CHAR(64),
  status VARCHAR(20) NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'parsed', 'failed')),
  parsed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ml_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  parsed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_user_checksum
  ON resumes (user_id, checksum_sha256)
  WHERE checksum_sha256 IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resumes_user_created_at ON resumes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resumes_parsed_data_gin ON resumes USING GIN (parsed_data jsonb_path_ops);

CREATE TABLE IF NOT EXISTS career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  salary_band JSONB NOT NULL DEFAULT '{}'::jsonb,
  growth_outlook VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_paths_required_skills_gin
  ON career_paths USING GIN (required_skills jsonb_path_ops);

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'paused', 'completed')),
  target_date DATE,
  current_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (current_score BETWEEN 0 AND 100),
  completed_milestones INTEGER NOT NULL DEFAULT 0 CHECK (completed_milestones >= 0),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, career_path_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_status
  ON user_progress (user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  career_path_id UUID REFERENCES career_paths(id) ON DELETE SET NULL,
  batch_id UUID NOT NULL DEFAULT gen_random_uuid(),
  source VARCHAR(20) NOT NULL DEFAULT 'ml'
    CHECK (source IN ('ml', 'rule_engine', 'hybrid')),
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  skill_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_version VARCHAR(120),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_generated
  ON recommendations (user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_batch_id
  ON recommendations (batch_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_payload_gin
  ON recommendations USING GIN (recommendations jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_recommendations_skill_gaps_gin
  ON recommendations USING GIN (skill_gaps jsonb_path_ops);

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  message TEXT NOT NULL,
  provider VARCHAR(40),
  context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  tokens_used INTEGER CHECK (tokens_used IS NULL OR tokens_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_session_created
  ON chat_history (user_id, session_id, created_at DESC);

CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(160) NOT NULL,
  level VARCHAR(40) NOT NULL DEFAULT 'beginner',
  time_commitment VARCHAR(80),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_score_improvement NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_created
  ON learning_paths (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(80) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_created
  ON user_activity (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  job_external_id TEXT,
  job_title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  location VARCHAR(255),
  job_description TEXT NOT NULL,
  fit_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT interviews_fit_score_range CHECK (fit_score BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_interviews_user_job_unique
  ON interviews (user_id, job_external_id)
  WHERE job_external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_interviews_user_created
  ON interviews (user_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_skills_updated_at ON skills;
CREATE TRIGGER trg_skills_updated_at
BEFORE UPDATE ON skills
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_skills_updated_at ON user_skills;
CREATE TRIGGER trg_user_skills_updated_at
BEFORE UPDATE ON user_skills
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_resumes_updated_at ON resumes;
CREATE TRIGGER trg_resumes_updated_at
BEFORE UPDATE ON resumes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_career_paths_updated_at ON career_paths;
CREATE TRIGGER trg_career_paths_updated_at
BEFORE UPDATE ON career_paths
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_progress_updated_at ON user_progress;
CREATE TRIGGER trg_user_progress_updated_at
BEFORE UPDATE ON user_progress
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_recommendations_updated_at ON recommendations;
CREATE TRIGGER trg_recommendations_updated_at
BEFORE UPDATE ON recommendations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_chat_history_updated_at ON chat_history;
CREATE TRIGGER trg_chat_history_updated_at
BEFORE UPDATE ON chat_history
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER trg_learning_paths_updated_at
BEFORE UPDATE ON learning_paths
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_activity_updated_at ON user_activity;
CREATE TRIGGER trg_user_activity_updated_at
BEFORE UPDATE ON user_activity
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_interviews_updated_at ON interviews;
CREATE TRIGGER trg_interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
