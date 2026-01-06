#!/usr/bin/env node
/**
 * Script to fix line-wrap issues in TypeScript files
 * These errors occur when lines are broken in the middle of strings or JSX
 */

const fs = require('fs');
const path = require('path');

const files = [
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
  'src/services/video/CloudflareStreamService.ts'
];

console.log('🔧 Fixing line-wrap issues in TypeScript files...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${file} (not found)`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // Fix 1: Join lines broken in the middle of template literals
    // Pattern: line ending without closing backtick, next line starts mid-string
    content = content.replace(/`([^`\n]*)\n\s*([^`]*)`/g, '`$1$2`');
    
    // Fix 2: Join lines broken in className attributes
    // Pattern: className=" text on one line
    //          more text on next line"
    content = content.replace(/className="([^"\n]*)\n\s*([^"]*)"/ g, 'className="$1 $2"');
    
    // Fix 3: Join lines broken in regular strings
    // Pattern: "text on one line
    //          more text on next line"
    const lines = content.split('\n');
    const fixedLines = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check if line has unclosed string that continues on next line
      const doubleQuotes = (line.match(/"/g) || []).length;
      const singleQuotes = (line.match(/'/g) || []).length;
      
      // If odd number of quotes, string is likely broken
      if ((doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) && i < lines.length - 1) {
        // Join with next line
        const nextLine = lines[i + 1];
        const trimmedNext = nextLine.trimStart();
        
        // Only join if next line doesn't start with common code patterns
        if (!trimmedNext.match(/^(const |let |var |function |class |import |export |return |if |else |for |while |switch |case |default)/)) {
          fixedLines.push(line + trimmedNext);
          fixed = true;
          i += 2;
          continue;
        }
      }
      
      fixedLines.push(line);
      i++;
    }
    
    content = fixedLines.join('\n');
    
    // Write back if changes were made
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✨ Done! Run `npx tsc --noEmit` to check for remaining errors.');
