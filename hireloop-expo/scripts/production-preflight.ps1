[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = (Resolve-Path -LiteralPath (Join-Path $scriptDirectory '..')).Path
$gitRoot = (& git -C $appRoot rev-parse --show-toplevel).Trim()

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitRoot)) {
    throw 'Git root tidak dapat ditemukan.'
}

Write-Host "Git root : $gitRoot"
Write-Host "Expo app : $appRoot"

$branch = (& git -C $gitRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) {
    throw 'Branch Git tidak dapat dibaca.'
}

if ($branch -ne 'main') {
    throw "Production build hanya diizinkan dari branch main. Branch aktif: $branch"
}

$status = @(& git -C $gitRoot status --porcelain --untracked-files=all)
if ($LASTEXITCODE -ne 0) {
    throw 'Status Git tidak dapat dibaca.'
}

if ($status.Count -gt 0) {
    Write-Host 'Perubahan yang belum di-commit:' -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    throw 'Production build dibatalkan. Worktree harus bersih agar source build konsisten dan dapat direproduksi.'
}

$head = (& git -C $gitRoot rev-parse HEAD).Trim()
$upstream = (& git -C $gitRoot rev-parse '@{upstream}' 2>$null).Trim()

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($upstream)) {
    throw 'Upstream branch belum tersedia. Jalankan git fetch dan pastikan main melacak origin/main.'
}

if ($head -ne $upstream) {
    throw 'HEAD lokal berbeda dari upstream. Jalankan git fetch, review perbedaan, lalu sinkronkan melalui workflow Git yang disetujui.'
}

$forbiddenTracked = @(
    & git -C $gitRoot ls-files -- `
        'hireloop-expo/artifacts/**' `
        'hireloop-expo/dist/**' `
        'hireloop-expo/dist-*/**' `
        'hireloop-expo/**/*.apk' `
        'hireloop-expo/**/*.aab' `
        'hireloop-expo/.env*.local' `
        'hireloop-expo/.env.production'
)

if ($LASTEXITCODE -ne 0) {
    throw 'Daftar file Git tidak dapat diperiksa.'
}

if ($forbiddenTracked.Count -gt 0) {
    Write-Host 'File terlarang yang masih tercatat di Git:' -ForegroundColor Red
    $forbiddenTracked | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    throw 'Production build dibatalkan. Keluarkan artifact/generated file dari Git melalui perubahan yang direview.'
}

$rootEasIgnore = Join-Path $gitRoot '.easignore'
if (-not (Test-Path -LiteralPath $rootEasIgnore)) {
    throw "Root .easignore tidak ditemukan: $rootEasIgnore"
}

$ignoreRules = @(Get-Content -LiteralPath $rootEasIgnore)
$requiredRules = @(
    'node_modules/',
    'hireloop-expo/node_modules/',
    'hireloop-expo/artifacts/',
    'hireloop-expo/dist/',
    'hireloop-expo/dist-*/',
    'hireloop-expo/**/*.apk',
    'hireloop-expo/**/*.aab',
    'hireloop-expo/.expo/'
)

$missingRules = @($requiredRules | Where-Object { $_ -notin $ignoreRules })
if ($missingRules.Count -gt 0) {
    Write-Host 'Rule .easignore yang hilang:' -ForegroundColor Red
    $missingRules | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    throw 'Production build dibatalkan karena .easignore belum aman.'
}

$trackedSource = @(& git -C $gitRoot ls-files -- 'hireloop-expo/src/**')
if ($trackedSource.Count -eq 0) {
    throw 'Source aplikasi tidak ditemukan di Git.'
}

$easConfigPath = Join-Path $appRoot 'eas.json'
$easConfig = Get-Content -LiteralPath $easConfigPath -Raw | ConvertFrom-Json
$productionApiUrl = $easConfig.build.'production-apk'.env.EXPO_PUBLIC_API_URL
$expectedApiUrl = 'https://hireloop.superapp-provenforceindonesia.com/api'

if ($productionApiUrl -ne $expectedApiUrl) {
    throw "EXPO_PUBLIC_API_URL production tidak sesuai. Ditemukan: $productionApiUrl"
}

Write-Host "Commit   : $head"
Write-Host "API       : $productionApiUrl"
Write-Host "Source    : $($trackedSource.Count) tracked files"
Write-Host 'Production preflight passed.' -ForegroundColor Green
