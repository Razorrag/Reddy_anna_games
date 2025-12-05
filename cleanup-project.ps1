# Raju Gari Kossu - Project Cleanup Script
# This script removes unnecessary development documents and duplicate files
# Run from the project root directory

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Raju Gari Kossu - Project Cleanup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Files to KEEP (essential documentation)
$keepFiles = @(
    "README.md",
    "DEPLOY.md", 
    "SETUP_GUIDE.md",
    "START.md",
    "SIMPLE_START.md",
    "UBUNTU_SETUP.md",
    "DOCKER_START.md",
    "CREATE_ADMIN_ACCOUNT.md",
    "MASTER_DEPLOYMENT_READINESS.md"
)

# Root level MD files to DELETE
$rootMdFilesToDelete = @(
    "ADMIN_NOTIFICATION_PANEL_DESIGN.md",
    "ALL_CRITICAL_FIXES_COMPLETE.md",
    "API_URL_FIX_COMPLETE.md",
    "BACKEND_COMPILATION_STATUS.md",
    "BACKEND_COMPLETE_SUMMARY.md",
    "BACKEND_FIX_COMPLETE.md",
    "BACKEND_IMPLEMENTATION_COMPLETE.md",
    "BUILD_AND_RUN.md",
    "CLEAN_REBUILD_DEPLOY.md",
    "COMPLETE_ANALYTICS_AND_ADMIN_VERIFICATION.md",
    "COMPLETE_AUDIT_AND_FIXES.md",
    "COMPLETE_AUDIT_FINDINGS_AND_NEXT_STEPS.md",
    "COMPLETE_DATA_FLOW_ARCHITECTURE.md",
    "COMPLETE_FIXES_IMPLEMENTATION_GUIDE.md",
    "COMPLETE_FIXES_SUMMARY.md",
    "COMPLETE_FRONTEND_FIXES_AND_STATUS.md",
    "COMPLETE_IMPLEMENTATION_ROADMAP.md",
    "COMPLETE_LEGACY_FEATURE_EXTRACTION.md",
    "COMPLETE_LEGACY_VS_NEW_ANALYSIS.md",
    "COMPLETE_PROJECT_DELIVERY.md",
    "COMPLETE_PROJECT_STATUS.md",
    "COMPLETE_SYSTEM_ANALYSIS.md",
    "COMPLETE_SYSTEM_AUDIT.md",
    "COMPLETE_SYSTEM_FIX_GUIDE.md",
    "COMPLETE_SYSTEM_FIX_PLAN.md",
    "COMPLETE_SYSTEM_INTEGRATION_AUDIT.md",
    "COMPLETE_SYSTEM_MAPPING.md",
    "COMPREHENSIVE_AUDIT_AND_IMPLEMENTATION_PLAN.md",
    "COMPREHENSIVE_GAP_ANALYSIS_AND_FIXES.md",
    "COMPREHENSIVE_SYSTEM_AUDIT_REPORT.md",
    "CRITICAL_5_PERCENT_FIXES_COMPLETE.md",
    "CRITICAL_BACKEND_FIXES_COMPLETE.md",
    "CRITICAL_ISSUES_AND_FIXES.md",
    "DATABASE_SCHEMA_AUDIT.md",
    "DEEP_LEGACY_ANALYSIS_AND_NEXT_STEPS.md",
    "DEEP_SYSTEM_COMPARISON_ANALYSIS.md",
    "FEATURE_PARITY_ANALYSIS.md",
    "FINAL_2_PERCENT_FIXES_COMPLETE.md",
    "FINAL_DEPLOYMENT_STEPS.md",
    "FINAL_FIXES_COMPLETE.md",
    "FINAL_IMPLEMENTATION_COMPLETE_PLAN.md",
    "FINAL_PROJECT_SUMMARY.md",
    "FIXES_COMPLETE.md",
    "FIXES_PROGRESS_REPORT.md",
    "FIXES_STATUS_REPORT.md",
    "FIX_DOCKER_APP.md",
    "FRONTEND_ANALYSIS_AND_PLAN.md",
    "FRONTEND_BACKEND_CONNECTION_VERIFIED.md",
    "FRONTEND_BACKEND_MISMATCH_ANALYSIS.md",
    "FRONTEND_BUILD_FIX_COMPLETE.md",
    "FRONTEND_IMPLEMENTATION_STATUS.md",
    "FRONTEND_MISSING_IMPORTS_ANALYSIS.md",
    "LANDING_PAGE_AUTHENTICATION_ANALYSIS.md",
    "LEGACY_SYSTEM_ANALYSIS.md",
    "LEGACY_VS_NEW_ARCHITECTURE_DIAGRAM.md",
    "LEGACY_VS_NEW_ARCHITECTURE_DIAGRAMS.md",
    "LEGACY_VS_NEW_PARTNER_SYSTEM.md",
    "MOBILE_GAME_OPTIMIZATION_PLAN.md",
    "MOBILE_LAYOUT_LEGACY_PARITY_ANALYSIS.md",
    "MODERN_IMPROVEMENTS_COMPLETE_SUMMARY.md",
    "OBS_STUDIO_COMPLETE_SETUP.md",
    "OVENMEDIAENGINE_STREAMING_COMPLETE.md",
    "PAGES_CREATED_SUMMARY.md",
    "PHASE_19_MOBILE_OPTIMIZATION_COMPLETE.md",
    "PHASE_20_STREAMING_IMPLEMENTATION.md",
    "PHASE_22_MODERN_IMPROVEMENTS_IMPLEMENTATION.md",
    "PROJECT_STATUS.md",
    "PROJECT_STATUS_REPORT.md",
    "PROJECT_STATUS_SUMMARY.md",
    "REMAINING_2_PERCENT_BREAKDOWN.md",
    "REMAINING_IMPLEMENTATION_GUIDE.md",
    "ROUTES_AND_PAGES_AUDIT.md",
    "ROYAL_THEME_IMPLEMENTATION_GUIDE.md",
    "ROYAL_THEME_STATUS_REPORT.md",
    "SESSION_PROGRESS_SUMMARY.md",
    "STREAMING_IMPLEMENTATION_COMPLETE.md",
    "SYSTEMATIC_FIX_SUMMARY.md",
    "SYSTEM_100_PERCENT_COMPLETE.md",
    "SYSTEM_100_PERCENT_COMPLETION_GUIDE.md",
    "TWO_TIER_COMMISSION_IMPLEMENTATION_SUMMARY.md",
    "TYPESCRIPT_COMPILATION_FIXES.md",
    "TYPESCRIPT_FIXES_COMPLETE.md",
    "TYPESCRIPT_STREAMING_TESTING_COMPLETE_AUDIT.md",
    "UPGRADE_DOCKER_AND_DEPLOY.md"
)

