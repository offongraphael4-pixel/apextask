# ApexTask Local HTTP Server using System.Net.HttpListener
$port = 8080
$prefix = "http://localhost:$port/"
$baseDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "ApexTask Server listening on $prefix"
    Write-Host "Base Directory: $baseDir"
} catch {
    # If 8080 is busy, try 8081
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "ApexTask Server listening on $prefix"
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # API Router
        if ($request.Url.LocalPath.StartsWith('/api/')) {
            $apiPath = $request.Url.LocalPath.ToLower()
            $jsonResponse = "{}"

            if ($apiPath -eq '/api/v1/health') {
                $jsonResponse = '{"status":"ok","network":"ApexTask Escrow Core","node":"alpha-01","version":"1.0.0","timestamp":"' + (Get-Date -Format "o") + '"}'
            } elseif ($apiPath -eq '/api/v1/solvency') {
                $jsonResponse = '{"isSolvent":true,"invariantAudit":"PASSED","debitsEqualsCredits":true,"auditTimestamp":"' + (Get-Date -Format "o") + '"}'
            } elseif ($apiPath -eq '/api/v1/config') {
                $jsonResponse = '{"currency":"NGN","gateway":"Paystack","escrowSlaHours":72,"leaseTimeoutMinutes":45}'
            } else {
                $jsonResponse = '{"error":"Endpoint not found","path":"' + $request.Url.LocalPath + '"}'
            }

            $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $jsonBytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.StatusCode = 200
            $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            $response.OutputStream.Close()
            continue
        }

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        # Normalize path separators
        $safeRelative = $urlPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($baseDir, $safeRelative)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Continue loop on aborted client connections
    }
}
