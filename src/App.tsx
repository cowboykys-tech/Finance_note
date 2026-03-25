import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  MessageCircle, 
  ArrowRight, 
  Search, 
  FileText, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Menu,
  X,
  Sparkles,
  MousePointer2,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  User,
  HelpCircle,
  ArrowLeft,
  Info,
  CircleDollarSign,
  MapPin,
  Plus,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInput, DiagnosisResult, AppState } from './types';
import { runEngine } from './engine/diagnosisEngine';

// --- Shared Components ---

const CostComparisonPopup = ({ isOpen, onClose, onStart }: { isOpen: boolean; onClose: () => void; onStart: () => void }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      const expiryDate = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('hideCostPopupUntil', expiryDate.toString());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-[340px] rounded-[2.5rem] shadow-2xl overflow-hidden relative"
        >
          <button 
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-all z-10 shadow-sm"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-7 md:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black mb-4">
              <AlertCircle className="w-3 h-3" /> 기존 대행 방식의 실체
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4">
              왜 돈부터 내고 <br />
              <span className="text-red-600 underline underline-offset-4 decoration-red-200">시작하시나요?</span>
            </h2>

            <div className="bg-slate-50 rounded-3xl p-4 mb-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-bold text-[10px]">기존 대행사 비용</span>
                <span className="text-red-600 font-black text-sm">착수금 100만원 + 성공보수 5%</span>
              </div>
              
              <ul className="space-y-2 text-slate-600 font-bold text-[11px] md:text-xs">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                  <span>3000만원 받으면 약 250만원이 비용으로 나갑니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                  <span>업체에 따라 5~7%까지 요구하는 경우도 많습니다</span>
                </li>
              </ul>
              
              <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                <p className="text-red-600 font-black text-[10px]">
                  → 결국 사장님 돈으로 수백만원 먼저 쓰고 시작하는 구조입니다
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-slate-900 font-black text-xs">가능한 기관, 예상 금액, 서류까지</p>
                  <p className="text-blue-600 font-black text-xs">먼저 무료로 확인해보세요</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100 text-center">
                <p className="text-blue-600 font-black text-[9px] mb-0.5">착수금</p>
                <p className="text-slate-900 font-black text-base">없음</p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100 text-center">
                <p className="text-blue-600 font-black text-[9px] mb-0.5">성공보수</p>
                <p className="text-slate-900 font-black text-base">없음</p>
              </div>
            </div>

            <Button 
              variant="cta" 
              className="w-full py-4 text-base shadow-2xl shadow-orange-200"
              onClick={() => { onStart(); handleClose(); }}
            >
              무료진단 시작하기 <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="flex flex-col items-center gap-3 mt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-slate-500 group-hover:text-slate-700 text-[10px] font-bold transition-colors">
                  24시간 동안 다시 보지 않기
                </span>
              </label>
              <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 text-[10px] font-bold underline underline-offset-2"
              >
                닫기
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cta'; 
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) => {
  const baseStyles = "px-6 py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    cta: "bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-200"
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string; key?: React.Key }) => (
  <div className={`bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const InputField = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  helpText,
  icon: Icon,
  options,
  error
}: { 
  label: string; 
  name: string; 
  type?: string; 
  placeholder?: string; 
  value: string | number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  helpText?: string;
  icon?: any;
  options?: { value: string; label: string }[];
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-blue-600" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {type === 'select' ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white appearance-none`}
            required={required}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px]`}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
          required={required}
        />
      )}
    </div>
    {error && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    {helpText && !error && <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Info className="w-3 h-3" /> {helpText}</p>}
  </div>
);

// --- Views ---

const LandingView = ({ onStart, onViewDocuments, onViewSchedule }: { onStart: () => void; onViewDocuments: () => void; onViewSchedule: () => void; key?: React.Key }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: '무료진단', onClick: onStart, active: true },
    { label: '필요서류', onClick: onViewDocuments },
    { label: '신청일정', onClick: onViewSchedule },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="relative flex items-center justify-center">
                <FileText className="text-white w-5 h-5 absolute -translate-x-1.5 -translate-y-1.5" />
                <TrendingUp className="text-white w-4 h-4 absolute translate-x-1.5 translate-y-1.5" />
                <CircleDollarSign className="text-white/40 w-3 h-3 absolute translate-x-3 -translate-y-3" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">금융노트</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={item.onClick}
                className={`text-sm font-bold transition-colors cursor-pointer ${item.active ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
              >
                {item.label}
              </button>
            ))}
            <Button variant="primary" className="py-2.5 px-6 text-sm" onClick={onStart}>
              진단 시작하기
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-5 py-6 flex flex-col gap-4">
                {menuItems.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setIsMenuOpen(false); item.onClick?.(); }} 
                    className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50 text-left w-full"
                  >
                    {item.label}
                  </button>
                ))}
                <Button variant="primary" className="w-full mt-4" onClick={() => { setIsMenuOpen(false); onStart(); }}>
                  무료 진단 시작하기
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              복잡한 정책자금, <br />
              <span className="text-blue-600">이제 정리해서 <br className="hidden md:block" /> 보여드립니다</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-xl font-medium leading-relaxed">
              3분만 입력하면 가능한 정책자금 방향, <br className="hidden md:block" />
              예상 기관, 준비서류까지 한 번에 확인할 수 있습니다.
            </p>
            
            <div className="space-y-8">
              {/* Fee Structure Highlight Block - Emotion/Shock */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl shadow-xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="bg-red-100 px-5 py-3 rounded-2xl border border-red-200 inline-block self-start">
                      <p className="text-red-500 font-black text-xs mb-1 uppercase tracking-widest">기존 방식</p>
                      <p className="text-red-600 font-black text-xl md:text-2xl">착수금 100만원 + 성공보수 5%</p>
                    </div>
                    <p className="text-red-500 font-black text-lg">
                      "3000만원 받으면 약 250만원이 먼저 나갑니다"
                    </p>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight text-slate-900">
                    왜 돈부터 내고 <br />
                    <span className="text-red-600">시작하시나요?</span>
                  </h3>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-200/30 rounded-full blur-3xl" />
              </motion.div>

              {/* Finance Note Solution - Empathy/Solution */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border-2 border-blue-600 p-8 rounded-3xl shadow-2xl shadow-blue-100 relative"
              >
                <div className="absolute -top-4 left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-black">
                  금융노트의 해결책
                </div>
                <h4 className="text-slate-900 font-black text-2xl mb-6">
                  먼저 무료로 확인해보세요
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <CheckCircle2 className="text-blue-600 w-6 h-6 shrink-0" />
                    <span className="text-slate-800 font-black text-lg">착수금 없음</span>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <CheckCircle2 className="text-blue-600 w-6 h-6 shrink-0" />
                    <span className="text-slate-800 font-black text-lg">성공보수 없음</span>
                  </div>
                </div>
                <p className="text-slate-600 font-bold text-lg text-center md:text-left">
                  부담 없이 <span className="text-blue-600 underline underline-offset-4">먼저 확인하고 결정하세요</span>
                </p>
              </motion.div>

              {/* CTA Section - Action */}
              <div className="flex flex-col items-center md:items-start gap-6 pt-4">
                <div className="flex items-center gap-2 text-blue-600 font-black text-lg tracking-tight bg-blue-50 px-4 py-2 rounded-full border border-blue-100 animate-bounce">
                  <Sparkles className="w-5 h-5" />
                  착수금 없음 · 성공보수 없음
                </div>

                {/* Urgency Message */}
                <div className="text-center md:text-left space-y-1">
                  <p className="text-orange-600 font-black text-xl leading-tight">
                    서두르세요
                  </p>
                  <p className="text-slate-500 font-bold text-sm leading-tight">
                    정책자금은 예산이 소진되면 <br className="hidden md:block" /> 바로 마감됩니다
                  </p>
                </div>

                <Button variant="cta" className="text-2xl px-16 py-8 w-full md:w-auto group shadow-2xl shadow-blue-300 hover:scale-105 transition-transform" onClick={onStart}>
                  무료 진단 시작하기 
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </Button>
                <p className="text-slate-500 font-bold text-base">
                  3분이면 사장님의 자금 지도가 그려집니다
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-200 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="text-xs font-black text-slate-300 uppercase tracking-widest">FINANCE NOTE</div>
              </div>
              
              <div className="space-y-6">
                <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-blue-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <TrendingUp className="text-blue-600 w-6 h-6" />
                    <div className="h-2 w-12 bg-blue-200 rounded-full" />
                  </div>
                  <div className="h-24 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <CreditCard className="text-emerald-600 w-6 h-6" />
                    <div className="h-2 w-12 bg-emerald-200 rounded-full" />
                  </div>
                  <div className="h-24 bg-orange-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <Building2 className="text-orange-600 w-6 h-6" />
                    <div className="h-2 w-12 bg-orange-200 rounded-full" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                  <div className="h-2 w-full bg-slate-200 rounded-full" />
                  <div className="h-2 w-5/6 bg-slate-200 rounded-full" />
                  <div className="h-2 w-4/6 bg-slate-200 rounded-full" />
                </div>
                <div className="h-12 w-full bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  진단 결과 확인 완료
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-5 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-slate-900">왜 아직도 돈 내고 알아보세요?</h2>
            <p className="text-slate-500 text-lg font-medium">기존의 번거로움은 버리고, 사장님은 장사에만 집중하세요.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <Card className="bg-white border-slate-200 opacity-80 grayscale-[0.5]">
              <h3 className="text-xl font-black mb-8 text-slate-400 flex items-center gap-2">
                기존 방식
              </h3>
              <ul className="space-y-6">
                {[
                  { text: "착수금 있음", icon: <X className="text-red-400" /> },
                  { text: "성공보수 있음", icon: <X className="text-red-400" /> },
                  { text: "상담비 있음", icon: <X className="text-red-400" /> },
                  { text: "정보 찾기 어려움", icon: <X className="text-red-400" /> }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-400 font-bold">
                    {item.icon} {item.text}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Finance Note Way */}
            <Card className="bg-white border-blue-200 ring-4 ring-blue-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-black rounded-bl-xl">
                추천
              </div>
              <h3 className="text-xl font-black mb-8 text-blue-600 flex items-center gap-2">
                금융노트
              </h3>
              <ul className="space-y-6">
                {[
                  { text: "착수금 없음", icon: <CheckCircle2 className="text-blue-500" /> },
                  { text: "성공보수 없음", icon: <CheckCircle2 className="text-blue-500" /> },
                  { text: "무료 진단", icon: <CheckCircle2 className="text-blue-500" /> },
                  { text: "한 번에 정리된 결과 제공", icon: <CheckCircle2 className="text-blue-500" /> }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-800 font-black">
                    {item.icon} {item.text}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12 tracking-tight">3분이면 충분합니다</h2>
          <div className="bg-blue-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
            <p className="text-xl md:text-2xl font-bold mb-12 leading-relaxed text-blue-100">
              몇 가지만 입력하면 <br className="hidden md:block" />
              <span className="text-white underline underline-offset-8 decoration-blue-400">지금 받을 수 있는</span> 정책자금 방향을 바로 확인할 수 있습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: "가능한 정책자금 방향", icon: <TrendingUp /> },
                { title: "신청 가능한 기관", icon: <Building2 /> },
                { title: "준비해야 할 서류", icon: <FileText /> }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 mb-4 shadow-lg">
                    {item.icon}
                  </div>
                  <p className="font-black text-lg">{item.title}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-blue-200 font-bold">까지 바로 확인할 수 있습니다.</p>
          </div>
        </div>
      </section>

      {/* Mockup Section */}
      <section className="py-24 px-5 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-tight">입력하면 이렇게 나옵니다</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-12">
              복잡한 공고문을 읽을 필요가 없습니다. <br />
              사장님께 꼭 필요한 정보만 요약해서 <br className="hidden md:block" />
              모바일로 간편하게 보여드립니다.
            </p>
            <ul className="space-y-6">
              {[
                { title: "예상 가능 금액 범위", desc: "사장님 조건에서 최대로 받을 수 있는 한도 예측" },
                { title: "예상 가능한 기관", desc: "소진공, 중진공 등 사장님 조건에 맞는 기관 매칭" },
                { title: "진행 방향", desc: "운전자금, 시설자금 등 최적의 자금 활용 전략" },
                { title: "서류 안내", desc: "지금 바로 준비해야 할 핵심 서류 리스트" }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            {/* Mobile Mockup */}
            <div className="w-[300px] h-[600px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl relative border-[8px] border-slate-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
              <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
                <div className="p-5 pt-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <FileText className="text-white w-3 h-3" />
                    </div>
                    <span className="text-xs font-black text-blue-600">금융노트 리포트</span>
                  </div>
                  <div className="h-4 w-2/3 bg-slate-100 rounded-full mb-2" />
                  <div className="h-8 w-full bg-blue-50 rounded-lg mb-8" />
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CircleDollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600">예상 가능 금액</span>
                      </div>
                      <div className="h-3 w-2/3 bg-blue-200 rounded-full" />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-slate-400">예상 기관</span>
                      </div>
                      <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black text-slate-400">진행 방향</span>
                      </div>
                      <div className="h-3 w-3/4 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-emerald-50 rounded-[2.5rem] p-10 md:p-16 border border-emerald-100 text-center">
            <h2 className="text-3xl font-black text-emerald-900 mb-8">금융노트는 다르게 합니다</h2>
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
              <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-emerald-100">
                <p className="text-emerald-500 font-black text-sm mb-2 uppercase tracking-widest">No Fee 01</p>
                <p className="text-2xl font-black text-emerald-900">착수금이 없습니다</p>
              </div>
              <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-emerald-100">
                <p className="text-emerald-500 font-black text-sm mb-2 uppercase tracking-widest">No Fee 02</p>
                <p className="text-2xl font-black text-emerald-900">성공보수도 없습니다</p>
              </div>
            </div>
            <p className="text-lg text-emerald-700 font-bold leading-relaxed">
              부담 없이 먼저 확인하세요. <br />
              사장님의 상황에 맞는 방향을 먼저 안내해드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-5 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">지금 바로 내 조건 확인하기</h2>
          <p className="text-xl text-slate-400 font-bold mb-12">3분이면 사장님의 자금 지도가 그려집니다.</p>
          
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2 text-blue-400 font-black text-xl tracking-tight">
              착수금 없음 · 성공보수 없음
            </div>

            {/* Urgency Message */}
            <div className="text-center space-y-1">
              <p className="text-orange-400 font-black text-2xl leading-tight">
                서두르세요
              </p>
              <p className="text-slate-400 font-bold text-lg leading-tight">
                정책자금은 예산이 소진되면 <br /> 바로 마감됩니다
              </p>
            </div>

            <Button variant="cta" className="text-2xl px-16 py-8 w-full md:w-auto group shadow-2xl shadow-blue-500/20" onClick={onStart}>
              무료 진단 시작하기 
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
            <p className="text-orange-400 font-black text-xl animate-pulse">지금 안 하면 놓칠 수도 있습니다</p>
          </div>
          
          <p className="mt-16 text-slate-500 font-bold text-xs opacity-50">
            ※ 금융노트는 대출 승인을 보장하지 않으며, 정책자금 정보 제공을 목적으로 합니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-5 bg-slate-950 text-slate-500 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <FileText className="text-slate-500 w-3 h-3" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-300">금융노트</span>
          </div>
          <p className="text-xs font-medium">© 2026 금융노트. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-bold">
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

const DiagnosisFormView = ({ 
  onBack, 
  onSubmit
}: { 
  onBack: () => void; 
  onSubmit: (data: UserInput) => void;
  key?: React.Key;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<UserInput>(() => {
    const savedData = localStorage.getItem('financeNoteData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      customerName: '',
      customerPhone: '',
      customerRegion: '',
      customerConcern: '',
      businessNumber: '',
      businessName: '',
      mainIndustry: '',
      subIndustry: '',
      businessDescription: '',
      annualRevenue: 0,
      loan: 0,
      guaranteeLoan: 0,
      credit: 0,
      startDate: '',
      employeeCount: 0,
      fundPurpose: '',
      hasDelinquency: false,
      hasTaxArrears: false
    };
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('financeNoteData', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isOtherIndustry, setIsOtherIndustry] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const industryOptions = [
    { value: '음식점', label: '음식점' },
    { value: '카페', label: '카페' },
    { value: '도소매업', label: '도소매업' },
    { value: '제조업', label: '제조업' },
    { value: '서비스업', label: '서비스업' },
    { value: '건설업', label: '건설업' },
    { value: 'IT/정보통신', label: 'IT/정보통신' },
    { value: '기타', label: '기타(직접입력)' },
  ];

  const subIndustryOptions = [
    { value: 'none', label: '해당 없음' },
    { value: '온라인판매', label: '온라인 판매 / 스마트스토어' },
    { value: '도소매유통', label: '도소매 유통' },
    { value: '상품판매', label: '상품 판매' },
    { value: '기타', label: '기타' },
  ];

  const purposeOptions = [
    { value: '운영자금', label: '운영자금' },
    { value: '시설자금', label: '시설자금' },
    { value: '확장', label: '확장' },
    { value: '대환', label: '대환' },
    { value: '기타', label: '기타' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'selectedIndustry') {
      setSelectedIndustry(value);
      setIsOtherIndustry(value === '기타');
      
      if (value !== '기타') {
        setFormData(prev => ({ ...prev, mainIndustry: value }));
      }
      return;
    }

    if (name === 'customIndustry') {
      setCustomIndustry(value);
      setFormData(prev => ({ ...prev, mainIndustry: value }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? Number(value) 
        : type === 'radio'
          ? value === 'true'
          : value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedIndustry) {
        newErrors.mainIndustry = '업종을 선택해주세요.';
      } else if (isOtherIndustry && !customIndustry.trim()) {
        newErrors.mainIndustry = '기타 업종을 입력해주세요.';
      }
      
      if (!formData.customerRegion.trim()) newErrors.customerRegion = '사업장 소재지(지역)를 입력해주세요.';
      if (!formData.startDate) newErrors.startDate = '사업 시작일을 선택해주세요.';
      if (formData.employeeCount < 0) newErrors.employeeCount = '직원 수를 입력해주세요.';
    }

    if (step === 2) {
      if (formData.annualRevenue < 0) newErrors.annualRevenue = '연매출을 입력해주세요.';
      if (formData.loan < 0) newErrors.loan = '일반 대출 총액을 입력해주세요.';
      if (formData.guaranteeLoan < 0) newErrors.guaranteeLoan = '보증 대출 총액을 입력해주세요.';
      if (formData.credit <= 0 || formData.credit > 1000) {
        newErrors.credit = '올바른 NICE 신용점수를 입력해주세요 (1~1000).';
      }
    }

    if (step === 3) {
      if (!formData.fundPurpose) newErrors.fundPurpose = '자금 목적을 선택해주세요.';
      if (!formData.customerName.trim()) newErrors.customerName = '성함을 입력해주세요.';
      if (!formData.customerPhone.trim()) {
        newErrors.customerPhone = '연락처를 입력해주세요.';
      } else if (!/^\d{10,11}$/.test(formData.customerPhone)) {
        newErrors.customerPhone = '올바른 연락처 형식이 아닙니다. (예: 01000000000)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (step: number) => {
    if (validateStep(step)) {
      setActiveStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation for all steps just in case
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);
    
    if (!isStep1Valid) {
      setActiveStep(1);
      return;
    }
    if (!isStep2Valid) {
      setActiveStep(2);
      return;
    }
    if (!isStep3Valid) {
      setActiveStep(3);
      return;
    }

    if (!agreedToPrivacy) {
      setErrors(prev => ({ ...prev, privacy: '개인정보 수집 및 이용에 동의해주세요.' }));
      return;
    }
    
    const {
      customerName,
      customerPhone,
      customerRegion,
      customerConcern,
      businessNumber,
      businessName,
      mainIndustry,
      subIndustry,
      businessDescription,
      annualRevenue,
      loan,
      guaranteeLoan,
      credit,
      startDate,
      employeeCount,
      fundPurpose,
      hasDelinquency,
      hasTaxArrears,
    } = formData;

    const finalInput: UserInput = {
      customerName,
      customerPhone,
      customerRegion,
      customerConcern,
      businessNumber,
      businessName,
      mainIndustry: isOtherIndustry ? customIndustry : mainIndustry,
      subIndustry,
      businessDescription,
      annualRevenue,
      loan,
      guaranteeLoan,
      credit,
      startDate,
      employeeCount,
      fundPurpose,
      hasDelinquency,
      hasTaxArrears,
    };

    onSubmit(finalInput);
  };

  const progress = activeStep === 1 ? 33 : activeStep === 2 ? 66 : 100;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto px-5 pt-28 pb-20"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> 뒤로가기
      </button>

      <div className="mb-10 sticky top-20 bg-white/80 backdrop-blur-md z-30 py-4 -mx-5 px-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">진행률 {Math.round(progress)}%</span>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">STEP {activeStep} / 3</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-blue-600"
          />
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-black mb-4 tracking-tight">정책자금 진단 정보 입력</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          사장님의 현재 상황을 정확히 입력해주시면, <br />
          현재 조건 기준으로 가능한 정책자금 방향을 분석해드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="space-y-6 border-2 border-blue-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" /> STEP 1. 사업 기본 정보
                  </h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">필수</span>
                </div>

                <div className="space-y-6">
                  {/* 업종 영역 */}
                  <div className="space-y-4">
                    <InputField 
                      label="주 업종" 
                      name="selectedIndustry" 
                      type="select"
                      placeholder="주 업종을 선택해주세요" 
                      value={selectedIndustry} 
                      onChange={handleChange} 
                      required 
                      icon={Building2}
                      options={industryOptions}
                      error={errors.mainIndustry}
                    />

                    {isOtherIndustry && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <InputField 
                          label="기타 업종 직접 입력" 
                          name="customIndustry" 
                          placeholder="예: 특수 기계 제조업" 
                          value={customIndustry} 
                          onChange={handleChange} 
                          required 
                          error={errors.mainIndustry}
                        />
                      </motion.div>
                    )}

                    <InputField 
                      label="부 업종 (혼합형인 경우)" 
                      name="subIndustry" 
                      type="select"
                      placeholder="부 업종을 선택해주세요 (해당 시)" 
                      value={formData.subIndustry} 
                      onChange={handleChange} 
                      icon={Plus}
                      options={subIndustryOptions}
                    />

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-blue-700 font-medium leading-relaxed">
                          <p className="font-bold mb-1">주 업종과 성격이 다른 사업을 함께 운영하는 경우 선택해주세요</p>
                          <p className="opacity-70">(단순 메뉴 확장은 혼합형이 아닙니다)</p>
                        </div>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg text-[11px] text-slate-500 space-y-1">
                        <p className="font-bold text-slate-600 mb-1">예시:</p>
                        <p>• 음식점 + 온라인 판매</p>
                        <p>• 오프라인 매장 + 스마트스토어</p>
                        <p>• 제조 + 도소매 유통</p>
                        <p>• 서비스업 + 상품 판매</p>
                        <p className="mt-2 font-bold text-blue-600">주 업종 / 부 업종을 간단히 입력해주세요</p>
                      </div>
                      <InputField 
                        label="사업 내용 상세 설명" 
                        name="businessDescription" 
                        type="textarea"
                        placeholder="예: 한식당 운영 및 밀키트 온라인 판매" 
                        value={formData.businessDescription} 
                        onChange={handleChange} 
                        required
                      />
                    </div>
                  </div>

                  {/* 사업 정보 영역 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      label="사업 시작일" 
                      name="startDate" 
                      type="date" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      required 
                      icon={Calendar}
                      helpText="사업자등록증상의 개업일을 입력해주세요"
                      error={errors.startDate}
                    />
                    <InputField 
                      label="4대보험 직원수" 
                      name="employeeCount" 
                      type="number" 
                      placeholder="0" 
                      value={formData.employeeCount} 
                      onChange={handleChange} 
                      required 
                      icon={Users}
                      helpText="현재 기준 직원 수를 입력해주세요"
                      error={errors.employeeCount}
                    />
                  </div>

                  <InputField 
                    label="사업장 소재지 (지역)" 
                    name="customerRegion" 
                    placeholder="예: 서울시 강남구" 
                    value={formData.customerRegion} 
                    onChange={handleChange} 
                    required 
                    icon={MapPin}
                    error={errors.customerRegion}
                  />
                </div>
                
                <Button 
                  type="button" 
                  variant="primary" 
                  className="w-full py-4 mt-4"
                  onClick={() => handleNextStep(1)}
                >
                  다음 단계로 (2/3) <ArrowRight className="w-5 h-5" />
                </Button>
              </Card>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="space-y-6 border-2 border-blue-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> STEP 2. 재무 및 신용 정보
                  </h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">필수</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField 
                    label="연매출 (만원)" 
                    name="annualRevenue" 
                    type="number" 
                    placeholder="0" 
                    value={formData.annualRevenue} 
                    onChange={handleChange} 
                    required 
                    icon={TrendingUp}
                    helpText="최근 1년 기준 매출액을 입력해주세요"
                    error={errors.annualRevenue}
                  />
                  <InputField 
                    label="일반 대출 총액 (만원)" 
                    name="loan" 
                    type="number" 
                    placeholder="0" 
                    value={formData.loan} 
                    onChange={handleChange} 
                    required 
                    icon={CreditCard}
                    helpText="보증대출을 제외한 일반 대출 총액을 입력해주세요"
                    error={errors.loan}
                  />
                  <InputField 
                    label="보증 대출 총액 (만원)" 
                    name="guaranteeLoan" 
                    type="number" 
                    placeholder="0" 
                    value={formData.guaranteeLoan} 
                    onChange={handleChange} 
                    required 
                    icon={ShieldCheck}
                    helpText="보증재단 / 신보 / 기보 등 보증부 대출 총액을 입력해주세요"
                    error={errors.guaranteeLoan}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField 
                    label="NICE 신용점수" 
                    name="credit" 
                    type="number" 
                    placeholder="0" 
                    value={formData.credit} 
                    onChange={handleChange} 
                    required 
                    icon={ShieldCheck}
                    helpText="NICE 기준 신용점수를 입력해주세요"
                    error={errors.credit}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      현재 연체 여부 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {[false, true].map(option => (
                        <label key={option.toString()} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.hasDelinquency === option ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-500'}`}>
                          <input 
                            type="radio" 
                            name="hasDelinquency" 
                            value={option.toString()} 
                            checked={formData.hasDelinquency === option} 
                            onChange={handleChange} 
                            className="hidden"
                          />
                          <span className="font-bold">{option === false ? '없음' : '있음'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      세금 체납 여부 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {[false, true].map(option => (
                        <label key={option.toString()} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.hasTaxArrears === option ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-500'}`}>
                          <input 
                            type="radio" 
                            name="hasTaxArrears" 
                            value={option.toString()} 
                            checked={formData.hasTaxArrears === option} 
                            onChange={handleChange} 
                            className="hidden"
                          />
                          <span className="font-bold">{option === false ? '없음' : '있음'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-4"
                    onClick={handlePrevStep}
                  >
                    이전 단계로
                  </Button>
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="flex-[2] py-4"
                    onClick={() => handleNextStep(2)}
                  >
                    다음 단계로 (3/3) <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Card className="space-y-6 border-2 border-blue-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" /> STEP 3. 자금 목적 + 상담 정보
                  </h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">필수</span>
                </div>
                
                <div className="space-y-6">
                  <InputField 
                    label="자금 목적" 
                    name="fundPurpose" 
                    type="select"
                    placeholder="자금 목적을 선택해주세요" 
                    value={formData.fundPurpose} 
                    onChange={handleChange} 
                    required 
                    icon={CircleDollarSign}
                    options={purposeOptions}
                    error={errors.fundPurpose}
                  />

                  <InputField 
                    label="현재 자금 고민 (선택)" 
                    name="customerConcern" 
                    type="textarea" 
                    placeholder="운전자금 / 시설자금 / 대환 / 확장 등 간단히 입력해주세요" 
                    value={formData.customerConcern} 
                    onChange={handleChange} 
                    icon={HelpCircle}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InputField 
                        label="이름" 
                        name="customerName" 
                        placeholder="홍길동" 
                        value={formData.customerName} 
                        onChange={handleChange} 
                        required 
                        icon={User}
                        error={errors.customerName}
                      />
                      <InputField 
                        label="전화번호" 
                        name="customerPhone" 
                        placeholder="01000000000" 
                        value={formData.customerPhone} 
                        onChange={handleChange} 
                        required 
                        icon={Phone}
                        error={errors.customerPhone}
                      />
                      <p className="text-xs text-slate-400 font-medium bg-slate-50 p-2 rounded border border-slate-100">
                        💡 무료상담 진행 시 필요한 정보입니다
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border-2 transition-all ${errors.privacy ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreedToPrivacy} 
                      onChange={(e) => {
                        setAgreedToPrivacy(e.target.checked);
                        if (errors.privacy) setErrors(prev => {
                          const n = {...prev};
                          delete n.privacy;
                          return n;
                        });
                      }}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-sm">
                      <p className="font-bold text-slate-700">개인정보 수집 및 이용 동의 (필수)</p>
                      <div className="text-slate-500 mt-1 leading-relaxed space-y-1">
                        <p>정확한 진단 결과 안내를 위해 성함, 연락처, 사업 정보를 입력받고 있습니다.</p>
                        <p>해당 정보는 정책자금 진단 및 안내에만 사용되며, 다른 용도로는 절대 활용되지 않습니다.</p>
                      </div>
                    </div>
                  </label>
                  {errors.privacy && <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.privacy}</p>}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-6"
                    onClick={handlePrevStep}
                  >
                    이전 단계로
                  </Button>
                  <Button type="submit" variant="primary" className="flex-[2] py-6 text-xl shadow-xl shadow-blue-200">
                    진단 결과 확인하기 <Sparkles className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

const ResultView = ({ 
  result, 
  onReset,
  onViewDocuments
}: { 
  result: DiagnosisResult; 
  onReset: () => void;
  onViewDocuments: () => void;
  key?: React.Key;
}) => {
  const KAKAO_CHAT_URL = "https://open.kakao.com/o/sLNIRemi";
  const reportId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const statusLabels = {
    ELIGIBLE: "진행 가능",
    CONDITIONAL: "조건부 검토",
    REVIEW_REQUIRED: "추가 검토 필요",
    TEMP_INELIGIBLE: "현재 진행 어려움"
  };

  const statusColors = {
    ELIGIBLE: "bg-emerald-500",
    CONDITIONAL: "bg-orange-500",
    REVIEW_REQUIRED: "bg-blue-500",
    TEMP_INELIGIBLE: "bg-red-500"
  };

  const statusBg = {
    ELIGIBLE: "bg-emerald-50",
    CONDITIONAL: "bg-orange-50",
    REVIEW_REQUIRED: "bg-blue-50",
    TEMP_INELIGIBLE: "bg-red-50"
  };

  const [copySuccess, setCopySuccess] = useState(false);

  const handleConsultation = () => {
    window.open(KAKAO_CHAT_URL);
  };

  const handleCopyConsultation = async () => {
    const message = result?.consultationSummary || `금융노트 상담 요청드립니다`;
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const ConsultationSection = () => (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> 상담용 요약 정보
          </h4>
          {copySuccess && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded animate-bounce">
              복사 완료!
            </span>
          )}
        </div>
        <pre className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
          {result?.consultationSummary}
        </pre>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <Button 
          variant="outline" 
          className="py-6 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 font-black"
          onClick={handleCopyConsultation}
        >
          <Copy className="w-5 h-5" /> 상담 내용 복사하기
        </Button>
        <Button 
          variant="cta" 
          className="py-6 text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 font-black"
          onClick={handleConsultation}
        >
          <MessageCircle className="w-5 h-5" /> 오픈채팅으로 이동하기
        </Button>
      </div>
      
      <p className="text-blue-600 text-sm font-black animate-pulse">
        "오픈채팅 입장 후 방금 복사한 내용을 붙여넣어 주세요"
      </p>
      
      <p className="text-slate-400 text-[10px] font-bold flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3" /> 사장님의 소중한 정보는 상담 목적으로만 사용됩니다
      </p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="max-w-3xl mx-auto px-5 pt-28 pb-20"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI 정책자금 진단 시스템</span>
        </div>
        <div className="flex gap-4">
          <div className="text-xs font-bold text-slate-400">보고서 번호: {reportId}</div>
          <div className="text-xs font-bold text-slate-400">진단 일자: {today}</div>
        </div>
      </div>

      <div className="text-center mb-12">
        <p className="text-xs text-slate-400 font-bold mb-4">
          ※ 본 결과는 입력 정보 기준 사전 진단이며, 실제 심사 결과와는 다를 수 있습니다.
        </p>
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-black mb-6 shadow-lg ${statusColors[result?.status || 'TEMP_INELIGIBLE']}`}>
          {statusLabels[result?.status || 'TEMP_INELIGIBLE']}
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">사장님의 정책자금 진단 리포트</h2>
        <p className="text-slate-500 font-bold mb-8">{result?.statusMessage}</p>
        
        <div className={`p-6 rounded-2xl text-left border ${statusBg[result?.status || 'TEMP_INELIGIBLE']} border-current/10 mb-8`}>
          <h3 className="text-sm font-black opacity-60 uppercase tracking-wider mb-2">판단 사유</h3>
          <p className="font-bold text-lg leading-relaxed text-slate-900">
            {result?.statusReason || '진단 정보를 불러올 수 없습니다.'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 mb-12 text-left border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4" /> 입력 정보 요약
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1 font-bold">업종</p>
              <p className="font-black text-slate-700">{result?.crmData?.mainIndustry || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">세부업종</p>
              <p className="font-black text-slate-700">{result?.crmData?.subIndustry && result?.crmData?.subIndustry !== 'none' ? result?.crmData?.subIndustry : '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">연매출</p>
              <p className="font-black text-slate-700">{(result?.crmData?.annualRevenue || 0).toLocaleString()}만원</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">일반 대출</p>
              <p className="font-black text-slate-700">{(result?.crmData?.loan || 0).toLocaleString()}만원</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">보증 대출</p>
              <p className="font-black text-slate-700">{(result?.crmData?.guaranteeLoan || 0).toLocaleString()}만원</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">NICE 신용점수</p>
              <p className="font-black text-slate-700">{result?.crmData?.credit || '0'}점</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">사업 시작일</p>
              <p className="font-black text-slate-700">{result?.crmData?.startDate || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">직원 수</p>
              <p className="font-black text-slate-700">{result?.crmData?.employeeCount || '0'}명</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">자금 목적</p>
              <p className="font-black text-slate-700">{result?.crmData?.fundPurpose || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1 font-bold">지역</p>
              <p className="font-black text-slate-700">{result?.crmData?.customerRegion || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 mb-1 font-bold">현재 자금 고민</p>
              <p className="font-black text-slate-700 leading-relaxed">{result?.crmData?.customerConcern || '없음'}</p>
            </div>
          </div>
        </div>

        {/* 🔥 1차 상담 유도 섹션 (핵심 위치) */}
        <div className="mb-12">
          <ConsultationSection />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2 text-blue-600">
            <TrendingUp className="w-6 h-6" /> 추천 진행 순서
          </h3>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
            <p className="font-bold text-blue-800">{result?.direction || '진단 방향 정보 없음'}</p>
          </div>
          <ul className="space-y-3">
            {(result?.executionOrder || []).map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 font-bold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-blue-600 mr-2">{idx + 1}순위</span>
                {step}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2 text-blue-600">
            <Building2 className="w-6 h-6" /> 예상 가능한 기관
          </h3>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4 space-y-3">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">현실적 가능 범위</p>
              <p className="font-black text-emerald-800 text-xl">{result?.realisticRange || '상담 후 확인 가능'}</p>
            </div>
            <div className="pt-3 border-t border-emerald-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">보수적 최대</p>
                <p className="font-bold text-slate-600 text-sm">{result?.conservativeMax || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">산출 기준</p>
                <p className="text-[11px] font-bold text-slate-500 leading-tight">{result?.calculationBasis || '단일 기관 기준'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black text-slate-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 우선 검토 기관
              </p>
              <ul className="space-y-2">
                {(result?.primaryInstitutions || []).map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-bold text-slate-700 text-sm">
                    <span className="text-blue-500">•</span>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-xs font-black text-slate-400 mb-2 flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-400" /> 추가 검토 가능 기관
              </p>
              <ul className="space-y-2">
                {(result?.secondaryInstitutions || []).map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-bold text-slate-500 text-sm italic">
                    <span className="text-slate-300">•</span>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* 금융노트의 약속 */}
      <div className="mb-12 p-8 rounded-3xl bg-emerald-50 border border-emerald-100 text-center">
        <h3 className="text-xl font-black text-emerald-900 mb-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> 금융노트의 약속
        </h3>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-sm">NO</div>
            <span className="font-black text-emerald-800 text-lg">착수금 없음</span>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-sm">NO</div>
            <span className="font-black text-emerald-800 text-lg">성공보수 없음</span>
          </div>
        </div>
        <p className="text-emerald-700 font-bold leading-relaxed">
          금융노트는 어떠한 수수료도 요구하지 않는 <br className="sm:hidden" />
          투명한 서비스를 지향합니다
        </p>
      </div>

      <div className="mb-12 p-8 rounded-3xl bg-blue-50 border border-blue-100 text-center">
        <h3 className="text-xl font-black text-blue-900 mb-2">필요서류 안내</h3>
        <p className="text-blue-600 font-bold mb-6">
          필요서류는 필요서류 알아보기를 통해 확인하세요
        </p>
        <Button 
          variant="outline" 
          className="w-full py-4 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
          onClick={onViewDocuments}
        >
          <FileText className="w-5 h-5" /> 필요서류 알아보기
        </Button>
      </div>

      <div className="mb-12 p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center">
        <div className="space-y-6 mb-10">
          <p className="text-slate-600 font-bold leading-relaxed">
            위 결과는 사장님의 현재 조건 기준으로 정리된 방향입니다
          </p>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-left shadow-sm">
            <p className="text-slate-900 font-black mb-4">하지만 실제 신청 과정에서는</p>
            <ul className="space-y-3 text-slate-600 font-bold">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> 기관 선택 / 신청 순서 / 서류 준비
              </li>
            </ul>
            <p className="mt-4 text-slate-900 font-black">이 부분에서 막히는 경우가 많습니다</p>
          </div>
          <p className="text-slate-800 text-lg font-black leading-relaxed">
            혼자 진행이 어렵다면 <br />
            무료 상담을 통해 방향을 잡아보세요
          </p>
        </div>

        <div className="space-y-4">
          <ConsultationSection />
        </div>
      </div>

      <Card className="mb-12 bg-slate-50 border-none">
        <h3 className="text-xl font-black flex items-center gap-2 text-slate-800 mb-4">
          <Info className="w-6 h-6 text-blue-500" /> 추가 참고사항
        </h3>
        <ul className="space-y-3">
          {result.notes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2 font-bold text-slate-600">
              <span className="text-blue-500 mt-0.5">•</span>
              {note}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-12 bg-slate-50 border-none">
        <h3 className="text-xl font-black flex items-center gap-2 text-slate-800 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-500" /> 유의사항
        </h3>
        <ul className="space-y-3">
          {result.precautions.map((pre, idx) => (
            <li key={idx} className="text-slate-500 font-medium text-sm leading-relaxed flex gap-2">
              <span className="text-orange-500">•</span>
              {pre}
            </li>
          ))}
        </ul>
      </Card>

      <div className="p-6 rounded-2xl bg-slate-900 text-white mb-12">
        <div className="flex items-center gap-2 mb-4 text-orange-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-black">법적 고지 및 책임 제한</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          본 진단 리포트는 입력하신 정보를 바탕으로 한 알고리즘 분석 결과이며, 실제 금융기관의 심사 결과와 다를 수 있습니다. 
          금융노트는 정책자금 매칭 서비스를 무료로 제공하며, 어떠한 경우에도 대출 승인을 보장하거나 부당한 수수료를 요구하지 않습니다. 
          최종 신청 전 반드시 해당 기관의 공식 공고를 확인하시기 바랍니다.
        </p>
      </div>

      {/* 🔥 최하단 CTA (마무리 클로징) */}
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <p className="text-xl font-black text-slate-900">
            지금 바로 시작하면
          </p>
          <p className="text-slate-500 font-bold">
            가장 가능성 높은 순서부터 안내받을 수 있습니다
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="cta" 
            className="text-xl px-12 py-6 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200"
            onClick={handleConsultation}
          >
            <MessageCircle className="w-6 h-6" /> 무료 상담 받기
          </Button>
          <Button 
            variant="ghost" 
            className="text-lg px-10 py-6 text-slate-400 hover:text-slate-600"
            onClick={onReset}
          >
            다시 진단하기
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const DocumentsView = ({ 
  onBack
}: { 
  onBack: () => void;
  key?: React.Key;
}) => {
  const [activeTab, setActiveTab] = useState<'semas_direct' | 'semas_indirect' | 'local_guarantee'>('semas_direct');
  const [copyStatus, setCopyStatus] = useState<boolean>(false);

  const tabs = [
    { id: 'semas_direct', label: '소상공인시장진흥공단 직접대출' },
    { id: 'semas_indirect', label: '소상공인시장진흥공단 대리대출' },
    { id: 'local_guarantee', label: '지역신용보증재단' }
  ] as const;

  const documentData = {
    semas_direct: {
      sections: [
        {
          title: "■ 기본서류",
          items: [
            "사업자등록증 또는 사업자등록증명 (필수)",
            "대표자 신분증 (필수)",
            "국세 완납증명서 (필수)(핵심)",
            "지방세 완납증명서 (필수)(핵심)",
            "부가가치세 과세표준증명 또는 수입금액증명 (필수)(핵심)",
            "매출증빙자료 (카드, 현금영수증, 세금계산서 등) (필수)(핵심)",
            "사업장 임대차계약서 (필수)",
            "통장사본 (필수)"
          ]
        },
        {
          title: "■ 핵심 검토서류",
          items: [
            "사업계획서 또는 자금사용계획서 (핵심)",
            "사업장 사진자료 (내부/외부/설비) (핵심)",
            "사업자 통장 거래내역 (핵심)",
            "거래명세서 또는 매입·매출 흐름자료 (핵심)",
            "직원현황 또는 4대보험 가입자 명부 (핵심)",
            "소득금액증명원 (핵심)"
          ]
        },
        {
          title: "■ 추가/상황별 서류",
          items: [
            "온라인 매출자료 (해당시)",
            "통신판매업 신고증 (해당시)",
            "영업신고증 (해당시)",
            "수출 관련 서류 (해당시)"
          ]
        }
      ],
      footer: "※ 법인의 경우 일부 상품만 가능하며 별도 확인 필요",
      ctaTitle: "서류 준비가 막막하신가요?",
      ctaText: "서류는 이 기준으로 준비하시면 됩니다\n다만 진행하다 막히는 구간은 대부분 비슷합니다\n\n특히 방향이 맞는지, 빠진 건 없는지\n이 부분에서 승인 결과가 갈리는 경우가 많습니다\n\n애매한 부분 있으면 그때 기준만 확인하고 가세요",
      ctaButton: "카톡으로 빠르게 확인하기"
    },
    semas_indirect: {
      sections: [
        {
          title: "■ 기본서류",
          items: [
            "사업자등록증 (필수)",
            "대표자 신분증 (필수)",
            "정책자금 확인서 (필수)",
            "국세/지방세 완납증명서 (필수)(핵심)",
            "부가세 과세표준증명 (필수)(핵심)",
            "매출증빙자료 (필수)(핵심)"
          ]
        },
        {
          title: "■ 핵심 검토서류",
          items: [
            "사업계획서 (핵심)",
            "사업장 사진 (핵심)",
            "통장 거래내역 (핵심)",
            "기존 대출 현황 (핵심)"
          ]
        },
        {
          title: "■ 추가/상황별 서류",
          items: [
            "보증기관 요구서류 (해당시)",
            "업종별 인허가증 (해당시)"
          ]
        }
      ],
      ctaTitle: "진행 순서가 헷갈리시나요?",
      ctaText: "대리대출은 서류 준비도 중요하지만\n어디부터 진행할지 순서가 더 중요합니다\n\n순서가 꼬이면 같은 조건이어도\n진행 속도와 결과가 달라질 수 있습니다\n\n헷갈리면 진행 전에 방향만 한번 체크하고 가세요",
      ctaButton: "내 상황 기준으로 확인하기"
    },
    local_guarantee: {
      sections: [
        {
          title: "■ 기본서류",
          items: [
            "사업자등록증 (필수)",
            "대표자 신분증 (필수)",
            "정책자금 확인서 (필수)",
            "국세 완납증명서 (필수)(핵심)",
            "지방세 완납증명서 (필수)(핵심)",
            "부가가치세 과세표준증명 (필수)(핵심)",
            "매출자료 (필수)(핵심)",
            "임대차계약서 (필수)"
          ]
        },
        {
          title: "■ 핵심 검토서류",
          items: [
            "사업계획서 (핵심)",
            "사업장 사진 (핵심)",
            "통장 거래내역 (핵심)",
            "소득금액증명원 (핵심)",
            "기존 대출 및 보증현황 (핵심)",
            "거주지 임대차계약서 (핵심)(해당시)"
          ]
        },
        {
          title: "■ 법인 추가",
          items: [
            "법인등기부등본 (필수)(핵심)",
            "주주명부 (필수)(핵심)",
            "재무제표 (필수)(핵심)",
            "법인 인감증명서 (필수)"
          ]
        },
        {
          title: "■ 추가/상황별 서류",
          items: [
            "온라인 매출자료 (해당시)",
            "통신판매업 신고증 (해당시)",
            "영업신고증 (해당시)",
            "제조업 관련 서류 (해당시)"
          ]
        }
      ],
      ctaTitle: "보증재단 진행이 애매하신가요?",
      ctaText: "보증재단은 서류 자체보다\n어떤 흐름으로 설명하느냐가 더 중요합니다\n\n같은 자료로도 결과가 달라지는 이유가\n대부분 이 부분에서 갈립니다\n\n애매하면 혼자 판단하지 말고\n기준만 한번 확인하고 가세요",
      ctaButton: "카톡으로 확인하기"
    }
  };

  const handleCopyAll = async () => {
    const currentData = documentData[activeTab];
    const tabLabel = tabs.find(t => t.id === activeTab)?.label;
    
    let textToCopy = `[${tabLabel} 필요서류 리스트]\n\n`;
    
    currentData.sections.forEach(section => {
      textToCopy += `${section.title}\n`;
      section.items.forEach(item => {
        textToCopy += `- ${item}\n`;
      });
      textToCopy += '\n';
    });
    
    if ('footer' in currentData && currentData.footer) {
      textToCopy += `${currentData.footer}\n`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const renderTag = (item: string) => {
    const tags = [];
    if (item.includes('(필수)')) tags.push({ text: '필수', color: 'bg-red-50 text-red-600 border-red-100' });
    if (item.includes('(핵심)')) tags.push({ text: '핵심', color: 'bg-blue-50 text-blue-600 border-blue-100' });
    if (item.includes('(해당시)')) tags.push({ text: '해당시', color: 'bg-slate-100 text-slate-600 border-slate-200' });
    
    const cleanText = item.replace(/\(필수\)|\(핵심\)|\(해당시\)/g, '').trim();

    return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
        <span className="text-sm font-bold text-slate-700 leading-tight">{cleanText}</span>
        <div className="flex gap-1 shrink-0">
          {tags.map((tag, i) => (
            <span key={i} className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${tag.color}`}>
              {tag.text}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-slate-50 pt-24 pb-20 px-5"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <button 
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
            정책자금 필요서류 안내
          </h1>
          <p className="text-slate-600 font-bold leading-relaxed">
            정책자금 신청 시 필요한 서류를 기관별로 정리했습니다.<br />
            아래에서 확인 후 한 번에 복사해서 준비할 수 있습니다.
          </p>
        </div>

        {/* Guidance Box */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-10">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs font-bold text-blue-800 leading-relaxed">
                ※ 실제 필요서류는 기관, 상품, 업종, 개인/법인 여부에 따라 달라질 수 있습니다
              </p>
              <p className="text-xs font-bold text-blue-800 leading-relaxed">
                ※ 기본서류 제출 후 담당자 판단에 따라 추가서류가 발생할 수 있습니다
              </p>
              <p className="text-xs font-bold text-blue-800 leading-relaxed">
                ※ 같은 기관이라도 지점 및 심사관에 따라 요구서류가 달라질 수 있습니다
              </p>
              <p className="text-xs font-bold text-blue-800 leading-relaxed">
                ※ 재단 또는 기관 방문 일정이 잡힌 경우, 방문 전 필수서류를 반드시 다시 확인하시기 바랍니다
              </p>
              <p className="text-xs font-bold text-blue-800 leading-relaxed">
                ※ 처음부터 정확하게 준비하려면 전문가 상담을 통해 진행하는 것이 효율적입니다
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex p-1 bg-slate-200/50 rounded-xl overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] py-3 px-4 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Copy All Button */}
          <button 
            onClick={handleCopyAll}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black transition-all shadow-lg ${
              copyStatus 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
            }`}
          >
            {copyStatus ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copyStatus ? '전체 서류 복사 완료' : '전체 서류 한 번에 복사하기'}
          </button>
        </div>

        {/* Document Content */}
        <div className="space-y-6">
          {documentData[activeTab].sections.map((section, sIdx) => (
            <div key={sIdx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="font-black text-slate-800">{section.title}</h3>
              </div>
              <div className="p-6">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx}>
                    {renderTag(item)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {'footer' in documentData[activeTab] && (
            <p className="text-center text-xs font-bold text-slate-400 py-4">
              {documentData[activeTab].footer}
            </p>
          )}
        </div>

        {/* Expert CTA */}
        <div className="mt-16 p-8 bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-4 tracking-tight">
              {documentData[activeTab].ctaTitle}
            </h3>
            <div className="text-blue-100/80 text-sm font-bold leading-relaxed mb-8 whitespace-pre-line">
              {documentData[activeTab].ctaText}
            </div>
            <Button 
              variant="cta" 
              className="w-full py-4 text-lg shadow-2xl shadow-orange-500/20"
              onClick={() => window.open('https://open.kakao.com/o/sLNIRemi', '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              {documentData[activeTab].ctaButton}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<AppState>('landing');
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Popup logic
  useEffect(() => {
    if (view === 'landing') {
      // Check if user opted out for 24 hours
      const hideUntil = localStorage.getItem('hideCostPopupUntil');
      if (hideUntil) {
        const expiry = parseInt(hideUntil, 10);
        if (new Date().getTime() < expiry) {
          return; // Still within 24 hours
        }
      }

      const timer = setTimeout(() => {
        setIsPopupOpen(true);
      }, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleStart = () => setView('form');
  const handleBack = () => setView('landing');
  const handleViewDocuments = () => setView('documents');
  const handleBackToResult = () => {
    if (diagnosisResult) {
      setView('result');
    } else {
      setView('landing');
    }
  };
  
  const handleFormSubmit = (data: UserInput) => {
    const result = runEngine(data);
    setDiagnosisResult(result);
    setView('result');
    
    // Clear saved data after successful submission
    localStorage.removeItem('financeNoteData');
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation - Only show on non-landing views */}
      {view !== 'landing' && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-blue-600">금융노트</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setView('landing')} className="text-sm font-bold text-slate-600 hover:text-blue-600">서비스소개</button>
              <Button variant="primary" className="py-2 px-5 text-sm" onClick={handleStart}>
                무료 진단하기
              </Button>
            </div>
          </div>
        </nav>
      )}

      <main>
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <>
              <LandingView 
                key="landing" 
                onStart={handleStart} 
                onViewDocuments={handleViewDocuments}
                onViewSchedule={() => alert('신청일정 페이지는 준비 중입니다.')}
              />
              <CostComparisonPopup 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)} 
                onStart={handleStart} 
              />
            </>
          )}
          {view === 'form' && <DiagnosisFormView key="form" onBack={handleBack} onSubmit={handleFormSubmit} />}
          {view === 'result' && diagnosisResult && (
            <ResultView 
              key="result" 
              result={diagnosisResult} 
              onReset={() => setView('landing')} 
              onViewDocuments={handleViewDocuments}
            />
          )}
          {view === 'documents' && (
            <DocumentsView key="documents" onBack={handleBackToResult} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer - Only show on non-landing views */}
      {view !== 'landing' && (
        <footer className="bg-slate-50 py-16 px-5 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="text-white w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-blue-600">금융노트</span>
                </div>
                <p className="max-w-xs leading-relaxed font-bold text-slate-500">
                  사장님의 상황을 가장 잘 이해하는 <br />소상공인 정책자금 전문 파트너
                </p>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="text-slate-900 font-black mb-6">서비스</h4>
                  <ul className="space-y-4 text-sm font-bold text-slate-500">
                    <li><button onClick={() => setView('landing')} className="hover:text-blue-600 transition-colors">홈</button></li>
                    <li><button onClick={handleStart} className="hover:text-blue-600 transition-colors">무료 진단</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-slate-900 font-black mb-6">고객지원</h4>
                  <ul className="space-y-4 text-sm font-bold text-slate-500">
                    <li><a href="#" className="hover:text-blue-600 transition-colors">카톡 상담</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">이용약관</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
              <p>© 2026 금융노트. All Rights Reserved.</p>
              <p>사업자등록번호: 000-00-00000 | 대표: 홍길동 | 주소: 서울특별시 강남구 테헤란로</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
