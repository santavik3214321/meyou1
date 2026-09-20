import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Coffee, Croissant, Send, Heart, X, LogOut, Music, Pause, Play } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// ─── Firebase ────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCbq9rNbN3IPOE9jiGeYD8Cja_5qakFvmg",
  authDomain: "our-caf.firebaseapp.com",
  databaseURL: "https://our-caf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "our-caf",
  storageBucket: "our-caf.firebasestorage.app",
  messagingSenderId: "746854342346",
  appId: "1:746854342346:web:5964827546fde5e9bc9e33"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tableRef = ref(db, 'cafe-table-2026');
const PASSWORDS = {
  sv: '44',
  vika: '4',
};

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Звёздное небо
// ═══════════════════════════════════════════════════════════
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 55}%`,
      size: 1.5 + Math.random() * 2.5,
      delay: `${Math.random() * 4}s`,
      duration: `${2 + Math.random() * 3}s`,
    })), []);

  return (
    <>
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white" style={{
          left: s.left, top: s.top,
          width: `${s.size}px`, height: `${s.size}px`,
          animation: `twinkle ${s.duration} ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Луна
// ═══════════════════════════════════════════════════════════
function Moon() {
  return (
    <div className="absolute" style={{
      top: '8%', right: '12%',
      width: '80px', height: '80px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #ffeebb, #ffd67a)',
      boxShadow: '0 0 40px rgba(255,220,150,0.25), 0 0 80px rgba(255,200,100,0.15), 0 0 120px rgba(255,180,50,0.08)',
      opacity: 0.9,
    }} />
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Дождь
// ═══════════════════════════════════════════════════════════
function Rain() {
  const drops = useMemo(() =>
    Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      height: `${10 + Math.random() * 18}px`,
      duration: `${0.5 + Math.random() * 0.7}s`,
      delay: `${Math.random() * 3}s`,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map(d => (
        <div key={d.id} className="rain-drop" style={{
          left: d.left,
          height: d.height,
          animationDuration: d.duration,
          animationDelay: d.delay,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Светлячки
// ═══════════════════════════════════════════════════════════
function Fireflies() {
  const flies = useMemo(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      bottom: `${Math.random() * 20}%`,
      size: 3 + Math.random() * 4,
      duration: `${8 + Math.random() * 10}s`,
      delay: `${Math.random() * 8}s`,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flies.map(f => (
        <div key={f.id} className="firefly" style={{
          left: f.left, bottom: f.bottom,
          width: `${f.size}px`, height: `${f.size}px`,
          boxShadow: `0 0 ${f.size * 2}px ${f.size}px rgba(255,220,150,0.4)`,
          animationDuration: f.duration,
          animationDelay: f.delay,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Гирлянда огней
// ═══════════════════════════════════════════════════════════
function StringLights() {
  const lights = useMemo(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${5 + i * 10}%`,
      delay: `${i * 0.3}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: i % 3 === 0
        ? 'rgba(255,180,60,0.9)'
        : i % 3 === 1
          ? 'rgba(255,150,50,0.85)'
          : 'rgba(255,200,100,0.9)',
    })), []);

  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10">
      {/* Провод */}
      <svg className="absolute top-3 left-0 w-full h-10 opacity-30" preserveAspectRatio="none">
        <path d="M0,15 Q10%,25 20%,18 Q30%,10 40%,20 Q50%,28 60%,15 Q70%,8 80%,22 Q90%,30 100%,12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      </svg>
      {lights.map(l => (
        <div key={l.id} className="absolute" style={{
          left: l.left,
          top: `${14 + Math.sin(l.id * 0.8) * 8}px`,
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: l.color,
          boxShadow: `0 0 12px 4px ${l.color.replace('0.9', '0.5').replace('0.85', '0.5')}`,
          animation: `glow-pulse ${l.duration} ease-in-out infinite`,
          animationDelay: l.delay,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Пар от кофе (5 волн)
// ═══════════════════════════════════════════════════════════
function Steam() {
  const wisps = [
    { w: 3, h: 35, dur: '3s', delay: '0s', left: '35%' },
    { w: 4, h: 45, dur: '3.5s', delay: '0.8s', left: '45%' },
    { w: 3, h: 30, dur: '2.8s', delay: '1.5s', left: '55%' },
    { w: 5, h: 50, dur: '4s', delay: '0.3s', left: '50%' },
    { w: 3, h: 38, dur: '3.2s', delay: '2s', left: '40%' },
  ];
  return (
    <div className="absolute -top-12 left-0 right-0 h-16 pointer-events-none">
      {wisps.map((w, i) => (
        <div key={i} className="steam-wisp" style={{
          left: w.left, bottom: 0,
          width: `${w.w}px`, height: `${w.h}px`,
          animationDuration: w.dur,
          animationDelay: w.delay,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Мини-плеер
// ═══════════════════════════════════════════════════════════
function MiniPlayer({ isPlaying, onToggle }) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer select-none" onClick={onToggle}>
      <div style={{ animation: isPlaying ? 'note-bounce 1s ease-in-out infinite' : 'none' }}>
        <Music size={16} className="text-rose-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[2px] text-white/70 font-medium">Lo-fi & Rain</span>
      </div>
      {isPlaying && (
        <div className="flex items-end gap-[3px] h-4 ml-2">
          <div className="eq-bar h-4" style={{ animationDuration: '0.5s' }} />
          <div className="eq-bar h-4" style={{ animationDuration: '0.7s', animationDelay: '0.1s' }} />
          <div className="eq-bar h-4" style={{ animationDuration: '0.4s', animationDelay: '0.2s' }} />
          <div className="eq-bar h-4" style={{ animationDuration: '0.6s', animationDelay: '0.15s' }} />
        </div>
      )}
      <div className="ml-auto w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
        {isPlaying ? <Pause size={12} className="text-white/80" /> : <Play size={12} className="text-white/80 ml-0.5" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Счётчик времени вместе (по часовому поясу Кемерово, UTC+7)
// ═══════════════════════════════════════════════════════════
function LoveCounter() {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const update = () => {
      // 5 августа 2026, 00:00:00 по часовому поясу Кемерово (UTC+7)
      const start = new Date('2026-08-05T00:00:00+07:00').getTime();
      const diff = Math.max(0, Date.now() - start);
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 select-none shadow-lg border border-white/10">
      <Heart size={12} className="text-rose-400 fill-rose-400 animate-pulse" />
      <div className="flex items-baseline gap-1 text-[11px] sm:text-xs font-semibold text-rose-100">
        <span className="font-heading italic text-rose-200 text-xs sm:text-sm">{time.days}</span>
        <span className="text-white/45 text-[9px] uppercase tracking-wider">дн</span>
        <span className="font-mono text-white/90">{String(time.hours).padStart(2, '0')}</span>
        <span className="text-white/40 text-[9px]">ч</span>
        <span className="font-mono text-white/90">{String(time.mins).padStart(2, '0')}</span>
        <span className="text-white/40 text-[9px]">м</span>
        <span className="font-mono text-rose-300">{String(time.secs).padStart(2, '0')}</span>
        <span className="text-white/40 text-[9px]">с</span>
      </div>
      <span className="text-[8px] uppercase tracking-[1.5px] text-white/35 border-l border-white/10 pl-2">
        Кемерово
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Кружка кофе (вид сверху)
// ═══════════════════════════════════════════════════════════
function CoffeeCup({ onClick, interactive }) {
  return (
    <div onClick={onClick}
      className={`relative transition-transform duration-500 ease-out ${interactive ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-80'}`}
    >
      <Steam />
      {/* Блюдце */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[160px] h-[30px] rounded-[50%] bg-[#f5efe6]"
        style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.6), inset 0 -3px 8px rgba(0,0,0,0.1)' }} />
      {/* Чашка */}
      <div className="relative w-[120px] h-[120px] rounded-full bg-[#e6daca] flex items-center justify-center border-[4px] border-[#fffdfa] z-10"
        style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.7), inset 0 -12px 20px rgba(0,0,0,0.15), inset 0 4px 8px rgba(255,255,255,0.7)' }}>
        {/* Ручка кружки */}
        <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-10 rounded-r-full border-[4px] border-[#e6daca] border-l-0"
          style={{ boxShadow: '3px 3px 8px rgba(0,0,0,0.3)' }} />
        {/* Кофе */}
        <div className="w-[96px] h-[96px] rounded-full bg-[#4a2e1b] flex items-center justify-center overflow-hidden"
          style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7), inset 0 -5px 15px rgba(60,30,10,0.5)' }}>
          {/* Латте-арт сердце */}
          <Heart className="w-9 h-9 text-[#c4a882] opacity-70 -rotate-12" fill="currentColor" />
        </div>
      </div>
      {interactive && (
        <div className="absolute -bottom-10 left-1/2 text-white/40 text-[9px] uppercase tracking-[2px] whitespace-nowrap"
          style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
          нажмите
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Десерт
// ═══════════════════════════════════════════════════════════
function DessertItem({ onClick, interactive }) {
  return (
    <div onClick={onClick}
      className={`relative transition-transform duration-500 ease-out ${interactive ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-80'}`}
    >
      <div className="w-[130px] h-[130px] glass-card rounded-full flex items-center justify-center">
        <Croissant className="w-16 h-16 text-[#d4a373] drop-shadow-lg" strokeWidth={1.2} />
      </div>
      {interactive && (
        <div className="absolute -bottom-8 left-1/2 text-white/40 text-[9px] uppercase tracking-[2px] whitespace-nowrap"
          style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
          нажмите
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// КОМПОНЕНТ: Фон кафе (все слои)
// ═══════════════════════════════════════════════════════════
function CafeBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Небо */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #0a1025 0%, #0f172a 30%, #1e3a5f 70%, #1a2a4a 100%)',
      }} />
      {/* Закатное свечение у горизонта */}
      <div className="absolute bottom-[35%] left-0 right-0 h-[20%]" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,140,50,0.06) 60%, rgba(255,100,30,0.04) 100%)',
      }} />

      <Stars />
      <Moon />
      <Rain />

      {/* Стекло окна (лёгкий blur) */}
      <div className="absolute inset-0" style={{
        background: 'rgba(255,255,255,0.015)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
      }} />

      <StringLights />
      <Fireflies />

      {/* Подоконник */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '8%',
        background: 'linear-gradient(180deg, #4a2c18 0%, #2c1a0e 100%)',
        boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.5), 0 -5px 30px rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,170,50,0.25)',
      }} />
      {/* Отражение света на подоконнике */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '4%',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,170,50,0.06) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('cafeRole') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('cafeRole'));
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [tableState, setTableState] = useState({ type: 'empty' });
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const [isLeavingItem, setIsLeavingItem] = useState(false);
  const [itemType, setItemType] = useState('coffee');
  const [noteText, setNoteText] = useState('');

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = onValue(tableRef, (snapshot) => {
      const data = snapshot.val();
      setTableState(data || { type: 'empty' });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isAuthenticated, userRole]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!userRole) { setAuthError('Выберите кто вы'); return; }
    if (password === PASSWORDS[userRole]) {
      localStorage.setItem('cafeRole', userRole);
      setAuthError('');
      setIsAuthenticated(true);
    } else {
      setAuthError('Неверный пароль');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cafeRole');
    setUserRole('');
    setPassword('');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) audioRef.current.play().catch(() => setIsMusicPlaying(false));
      else audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  const sendItem = () => {
    if (!noteText.trim()) return;
    set(tableRef, { type: itemType, note: noteText, from: localStorage.getItem('cafeRole'), timestamp: Date.now() });
    setIsLeavingItem(false);
    setNoteText('');
  };

  const consumeItem = () => {
    set(tableRef, { type: 'empty' });
    setIsNoteOpen(false);
    setIsLeavingItem(true);
  };

  const myRole = localStorage.getItem('cafeRole');

  // ═══ ЭКРАН ВХОДА ═══
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
        <CafeBackground />
        <div className="absolute top-4 sm:top-6 z-20 flex justify-center w-full px-4 pt-[calc(env(safe-area-inset-top,0.5rem)+0.25rem)]">
          <LoveCounter />
        </div>
        <form onSubmit={handleLogin} className="glass-card p-8 sm:p-10 rounded-3xl w-full max-w-sm z-10 animate-blur-fade flex flex-col items-center mt-12 sm:mt-8">
          <div className="w-16 h-16 rounded-full bg-black/30 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-6 h-6 text-rose-300/70" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1 tracking-wide italic">SV Café</h1>
          <p className="text-white/35 text-[10px] mb-8 text-center uppercase tracking-[3px]">Только для двоих ✨</p>

          <div className="flex w-full gap-3 mb-6">
            {[['sv', 'Я — Сурен'], ['vika', 'Я — Вика']].map(([role, label]) => (
              <button key={role} type="button" onClick={() => setUserRole(role)}
                className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
                  userRole === role
                    ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}>{label}</button>
            ))}
          </div>

          <input type="password" placeholder="Секретный код..." value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-center focus:outline-none focus:border-rose-400/40 transition-all font-mono tracking-widest placeholder:tracking-normal placeholder:text-white/20 mb-4" />
          {authError && <p className="text-xs text-rose-400 mb-3">{authError}</p>}

          <button type="submit" className="btn-glow w-full py-4 rounded-xl text-white uppercase tracking-[2px] text-[11px] font-semibold">
            Войти
          </button>
        </form>
      </div>
    );
  }

  // ═══ ЭКРАН КАФЕ ═══
  return (
    <div className="min-h-[100dvh] flex flex-col relative font-body overflow-hidden">
      <CafeBackground />

      <audio ref={audioRef} src="/music/sting.mp3" loop />

      {/* ШАПКА */}
      <div className="relative z-50 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-6 pt-[calc(env(safe-area-inset-top,0.5rem)+0.75rem)]">
        <button onClick={handleLogout}
          className="text-white/35 hover:text-white/70 transition-colors flex items-center gap-2 text-[9px] uppercase tracking-[2px] font-semibold glass-card px-3 py-2 rounded-full">
          <LogOut size={11} /> Выйти
        </button>
        <div className="order-last sm:order-none w-full sm:w-auto flex justify-center">
          <LoveCounter />
        </div>
        <MiniPlayer isPlaying={isMusicPlaying} onToggle={() => setIsMusicPlaying(!isMusicPlaying)} />
      </div>

      {/* ОСНОВНАЯ СЦЕНА */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 pb-[12%]">

        {isLoading ? (
          <div className="flex flex-col items-center text-white/40">
            <div className="w-8 h-8 border-2 border-t-rose-400 border-white/10 rounded-full animate-spin mb-4" />
            <p className="text-[9px] uppercase tracking-[3px]">Открываем кафе...</p>
          </div>
        ) : (
          <>
            {/* СЦЕНА 1: Стол пуст */}
            {tableState.type === 'empty' && !isLeavingItem && (
              <div className="flex flex-col items-center text-center animate-blur-fade">
                <div className="w-20 h-20 sm:w-24 sm:h-24 border border-white/5 rounded-full flex items-center justify-center mb-8 bg-white/5 shadow-inner">
                  <Coffee className="w-8 h-8 text-white/15" strokeWidth={1} />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-medium text-white/85 mb-2 italic">Столик ждёт</h2>
                <p className="text-white/35 text-xs sm:text-sm mb-10 max-w-[280px] font-light leading-relaxed">
                  Оставьте что-нибудь тёплое, чтобы {myRole === 'sv' ? 'Вика улыбнулась' : 'Сурен улыбнулся'} ☕
                </p>
                <button onClick={() => setIsLeavingItem(true)} className="btn-glow px-8 py-4 rounded-2xl text-white uppercase tracking-[2px] text-[10px] font-semibold flex items-center gap-3">
                  <Coffee size={15} /> Оставить сюрприз
                </button>
              </div>
            )}

            {/* СЦЕНА 2: На столе сюрприз */}
            {tableState.type !== 'empty' && !isLeavingItem && (
              <div className="flex flex-col items-center animate-blur-fade relative w-full max-w-md">
                <p className="text-rose-200/50 text-[10px] sm:text-xs uppercase tracking-[3px] mb-10 font-semibold">
                  {tableState.from === myRole
                    ? 'Вы оставили это. Ждём...'
                    : `${tableState.from === 'sv' ? 'Сурен' : 'Вика'} оставил${tableState.from === 'vika' ? 'а' : ''} сюрприз`}
                </p>

                {tableState.type === 'coffee'
                  ? <CoffeeCup onClick={() => { if (tableState.from !== myRole) setIsNoteOpen(true); }} interactive={tableState.from !== myRole} />
                  : <DessertItem onClick={() => { if (tableState.from !== myRole) setIsNoteOpen(true); }} interactive={tableState.from !== myRole} />
                }

                {/* Салфетка с запиской */}
                {isNoteOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsNoteOpen(false); }}>
                    <div className="napkin p-7 sm:p-9 w-[92%] max-w-[340px] min-h-[200px] rounded-sm animate-napkin flex flex-col justify-between relative">
                      <button onClick={() => setIsNoteOpen(false)} className="absolute top-3 right-3 text-black/25 hover:text-black/60 transition-colors">
                        <X size={18} />
                      </button>
                      <p className="font-hand text-2xl sm:text-3xl text-[#3b3531] leading-relaxed mb-6 -rotate-1 relative z-10">
                        "{tableState.note}"
                      </p>
                      <div className="flex justify-between items-end border-t border-black/8 pt-4 mt-auto">
                        <span className="font-hand text-lg text-[#d94a4a] -rotate-2">
                          {tableState.from === 'sv' ? 'Твой Сурен' : 'Твоя принцесса'} ❤️
                        </span>
                        <button onClick={consumeItem}
                          className="text-[9px] uppercase tracking-[2px] bg-[#2c2a29] text-[#fdfbf7] px-4 py-2 rounded-lg shadow-md hover:bg-black transition-colors font-body font-semibold">
                          Ответить
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* СЦЕНА 3: Оставляем предмет */}
            {isLeavingItem && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl w-full max-w-md animate-blur-fade flex flex-col relative z-20">
                <button onClick={() => setIsLeavingItem(false)} className="absolute top-4 right-4 text-white/25 hover:text-white/70 p-1 transition-colors">
                  <X size={18} />
                </button>
                <h3 className="font-heading text-lg sm:text-xl text-white mb-6 text-center italic">Что оставим?</h3>

                <div className="flex gap-3 mb-6">
                  {[['coffee', Coffee, 'Кофе'], ['dessert', Croissant, 'Десерт']].map(([type, Icon, label]) => (
                    <button key={type} onClick={() => setItemType(type)}
                      className={`flex-1 py-5 flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${
                        itemType === type
                          ? 'bg-rose-500/15 border-rose-400/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                      }`}>
                      <Icon size={26} strokeWidth={1.3} />
                      <span className="text-[9px] uppercase tracking-[2px] font-semibold">{label}</span>
                    </button>
                  ))}
                </div>

                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Напишите записку на салфетке..."
                  className="w-full h-28 px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-rose-100/90 focus:outline-none focus:border-rose-400/40 transition-all font-hand text-xl sm:text-2xl resize-none placeholder:font-body placeholder:text-xs placeholder:text-white/20 mb-5" />

                <button onClick={sendItem} disabled={!noteText.trim()}
                  className="btn-glow w-full py-4 rounded-xl text-white uppercase tracking-[2px] text-[10px] font-semibold flex items-center justify-center gap-2">
                  <Send size={14} /> Оставить на столике
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
