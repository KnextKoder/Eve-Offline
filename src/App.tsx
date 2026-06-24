import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Layers, Radio, Send, Clock, Compass, Activity } from "lucide-react";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

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
                SYSTEM SECURE
              </span>
              <span className="text-[10px] font-mono tracking-wider text-slate-500">
                PORT-COMMS: 1420
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Welcome to Tauri
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Bridging high-performance Rust backends with web-tier React frontend environments. Input your identity to verify Tauri interop.
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
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-mono">sys@eve-offline:~$</span>
                <span className="text-indigo-400">tauri-invoke greet --name "{name || ""}"</span>
              </div>
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
              {/* Vite Core */}
              <a
                href="https://vite.dev"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 hover:border-yellow-500/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all duration-300"
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <img src="/vite.svg" className="w-8 h-8 object-contain group-hover:scale-115 transition-transform duration-300 animate-float" alt="Vite logo" />
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 group-hover:text-yellow-400 transition-colors">Vite</span>
              </a>

              {/* Tauri Core */}
              <a
                href="https://tauri.app"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 hover:border-sky-500/30 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all duration-300"
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <img src="/tauri.svg" className="w-8 h-8 object-contain group-hover:scale-115 transition-transform duration-300" alt="Tauri logo" />
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 group-hover:text-sky-400 transition-colors">Tauri</span>
              </a>

              {/* React Core */}
              <a
                href="https://react.dev"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300"
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <img src={reactLogo} className="w-8 h-8 object-contain group-hover:rotate-180 group-hover:scale-115 transition-transform duration-700" alt="React logo" />
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 group-hover:text-cyan-400 transition-colors">React</span>
              </a>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal text-center font-mono">
              Hover over core nodes to initiate orbital telemetry links.
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
                  <div className="text-[9px] text-slate-500">COMMS STATUS</div>
                  <div className="font-semibold text-sky-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    SECURE
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

