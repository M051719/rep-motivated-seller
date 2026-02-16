$file = "src\pages\PresentationBuilderPage.tsx"
$content = Get-Content $file -Raw

# Replace the PDF export placeholder
$oldPDF = @"
      if (format === 'pdf') {
        // Generate PDF using jsPDF or server-side service
        toast.success('PDF generated successfully!');
        // Trigger download
"@

$newPDF = @"
      if (format === 'pdf') {
        // Generate PDF
        const blob = await generatePDF(presentationData);
        const filename = `${propertyData.address.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pdf`;
        downloadBlob(blob, filename);
        toast.success('PDF downloaded successfully!');
"@

$content = $content.Replace($oldPDF, $newPDF)

# Replace the PPTX export placeholder
$oldPPTX = @"
      } else if (format === 'pptx') {
        // Generate PowerPoint using PptxGenJS or server-side
        toast.success('PowerPoint generated successfully!');
"@

$newPPTX = @"
      } else if (format === 'pptx') {
        // Generate PowerPoint
        const blob = await generatePPTX(presentationData);
        const filename = `${propertyData.address.replace(/[^a-zA-Z0-9]/g, '_')}_presentation.pptx`;
        downloadBlob(blob, filename);
        toast.success('PowerPoint downloaded successfully!');
"@

$content = $content.Replace($oldPPTX, $newPPTX)

# Replace the email placeholder
$oldEmail = @"
        // Call email service
        toast.success('Presentation sent to your email!');
"@

$newEmail = @"
        // Generate PDF and send via email
        const blob = await generatePDF(presentationData);
        const result = await sendPresentationEmail(user.email, blob, 'pdf', propertyData.address);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
          return;
        }
"@

$content = $content.Replace($oldEmail, $newEmail)

# Save updated content
$content | Set-Content $file

Write-Host "✅ Export functions updated successfully!" -ForegroundColor Green
Write-Host "   - PDF generation implemented"
Write-Host "   - PowerPoint generation implemented"
Write-Host "   - Email sending implemented"
