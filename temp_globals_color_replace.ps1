$file = "frontend/src/app/globals.css"
$fullPath = Join-Path (Get-Location) $file
$c = [System.IO.File]::ReadAllText($fullPath)

# Pass 1: RGBA values — indigo-500 rgb (99,102,241) → sky-500 rgb (14,165,233)
$c = $c -replace 'rgba\(99,\s*102,\s*241', 'rgba(14, 165, 233'

# Pass 2: Hex values
$c = $c -replace '#4f46e5', '#0369a1'   # indigo-600 → sky-700
$c = $c -replace '#6366f1', '#0ea5e9'   # indigo-500 → sky-500
$c = $c -replace '#c7d2fe', '#bae6fd'   # indigo-200 → sky-200 (dark mode hover text)

[System.IO.File]::WriteAllText($fullPath, $c)

# Verify: count remaining indigo references
$remaining = ([regex]::Matches($c, 'indigo|#4f46e5|#6366f1|#818cf8|#c7d2fe|rgba\(99')).Count
Write-Output "Remaining indigo references: $remaining"