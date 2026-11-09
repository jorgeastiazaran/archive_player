# Genera preview.html autocontenido a partir de los modulos reales en src/
# Permite abrir Archive Player directamente en cualquier navegador sin requerir Node.js instalado.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$files = @(
  "src/types/media.ts",
  "src/data/curatedCatalog.ts",
  "src/services/providers/internetArchive.ts",
  "src/services/ai/playlistGenerator.ts",
  "src/services/offline/offlineStorage.ts",
  "src/store/PlayerContext.tsx",
  "src/components/layout/Sidebar.tsx",
  "src/components/layout/MobileNav.tsx",
  "src/components/layout/Header.tsx",
  "src/components/player/UnifiedPlayerBar.tsx",
  "src/components/player/LinerNotesDrawer.tsx",
  "src/components/catalog/ExploreView.tsx",
  "src/components/catalog/ArtistsAlbumsView.tsx",
  "src/components/ai-dj/AICuratorView.tsx",
  "src/components/library/LibraryAndOfflineView.tsx",
  "src/App.tsx"
)

$combinedCode = New-Object System.Text.StringBuilder
[void]$combinedCode.AppendLine("// Auto-generated bundle from src/ for standalone browser preview")
[void]$combinedCode.AppendLine("const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;")
[void]$combinedCode.AppendLine("const { BookmarkPlus, BookOpen, Calendar, Check, CheckCircle2, Clapperboard, Clock, CloudRain, Compass, Copy, Disc, Disc3, Download, DownloadCloud, ExternalLink, Film, FolderOpen, Globe, HardDriveDownload, Headphones, Heart, ListMusic, Loader2, MapPin, Maximize2, Minimize2, Music, Pause, Play, Plus, PlusCircle, Radio, Repeat, Repeat1, Search, ShieldCheck, Shuffle, SkipBack, SkipForward, Sparkles, Tag, Trash2, Tv, Users, Volume2, VolumeX, Wand2, Wifi, WifiOff, X, AlertCircle } = window.LucideReact;")

foreach ($relPath in $files) {
  $fullPath = Join-Path $root $relPath
  $content = Get-Content -Path $fullPath -Raw -Encoding UTF8

  # Eliminar bloques import multiline y single-line
  $content = [regex]::Replace($content, '(?ms)^import\s+type\s+.*?;[\r\n]*', '')
  $content = [regex]::Replace($content, '(?ms)^import\s+\{[^}]+\}\s+from\s+[''"][^''"]+[''"];?[\r\n]*', '')
  $content = [regex]::Replace($content, '(?m)^import\s+[^\r\n]+from\s+[''"][^''"]+[''"];?[\r\n]*', '')

  # Convertir exports a declaraciones globales del scope
  $content = [regex]::Replace($content, '(?m)^export\s+default\s+App;?', '')
  $content = [regex]::Replace($content, '(?m)^export\s+type\s+', 'type ')
  $content = [regex]::Replace($content, '(?m)^export\s+interface\s+', 'interface ')
  $content = [regex]::Replace($content, '(?m)^export\s+const\s+', 'const ')
  $content = [regex]::Replace($content, '(?m)^export\s+async\s+function\s+', 'async function ')
  $content = [regex]::Replace($content, '(?m)^export\s+function\s+', 'function ')

  [void]$combinedCode.AppendLine("`n// ==========================================")
  [void]$combinedCode.AppendLine("// FILE: $relPath")
  [void]$combinedCode.AppendLine("// ==========================================")
  [void]$combinedCode.AppendLine($content)
}

[void]$combinedCode.AppendLine("`nconst rootEl = document.getElementById('root');")
[void]$combinedCode.AppendLine("if (rootEl) { ReactDOM.createRoot(rootEl).render(<App />); }")

$htmlTemplate = @"
<!doctype html>
<html lang="es" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#090a0f" />
    <title>Archive Player — Streaming Abierto de Música y Cine Patrimonial</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      :root { color-scheme: dark; }
      body {
        background-color: #090a0f;
        color: #f4f4f5;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: rgba(15, 17, 23, 0.5); }
      ::-webkit-scrollbar-thumb { background: rgba(113, 113, 122, 0.35); border-radius: 9999px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.55); }
    </style>
    <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
    <script>window.react = window.React;</script>
    <script src="https://unpkg.com/lucide-react@0.468.0/dist/umd/lucide-react.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"></script>
  </head>
  <body class="bg-[#090a0f] text-zinc-100 antialiased selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
    <div id="root"></div>
    <script type="text/babel" data-presets="react,typescript" data-type="module">
$($combinedCode.ToString())
    </script>
  </body>
</html>
"@

$outPath = Join-Path $root "preview.html"
Set-Content -Path $outPath -Value $htmlTemplate -Encoding UTF8
Write-Output "Generated standalone preview at: $outPath"
