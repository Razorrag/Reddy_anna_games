# PowerShell script to fix react-router-dom imports to wouter

$files = @(
    "src/pages/user/Wallet.tsx",
    "src/pages/user/Verification.tsx",
    "src/pages/user/Support.tsx",
    "src/pages/user/Notifications.tsx",
    "src/pages/user/Settings.tsx",
    "src/pages/user/GameHistory.tsx",
    "src/pages/user/Referrals.tsx",
    "src/pages/user/Profile.tsx",
    "src/pages/user/Transactions.tsx",
    "src/pages/user/Bonuses.tsx",
    "src/pages/partner/Dashboard.tsx",
    "src/pages/admin/Dashboard.tsx",
    "src/pages/admin/UsersList.tsx",
    "src/pages/admin/UserDetails.tsx",
    "src/pages/admin/PartnersList.tsx",
    "src/pages/admin/PartnerDetails.tsx",
    "src/pages/partner/MyPlayers.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        
        # Replace import statement
        $content = $content -replace "import \{ useNavigate \} from 'react-router-dom';", "import { useLocation } from 'wouter';"
        $content = $content -replace 'import \{ useNavigate \} from "react-router-dom";', 'import { useLocation } from "wouter";'
        
        # Replace Link import for Dashboard files
        $content = $content -replace "import \{ Link \} from 'react-router-dom';", "import { Link } from 'wouter';"
        $content = $content -replace 'import \{ Link \} from "react-router-dom";', 'import { Link } from "wouter";'
        
        # Replace useParams and useNavigate combined
        $content = $content -replace "import \{ useParams, useNavigate \} from 'react-router-dom';", "import { useLocation } from 'wouter';"
        $content = $content -replace 'import \{ useParams, useNavigate \} from "react-router-dom";', 'import { useLocation } from "wouter";'
        
        # Replace useNavigate hook usage
        $content = $content -replace "const navigate = useNavigate\(\);", "const [, setLocation] = useLocation();"
        
        # Replace navigate() calls with various quote types
        $content = $content -replace "navigate\('([^']+)'\)", 'setLocation(''$1'')'
        $content = $content -replace 'navigate\("([^"]+)"\)', 'setLocation("$1")'
        
        # Replace Link to= with href=
        $content = $content -replace '<Link to=', '<Link href='
        
        # Save file
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "  Fixed successfully" -ForegroundColor Green
    } else {
        Write-Host "  File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All files processed!" -ForegroundColor Green
Write-Host "Note: Files with useParams will need manual fixing" -ForegroundColor Yellow