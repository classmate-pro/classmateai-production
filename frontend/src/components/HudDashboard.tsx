import React, { useState, useEffect, useRef } from 'react';
import { 
  CoreSettings, 
  TerminalLine, 
  AcademicModule, 
  TelemetryLog 
} from '../types';
import { audioEngine } from '../utils/AudioEngine';
import { 
  Terminal, 
  Cpu, 
  Radio, 
  Settings, 
  Layers, 
  Database, 
  Zap, 
  CircleDot, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Activity, 
  BookOpen, 
  Code, 
  Sliders, 
  ShieldAlert, 
  Clock,
  Compass,
  ChevronsRight,
  Server,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HudDashboardProps {
  settings: CoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<CoreSettings>>;
}

export default function HudDashboard({ settings, setSettings }: HudDashboardProps) {
  // Input terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'system',
      text: 'NEXUS STUDENT UPLINK STABLE // SESSION ESTABLISHED 2026-06-23',
      timestamp: '08:42:59'
    },
    {
      id: '2',
      type: 'output',
      text: 'Type "help" to list secure terminal protocols, or manipulate core triggers below.',
      timestamp: '08:43:00'
    }
  ]);

  // Telemetry logs state
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([
    { id: '1', tag: 'NET-IN', message: 'Holographic router initialised with cloud bridge', status: 'success', time: '08:42:15' },
    { id: '2', tag: 'SYS-MON', message: 'Quantum resonance frequency aligned closely with portal', status: 'info', time: '08:42:30' },
    { id: '3', tag: 'SYNAPSE', message: 'Synaptic module loading sequence completed (99.8%)', status: 'success', time: '08:42:45' }
  ]);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Sound state
  const [audioActive, setAudioActive] = useState(false);

  // Time state
  const [currentTime, setCurrentTime] = useState('2026-06-23 08:42:59');

  // Terminal box scroll ref
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Custom mock interactive academic modules list
  const [academicModules, setAcademicModules] = useState<AcademicModule[]>([
    {
      id: 'm1',
      code: 'QDS-309',
      name: 'Quantum Data Synthesis',
      category: 'Advanced Cybernetics',
      credits: 4,
      progress: 92,
      status: 'In Progress',
      intelRating: 94,
      instructor: 'Dr. V. Aris'
    },
    {
      id: 'm2',
      code: 'CDS-404',
      name: 'Cryptographic Decryption Schemes',
      category: 'Neural Security',
      credits: 3,
      progress: 74,
      status: 'In Progress',
      intelRating: 88,
      instructor: 'Dr. S. Klay'
    },
    {
      id: 'm3',
      code: 'WARP-102',
      name: 'Faster-Than-Light Navigation',
      category: 'Cosmos Dynamics',
      credits: 5,
      progress: 35,
      status: 'In Progress',
      intelRating: 72,
      instructor: 'Prof. J. Vance'
    },
    {
      id: 'm4',
      code: 'NEU-722',
      name: 'Neural Core Synchronization',
      category: 'Biomimicking AI',
      credits: 4,
      progress: 0,
      status: 'Locked',
      intelRating: 95,
      instructor: 'Athera AI-01'
    }
  ]);

  // Set real-time clock counter — 1s interval is sufficient, 45ms caused excessive re-renders
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      // Formatted customized high-tech sci-fi time representation
      const year = d.getFullYear() + 30; // 30 Years into the future! Establishes the sci-fi setting
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      setCurrentTime(`${year}-${month}-${day} T${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set randomized scrolling telemetry logs feed
  useEffect(() => {
    const logTags = ['SEC-CORE', 'UPLINK', 'PORTAL', 'SYNAPSE', 'SYS-CPU', 'HOLO-NET'];
    const logMsgs = [
      'Encrypted neural payload decompressed successfully',
      'Atmospheric ion shielding holding at 98.4%',
      'Course warp trajectory telemetry scanned and logged',
      'Attuned sub-space packets received through node',
      'Decoded academic ledger signature matching index',
      'Recalibrating spatial grid projection matrices',
      'AI tutor Athena-IV requested direct bandwidth sync',
      'Virtual reality lecture hall matrix assembled client-side',
      'Sub-space vector warp coordinates updated',
      'Dynamic telemetry report submitted to administrative server'
    ];
    const logStatus: ('info' | 'warn' | 'alert' | 'success')[] = ['info', 'success', 'warn', 'info'];

    const interval = setInterval(() => {
      const randTag = logTags[Math.floor(Math.random() * logTags.length)];
      const randMsg = logMsgs[Math.floor(Math.random() * logMsgs.length)];
      const randStat = logStatus[Math.floor(Math.random() * logStatus.length)];

      const d = new Date();
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

      const newLog: TelemetryLog = {
        id: Math.random().toString(),
        tag: randTag,
        message: randMsg,
        status: randStat,
        time: timeStr
      };

      setTelemetryLogs(prev => [newLog, ...prev.slice(0, 5)]);

      if (audioActive) {
        // subtle soft background data blip
        audioEngine.playBlip(300 + Math.random() * 400, 0.03);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [audioActive]);

  // Scroll terminal to base
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Audio activation toggler
  const handleToggleAudio = () => {
    const newState = !audioActive;
    setAudioActive(newState);
    audioEngine.toggleAmbientHum(newState);
    if (newState) {
      audioEngine.playBlip(1200, 0.1, 'sine');
      audioEngine.updateHumTempo(settings.speedMultiplier);
    }
  };

  // Trigger audio speed sync on settings changes
  useEffect(() => {
    if (audioActive) {
      audioEngine.updateHumTempo(settings.speedMultiplier);
    }
  }, [settings.speedMultiplier, audioActive]);

  // Central Command handler
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Save history
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    
    const inputLine: TerminalLine = {
      id: Math.random().toString(),
      type: 'input',
      text: `SARULE@CADET-NET ~$ ${trimmed}`,
      timestamp: timeStr
    };

    setTerminalLines(prev => [...prev, inputLine]);

    const parts = trimmed.toLowerCase().split(' ');
    const baseCmd = parts[0];
    const argument = parts.slice(1).join(' ');

    let responseLine: TerminalLine = {
      id: Math.random().toString(),
      type: 'output',
      text: '',
      timestamp: timeStr
    };

    if (audioActive) {
      audioEngine.playBlip(800, 0.1, 'triangle');
    }

    switch (baseCmd) {
      case 'help':
        responseLine.text = `SECURE RESISTANCE NODE COMMAND DIRECTIVES:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  help                              - View secure terminal protocols
  status                            - Display telemetry matrix + portal speed diagnostics
  core <shape>                      - Morph 3D core (sphere, torusKnot, dodecahedron, tetrahedron)
  color <shade>                     - Align spatial colors (cyan, pink, green, amber)
  mode <type>                       - Reprogram core frequencies (ORBIT, QUANTUM, NEURAL, WAVE)
  modules                           - Pull academic curriculum grades & syllabus status
  analyze                           - Launch automated deep-resonance diagnostics
  clear                             - Cleanse active terminal histories
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`;
        break;

      case 'status':
        responseLine.text = `SYS METRICS SYSTEM diagnostics FOR: STUDENT SARULE, P.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Current Standing        : QUANTUM SCHOLAR, TIER IV
  Holographic Matrix      : ACTIVE [3D WEBGL GRAPHICS STABLE]
  Resonance Mode          : ${settings.mode}
  Active Geometry Core    : ${settings.geometry.toUpperCase()}
  Speed Modulation        : ${settings.speedMultiplier}x Frequency
  Core Wireframe Filter   : ${settings.wireframe ? 'ON' : 'OFF'}
  Orbital Grid Latency    : 11.45 Micro-Chronons
  Environment State       : Ambient Temperature 18Â°C / Shield Core Stable`;
        break;

      case 'clear':
        setTerminalLines([]);
        // Short-circuit to avoid appending empty line
        return;

      case 'core':
        if (['sphere', 'torusknot', 'dodecahedron', 'tetrahedron'].includes(argument)) {
          const matchedGeom = argument === 'torusknot' ? 'torusKnot' : argument as any;
          setSettings(prev => ({ ...prev, geometry: matchedGeom }));
          responseLine.type = 'success';
          responseLine.text = `âœ” 3D Core geometry transformed to: ${argument.toUpperCase()}`;
          if (audioActive) audioEngine.playSuccess();
        } else {
          responseLine.type = 'error';
          responseLine.text = `âœ— Invalid core parameter. Use: sphere, torusKnot, dodecahedron, or tetrahedron.`;
        }
        break;

      case 'color':
        if (['cyan', 'pink', 'green', 'amber'].includes(argument)) {
          setSettings(prev => ({ ...prev, color: argument as any }));
          responseLine.type = 'success';
          responseLine.text = `âœ” Spatial color palette aligned to: ${argument.toUpperCase()}`;
          if (audioActive) audioEngine.playSuccess();
        } else {
          responseLine.type = 'error';
          responseLine.text = `âœ— Color target must be: cyan, pink, green, of amber.`;
        }
        break;

      case 'mode':
        if (['orbit', 'quantum', 'neural', 'wave'].includes(argument.toLowerCase())) {
          const matchedMode = argument.toUpperCase() as any;
          setSettings(prev => ({ ...prev, mode: matchedMode }));
          responseLine.type = 'success';
          responseLine.text = `âœ” Core frequency re-aligned to operational mode: ${matchedMode}`;
          if (audioActive) audioEngine.playSuccess();
        } else {
          responseLine.type = 'error';
          responseLine.text = `âœ— Matrix Mode must be: ORBIT, QUANTUM, NEURAL, or WAVE.`;
        }
        break;

      case 'modules':
        responseLine.text = `STUDENT SYLLABUS GRID & RESUME:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  [m1] QDS-309: Quantum Data Synthesis          (92% Progress - Dr. V. Aris)
  [m2] CDS-404: Cryptographic Decryption Schemes (74% Progress - Dr. S. Klay)
  [m3] WARP-102: Faster-Than-Light Navigation     (35% Progress - Prof. J. Vance)
  [m4] NEU-722: Neural Core Synchronization     (LOCKED - Athena AI-01)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
To upgrade metrics, adjust interactive parameters in your sidebar.`;
        break;

      case 'analyze':
        responseLine.text = `STARTING SYSTEM SPECTRUM ANOMALY DISPERSION SCAN...`;
        setIsScanning(true);
        setScanProgress(0);
        if (audioActive) audioEngine.playSweep(1400, 300, 1.2);
        break;

      default:
        responseLine.type = 'error';
        responseLine.text = `âœ— Direct command "${baseCmd}" not identified. Type "help" for valid secure student terminal protocols.`;
        break;
    }

    if (responseLine.text) {
      setTerminalLines(prev => [...prev, responseLine]);
    }
  };

  // Manage Scan Loader interval
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          const d = new Date();
          const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
          
          setTerminalLines(prev => [...prev, {
            id: Math.random().toString(),
            type: 'success',
            text: `âœ” SPECTRAL CORE DIAGNOSTIC COMPLETED. RESONANCE MATRIX ALIGNED FOR TIER IV CURRICULUM. NO SYSTEM ERROR BLOCKS FOUND.`,
            timestamp: timeStr
          }]);
          if (audioActive) audioEngine.playSuccess();
          return 100;
        }
        return p + 4;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning, audioActive]);

  // Direct manual submit handler
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    executeCommand(terminalInput);
    setTerminalInput('');
  };

  // Color border mapping
  const getThemeColorClass = () => {
    switch (settings.color) {
      case 'pink': return 'cyber-border-pink';
      case 'green': return 'cyber-border-green';
      case 'amber': return 'cyber-border-amber';
      case 'cyan':
      default:
        return 'cyber-border-cyan';
    }
  };

  const getTextColorClass = () => {
    switch (settings.color) {
      case 'pink': return 'text-cyber-pink';
      case 'green': return 'text-cyber-green';
      case 'amber': return 'text-cyber-amber';
      case 'cyan':
      default:
        return 'text-cyber-cyan';
    }
  };

  const getGlowColorClass = () => {
    switch (settings.color) {
      case 'pink': return 'glow-pink';
      case 'green': return 'glow-green';
      case 'amber': return 'shadow-cyber-amber/50';
      case 'cyan':
      default:
        return 'glow-cyan';
    }
  };

  const getBgColorClass = () => {
    switch (settings.color) {
      case 'pink': return 'bg-cyber-pink';
      case 'green': return 'bg-cyber-green';
      case 'amber': return 'bg-cyber-amber';
      case 'cyan':
      default:
        return 'bg-cyber-cyan';
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6 pt-28 md:pt-32 text-white font-sans overflow-hidden pointer-events-none">
      
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TOP STATUS BAR INFORMATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl pointer-events-auto border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative inner edge shine */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* Animated Glowing Logo Icon configured with gradient */}
            <div className="relative">
              <div className={`absolute -inset-1 rounded-xl opacity-40 blur-sm animate-pulse bg-gradient-to-tr from-indigo-500 to-cyan-400`} />
              <div className="relative w-11 h-11 bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10 rotate-2 border border-white/20">
                <Compass className="w-5 h-5 animate-spin-slow text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-medium text-lg md:text-xl tracking-tight flex items-center gap-2 text-white">
                NEXUS / <span className={`${getTextColorClass()} ${getGlowColorClass()} font-bold italic`}>STUDENT CORE</span>
                <span className="text-[10px] py-0.5 px-2 bg-white/5 border border-white/10 rounded font-mono text-slate-300 tracking-normal font-normal">v4.2.1-SEC</span>
              </h1>
              <p className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">Hyperion Galactic Academy Student Subsystem</p>
            </div>
          </div>
        </div>

        {/* Diagnostic Statuses panel inside header */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6 font-mono text-xs">
          <div className="hidden lg:flex items-center gap-2 border-r border-white/10 pr-4">
            <Radio className={`w-4 h-4 animate-pulse ${getTextColorClass()}`} />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 uppercase">Connection Status</div>
              <div className="text-white/90 font-semibold text-[11px]">UPLINK STABLE (12ms)</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-r border-white/10 pr-4">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 uppercase">Holo frequency</div>
              <div className={`font-semibold text-[11px] ${getTextColorClass()}`}>{(settings.speedMultiplier * 23.45).toFixed(2)} GHz</div>
            </div>
          </div>

          {/* Temporal Time Offset Clock display */}
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <Clock className="w-4 h-4 text-slate-300" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 uppercase">Earth Sync Standard</div>
              <div className="text-[11px] tracking-wider text-white font-medium">{currentTime}</div>
            </div>
          </div>

          {/* Audio Engine Trigger System */}
          <button 
            id="audio-uplink-toggle-btn"
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-full border transition-all pointer-events-auto active:scale-95 text-xs font-mono tracking-wider ${
              audioActive 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-white/20 shadow-lg shadow-indigo-500/20' 
                : 'border-white/10 hover:border-white/20 text-white/60 hover:text-white bg-white/5'
            }`}
          >
            {audioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] uppercase font-bold text-white">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[10px] text-white/55">AUDIO MUTED</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAIN DUAL TERMINAL / SIDEBAR LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="w-full h-full flex flex-col lg:flex-row gap-4 mt-4 mb-4 select-none overflow-hidden">
        
        {/* LEFT COLUMN: Student Bio & Real-time Live Log Feed */}
        <section className="w-full lg:w-[28%] flex flex-col gap-4 overflow-hidden">
          
          {/* Student Profile Identity Panel */}
          <div className={`cyber-panel-clip p-5 flex flex-col gap-3 pointer-events-auto ${getThemeColorClass()}`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
                <span className="font-mono text-[10px] text-white/40 tracking-wider">STUDENT ID DATA CARD</span>
              </div>
              <span className={`font-mono text-[9px] ${getTextColorClass()}`}>SECURE KEY : S-617-A</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <Cpu className={`w-8 h-8 ${getTextColorClass()}`} />
                {/* Cyber scans bars overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyber-cyan/10 to-transparent w-full h-[2px] animate-bounce" />
              </div>

              <div>
                <div className="font-display font-medium text-white/95 text-sm uppercase tracking-wider">Pravin Sarule</div>
                <div className="font-mono text-[10px] text-white/60">Quantum Cadet â€¢ Scholar Tier IV</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                  <span className="font-mono text-[9px] text-white/40">Portal Uplink Authenticated</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-2 bg-black/40 rounded border border-white/5 flex flex-col">
                <span className="font-mono text-[8px] text-white/40">SYNAPSE VALUE</span>
                <span className="font-display text-xs font-semibold text-white">431.02 SV</span>
              </div>
              <div className="p-2 bg-black/40 rounded border border-white/5 flex flex-col">
                <span className="font-mono text-[8px] text-white/40">COURSES REMAINING</span>
                <span className="font-display text-xs font-semibold text-white">1 Level Unit</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1 text-[11px] font-mono text-white/70">
              <div className="flex justify-between">
                <span>Memory Allocation:</span>
                <span className={`font-bold ${getTextColorClass()}`}>84.5%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden border border-white/5">
                <div className={`h-full ${getBgColorClass()}`} style={{ width: '84.5%' }} />
              </div>
            </div>
          </div>

          {/* Live System Logs Streaming Panel */}
          <div className="flex-1 bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl flex flex-col gap-3 pointer-events-auto border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyber-cyan" />
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Core Telemetry Feed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
                <span className="font-mono text-[8px] text-white/40">LIVE SYNCING</span>
              </div>
            </div>

            {/* Scrolling log stack */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {telemetryLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -15, y: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col p-2 bg-black/40 rounded border border-white/5 text-[11px] font-mono"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`py-0.5 px-1.5 rounded text-[8px] font-bold text-black uppercase ${
                        log.status === 'success' ? 'bg-cyber-green' :
                        log.status === 'warn' ? 'bg-cyber-amber' :
                        log.status === 'alert' ? 'bg-cyber-pink' : 'bg-cyber-cyan'
                      }`}>
                        {log.tag}
                      </span>
                      <span className="text-white/30 text-[9px]">{log.time}</span>
                    </div>
                    <p className="text-white/80 select-all leading-normal">{log.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* MIDDLE SECTION: Interactive HUD control prompt & Interactive visual status bar */}
        <section className="flex-1 flex flex-col justify-end p-4 z-10 pointers-none">
          {/* Subtle text label for mouse parallax interaction */}
          <div className="mx-auto text-center mb-auto pt-10">
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-mono text-xs text-white/40 uppercase tracking-widest hidden sm:block bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5"
            >
              ðŸŒŒ Tilt Device / Drag Cursor to Navigate Space Parallax Depth
            </motion.p>
          </div>

          {/* Interactive Core Quick Trigger Panel */}
          <div className="w-full max-w-xl mx-auto bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl pointer-events-auto border border-white/10 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyber-purple" />
                <span className="font-mono text-xs text-white/60">HYPER-DIMENSIONAL SANDBOX CONTROLS</span>
              </div>
              <span className="font-mono text-[10px] text-white/40">PRESET PROTOCOL ACTIVE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                onClick={() => {
                  setSettings(prev => ({ ...prev, color: 'cyan' }));
                  if (audioActive) audioEngine.playBlip(900, 0.08, 'sine');
                }}
                className={`py-2 px-3 rounded border text-[11px] font-mono transition-all hover:scale-[1.02] active:scale-95 ${
                  settings.color === 'cyan' 
                    ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold' 
                    : 'border-white/5 bg-black/30 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                â–  CYAN CORE
              </button>
              <button 
                onClick={() => {
                  setSettings(prev => ({ ...prev, color: 'pink' }));
                  if (audioActive) audioEngine.playBlip(1000, 0.08, 'sine');
                }}
                className={`py-2 px-3 rounded border text-[11px] font-mono transition-all hover:scale-[1.02] active:scale-95 ${
                  settings.color === 'pink' 
                    ? 'border-cyber-pink bg-cyber-pink/15 text-cyber-pink font-bold' 
                    : 'border-white/5 bg-black/30 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                â–  PINK SPARK
              </button>
              <button 
                onClick={() => {
                  setSettings(prev => ({ ...prev, color: 'green' }));
                  if (audioActive) audioEngine.playBlip(1100, 0.08, 'sine');
                }}
                className={`py-2 px-3 rounded border text-[11px] font-mono transition-all hover:scale-[1.02] active:scale-95 ${
                  settings.color === 'green' 
                    ? 'border-cyber-green bg-cyber-green/15 text-cyber-green font-bold' 
                    : 'border-white/5 bg-black/30 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                â–  TECH ALIEN
              </button>
              <button 
                onClick={() => {
                  setSettings(prev => ({ ...prev, color: 'amber' }));
                  if (audioActive) audioEngine.playBlip(1200, 0.08, 'sine');
                }}
                className={`py-2 px-3 rounded border text-[11px] font-mono transition-all hover:scale-[1.02] active:scale-95 ${
                  settings.color === 'amber' 
                    ? 'border-cyber-amber bg-cyber-amber/15 text-cyber-amber font-bold' 
                    : 'border-white/5 bg-black/30 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                â–  SOLAR COAL
              </button>
            </div>

            <div className="text-[11px] font-mono text-white/50 flex flex-wrap gap-x-4 gap-y-1 justify-between border-t border-white/5 pt-2">
              <span>ACTIVE FREQUENCY RESISTANCE: <strong className={getTextColorClass()}>{settings.mode} MODE</strong></span>
              <span>GEOMETRY MATRIX: <strong className={getTextColorClass()}>{settings.geometry.toUpperCase()}</strong></span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Interactive Core Tuner Control & Academic Modules Progression List */}
        <section className="w-full lg:w-[32%] flex flex-col gap-4 overflow-hidden">
          
          {/* Sliders and Switch Controls Matrices */}
          <div className={`cyber-panel-clip p-5 pointer-events-auto flex flex-col gap-4 ${getThemeColorClass()}`}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Sliders className="w-4 h-4 text-cyber-cyan" />
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Reactor Core Modulators</span>
            </div>

            {/* Geometry Select Switch buttons */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-white/50 uppercase">Matrix Core Geometry</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'sphere', label: 'Sphere' },
                  { id: 'torusKnot', label: 'TorusKnot' },
                  { id: 'dodecahedron', label: 'Dodecahedron' },
                  { id: 'tetrahedron', label: 'Tetrahedron' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSettings(prev => ({ ...prev, geometry: item.id as any }));
                      if (audioActive) audioEngine.playBlip(800, 0.05, 'triangle');
                    }}
                    className={`py-1.5 px-2 rounded text-[10px] font-mono transition-all text-left truncate flex items-center gap-1 border ${
                      settings.geometry === item.id
                        ? `${getThemeColorClass()} bg-white/5 font-bold ${getTextColorClass()}`
                        : 'border-white/5 bg-black/20 text-white/50 hover:text-white'
                    }`}
                  >
                    <CircleDot className="w-2.5 h-2.5 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix mode selections */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-white/50 uppercase">Matrix Operational Mode</span>
              <div className="grid grid-cols-4 gap-1">
                {['ORBIT', 'QUANTUM', 'NEURAL', 'WAVE'].map((modeItem) => (
                  <button
                    key={modeItem}
                    onClick={() => {
                      setSettings(prev => ({ ...prev, mode: modeItem as any }));
                      if (audioActive) audioEngine.playBlip(1000, 0.06, 'sine');
                    }}
                    className={`py-1 rounded text-[9px] font-mono text-center tracking-wider border ${
                      settings.mode === modeItem
                        ? `${getThemeColorClass()} bg-white/5 font-bold ${getTextColorClass()}`
                        : 'border-white/5 bg-black/25 text-white/40 hover:text-white'
                    }`}
                  >
                    {modeItem}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed controller slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center font-mono text-[10px]">
                <span className="text-white/50 uppercase">Spin Rotational Speed</span>
                <span className={`font-bold ${getTextColorClass()}`}>{settings.speedMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={settings.speedMultiplier}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSettings(prev => ({ ...prev, speedMultiplier: val }));
                  if (audioActive) audioEngine.playBlip(500 + val * 100, 0.03, 'sine');
                }}
                className={`w-full accent-cyber-cyan h-1 bg-white/10 rounded-lg cursor-pointer ${getThemeColorClass()}`}
              />
            </div>

            {/* Interactive Switches Checklist */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.autoRotate}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, autoRotate: e.target.checked }));
                    if (audioActive) audioEngine.playBlip(600, 0.05, 'triangle');
                  }}
                  className="rounded border-white/10 bg-black/50 text-cyber-cyan focus:ring-0 cursor-pointer"
                />
                <span className="font-mono text-[10px] text-white/60 uppercase">Auto Spin</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.wireframe}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, wireframe: e.target.checked }));
                    if (audioActive) audioEngine.playBlip(600, 0.05, 'triangle');
                  }}
                  className="rounded border-white/10 bg-black/50 text-cyber-cyan focus:ring-0 cursor-pointer"
                />
                <span className="font-mono text-[10px] text-white/60 uppercase">Wireframes</span>
              </label>
            </div>
          </div>

          {/* Academic Courses Curriculums */}
          <div className="flex-1 bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl pointer-events-auto border border-white/10 shadow-2xl flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <BookOpen className="w-4 h-4 text-cyber-purple" />
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Active Curriculum Sync</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {academicModules.map((module) => (
                <div 
                  key={module.id} 
                  className={`p-2.5 rounded border transition-all hover:bg-white/5 cursor-pointer flex flex-col gap-1 ${
                    module.status === 'Locked' 
                      ? 'border-white/5 opacity-55 hover:opacity-100 bg-transparent' 
                      : 'border-white/10 bg-black/40'
                  }`}
                  onClick={() => {
                    if (audioActive) audioEngine.playBlip(950, 0.08, 'triangle');
                    setTerminalInput(`modules`);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[8px] py-0.5 px-1 bg-white/5 border border-white/10 rounded text-white/50 mr-1.5 uppercase tracking-wide">
                        {module.code}
                      </span>
                      <span className="font-display font-medium text-[11px] text-white/95 uppercase tracking-wide">
                        {module.name}
                      </span>
                    </div>
                    <span className={`font-mono text-[9px] font-bold uppercase ${
                      module.status === 'Locked' ? 'text-cyber-pink' : 'text-cyber-green'
                    }`}>
                      {module.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-white/40">
                    <span>Focus: {module.category}</span>
                    <span>Intel: {module.intelRating}%</span>
                  </div>

                  {module.status !== 'Locked' ? (
                    <div className="flex flex-col gap-1 mt-1 font-mono text-[10px]">
                      <div className="flex justify-between text-white/60">
                        <span>Resonance Integration:</span>
                        <span className={`font-bold ${getTextColorClass()}`}>{module.progress}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                        <div className={`h-full ${getBgColorClass()}`} style={{ width: `${module.progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] font-mono text-cyber-pink tracking-wide mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> PREREQUISITES PENDING (REQUIRE TIER V SYNC)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ BOTTOM COMMAND LINE INTERPRETER MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="w-full flex flex-col gap-2 mt-auto bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl pointer-events-auto border border-white/10 shadow-2xl">
        
        {/* Terminal Text Log output container */}
        <div className="h-28 md:h-32 overflow-y-auto pr-1 flex flex-col gap-1 bg-black/60 backdrop-blur-md p-3.5 rounded-xl font-mono text-[11.5px] border border-white/5">
          {terminalLines.map((line) => (
            <div key={line.id} className="flex gap-2 items-start leading-relaxed">
              <span className="text-white/30 shrink-0 select-none text-[10px] pt-0.5">[{line.timestamp}]</span>
              
              {line.type === 'input' && (
                <span className="text-cyber-cyan inline-flex items-center gap-1 select-all font-semibold break-all">
                  <ChevronsRight className="w-3.5 h-3.5 inline text-cyber-cyan hover:scale-110 cursor-pointer" /> {line.text}
                </span>
              )}
              {line.type === 'system' && (
                <span className="text-cyber-purple font-bold uppercase select-none">{line.text}</span>
              )}
              {line.type === 'output' && (
                <span className="text-white/85 whitespace-pre-wrap select-all font-sans tracking-wide leading-relaxed">{line.text}</span>
              )}
              {line.type === 'error' && (
                <span className="text-cyber-pink font-semibold border-l-2 border-cyber-pink pl-2 py-0.5 whitespace-pre-wrap select-all">{line.text}</span>
              )}
              {line.type === 'success' && (
                <span className="text-cyber-green font-semibold border-l-2 border-cyber-green pl-2 py-0.5 whitespace-pre-wrap select-all">{line.text}</span>
              )}
            </div>
          ))}
          
          {/* Diagnostic scanner bar layer */}
          {isScanning && (
            <div className="flex flex-col gap-1 p-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded mt-1 animate-pulse">
              <div className="flex justify-between text-xs text-cyber-cyan font-bold tracking-widest">
                <span>RESONANCE DISPERSION SCAN UNDERWAY...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded overflow-hidden border border-white/10">
                <div className="bg-cyber-cyan h-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
              </div>
              <p className="text-[10px] text-white/50">Recalibrating spatial telemetry points on core vectors...</p>
            </div>
          )}

          <div ref={terminalBottomRef} />
        </div>

        {/* Input Interactive Form fields */}
        <form onSubmit={handleTerminalSubmit} className="flex gap-2 items-center relative mt-1">
          <label htmlFor="terminal-tty" className="absolute left-3 text-cyan-400 font-semibold block select-none">
            SARULE~$
          </label>
          <input
            id="terminal-tty"
            type="text"
            className="flex-1 bg-white/5 backdrop-blur-md text-white font-mono text-sm pl-24 pr-4 py-2 rounded-xl border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder-white/20 tracking-wide"
            placeholder='Type command (f.e. "help", "core torusKnot", "color pink") and press ENTER...'
            value={terminalInput}
            onChange={(e) => {
              setTerminalInput(e.target.value);
              if (audioActive && Math.random() < 0.45) {
                // Retro mechanical keyboard tick click sound
                audioEngine.playBlip(700 + Math.random() * 300, 0.02, 'sine');
              }
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <button
            type="submit"
            className={`py-2 px-6 rounded-xl font-mono text-xs font-bold uppercase transition-all tracking-wider active:scale-95 flex items-center gap-1 border border-white/10 bg-white/5 hover:bg-white/10 text-white`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" /> SEND
          </button>
        </form>
        
        {/* Footer legal credits tag */}
        <div className="flex justify-between items-center text-[9px] font-mono text-white/30 border-t border-white/5 pt-2 mt-1">
          <span>SECURE SYSTEM BRIDGE ADRESSED: T-IV UPLINK SHIELD GATEWAY</span>
          <span>© 1996 - 2026 HYPERION SPACE ACADEMY PORTALS. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
