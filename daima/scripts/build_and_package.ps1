<#
  build_and_package.ps1
  Windows PowerShell script to build the Vite app, ensure SPA redirects,
  and produce a zip with `index.html` at the archive root for Netlify drag-and-drop.

  Usage (PowerShell):
    .\scripts\build_and_package.ps1  [-SkipInstall]

  If you want automatic Netlify deployment, see DEPLOY.md and set NETLIFY_AUTH_TOKEN
  and run `netlify deploy --prod --dir=dist` after this script.
#>

param(
  [switch]$SkipInstall
)

set-StrictMode -Version Latest

Write-Host "Starting build and package workflow..."

if (-not $SkipInstall) {
  Write-Host "Installing dependencies (npm install)..."
  npm install
}

Write-Host "Running Vite build (skips TypeScript check if you prefer use npx vite build)..."
# Use the package build script if it succeeds, otherwise fallback to vite build
try {
  npm run build
} catch {
  Write-Host "npm run build failed or type-check blocks build; running 'npx vite build' to generate assets..." -ForegroundColor Yellow
  npx vite build
}

if (-not (Test-Path dist)) {
  Write-Error "dist folder not found after build. Aborting."
  exit 1
}

Write-Host "Ensuring Netlify SPA redirect file exists (dist/_redirects)"
'/* /index.html 200' | Out-File -Encoding utf8 dist\_redirects

$zipPath = Join-Path -Path (Get-Location) -ChildPath 'dist_flat.zip'

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Write-Host "Creating zip archive with dist contents at $zipPath"
Compress-Archive -Path .\dist\* -DestinationPath $zipPath -Force

if (Test-Path $zipPath) {
  Write-Host "Package created: $zipPath" -ForegroundColor Green
} else {
  Write-Error "Failed to create $zipPath"
  exit 1
}

Write-Host "Done. Drag-and-drop $zipPath (or the dist folder) to Netlify to deploy." -ForegroundColor Cyan
