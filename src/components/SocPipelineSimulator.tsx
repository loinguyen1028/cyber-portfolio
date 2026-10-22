import React, { useState, useEffect } from 'react';
import {
  Network,
  Zap
} from 'lucide-react';

// ==========================================
// 4. MINI SOC ARCHITECTURE SIMULATOR
// ==========================================
const SocPipelineSimulator = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [simMode, setSimMode] = useState('normal');

  const stages = [
    {
      id: 0,
      name: 'Network Traffic & K8s Pods',
      tool: 'Ingress / Container Network',
      desc: 'Lưu lượng mạng đi vào hệ thống & cụm Kubernetes container.',
      color: 'text-cyan-400',
      border: 'border-cyan-500/40'
    },
    {
      id: 1,
      name: 'Perimeter Firewall',
      tool: 'pfSense Firewall',
      desc: 'Kiểm soát biên mạng, định tuyến VLAN và lọc gói tin tầng đầu.',
      color: 'text-blue-400',
      border: 'border-blue-500/40'
    },
    {
      id: 2,
      name: 'NIDS & Traffic Profiling',
      tool: 'Suricata + Zeek + Slips',
      desc: 'Phân tích luồng mạng sâu (DPI), trích xuất metadata và phát hiện hành vi bằng ML.',
      color: 'text-purple-400',
      border: 'border-purple-500/40'
    },
    {
      id: 3,
      name: 'SIEM & XDR Correlation',
      tool: 'Wazuh SIEM',
      desc: 'Thu thập log tập trung, đối chiếu rule an ninh và cảnh báo thời gian thực.',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40'
    },
    {
      id: 4,
      name: 'AI Anomaly IPS & Response',
      tool: 'AI-Driven IPS / Playbook',
      desc: 'Mô hình AI phát hiện bất thường zero-day và kích hoạt quy trình ứng phó sự cố.',
      color: 'text-amber-400',
      border: 'border-amber-500/40'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="mt-6 p-4 sm:p-5 rounded-xl bg-black/55 border border-cyan-500/25">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                simMode === 'attack' ? 'bg-red-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                simMode === 'attack' ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300">
            QUY TRÌNH KIẾN TRÚC SOC // {simMode === 'attack' ? 'PHÁT HIỆN TẤN CÔNG (SYN FLOOD / C2)' : 'GIÁM SÁT BÌNH THƯỜNG'}
          </span>
        </div>

        <button
          onClick={() => setSimMode((prev) => (prev === 'normal' ? 'attack' : 'normal'))}
          className={`px-3 py-1 rounded-lg font-mono text-xs border transition-all flex items-center gap-1.5 ${
            simMode === 'attack'
              ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          {simMode === 'attack' ? 'Đang mô phỏng Tấn công' : 'Giả lập Tấn công Mạng'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 relative">
        {stages.map((stage, idx) => {
          const isCurrent = activeStage === idx;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(idx)}
              className={`text-left p-3 rounded-lg border transition-all duration-300 relative ${
                isCurrent
                  ? `${stage.border} bg-white/[0.07] shadow-[0_0_20px_rgba(0,243,255,0.12)] scale-[1.02]`
                  : 'border-white/5 bg-white/[0.02] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-slate-400">GIAI ĐOẠN 0{idx + 1}</span>
                {isCurrent && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      simMode === 'attack' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    HOẠT ĐỘNG
                  </span>
                )}
              </div>
              <div className={`font-semibold text-xs ${stage.color} truncate`}>{stage.tool}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{stage.name}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 p-3 rounded-lg bg-[#05070b] border border-white/10 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-slate-300">
          <span className="text-cyan-400 mr-2">[TELEMETRY_NODE_0{activeStage + 1}]:</span>
          {stages[activeStage].desc}
        </div>
        <div className="text-[11px] shrink-0">
          {simMode === 'attack' ? (
            <span className="text-red-400 font-semibold animate-pulse">
              ⚡ HÀNH ĐỘNG AI IPS: DROP PACKET & CÔ LẬP POD
            </span>
          ) : (
            <span className="text-emerald-400">✓ TRẠNG THÁI: HỆ THỐNG AN TOÀN</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocPipelineSimulator;
