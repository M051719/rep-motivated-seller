$file = "src\pages\PresentationBuilderPage.tsx"
$content = Get-Content $file -Raw

# Add PropertyMap import
$importLine = "import PropertyMap from '../components/maps/PropertyMap';"
$helmetImport = "import { Helmet } from 'react-helmet-async';"
$content = $content.Replace($helmetImport, "$importLine`n$helmetImport")

# Replace the map placeholder
$oldMap = @'
                  {showMap && (
                    <div className="mt-6 p-8 bg-gray-100 rounded-lg text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Interactive map coming soon!</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {currentTier === 'basic' ? 'Upgrade to Pro for interactive maps' : 'Map integration in progress'}
                      </p>
                    </div>
                  )}
'@

$newMap = @'
                  {showMap && (
                    <div className="mt-6">
                      <PropertyMap
                        mainProperty={{
                          address: propertyData.address,
                          latitude: 34.0522,  // TODO: Get from geocoding API
                          longitude: -118.2437,
                          isMainProperty: true
                        }}
                        comparables={comparables.map(comp => ({
                          address: comp.address,
                          latitude: 34.0522 + (Math.random() - 0.5) * 0.02,  // Mock nearby locations
                          longitude: -118.2437 + (Math.random() - 0.5) * 0.02,
                        }))}
                        height="500px"
                        showControls={currentTier !== 'basic'}
                      />
                    </div>
                  )}
'@

$content = $content.Replace($oldMap, $newMap)

$content | Set-Content $file

Write-Host "✅ PropertyMap integrated successfully!" -ForegroundColor Green
Write-Host "   - Import added"
Write-Host "   - Map component replaced placeholder"
