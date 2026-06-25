# Timeline and Status of Eve Offline

[X] Repo Init

[X] Project Init with Tauri x React x TS x Tailwind x Shadcn UI x Vite

[ ] ...



```powershell
# Lists all files in the project directory except node_modules, dist, public, .vscode, src-tauri\target, and src-tauri\icons
Get-ChildItem -Recurse -Name | Where-Object { $_ -notmatch '^(node_modules|dist|public|.vscode|src-tauri\\target|src-tauri\\icons)\\' }
```