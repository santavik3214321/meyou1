import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Send, Heart, X, LogOut, Music, Pause, Play, Anchor } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// ─── Firebase ────────────────────────────────────
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
const bottleRef = ref(db, 'bottle-ocean-2026');
const PASSWORDS = { sv: '44', vika: '4' };

// ═══════════════════════════════════════════════════
// Звёзды
// ═══════════════════════════════════════════════════
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      size: 1 + Math.random() * 2.5,
      delay: `${Math.random() * 5}s`,
      dur: `${2 + Math.random() * 3}s`,
    })), []);
  return <>
    {stars.map(s => (
      <div key={s.id} className="absolute rounded-full bg-white" style={{
        left: s.left, top: s.top,
        width: `${s.size}px`, height: `${s.size}px`,
        animation: `twinkle ${s.dur} ease-in-out infinite`,
        animationDelay: s.delay,
      }} />
    ))}
  </>;
}

// ═══════════════════════════════════════════════════
// Луна + лунная дорожка
// ═══════════════════════════════════════════════════
function Moon() {
  return <>
    <div className="absolute" style={{
      top: '6%', right: '18%', width: '70px', height: '70px', borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #ffeebb, #ffd67a)',
      boxShadow: '0 0 40px rgba(255,220,150,0.3), 0 0 100px rgba(255,200,100,0.12)',
      opacity: 0.9, zIndex: 1,
    }} />
    {/* Лунная дорожка на воде */}
    <div className="absolute left-1/2 -translate-x-1/2" style={{
      bottom: '10%', width: '4px', height: '18%',
      background: 'linear-gradient(180deg, rgba(255,220,150,0.3), transparent)',
      filter: 'blur(4px)',
      animation: 'moon-shimmer 4s ease-in-out infinite',
      zIndex: 4,
    }} />
  </>;
}

