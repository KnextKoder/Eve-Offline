$out = "$PSScriptRoot\..\src-tauri\binaries"

# Windows - extract llama-server.exe from each zip
Write-Host "Extracting Windows binaries..."
Expand-Archive "$out\win-x64\cpu.zip" -DestinationPath "$out\win-x64\cpu-tmp" -Force
Expand-Archive "$out\win-x64\vulkan.zip" -DestinationPath "$out\win-x64\vulkan-tmp" -Force
Expand-Archive "$out\win-x64\cuda.zip" -DestinationPath "$out\win-x64\cuda-tmp" -Force

Copy-Item "$out\win-x64\cpu-tmp\llama-server.exe" "$out\win-x64\llama-server-cpu.exe"
Copy-Item "$out\win-x64\vulkan-tmp\llama-server.exe" "$out\win-x64\llama-server-vulkan.exe"
Copy-Item "$out\win-x64\cuda-tmp\llama-server.exe" "$out\win-x64\llama-server-cuda.exe"

# macOS - extract llama-server from tar.gz
Write-Host "Extracting macOS binaries..."
tar -xzf "$out\mac-arm64\metal.tar.gz" -C "$out\mac-arm64" llama-server
tar -xzf "$out\mac-x64\cpu.tar.gz" -C "$out\mac-x64" llama-server

# Linux - extract llama-server from tar.gz
Write-Host "Extracting Linux binaries..."
tar -xzf "$out\linux-x64\cpu.tar.gz" -C "$out\linux-x64" llama-server
tar -xzf "$out\linux-x64\vulkan.tar.gz" -C "$out\linux-x64" llama-server-vulkan

# Cleanup temp folders and archives
Write-Host "Cleaning up..."
Remove-Item "$out\win-x64\cpu-tmp" -Recurse -Force
Remove-Item "$out\win-x64\vulkan-tmp" -Recurse -Force
Remove-Item "$out\win-x64\cuda-tmp" -Recurse -Force
Remove-Item "$out\win-x64\*.zip" -Force
Remove-Item "$out\mac-arm64\*.tar.gz" -Force
Remove-Item "$out\mac-x64\*.tar.gz" -Force
Remove-Item "$out\linux-x64\*.tar.gz" -Force

Write-Host "Done."