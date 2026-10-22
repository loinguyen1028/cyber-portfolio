import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Terminal,
  Network,
  Lock,
  Activity,
  Mail,
  Phone,
  MapPin,
  Github,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  Award,
  Radio,
  ChevronRight,
  Send,
  Camera,
  Settings,
  Edit3,
  CheckCircle2,
  X,
  LogOut,
  Unlock
} from 'lucide-react';
import { DEFAULT_PORTFOLIO_DATA } from './data/defaultPortfolioData';
import { STORAGE_KEY, ICON_MAP, THEME_CONFIG } from './constants';
import AntigravityCanvas from './components/AntigravityCanvas';
import TiltCard from './components/TiltCard';
import ScrollReveal from './components/ScrollReveal';
import SocPipelineSimulator from './components/SocPipelineSimulator';
import AdminDashboardPanel from './components/admin/AdminDashboardPanel';

// ==========================================
// 6. MAIN APPLICATION (PORTFOLIO + ADMIN CMS)
// ==========================================
export default function App() {
  // Load persisted state from localStorage or fallback to DEFAULT_PORTFOLIO_DATA
  const [portfolioData, setPortfolioData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.education && (parsed.education.universityBadge === 'ĐẠI HỌC CHÍNH QUY' || !parsed.education.universityBadge)) {
          parsed.education.universityBadge = 'TRÌNH ĐỘ HỌC VẤN';
        }
        return { ...DEFAULT_PORTFOLIO_DATA, ...parsed };
      }
    } catch (e) {
      // Ignore storage errors
    }
    return DEFAULT_PORTFOLIO_DATA;
  });

  // Save to localStorage whenever portfolioData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
    } catch (e) {
      // Ignore quota errors
    }
  }, [portfolioData]);

  // View modes: 'portfolio' | 'split' | 'admin'
  const [viewMode, setViewMode] = useState('portfolio');
  const [adminTab, setAdminTab] = useState('hero');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [inlineEditMode, setInlineEditMode] = useState(false);

  const [imgLoadError, setImgLoadError] = useState(false);
  const fileInputRef = useRef(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [activeNav, setActiveNav] = useState('hero');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'sys', text: 'Initializing Antigravity Cyber-Defense Environment [ZERO-G: BOOSTED]...' },
    { type: 'ok', text: 'Loaded Candidate Profile: NGUYỄN PHƯỚC LỢI [HCMUTE - IT/Cybersecurity]' },
    { type: 'info', text: 'Gõ "help", "skills", "soc", "admin" hoặc "contact" vào terminal bên dưới để tương tác.' }
  ]);
  const [quickMessage, setQuickMessage] = useState({ name: '', email: '', message: '' });
  const [messageSent, setMessageSent] = useState(false);

  // ==========================================
  // SECRET ADMIN ACCESS CONFIGURATION & STATE
  // ==========================================
  // Mật khẩu quản trị mặc định (Frontend-only, dễ dàng tùy chỉnh tại đây)
  const ADMIN_PASSWORD = 'admin123';
  const ADMIN_SESSION_KEY = 'npl_cyber_portfolio_admin_auth';

  // Chỉ set isAdmin = true nếu sessionStorage đã lưu phiên đăng nhập trước đó
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  // State điều khiển Modal xác thực mật khẩu
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPasswordInput, setAuthPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Kiểm tra URL (?admin=true hoặc #admin)
  // Nếu đã đăng nhập trong session -> tự động mở quyền
  // Nếu chưa đăng nhập -> mở Modal yêu cầu mật khẩu
  useEffect(() => {
    const checkAdminUrlAccess = () => {
      const params = new URLSearchParams(window.location.search);
      const hasAdminParam = params.get('admin') === 'true' || window.location.hash === '#admin';

      if (hasAdminParam) {
        let isSessionAuth = false;
        try {
          isSessionAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
        } catch (e) {}

        if (isSessionAuth) {
          setIsAdmin(true);
        } else {
          setShowAuthModal(true);
          setAuthError('');
        }
      }
    };

    checkAdminUrlAccess();
    window.addEventListener('hashchange', checkAdminUrlAccess);
    return () => window.removeEventListener('hashchange', checkAdminUrlAccess);
  }, []);

  // Xử lý xác thực mật khẩu Admin
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!authPasswordInput) return;

    if (authPasswordInput === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch (e) {}
      setIsAdmin(true);
      setShowAuthModal(false);
      setAuthPasswordInput('');
      setAuthError('');
      showToast('Xác thực thành công! Đã kích hoạt quyền Quản trị Admin.');
    } else {
      setAuthError('ACCESS DENIED // Mật khẩu không chính xác');
    }
  };

  // Đóng Modal mật khẩu và dọn dẹp URL nếu người dùng hủy
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setAuthPasswordInput('');
    setAuthError('');
    if (window.location.search.includes('admin=true') || window.location.hash === '#admin') {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.hash = '';
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  // Xử lý Đăng xuất Admin
  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {}
    setIsAdmin(false);
    setViewMode('portfolio');
    setInlineEditMode(false);

    // Xóa ?admin=true và #admin khỏi URL
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));

    showToast('Đã đăng xuất khỏi phiên Quản trị!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Convert uploaded file to Base64 Data URL so it persists in localStorage
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPortfolioData((prev) => ({
          ...prev,
          hero: { ...prev.hero, avatarImage: reader.result }
        }));
        setImgLoadError(false);
        showToast('Đã cập nhật Ảnh Nền & Avatar mới thành công!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    setPortfolioData(DEFAULT_PORTFOLIO_DATA);
    localStorage.removeItem(STORAGE_KEY);
    setImgLoadError(false);
    showToast('Đã khôi phục toàn bộ dữ liệu về CV gốc!');
  };

  const openAdminAtSection = (tabId) => {
    setAdminTab(tabId);
    if (viewMode === 'portfolio') {
      setViewMode('split');
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label} vào bộ nhớ tạm!`);
  };

  const scrollToSection = (id) => {
    setActiveNav(id);
    if (viewMode === 'admin') {
      setViewMode('portfolio');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...terminalLogs, { type: 'user', text: `loi@soc-lab:~$ ${terminalInput}` }];

    if (cmd === 'help') {
      newLogs.push({
        type: 'info',
        text: 'Các lệnh hỗ trợ: skills (Xem kỹ năng), soc (Dự án khóa luận SOC), education (Học vấn), contact (Liên hệ), admin (Mở trang Quản trị CMS), clear (Xóa màn hình).'
      });
    } else if (cmd === 'skills') {
      const allSkills = portfolioData.skillCategories
        .map((c) => `[${c.title.toUpperCase()}]: ${c.skills.map((s) => s.name).join(', ')}`)
        .join(' | ');
      newLogs.push({ type: 'ok', text: allSkills });
    } else if (cmd === 'soc') {
      const featured = portfolioData.projects.find((p) => p.featured) || portfolioData.projects[0];
      newLogs.push({
        type: 'ok',
        text: featured ? `[THESIS]: ${featured.title} — ${featured.summary}` : 'Chưa có dự án SOC.'
      });
    } else if (cmd === 'education') {
      newLogs.push({
        type: 'ok',
        text: `[${portfolioData.education.universityName}]: ${portfolioData.education.major} (${portfolioData.education.graduationDate}) | ${portfolioData.education.language}`
      });
    } else if (cmd === 'contact') {
      newLogs.push({
        type: 'ok',
        text: `Email: ${portfolioData.contact.email} | Phone: ${portfolioData.contact.phoneDisplay} | GitHub: ${portfolioData.contact.github} | Location: ${portfolioData.contact.location}`
      });
    } else if (cmd === 'admin') {
      if (isAdmin) {
        setViewMode('split');
        newLogs.push({
          type: 'ok',
          text: 'Đã kích hoạt giao diện Quản trị Admin CMS (Split Mode)!'
        });
      } else {
        setShowAuthModal(true);
        newLogs.push({
          type: 'info',
          text: 'RESTRICTED ACCESS: Vui lòng nhập mật khẩu vào hộp thoại để xác thực quyền Quản trị.'
        });
      }
    } else if (cmd === 'clear') {
      setTerminalLogs([{ type: 'sys', text: 'Terminal cleared. Type "help" for commands.' }]);
      setTerminalInput('');
      return;
    } else {
      newLogs.push({
        type: 'warn',
        text: `Command not recognized: "${cmd}". Gõ "help" để xem danh sách câu lệnh.`
      });
    }

    setTerminalLogs(newLogs.slice(-7));
    setTerminalInput('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!quickMessage.name || !quickMessage.message) return;
    setMessageSent(true);
    setTimeout(() => {
      setQuickMessage({ name: '', email: '', message: '' });
      setTimeout(() => setMessageSent(false), 4000);
    }, 400);
  };

  const { hero, about, education, skillCategories, projects, contact, physics } = portfolioData;

  // Quick Inline Section Edit Button — chỉ hiện khi isAdmin
  const QuickEditButton = ({ tab, label }) => {
    if (!isAdmin) return null;
    if (!inlineEditMode && viewMode === 'portfolio') return null;
    return (
      <button
        onClick={() => openAdminAtSection(tab)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 font-mono text-xs shadow-[0_0_15px_rgba(0,243,255,0.25)] transition-all"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Sửa {label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#06070b] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Hidden File Input for Avatar & Background Photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Background Antigravity Particle Mesh + Blended User Photo Background */}
      <AntigravityCanvas
        bgImage={hero.avatarImage}
        bgOpacity={hero.bgOpacity}
        bgBrightness={hero.bgBrightness}
        bgBlur={hero.bgBlur}
        physics={physics}
      />

      {/* Ambient Cyber Nebulas */}
      <div className="pointer-events-none fixed top-[-15%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[140px] z-0" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[520px] h-[520px] rounded-full bg-purple-600/15 blur-[150px] z-0" />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0d1526]/95 border border-cyan-400/50 text-cyan-200 shadow-[0_0_25px_rgba(0,243,255,0.3)] backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono">{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
          RESTRICTED ACCESS AUTHENTICATION MODAL (CYBER / TERMINAL THEME)
      ========================================== */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseAuthModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#080c16]/95 border-2 border-cyan-500/40 p-6 sm:p-7 shadow-[0_0_60px_rgba(0,243,255,0.22)] text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Cyber Nebulas inside modal */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-purple-500/15 blur-3xl" />

            {/* Header: Cyber status dots + Close button */}
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-cyan-300 tracking-wider">
                  SECURE_GATE // PORT 443
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseAuthModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng hộp thoại"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon + Title */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.3)] shrink-0">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
                  AUTHORIZATION REQUIRED
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-wide mt-0.5">
                  RESTRICTED ACCESS
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Vùng điều khiển yêu cầu xác thực mật khẩu quản trị để kích hoạt quyền chỉnh sửa CMS.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>MẬT KHẨU QUẢN TRỊ</span>
                  <span className="text-[10px] text-slate-500">MẶC ĐỊNH: admin123</span>
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={authPasswordInput}
                  onChange={(e) => {
                    setAuthPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Nhập mật khẩu quản trị..."
                  className={`w-full px-4 py-2.5 rounded-xl bg-black/60 border font-mono text-sm text-white focus:outline-none transition-all ${
                    authError
                      ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                      : 'border-white/15 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,243,255,0.25)]'
                  }`}
                />

                {authError && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAuthModal}
                  className="w-1/3 py-2.5 rounded-xl font-mono text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 transition-all text-center"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.35)] hover:shadow-[0_0_25px_rgba(0,243,255,0.55)] transition-all flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>XÁC NHẬN</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <span className="font-mono text-[10px] text-slate-500">
                SESSION-PERSISTENT • F5 KHÔNG PHẢI NHẬP LẠI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Admin Trigger Button (Bottom Left) — chỉ hiện khi isAdmin */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
          <button
            onClick={() => setViewMode((prev) => (prev === 'portfolio' ? 'split' : 'portfolio'))}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-semibold border backdrop-blur-xl transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(0,243,255,0.25)] ${
              viewMode !== 'portfolio'
                ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                : 'bg-[#0b1220]/90 text-cyan-300 border-cyan-400/50 hover:bg-cyan-500/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{viewMode === 'portfolio' ? 'Mở Trang Admin CMS' : 'Đóng Admin (Xem Web)'}</span>
          </button>

          {viewMode === 'portfolio' && (
            <button
              onClick={() => setInlineEditMode((prev) => !prev)}
              className={`px-3 py-2.5 rounded-2xl font-mono text-xs border backdrop-blur-xl transition-all flex items-center gap-1.5 ${
                inlineEditMode
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-[#0b1220]/80 border-white/15 text-slate-300 hover:text-white'
              }`}
              title="Bật nút Sửa Nhanh trên từng phần của trang web"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{inlineEditMode ? 'Sửa Nhanh: BẬT' : 'Sửa Nhanh'}</span>
            </button>
          )}
        </div>
      )}

      {/* ==========================================
          NAVIGATION BAR (WITH ADMIN CMS BUTTON & LOCKED ZERO-G: BOOSTED)
      ========================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[#06070b]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)] group-hover:border-cyan-300 transition-colors">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-mono font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
                NPL <span className="text-cyan-400">//</span> SEC_SPACE
              </div>
              <div className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SOC_NODE: ONLINE
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-full px-2 py-1">
            {[
              { id: 'hero', label: 'Khởi đầu' },
              { id: 'about', label: 'Mục tiêu' },
              { id: 'education', label: 'Học vấn' },
              { id: 'skills', label: 'Kỹ năng' },
              { id: 'projects', label: 'Dự án' },
              { id: 'contact', label: 'Liên hệ' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeNav === item.id && viewMode !== 'admin'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Photo Picker, ADMIN CMS Toggle, and Locked ZERO-G: BOOSTED Badge */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl font-mono text-[11px] bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
                  title="Chọn ảnh nền & avatar từ máy tính"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Đổi Ảnh</span>
                </button>

                {/* ADMIN CMS Toggle Button */}
                <button
                  onClick={() =>
                    setViewMode((prev) => (prev === 'portfolio' ? 'split' : prev === 'split' ? 'admin' : 'portfolio'))
                  }
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-all flex items-center gap-1.5 ${
                    viewMode !== 'portfolio'
                      ? 'bg-cyan-500/25 border-cyan-300 text-cyan-200 shadow-[0_0_20px_rgba(0,243,255,0.35)]'
                      : 'bg-white/5 hover:bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                  }`}
                  title="Chuyển đổi giữa chế độ Xem Web, Chia đôi màn hình (Split) và Full Admin CMS"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>
                    {viewMode === 'portfolio'
                      ? 'ADMIN CMS'
                      : viewMode === 'split'
                      ? 'CMS: SPLIT'
                      : 'CMS: FULL'}
                  </span>
                </button>

                {/* Nút Đăng xuất Admin */}
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl font-mono text-xs border border-red-500/40 bg-red-500/10 hover:bg-red-500/25 text-red-300 hover:text-red-200 transition-all flex items-center gap-1"
                  title="Đăng xuất quyền Quản trị Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </>
            )}

            {/* Permanent ZERO-G: BOOSTED Badge — chỉ hiển thị khi isAdmin */}
            {isAdmin && (
              <div
                className="px-3 py-1.5 rounded-xl font-mono text-xs border bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_22px_rgba(168,85,247,0.5)] flex items-center gap-1.5 select-none shrink-0"
                title="Chế độ Không trọng lực Tăng cường luôn bật"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                <span className="hidden sm:inline">ZERO-G: BOOSTED</span>
                <span className="sm:hidden">ZERO-G</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          WORKSPACE LAYOUT: PORTFOLIO / SPLIT / FULL ADMIN
      ========================================== */}
      <div className="relative z-10 pt-24 pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* FULL ADMIN MODE */}
        {viewMode === 'admin' && (
          <div className="max-w-6xl mx-auto">
            <AdminDashboardPanel
              data={portfolioData}
              setData={setPortfolioData}
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onResetDefault={handleResetDefault}
              onShowToast={showToast}
              onTriggerPhotoUpload={() => fileInputRef.current?.click()}
              isAuthenticated={isAdminAuthenticated}
              setIsAuthenticated={setIsAdminAuthenticated}
            />
          </div>
        )}

        {/* SPLIT MODE OR PORTFOLIO MODE */}
        {viewMode !== 'admin' && (
          <div className={viewMode === 'split' ? 'grid grid-cols-1 xl:grid-cols-12 gap-8 items-start' : ''}>
            {/* Sticky Admin Drawer in Split Mode */}
            {viewMode === 'split' && (
              <div className="xl:col-span-5 xl:sticky xl:top-20 z-30">
                <AdminDashboardPanel
                  data={portfolioData}
                  setData={setPortfolioData}
                  activeTab={adminTab}
                  setActiveTab={setAdminTab}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onResetDefault={handleResetDefault}
                  onShowToast={showToast}
                  onTriggerPhotoUpload={() => fileInputRef.current?.click()}
                  isAuthenticated={isAdminAuthenticated}
                  setIsAuthenticated={setIsAdminAuthenticated}
                />
              </div>
            )}

            {/* Live Portfolio View */}
            <main
              className={`${
                viewMode === 'split' ? 'xl:col-span-7' : 'max-w-7xl mx-auto'
              } space-y-28 sm:space-y-36`}
            >
              {/* ==========================================
                  HERO SECTION
              ========================================== */}
              <section id="hero" className="min-h-[80vh] flex items-center pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
                  {/* Left Column: Text & CTAs */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                        <span>{hero.badge.replace(/\s*•\s*ZERO-G BOOSTED/gi, '').replace(/\s*ZERO-G BOOSTED/gi, '')}</span>
                      </div>
                      {isAdmin && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-mono select-none">
                          <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
                          <span>ZERO-G BOOSTED</span>
                        </div>
                      )}
                      <QuickEditButton tab="hero" label="Hero & Ảnh" />
                    </div>

                    <div className="space-y-3 pt-4 sm:pt-6 overflow-visible">
                      <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                        {hero.tagline === 'DEFENDING DIGITAL GRAVITY //' ? 'BẢO VỆ KHÔNG GIAN SỐ //' : hero.tagline}
                      </p>
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-snug sm:leading-[1.25] pt-3 pb-2 animate-cyber-name overflow-visible">
                        <span className="block pt-1 pb-1 overflow-visible">
                          <span className="cyber-neon-firstname">
                            {hero.firstName}
                          </span>
                        </span>
                        <span className="block pt-1 pb-1 overflow-visible">
                          <span className="cyber-neon-lastname">
                            {hero.lastName}
                          </span>
                        </span>
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-base sm:text-xl font-semibold text-slate-200">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-sm sm:text-base">
                        {hero.roleBadge}
                      </span>
                      <span className="text-slate-300 text-sm sm:text-base">{hero.roleSubtitle}</span>
                    </div>

                    <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl drop-shadow">
                      {hero.bio}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => scrollToSection('projects')}
                        className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.75)] hover:scale-[1.02] active:scale-[0.99] transition-all"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{hero.ctaPrimary}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => scrollToSection('contact')}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-[#0b111e]/80 hover:bg-[#111b2e] text-white border border-cyan-400/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.15)] hover:shadow-[0_0_25px_rgba(0,243,255,0.35)] transition-all backdrop-blur-md"
                      >
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span>{hero.ctaSecondary}</span>
                      </button>

                      <a
                        href={contact.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-mono text-xs text-slate-200 hover:text-cyan-300 bg-[#0b111e]/70 border border-white/15 hover:border-cyan-400/40 transition-all backdrop-blur-md"
                      >
                        <Github className="w-4 h-4" />
                        <span>{contact.github}</span>
                      </a>
                    </div>

                    {/* Quick Telemetry Metrics */}
                    <div className="grid grid-cols-3 gap-3 pt-4 max-w-xl">
                      {hero.metrics.map((m, idx) => {
                        const labelMap: Record<string, string> = {
                          'CORE FOCUS': 'TRỌNG TÂM CHÍNH',
                          'RESEARCH': 'NGHIÊN CỨU',
                          'GRADUATION': 'TỐT NGHIỆP'
                        };
                        const displayLabel = labelMap[m.label] || m.label;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#0b101b]/80 backdrop-blur-md border border-white/10"
                          >
                            <div className={`font-mono text-xs ${m.color}`}>{displayLabel}</div>
                            <div className="font-bold text-sm sm:text-base text-white mt-0.5">{m.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Floating Antigravity Cyber Avatar HUD */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="relative w-72 h-80 sm:w-80 sm:h-96 animate-zero-g">
                      <div className="absolute -inset-6 rounded-full border border-dashed border-cyan-400/40 animate-spin-slow pointer-events-none" />
                      <div
                        className="absolute -inset-3 rounded-full border border-purple-400/30 pointer-events-none"
                        style={{ animation: 'spinSlow 18s linear infinite reverse' }}
                      />

                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/35 via-emerald-500/25 to-purple-500/35 blur-2xl" />

                      <div
                        onClick={isAdmin ? () => fileInputRef.current?.click() : undefined}
                        title={isAdmin ? 'Nhấn để đổi ảnh đại diện & ảnh nền' : undefined}
                        className={`group relative h-full w-full rounded-3xl bg-[#0c1220] border-2 border-cyan-400/60 animate-glow-border overflow-hidden flex flex-col justify-between ${
                          isAdmin ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        {!imgLoadError ? (
                          <img
                            src={hero.avatarImage}
                            alt={`${hero.firstName} ${hero.lastName}`}
                            onError={() => setImgLoadError(true)}
                            className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ${
                              isAdmin ? 'group-hover:scale-105' : ''
                            }`}
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#132226] via-[#0c1520] to-[#080b12] p-6 text-center">
                            <div className="w-28 h-28 rounded-full border-2 border-cyan-400/60 bg-cyan-500/10 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(0,243,255,0.3)]">
                              <Camera className="w-10 h-10 text-cyan-300 animate-pulse" />
                            </div>
                            <span className="font-mono text-xs text-cyan-300 font-semibold">
                              {isAdmin ? 'NHẤN ĐỂ NẠP ẢNH abchdh.jpg' : `${hero.firstName} ${hero.lastName}`}
                            </span>
                            {isAdmin && (
                              <span className="text-[11px] text-slate-400 mt-1">
                                Ảnh sẽ tự động áp dụng cho cả Nền & Avatar
                              </span>
                            )}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070c] via-[#05070c]/25 to-[#05070c]/60 pointer-events-none" />

                        <div className="relative z-10 p-4 flex items-center justify-between text-[11px] font-mono text-cyan-200">
                          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-cyan-400/30">
                            {hero.hudId}
                          </span>
                          {isAdmin && (
                            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-purple-400/40 flex items-center gap-1.5 text-purple-300">
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                              ZERO-G
                            </span>
                          )}
                        </div>

                        <div className="relative z-10 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
                          <div className="font-extrabold text-white tracking-wide text-lg drop-shadow">
                            {hero.firstName} {hero.lastName}
                          </div>
                          <div className="font-mono text-xs text-cyan-300 mb-2 uppercase">
                            {hero.roleBadge}
                          </div>
                          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-slate-300">
                            <span>HCMUTE // IT</span>
                            <span className="text-emerald-400">SOC_DEFENSE: ACTIVE</span>
                          </div>
                        </div>
                      </div>

                      {hero.orbitBadges.map((badge, i) => (
                        <div
                          key={i}
                          style={{ animationDelay: badge.delay }}
                          className={`absolute ${badge.pos} px-3 py-1.5 rounded-xl bg-[#0b111e]/95 backdrop-blur-md border ${badge.color} font-mono text-xs shadow-[0_0_20px_rgba(0,0,0,0.75)] animate-badge-zero-g z-20 whitespace-nowrap`}
                        >
                          ● {badge.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ==========================================
                  ABOUT / OBJECTIVE SECTION + INTERACTIVE TERMINAL
              ========================================== */}
              <ScrollReveal>
                <section id="about" className="scroll-mt-24">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                      <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2">
                        01 // MỤC TIÊU NGHỀ NGHIỆP
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">Mục Tiêu Nghề Nghiệp</h2>
                        <QuickEditButton tab="about" label="Mục tiêu" />
                      </div>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      TRẠNG THÁI: <span className="text-emerald-400">SẴN SÀNG THỰC TẬP / FRESHER</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <TiltCard tiltIntensity={physics.tiltIntensity} className="lg:col-span-7 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{about.heading}</h3>
                          <p className="text-xs font-mono text-slate-400">{about.subheading}</p>
                        </div>
                      </div>

                      <p className="text-slate-200 leading-relaxed text-base mb-5">{about.paragraph1}</p>
                      <p className="text-slate-300 leading-relaxed text-base mb-6">{about.paragraph2}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        {about.pillars.map((pillar, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                            <div className={`${pillar.color} font-mono text-xs mb-1`}>{pillar.code}</div>
                            <div className="text-xs text-slate-300">{pillar.text}</div>
                          </div>
                        ))}
                      </div>
                    </TiltCard>

                    {/* Interactive SOC Command Terminal */}
                    <div className="lg:col-span-5 rounded-2xl bg-[#070a10] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,243,255,0.08)] flex flex-col justify-between overflow-hidden">
                      <div className="px-4 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500/80" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                          <span className="ml-2 font-mono text-xs text-slate-300 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            loi@soc-workstation:~
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                          TERMINAL TƯƠNG TÁC
                        </span>
                      </div>

                      <div className="p-4 font-mono text-xs space-y-2.5 flex-1 overflow-y-auto max-h-64">
                        {terminalLogs.map((log, index) => (
                          <div
                            key={index}
                            className={`leading-relaxed ${
                              log.type === 'user'
                                ? 'text-white font-semibold'
                                : log.type === 'ok'
                                ? 'text-emerald-400'
                                : log.type === 'warn'
                                ? 'text-amber-400'
                                : log.type === 'info'
                                ? 'text-cyan-300'
                                : 'text-slate-400'
                            }`}
                          >
                            {log.text}
                          </div>
                        ))}
                      </div>

                      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex flex-wrap gap-1.5">
                        {['skills', 'soc', 'education', 'contact', ...(isAdmin ? ['admin'] : []), 'clear'].map((cmd) => (
                          <button
                            key={cmd}
                            type="button"
                            onClick={() => setTerminalInput(cmd)}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-[11px] font-mono text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors"
                          >
                            /{cmd}
                          </button>
                        ))}
                      </div>

                      <form
                        onSubmit={handleTerminalCommand}
                        className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-2"
                      >
                        <span className="font-mono text-xs text-emerald-400 shrink-0">loi@soc:~$</span>
                        <input
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          placeholder="Nhập lệnh (vd: skills, soc, admin)..."
                          className="w-full bg-transparent text-xs font-mono text-white focus:outline-none placeholder:text-slate-600"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs border border-cyan-500/30"
                        >
                          CHẠY
                        </button>
                      </form>
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* ==========================================
                  EDUCATION & SELF-STUDY ACTIVITIES SECTION
              ========================================== */}
              <ScrollReveal>
                <section id="education" className="scroll-mt-24">
                  <div className="mb-8">
                    <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-2">
                      02 // TRÌNH ĐỘ HỌC VẤN & RÈN LUYỆN
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl sm:text-4xl font-bold text-white">Học Vấn & Hoạt Động Tự Học</h2>
                      <QuickEditButton tab="about" label="Học vấn" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TiltCard
                      tiltIntensity={physics.tiltIntensity}
                      glowColor="rgba(16, 185, 129, 0.22)"
                      className="p-6 sm:p-8"
                    >
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
                            <GraduationCap className="w-7 h-7" />
                          </div>
                          <div>
                            <span className="font-mono text-xs text-emerald-400 uppercase">
                              {education.universityBadge === 'ĐẠI HỌC CHÍNH QUY'
                                ? 'TRÌNH ĐỘ HỌC VẤN'
                                : education.universityBadge || 'TRÌNH ĐỘ HỌC VẤN'}
                            </span>
                            <h3 className="text-xl font-bold text-white mt-0.5">{education.universityName}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm sm:text-base text-slate-300">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 gap-2">
                          <span className="text-slate-400 shrink-0">Chuyên ngành:</span>
                          <span className="font-semibold text-white text-right">{education.major}</span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 gap-2">
                          <span className="text-slate-400 shrink-0">Dự kiến tốt nghiệp:</span>
                          <span className="font-mono font-semibold text-cyan-300 text-right">
                            {education.graduationDate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 gap-2">
                          <span className="text-slate-400 shrink-0">Ngoại ngữ:</span>
                          <span className="font-semibold text-emerald-300 text-right">{education.language}</span>
                        </div>
                      </div>
                    </TiltCard>

                    <TiltCard
                      tiltIntensity={physics.tiltIntensity}
                      glowColor="rgba(168, 85, 247, 0.22)"
                      className="p-6 sm:p-8"
                    >
                      <div className="flex items-center gap-3.5 mb-6">
                        <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-400/30 text-purple-400">
                          <Terminal className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="font-mono text-xs text-purple-400 uppercase">THỰC HÀNH LAB AN NINH MẠNG</span>
                          <h3 className="text-xl font-bold text-white mt-0.5">Hoạt Động Tự Học & Thực Hành</h3>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {education.activities.map((act, idx) => (
                          <div
                            key={act.id || idx}
                            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1.5 gap-2">
                              <span className="font-semibold text-white flex items-center gap-2">
                                {idx % 2 === 0 ? (
                                  <Award className="w-4 h-4 text-purple-400 shrink-0" />
                                ) : (
                                  <Network className="w-4 h-4 text-cyan-400 shrink-0" />
                                )}
                                {act.title}
                              </span>
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 shrink-0">
                                {act.badge}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{act.description}</p>
                          </div>
                        ))}
                      </div>
                    </TiltCard>
                  </div>
                </section>
              </ScrollReveal>

              {/* ==========================================
                  SKILLS SECTION (3D TILT + GLOW GRID)
              ========================================== */}
              <ScrollReveal>
                <section id="skills" className="scroll-mt-24">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                      <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2">
                        03 // KỸ NĂNG CHUYÊN MÔN
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">Hệ Sinh Thái Kỹ Năng</h2>
                        <QuickEditButton tab="skills" label="Kỹ năng" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 max-w-md">
                      Di chuột vào từng thẻ kỹ năng để cảm nhận hiệu ứng nghiêng 3D Antigravity và ánh sáng phản hồi theo tọa độ.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {skillCategories.map((cat, idx) => {
                      const IconComponent = ICON_MAP[cat.iconName] || Shield;
                      const themeObj = THEME_CONFIG[cat.theme] || THEME_CONFIG.cyan;
                      return (
                        <TiltCard
                          key={cat.id || idx}
                          tiltIntensity={physics.tiltIntensity}
                          glowColor={themeObj.glow}
                          className="p-6 sm:p-7 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-5">
                              <div
                                className={`p-3 rounded-2xl bg-gradient-to-br ${themeObj.accent} text-slate-950 shadow-lg`}
                              >
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 tracking-wider">
                                {cat.subtitle}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">{cat.description}</p>

                            <div className="space-y-2.5">
                              {cat.skills.map((skill, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/40 transition-all"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 group-hover:shadow-[0_0_10px_#00f3ff] transition-all" />
                                    <span className="font-medium text-sm text-slate-100">{skill.name}</span>
                                  </div>
                                  <span className="font-mono text-[11px] text-slate-400 group-hover:text-cyan-300 transition-colors">
                                    {skill.level}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TiltCard>
                      );
                    })}
                  </div>
                </section>
              </ScrollReveal>

              {/* ==========================================
                  PROJECTS SECTION (WITH SOC PIPELINE SIMULATOR)
              ========================================== */}
              <ScrollReveal>
                <section id="projects" className="scroll-mt-24">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                      <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-2">
                        04 // DỰ ÁN TIÊU BIỂU & NGHIÊN CỨU
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">Dự Án Khóa Luận & Tiêu Biểu</h2>
                        <QuickEditButton tab="projects" label="Dự án" />
                      </div>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      TỔNG SỐ DỰ ÁN:{' '}
                      <span className="text-cyan-400 font-bold">0{projects.length} DỰ ÁN</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {projects
                      .filter((p) => p.featured)
                      .map((project) => (
                        <TiltCard
                          key={project.id}
                          tiltIntensity={physics.tiltIntensity}
                          glowColor="rgba(0, 243, 255, 0.22)"
                          className="p-6 sm:p-9 border-cyan-400/30 shadow-[0_0_40px_rgba(0,243,255,0.08)]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <span className="px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 font-mono text-xs text-cyan-300 font-semibold">
                              ★ {project.badge}
                            </span>
                            <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-400/20">
                              {project.period}
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-snug">
                            {project.title}
                          </h3>
                          <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-4xl">
                            {project.summary}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                            {project.highlights.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3"
                              >
                                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  0{idx + 1}
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tech.map((t, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/30 font-mono text-xs text-cyan-200"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          <SocPipelineSimulator />
                        </TiltCard>
                      ))}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {projects
                        .filter((p) => !p.featured)
                        .map((project) => {
                          const IconComp = ICON_MAP[project.iconName] || Sparkles;
                          return (
                            <TiltCard
                              key={project.id}
                              tiltIntensity={physics.tiltIntensity}
                              className="p-6 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                                    <IconComp className="w-5 h-5" />
                                  </div>
                                  <span className="font-mono text-[11px] text-slate-400">{project.period}</span>
                                </div>

                                <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider mb-1">
                                  {project.badge}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2.5">{project.title}</h3>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">{project.summary}</p>

                                <ul className="space-y-2 mb-6">
                                  {project.highlights.map((h, i) => (
                                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                      <span className="text-emerald-400 mt-0.5">▹</span>
                                      <span>{h}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                                {project.tech.map((t, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 font-mono text-[11px] text-slate-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </TiltCard>
                          );
                        })}
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* ==========================================
                  CONTACT SECTION
              ========================================== */}
              <ScrollReveal>
                <section id="contact" className="scroll-mt-24">
                  <div className="mb-10">
                    <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2">
                      05 // KÊNH LIÊN HỆ TRỰC TIẾP
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl sm:text-4xl font-bold text-white">
                        Kết Nối Với {hero.firstName} {hero.lastName}
                      </h2>
                      <QuickEditButton tab="contact" label="Liên hệ" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email Card */}
                      <TiltCard tiltIntensity={physics.tiltIntensity} className="p-5 flex flex-col justify-between group">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all">
                            <Mail className="w-6 h-6" />
                          </div>
                          <button
                            onClick={() => handleCopy(contact.email, 'Email')}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Sao chép
                          </button>
                        </div>
                        <div className="mt-6">
                          <div className="font-mono text-xs text-slate-400">EMAIL CÁ NHÂN</div>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition-colors break-all"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </TiltCard>

                      {/* Phone Card */}
                      <TiltCard tiltIntensity={physics.tiltIntensity} className="p-5 flex flex-col justify-between group">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                            <Phone className="w-6 h-6" />
                          </div>
                          <button
                            onClick={() => handleCopy(contact.phone, 'Số điện thoại')}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-xs font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1.5 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Sao chép
                          </button>
                        </div>
                        <div className="mt-6">
                          <div className="font-mono text-xs text-slate-400">ĐIỆN THOẠI / ZALO</div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-lg font-bold text-white hover:text-emerald-300 transition-colors"
                          >
                            {contact.phoneDisplay}
                          </a>
                        </div>
                      </TiltCard>

                      {/* GitHub Card */}
                      <TiltCard tiltIntensity={physics.tiltIntensity} className="p-5 flex flex-col justify-between group">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                            <Github className="w-6 h-6" />
                          </div>
                          <a
                            href={contact.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-xs font-mono text-slate-300 hover:text-purple-300 flex items-center gap-1.5 transition-all"
                          >
                            <span>Mở GitHub</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="mt-6">
                          <div className="font-mono text-xs text-slate-400">GITHUB REPOSITORIES</div>
                          <a
                            href={contact.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-base sm:text-lg font-bold text-white hover:text-purple-300 transition-colors break-all"
                          >
                            {contact.github}
                          </a>
                        </div>
                      </TiltCard>

                      {/* Location Card */}
                      <TiltCard tiltIntensity={physics.tiltIntensity} className="p-5 flex flex-col justify-between group">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-mono text-emerald-300">
                            {contact.workMode}
                          </span>
                        </div>
                        <div className="mt-6">
                          <div className="font-mono text-xs text-slate-400">ĐỊA CHỈ HIỆN TẠI</div>
                          <div className="text-lg font-bold text-white">{contact.location}</div>
                        </div>
                      </TiltCard>
                    </div>

                    {/* Quick Encrypted Message Dispatch Form */}
                    <TiltCard tiltIntensity={physics.tiltIntensity} className="lg:col-span-5 p-6 sm:p-7">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-cyan-400" />
                          Gửi Tin Nhắn Nhanh
                        </h3>
                        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          BẢO MẬT TLS 1.3
                        </span>
                      </div>

                      {messageSent ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6" />
                          </div>
                          <h4 className="text-base font-bold text-white">Đã ghi nhận thông điệp!</h4>
                          <p className="text-xs text-slate-300 max-w-xs mx-auto">
                            Cảm ơn bạn đã liên hệ. Bạn cũng có thể gửi email trực tiếp tới{' '}
                            <span className="text-cyan-300 font-mono">{contact.email}</span>.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSendMessage} className="space-y-3.5">
                          <div>
                            <label className="block font-mono text-[11px] text-slate-400 mb-1">
                              TÊN CỦA BẠN / QUÝ CÔNG TY
                            </label>
                            <input
                              type="text"
                              required
                              value={quickMessage.name}
                              onChange={(e) => setQuickMessage({ ...quickMessage, name: e.target.value })}
                              placeholder="Nhập tên người gửi hoặc HR..."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[11px] text-slate-400 mb-1">EMAIL LIÊN HỆ</label>
                            <input
                              type="email"
                              value={quickMessage.email}
                              onChange={(e) => setQuickMessage({ ...quickMessage, email: e.target.value })}
                              placeholder="hr@company.com"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[11px] text-slate-400 mb-1">NỘI DUNG TRAO ĐỔI</label>
                            <textarea
                              rows={3}
                              required
                              value={quickMessage.message}
                              onChange={(e) => setQuickMessage({ ...quickMessage, message: e.target.value })}
                              placeholder="Cơ hội thực tập / Fresher An ninh mạng (SOC, Pentest, Security Engineer)..."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-400 text-sm text-white focus:outline-none resize-none"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>Gửi Thông Điệp</span>
                          </button>
                        </form>
                      )}
                    </TiltCard>
                  </div>
                </section>
              </ScrollReveal>
            </main>
          </div>
        )}
      </div>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050609]/90 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>
              © 2026 {hero.firstName} {hero.lastName} — CYBERSECURITY PORTFOLIO
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <a href={`mailto:${contact.email}`} className="hover:text-cyan-300 transition-colors">
              {contact.email}
            </a>
            <span>•</span>
            <a href={`tel:${contact.phone}`} className="hover:text-emerald-300 transition-colors">
              {contact.phoneDisplay}
            </a>
            <span>•</span>
            <a
              href={contact.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors"
            >
              GitHub
            </a>
            {isAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={() => setViewMode((prev) => (prev === 'portfolio' ? 'split' : 'portfolio'))}
                  className="text-cyan-400 hover:underline"
                >
                  [Admin CMS]
                </button>
                <span>•</span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:underline"
                >
                  [Đăng xuất]
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
