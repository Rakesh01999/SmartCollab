$file = "frontend/src/components/Home/HomePage.tsx"
$fullPath = Join-Path (Get-Location) $file
$c = [System.IO.File]::ReadAllText($fullPath)

# Pass 1: Dark mode indigo → sky (keep same shade number for dark bg readability)
$c = $c -replace 'dark:(\S*?)indigo-', 'dark:$1sky-'

# Pass 1b: Dark mode violet/purple → teal (keep same shade number)
$c = $c -replace 'dark:(\S*?)violet-', 'dark:$1teal-'
$c = $c -replace 'dark:(\S*?)purple-', 'dark:$1teal-'

# Pass 2: Light mode indigo → sky (shift shade numbers for white bg readability)
# Order: longer/more-specific patterns first to avoid partial matches
$c = $c -replace 'indigo-950', 'sky-950'
$c = $c -replace 'indigo-600', 'sky-700'
$c = $c -replace 'indigo-500', 'sky-600'
$c = $c -replace 'indigo-400', 'sky-500'
$c = $c -replace 'indigo-300', 'sky-300'
$c = $c -replace 'indigo-200', 'sky-200'
$c = $c -replace 'indigo-50', 'sky-50'

# Pass 2b: Light mode violet → teal (keep same shade)
$c = $c -replace 'violet-950', 'teal-950'
$c = $c -replace 'violet-600', 'teal-600'
$c = $c -replace 'violet-500', 'teal-500'
$c = $c -replace 'violet-400', 'teal-400'
$c = $c -replace 'violet-200', 'teal-200'
$c = $c -replace 'violet-50', 'teal-50'

# Pass 2c: Light mode purple → teal (keep same shade)
$c = $c -replace 'purple-600', 'teal-600'
$c = $c -replace 'purple-500', 'teal-500'
$c = $c -replace 'purple-400', 'teal-400'

# Pass 3: Hex color values (SVG strokes, inline styles)
$c = $c -replace '#4f46e5', '#0369a1'   # indigo-600 → sky-700
$c = $c -replace '#6366f1', '#0ea5e9'   # indigo-500 → sky-500
$c = $c -replace '#818cf8', '#38bdf8'   # indigo-400 → sky-400
$c = $c -replace '#7c3aed', '#0d9488'   # violet-600 → teal-600
$c = $c -replace '#8b5cf6', '#14b8a6'   # violet-500 → teal-500
$c = $c -replace '#a78bfa', '#2dd4bf'   # violet-400 → teal-400

# Pass 4: RGBA values (glow/shadow effects)
$c = $c -replace 'rgba\(99,\s*102,\s*241', 'rgba(14, 165, 233'   # indigo-500 rgb → sky-500 rgb
$c = $c -replace 'rgba\(139,\s*92,\s*246', 'rgba(20, 184, 166'   # violet-500 rgb → teal-500 rgb

# Pass 5: Color name strings in data arrays
$c = $c -replace "'indigo'", "'sky'"
$c = $c -replace "'violet'", "'teal'"

[System.IO.File]::WriteAllText($fullPath, $c)

# Verify: count remaining indigo/violet/purple references
$remaining = ([regex]::Matches($c, 'indigo|violet|purple')).Count
Write-Output "Remaining indigo/violet/purple references: $remaining"