/**
 * 이메일 HTML 템플릿 생성 스크립트
 *
 * generate-briefing.mjs에서 생성된 마크다운 브리핑을
 * 이메일 클라이언트 호환 HTML로 변환합니다.
 *
 * 사용법: node scripts/generate-email-html.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = resolve(__dirname, 'temp/briefing-content.json');
const OUTPUT_PATH = resolve(__dirname, 'temp/briefing-email.html');

if (!existsSync(INPUT_PATH)) {
  console.error('❌ 브리핑 콘텐츠 파일이 없습니다. generate-briefing.mjs를 먼저 실행하세요.');
  process.exit(1);
}

// ─── 마크다운 → 이메일 HTML 변환 ───
function markdownToEmailHtml(md) {
  let html = md;

  // 코드 블록 (```) 제거
  html = html.replace(/```[\s\S]*?```/g, '');

  // 헤딩
  html = html.replace(
    /^### (.*$)/gm,
    '<h3 style="color:#1a1a1a;font-size:18px;font-weight:700;margin:28px 0 12px;padding-bottom:8px;border-bottom:1px solid #e8e0d8;">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gm,
    '<h2 style="color:#1a1a1a;font-size:22px;font-weight:800;margin:32px 0 14px;">$1</h2>'
  );

  // 볼드
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1a1a1a;">$1</strong>');

  // 이탤릭
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 링크
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color:#2d6a4f;text-decoration:underline;font-weight:500;" target="_blank">$1</a>'
  );

  // 순서 있는 리스트
  html = html.replace(/^\d+\.\s+(.*$)/gm, (_, content) => {
    return `<li style="color:#333;font-size:15px;line-height:1.7;margin-bottom:12px;padding-left:4px;">${content}</li>`;
  });

  // 순서 없는 리스트
  html = html.replace(/^[-*]\s+(.*$)/gm, (_, content) => {
    return `<li style="color:#333;font-size:15px;line-height:1.7;margin-bottom:8px;list-style-type:disc;">${content}</li>`;
  });

  // 연속 <li> 를 <ul>/<ol> 로 감싸기
  html = html.replace(
    /(<li[^>]*>.*?<\/li>\n?)+/g,
    (match) => `<ul style="margin:12px 0;padding-left:20px;">${match}</ul>`
  );

  // 줄바꿈 → 단락
  const lines = html.split('\n');
  const processed = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('</')) {
      processed.push(trimmed);
      continue;
    }
    processed.push(
      `<p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 14px;">${trimmed}</p>`
    );
  }

  return processed.join('\n');
}

// ─── 이메일 HTML 래퍼 ───
function generateEmailTemplate(briefingData) {
  const { date, subject, previewText, markdown } = briefingData;
  const contentHtml = markdownToEmailHtml(markdown);

  const formattedDate = new Date(date + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; display: block; }
    a { color: #2d6a4f; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .content-padding { padding: 24px 20px !important; }
      .header-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans KR',Roboto,sans-serif;">

  <!-- 프리헤더 (이메일 목록에서 미리보기) -->
  <div style="display:none;font-size:1px;color:#f5f0eb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${previewText || subject}
    ${'&#847; &zwnj; &nbsp; '.repeat(30)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <table role="presentation" class="container" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ═══ 헤더 ═══ -->
          <tr>
            <td class="header-padding" style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:32px 40px;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:26px;font-weight:800;color:#d4a574;letter-spacing:-0.5px;">
                      ☀️ 부자브리핑
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:#888;">
                      ${formattedDate}
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <a href="https://bujatime.com" style="color:#d4a574;font-size:13px;text-decoration:none;font-weight:600;">
                      bujatime.com
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ 본문 ═══ -->
          <tr>
            <td class="content-padding" style="background-color:#ffffff;padding:36px 40px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- ═══ CTA 버튼 ═══ -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 36px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#2d6a4f;border-radius:50px;">
                    <a href="https://bujatime.com" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.3px;">
                      부자타임에서 더 읽기 →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ 구분선 ═══ -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;">
              <div style="border-top:1px solid #e8e0d8;"></div>
            </td>
          </tr>

          <!-- ═══ 푸터 ═══ -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 32px;border-radius:0 0 16px 16px;">
              <p style="margin:0 0 6px;font-size:12px;color:#999;text-align:center;">
                이 이메일은 부자타임 뉴스레터를 구독하셨기 때문에 발송되었습니다.
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#999;text-align:center;">
                <a href="{{UNSUBSCRIBE_URL}}" style="color:#999;text-decoration:underline;">구독 해지하기</a>
              </p>
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                &copy; 2026 부자타임 &middot; hello@bujatime.com
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── 실행 ───
const briefing = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));
const html = generateEmailTemplate(briefing);
writeFileSync(OUTPUT_PATH, html, 'utf-8');
console.log(`✅ 이메일 HTML 생성 완료 → ${OUTPUT_PATH}`);
console.log(`   제목: ${briefing.subject}`);
console.log(`   날짜: ${briefing.date}`);
