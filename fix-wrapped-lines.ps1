# Fix TypeScript files with hard-wrapped lines in the middle of code
# These files were saved with line wrapping enabled, breaking syntax

$projectRoot = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
Set-Location $projectRoot

$filesToFix = @(
    'src/components/compliance/SMSOptInComponent.tsx',
    'src/components/education/analytics/LearningAnalytics.tsx',
    'src/components/education/certificates/CertificateViewer.tsx',
    'src/components/education/EnhancedCoursePlayer.tsx',
    'src/components/education/MobileVideoPlayer.tsx',
    'src/components/education/StudentDashboard.tsx',
    'src/components/education/video/EnhancedVideoPlayer.tsx',
    'src/components/education/VideoPlayer.tsx',
    'src/components/marketing/direct-mail/CanvaUploader.tsx',
    'src/components/marketing/direct-mail/MailCampaignManager.tsx',
    'src/lib/api.ts',
    'src/lib/security/key-management.ts',
    'src/services/analytics/LearningAnalytics.ts',
    'src/services/certificates/CertificateService.ts',
    'src/services/certificates/CertificateViewer.tsx',
    'src/services/email/SendGridService.ts',
    'src/services/mail/LobService.ts',
    'src/services/video/CloudflareStreamService.ts',
    'src/video/CloudflareStreamService.ts'
)

Write-Host "🔧 Fixing hard-wrapped lines in TypeScript files..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $filesToFix) {
    $filePath = Join-Path $projectRoot $file

    if (-not (Test-Path $filePath)) {
        Write-Host "⏭️  Skipping $file (not found)" -ForegroundColor Yellow
        continue
    }

    try {
        $content = Get-Content $filePath -Raw
        $originalLength = $content.Length

        # Strategy: Join lines that end mid-expression
        # Look for lines ending with patterns that suggest continuation:
        # - Open parenthesis/bracket/brace with no close
        # - Template literal ${...} split across lines
        # - String concatenation
        # - Incomplete JSX attributes

        $lines = $content -split "`r?`n"
        $fixed = @()
        $i = 0

        while ($i -lt $lines.Count) {
            $line = $lines[$i]
            $nextLine = if (($i + 1) -lt $lines.Count) { $lines[$i + 1] } else { $null }

            # Check if this line should be joined with the next
            $shouldJoin = $false

            if ($nextLine) {
                # Pattern 1: Line ends with incomplete template literal
                if ($line -match '\$\{[^}]*$' -and $nextLine -notmatch '^\s*(const |let |var |function |import |export|return |if |else |for |while)') {
                    $shouldJoin = $true
                }

                # Pattern 2: Line ends with opening but next line starts with content (not new statement)
                if ($line -match '[({[]$' -and $nextLine -match '^\s+[^/\s]' -and $nextLine -notmatch '^\s*(const |let |var |function)') {
                    $shouldJoin = $true
                }

                # Pattern 3: JSX attribute split across lines
                if ($line -match 'className="[^"]*$' -and $nextLine -match '^\s*[^"]*"') {
                    $shouldJoin = $true
                }

                # Pattern 4: URL or long string split
                if ($line -match 'https?://[^"''`\s]*$' -and $nextLine -match '^\s*[^"''`\s]+') {
                    $shouldJoin = $true
                }

                # Pattern 5: Template literal backtick split
                if ($line -match '`[^`]*$' -and $nextLine -match '^[^`]*`') {
                    $shouldJoin = $true
                }
            }

            if ($shouldJoin) {
                # Join this line with next, preserving a single space
                $fixed += $line + $nextLine.TrimStart()
                $i += 2
            }
            else {
                $fixed += $line
                $i++
            }
        }

        $newContent = $fixed -join "`n"

        if ($newContent -ne $content) {
            Set-Content $filePath -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed $file" -ForegroundColor Green
        }
        else {
            Write-Host "⚪ No changes needed for $file" -ForegroundColor Gray
        }

    }
    catch {
        Write-Host "❌ Error fixing $file : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔍 Running TypeScript compiler to check results..." -ForegroundColor Cyan
$output = npx tsc --noEmit 2>&1 | Out-String
$errorCount = ($output | Select-String "error TS" -AllMatches).Matches.Count

if ($errorCount -eq 0) {
    Write-Host "✅ Success! No TypeScript errors remaining!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Still have $errorCount TypeScript errors" -ForegroundColor Yellow
    Write-Host "Run 'npx tsc --noEmit' to see details" -ForegroundColor Gray
}
