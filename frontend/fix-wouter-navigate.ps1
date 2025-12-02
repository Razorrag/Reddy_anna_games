# Fix wouter useNavigate imports to useLocation
Write-Host "Scanning for incorrect wouter useNavigate imports..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx
$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Check if file imports useNavigate from wouter
    if ($content -match "import\s+\{[^}]*useNavigate[^}]*\}\s+from\s+[`"']wouter[`"']") {
        Write-Host "Found in: $($file.FullName)" -ForegroundColor Yellow
        
        # Replace import statement
        $newContent = $content -replace "import\s+\{([^}]*?)useNavigate([^}]*?)\}\s+from\s+[`"']wouter[`"']", 'import {$1useLocation$2} from "wouter"'
        
        # Replace usage: const navigate = useNavigate() -> const [, navigate] = useLocation()
        $newContent = $newContent -replace "const\s+navigate\s*=\s*useNavigate\(\)", "const [, navigate] = useLocation()"
        
        # Replace usage: const { navigate } = useNavigate() -> const [, navigate] = useLocation()
        $newContent = $newContent -replace "const\s+\{\s*navigate\s*\}\s*=\s*useNavigate\(\)", "const [, navigate] = useLocation()"
        
        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "  Fixed!" -ForegroundColor Green
            $fixedCount++
            $modified = $true
        }
    }
}

if ($fixedCount -eq 0) {
    Write-Host "`nNo files needed fixing" -ForegroundColor Green
} else {
    Write-Host "`nFixed $fixedCount file(s)" -ForegroundColor Green
}