$ErrorActionPreference = 'Stop'
$css = Get-Content -LiteralPath 'assets/fonts/font-source.css' -Raw
$urls = [regex]::Matches($css, 'url\((https:[^\)]+)\)')
$weights = @(400, 500, 600, 700)
for ($i = 0; $i -lt $urls.Count; $i++) {
    Invoke-WebRequest -Uri $urls[$i].Groups[1].Value -OutFile ('assets/fonts/dm-sans-' + $weights[$i] + '.ttf')
}
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt' -OutFile 'assets/fonts/OFL.txt'
