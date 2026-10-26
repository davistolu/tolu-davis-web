import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, RefreshCw, XCircle, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

export interface ProcessItem {
  pid: number;
  user: string;
  name: string;
  cpu: number;
  mem: number;
  status: 'RUNNING' | 'SLEEPING' | 'KILLED' | 'RESPAWNING';
  description: string;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1337, user: 'root', name: 'wirebridge-rpc-engine', cpu: 3.8, mem: 184, status: 'RUNNING', description: 'Cross-runtime bridge (Go, Python, TS, Ruby)' },
  { pid: 2048, user: 'root', name: 'riaum-ai-telemetry', cpu: 5.2, mem: 312, status: 'RUNNING', description: 'Gemini LLM mindfulness prompt generator' },
  { pid: 3120, user: 'tolu', name: 'devflow-collaboration', cpu: 2.1, mem: 145, status: 'RUNNING', description: 'WebSockets peer-to-peer code synchronization' },
  { pid: 4096, user: 'tolu', name: 'open-meteo-weather-worker', cpu: 0.9, mem: 68, status: 'RUNNING', description: 'Global telemetry REST poller' },
  { pid: 5120, user: 'tolu', name: 'coingecko-rate-streamer', cpu: 1.4, mem: 92, status: 'RUNNING', description: 'Crypto market ticker daemon' },
  { pid: 6144, user: 'system', name: 'matrix-rain-gpu-shader', cpu: 4.1, mem: 128, status: 'RUNNING', description: 'WebGL/Canvas 60fps digital rain animator' },
  { pid: 8080, user: 'daemon', name: 'cyber-radio-synthesizer', cpu: 1.8, mem: 84, status: 'RUNNING', description: '8-bit chiptune audio generator' },
  { pid: 9001, user: 'tolu', name: 'snake-cli-game-loop', cpu: 1.1, mem: 56, status: 'RUNNING', description: 'Retro arcade collision physics engine' },
  { pid: 9999, user: 'system', name: 'nexus9-pet-tamagotchi', cpu: 0.6, mem: 42, status: 'SLEEPING', description: 'Living terminal companion daemon' },
];

