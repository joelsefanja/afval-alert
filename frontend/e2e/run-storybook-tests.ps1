# Script om Storybook te starten en tests uit te voeren

# Start Storybook in de achtergrond
$storybookProcess = Start-Process -FilePath "npm" -ArgumentList "run", "storybook" -PassThru -NoNewWindow

# Wacht even tot Storybook is opgestart
Write-Host "Wachten tot Storybook is opgestart..."
Start-Sleep -Seconds 15

# Voer de tests uit
Write-Host "Storybook tests worden uitgevoerd..."
$env:STORYBOOK_TEST = "true"
npm run test:e2e -- e2e/storybook-components.spec.ts
$testResult = $LASTEXITCODE

# Stop Storybook proces
Stop-Process -Id $storybookProcess.Id -Force

# Geef resultaat terug
if ($testResult -eq 0) {
    Write-Host "Tests succesvol afgerond!" -ForegroundColor Green
} else {
    Write-Host "Tests gefaald!" -ForegroundColor Red
}

exit $testResult