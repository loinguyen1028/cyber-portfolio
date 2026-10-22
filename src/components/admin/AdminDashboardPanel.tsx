import React, { useState, useRef } from 'react';
import {
  Shield,
  Cpu,
  Eye,
  Sparkles,
  GraduationCap,
  Zap,
  Camera,
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Columns,
  Maximize2,
  Unlock,
  KeyRound,
  Sliders,
  FolderGit2,
  UserCheck,
  ArrowUp,
  ArrowDown,
  X,
  GitCommit,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  GitPullRequest
} from 'lucide-react';
import { STORAGE_KEY } from '../../constants';

// ==========================================
// 5. ADMIN CMS PANEL COMPONENT
// ==========================================
const AdminDashboardPanel = ({
  data,
  setData,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  onResetDefault,
  onShowToast,
  onTriggerPhotoUpload,
  isAuthenticated,
  setIsAuthenticated
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const jsonInputRef = useRef(null);

  // Trạng thái lưu vào Codebase & Git commit
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Trạng thái Git Pull (Lấy bản mới nhất)
  const [pullStatus, setPullStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Xử lý Git Pull:
  // - Local: Gọi API /api/git-pull (chạy git pull origin main)
  // - Production (Vercel): Tải raw file từ GitHub repo và lưu vào localStorage
  const handleGitPull = async () => {
    if (pullStatus === 'loading') return;
    setPullStatus('loading');

    try {
      if (import.meta.env.DEV) {
        // TRƯỜNG HỢP A: Ở Local Dev -> Gọi API /api/git-pull chạy lệnh git pull
        let response;
        try {
          response = await fetch('/api/git-pull', { method: 'POST' });
        } catch {
          response = await fetch('http://localhost:3001/api/git-pull', { method: 'POST' });
        }

        if (!response.ok) {
          const errJson = await response.json().catch(() => null);
          throw new Error(errJson?.message || `Lỗi máy chủ HTTP ${response.status}`);
        }

        setPullStatus('success');
        onShowToast('✓ Đã kéo code mới nhất từ Git! Đang làm mới trang...');
        // Xóa cache localStorage để app tải version mới nhất từ file code vừa pull
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        // TRƯỜNG HỢP B: Ở Production (Vercel) -> Tải trực tiếp file từ GitHub Raw
        const GITHUB_RAW_URL =
          'https://raw.githubusercontent.com/loinguyen1028/cyber-portfolio/main/src/data/defaultPortfolioData.ts';

        onShowToast('Đang kết nối tới GitHub để tải dữ liệu mới nhất...');
        const response = await fetch(GITHUB_RAW_URL, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(
            `Không thể tải từ GitHub (HTTP ${response.status}). Vui lòng kiểm tra kết nối mạng hoặc trạng thái repository.`
          );
        }

        const rawTs = await response.text();
        const startIdx = rawTs.indexOf('{');
        const endIdx = rawTs.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
          throw new Error('Cấu trúc file trên GitHub không chứa dữ liệu JSON hợp lệ!');
        }

        const jsonStr = rawTs.substring(startIdx, endIdx + 1);
        const parsedData = JSON.parse(jsonStr);

        if (!parsedData || !parsedData.hero || !parsedData.projects) {
          throw new Error('Dữ liệu Portfolio trên GitHub không đúng cấu trúc quy định!');
        }

        // Lưu vào localStorage và cập nhật state
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
        } catch (e) {}
        setData(parsedData);
        setPullStatus('success');
        onShowToast('✓ Đã đồng bộ bản mới nhất từ GitHub thành công! Đang làm mới...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      console.error('[Git Pull Error]', err);
      setPullStatus('error');
      const msg = err?.message || 'Không thể thực hiện Git Pull';
      onShowToast(`Lỗi Git Pull: ${msg}`);
      setTimeout(() => setPullStatus('idle'), 4500);
    }
  };

  // Lưu trực tiếp vào file src/data/defaultPortfolioData.ts & tự động Git Commit (Chỉ áp dụng ở Local Dev)
  const handleSaveToCodebase = async () => {
    // Không thực hiện trên Production (Vercel) vì không có Node.js server
    if (import.meta.env.PROD) {
      onShowToast('Tính năng Lưu vào Code & Git chỉ khả dụng ở môi trường Local Development!');
      return;
    }

    if (saveStatus === 'loading') return;
    setSaveStatus('loading');
    setSaveMessage('Đang lưu vào defaultPortfolioData.ts và commit Git...');

    try {
      let response;
      try {
        // Ưu tiên 1: Gọi qua Vite dev server middleware (/api/save-portfolio)
        response = await fetch('/api/save-portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch {
        // Ưu tiên 2: Fallback qua backend Node.js độc lập ở port 3001
        response = await fetch('http://localhost:3001/api/save-portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const errorText = result?.message || `Lỗi máy chủ HTTP ${response.status}`;
        throw new Error(errorText);
      }

      // Cập nhật version mới vào state để kích hoạt lưu vào localStorage & đồng bộ sang các tab khác
      if (result.version) {
        setData((prev) => ({ ...prev, version: result.version }));
      }

      setSaveStatus('success');
      setSaveMessage(result.message || 'Đã lưu và commit Git thành công!');
      onShowToast('✓ Đã lưu trực tiếp vào Codebase & Git commit thành công!');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 4000);
    } catch (err: any) {
      console.error('[Save to Codebase Error]', err);
      setSaveStatus('error');
      const errorMsg = err?.message || 'Không thể kết nối đến Backend/Vite API (Port 5173 / 3001)';
      setSaveMessage(errorMsg);
      onShowToast(`Lỗi lưu codebase: ${errorMsg}`);
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 6000);
    }
  };

  // New skill input state per category
  const [newSkillMap, setNewSkillMap] = useState({});

  const handlePinLogin = (e) => {
    e.preventDefault();
    if (pinInput === '1010' || pinInput.toLowerCase() === 'admin' || pinInput === '1028') {
      setIsAuthenticated(true);
      setPinError('');
      onShowToast('Đã mở khóa hệ thống Quản trị Admin CMS!');
    } else {
      setPinError('Mã PIN chưa đúng (Gợi ý: 1010 hoặc nhấn Đăng nhập nhanh)');
    }
  };

  // Export JSON configuration
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'nguyen_phuoc_loi_portfolio_cms.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Đã xuất file cấu hình JSON thành công!');
  };

  // Import JSON configuration
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.hero && parsed.projects) {
          setData(parsed);
          onShowToast('Đã nạp cấu hình JSON vào trang web!');
        } else {
          onShowToast('File JSON không đúng định dạng Portfolio!');
        }
      } catch (err) {
        onShowToast('Lỗi đọc file JSON!');
      }
    };
    reader.readAsText(file);
  };

  // Helper updaters
  const updateHero = (field, value) => {
    setData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateAbout = (field, value) => {
    setData((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  const updateEducation = (field, value) => {
    setData((prev) => ({
      ...prev,
      education: { ...prev.education, [field]: value }
    }));
  };

  const updateContact = (field, value) => {
    setData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const updatePhysics = (field, value) => {
    setData((prev) => ({
      ...prev,
      physics: { ...prev.physics, [field]: value }
    }));
  };

  // Authentication Gate
  if (!isAuthenticated) {
    return (
      <div className="h-full min-h-[540px] flex items-center justify-center p-6 bg-[#070a12]/95 border border-cyan-500/30 rounded-2xl backdrop-blur-2xl">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#0b101d] border border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.15)] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,243,255,0.3)]">
            <KeyRound className="w-8 h-8" />
          </div>

          <div>
            <span className="font-mono text-[11px] text-cyan-400 uppercase tracking-widest">
              SOC ADMIN CONSOLE // AUTHENTICATION
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">Trang Quản Trị Portfolio</h3>
            <p className="text-xs text-slate-400 mt-1">
              Nhập mã PIN quản trị (<code className="text-cyan-300">1010</code> hoặc <code className="text-cyan-300">admin</code>) hoặc mở nhanh chế độ Demo để chỉnh sửa toàn bộ nội dung web.
            </p>
          </div>

          <form onSubmit={handlePinLogin} className="space-y-3">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Nhập PIN (1010)..."
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-center font-mono text-sm text-white focus:outline-none"
            />
            {pinError && <p className="text-xs text-red-400 font-mono">{pinError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 transition-all flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                Mở Khóa Bằng PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(true);
                  onShowToast('Đã vào thẳng Chế độ Quản trị (Instant Admin Access)!');
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.35)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                Đăng Nhập Nhanh (1-Click)
              </button>
            </div>
          </form>

          <button
            onClick={() => setViewMode('portfolio')}
            className="text-xs font-mono text-slate-400 hover:text-white underline"
          >
            ← Quay lại xem trang Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080c16]/95 border border-cyan-500/35 rounded-2xl shadow-[0_0_45px_rgba(0,243,255,0.12)] backdrop-blur-2xl overflow-hidden flex flex-col">
      {/* Hidden JSON File Input */}
      <input ref={jsonInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />

      {/* Admin Top Header Bar */}
      <div className="p-4 sm:px-6 bg-gradient-to-r from-cyan-950/60 via-[#0b1222] to-purple-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                ADMIN CMS // QUẢN TRỊ NỘI DUNG
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 font-mono text-[10px] text-emerald-300">
                AUTO-SAVED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mọi thay đổi được cập nhật trực tiếp lên trang web theo thời gian thực & lưu tự động vào trình duyệt.
            </p>
            {import.meta.env.DEV && saveMessage && (
              <div
                className={`mt-1 text-[11px] font-mono flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${
                  saveStatus === 'error'
                    ? 'text-red-300 bg-red-950/40 border-red-500/40'
                    : saveStatus === 'success'
                    ? 'text-emerald-300 bg-emerald-950/40 border-emerald-500/40'
                    : 'text-amber-300 bg-amber-950/40 border-amber-500/40'
                }`}
              >
                <span>▶ {saveMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Lưu trực tiếp vào defaultPortfolioData.ts & Git commit (Chỉ hiển thị ở Local Dev) */}
          {import.meta.env.DEV && (
            <button
              onClick={handleSaveToCodebase}
              disabled={saveStatus === 'loading'}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                saveStatus === 'loading'
                  ? 'bg-amber-500/20 border border-amber-400/60 text-amber-300 animate-pulse cursor-wait'
                  : saveStatus === 'success'
                  ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : saveStatus === 'error'
                  ? 'bg-red-500/25 border border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                  : 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/35 hover:to-cyan-500/35 border border-emerald-400/50 hover:border-emerald-300 text-emerald-200 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              }`}
              title="Lưu dữ liệu hiện tại vào file src/data/defaultPortfolioData.ts và tự động tạo Git commit (Chỉ hoạt động ở môi trường Local)"
            >
              {saveStatus === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
              {saveStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {saveStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
              {saveStatus === 'idle' && <GitCommit className="w-3.5 h-3.5 text-emerald-400" />}
              <span>
                {saveStatus === 'loading'
                  ? 'Đang commit...'
                  : saveStatus === 'success'
                  ? 'Đã Commit!'
                  : saveStatus === 'error'
                  ? 'Lỗi Commit'
                  : 'Lưu vào Code & Git'}
              </span>
            </button>
          )}

          <div className="inline-flex rounded-xl bg-black/50 p-1 border border-white/10">
            <button
              onClick={() => setViewMode('portfolio')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'portfolio'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chỉ xem trang Portfolio"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Web</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chia đôi màn hình vừa sửa vừa xem"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'admin'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toàn màn hình Quản trị"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full CMS</span>
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-slate-200 hover:text-cyan-200 flex items-center gap-1.5 transition-all"
            title="Tải cấu hình JSON về máy"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Xuất JSON</span>
          </button>

          <button
            onClick={() => jsonInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-xs font-mono text-slate-200 hover:text-purple-200 flex items-center gap-1.5 transition-all"
            title="Nhập cấu hình từ file JSON"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Nhập JSON</span>
          </button>

          <button
            onClick={onResetDefault}
            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-1.5 transition-all"
            title="Khôi phục toàn bộ thông tin về CV gốc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset CV Gốc</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Khôi phục mặc định từ mã nguồn (Force Sync)?\n\nToàn bộ dữ liệu tạm trong localStorage sẽ bị xóa và trang web sẽ tải lại từ file code mới nhất.'
                )
              ) {
                try {
                  localStorage.removeItem(STORAGE_KEY);
                } catch (e) {}
                window.location.reload();
              }
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-1.5 transition-all"
            title="Xóa cache trình duyệt và tải lại trang từ dữ liệu code mới nhất"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Force Sync (Gốc)</span>
          </button>

          {/* Nút Git Pull (Đồng bộ) */}
          <button
            onClick={handleGitPull}
            disabled={pullStatus === 'loading'}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              pullStatus === 'loading'
                ? 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 animate-pulse cursor-wait'
                : pullStatus === 'success'
                ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                : pullStatus === 'error'
                ? 'bg-red-500/25 border border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                : 'bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400/50'
            }`}
            title={
              import.meta.env.DEV
                ? 'Chạy lệnh git pull origin main để cập nhật mã nguồn mới nhất'
                : 'Tải bản dữ liệu mới nhất từ GitHub repo và áp dụng vào trang web'
            }
          >
            {pullStatus === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : pullStatus === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : pullStatus === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden md:inline">
              {pullStatus === 'loading'
                ? 'Đang kéo...'
                : pullStatus === 'success'
                ? 'Đã kéo Git!'
                : pullStatus === 'error'
                ? 'Lỗi Pull'
                : 'Git Pull (Đồng bộ)'}
            </span>
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="px-4 sm:px-6 pt-3 bg-[#060911] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'hero', label: '1. Hero & Ảnh Nền', icon: UserCheck },
          { id: 'about', label: '2. Mục tiêu & Học vấn', icon: GraduationCap },
          { id: 'skills', label: '3. Kỹ năng (Skills)', icon: Cpu },
          { id: 'projects', label: '4. Dự án (Projects)', icon: FolderGit2 },
          { id: 'contact', label: '5. Liên hệ & Zero-G', icon: Sliders }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-semibold flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
                active
                  ? 'bg-[#0c1220] text-cyan-300 border-cyan-400/40 shadow-[0_-4px_15px_rgba(0,243,255,0.12)]'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CMS Tab Content Area */}
      <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {/* ==========================================
            TAB 1: HERO & AVATAR / BACKGROUND
        ========================================== */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-cyan-300 mb-1.5">Họ & Tên Đệm (Dòng 1)</label>
                <input
                  type="text"
                  value={data.hero.firstName}
                  onChange={(e) => updateHero('firstName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyan-300 mb-1.5">Tên Chính Nổi Bật (Dòng 2 Neon)</label>
                <input
                  type="text"
                  value={data.hero.lastName}
                  onChange={(e) => updateHero('lastName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1.5">Chức danh chính (Role Badge)</label>
                <input
                  type="text"
                  value={data.hero.roleBadge}
                  onChange={(e) => updateHero('roleBadge', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1.5">Mô tả chức danh phụ</label>
                <input
                  type="text"
                  value={data.hero.roleSubtitle}
                  onChange={(e) => updateHero('roleSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1.5">Top Status Badge</label>
                <input
                  type="text"
                  value={data.hero.badge}
                  onChange={(e) => updateHero('badge', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1.5">Mã định danh HUD Avatar</label>
                <input
                  type="text"
                  value={data.hero.hudId}
                  onChange={(e) => updateHero('hudId', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-cyan-300 mb-1.5">Đoạn giới thiệu ngắn (Hero Bio)</label>
              <textarea
                rows={3}
                value={data.hero.bio}
                onChange={(e) => updateHero('bio', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-sm text-white"
              />
            </div>

            {/* Avatar & Background Image Controls */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/25 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Ảnh Đại Diện & Ảnh Nền Không Gian (abchdh.jpg)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Bạn có thể dán link URL ảnh, giữ mặc định <code className="text-cyan-300">abchdh.jpg</code> hoặc tải ảnh mới trực tiếp từ máy tính.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onTriggerPhotoUpload}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono text-cyan-200 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải Ảnh Từ Máy
                  </button>
                  <button
                    type="button"
                    onClick={() => updateHero('avatarImage', 'abchdh.jpg')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300"
                  >
                    Dùng abchdh.jpg
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="block font-mono text-[11px] text-slate-400 mb-1">Đường dẫn URL / Base64 Ảnh</label>
                  <input
                    type="text"
                    value={data.hero.avatarImage}
                    onChange={(e) => updateHero('avatarImage', e.target.value)}
                    placeholder="abchdh.jpg hoặc https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-cyan-400/50 overflow-hidden bg-black shrink-0">
                    <img
                      src={data.hero.avatarImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Đang áp dụng cho cả <span className="text-cyan-300">Background</span> & <span className="text-emerald-300">Avatar HUD</span>.
                  </div>
                </div>
              </div>

              {/* Sliders for Background Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Độ rõ ảnh nền (Opacity)</span>
                    <span className="text-cyan-300">{Math.round((data.hero.bgOpacity ?? 0.85) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={data.hero.bgOpacity ?? 0.85}
                    onChange={(e) => updateHero('bgOpacity', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Độ sáng nền (Brightness)</span>
                    <span className="text-cyan-300">{Math.round((data.hero.bgBrightness ?? 0.28) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.75"
                    step="0.02"
                    value={data.hero.bgBrightness ?? 0.28}
                    onChange={(e) => updateHero('bgBrightness', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Độ mờ nền (Blur)</span>
                    <span className="text-cyan-300">{data.hero.bgBlur ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={data.hero.bgBlur ?? 0}
                    onChange={(e) => updateHero('bgBlur', parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Orbiting Badges Editor */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300">
                4 Nhãn Kỹ Năng Bay Quanh Avatar (Zero-G Orbit Badges)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.hero.orbitBadges.map((b, idx) => (
                  <div key={idx}>
                    <label className="block font-mono text-[10px] text-slate-400 mb-1">Nhãn vệ tinh #{idx + 1}</label>
                    <input
                      type="text"
                      value={b.label}
                      onChange={(e) => {
                        const updated = [...data.hero.orbitBadges];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        updateHero('orbitBadges', updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: ABOUT, EDUCATION & ACTIVITIES
        ========================================== */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Career Objective Section */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase">
                A. Mục Tiêu Nghề Nghiệp (About / Objective)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Tiêu đề khối Mục tiêu</label>
                  <input
                    type="text"
                    value={data.about.heading}
                    onChange={(e) => updateAbout('heading', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Phụ đề chuyên môn</label>
                  <input
                    type="text"
                    value={data.about.subheading}
                    onChange={(e) => updateAbout('subheading', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1">Đoạn văn 1 (Định hướng & Khóa luận SOC)</label>
                <textarea
                  rows={3}
                  value={data.about.paragraph1}
                  onChange={(e) => updateAbout('paragraph1', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1">Đoạn văn 2 (Mong muốn Thực tập / Fresher)</label>
                <textarea
                  rows={2}
                  value={data.about.paragraph2}
                  onChange={(e) => updateAbout('paragraph2', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                />
              </div>
            </div>

            {/* Education Info */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-emerald-300 font-mono uppercase">
                B. Thông Tin Học Vấn & Ngoại Ngữ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Nhãn tiêu đề (Badge)</label>
                  <input
                    type="text"
                    value={data.education.universityBadge || 'TRÌNH ĐỘ HỌC VẤN'}
                    onChange={(e) => updateEducation('universityBadge', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Trường Đại học</label>
                  <input
                    type="text"
                    value={data.education.universityName}
                    onChange={(e) => updateEducation('universityName', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Chuyên ngành</label>
                  <input
                    type="text"
                    value={data.education.major}
                    onChange={(e) => updateEducation('major', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Dự kiến tốt nghiệp</label>
                  <input
                    type="text"
                    value={data.education.graduationDate}
                    onChange={(e) => updateEducation('graduationDate', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Trình độ Ngoại ngữ (TOEIC)</label>
                  <input
                    type="text"
                    value={data.education.language}
                    onChange={(e) => updateEducation('language', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* Self-Study Activities CRUD */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-purple-300 font-mono uppercase">
                  C. Hoạt Động Tự Học & Thực Hành Lab
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const newAct = {
                      id: 'act-' + Date.now(),
                      title: 'Hoạt động thực hành mới',
                      badge: 'CYBER LAB',
                      accent: 'cyan',
                      description: 'Mô tả chi tiết hoạt động tự học hoặc chứng chỉ...'
                    };
                    updateEducation('activities', [...data.education.activities, newAct]);
                    onShowToast('Đã thêm hoạt động tự học mới!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-xs font-mono text-purple-200 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm Hoạt Động
                </button>
              </div>

              <div className="space-y-3">
                {data.education.activities.map((act, idx) => (
                  <div key={act.id || idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <input
                        type="text"
                        value={act.title}
                        onChange={(e) => {
                          const list = [...data.education.activities];
                          list[idx] = { ...list[idx], title: e.target.value };
                          updateEducation('activities', list);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white"
                      />
                      <input
                        type="text"
                        value={act.badge}
                        onChange={(e) => {
                          const list = [...data.education.activities];
                          list[idx] = { ...list[idx], badge: e.target.value };
                          updateEducation('activities', list);
                        }}
                        className="w-36 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = data.education.activities.filter((_, i) => i !== idx);
                          updateEducation('activities', list);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                        title="Xóa hoạt động này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={act.description}
                      onChange={(e) => {
                        const list = [...data.education.activities];
                        list[idx] = { ...list[idx], description: e.target.value };
                        updateEducation('activities', list);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: SKILLS CRUD
        ========================================== */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-300">
                Chỉnh sửa các nhóm kỹ năng hoặc thêm/xóa từng kỹ năng bên trong mỗi nhóm.
              </p>
              <button
                type="button"
                onClick={() => {
                  const newCat = {
                    id: 'cat-' + Date.now(),
                    title: 'Nhóm Kỹ Năng Mới',
                    subtitle: 'CUSTOM SKILL GROUP',
                    iconName: 'Shield',
                    theme: 'cyan',
                    description: 'Mô tả nhóm kỹ năng chuyên môn...',
                    skills: [{ name: 'Kỹ năng mới', level: 'Thực hành' }]
                  };
                  setData((prev) => ({
                    ...prev,
                    skillCategories: [...prev.skillCategories, newCat]
                  }));
                  onShowToast('Đã thêm nhóm kỹ năng mới!');
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-mono text-cyan-200 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Nhóm Kỹ Năng
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {data.skillCategories.map((cat, catIdx) => (
                <div
                  key={cat.id || catIdx}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-cyan-400">NHÓM 0{catIdx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={cat.theme || 'cyan'}
                          onChange={(e) => {
                            const updated = [...data.skillCategories];
                            updated[catIdx] = { ...updated[catIdx], theme: e.target.value };
                            setData((prev) => ({ ...prev, skillCategories: updated }));
                          }}
                          className="px-2 py-1 rounded bg-black/70 border border-white/15 text-[11px] font-mono text-slate-200"
                        >
                          <option value="cyan">Màu Cyan</option>
                          <option value="emerald">Màu Emerald</option>
                          <option value="purple">Màu Purple</option>
                          <option value="sky">Màu Sky</option>
                        </select>
                        {data.skillCategories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = data.skillCategories.filter((_, i) => i !== catIdx);
                              setData((prev) => ({ ...prev, skillCategories: updated }));
                            }}
                            className="p-1.5 rounded bg-red-500/15 text-red-300 hover:bg-red-500/30"
                            title="Xóa nhóm kỹ năng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => {
                        const updated = [...data.skillCategories];
                        updated[catIdx] = { ...updated[catIdx], title: e.target.value };
                        setData((prev) => ({ ...prev, skillCategories: updated }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-sm font-bold text-white"
                      placeholder="Tên nhóm kỹ năng"
                    />

                    <textarea
                      rows={2}
                      value={cat.description}
                      onChange={(e) => {
                        const updated = [...data.skillCategories];
                        updated[catIdx] = { ...updated[catIdx], description: e.target.value };
                        setData((prev) => ({ ...prev, skillCategories: updated }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-slate-300"
                      placeholder="Mô tả nhóm..."
                    />

                    {/* Individual Skills List */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      {cat.skills.map((sk, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={sk.name}
                            onChange={(e) => {
                              const updated = [...data.skillCategories];
                              const skillsCopy = [...updated[catIdx].skills];
                              skillsCopy[sIdx] = { ...skillsCopy[sIdx], name: e.target.value };
                              updated[catIdx] = { ...updated[catIdx], skills: skillsCopy };
                              setData((prev) => ({ ...prev, skillCategories: updated }));
                            }}
                            className="w-1/2 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                            placeholder="Tên kỹ năng"
                          />
                          <input
                            type="text"
                            value={sk.level}
                            onChange={(e) => {
                              const updated = [...data.skillCategories];
                              const skillsCopy = [...updated[catIdx].skills];
                              skillsCopy[sIdx] = { ...skillsCopy[sIdx], level: e.target.value };
                              updated[catIdx] = { ...updated[catIdx], skills: skillsCopy };
                              setData((prev) => ({ ...prev, skillCategories: updated }));
                            }}
                            className="w-1/2 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] font-mono text-cyan-300"
                            placeholder="Mức độ / Vai trò"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...data.skillCategories];
                              updated[catIdx] = {
                                ...updated[catIdx],
                                skills: updated[catIdx].skills.filter((_, i) => i !== sIdx)
                              };
                              setData((prev) => ({ ...prev, skillCategories: updated }));
                            }}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/25 text-red-300 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Add Skill Row */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkillMap[catIdx]?.name || ''}
                      onChange={(e) =>
                        setNewSkillMap((prev) => ({
                          ...prev,
                          [catIdx]: { ...(prev[catIdx] || {}), name: e.target.value }
                        }))
                      }
                      placeholder="+ Tên kỹ năng mới..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/70 border border-cyan-500/30 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={newSkillMap[catIdx]?.level || ''}
                      onChange={(e) =>
                        setNewSkillMap((prev) => ({
                          ...prev,
                          [catIdx]: { ...(prev[catIdx] || {}), level: e.target.value }
                        }))
                      }
                      placeholder="Ghi chú..."
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-black/70 border border-cyan-500/30 text-xs text-cyan-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const item = newSkillMap[catIdx];
                        if (!item || !item.name?.trim()) return;
                        const updated = [...data.skillCategories];
                        updated[catIdx] = {
                          ...updated[catIdx],
                          skills: [
                            ...updated[catIdx].skills,
                            { name: item.name.trim(), level: item.level?.trim() || 'Thực hành' }
                          ]
                        };
                        setData((prev) => ({ ...prev, skillCategories: updated }));
                        setNewSkillMap((prev) => ({ ...prev, [catIdx]: { name: '', level: '' } }));
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 text-xs font-mono shrink-0"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: PROJECTS CRUD
        ========================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-300">
                Quản lý danh sách Dự án Khóa luận & Dự án môn học. Dự án được đánh dấu <strong>Featured (Khóa luận SOC)</strong> sẽ hiển thị kèm bảng mô phỏng SOC Pipeline.
              </p>
              <button
                type="button"
                onClick={() => {
                  const newProj = {
                    id: 'proj-' + Date.now(),
                    badge: 'DỰ ÁN MỚI // CYBERSECURITY',
                    title: 'Tên dự án mới của bạn',
                    period: '2026',
                    featured: false,
                    iconName: 'Shield',
                    accentColor: 'cyan',
                    tech: ['Python', 'Security', 'Linux'],
                    summary: 'Mô tả tóm tắt mục tiêu và kết quả đạt được của dự án.',
                    highlights: [
                      'Điểm nổi bật thứ nhất của dự án.',
                      'Điểm nổi bật thứ hai của dự án.'
                    ]
                  };
                  setData((prev) => ({
                    ...prev,
                    projects: [...prev.projects, newProj]
                  }));
                  onShowToast('Đã thêm Dự án mới!');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,243,255,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Thêm Dự Án Mới
              </button>
            </div>

            <div className="space-y-4">
              {data.projects.map((proj, pIdx) => (
                <div
                  key={proj.id || pIdx}
                  className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    proj.featured
                      ? 'bg-cyan-950/20 border-cyan-400/40'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-white/10 font-mono text-xs text-cyan-300 font-bold">
                        #{pIdx + 1}
                      </span>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-400/30">
                        <input
                          type="checkbox"
                          checked={!!proj.featured}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[pIdx] = { ...updated[pIdx], featured: e.target.checked };
                            setData((prev) => ({ ...prev, projects: updated }));
                          }}
                          className="accent-emerald-400"
                        />
                        <span>Featured (Hiển thị Full-Width + SOC Simulator)</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={pIdx === 0}
                        onClick={() => {
                          const updated = [...data.projects];
                          const temp = updated[pIdx - 1];
                          updated[pIdx - 1] = updated[pIdx];
                          updated[pIdx] = temp;
                          setData((prev) => ({ ...prev, projects: updated }));
                        }}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300"
                        title="Đưa lên trên"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={pIdx === data.projects.length - 1}
                        onClick={() => {
                          const updated = [...data.projects];
                          const temp = updated[pIdx + 1];
                          updated[pIdx + 1] = updated[pIdx];
                          updated[pIdx] = temp;
                          setData((prev) => ({ ...prev, projects: updated }));
                        }}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300"
                        title="Đưa xuống dưới"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.projects.filter((_, i) => i !== pIdx);
                          setData((prev) => ({ ...prev, projects: updated }));
                          onShowToast('Đã xóa dự án!');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-mono flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block font-mono text-[11px] text-slate-400 mb-1">Tên dự án</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[pIdx] = { ...updated[pIdx], title: e.target.value };
                          setData((prev) => ({ ...prev, projects: updated }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-sm font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-slate-400 mb-1">Thời gian / Năm</label>
                      <input
                        type="text"
                        value={proj.period}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[pIdx] = { ...updated[pIdx], period: e.target.value };
                          setData((prev) => ({ ...prev, projects: updated }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-emerald-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] text-slate-400 mb-1">Nhãn phân loại (Badge)</label>
                      <input
                        type="text"
                        value={proj.badge}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[pIdx] = { ...updated[pIdx], badge: e.target.value };
                          setData((prev) => ({ ...prev, projects: updated }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-cyan-300"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-slate-400 mb-1">
                        Công nghệ sử dụng (Cách nhau bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={proj.tech.join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean);
                          const updated = [...data.projects];
                          updated[pIdx] = { ...updated[pIdx], tech: tags };
                          setData((prev) => ({ ...prev, projects: updated }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-purple-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">Mô tả tổng quan dự án</label>
                    <textarea
                      rows={2}
                      value={proj.summary}
                      onChange={(e) => {
                        const updated = [...data.projects];
                        updated[pIdx] = { ...updated[pIdx], summary: e.target.value };
                        setData((prev) => ({ ...prev, projects: updated }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-slate-400 mb-1">
                      Các ý chính / Kết quả đạt được (Mỗi dòng 1 ý)
                    </label>
                    <textarea
                      rows={3}
                      value={proj.highlights.join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        const updated = [...data.projects];
                        updated[pIdx] = { ...updated[pIdx], highlights: lines };
                        setData((prev) => ({ ...prev, projects: updated }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: CONTACT & ZERO-G BOOSTED SETTINGS
        ========================================== */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase">
                A. Thông Tin Liên Hệ (Footer & Contact Cards)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={data.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Số điện thoại (Hiển thị)</label>
                  <input
                    type="text"
                    value={data.contact.phoneDisplay}
                    onChange={(e) => {
                      updateContact('phoneDisplay', e.target.value);
                      updateContact('phone', e.target.value.replace(/\s+/g, ''));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">GitHub hiển thị</label>
                  <input
                    type="text"
                    value={data.contact.github}
                    onChange={(e) => updateContact('github', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Link GitHub đầy đủ (URL)</label>
                  <input
                    type="url"
                    value={data.contact.githubUrl}
                    onChange={(e) => updateContact('githubUrl', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Địa chỉ hiện tại</label>
                  <input
                    type="text"
                    value={data.contact.location}
                    onChange={(e) => updateContact('location', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-300 mb-1">Hình thức làm việc</label>
                  <input
                    type="text"
                    value={data.contact.workMode}
                    onChange={(e) => updateContact('workMode', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* ZERO-G: BOOSTED Physics Fine-Tuning */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-400/35 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-purple-200 font-mono uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    B. Tinh Chỉnh Hệ Thống Vật Lý ZERO-G: BOOSTED & Hạt Follow Chuột
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chế độ <strong className="text-purple-300">ZERO-G: BOOSTED</strong> luôn được khóa cố định. Các hạt ở nền sẽ tự động hút và bay xoay quanh con trỏ chuột của bạn.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl font-mono text-xs bg-purple-500/25 border border-purple-400 text-purple-200">
                  CURSOR SWARM: ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Lực hút theo chuột</span>
                    <span className="text-cyan-300">{data.physics.attractionForce ?? 0.48}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.2"
                    step="0.05"
                    value={data.physics.attractionForce ?? 0.48}
                    onChange={(e) => updatePhysics('attractionForce', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Bán kính hút chuột</span>
                    <span className="text-cyan-300">{data.physics.attractionRadius ?? 340}px</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="600"
                    step="20"
                    value={data.physics.attractionRadius ?? 340}
                    onChange={(e) => updatePhysics('attractionRadius', parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Tốc độ hạt Zero-G</span>
                    <span className="text-cyan-300">{data.physics.particleSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="3.0"
                    step="0.15"
                    value={data.physics.particleSpeed}
                    onChange={(e) => updatePhysics('particleSpeed', parseFloat(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Mật độ Node SOC</span>
                    <span className="text-cyan-300">{data.physics.particleDensity} hạt</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="160"
                    step="5"
                    value={data.physics.particleDensity}
                    onChange={(e) => updatePhysics('particleDensity', parseInt(e.target.value, 10))}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Độ nghiêng Card 3D</span>
                    <span className="text-cyan-300">{data.physics.tiltIntensity}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={data.physics.tiltIntensity}
                    onChange={(e) => updatePhysics('tiltIntensity', parseInt(e.target.value, 10))}
                    className="w-full accent-purple-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPanel;
