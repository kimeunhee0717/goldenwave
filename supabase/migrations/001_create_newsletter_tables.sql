-- =============================================
-- 부자타임 뉴스레터 테이블 마이그레이션
-- =============================================

-- 1. subscribers: 뉴스레터 구독자
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  token UUID DEFAULT gen_random_uuid() NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  ip_address INET,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers (status) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (token);

-- RLS 활성화
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 허용 (Edge Function용)
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- 2. briefing_issues: 발송된 브리핑 이력
CREATE TABLE IF NOT EXISTS briefing_issues (
  id SERIAL PRIMARY KEY,
  issue_date DATE UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT NOT NULL,
  plain_text TEXT,
  source_articles JSONB,
  ai_summary TEXT,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefing_date ON briefing_issues (issue_date DESC);

-- RLS 활성화
ALTER TABLE briefing_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON briefing_issues
  FOR ALL USING (auth.role() = 'service_role');

-- 공개 읽기 허용 (아카이브 페이지용)
CREATE POLICY "Public read access" ON briefing_issues
  FOR SELECT USING (true);