// ═══════════════════════════════════════════════════
// Волны (4-слойный SVG параллакс — Goodkatz)
// ═══════════════════════════════════════════════════
function Waves() {
  return (
    <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
      <defs>
        <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
      </defs>
      <g className="parallax-waves">
        <use xlinkHref="#wave" x="48" y="0" fill="rgba(10,42,74,0.4)" />
        <use xlinkHref="#wave" x="48" y="3" fill="rgba(14,58,90,0.55)" />
        <use xlinkHref="#wave" x="48" y="5" fill="rgba(18,63,95,0.75)" />
        <use xlinkHref="#wave" x="48" y="7" fill="#0b2e4a" />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════
// Берег Севана (горы Армении) — левый
// ═══════════════════════════════════════════════════
function SevanShore() {
  return (
    <div className="absolute bottom-0 left-0 z-[6] pointer-events-none" style={{ width: '22%', height: '45%' }}>
      {/* Горы */}
      <svg viewBox="0 0 200 200" className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="xMinYMax meet">
        <polygon points="0,200 0,80 30,60 55,90 80,45 110,75 140,55 170,85 200,70 200,200" fill="#0a1520" />
        <polygon points="0,200 0,120 25,95 50,110 80,80 110,105 140,90 170,110 200,95 200,200" fill="#0d1d2d" />
      </svg>
      {/* Маяк */}
      <div className="absolute bottom-[28%] right-[25%] flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-amber-300" style={{ animation: 'beacon-glow 3s ease-in-out infinite' }} />
        <div className="w-[5px] h-[22px] bg-[#1a2a3a] rounded-t-sm mt-0.5" />
      </div>
      {/* Название */}
      <div className="absolute bottom-[15%] left-[10%] sm:left-[15%]">
        <p className="font-body text-[8px] sm:text-[9px] uppercase tracking-[3px] text-white/30 font-semibold">Севан</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Берег Томи (Сибирь, ели) — правый
// ═══════════════════════════════════════════════════
function TomShore() {
  return (
    <div className="absolute bottom-0 right-0 z-[6] pointer-events-none" style={{ width: '22%', height: '40%' }}>
      {/* Холмы + ели */}
      <svg viewBox="0 0 200 200" className="absolute bottom-0 right-0 w-full h-full" preserveAspectRatio="xMaxYMax meet">
        <polygon points="0,200 0,100 30,80 60,95 90,65 120,85 150,70 180,90 200,75 200,200" fill="#0a1520" />
        <polygon points="0,200 0,130 20,115 50,125 80,100 100,115 130,95 160,110 190,100 200,105 200,200" fill="#0d1d2d" />
        {/* Ёлки-силуэты */}
        <polygon points="155,95 160,70 165,95" fill="#0a1520" />
        <polygon points="140,105 146,78 152,105" fill="#0a1520" />
        <polygon points="170,100 175,80 180,100" fill="#0a1520" />
        <polygon points="125,110 130,88 135,110" fill="#0a1520" />
      </svg>
      {/* Маяк */}
      <div className="absolute bottom-[22%] left-[20%] flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-amber-300" style={{ animation: 'beacon-glow 2.5s ease-in-out infinite 1s' }} />
        <div className="w-[5px] h-[22px] bg-[#1a2a3a] rounded-t-sm mt-0.5" />
      </div>
      {/* Название */}
      <div className="absolute bottom-[10%] right-[10%] sm:right-[15%]">
        <p className="font-body text-[8px] sm:text-[9px] uppercase tracking-[3px] text-white/30 font-semibold">Томь</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SVG Бутылка
// ═══════════════════════════════════════════════════
function BottleSVG({ size = 50 }) {
  return (
    <svg width={size} height={size * 1.8} viewBox="0 0 40 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Пробка */}
      <rect x="15" y="2" width="10" height="10" rx="2" fill="#8B6F47" />
      <rect x="16" y="4" width="8" height="6" rx="1" fill="#A0845C" />
      {/* Горлышко */}
      <rect x="16" y="12" width="8" height="8" rx="1" fill="rgba(180,220,255,0.35)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Тело бутылки */}
      <path d="M16 20 L12 28 L12 62 Q12 66 16 66 L24 66 Q28 66 28 62 L28 28 L24 20 Z" fill="rgba(160,210,250,0.25)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Блик */}
      <path d="M15 30 L15 55" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Записка внутри */}
      <rect x="16" y="38" width="8" height="12" rx="1" fill="#f5efe6" opacity="0.6" transform="rotate(-8, 20, 44)" />
      <line x1="17" y1="42" x2="22" y2="41" stroke="#c4a882" strokeWidth="0.5" opacity="0.5" />
      <line x1="17" y1="45" x2="21" y2="44" stroke="#c4a882" strokeWidth="0.5" opacity="0.5" />
      {/* Свечение */}
      <ellipse cx="20" cy="44" rx="18" ry="20" fill="rgba(255,200,100,0.06)" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════
// Плавающая бутылка на воде
// ═══════════════════════════════════════════════════
function FloatingBottle({ onClick, side }) {
  const posClass = side === 'left'
    ? 'left-[10%] sm:left-[14%]'
    : 'right-[10%] sm:right-[14%]';
  return (
    <div className={`absolute ${posClass} z-[7] cursor-pointer`}
      style={{
        bottom: '18%',
        animation: 'bottle-bob 4s ease-in-out infinite, bottle-rock 4s ease-in-out infinite, bottle-drift 8s ease-in-out infinite',
      }}
      onClick={onClick}
    >
      <div className="relative">
        <BottleSVG size={40} />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white/35 text-[8px] uppercase tracking-[2px] whitespace-nowrap mt-1"
          style={{ animation: 'gentle-pulse 2s ease-in-out infinite' }}>
          открыть
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Анимация отправки бутылки
// ═══════════════════════════════════════════════════
function SailingBottle({ direction, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute z-[8]" style={{
      bottom: '20%',
      animation: `${direction === 'right' ? 'sail-right' : 'sail-left'} 4s cubic-bezier(0.25, 1, 0.5, 1) forwards,
                  bottle-bob 2s ease-in-out infinite,
                  bottle-rock 2s ease-in-out infinite`,
    }}>
      <BottleSVG size={38} />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Счётчик любви
// ═══════════════════════════════════════════════════
function LoveCounter() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Date.now() - new Date('2026-08-05T00:00:00+07:00').getTime());
      setT({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff / 36e5) % 24),
        m: Math.floor((diff / 6e4) % 60),
        s: Math.floor((diff / 1e3) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass-card rounded-full px-3 py-1.5 flex items-center gap-2 select-none">
      <Heart size={11} className="text-rose-400 fill-rose-400 animate-pulse" />
      <div className="flex items-baseline gap-0.5 text-[10px] font-semibold">
        <span className="font-heading italic text-white/90 text-xs">{t.d}</span>
        <span className="text-white/35 text-[8px]">д</span>
        <span className="font-mono text-white/70">{String(t.h).padStart(2,'0')}</span>
        <span className="text-white/30 text-[8px]">:</span>
        <span className="font-mono text-white/70">{String(t.m).padStart(2,'0')}</span>
        <span className="text-white/30 text-[8px]">:</span>
        <span className="font-mono text-blue-300/80">{String(t.s).padStart(2,'0')}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Мини-плеер
// ═══════════════════════════════════════════════════
function MiniPlayer({ playing, onToggle }) {
  return (
    <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer select-none" onClick={onToggle}>
      <div style={{ animation: playing ? 'note-sway 1s ease-in-out infinite' : 'none' }}>
        <Music size={13} className="text-blue-300" />
      </div>
      <span className="text-[9px] uppercase tracking-[1.5px] text-white/50 font-medium hidden sm:inline">Ocean</span>
      {playing && (
        <div className="flex items-end gap-[2px] h-3 ml-1">
          {[0.45, 0.65, 0.4, 0.55].map((d, i) => (
            <div key={i} className="eq-bar h-3" style={{ animationDuration: `${d}s`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center ml-1">
        {playing ? <Pause size={10} className="text-white/70" /> : <Play size={10} className="text-white/70 ml-0.5" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Фон океана (все слои)
// ═══════════════════════════════════════════════════
function OceanBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Небо */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #050a18 0%, #0a1628 20%, #0f2847 45%, #1a4a6e 65%, #0d3054 80%, #071a2f 100%)',
      }} />
      <Stars />
      <Moon />
      <SevanShore />
      <TomShore />
      <Waves />
      {/* Нижняя часть — глубокая вода */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] z-[6]" style={{
        background: '#071520',
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ГЛАВНЫЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════
export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('bottleRole') || '');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('bottleRole'));
  const [pwd, setPwd] = useState('');
  const [authErr, setAuthErr] = useState('');

  const [bottleState, setBottleState] = useState({ type: 'empty' });
  const [loading, setLoading] = useState(true);
  const [noteOpen, setNoteOpen] = useState(false);
  const [writing, setWriting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [sailing, setSailing] = useState(null); // 'left' | 'right' | null

  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  // Firebase listener
  useEffect(() => {
    if (!isAuth) return;
    const unsub = onValue(bottleRef, (snap) => {
      setBottleState(snap.val() || { type: 'empty' });
      setLoading(false);
    });
    return () => unsub();
  }, [isAuth]);

  // Audio
  useEffect(() => {
    if (audioRef.current) {
      if (musicOn) audioRef.current.play().catch(() => setMusicOn(false));
      else audioRef.current.pause();
    }
  }, [musicOn]);

  const login = (e) => {
    e.preventDefault();
    if (!userRole) { setAuthErr('Выберите кто вы'); return; }
    if (pwd === PASSWORDS[userRole]) {
      localStorage.setItem('bottleRole', userRole);
      setAuthErr('');
      setIsAuth(true);
    } else setAuthErr('Неверный пароль');
  };

  const logout = () => {
    localStorage.removeItem('bottleRole');
    setUserRole(''); setPwd(''); setIsAuth(false);
  };

  const me = localStorage.getItem('bottleRole');

  const sendBottle = () => {
    if (!noteText.trim()) return;
    const dir = me === 'sv' ? 'right' : 'left';
    setSailing(dir);
    // Save after animation starts
    setTimeout(() => {
      set(bottleRef, { type: 'bottle', note: noteText, from: me, timestamp: Date.now() });
    }, 1000);
    setWriting(false);
    setNoteText('');
  };

  const sailDone = () => setSailing(null);

  const takeBottle = () => {
    set(bottleRef, { type: 'empty' });
    setNoteOpen(false);
    setWriting(true); // сразу предложить ответить
  };

  // Определяем сторону бутылки
  const bottleSide = bottleState.from === 'sv' ? 'right' : 'left';
  const isForMe = bottleState.from && bottleState.from !== me;

  // ═══ ЛОГИН ═══
  if (!isAuth) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
        <OceanBackground />
        <div className="absolute top-4 z-20 flex justify-center w-full px-4 pt-[env(safe-area-inset-top)]">
          <LoveCounter />
        </div>
        <form onSubmit={login} className="glass-card p-8 sm:p-10 rounded-3xl w-full max-w-sm z-10 animate-fade-up flex flex-col items-center mt-8">
          <div className="w-14 h-14 rounded-full bg-black/20 border border-white/10 flex items-center justify-center mb-5">
            <Anchor className="w-5 h-5 text-blue-300/60" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1 tracking-wide italic">Across the Water</h1>
          <p className="text-white/30 text-[9px] mb-7 text-center uppercase tracking-[2.5px] leading-relaxed max-w-[220px]">
            3 700 км. Одна река. Два сердца.
          </p>

          <div className="flex w-full gap-3 mb-5">
            {[['sv', 'Я — Сурен'], ['vika', 'Я — Вика']].map(([r, l]) => (
              <button key={r} type="button" onClick={() => setUserRole(r)}
                className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
                  userRole === r
                    ? 'bg-blue-500/15 border-blue-400/40 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.12)]'
                    : 'bg-white/5 border-white/8 text-white/35 hover:bg-white/8'
                }`}>{l}</button>
            ))}
          </div>

          <input type="password" placeholder="Секретный код..." value={pwd} onChange={e => setPwd(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white text-center focus:outline-none focus:border-blue-400/40 transition font-mono tracking-widest placeholder:tracking-normal placeholder:text-white/20 mb-4" />
          {authErr && <p className="text-xs text-rose-400 mb-3">{authErr}</p>}

          <button type="submit" className="btn-ocean w-full py-3.5 rounded-xl text-white uppercase tracking-[2px] text-[10px] font-semibold">
            Войти
          </button>
        </form>
      </div>
    );
  }

  // ═══ ОКЕАН ═══
  return (
    <div className="min-h-[100dvh] flex flex-col relative font-body overflow-hidden">
      <OceanBackground />
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_945a03c045.mp3" loop />

      {/* Шапка */}
      <div className="relative z-50 flex items-center justify-between p-3 sm:p-5 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <button onClick={logout} className="text-white/30 hover:text-white/60 transition flex items-center gap-1.5 text-[8px] uppercase tracking-[2px] font-semibold glass-card px-2.5 py-1.5 rounded-full">
          <LogOut size={10} />
        </button>
        <LoveCounter />
        <MiniPlayer playing={musicOn} onToggle={() => setMusicOn(!musicOn)} />
      </div>

      {/* Главная сцена */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">

        {loading ? (
          <div className="flex flex-col items-center text-white/35 animate-fade-up">
            <div className="w-7 h-7 border-2 border-t-blue-400 border-white/10 rounded-full animate-spin mb-3" />
            <p className="text-[8px] uppercase tracking-[3px]">Смотрим на горизонт...</p>
          </div>
        ) : (
          <>
            {/* Анимация полёта бутылки */}
            {sailing && <SailingBottle direction={sailing} onDone={sailDone} />}

            {/* Сцена 1: Океан пуст */}
            {bottleState.type === 'empty' && !writing && !sailing && (
              <div className="flex flex-col items-center text-center animate-fade-up">
                <p className="font-heading text-lg sm:text-xl italic text-white/40 mb-2">Океан тих...</p>
                <p className="text-white/25 text-xs sm:text-sm mb-10 max-w-[260px] font-light leading-relaxed">
                  Бросьте бутылку с посланием {me === 'sv' ? 'для Вики' : 'для Сурена'}
                </p>
                <button onClick={() => setWriting(true)} className="btn-ocean px-7 py-3.5 rounded-2xl text-white uppercase tracking-[2px] text-[10px] font-semibold flex items-center gap-2.5">
                  <BottleSVG size={18} /> Бросить бутылку
                </button>
              </div>
            )}

            {/* Сцена 2: Бутылка на берегу (для получателя) */}
            {bottleState.type === 'bottle' && !writing && !sailing && (
              <div className="flex flex-col items-center text-center animate-fade-up">
                {isForMe ? (
                  <>
                    <p className="font-heading text-base sm:text-lg italic text-blue-200/50 mb-2">
                      К берегу прибило бутылку...
                    </p>
                    <p className="text-white/25 text-xs mb-6">от {bottleState.from === 'sv' ? 'Сурена' : 'Вики'}</p>
                  </>
                ) : (
                  <>
                    <p className="font-heading text-base sm:text-lg italic text-white/35 mb-2">
                      Ваша бутылка плывёт...
                    </p>
                    <p className="text-white/20 text-xs mb-6">Ждём, когда {me === 'sv' ? 'Вика' : 'Сурен'} найдёт её</p>
                  </>
                )}
              </div>
            )}

            {/* Бутылка на воде (если есть и для меня) */}
            {bottleState.type === 'bottle' && isForMe && !noteOpen && !sailing && (
              <FloatingBottle side={bottleSide} onClick={() => setNoteOpen(true)} />
            )}

            {/* Бутылка на воде (если я отправил, на другом берегу) */}
            {bottleState.type === 'bottle' && !isForMe && !sailing && (
              <div className={`absolute ${bottleSide === 'right' ? 'right-[12%] sm:right-[16%]' : 'left-[12%] sm:left-[16%]'} z-[7] opacity-50`}
                style={{ bottom: '18%', animation: 'bottle-bob 4.5s ease-in-out infinite, bottle-rock 4.5s ease-in-out infinite' }}>
                <BottleSVG size={32} />
              </div>
            )}

            {/* Записка из бутылки (модалка) */}
            {noteOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(5,10,24,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                onClick={e => { if (e.target === e.currentTarget) setNoteOpen(false); }}>
                <div className="note-paper p-7 sm:p-9 w-[92%] max-w-[340px] min-h-[200px] rounded-md animate-unfold flex flex-col justify-between relative">
                  <button onClick={() => setNoteOpen(false)} className="absolute top-3 right-3 text-black/20 hover:text-black/50 transition">
                    <X size={16} />
                  </button>
                  <p className="font-hand text-2xl sm:text-3xl text-[#3b3531] leading-relaxed mb-6 -rotate-1">
                    "{bottleState.note}"
                  </p>
                  <div className="flex justify-between items-end border-t border-black/8 pt-4 mt-auto">
                    <span className="font-hand text-base text-[#c0392b] -rotate-2">
                      {bottleState.from === 'sv' ? 'Твой Сурен' : 'Твоя Вика'} ❤️
                    </span>
                    <button onClick={takeBottle}
                      className="text-[8px] uppercase tracking-[2px] bg-[#0d3054] text-white/90 px-4 py-2 rounded-lg shadow-md hover:bg-[#0a2540] transition font-body font-semibold">
                      Ответить
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Форма написания */}
            {writing && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl w-full max-w-md animate-fade-up flex flex-col relative z-20">
                <button onClick={() => setWriting(false)} className="absolute top-4 right-4 text-white/20 hover:text-white/60 p-1 transition">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <BottleSVG size={28} />
                  <h3 className="font-heading text-lg text-white italic">Послание в бутылке</h3>
                </div>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Напишите послание..."
                  className="w-full h-28 px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-blue-50/90 focus:outline-none focus:border-blue-400/30 transition font-hand text-xl sm:text-2xl resize-none placeholder:font-body placeholder:text-xs placeholder:text-white/20 mb-5" />
                <button onClick={sendBottle} disabled={!noteText.trim()}
                  className="btn-ocean w-full py-3.5 rounded-xl text-white uppercase tracking-[2px] text-[10px] font-semibold flex items-center justify-center gap-2">
                  <Send size={13} /> Бросить в воду
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
