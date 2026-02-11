#!/usr/bin/env python3
"""
마크다운 특수문자 충돌 자동 수정 스크립트
=========================================
AI가 생성한 마크다운에서 흔히 발생하는 서식 오류를 자동 감지·수정합니다.

사용법:
    # 스캔만 (어떤 오류가 있는지 확인)
    python fix_markdown.py ./폴더경로

    # 실제 수정
    python fix_markdown.py ./폴더경로 --fix

    # 단일 파일
    python fix_markdown.py ./파일.md --fix

다른 프로젝트에서 import해서 사용:
    from fix_markdown import fix_markdown_text
    fixed = fix_markdown_text(raw_text)
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")


def fix_markdown_text(text):
    """
    마크다운 텍스트의 흔한 서식 오류를 교정합니다.

    수정하는 패턴 10가지:
    1.  **[텍스트]]  → **[텍스트]**     (]] 잘못 닫기)
    1b. **텍스트[설명]] → **텍스트[설명]** (복합 대괄호)
    2.  **[텍스트]*  → **[텍스트]**     (* 하나로 닫기)
    3.  **텍스트     → **텍스트**       (볼드 안 닫기)
    4.  ``텍스트`    → `텍스트`         (백틱 개수 불일치)
    5.  `텍스트``    → `텍스트`         (백틱 개수 불일치)
    5b. **(텍스트))  → **(텍스트)**     (소괄호 )) 잘못 닫기)
    5c. **(텍스트)*  → **(텍스트)**     (소괄호 + * 하나)
    6.  ##제목       → ## 제목          (# 뒤 공백 없음)
    7.  -항목        → - 항목           (- 뒤 공백 없음)

    Args:
        text: 원본 마크다운 텍스트

    Returns:
        교정된 마크다운 텍스트
    """
    # === 패턴 1: **[text]] → **[text]** ===
    text = re.sub(r"\*\*(\[[^\]]+\])\]", r"**\1**", text)

    # === 패턴 1b: **텍스트[설명]] → **텍스트[설명]** (볼드 안에 대괄호 포함) ===
    text = re.sub(r"\*\*([^*\n]+\[[^\]]+\])\]", r"**\1**", text)

    # === 패턴 2: **[text]* → **[text]** ===
    text = re.sub(r"\*\*(\[[^\]]+\])\*(?!\*)", r"**\1**", text)

    # === 패턴 3: 줄 시작 **텍스트 (닫는 ** 없음) → **텍스트** ===
    lines = text.split("\n")
    for i, line in enumerate(lines):
        s = line.strip()
        if (
            s.startswith("**")
            and not s.startswith("***")
            and s.count("**") == 1
            and len(s) < 200
            and not s.endswith("**")
        ):
            lines[i] = line.rstrip() + "**"
    text = "\n".join(lines)

    # === 패턴 4: ``text` → `text` ===
    text = re.sub(r"(?<!`)``(?!`)(.*?)(?<!`)`(?!`)", r"`\1`", text)

    # === 패턴 5: `text`` → `text` ===
    text = re.sub(r"(?<!`)`(?!`)(.*?)(?<!`)``(?!`)", r"`\1`", text)

    # === 패턴 5b: **(텍스트)) → **(텍스트)** ===
    text = re.sub(r"\*\*(\([^)]+\))\)", r"**\1**", text)

    # === 패턴 5c: **(텍스트)* → **(텍스트)** ===
    text = re.sub(r"\*\*(\([^)]+\))\*(?!\*)", r"**\1**", text)

    # === 패턴 5d: **텍스트(설명)) → **텍스트(설명)** ===
    # 볼드 안에 괄호가 포함된 텍스트에서 ))로 잘못 닫는 경우
    text = re.sub(r"\*\*([^*\n]+\([^)]+\))\)", r"**\1**", text)

    # === 패턴 5e: **(텍스트** 없이 줄 끝) → **(텍스트)** ===
    # 여는 괄호는 있는데 닫는 괄호 없이 ** 로 볼드만 닫은 경우는 그대로 둠 (의도일 수 있음)

    # === 패턴 6: ##제목 → ## 제목 (코드블록 안은 제외) ===
    in_code_block = False
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue
        # #{1,6} 바로 뒤에 공백 없이 글자가 오는 경우
        m = re.match(r"^(#{1,6})([^\s#])", line)
        if m:
            lines[i] = m.group(1) + " " + line[len(m.group(1)) :]
    text = "\n".join(lines)

    # === 패턴 7: -항목 → - 항목 (코드블록 안은 제외) ===
    in_code_block = False
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue
        # 줄 시작이 공백* + - + 공백 없이 글자
        m = re.match(r"^(\s*)-([^\s\-\d])", line)
        if m:
            lines[i] = m.group(1) + "- " + line[len(m.group(1)) + 1 :]
    text = "\n".join(lines)

    return text


def scan_file(filepath, fix=False):
    """파일 하나를 스캔하고 선택적으로 수정합니다."""
    with open(filepath, "r", encoding="utf-8") as f:
        original = f.read()

    fixed = fix_markdown_text(original)

    if fixed == original:
        return []  # 문제 없음

    # 차이점 찾기
    diffs = []
    orig_lines = original.split("\n")
    fix_lines = fixed.split("\n")
    for ln, (a, b) in enumerate(zip(orig_lines, fix_lines), 1):
        if a != b:
            diffs.append(
                {
                    "line": ln,
                    "before": a.strip()[:120],
                    "after": b.strip()[:120],
                }
            )

    if fix:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(fixed)

    return diffs


def scan_directory(target_path, fix=False):
    """디렉토리 또는 단일 파일을 스캔합니다."""
    all_results = {}

    if os.path.isfile(target_path):
        files = [target_path]
    else:
        files = []
        for root, dirs, fnames in os.walk(target_path):
            for fname in fnames:
                if fname.endswith(".md"):
                    files.append(os.path.join(root, fname))

    for fpath in sorted(files):
        diffs = scan_file(fpath, fix=fix)
        if diffs:
            rel = os.path.relpath(fpath, target_path) if not os.path.isfile(target_path) else os.path.basename(fpath)
            all_results[rel] = diffs

    return all_results


def main():
    if len(sys.argv) < 2:
        print("사용법:")
        print("  python fix_markdown.py ./폴더경로          # 스캔만")
        print("  python fix_markdown.py ./폴더경로 --fix    # 수정")
        print("  python fix_markdown.py ./파일.md --fix     # 단일 파일")
        sys.exit(1)

    target = sys.argv[1]
    fix = "--fix" in sys.argv

    if not os.path.exists(target):
        print(f"❌ 경로를 찾을 수 없습니다: {target}")
        sys.exit(1)

    print(f"{'🔧 수정 모드' if fix else '🔍 스캔 모드'}")
    print(f"대상: {os.path.abspath(target)}")
    print("-" * 50)

    results = scan_directory(target, fix=fix)

    if not results:
        print("\n✅ 문제 없음! 모든 마크다운 파일이 정상입니다.")
        return

    total_fixes = 0
    for rel, diffs in results.items():
        icon = "✅" if fix else "⚠️"
        print(f"\n{icon} {rel} ({len(diffs)}개 수정{'됨' if fix else ' 필요'})")
        for d in diffs:
            print(f"  줄 {d['line']}:")
            print(f"    전: {d['before']}")
            print(f"    후: {d['after']}")
        total_fixes += len(diffs)

    print(f"\n{'=' * 50}")
    print(f"총 {len(results)}개 파일, {total_fixes}개 수정{'완료' if fix else ' 필요'}")

    if not fix and results:
        print("\n→ 수정하려면: python fix_markdown.py " + sys.argv[1] + " --fix")


if __name__ == "__main__":
    main()
