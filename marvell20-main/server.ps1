param(
  [int] $Port = 5500,
  [string] $PrinterName = ""
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$exportRoot = Join-Path $root "exports"
$printRoot = Join-Path $root "prints"
$websiteArchiveRoot = Join-Path $root "website-archive"
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::IPv6Any, $Port)
$listener.Server.DualMode = $true

New-Item -ItemType Directory -Force -Path $exportRoot | Out-Null
New-Item -ItemType Directory -Force -Path $printRoot | Out-Null
New-Item -ItemType Directory -Force -Path $websiteArchiveRoot | Out-Null

function Get-MimeType {
  param([string] $Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".svg" { "image/svg+xml" }
    ".ttf" { "font/ttf" }
    ".woff" { "font/woff" }
    ".woff2" { "font/woff2" }
    default { "application/octet-stream" }
  }
}

function Write-Response {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [int] $Status,
    [string] $StatusText,
    [byte[]] $Body,
    [string] $ContentType = "text/plain; charset=utf-8",
    [hashtable] $Headers = @{},
    [bool] $SkipBody = $false
  )

  $header = "HTTP/1.1 $Status $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Headers: Content-Type`r`nAccess-Control-Allow-Methods: GET, HEAD, POST, OPTIONS`r`n"
  foreach ($key in $Headers.Keys) {
    $header += "$key`: $($Headers[$key])`r`n"
  }
  $header += "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if (-not $SkipBody) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Write-TextResponse {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [int] $Status,
    [string] $StatusText,
    [string] $Text,
    [string] $ContentType = "text/plain; charset=utf-8",
    [bool] $SkipBody = $false
  )

  $body = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Write-Response $Stream $Status $StatusText $body $ContentType @{} $SkipBody
}

function Write-JsonResponse {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [int] $Status,
    [string] $StatusText,
    [object] $Payload,
    [bool] $SkipBody = $false
  )

  $json = $Payload | ConvertTo-Json -Depth 5 -Compress
  Write-TextResponse $Stream $Status $StatusText $json "application/json; charset=utf-8" $SkipBody
}

function Read-HttpRequest {
  param([System.Net.Sockets.NetworkStream] $Stream)

  $buffer = New-Object byte[] 8192
  $bytes = New-Object "System.Collections.Generic.List[byte]"
  $headerEnd = -1

  while ($headerEnd -lt 0) {
    $read = $Stream.Read($buffer, 0, $buffer.Length)
    if ($read -le 0) {
      return $null
    }

    for ($index = 0; $index -lt $read; $index += 1) {
      $bytes.Add($buffer[$index])
    }

    $headerProbe = [System.Text.Encoding]::ASCII.GetString($bytes.ToArray())
    $headerEnd = $headerProbe.IndexOf("`r`n`r`n")
  }

  $allBytes = $bytes.ToArray()
  $headerText = [System.Text.Encoding]::ASCII.GetString($allBytes, 0, $headerEnd)
  $lines = $headerText -split "`r`n"
  $firstLine = $lines[0]

  if ($firstLine -notmatch "^(GET|HEAD|POST|OPTIONS) ([^ ]+) HTTP/") {
    return @{ IsMalformed = $true }
  }

  $headers = @{}
  foreach ($line in $lines[1..($lines.Length - 1)]) {
    $separator = $line.IndexOf(":")
    if ($separator -lt 1) {
      continue
    }

    $name = $line.Substring(0, $separator).Trim()
    $value = $line.Substring($separator + 1).Trim()
    $headers[$name] = $value
  }

  $contentLength = 0
  if ($headers.ContainsKey("Content-Length")) {
    [int]::TryParse($headers["Content-Length"], [ref] $contentLength) | Out-Null
  }

  $body = New-Object byte[] $contentLength
  $bodyStart = $headerEnd + 4
  $available = [Math]::Max(0, $allBytes.Length - $bodyStart)
  $copied = [Math]::Min($available, $contentLength)
  if ($copied -gt 0) {
    [Array]::Copy($allBytes, $bodyStart, $body, 0, $copied)
  }

  while ($copied -lt $contentLength) {
    $read = $Stream.Read($body, $copied, $contentLength - $copied)
    if ($read -le 0) {
      break
    }
    $copied += $read
  }

  $pathAndQuery = $Matches[2]
  $path = $pathAndQuery.Split("?")[0]

  return @{
    Method = $Matches[1]
    PathAndQuery = $pathAndQuery
    Path = $path
    Headers = $headers
    Body = $body
    IsMalformed = $false
  }
}

