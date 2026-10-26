$ErrorActionPreference = 'Stop'
$assets = @(
    @('home/cat-at-home', '1514888286974-6c03e2ca1dba'),
    @('home/bird-perch', '1444464666168-49d633b86797'),
    @('home/aquarium-fish', '1520302519878-32fa8b7c2c71'),
    @('home/rabbit-care', '1585110396000-c9ffd4e4b308'),
    @('home/our-companions', '1548199973-03cce0bbc87b'),
    @('home/grooming-moment', '1516734212186-a967f81ad0d7'),
    @('home/puppy-guide', '1552053831-71594a27632d'),
    @('home/cat-guide', '1573865526739-10659fec78a5'),
    @('home/walking-guide', '1551717743-49959800b1f6'),
    @('home/home-two-cat', '1495360010541-f48722b34f7d'),
    @('home/adventure-dog', '1507146426996-ef05306b995a'),
    @('home/community-dog', '1537151625747-768eb6cf92b2'),
    @('home/community-cat', '1518791841217-8f162f1e1131'),
    @('home/wellness-dog', '1587300003388-59208cc962cb'),
    @('home/grooming-story', '1534361960057-19889db9621e'),
    @('brands/brand-story', '1583337130417-3346a1be7dee'),
    @('grooming/relaxed-dog', '1596492784531-6e6eb5ea9993'),
    @('grooming/coat-care', '1601758228041-f3b2795255f1'),
    @('blog/nutrition-guide', '1588943211346-0908a1fb0b01'),
    @('blog/indoor-cat', '1533738363-b7f9aef128ce'),
    @('blog/positive-training', '1543466835-00a7907e9de1'),
    @('blog/small-pet-guide', '1425082661705-1834bfd09dca'),
    @('blog/senior-dog', '1561037404-61cd46aa615b'),
    @('blog/coat-guide', '1530281700549-e82e7bf110d6'),
    @('blog/article-walk', '1450778869180-41d0601e046e'),
    @('blog/article-companion', '1505628346881-b72b27e84530'),
    @('about/store-story', '1450778869180-41d0601e046e'),
    @('about/pet-parent', '1601758174114-e711c0cbaa69'),
    @('contact/store-visit', '1441986300917-64674bd600d8'),
    @('ui/coming-soon-puppy', '1546527868-ccb7ee7dfa6a')
)
foreach ($asset in $assets) {
    $destination = Join-Path 'assets/images' ($asset[0] + '.webp')
    if (-not (Test-Path -LiteralPath $destination)) {
        try {
            Invoke-WebRequest -Uri ('https://images.unsplash.com/photo-' + $asset[1] + '?w=1100&q=78&fm=webp') -OutFile $destination
            Write-Output ('OK ' + $asset[0])
        } catch {
            Write-Output ('FAILED ' + $asset[0] + ': ' + $_.Exception.Message)
        }
    }
}
Copy-Item -LiteralPath 'node_modules/bootstrap/dist/css/bootstrap.min.css' -Destination 'assets/vendor/bootstrap.min.css'
Copy-Item -LiteralPath 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js' -Destination 'assets/vendor/bootstrap.bundle.min.js'
Copy-Item -LiteralPath 'node_modules/bootstrap-icons/font/bootstrap-icons.css' -Destination 'assets/vendor/bootstrap-icons.css'
New-Item -ItemType Directory -Force -Path 'assets/vendor/fonts' | Out-Null
Copy-Item -Path 'node_modules/bootstrap-icons/font/fonts/*' -Destination 'assets/vendor/fonts'
$assets | ForEach-Object { $_[0] + '.webp | https://unsplash.com/photos/' + $_[1] } | Set-Content 'documentation/image-sources.txt'
