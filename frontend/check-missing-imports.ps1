# PowerShell script to find all missing imports in TypeScript/TSX files

Write-Host "Scanning for missing imports..." -ForegroundColor Cyan

$missingImports = @()

# Get all .ts and .tsx files
$files = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Match all imports from @/
    $imports = [regex]::Matches($content, "import.*from\s+['""]@/([^'""]+)['""]")
    
    foreach ($match in $imports) {
        $importPath = $match.Groups[1].Value
        $fullPath = "src/$importPath"
        
        # Check if file exists (with or without extension)
        $exists = $false
        if (Test-Path "$fullPath.ts") { $exists = $true }
        if (Test-Path "$fullPath.tsx") { $exists = $true }
        if (Test-Path "$fullPath.js") { $exists = $true }
        if (Test-Path "$fullPath.jsx") { $exists = $true }
        if (Test-Path "$fullPath/index.ts") { $exists = $true }
        if (Test-Path "$fullPath/index.tsx") { $exists = $true }
        
        if (-not $exists) {
            $missingImports += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + "\", "")
                Import = $importPath
            }
        }
    }
}

if ($missingImports.Count -eq 0) {
    Write-Host "`nNo missing imports found!" -ForegroundColor Green
} else {
    Write-Host "`nFound $($missingImports.Count) missing imports:" -ForegroundColor Red
    $missingImports | ForEach-Object {
        Write-Host "  $($_.File)" -ForegroundColor Yellow
        Write-Host "    Missing: @/$($_.Import)" -ForegroundColor Red
    }
}