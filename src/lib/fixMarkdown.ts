/**
 * AI가 생성한 마크다운의 흔한 서식 오류를 자동 교정 (10가지 패턴)
 * Python fix_markdown.py의 TypeScript 버전
 */
export function fixMarkdown(text: string): { fixed: string; changes: string[] } {
  const changes: string[] = []
  let result = text

  // 패턴 1: **[text]] → **[text]**
  result = result.replace(/\*\*(\[[^\]]+\])\]/g, (match, p1) => {
    changes.push(`"]]" 닫기 수정: ${match.slice(0, 40)}...`)
    return `**${p1}**`
  })

  // 패턴 1b: **텍스트[설명]] → **텍스트[설명]**
  result = result.replace(/\*\*([^*\n]+\[[^\]]+\])\]/g, (match, p1) => {
    changes.push(`복합 대괄호 수정: ${match.slice(0, 40)}...`)
    return `**${p1}**`
  })

  // 패턴 2: **[text]* → **[text]**
  result = result.replace(/\*\*(\[[^\]]+\])\*(?!\*)/g, (match, p1) => {
    changes.push(`"*" 하나 닫기 수정: ${match.slice(0, 40)}...`)
    return `**${p1}**`
  })

  // 패턴 5b: **(text)) → **(text)**
  result = result.replace(/\*\*(\([^)]+\))\)/g, (match, p1) => {
    changes.push(`소괄호 "))" 수정: ${match.slice(0, 40)}...`)
    return `**${p1}**`
  })

  // 패턴 5c: **(text)* → **(text)**
  result = result.replace(/\*\*(\([^)]+\))\*(?!\*)/g, (match, p1) => {
    changes.push(`소괄호 "*" 닫기 수정: ${match.slice(0, 40)}...`)
    return `**${p1}**`
  })

  // 패턴 5d: **텍스트(설명)) → **텍스트(설명)**
  result = result.replace(/\*\*([^*\n]+\([^)]+\))\)/g, (match, p1) => {
    changes.push(`복합 소괄호 수정: ${match.slice(0, 40)}...`)
    return `**${p1}**`
  })

  // 패턴 3: **텍스트 (줄 시작, 닫는 ** 없음) → **텍스트**
  const lines = result.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim()
    if (
      s.startsWith('**') &&
      !s.startsWith('***') &&
      (s.match(/\*\*/g) || []).length === 1 &&
      s.length < 200
    ) {
      changes.push(`볼드 안 닫힘 수정: ${s.slice(0, 40)}...`)
      lines[i] = lines[i].trimEnd() + '**'
    }
  }
  result = lines.join('\n')

  // 패턴 4: ``text` → `text`
  const before4 = result
  result = result.replace(/(?<!`)``(?!`)(.*?)(?<!`)`(?!`)/g, '`$1`')
  if (result !== before4) changes.push('백틱 2개→1개 수정')

  // 패턴 5: `text`` → `text`
  const before5 = result
  result = result.replace(/(?<!`)`(?!`)(.*?)(?<!`)``(?!`)/g, '`$1`')
  if (result !== before5) changes.push('백틱 2개→1개 수정')

  // 패턴 6: ##제목 → ## 제목 (코드블록 제외)
  let inCode = false
  const lines2 = result.split('\n')
  for (let i = 0; i < lines2.length; i++) {
    if (lines2[i].trim().startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const m = lines2[i].match(/^(#{1,6})([^\s#])/)
    if (m) {
      changes.push(`# 뒤 공백 추가: ${lines2[i].slice(0, 30)}...`)
      lines2[i] = m[1] + ' ' + lines2[i].slice(m[1].length)
    }
  }
  result = lines2.join('\n')

  // 패턴 7: -항목 → - 항목 (코드블록 제외)
  inCode = false
  const lines3 = result.split('\n')
  for (let i = 0; i < lines3.length; i++) {
    if (lines3[i].trim().startsWith('```')) {
      inCode = !inCode
      continue
    }
    if (inCode) continue
    const m = lines3[i].match(/^(\s*)-([^\s\-\d])/)
    if (m) {
      changes.push(`- 뒤 공백 추가: ${lines3[i].slice(0, 30)}...`)
      lines3[i] = m[1] + '- ' + lines3[i].slice(m[1].length + 1)
    }
  }
  result = lines3.join('\n')

  return { fixed: result, changes }
}
