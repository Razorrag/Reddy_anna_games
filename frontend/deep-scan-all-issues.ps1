# Deep scan for ALL frontend issues: animations, styling, TypeScript, imports, etc.

Write-Host "`n=== DEEP FRONTEND ISSUE SCAN ===" -ForegroundColor Cyan
Write-Host "Scanning for: imports, animations, styling, types, dependencies, configs`n" -ForegroundColor Gray

$issues = @()
$warnings = @()

# 1. Check for animation-related issues
Write-Host "[1/8] Scanning animation issues..." -ForegroundColor Yellow
$animationFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts,*.css | Select-String -Pattern "(animate-|animation-|@keyframes|framer-motion|transition-)" -List
foreach ($match in $animationFiles) {
    $file = $match.Path
    $content = Get-Content $file -Raw
    
    # Check for undefined animations in Tailwind
    if ($content -match "animate-([a-zA-Z0-9-]+)") {
        $warnings += "Animation check needed: $file"
    }
    
    # Check for framer-motion without proper import
    if ($content -match "motion\." -and $content -notmatch "import.*framer-motion") {
        $issues += "Missing framer-motion import: $file"
    }
}

# 2. Check for CSS/Tailwind issues
Write-Host "[2/8] Scanning CSS/Tailwind issues..." -ForegroundColor Yellow
$cssFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.css
foreach ($file in $cssFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for custom classes that might not exist
    if ($content -match "className=[`"']([^`"']*)[`"']") {
        $classes = $matches[1] -split '\s+'
        foreach ($class in $classes) {
            # Check for potential undefined utilities
            if ($class -match "^(shadow-|bg-|text-|border-)" -and $class -notmatch "^(shadow-sm|shadow-md|shadow-lg|shadow-xl|shadow-2xl|shadow-none)") {
                if ($class -match "shadow-[a-z]+-") {
                    $warnings += "Custom shadow class in $($file.Name): $class"
                }
            }
        }
    }
}

# 3. Check for TypeScript type issues
Write-Host "[3/8] Scanning TypeScript type issues..." -ForegroundColor Yellow
$tsFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for 'any' types
    if ($content -match ": any\b") {
        $warnings += "Using 'any' type in $($file.Name)"
    }
    
    # Check for missing return types on functions
    if ($content -match "function\s+\w+\([^)]*\)\s*\{" -and $content -notmatch "function\s+\w+\([^)]*\):\s*\w+") {
        $warnings += "Missing return type in $($file.Name)"
    }
    
    # Check for @ts-ignore or @ts-expect-error
    if ($content -match "@ts-(ignore|expect-error)") {
        $issues += "TypeScript error suppression in $($file.Name)"
    }
}

# 4. Check for missing dependencies in imports
Write-Host "[4/8] Scanning import dependencies..." -ForegroundColor Yellow
$importPattern = "import\s+.*\s+from\s+[`"']([^`"']+)[`"']"
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    $imports = [regex]::Matches($content, $importPattern)
    
    foreach ($import in $imports) {
        $importPath = $import.Groups[1].Value
        
        # Check for external packages
        if ($importPath -notmatch "^(\.|@/)" -and $importPath -notmatch "^(react|react-dom)") {
            $packageName = $importPath -split "/" | Select-Object -First 1
            if ($packageName -match "^@") {
                $packageName = ($importPath -split "/" | Select-Object -First 2) -join "/"
            }
            
            # Will check against package.json later
            $warnings += "External import in $($file.Name): $packageName"
        }
    }
}

# 5. Check package.json for consistency
Write-Host "[5/8] Scanning package.json consistency..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$installedDeps = @()
$installedDeps += $packageJson.dependencies.PSObject.Properties.Name
$installedDeps += $packageJson.devDependencies.PSObject.Properties.Name

# Check if warned packages are installed
$externalPackages = $warnings | Where-Object { $_ -match "External import.*: (.+)" } | ForEach-Object {
    if ($_ -match "External import.*: (.+)") { $matches[1] }
} | Select-Object -Unique

foreach ($pkg in $externalPackages) {
    if ($pkg -notin $installedDeps) {
        $issues += "Package NOT in package.json: $pkg"
    }
}

# 6. Check for hardcoded values that should be env vars
Write-Host "[6/8] Scanning for hardcoded values..." -ForegroundColor Yellow
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for hardcoded URLs
    if ($content -match "https?://(?!example\.)([a-zA-Z0-9.-]+)" -and $file.Name -notmatch "(test|spec)") {
        $warnings += "Hardcoded URL in $($file.Name)"
    }
    
    # Check for hardcoded API keys or secrets
    if ($content -match "(apiKey|secretKey|token)\s*=\s*[`"'][^`"']+[`"']") {
        $issues += "Potential hardcoded secret in $($file.Name)"
    }
}

# 7. Check for console.log statements
Write-Host "[7/8] Scanning for console statements..." -ForegroundColor Yellow
foreach ($file in $tsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "console\.(log|debug|info)" -and $file.Name -notmatch "(test|spec)") {
        $warnings += "Console statement in $($file.Name)"
    }
}

# 8. Check component file structure
Write-Host "[8/8] Scanning component structure..." -ForegroundColor Yellow
$componentDirs = @("src/components", "src/pages")
foreach ($dir in $componentDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Recurse -Include *.tsx
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw
            
            # Check for default export in component files
            if ($content -notmatch "export default" -and $content -notmatch "export \{[^}]*as default") {
                $warnings += "No default export in component: $($file.Name)"
            }
            
            # Check for proper React import
            if ($content -match "React\." -and $content -notmatch "import React") {
                $issues += "Missing React import in $($file.Name)"
            }
        }
    }
}

# Summary
Write-Host "`n=== SCAN RESULTS ===" -ForegroundColor Cyan

if ($issues.Count -gt 0) {
    Write-Host "`nCRITICAL ISSUES ($($issues.Count)):" -ForegroundColor Red
    $issues | Sort-Object -Unique | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
} else {
    Write-Host "`n✅ No critical issues found!" -ForegroundColor Green
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    $warnings | Sort-Object -Unique | Select-Object -First 20 | ForEach-Object { Write-Host "  ⚠️  $_" -ForegroundColor Yellow }
    if ($warnings.Count -gt 20) {
        Write-Host "  ... and $($warnings.Count - 20) more warnings" -ForegroundColor Gray
    }
} else {
    Write-Host "`n✅ No warnings!" -ForegroundColor Green
}

# Generate detailed report
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    criticalIssues = $issues | Sort-Object -Unique
    warnings = $warnings | Sort-Object -Unique
    summary = @{
        totalIssues = $issues.Count
        totalWarnings = $warnings.Count
        filesScanned = $tsFiles.Count
    }
}

$report | ConvertTo-Json -Depth 5 | Out-File "scan-report.json" -Encoding UTF8
Write-Host "`n📄 Detailed report saved to: scan-report.json" -ForegroundColor Cyan

Write-Host "`n=== RECOMMENDATIONS ===" -ForegroundColor Cyan
if ($issues.Count -gt 0) {
    Write-Host "1. Fix all critical issues before deployment" -ForegroundColor Red
    Write-Host "2. Review hardcoded secrets and URLs" -ForegroundColor Yellow
    Write-Host "3. Add missing imports and dependencies" -ForegroundColor Yellow
}
if ($warnings.Count -gt 0) {
    Write-Host "4. Review warnings for potential improvements" -ForegroundColor Yellow
    Write-Host "5. Remove console.log statements from production code" -ForegroundColor Yellow
    Write-Host "6. Add proper TypeScript types" -ForegroundColor Yellow
}

Write-Host "`n"