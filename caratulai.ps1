# caratulai — convenient CLI wrapper for the alien image generator
# Usage: .\caratulai.ps1 generate --from-text "A starry ocean"
#        .\caratulai.ps1 palettes
#        .\caratulai.ps1 --build generate star water travel

param(
    [switch]$Build = $false,
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistDir = Join-Path $ScriptDir "packages/cli/dist"

# Build if flag is set or if dist doesn't exist
if ($Build -or -not (Test-Path $DistDir)) {
    Write-Host "Building caratulai..." -ForegroundColor Gray
    Push-Location $ScriptDir
    & pnpm build *> $null
    Pop-Location
}

# Run the CLI
& node "$DistDir/index.js" @Arguments
