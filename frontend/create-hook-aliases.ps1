# Create alias/wrapper files for missing hook imports

$mappings = @{
    # Queries - User
    'hooks/queries/user/useUserStatistics' = 'hooks/queries/user/useStatistics'
    'hooks/queries/user/useUserProfile' = 'hooks/queries/user/useProfile'
    'hooks/queries/user/useUserWallet' = 'hooks/queries/user/useBalance'
    'hooks/queries/user/useUserTransactions' = 'hooks/queries/user/useTransactions'
    'hooks/queries/user/useUserVerification' = 'hooks/queries/user/useProfile'  # Verification in profile
    'hooks/queries/user/useUserGameHistory' = 'hooks/queries/game/useGameHistory'
    'hooks/queries/user/useUserBonuses' = 'hooks/queries/user/useBonuses'
    'hooks/queries/user/useUserNotifications' = 'hooks/useAdminNotifications'  # Generic notifications
    'hooks/queries/user/useUserReferrals' = 'hooks/queries/user/useReferrals'
    
    # Queries - Admin
    'hooks/queries/admin/useAdminDashboard' = 'hooks/queries/admin/useDashboardStats'
    'hooks/queries/useAnalyticsQuery' = 'hooks/queries/admin/useAnalytics'
    'hooks/queries/useUsersQuery' = 'hooks/queries/admin/useUsers'
    'hooks/queries/useUserDetailsQuery' = 'hooks/queries/admin/useUserDetails'
    'hooks/queries/usePartnersQuery' = 'hooks/queries/admin/usePartners'
    'hooks/queries/usePartnerDetailsQuery' = 'hooks/queries/admin/usePartnerDetails'
    'hooks/queries/useDepositRequestsQuery' = 'hooks/queries/admin/useDeposits'
    'hooks/queries/useWithdrawalRequestsQuery' = 'hooks/queries/admin/useWithdrawals'
    'hooks/queries/useGameStateQuery' = 'hooks/queries/game/useCurrentRound'
    'hooks/queries/useGameHistoryQuery' = 'hooks/queries/game/useGameHistory'
    'hooks/queries/useGameSettingsQuery' = 'hooks/queries/game/useCurrentGame'
    'hooks/queries/useSystemSettingsQuery' = 'hooks/queries/admin/useDashboardStats'
    'hooks/queries/useFinancialReportsQuery' = 'hooks/queries/admin/useAnalytics'
    'hooks/queries/usePaymentHistoryQuery' = 'hooks/queries/admin/useAnalytics'
    'hooks/queries/game/useGameRounds' = 'hooks/queries/admin/useGameRounds'
    
    # Queries - Partner
    'hooks/queries/usePartnerDashboardQuery' = 'hooks/queries/partner/usePartnerStatistics'
    'hooks/queries/useMyPlayersQuery' = 'hooks/queries/partner/usePartnerPlayers'
    'hooks/queries/useEarningsHistoryQuery' = 'hooks/queries/partner/usePartnerEarnings'
    'hooks/queries/useReferralStatsQuery' = 'hooks/queries/user/useReferralStats'
    'hooks/queries/usePayoutRequestsQuery' = 'hooks/queries/partner/usePartnerCommissions'
    'hooks/queries/usePartnerSettingsQuery' = 'hooks/queries/partner/usePartnerStatistics'
    
    # Mutations - User
    'hooks/mutations/user/useUpdateProfile' = 'hooks/mutations/admin/useUpdateUser'
    'hooks/mutations/payment/useRequestDeposit' = 'hooks/mutations/payment/useCreateDeposit'
    'hooks/mutations/payment/useRequestWithdrawal' = 'hooks/mutations/payment/useCreateWithdrawal'
    
    # Mutations - Admin
    'hooks/mutations/useApproveDepositMutation' = 'hooks/mutations/admin/useApproveDeposit'
    'hooks/mutations/useRejectDepositMutation' = 'hooks/mutations/admin/useRejectDeposit'
    'hooks/mutations/useApproveWithdrawalMutation' = 'hooks/mutations/admin/useApproveWithdrawal'
    'hooks/mutations/useRejectWithdrawalMutation' = 'hooks/mutations/admin/useRejectWithdrawal'
    'hooks/mutations/useUpdateUserMutation' = 'hooks/mutations/admin/useUpdateUser'
    'hooks/mutations/useStartRoundMutation' = 'hooks/mutations/admin/useCreateRound'
}

Write-Host "Creating hook alias files..." -ForegroundColor Cyan

$created = 0
$skipped = 0

foreach ($missing in $mappings.Keys) {
    $target = $mappings[$missing]
    $missingPath = "src/$missing.ts"
    $targetPath = "src/$target.ts"
    
    # Check if target exists
    if (-not (Test-Path $targetPath)) {
        Write-Host "  SKIP: Target does not exist: $targetPath" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    # Check if already exists
    if (Test-Path $missingPath) {
        Write-Host "  EXISTS: $missingPath" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    # Create directory if needed
    $dir = Split-Path $missingPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Extract hook name from paths
    $missingHook = [System.IO.Path]::GetFileNameWithoutExtension($missing)
    $targetHook = [System.IO.Path]::GetFileNameWithoutExtension($target)
    
    # Calculate relative path from missing to target
    $missingDir = Split-Path $missing -Parent
    $targetRelative = $target -replace "^$missingDir/", ""
    
    # Count directory levels to go up
    $levels = ($missingDir -split '/').Count - ($target -replace '/[^/]+$', '' -split '/').Count
    $upPath = if ($levels -gt 0) { "../" * $levels } else { "./" }
    
    # Determine import path
    $importPath = "@/$target"
    
    # Create alias file
    $content = @"
// Auto-generated alias for $missingHook
export { $targetHook as $missingHook } from '$importPath';
export { $targetHook as default } from '$importPath';
"@
    
    Set-Content -Path $missingPath -Value $content -Encoding UTF8
    Write-Host "  CREATED: $missingPath -> $target" -ForegroundColor Green
    $created++
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Created: $created" -ForegroundColor Green
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  Total mappings: $($mappings.Count)" -ForegroundColor White