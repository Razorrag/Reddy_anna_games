# PowerShell script to create all missing page wrapper exports

Write-Host "Creating missing page wrapper exports..." -ForegroundColor Cyan

# Admin Pages
$adminPages = @(
    @{Name="AdminUsersPage"; Target="UsersList"},
    @{Name="AdminGameControlPage"; Target="GameControl"},
    @{Name="AdminDepositsPage"; Target="DepositRequests"},
    @{Name="AdminWithdrawalsPage"; Target="WithdrawalRequests"},
    @{Name="AdminBonusesPage"; Target="SystemSettings"},
    @{Name="AdminPartnersPage"; Target="PartnersList"},
    @{Name="AdminAnalyticsPage"; Target="Analytics"},
    @{Name="AdminReportsPage"; Target="FinancialReports"},
    @{Name="AdminSettingsPage"; Target="SystemSettings"},
    @{Name="AdminGameHistoryPage"; Target="GameHistory"},
    @{Name="AdminTransactionsPage"; Target="PaymentHistory"},
    @{Name="AdminUserDetailsPage"; Target="UserDetails"},
    @{Name="AdminPartnerDetailsPage"; Target="PartnerDetails"},
    @{Name="AdminStreamSettingsPage"; Target="GameSettings"}
)

foreach ($page in $adminPages) {
    $filePath = "src/pages/admin/$($page.Name).tsx"
    $content = @"
// Re-export $($page.Target) as $($page.Name)
export { default as $($page.Name) } from './$($page.Target)';
"@
    Set-Content -Path $filePath -Value $content
    Write-Host "  Created $filePath" -ForegroundColor Green
}

# Partner Pages
$partnerPages = @(
    @{Name="PartnerDashboardPage"; Target="Dashboard"},
    @{Name="PartnerProfilePage"; Target="Settings"},
    @{Name="PartnerPlayersPage"; Target="MyPlayers"},
    @{Name="PartnerWithdrawalsPage"; Target="PayoutRequests"},
    @{Name="PartnerCommissionsPage"; Target="EarningsHistory"},
    @{Name="PartnerGameHistoryPage"; Target="ReferralStats"}
)

foreach ($page in $partnerPages) {
    $filePath = "src/pages/partner/$($page.Name).tsx"
    $content = @"
// Re-export $($page.Target) as $($page.Name)
export { default as $($page.Name) } from './$($page.Target)';
"@
    Set-Content -Path $filePath -Value $content
    Write-Host "  Created $filePath" -ForegroundColor Green
}

Write-Host "`nAll page wrappers created successfully!" -ForegroundColor Green
Write-Host "Run 'git add .' and restart the frontend container to apply changes." -ForegroundColor Yellow