# Aggressive fix: Join lines that appear to be wrapped mid-expression
$files = @(
    "src/components/compliance/SMSOptInComponent.tsx"
)

foreach ($file in $files) {
    $path = "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\$file"
    $content = Get-Content $path -Raw
    
    # Replace common patterns where lines are broken:
    # 1. Template literals split across lines
    $content = $content -replace '(\$\{[^}]+)\r?\n\s*([^}]+\})', '$1$2'
    
    # 2. Long strings split across lines in JSX  attributes
    $content = $content -replace '(className="[^"]+)\r?\n\s*([^"]+")','$1 $2'
    
    # 3. Function calls split across lines
    $content = $content -replace '(\([^)]+)\r?\n\s*([^)]+\))', '$1$2'
    
    Set-Content $path -Value $content -NoNewline -Encoding UTF8
    Write-Host "Fixed $file"
}
