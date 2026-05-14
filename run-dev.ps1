$nodeJsDir = 'C:\Program Files\nodejs'
$npmPath = Join-Path $nodeJsDir 'npm.cmd'

if (-not (Test-Path $npmPath)) {
  Write-Error "Node.js npm.cmd was not found in '$nodeJsDir'."
  exit 1
}

$env:PATH = "$nodeJsDir;$env:PATH"
& $npmPath run dev
exit $LASTEXITCODE