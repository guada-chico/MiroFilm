# Script para reconstruir el backend

Write-Host "=== LIMPIANDO PROYECTO ===" -ForegroundColor Yellow
cd Backend
Remove-Item -Recurse -Force bin -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force obj -ErrorAction SilentlyContinue

Write-Host "=== RESTAURANDO DEPENDENCIAS ===" -ForegroundColor Yellow
dotnet restore

Write-Host "=== COMPILANDO ===" -ForegroundColor Yellow
dotnet build

Write-Host "=== COMPILACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "Ahora ejecuta: dotnet run" -ForegroundColor Cyan
