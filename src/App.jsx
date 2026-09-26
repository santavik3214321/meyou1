import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Heart, LogOut, Music, Pause, Play, Camera, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, update, remove } from "firebase/database";

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
const polaroidsRef = ref(db, 'cafe-polaroids-2026');
const PASSWORDS = { sv: '44', vika: '4' };

// ═══════════════════════════════════════════════════════════
// BACKGROUND COMPONENTS (Stars, Moon, Rain, Fireflies, Lights)
// ═══════════════════════════════════════════════════════════
function Stars() {
  const stars = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 55}%`,
    size: 1.5 + Math.random() * 2.5, delay: `${Math.random() * 4}s`, duration: `${2 + Math.random() * 3}s`,
  })), []);
  return <>{stars.map(s => <div key={s.id} className="absolute rounded-full bg-white" style={{ left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, animation: `twinkle ${s.duration} ease-in-out infinite`, animationDelay: s.delay }} />)}</>;
}

function Moon() {
  return <div className="absolute" style={{ top: '8%', right: '12%', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ffeebb, #ffd67a)', boxShadow: '0 0 40px rgba(255,220,150,0.25), 0 0 80px rgba(255,200,100,0.15), 0 0 120px rgba(255,180,50,0.08)', opacity: 0.9 }} />;
}

function Rain() {
  const drops = useMemo(() => Array.from({ length: 70 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, height: `${10 + Math.random() * 18}px`, duration: `${0.5 + Math.random() * 0.7}s`, delay: `${Math.random() * 3}s`,
  })), []);
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{drops.map(d => <div key={d.id} className="rain-drop" style={{ left: d.left, height: d.height, animationDuration: d.duration, animationDelay: d.delay }} />)}</div>;
}

function Fireflies() {
  const flies = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
    id: i, left: `${5 + Math.random() * 90}%`, bottom: `${Math.random() * 20}%`, size: 3 + Math.random() * 4, duration: `${8 + Math.random() * 10}s`, delay: `${Math.random() * 8}s`,
  })), []);
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{flies.map(f => <div key={f.id} className="firefly" style={{ left: f.left, bottom: f.bottom, width: `${f.size}px`, height: `${f.size}px`, boxShadow: `0 0 ${f.size * 2}px ${f.size}px rgba(255,220,150,0.4)`, animationDuration: f.duration, animationDelay: f.delay }} />)}</div>;
}

function StringLights() {
  const lights = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
    id: i, left: `${5 + i * 10}%`, delay: `${i * 0.3}s`, duration: `${2 + Math.random() * 2}s`, color: i % 3 === 0 ? 'rgba(255,180,60,0.9)' : i % 3 === 1 ? 'rgba(255,150,50,0.85)' : 'rgba(255,200,100,0.9)',
  })), []);
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10">
      <svg className="absolute top-3 left-0 w-full h-10 opacity-30" preserveAspectRatio="none"><path d="M0,15 Q10%,25 20%,18 Q30%,10 40%,20 Q50%,28 60%,15 Q70%,8 80%,22 Q90%,30 100%,12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" /></svg>
      {lights.map(l => <div key={l.id} className="absolute" style={{ left: l.left, top: `${14 + Math.sin(l.id * 0.8) * 8}px`, width: '8px', height: '8px', borderRadius: '50%', background: l.color, boxShadow: `0 0 12px 4px ${l.color.replace('0.9', '0.5').replace('0.85', '0.5')}`, animation: `glow-pulse ${l.duration} ease-in-out infinite`, animationDelay: l.delay }} />)}
    </div>
  );
}

function CafeBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a1025 0%, #0f172a 30%, #1e3a5f 70%, #1a2a4a 100%)' }} />
      <div className="absolute bottom-[35%] left-0 right-0 h-[20%]" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,140,50,0.06) 60%, rgba(255,100,30,0.04) 100%)' }} />
      <Stars /><Moon /><Rain />
      <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }} />
      <StringLights /><Fireflies />
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '8%', background: 'linear-gradient(180deg, #4a2c18 0%, #2c1a0e 100%)', boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.5), 0 -5px 30px rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,170,50,0.25)' }} />
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '4%', background: 'radial-gradient(ellipse at 50% 0%, rgba(255,170,50,0.06) 0%, transparent 70%)' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// UI COMPONENTS
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

function LoveCounter() {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const update = () => {
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
      <span className="text-[8px] uppercase tracking-[1.5px] text-white/35 border-l border-white/10 pl-2">Кемерово</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// POLAROID COMPONENTS
// ═══════════════════════════════════════════════════════════
function Polaroid({ id, data, isNew, onDelete }) {
  const [textVisible, setTextVisible] = useState(!isNew);
  const color = data.from === 'sv' ? 'text-[#3b3531]' : 'text-[#d94a4a]';

  useEffect(() => {
    if (isNew) {
       const timer = setTimeout(() => setTextVisible(true), 2500);
       return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleDragEnd = (e, info) => {
    update(ref(db, `cafe-polaroids-2026/${id}`), {
      x: data.x + info.offset.x,
      y: data.y + info.offset.y
    });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={isNew ? { y: '40vh', scale: 0.3, opacity: 0, rotate: 0 } : { x: data.x, y: data.y, rotate: data.rotation, scale: 1, opacity: 1 }}
      animate={{ x: data.x, y: data.y, rotate: data.rotation, scale: 1, opacity: 1 }}
      transition={isNew ? { type: "spring", bounce: 0.3, duration: 1.5, delay: 0.5 } : { type: "spring", bounce: 0, duration: 0.5 }}
      whileDrag={{ scale: 1.1, rotate: 0, zIndex: 100, boxShadow: "0px 25px 50px rgba(0,0,0,0.5)" }}
      className="absolute bg-[#fdfbf7] p-3 sm:p-4 pb-8 sm:pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-sm w-[160px] sm:w-[200px] cursor-grab active:cursor-grabbing border border-black/5"
      style={{ touchAction: "none" }}
    >
      <button onClick={() => onDelete(id)} className="absolute top-2 right-2 text-black/10 hover:text-rose-500 z-10 transition-colors">
         <X size={14} />
      </button>
      
      {/* Магнитик сверху */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-200 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.3)] border border-slate-300" />
      
      {/* "Снимок" (размытый фон неба) */}
      <div className="w-full h-28 sm:h-36 bg-[#1a2a4a] rounded-sm mb-3 sm:mb-4 relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <Heart className="w-6 h-6 text-white/5" fill="currentColor" />
        
        {/* Анимация проявления (только для новых) */}
        {isNew && !textVisible && (
           <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2.5 }} className="absolute inset-0 bg-[#e0deda]" />
        )}
      </div>

      <p className={`font-hand text-lg sm:text-2xl ${color} text-center leading-tight transition-opacity duration-1000 ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
        {data.note}
      </p>
      
      <div className="absolute bottom-2 right-3 text-[9px] sm:text-[10px] font-mono text-black/30 font-bold uppercase">
        {data.from}
      </div>
    </motion.div>
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

  const [polaroids, setPolaroids] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [newCardId, setNewCardId] = useState(null);

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Audio for camera click
  const shutterRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = onValue(polaroidsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setPolaroids(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

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

  const sendPolaroid = () => {
    if (!noteText.trim()) return;
    
    // Play shutter sound
    if (shutterRef.current) {
        shutterRef.current.currentTime = 0;
        shutterRef.current.play().catch(e => console.log(e));
    }

    const newRef = push(polaroidsRef);
    const id = newRef.key;
    
    // Calculate random position on screen (avoiding edges)
    const marginX = window.innerWidth > 600 ? 100 : 20;
    const marginY = 150;
    const x = (Math.random() - 0.5) * (window.innerWidth - marginX * 2);
    const y = (Math.random() - 0.5) * (window.innerHeight - marginY * 2) - 50;
    const rotation = (Math.random() - 0.5) * 30; // Random tilt -15 to +15 deg

    setNewCardId(id);

    set(newRef, {
      note: noteText,
      from: localStorage.getItem('cafeRole'),
      timestamp: Date.now(),
      x, y, rotation
    });
    
    setNoteText('');
    setIsCameraOpen(false);
    
    // Reset the "new" status after animation completes
    setTimeout(() => {
        setNewCardId(null);
    }, 4000);
  };

  const deletePolaroid = (id) => {
    remove(ref(db, `cafe-polaroids-2026/${id}`));
  };

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
                  userRole === role ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
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

  // ═══ ЭКРАН КАФЕ (Доска Полароидов) ═══
  return (
    <div className="min-h-[100dvh] flex flex-col relative font-body overflow-hidden">
      <CafeBackground />
      
      {/* Звуки */}
      <audio ref={audioRef} src="/music/sting.mp3" loop />
      {/* Винтажный звук печати полароида */}
      <audio ref={shutterRef} src="https://cdn.freesound.org/previews/389/389728_5724505-lq.mp3" preload="auto" />

      {/* ШАПКА */}
      <div className="relative z-50 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-6 pt-[calc(env(safe-area-inset-top,0.5rem)+0.75rem)] pointer-events-none">
        <button onClick={handleLogout} className="pointer-events-auto text-white/35 hover:text-white/70 transition-colors flex items-center gap-2 text-[9px] uppercase tracking-[2px] font-semibold glass-card px-3 py-2 rounded-full">
          <LogOut size={11} /> Выйти
        </button>
        <div className="pointer-events-auto order-last sm:order-none w-full sm:w-auto flex justify-center">
          <LoveCounter />
        </div>
        <div className="pointer-events-auto">
           <MiniPlayer isPlaying={isMusicPlaying} onToggle={() => setIsMusicPlaying(!isMusicPlaying)} />
        </div>
      </div>

      {/* БЕСКОНЕЧНАЯ ДОСКА ПОЛАРОИДОВ */}
      <main className="relative z-10 flex-grow flex items-center justify-center pointer-events-none">
        {isLoading ? (
          <div className="flex flex-col items-center text-white/40">
            <div className="w-8 h-8 border-2 border-t-rose-400 border-white/10 rounded-full animate-spin mb-4" />
            <p className="text-[9px] uppercase tracking-[3px]">Проявляем снимки...</p>
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-auto flex items-center justify-center">
             {Object.entries(polaroids).map(([id, data]) => (
                <Polaroid key={id} id={id} data={data} isNew={id === newCardId} onDelete={deletePolaroid} />
             ))}
          </div>
        )}
      </main>

      {/* ВИНТАЖНЫЙ ФОТОАППАРАТ (Внизу по центру) */}
      <div className="relative z-50 mt-auto pb-[calc(env(safe-area-inset-bottom,1rem)+1rem)] flex flex-col items-center justify-end pointer-events-none">
         
         <AnimatePresence>
           {isCameraOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.9 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="glass-card p-5 sm:p-6 rounded-3xl w-[90%] max-w-sm mb-6 flex flex-col relative pointer-events-auto shadow-2xl border-white/20"
             >
               <button onClick={() => setIsCameraOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white/80 transition-colors"><X size={16}/></button>
               <h3 className="font-heading text-lg sm:text-xl text-white mb-4 text-center italic">Новый снимок</h3>
               <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Напишите записку на полароиде..."
                  className="w-full h-24 px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-rose-100/90 focus:outline-none focus:border-rose-400/50 transition-all font-hand text-xl sm:text-2xl resize-none placeholder:font-body placeholder:text-xs placeholder:text-white/20 mb-4" />
               <button onClick={sendPolaroid} disabled={!noteText.trim()}
                  className="btn-glow w-full py-3 sm:py-4 rounded-xl text-white uppercase tracking-[2px] text-[10px] font-semibold flex items-center justify-center gap-2">
                  <Camera size={14} /> Сделать снимок
               </button>
             </motion.div>
           )}
         </AnimatePresence>

         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCameraOpen(!isCameraOpen)}
            className="pointer-events-auto flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full glass-card border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group overflow-hidden"
         >
            {/* Стилизация под винтажный объектив */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1a1a1a] border-[3px] border-gray-600 flex items-center justify-center shadow-inner relative">
               <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/10 blur-[1px]" />
               <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0a0a0a] border-2 border-gray-700 shadow-[inset_0_0_10px_rgba(0,0,0,1)] relative flex items-center justify-center">
                   <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500/20 blur-[1px] absolute" />
                   <Camera size={16} className="text-white/40 group-hover:text-rose-300 transition-colors relative z-10" />
               </div>
            </div>
         </motion.button>
      </div>

    </div>
  );
}
