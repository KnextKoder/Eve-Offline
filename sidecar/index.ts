import "../workflow.config"
import { Elysia } from "elysia"
import path from "path"
import os from "os"
import { execSync } from "child_process"


function detectGPU(): "cuda" | "vulkan" | "cpu" {
  const platform = os.platform();
  
  if (platform === "win32") {
    // Check for NVIDIA GPU via nvidia-smi
    try {
      execSync("nvidia-smi", { stdio: "ignore" });
      return "cuda";
    } catch {}
    // Check for Vulkan support
    try {
      execSync("vulkaninfo", { stdio: "ignore" });
      return "vulkan";
    } catch {}
  }
  // No GPU Fallback: cpu
  return "cpu";
}

function getLlamaServerPath(): string {
  const platform = os.platform();
  const arch = os.arch();
  
  const resourceDir = process.env.TAURI_RESOURCE_DIR ?? 
    path.join(process.cwd(), "src-tauri", "binaries");

  if (platform === "win32") {
    const gpu = detectGPU();
    console.log(`Detected GPU backend: ${gpu}`);
    return path.join(resourceDir, "win-x64", gpu);
  } else if (platform === "darwin") {
    return arch === "arm64"
      ? path.join(resourceDir, "mac-arm64")
      : path.join(resourceDir, "mac-x64");
  } else {
    return path.join(resourceDir, "linux-x64");
  }
}

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .get("/test/:id", async ({ params }) => {
    "use workflow";
    return { id: params.id, llamaPath: getLlamaServerPath() };
  })
  .listen(3799)

console.log(`Eve sidecar running on port ${app.server?.port}`)
console.log(`Llama path: ${getLlamaServerPath()}`); 