$file = "src\pages\PresentationBuilderPage.tsx"
$content = Get-Content $file -Raw

# Fix the filename issues - need to escape backticks properly
$oldPDFLine = '        const filename = ${propertyData.address.replace(/[^a-zA-Z0-9]/g, ''_'')}_presentation.pdf;'
$newPDFLine = '        const filename = `${propertyData.address.replace(/[^a-zA-Z0-9]/g, ''_'')}_presentation.pdf`;'
$content = $content.Replace($oldPDFLine, $newPDFLine)

$oldPPTXLine = '        const filename = ${propertyData.address.replace(/[^a-zA-Z0-9]/g, ''_'')}_presentation.pptx;'
$newPPTXLine = '        const filename = `${propertyData.address.replace(/[^a-zA-Z0-9]/g, ''_'')}_presentation.pptx`;'
$content = $content.Replace($oldPPTXLine, $newPPTXLine)

$content | Set-Content $file

Write-Host "✅ Fixed template literal syntax" -ForegroundColor Green
