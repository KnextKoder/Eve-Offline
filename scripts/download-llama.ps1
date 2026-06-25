$version = "b9785"
$base = "https://github.com/ggml-org/llama.cpp/releases/download/$version"
$out = "$PSScriptRoot\..\src-tauri\binaries"

# Windows x64
Write-Host "Downloading Windows binaries..."
Invoke-WebRequest "$base/llama-$version-bin-win-cpu-x64.zip" -OutFile "$out\win-x64\cpu.zip"
Invoke-WebRequest "$base/llama-$version-bin-win-vulkan-x64.zip" -OutFile "$out\win-x64\vulkan.zip"
Invoke-WebRequest "$base/llama-$version-bin-win-cuda-12.4-x64.zip" -OutFile "$out\win-x64\cuda-bin.zip"

# macOS
Write-Host "Downloading macOS binaries..."
Invoke-WebRequest "$base/llama-$version-bin-macos-arm64.tar.gz" -OutFile "$out\mac-arm64\metal.tar.gz"
Invoke-WebRequest "$base/llama-$version-bin-macos-x64.tar.gz" -OutFile "$out\mac-x64\cpu.tar.gz"

# Linux
Write-Host "Downloading Linux binaries..."
Invoke-WebRequest "$base/llama-$version-bin-ubuntu-x64.tar.gz" -OutFile "$out\linux-x64\cpu.tar.gz"
Invoke-WebRequest "$base/llama-$version-bin-ubuntu-vulkan-x64.tar.gz" -OutFile "$out\linux-x64\vulkan.tar.gz"

Write-Host "All downloads complete."