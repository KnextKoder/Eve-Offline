# Timeline and Status of Eve Offline

[X] Repo Init

[X] Project Init with Tauri x React x TS x Tailwind x Shadcn UI x Vite

[X] Tauri v2 + React + TypeScript + Vite

[X] Tailwind v4 + shadcn/ui

[X] Elysia sidecar

[X] Workflow SDK + embedded SQLite

[X] Eve base-agent scaffolded

[X] llama.cpp binaries (Windows CPU + Vulkan)

[X] Platform detection pointing at correct binary folder

[ ] ...


```powershell
# Lists all files in the project directory except node_modules, dist, public, .vscode, src-tauri\target, and src-tauri\icons
Get-ChildItem -Recurse -Name | Where-Object { $_ -notmatch '^(node_modules|dist|public|.vscode|src-tauri\\target|src-tauri\\icons)\\' }
```

Cuda llama server not conifgured yet