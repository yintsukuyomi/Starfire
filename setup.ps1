# Create main directories
$directories = @(
    "src\pages",
    "src\lib",
    "src\hooks",
    "src\styles",
    "src\assets",
    "src\utils",
    "src\context",
    "src\types",
    "src\api"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    } else {
        Write-Host "Directory already exists: $dir"
    }
}

Write-Host "Project structure created successfully!" -ForegroundColor Green