function Get-LanAddress {
  param([System.Net.Sockets.TcpClient] $Client)

  $localAddress = ([System.Net.IPEndPoint] $Client.Client.LocalEndPoint).Address
  if (
    $localAddress.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
    -not [System.Net.IPAddress]::IsLoopback($localAddress)
  ) {
    return $localAddress.ToString()
  }

  foreach ($network in [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
    if ($network.OperationalStatus -ne [System.Net.NetworkInformation.OperationalStatus]::Up) {
      continue
    }

    foreach ($address in $network.GetIPProperties().UnicastAddresses) {
      if ($address.Address.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
        continue
      }

      $ip = $address.Address.ToString()
      if ($ip -match "^(127\.|169\.254\.|0\.0\.0\.0)") {
        continue
      }

      return $ip
    }
  }

  return "127.0.0.1"
}

function Get-ShareBaseUrl {
  param(
    [System.Net.Sockets.TcpClient] $Client,
    [hashtable] $Headers
  )

  $hostHeader = ""
  if ($Headers.ContainsKey("Host")) {
    $hostHeader = $Headers["Host"]
  }

  $hostOnly = $hostHeader
  if ($hostOnly.StartsWith("[")) {
    $hostOnly = $hostOnly.TrimStart("[").Split("]")[0]
  } elseif ($hostOnly.Contains(":")) {
    $hostOnly = $hostOnly.Split(":")[0]
  }

  $isLoopback = [string]::IsNullOrWhiteSpace($hostOnly) -or $hostOnly -in @("localhost", "127.0.0.1", "::1")
  if ($isLoopback) {
    $hostOnly = Get-LanAddress $Client
  }

  return "http://$hostOnly`:$Port"
}

function New-DownloadToken {
  $characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray()
  return -join (1..8 | ForEach-Object { $characters | Get-Random })
}

function Get-ExportFile {
  param([string] $Token)

  $safeToken = ($Token.ToUpperInvariant() -replace "[^A-Z0-9]", "")
  if ([string]::IsNullOrWhiteSpace($safeToken)) {
    return $null
  }

  foreach ($extension in @("png", "jpg", "jpeg")) {
    $path = Join-Path $exportRoot "$safeToken.$extension"
    if ([System.IO.File]::Exists($path)) {
      return $path
    }
  }

  return $null
}

function Get-SafeArchiveId {
  param([string] $Id)

  $safeId = ($Id.ToUpperInvariant() -replace "[^A-Z0-9-]", "")
  if ([string]::IsNullOrWhiteSpace($safeId)) {
    $safeId = New-DownloadToken
  }

  return $safeId
}

function Get-WebsiteArchiveImage {
  param([string] $Id)

  $safeId = Get-SafeArchiveId $Id
  foreach ($extension in @("png", "jpg", "jpeg")) {
    $path = Join-Path $websiteArchiveRoot "$safeId.$extension"
    if ([System.IO.File]::Exists($path)) {
      return $path
    }
  }

  return $null
}

function Save-PortraitExport {
  param(
    [hashtable] $Request,
    [System.Net.Sockets.TcpClient] $Client,
    [System.Net.Sockets.NetworkStream] $Stream
  )

  try {
    $json = [System.Text.Encoding]::UTF8.GetString($Request.Body)
    $payload = $json | ConvertFrom-Json
    $image = [string] $payload.image
    if ([string]::IsNullOrWhiteSpace($image) -or -not $image.StartsWith("data:image/")) {
      Write-JsonResponse $Stream 400 "Bad Request" @{ error = "Missing image data." }
      return
    }

    $comma = $image.IndexOf(",")
    if ($comma -lt 0) {
      Write-JsonResponse $Stream 400 "Bad Request" @{ error = "Invalid image data." }
      return
    }

    $mediaType = $image.Substring(5, $comma - 5).ToLowerInvariant()
    $extension = if ($mediaType.StartsWith("image/jpeg")) { "jpg" } elseif ($mediaType.StartsWith("image/png")) { "png" } else { "" }
    if ([string]::IsNullOrWhiteSpace($extension)) {
      Write-JsonResponse $Stream 415 "Unsupported Media Type" @{ error = "Only PNG and JPEG portraits can be exported." }
      return
    }

    $imageBytes = [Convert]::FromBase64String($image.Substring($comma + 1))
    if ($imageBytes.Length -gt 25000000) {
      Write-JsonResponse $Stream 413 "Payload Too Large" @{ error = "Portrait export is too large." }
      return
    }

    do {
      $token = New-DownloadToken
      $imagePath = Join-Path $exportRoot "$token.$extension"
    } while ([System.IO.File]::Exists($imagePath))

    [System.IO.File]::WriteAllBytes($imagePath, $imageBytes)

    $metadata = @{
      id = [string] $payload.id
      token = $token
      file = [System.IO.Path]::GetFileName($imagePath)
      timestamp = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json -Depth 3
    [System.IO.File]::WriteAllText((Join-Path $exportRoot "$token.json"), $metadata, [System.Text.Encoding]::UTF8)

    $baseUrl = Get-ShareBaseUrl $Client $Request.Headers
    Write-JsonResponse $Stream 200 "OK" @{
      id = [string] $payload.id
      token = $token
      downloadUrl = "$baseUrl/d/$token"
      imageUrl = "$baseUrl/image/$token.$extension"
    }
  } catch {
    Write-JsonResponse $Stream 500 "Internal Server Error" @{ error = "Could not save portrait export." }
  }
}

function Get-DataUrlImageBytes {
  param([string] $Image)

  if ([string]::IsNullOrWhiteSpace($Image) -or -not $Image.StartsWith("data:image/")) {
    throw [System.ArgumentException]::new("Missing image data.")
  }

  $comma = $Image.IndexOf(",")
  if ($comma -lt 0) {
    throw [System.ArgumentException]::new("Invalid image data.")
  }

  $mediaType = $Image.Substring(5, $comma - 5).ToLowerInvariant()
  $extension = if ($mediaType.StartsWith("image/jpeg")) { "jpg" } elseif ($mediaType.StartsWith("image/png")) { "png" } else { "" }
  if ([string]::IsNullOrWhiteSpace($extension)) {
    throw [System.NotSupportedException]::new("Only PNG and JPEG images can be printed.")
  }

  return @{
    Bytes = [Convert]::FromBase64String($Image.Substring($comma + 1))
    Extension = $extension
  }
}

function Print-PortraitBytes {
  param(
    [byte[]] $ImageBytes,
    [string] $SessionId
  )

  Add-Type -AssemblyName System.Drawing
  $stream = [System.IO.MemoryStream]::new($ImageBytes)
  $image = [System.Drawing.Image]::FromStream($stream)
  $document = [System.Drawing.Printing.PrintDocument]::new()

  try {
    if (-not [string]::IsNullOrWhiteSpace($PrinterName)) {
      $document.PrinterSettings.PrinterName = $PrinterName
    }

    if (-not $document.PrinterSettings.IsValid) {
      $targetPrinter = if ([string]::IsNullOrWhiteSpace($PrinterName)) { "the default printer" } else { $PrinterName }
      throw "Windows cannot print to $targetPrinter."
    }

    $document.DocumentName = "MARVELL 20 $SessionId"
    $document.OriginAtMargins = $false
    $document.PrintController = [System.Drawing.Printing.StandardPrintController]::new()
    $document.DefaultPageSettings.Landscape = $image.Width -gt $image.Height
    $document.DefaultPageSettings.Margins = [System.Drawing.Printing.Margins]::new(0, 0, 0, 0)

    $handler = [System.Drawing.Printing.PrintPageEventHandler] {
      param($sender, $event)

      $event.Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $event.Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $event.Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $bounds = $event.MarginBounds
      $imageRatio = $image.Width / $image.Height
      $pageRatio = $bounds.Width / $bounds.Height

      if ($imageRatio -gt $pageRatio) {
        $targetWidth = $bounds.Width
        $targetHeight = $bounds.Width / $imageRatio
        $targetX = $bounds.Left
        $targetY = $bounds.Top + (($bounds.Height - $targetHeight) / 2)
      } else {
        $targetHeight = $bounds.Height
        $targetWidth = $bounds.Height * $imageRatio
        $targetX = $bounds.Left + (($bounds.Width - $targetWidth) / 2)
        $targetY = $bounds.Top
      }

      $target = [System.Drawing.RectangleF]::new(
        [single] $targetX,
        [single] $targetY,
        [single] $targetWidth,
        [single] $targetHeight
      )
      $event.Graphics.DrawImage($image, $target)
      $event.HasMorePages = $false
    }

    $document.add_PrintPage($handler)
    $document.Print()

    if ([string]::IsNullOrWhiteSpace($PrinterName)) {
      return $document.PrinterSettings.PrinterName
    }

    return $PrinterName
  }
  finally {
    $document.Dispose()
    $image.Dispose()
    $stream.Dispose()
  }
}

function Send-PortraitToPrinter {
  param(
    [hashtable] $Request,
    [System.Net.Sockets.NetworkStream] $Stream
  )

  try {
    $json = [System.Text.Encoding]::UTF8.GetString($Request.Body)
    $payload = $json | ConvertFrom-Json
    $sessionId = [string] $payload.id
    if ([string]::IsNullOrWhiteSpace($sessionId)) {
      $sessionId = "M20-PRINT"
    }

    $imageData = Get-DataUrlImageBytes ([string] $payload.image)
    if ($imageData.Bytes.Length -gt 50000000) {
      Write-JsonResponse $Stream 413 "Payload Too Large" @{ error = "Print file is too large." }
      return
    }

    $jobId = New-DownloadToken
    $printPath = Join-Path $printRoot "$jobId.$($imageData.Extension)"
    [System.IO.File]::WriteAllBytes($printPath, $imageData.Bytes)

    $printerUsed = Print-PortraitBytes $imageData.Bytes $sessionId
    Write-JsonResponse $Stream 200 "OK" @{
      ok = $true
      jobId = $jobId
      printer = $printerUsed
      file = [System.IO.Path]::GetFileName($printPath)
    }
  } catch [System.ArgumentException] {
    Write-JsonResponse $Stream 400 "Bad Request" @{ error = $_.Exception.Message }
  } catch [System.NotSupportedException] {
    Write-JsonResponse $Stream 415 "Unsupported Media Type" @{ error = $_.Exception.Message }
  } catch {
    Write-JsonResponse $Stream 503 "Service Unavailable" @{ error = "Could not send portrait to the printer." }
  }
}

function Save-WebsiteArchivePortrait {
  param(
    [hashtable] $Request,
    [System.Net.Sockets.NetworkStream] $Stream
  )

  try {
    $json = [System.Text.Encoding]::UTF8.GetString($Request.Body)
    $payload = $json | ConvertFrom-Json
    $safeId = Get-SafeArchiveId ([string] $payload.id)
    $imageData = Get-DataUrlImageBytes ([string] $payload.image)
    if ($imageData.Bytes.Length -gt 50000000) {
      Write-JsonResponse $Stream 413 "Payload Too Large" @{ error = "Archived portrait is too large." }
      return
    }

    foreach ($extension in @("png", "jpg", "jpeg")) {
      $oldPath = Join-Path $websiteArchiveRoot "$safeId.$extension"
      if ([System.IO.File]::Exists($oldPath)) {
        [System.IO.File]::Delete($oldPath)
      }
    }

    $imagePath = Join-Path $websiteArchiveRoot "$safeId.$($imageData.Extension)"
    [System.IO.File]::WriteAllBytes($imagePath, $imageData.Bytes)

    $timestamp = [string] $payload.timestamp
    if ([string]::IsNullOrWhiteSpace($timestamp)) {
      $timestamp = (Get-Date).ToUniversalTime().ToString("o")
    }

    $metadata = @{
      id = $safeId
      originalId = [string] $payload.id
      timestamp = $timestamp
      selectedFilter = [string] $payload.selectedFilter
      selectedPaper = [string] $payload.selectedPaper
      extension = $imageData.Extension
    } | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText((Join-Path $websiteArchiveRoot "$safeId.json"), $metadata, [System.Text.Encoding]::UTF8)

    Write-JsonResponse $Stream 200 "OK" @{
      ok = $true
      id = $safeId
      imageUrl = "/archive/image/$safeId.$($imageData.Extension)"
    }
  } catch [System.ArgumentException] {
    Write-JsonResponse $Stream 400 "Bad Request" @{ error = $_.Exception.Message }
  } catch [System.NotSupportedException] {
    Write-JsonResponse $Stream 415 "Unsupported Media Type" @{ error = $_.Exception.Message }
  } catch {
    Write-JsonResponse $Stream 500 "Internal Server Error" @{ error = "Could not save archived portrait." }
  }
}

function Write-WebsiteArchiveList {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [bool] $SkipBody = $false
  )

  $records = @()
  foreach ($metadataPath in [System.IO.Directory]::GetFiles($websiteArchiveRoot, "*.json")) {
    try {
      $metadata = Get-Content -Raw -LiteralPath $metadataPath | ConvertFrom-Json
      $imagePath = Get-WebsiteArchiveImage ([string] $metadata.id)
      if ($null -eq $imagePath) {
        continue
      }

      $extension = [System.IO.Path]::GetExtension($imagePath).TrimStart(".")
      $records += [pscustomobject]@{
        id = [string] $metadata.id
        originalId = [string] $metadata.originalId
        timestamp = [string] $metadata.timestamp
        selectedFilter = [string] $metadata.selectedFilter
        selectedPaper = [string] $metadata.selectedPaper
        imageUrl = "/archive/image/$($metadata.id).$extension"
      }
    } catch {
      continue
    }
  }

  $records = @($records | Sort-Object {
    try {
      [DateTime]::Parse($_.timestamp)
    } catch {
      [DateTime]::MinValue
    }
  } -Descending)
  Write-JsonResponse $Stream 200 "OK" @{ records = $records } $SkipBody
}

function Write-WebsiteArchiveImage {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [string] $Id,
    [bool] $SkipBody = $false
  )

  $file = Get-WebsiteArchiveImage $Id
  if ($null -eq $file) {
    Write-TextResponse $Stream 404 "Not Found" "Archived portrait not found." "text/plain; charset=utf-8" $SkipBody
    return
  }

  $bytes = [System.IO.File]::ReadAllBytes($file)
  Write-Response $Stream 200 "OK" $bytes (Get-MimeType $file) @{ "Cache-Control" = "no-store" } $SkipBody
}

