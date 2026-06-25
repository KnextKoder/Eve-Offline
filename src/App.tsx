import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Layers, Radio, Send, Clock, Compass, Activity, Cpu, Server, CheckCircle2, Loader2 } from "lucide-react";
import "./App.css";

// --- Splash Screen Loading UI ---
type LoadingStep = {
  id: string;
  label: string;
  done: boolean;
  active: boolean;
};

function SplashScreen({ steps, statusText }: { steps: LoadingStep[]; statusText: string }) {
  return (
    <div
      id="splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-900/15 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-violet-900/10 blur-[140px] pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-sm mx-auto bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 flex flex-col gap-8">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Eve Offline
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono tracking-wider">INITIALIZING RUNTIME</p>
          </div>
        </div>

        {/* Step checklist */}
        <div className="flex flex-col gap-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-500 ${
                step.active && !step.done
                  ? "bg-indigo-500/10 border border-indigo-500/20"
                  : step.done
                  ? "opacity-70"
                  : "opacity-40"
              }`}
            >
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : step.active ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
              <span className={`text-sm font-mono ${step.done ? "text-slate-400" : step.active ? "text-slate-200" : "text-slate-600"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-xs font-mono text-slate-500 tracking-wider min-h-4">
            {statusText}
          </p>
          {/* Scanning bar */}
          <div className="mt-3 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full origin-left animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-[10px] font-mono text-slate-700 tracking-widest">EVE OFFLINE v0.1.0</p>
    </div>
  );
}

// --- Main App ---
const STEPS_INIT: LoadingStep[] = [
  { id: "runtime", label: "Starting agent runtime", done: false, active: true },
  { id: "port", label: "Allocating sidecar port", done: false, active: false },
  { id: "health", label: "Waiting for health check", done: false, active: false },
  { id: "llm", label: "Loading LLM model", done: false, active: false },
];

