/**
 * 이메일 발송 스크립트
 *
 * 생성된 브리핑 이메일을 활성 구독자에게 Resend API로 발송합니다.
 *
 * 환경변수:
 *   RESEND_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * 사용법: node scripts/send-briefing.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFING_PATH = resolve(__dirname, 'temp/briefing-content.json');
const EMAIL_HTML_PATH = resolve(__dirname, 'temp/briefing-email.html');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── 환경변수 검증 ───
const missingVars = [];
if (!RESEND_API_KEY) missingVars.push('RESEND_API_KEY');
if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
if (!SUPABASE_SERVICE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

if (missingVars.length > 0) {
  console.error(`❌ 필수 환경변수 미설정: ${missingVars.join(', ')}`);
  process.exit(1);
}

if (!existsSync(BRIEFING_PATH) || !existsSync(EMAIL_HTML_PATH)) {
  console.error('❌ 브리핑 파일이 없습니다. generate-briefing.mjs와 generate-email-html.mjs를 먼저 실행하세요.');
  process.exit(1);
}

// ─── Supabase에서 활성 구독자 조회 ───
async function getActiveSubscribers() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscribers?status=eq.active&select=id,email,token&order=subscribed_at.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase 조회 실패: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

// ─── Resend로 이메일 발송 ───
async function sendEmail(to, subject, html, unsubscribeToken) {
  const unsubscribeUrl = `https://bujatime.com/unsubscribe?token=${unsubscribeToken}`;
  const personalizedHtml = html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: '부자타임 <briefing@bujatime.com>',
      to: [to],
      subject,
      html: personalizedHtml,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend 발송 실패 (${res.status}): ${errBody}`);
  }

  return res.json();
}

// ─── Supabase에 발송 기록 저장 ───
async function saveBriefingIssue(briefingData, html, recipientCount) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/briefing_issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      issue_date: briefingData.date,
      subject: briefingData.subject,
      preview_text: briefingData.previewText,
      html_content: html,
      ai_summary: briefingData.markdown,
      source_articles: briefingData.sourceData,
      sent_at: new Date().toISOString(),
      recipient_count: recipientCount,
    }),
  });

  if (!res.ok) {
    console.warn(`⚠️ 발송 기록 저장 실패: ${res.status}`);
  }
}

// ─── 대기 함수 ───
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── 메인 실행 ───
async function main() {
  console.log('\n📬 부자브리핑 이메일 발송 시작\n');

  const briefing = JSON.parse(readFileSync(BRIEFING_PATH, 'utf-8'));
  const emailHtml = readFileSync(EMAIL_HTML_PATH, 'utf-8');

  console.log(`📌 제목: ${briefing.subject}`);
  console.log(`📅 날짜: ${briefing.date}\n`);

  // 활성 구독자 조회
  const subscribers = await getActiveSubscribers();
  console.log(`👥 활성 구독자: ${subscribers.length}명\n`);

  if (subscribers.length === 0) {
    console.log('ℹ️ 발송할 구독자가 없습니다.');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  const failedEmails = [];

  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    const progress = `[${i + 1}/${subscribers.length}]`;

    try {
      await sendEmail(sub.email, briefing.subject, emailHtml, sub.token);
      successCount++;
      console.log(`  ✅ ${progress} ${sub.email}`);
    } catch (err) {
      failCount++;
      failedEmails.push(sub.email);
      console.error(`  ❌ ${progress} ${sub.email}: ${err.message}`);
    }

    // Rate limit: Resend 무료 티어 초당 2건 제한
    if (i < subscribers.length - 1) {
      await sleep(600);
    }
  }

  // 발송 기록 저장
  try {
    await saveBriefingIssue(briefing, emailHtml, successCount);
    console.log('\n📊 발송 기록 저장 완료');
  } catch (err) {
    console.warn(`\n⚠️ 발송 기록 저장 실패: ${err.message}`);
  }

  // 결과 요약
  console.log('\n' + '═'.repeat(40));
  console.log(`📊 발송 결과`);
  console.log(`   성공: ${successCount}건`);
  console.log(`   실패: ${failCount}건`);
  if (failedEmails.length > 0) {
    console.log(`   실패 목록: ${failedEmails.join(', ')}`);
  }
  console.log('═'.repeat(40) + '\n');

  // 실패가 있으면 exit code 1
  if (failCount > 0 && successCount === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ 발송 중 치명적 오류:', err);
  process.exit(1);
});
