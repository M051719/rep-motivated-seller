#!/usr/bin/env python3
"""
Fix TypeScript files with hard line wraps that break syntax.
These files have lines broken in the middle of strings, template literals, and JSX attributes.
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = r"c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

FILES_TO_FIX = [
    "src/components/compliance/SMSOptInComponent.tsx",
    "src/components/education/analytics/LearningAnalytics.tsx",
    "src/components/education/certificates/CertificateViewer.tsx",
    "src/components/education/EnhancedCoursePlayer.tsx",
    "src/components/education/MobileVideoPlayer.tsx",
    "src/components/education/StudentDashboard.tsx",
    "src/components/education/video/EnhancedVideoPlayer.tsx",
    "src/components/education/VideoPlayer.tsx",
    "src/components/marketing/direct-mail/CanvaUploader.tsx",
    "src/components/marketing/direct-mail/MailCampaignManager.tsx",
    "src/lib/api.ts",
    "src/lib/security/key-management.ts",
    "src/services/analytics/LearningAnalytics.ts",
    "src/services/certificates/CertificateService.ts",
    "src/services/certificates/CertificateViewer.tsx",
    "src/services/email/SendGridService.ts",
    "src/services/mail/LobService.ts",
    "src/services/video/CloudflareStreamService.ts",
    "src/video/CloudflareStreamService.ts"
]

def should_join_lines(line, next_line):
    """Determine if a line should be joined with the next line."""
    if not next_line:
        return False

    line_stripped = line.rstrip()
    next_stripped = next_line.lstrip()

    # Skip if next line starts with a clear statement
    if re.match(r'^\s*(const |let |var |function |class |import |export |return |if |else |for |while |switch |case |default |//|/\*)', next_line):
        return False

    # Pattern 1: Template literal split (${...} not closed)
    if '${' in line_stripped and '}' not in line_stripped[line_stripped.rfind('${'):]:
        if '}' in next_stripped:
            return True

    # Pattern 2: String split in className or other attributes
    if re.search(r'className="[^"]*$', line_stripped):
        if re.match(r'^\s*[^"]*"', next_line):
            return True

    # Pattern 3: Template literal backtick split
    if line_stripped.count('`') % 2 == 1:  # Odd number of backticks
        return True

    # Pattern 4: Regular string split
    double_quotes = line_stripped.count('"') - line_stripped.count('\\"')
    single_quotes = line_stripped.count("'") - line_stripped.count("\\'")
    if (double_quotes % 2 == 1 or single_quotes % 2 == 1):
        # Next line shouldn't start with typical code keywords
        if not re.match(r'^\s*(const |let |var |function |import |export |return)', next_line):
            return True

    # Pattern 5: Line ends with incomplete JSX attribute
    if re.search(r'\w+="[^"]*$', line_stripped) or re.search(r'\w+=\{[^}]*$', line_stripped):
        return True

    # Pattern 6: URL split across lines
    if re.search(r'https?://[^\s"\'`]*$', line_stripped):
        if re.match(r'^\s*[^\s"\'`]*["\']', next_line):
            return True

    return False

def fix_file(filepath):
    """Fix line wraps in a single file."""
    full_path = os.path.join(PROJECT_ROOT, filepath)

    if not os.path.exists(full_path):
        print(f"⏭️  Skipping {filepath} (not found)")
        return False

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines(keepends=False)

        fixed_lines = []
        i = 0
        changes_made = 0

        while i < len(lines):
            current_line = lines[i]
            next_line = lines[i + 1] if i + 1 < len(lines) else None

            if should_join_lines(current_line, next_line):
                # Join current line with next, preserving single space
                joined = current_line.rstrip() + next_line.lstrip()
                fixed_lines.append(joined)
                changes_made += 1
                i += 2
            else:
                fixed_lines.append(current_line)
                i += 1

        if changes_made > 0:
            with open(full_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write('\n'.join(fixed_lines))
                if lines and lines[-1] == '':  # Preserve trailing newline
                    f.write('\n')

            print(f"✅ Fixed {filepath} ({changes_made} joins)")
            return True
        else:
            print(f"⚪ No changes needed for {filepath}")
            return False

    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    print("🔧 Fixing hard-wrapped lines in TypeScript files...\n")

    fixed_count = 0
    for filepath in FILES_TO_FIX:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n✨ Fixed {fixed_count} files")
    print("\n🔍 Run 'npx tsc --noEmit' to check for remaining errors")

if __name__ == "__main__":
    main()
