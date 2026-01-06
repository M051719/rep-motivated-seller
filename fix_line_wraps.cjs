const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = 'c:\\Users\\monte\\Documents\\cert api token keys ids\\supabase project deployment\\rep-motivated-seller';

const FILES_TO_FIX = [
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
];

function shouldJoinLines(line, nextLine) {
    if (!nextLine) return false;
    
    const lineStripped = line.trimEnd();
    const nextStripped = nextLine.trimStart();
    
    // Skip if next line starts with a clear statement
    if (/^\s*(const |let |var |function |class |import |export |return |if |else |for |while |switch |case |default |\/\/|\/\*)/.test(nextLine)) {
        return false;
    }
    
    // Pattern 1: Template literal split (${...} not closed)
    if (lineStripped.includes('${')) {
        const lastDollar = lineStripped.lastIndexOf('${');
        if (!lineStripped.substring(lastDollar).includes('}') && nextStripped.includes('}')) {
            return true;
        }
    }
    
    // Pattern 2: className or other attribute split
    if (/className="[^"]*$/.test(lineStripped) && /^\s*[^"]*"/.test(nextLine)) {
        return true;
    }
    
    // Pattern 3: Template literal backtick split
    if ((lineStripped.match(/`/g) || []).length % 2 === 1) {
        return true;
    }
    
    // Pattern 4: Regular string split
    const doubleQuotes = (lineStripped.match(/"/g) || []).length - (lineStripped.match(/\\"/g) || []).length;
    const singleQuotes = (lineStripped.match(/'/g) || []).length - (lineStripped.match(/\\'/g) || []).length;
    
    if (doubleQuotes % 2 === 1 || singleQuotes % 2 === 1) {
        if (!/^\s*(const |let |var |function |import |export |return)/.test(nextLine)) {
            return true;
        }
    }
    
    // Pattern 5: JSX attribute incomplete
    if (/\w+="[^"]*$/.test(lineStripped) || /\w+=\{[^}]*$/.test(lineStripped)) {
        return true;
    }
    
    // Pattern 6: URL split
    if (/https?:\/\/[^\s"'`]*$/.test(lineStripped) && /^\s*[^\s"'`]*["']/.test(nextLine)) {
        return true;
    }
    
    return false;
}

function fixFile(filepath) {
    const fullPath = path.join(PROJECT_ROOT, filepath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skipping ${filepath} (not found)`);
        return false;
    }
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split(/\r?\n/);
        
        const fixedLines = [];
        let i = 0;
        let changesMade = 0;
        
        while (i < lines.length) {
            const currentLine = lines[i];
            const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
            
            if (shouldJoinLines(currentLine, nextLine)) {
                const joined = currentLine.trimEnd() + nextLine.trimStart();
                fixedLines.push(joined);
                changesMade++;
                i += 2;
            } else {
                fixedLines.push(currentLine);
                i++;
            }
        }
        
        if (changesMade > 0) {
            fs.writeFileSync(fullPath, fixedLines.join('\n'), 'utf8');
            console.log(`✅ Fixed ${filepath} (${changesMade} joins)`);
            return true;
        } else {
            console.log(`⚪ No changes needed for ${filepath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filepath}:`, error.message);
        return false;
    }
}

console.log('🔧 Fixing hard-wrapped lines in TypeScript files...\n');

let fixedCount = 0;
for (const filepath of FILES_TO_FIX) {
    if (fixFile(filepath)) {
        fixedCount++;
    }
}

console.log(`\n✨ Fixed ${fixedCount} files`);
console.log('\n🔍 Run \'npx tsc --noEmit\' to check for remaining errors');