function App() {
  const [steps, setSteps] = useState<LoadingStep[]>(STEPS_INIT);
  const [statusText, setStatusText] = useState("Initializing Eve runtime…");
  const [healthOk, setHealthOk] = useState(false);
  const [sidecarPort, setSidecarPort] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);

  // Clock for the main workspace
  const [time, setTime] = useState(new Date());
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const markStep = useCallback((id: string, done: boolean, nextId?: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, done, active: !done };
        if (nextId && s.id === nextId) return { ...s, active: true };
        return s;
      })
    );
  }, []);

  // Health poll loop
  const pollHealth = useCallback(async (port: number) => {
    markStep("port", true, "health");
    setStatusText(`Sidecar on :${port} — waiting for health check…`);
    let attempts = 0;
    while (true) {
      try {
        const res = await fetch(`http://localhost:${port}/health`);
        if (res.ok) {
          const data = await res.json() as { status: string; modelLoaded: boolean };
          markStep("health", true, "llm");
          setStatusText("Health OK — loading LLM model…");
          if (data.modelLoaded) {
            markStep("llm", true);
            setStatusText("All systems ready!");
            await new Promise((r) => setTimeout(r, 600));
            setExiting(true);
            await new Promise((r) => setTimeout(r, 400));
            setHealthOk(true);
            return;
          }
          // modelLoaded is false — still loading. Keep polling.
          setStatusText(`LLM model loading… (check ${attempts})`);
        }
      } catch {
        // sidecar not yet accepting connections
      }
      attempts++;
      await new Promise((r) => setTimeout(r, 250));
    }
  }, [markStep]);

  // On mount: listen for sidecar-ready event, also check if already emitted
  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      markStep("runtime", false, "port");
      setStatusText("Connecting to sidecar…");

      // Subscribe first to avoid race
      const unlisten = await listen<number>("sidecar-ready", async (event) => {
        if (cancelled) return;
        const port = event.payload;
        setSidecarPort(port);
        await pollHealth(port);
        unlisten();
      });

      // Check if the event already fired before we subscribed
      const existingPort = await invoke<number | null>("get_sidecar_port");
      if (existingPort !== null && existingPort !== undefined && !cancelled) {
        setSidecarPort(existingPort);
        unlisten(); // don't double-fire
        await pollHealth(existingPort);
      }
    };

    setup().catch(console.error);
    return () => { cancelled = true; };
  }, [pollHealth, markStep]);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  if (!healthOk) {
    return (
      <div className={`transition-opacity duration-400 ${exiting ? "opacity-0" : "opacity-100"}`}>
        <SplashScreen steps={steps} statusText={statusText} />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // MAIN WORKSPACE — shown after health check passes
  // ----------------------------------------------------------------
  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 bg-grid-pattern selection:bg-indigo-500/30">
      {/* Background ambient glow points */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

      {/* Main glassmorphic panel */}
      <main className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 z-10">

        {/* Left Side: Greet Control Panel (Spans 7 columns) */}
        <section className="col-span-12 md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ONLINE
              </span>
              <span className="text-[10px] font-mono tracking-wider text-slate-500">
                SIDECAR: :{sidecarPort ?? "—"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Welcome to Eve
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Offline AI agents running locally on your machine. Input your identity to verify Tauri interop.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="greet-input" className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                Transmission Payload (Name)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Radio className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </span>
                <input
                  id="greet-input"
                  type="text"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder="Enter custom parameter..."
                  value={name}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 py-5"
            >
              <Send className="w-4 h-4" />
              Invoke Greet Command
            </Button>
          </form>

          {/* Interactive Output Terminal */}
          <div className="border border-slate-800 bg-slate-950/90 rounded-xl p-4 font-mono text-xs relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
            <div className="terminal-scanline" />
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
              <span className="text-[9px] text-slate-500 tracking-widest font-mono">STDOUT_STREAM</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              {greetMsg ? (
                <div className="text-emerald-400 mt-2 font-mono flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-emerald-500">➜</span>
                  <div>
                    <p className="font-semibold">{greetMsg}</p>
                    <p className="text-[10px] text-emerald-500/60 mt-0.5">Handshake established. Status: 200 OK</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 mt-2 italic flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Awaiting handshake sequence from rust backend...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Stack & Status Telemetry (Spans 5 columns) */}
        <section className="col-span-12 md:col-span-5 p-6 md:p-8 bg-slate-900/10 flex flex-col justify-between space-y-8">

          {/* Core Modules Grid */}
          <div className="space-y-6">
            <div className="border-b border-slate-800/60 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Core Modules
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Eve Core */}
              <div className="group flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/80 bg-slate-950/40">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400">Eve</span>
              </div>

              {/* Tauri Core */}
              <a
                href="https://tauri.app"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 hover:border-sky-500/30 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all duration-300"
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <img src="/tauri.svg" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300" alt="Tauri logo" />
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 group-hover:text-sky-400 transition-colors">Tauri</span>
              </a>

              {/* Sidecar */}
              <div className="group flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-800/40 bg-emerald-950/10">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <Server className="w-7 h-7 text-emerald-400" />
                </div>
                <span className="text-[10px] font-mono mt-2 text-emerald-400">Elysia</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal text-center font-mono">
              All modules initialized and communicating.
            </p>
          </div>

          {/* Telemetry Status info */}
          <div className="space-y-4">
            <div className="border-b border-slate-800/60 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Telemetry Status
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Local Time Card */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800/50 bg-slate-950/30">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>LOCAL TIME</span>
                </div>
                <span className="font-semibold text-indigo-400 tracking-wider">
                  {time.toLocaleTimeString()}
                </span>
              </div>

              {/* UTC Chrono Card */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800/50 bg-slate-950/30">
                <div className="flex items-center gap-2 text-slate-400">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>UTC CHRONO</span>
                </div>
                <span className="font-semibold text-slate-400 tracking-wider">
                  {time.toUTCString().slice(17, 25)}
                </span>
              </div>

              {/* Grid Connection Status */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg border border-slate-800/50 bg-slate-950/30 space-y-1">
                  <div className="text-[9px] text-slate-500">RUST BRIDGE</div>
                  <div className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-slate-800/50 bg-slate-950/30 space-y-1">
                  <div className="text-[9px] text-slate-500">SIDECAR PORT</div>
                  <div className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    :{sidecarPort ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