function Write-DownloadPage {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [string] $Token,
    [bool] $SkipBody = $false
  )

  $file = Get-ExportFile $Token
  if ($null -eq $file) {
    Write-TextResponse $Stream 404 "Not Found" "Portrait export not found." "text/plain; charset=utf-8" $SkipBody
    return
  }

  $safeToken = ($Token.ToUpperInvariant() -replace "[^A-Z0-9]", "")
  $extension = [System.IO.Path]::GetExtension($file).TrimStart(".")
  $imagePath = "/image/$safeToken.$extension"
  $downloadPath = "$imagePath`?download=1"
  $html = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#efe5d2" />
    <title>MARVELL 20 Portrait</title>
    <style>
      :root { color-scheme: light; --paper: #efe5d2; --ink: #211b18; --soft: #6e5d51; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100svh; display: grid; place-items: center; padding: 24px; background: var(--paper); color: var(--ink); font-family: Arial, sans-serif; }
      main { width: min(100%, 520px); display: grid; gap: 18px; justify-items: center; text-align: center; }
      h1 { margin: 0; font-size: 28px; letter-spacing: 0.08em; }
      img { width: min(100%, 380px); max-height: 68svh; object-fit: contain; background: #fffaf0; box-shadow: 0 22px 64px rgba(56, 42, 30, 0.22); }
      a { width: min(100%, 320px); min-height: 52px; display: inline-grid; place-items: center; border: 1px solid var(--ink); background: var(--ink); color: #f8eddc; text-decoration: none; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; font-weight: 700; }
      p { max-width: 32ch; margin: 0; color: var(--soft); font-size: 13px; line-height: 1.45; }
    </style>
  </head>
  <body>
    <main>
      <h1>MARVELL 20</h1>
      <img src="$imagePath" alt="MARVELL 20 portrait" />
      <a href="$downloadPath" download="marvell-20-$safeToken.$extension">Download portrait</a>
      <p>If your phone opens the image instead of downloading, press and hold the portrait to save it.</p>
    </main>
  </body>
</html>
"@

  Write-TextResponse $Stream 200 "OK" $html "text/html; charset=utf-8" $SkipBody
}

function Write-ExportImage {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [string] $Token,
    [string] $PathAndQuery,
    [bool] $SkipBody = $false
  )

  $file = Get-ExportFile $Token
  if ($null -eq $file) {
    Write-TextResponse $Stream 404 "Not Found" "Portrait export not found." "text/plain; charset=utf-8" $SkipBody
    return
  }

  $bytes = [System.IO.File]::ReadAllBytes($file)
  $fileName = "marvell-20-$($Token.ToUpperInvariant()).$([System.IO.Path]::GetExtension($file).TrimStart("."))"
  $headers = @{
    "Cache-Control" = "no-store"
  }

  if ($PathAndQuery -like "*download=1*") {
    $headers["Content-Disposition"] = "attachment; filename=""$fileName"""
  }

  Write-Response $Stream 200 "OK" $bytes (Get-MimeType $file) $headers $SkipBody
}

function Write-StaticFile {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [string] $RequestPath,
    [bool] $SkipBody = $false
  )

  $requestPath = [Uri]::UnescapeDataString($RequestPath.Split("?")[0].TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($requestPath)) {
    $requestPath = "index.html"
  }

  $candidate = Join-Path $root $requestPath
  $fullPath = [System.IO.Path]::GetFullPath($candidate)
  $rootPath = [System.IO.Path]::GetFullPath($root)

  if (-not $fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-TextResponse $Stream 403 "Forbidden" "Forbidden" "text/plain; charset=utf-8" $SkipBody
    return
  }

  if (-not [System.IO.File]::Exists($fullPath)) {
    Write-TextResponse $Stream 404 "Not Found" "Not Found" "text/plain; charset=utf-8" $SkipBody
    return
  }

  $bytes = [System.IO.File]::ReadAllBytes($fullPath)
  $headers = @{}
  $fileName = [System.IO.Path]::GetFileName($fullPath).ToLowerInvariant()
  if ($fileName -in @("index.html", "app.js", "styles.css", "service-worker.js", "reset.html")) {
    $headers["Cache-Control"] = "no-store, max-age=0"
  }

  Write-Response $Stream 200 "OK" $bytes (Get-MimeType $fullPath) $headers $SkipBody
}

