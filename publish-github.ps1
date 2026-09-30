param(
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g. https://github.com/username/apextask.git)"
}

if (-not $RepoUrl) {
    Write-Error "Repository URL is required."
    exit 1
}

Write-Host "Linking repository to $RepoUrl..."
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $RepoUrl
git branch -M main

Write-Host "Pushing main branch to GitHub..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Next steps for GitHub Pages:"
    Write-Host "1. Go to your repository on GitHub -> Settings -> Pages"
    Write-Host "2. Under 'Build and deployment' > Source, select 'GitHub Actions' (or Deploy from branch 'main')"
    Write-Host "3. Your site will be live within seconds!"
} else {
    Write-Host "`nPush failed. Please ensure you have write access and are authenticated." -ForegroundColor Red
}