# Frontend MD files to DELETE
$frontendMdFilesToDelete = @(
    "ADMIN_NOTIFICATION_PANEL_IMPLEMENTATION.md",
    "ASSET_MIGRATION_PLAN.md",
    "FRONTEND_CORE_SETUP_COMPLETE.md",
    "NAVIGATION_FIXES.md",
    "PHASE_11_COMPLETE_SUMMARY.md",
    "PHASE_12_COMPLETE_SUMMARY.md",
    "PHASE_12_STATE_MANAGEMENT_PROGRESS.md",
    "PHASE_13_PROGRESS.md",
    "PHASE_14_COMPLETE.md",
    "PHASE_15_COMPLETE.md",
    "PHASE_15_PROGRESS.md",
    "PHASE_16_COMPLETE.md",
    "PHASE_16_PROGRESS.md",
    "PHASE_17_PROGRESS.md",
    "PHASE_17_SESSION_SUMMARY.md",
    "WOUTER_NAVIGATION_FIX.md"
)

# Frontend PS1 scripts to DELETE
$frontendScriptsToDelete = @(
    "check-missing-imports.ps1",
    "create-final-aliases.ps1",
    "create-hook-aliases.ps1",
    "create-missing-page-wrappers.ps1",
    "create-remaining-stubs.ps1",
    "deep-scan-all-issues.ps1",
    "fix-routing-imports.ps1",
    "fix-wouter-navigate.ps1"
)

# Other files to DELETE
$otherFilesToDelete = @(
    "frontend/scan-report.json",
    "frontend/tailwind.config.modern.js"
)

Write-Host "Phase 1: Deleting root-level MD files..." -ForegroundColor Yellow
$deletedCount = 0
$skippedCount = 0

foreach ($file in $rootMdFilesToDelete) {
    $path = Join-Path $PSScriptRoot $file
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  Deleted: $file" -ForegroundColor Green
        $deletedCount++
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Phase 2: Deleting frontend MD files..." -ForegroundColor Yellow

foreach ($file in $frontendMdFilesToDelete) {
    $path = Join-Path -Path $PSScriptRoot -ChildPath "frontend\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  Deleted: frontend/$file" -ForegroundColor Green
        $deletedCount++
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Phase 3: Deleting frontend PS1 scripts..." -ForegroundColor Yellow

foreach ($file in $frontendScriptsToDelete) {
    $path = Join-Path -Path $PSScriptRoot -ChildPath "frontend\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  Deleted: frontend/$file" -ForegroundColor Green
        $deletedCount++
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Phase 4: Deleting other unnecessary files..." -ForegroundColor Yellow

foreach ($file in $otherFilesToDelete) {
    $path = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  Deleted: $file" -ForegroundColor Green
        $deletedCount++
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Files deleted: $deletedCount" -ForegroundColor Green
Write-Host "  Files not found (already deleted): $skippedCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Essential files kept:" -ForegroundColor Cyan
foreach ($file in $keepFiles) {
    Write-Host "    - $file" -ForegroundColor White
}
Write-Host ""
Write-Host "  Note: The 'andar_bahar' folder is kept for reference." -ForegroundColor Yellow
Write-Host "  To remove it completely, run:" -ForegroundColor Yellow
Write-Host "    Remove-Item -Recurse -Force .\andar_bahar" -ForegroundColor Gray
Write-Host ""