try {
  $listener.Start()
  Write-Host "MARVELL 20 is running on all network interfaces at port $Port"
  Write-Host "Open on this laptop: http://127.0.0.1:$Port or http://localhost:$Port"
  Write-Host "Portrait QR exports are saved to: $exportRoot"
  if ([string]::IsNullOrWhiteSpace($PrinterName)) {
    Write-Host "Direct prints will use the Windows default printer"
  } else {
    Write-Host "Direct prints will use printer: $PrinterName"
  }

  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $request = Read-HttpRequest $stream

      if ($null -eq $request) {
        $client.Close()
        continue
      }

      if ($request.IsMalformed) {
        Write-TextResponse $stream 400 "Bad Request" "Bad Request"
        continue
      }

      $method = $request.Method
      $path = [Uri]::UnescapeDataString($request.Path)
      $skipBody = $method -eq "HEAD"

      if ($method -eq "OPTIONS") {
        Write-Response $stream 204 "No Content" ([byte[]]::new(0)) "text/plain; charset=utf-8"
        continue
      }

      if ($method -eq "POST" -and $path -ieq "/api/portraits") {
        Save-PortraitExport $request $client $stream
        continue
      }

      if ($method -eq "GET" -and $path -ieq "/api/archive") {
        Write-WebsiteArchiveList $stream $skipBody
        continue
      }

      if ($method -eq "POST" -and $path -ieq "/api/archive") {
        Save-WebsiteArchivePortrait $request $stream
        continue
      }

      if ($method -eq "POST" -and $path -ieq "/api/print") {
        Send-PortraitToPrinter $request $stream
        continue
      }

      if (($method -eq "GET" -or $method -eq "HEAD") -and $path -imatch "^/archive/image/([A-Z0-9-]+)\.(png|jpg|jpeg)$") {
        Write-WebsiteArchiveImage $stream $Matches[1] $skipBody
        continue
      }

      if (($method -eq "GET" -or $method -eq "HEAD") -and $path -imatch "^/d/([A-Z0-9]+)$") {
        Write-DownloadPage $stream $Matches[1] $skipBody
        continue
      }

      if (($method -eq "GET" -or $method -eq "HEAD") -and $path -imatch "^/image/([A-Z0-9]+)\.(png|jpg|jpeg)$") {
        Write-ExportImage $stream $Matches[1] $request.PathAndQuery $skipBody
        continue
      }

      if ($method -eq "GET" -or $method -eq "HEAD") {
        Write-StaticFile $stream $request.PathAndQuery $skipBody
        continue
      }

      Write-TextResponse $stream 405 "Method Not Allowed" "Method Not Allowed"
    }
    finally {
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