const ProcessMonitor: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [selectedPid, setSelectedPid] = useState<number | null>(1337);
  const [cpuTotal, setCpuTotal] = useState<number>(21.0);
  const [memTotal, setMemTotal] = useState<number>(1111);
  const [sysLog, setSysLog] = useState<string>('System daemon initialized. All daemons operational.');

  // Live fluctuating telemetry values
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.status === 'KILLED' || p.status === 'RESPAWNING') return p;
          const deltaCpu = (Math.random() - 0.5) * 0.8;
          const newCpu = Math.max(0.2, Math.min(15.0, +(p.cpu + deltaCpu).toFixed(1)));
          return { ...p, cpu: newCpu };
        })
      );

      const total = processes.reduce((acc, cur) => (cur.status === 'RUNNING' ? acc + cur.cpu : acc), 0);
      setCpuTotal(+total.toFixed(1));
    }, 1500);

    return () => clearInterval(interval);
  }, [processes]);

  // Kill Process Action
  const killProcess = (pid: number) => {
    terminalSound.playError();
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, status: 'KILLED', cpu: 0 } : p))
    );
    setSysLog(`[SIGTERM] Process PID ${pid} terminated by user.`);

    // Auto respawn after 3 seconds with funny notification
    setTimeout(() => {
      setProcesses((prev) =>
        prev.map((p) => (p.pid === pid ? { ...p, status: 'RESPAWNING' } : p))
      );
      setSysLog(`[RECOVERY] Daemon PID ${pid} auto-respawning via systemd watchdog...`);

      setTimeout(() => {
        setProcesses((prev) =>
          prev.map((p) => (p.pid === pid ? { ...p, status: 'RUNNING', cpu: 2.5 } : p))
        );
        terminalSound.playSuccess();
        setSysLog(`[ONLINE] PID ${pid} restored successfully. Zero downtime maintained.`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 font-mono text-xs space-y-4 max-w-4xl mx-auto shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#22c55e]" />
          <span className="text-[#22c55e] font-bold">HTOP — Live System Daemons &amp; Process Manager</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>Load Avg: <strong className="text-white">0.42 0.38 0.29</strong></span>
          <span className="text-zinc-600">|</span>
          <span>Uptime: <strong className="text-[#4ade80]">99.98%</strong></span>
        </div>
      </div>

      {/* Resource Gauge Bars */}
      <div className="grid sm:grid-cols-2 gap-4 bg-[#0c0c0e] p-3 rounded border border-[#1f1f24]">
        {/* CPU Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-zinc-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" /> CPU Usage:
            </span>
            <span className="text-[#38bdf8] font-bold">{cpuTotal}%</span>
          </div>
          <div className="w-full bg-[#18181b] h-2 rounded overflow-hidden flex">
            <div className="bg-[#38bdf8] h-full transition-all duration-500" style={{ width: `${Math.min(100, cpuTotal * 2)}%` }} />
            <div className="bg-[#22c55e] h-full transition-all duration-500" style={{ width: '10%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>8 Cores @ 3.8GHz</span>
            <span>Temp: 39°C</span>
          </div>
        </div>

        {/* Memory Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-zinc-300">
            <span className="flex items-center gap-1.5 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-[#a855f7]" /> Memory:
            </span>
            <span className="text-[#a855f7] font-bold">1,111 MB / 16,384 MB</span>
          </div>
          <div className="w-full bg-[#18181b] h-2 rounded overflow-hidden flex">
            <div className="bg-[#a855f7] h-full transition-all duration-500" style={{ width: '12%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Swap: 0 / 8,192 MB</span>
            <span>Cached: 4,210 MB</span>
          </div>
        </div>
      </div>

      {/* Syslog Message Feed */}
      <div className="bg-[#050507] p-2 rounded border border-[#1f1f24] text-[11px] text-zinc-400 flex items-center justify-between">
        <span className="text-[#4ade80] flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> {sysLog}
        </span>
        <span className="text-[10px] text-zinc-600">kernel 6.8.0-arch</span>
      </div>

      {/* Interactive Process Table */}
      <div className="overflow-x-auto border border-[#1f1f24] rounded bg-[#070709]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0e0e12] border-b border-[#27272a] text-[10px] text-zinc-400 uppercase tracking-wider">
              <th className="p-2">PID</th>
              <th className="p-2">USER</th>
              <th className="p-2">PROCESS NAME</th>
              <th className="p-2">CPU %</th>
              <th className="p-2">MEM (MB)</th>
              <th className="p-2">STATUS</th>
              <th className="p-2 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc) => {
              const isSelected = selectedPid === proc.pid;
              return (
                <tr
                  key={proc.pid}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`border-b border-[#18181b] hover:bg-[#121216] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#18181b]/80 text-white' : 'text-zinc-300'
                  }`}
                >
                  <td className="p-2 font-bold text-[#38bdf8]">{proc.pid}</td>
                  <td className="p-2 text-zinc-400">{proc.user}</td>
                  <td className="p-2 font-semibold">
                    <div>{proc.name}</div>
                    <div className="text-[9px] text-zinc-500 font-normal">{proc.description}</div>
                  </td>
                  <td className="p-2 text-[#4ade80]">{proc.cpu}%</td>
                  <td className="p-2 text-zinc-300">{proc.mem}M</td>
                  <td className="p-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        proc.status === 'RUNNING'
                          ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30'
                          : proc.status === 'KILLED'
                          ? 'bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30'
                          : proc.status === 'RESPAWNING'
                          ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {proc.status}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        killProcess(proc.pid);
                      }}
                      disabled={proc.status === 'KILLED' || proc.status === 'RESPAWNING'}
                      className="px-2 py-0.5 bg-[#ef4444]/10 hover:bg-[#ef4444] text-[#ef4444] hover:text-black border border-[#ef4444]/30 rounded text-[10px] font-bold transition-colors disabled:opacity-30"
                      title="Send SIGTERM to Process"
                    >
                      KILL
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessMonitor;
