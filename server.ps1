# Servidor Local Ultra Ligero en PowerShell (Sin dependencias externas)
$port = 8080
$path = "C:\Users\CLIENTE2024\.gemini\antigravity-ide\scratch\hotmart-notifications-app"

# Obtener IP local de la red WiFi
$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
if (-not $localIp) { $localIp = "localhost" }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")
try {
  $listener.Start()
} catch {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
}

Write-Host "=========================================================" -ForegroundColor Green
Write-Host " 🔥 SERVIDOR DE NOTIFICACIONES HOTMART INICIADO CON ÉXITO" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Green
Write-Host " 💻 En tu PC abre:       http://localhost:$port" -ForegroundColor Cyan
Write-Host " 📱 En tu CELULAR abre:  http://$($localIp):$port" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Green
Write-Host " Presiona Ctrl + C para detener el servidor..."

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ($urlPath -eq "" -or $urlPath -eq "/") { $urlPath = "index.html" }
        
        $filePath = Join-Path $path $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    } catch {}
}
