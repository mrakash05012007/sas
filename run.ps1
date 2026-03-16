Write-Host "Starting Smart Attendance System..." -ForegroundColor Green
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1 } else { Write-Host 'venv not found, please create it.'; exit }; uvicorn app.main:app --reload"

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both services are starting up!" -ForegroundColor Green
Write-Host "The application will be merged and available at http://localhost:3000" -ForegroundColor Yellow
