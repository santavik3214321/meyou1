import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Heart, LogOut, Music, Pause, Play, Camera, X, ImagePlus } from 'lucide-react';
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
// NEW BACKGROUND COMPONENTS (Dreamy Sunset / Sakura / Orbs)
// ═══════════════════════════════════════════════════════════
function Sakura() {
  const petals = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i, left: `${Math.random() * 120}%`, top: `-${Math.random() * 20}vh`,
    size: 5 + Math.random() * 10, delay: `${Math.random() * 10}s`, duration: `${6 + Math.random() * 8}s`,
  })), []);
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{petals.map(p => <div key={p.id} className="sakura-petal" style={{ left: p.left, top: p.top, width: `${p.size}px`, height: `${p.size}px`, animationDuration: p.duration, animationDelay: p.delay }} />)}</div>;
}

function MagicOrbs() {
  const orbs = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    size: 20 + Math.random() * 60, delay: `${Math.random() * 4}s`, duration: `${3 + Math.random() * 4}s`,
  })), []);
  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{orbs.map(o => <div key={o.id} className="magic-orb" style={{ left: o.left, top: o.top, width: `${o.size}px`, height: `${o.size}px`, animationDuration: o.duration, animationDelay: o.delay }} />)}</div>;
}

function CafeBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden dreamy-bg pointer-events-none">
      <Sakura />
      <MagicOrbs />
      {/* Мягкое свечение снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════
function MiniPlayer({ isPlaying, onToggle }) {
  return (
    <div className="glass-card rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 cursor-pointer select-none" onClick={onToggle}>
      <div style={{ animation: isPlaying ? 'note-bounce 1s ease-in-out infinite' : 'none' }}>
        <Music size={14} className="text-rose-500" />
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="text-[10px] uppercase tracking-[2px] text-rose-800 font-bold">Lo-fi</span>
      </div>
      {isPlaying && (
        <div className="flex items-end gap-[3px] h-3 sm:h-4 ml-1">
          <div className="eq-bar h-3 sm:h-4 bg-rose-400" style={{ animationDuration: '0.5s' }} />
          <div className="eq-bar h-3 sm:h-4 bg-rose-400" style={{ animationDuration: '0.7s', animationDelay: '0.1s' }} />
          <div className="eq-bar h-3 sm:h-4 bg-rose-400" style={{ animationDuration: '0.4s', animationDelay: '0.2s' }} />
        </div>
      )}
      <div className="ml-1 sm:ml-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/30 flex items-center justify-center">
        {isPlaying ? <Pause size={10} className="text-rose-600" /> : <Play size={10} className="text-rose-600 ml-0.5" />}
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
    <div className="glass-card rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 select-none shadow-lg">
      <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
      <div className="flex items-baseline gap-1 text-[10px] sm:text-xs font-bold text-rose-900">
        <span className="font-heading italic text-rose-800 text-xs sm:text-sm">{time.days}</span>
        <span className="text-rose-700/70 text-[8px] sm:text-[9px] uppercase tracking-wider">дн</span>
        <span className="font-mono">{String(time.hours).padStart(2, '0')}</span><span className="text-rose-700/70 text-[8px] sm:text-[9px]">ч</span>
        <span className="font-mono">{String(time.mins).padStart(2, '0')}</span><span className="text-rose-700/70 text-[8px] sm:text-[9px]">м</span>
        <span className="font-mono text-rose-500">{String(time.secs).padStart(2, '0')}</span><span className="text-rose-700/70 text-[8px] sm:text-[9px]">с</span>
      </div>
      <span className="hidden md:inline-block text-[7px] sm:text-[8px] uppercase tracking-[1.5px] text-rose-800/50 border-l border-rose-800/20 pl-2">Кемерово</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// POLAROID COMPONENTS
// ═══════════════════════════════════════════════════════════
function Polaroid({ id, data, isNew, onDelete, onSelect, boardRef }) {
  const [textVisible, setTextVisible] = useState(!isNew);
  const color = data.from === 'sv' ? 'text-[#3b3531]' : 'text-[#d94a4a]';

  const [currentScale, setCurrentScale] = useState(data.scale || 1);
  const initialDist = useRef(null);
  
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
     const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentScale(data.scale || 1);
  }, [data.scale]);

  useEffect(() => {
    if (isNew) {
       const timer = setTimeout(() => setTextVisible(true), 2500);
       return () => clearTimeout(timer);
    }
  }, [isNew]);

  const cardWidth = windowSize.w > 600 ? 180 : 150;
  const cardHeight = windowSize.w > 600 ? 210 : 180;
  
  // Calculate bounds to keep card on screen (0,0 is center of screen)
  const minX = -windowSize.w / 2 + cardWidth / 2;
  const maxX = windowSize.w / 2 - cardWidth / 2;
  const minY = -windowSize.h / 2 + cardHeight / 2;
  const maxY = windowSize.h / 2 - cardHeight / 2 - 80; // 80px buffer for bottom UI

  const clampedX = Math.max(minX, Math.min(data.x, maxX));
  const clampedY = Math.max(minY, Math.min(data.y, maxY));

  const handleDragEnd = (e, info) => {
    update(ref(db, `cafe-polaroids-2026/${id}`), {
      x: clampedX + info.offset.x,
      y: clampedY + info.offset.y
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialDist.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / initialDist.current;
      let newScale = (data.scale || 1) * ratio;
      newScale = Math.min(Math.max(newScale, 0.6), 1); 
      setCurrentScale(newScale);
    }
  };

  const handleTouchEnd = (e) => {
    if (initialDist.current && e.touches.length < 2) {
      initialDist.current = null;
      update(ref(db, `cafe-polaroids-2026/${id}`), { scale: currentScale });
    }
  };

  return (
    <motion.div
      layoutId={`polaroid-${id}`}
      drag
      dragConstraints={boardRef}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onSelect(id)}
      initial={isNew ? { y: '20vh', scale: 0.3, opacity: 0, rotate: 0 } : { x: clampedX, y: clampedY, rotate: data.rotation, scale: currentScale, opacity: 1 }}
      animate={{ x: clampedX, y: clampedY, rotate: data.rotation, scale: currentScale, opacity: 1 }}
      transition={isNew ? { type: "spring", bounce: 0.3, duration: 1.5, delay: 0.5 } : { type: "spring", bounce: 0, duration: 0.5 }}
      whileDrag={{ scale: currentScale * 1.05, rotate: 0, zIndex: 100, boxShadow: "0px 25px 50px rgba(0,0,0,0.3)" }}
      className="absolute bg-[#fffdf8] p-3 sm:p-4 pb-8 sm:pb-12 shadow-[0_10px_30px_rgba(255,154,158,0.3)] rounded-sm w-[150px] sm:w-[180px] cursor-grab active:cursor-grabbing border border-rose-900/5"
      style={{ 
        marginLeft: '-75px', // Center alignment fix for w-[150px]
        marginTop: '-75px', 
        touchAction: "none", 
        backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" 
      }}
    >
      <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="absolute top-2 right-2 text-rose-900/10 hover:text-rose-500 z-10 transition-colors">
         <X size={14} />
      </button>
      
      {/* Розовый Магнитик сверху */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-rose-200 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(255,154,158,0.4)] border border-rose-300" />
      
      {/* "Снимок" (фото или размытый фон) */}
      <div className="w-full aspect-square bg-gradient-to-br from-rose-200 to-amber-100 rounded-sm mb-3 sm:mb-4 relative overflow-hidden shadow-[inset_0_0_15px_rgba(255,154,158,0.4)] flex items-center justify-center pointer-events-none">
        {data.image ? (
          <img src={data.image} alt="polaroid" className="w-full h-full object-cover pointer-events-none" draggable={false} />
        ) : (
          <Heart className="w-6 h-6 text-rose-400/30" fill="currentColor" />
        )}
        
        {/* Анимация проявления (только для новых) */}
        {isNew && !textVisible && (
           <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2.5 }} className="absolute inset-0 bg-[#e0deda]" />
        )}
      </div>

      {data.note && (
        <div className="w-full overflow-hidden pointer-events-none">
          <p className={`font-hand text-lg sm:text-xl ${color} text-center leading-tight transition-opacity duration-1000 break-words break-all ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
            {data.note}
          </p>
        </div>
      )}
      
      <div className="absolute bottom-2 right-3 text-[9px] sm:text-[10px] font-mono text-rose-900/30 font-bold uppercase pointer-events-none">
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
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const boardRef = useRef(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteImage, setNoteImage] = useState(null);
  const [newCardId, setNewCardId] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG to save space in Realtime DB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setNoteImage(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const deletePolaroid = (id) => {
    remove(ref(db, `cafe-polaroids-2026/${id}`));
  };

  const sendPolaroid = () => {
    if (!noteText.trim() && !noteImage) return;
    
    // Play shutter sound
    if (shutterRef.current) {
        shutterRef.current.currentTime = 0;
        shutterRef.current.play().catch(e => console.log(e));
    }

    const newRef = push(polaroidsRef);
    const id = newRef.key;
    
    // Position relatively close to center
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 300 - 50;
    const rotation = (Math.random() - 0.5) * 30; // Random tilt -15 to +15 deg

    setNewCardId(id);

    set(newRef, {
      note: noteText,
      image: noteImage || null,
      from: localStorage.getItem('cafeRole'),
      timestamp: Date.now(),
      x, y, rotation
    });
    
    setNoteText('');
    setNoteImage(null);
    setIsCameraOpen(false);
    
    // Reset the "new" status after animation completes
    setTimeout(() => {
        setNewCardId(null);
    }, 4000);
  };

  // ═══ ЭКРАН ВХОДА ═══
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
        <CafeBackground />
        <div className="absolute top-4 sm:top-6 z-20 flex justify-center w-full px-4 pt-[calc(env(safe-area-inset-top,0.5rem)+0.25rem)]">
          <LoveCounter />
        </div>
        <form onSubmit={handleLogin} className="glass-card p-6 sm:p-10 rounded-3xl w-full max-w-sm z-10 animate-blur-fade flex flex-col items-center mt-12 sm:mt-8">
          <div className="w-16 h-16 rounded-full bg-white/30 border border-white/40 flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-6 h-6 text-rose-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-rose-900 mb-1 tracking-wide italic">SV Café</h1>
          <p className="text-rose-800/60 text-[10px] mb-8 text-center uppercase tracking-[3px]">Только для двоих ✨</p>

          <div className="flex w-full gap-3 mb-6">
            {[['sv', 'Я — Сурен'], ['vika', 'Я — Вика']].map(([role, label]) => (
              <button key={role} type="button" onClick={() => setUserRole(role)}
                className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${
                  userRole === role ? 'bg-white/40 border-white text-rose-900 shadow-[0_4px_15px_rgba(255,154,158,0.4)]' : 'bg-white/10 border-white/20 text-rose-900/60 hover:bg-white/20'
                }`}>{label}</button>
            ))}
          </div>

          <input type="password" placeholder="Секретный код..." value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-white/30 bg-white/20 text-rose-900 text-center focus:outline-none focus:border-white transition-all font-mono tracking-widest placeholder:tracking-normal placeholder:text-rose-900/40 mb-4" />
          {authError && <p className="text-xs text-rose-600 mb-3 font-semibold">{authError}</p>}

          <button type="submit" className="btn-glow w-full py-4 rounded-xl uppercase tracking-[2px] text-[11px] font-bold">
            Войти
          </button>
        </form>
      </div>
    );
  }

  // ═══ ЭКРАН КАФЕ (Доска Полароидов) ═══
  return (
    <div className="relative font-body w-full h-[100dvh] overflow-hidden">
      <CafeBackground />
      
      {/* Звуки */}
      <audio ref={audioRef} src="/music/sting.mp3" loop />
      <audio ref={shutterRef} src="https://cdn.freesound.org/previews/389/389728_5724505-lq.mp3" preload="auto" />

      {/* ШАПКА - Фиксированная */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-start sm:items-center justify-between p-3 sm:p-6 pt-[calc(env(safe-area-inset-top,0.5rem)+0.5rem)] pointer-events-none">
        
        {/* Кнопка выхода */}
        <div className="pointer-events-auto">
          <button onClick={handleLogout} className="text-rose-900/60 hover:text-rose-900 transition-colors flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[9px] uppercase tracking-[2px] font-bold glass-card px-2 py-1.5 sm:px-3 sm:py-2 rounded-full">
            <LogOut size={10} /> <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
        
        {/* Счётчик (по центру) */}
        <div className="pointer-events-auto flex-grow flex justify-center px-2">
          <LoveCounter />
        </div>
        
        {/* Плеер */}
        <div className="pointer-events-auto">
           <MiniPlayer isPlaying={isMusicPlaying} onToggle={() => setIsMusicPlaying(!isMusicPlaying)} />
        </div>
        
      </div>

      {/* БЕСКОНЕЧНАЯ ДОСКА ПОЛАРОИДОВ (ADAPTIVE SCREEN) */}
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center text-rose-900/60 z-10 pointer-events-none">
          <div className="w-8 h-8 border-2 border-t-rose-400 border-rose-900/20 rounded-full animate-spin mb-4" />
          <p className="text-[9px] uppercase tracking-[3px] font-bold">Проявляем снимки...</p>
        </div>
      ) : (
        <main ref={boardRef} className="absolute inset-0 z-10 overflow-hidden touch-none">
          {/* Центр доски (виртуальный ноль) */}
          <div className="absolute top-1/2 left-1/2 w-0 h-0">
             {Object.entries(polaroids).map(([id, data]) => (
                <Polaroid key={id} id={id} data={data} isNew={id === newCardId} onDelete={deletePolaroid} onSelect={setSelectedNoteId} boardRef={boardRef} />
             ))}
          </div>
        </main>
      )}

      {/* ВИНТАЖНЫЙ ФОТОАППАРАТ (Фиксированный внизу) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] flex flex-col items-center justify-end pointer-events-none">
         
         <AnimatePresence>
           {isCameraOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.9 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="glass-card p-4 sm:p-6 rounded-3xl w-[92%] sm:w-[90%] max-w-sm mb-4 sm:mb-6 flex flex-col relative pointer-events-auto shadow-2xl border-white/40"
             >
               <button onClick={() => setIsCameraOpen(false)} className="absolute top-4 right-4 text-rose-900/30 hover:text-rose-900/80 transition-colors"><X size={16}/></button>
               <h3 className="font-heading text-lg sm:text-xl text-rose-900 mb-3 sm:mb-4 text-center italic font-bold">Новый снимок</h3>
               
               {/* Добавление фото */}
               {noteImage ? (
                 <div className="relative w-full h-32 sm:h-40 mb-3 rounded-xl overflow-hidden border border-white/40 shadow-inner">
                   <img src={noteImage} alt="preview" className="w-full h-full object-cover" />
                   <button onClick={() => setNoteImage(null)} className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-sm"><X size={14}/></button>
                 </div>
               ) : (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-16 sm:h-20 mb-3 rounded-xl border border-dashed border-rose-900/30 bg-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-colors text-rose-900/60"
                 >
                   <ImagePlus size={20} className="mb-1 opacity-70" />
                   <span className="text-[9px] uppercase tracking-[1px] font-bold">Добавить фото</span>
                 </div>
               )}
               <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />

               <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Напишите записку..."
                  className="w-full h-16 sm:h-20 px-4 py-3 rounded-xl border border-white/30 bg-white/20 text-rose-950 focus:outline-none focus:border-white transition-all font-hand text-xl sm:text-2xl resize-none placeholder:font-body placeholder:text-xs placeholder:text-rose-900/40 mb-3 sm:mb-4" />
               <button onClick={sendPolaroid} disabled={!noteText.trim() && !noteImage}
                  className="btn-glow w-full py-3 sm:py-4 rounded-xl uppercase tracking-[2px] text-[10px] font-bold flex items-center justify-center gap-2">
                  <Camera size={14} /> Сделать снимок
               </button>
             </motion.div>
           )}
         </AnimatePresence>

         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCameraOpen(!isCameraOpen)}
            className="pointer-events-auto flex items-center justify-center w-14 h-14 sm:w-18 sm:h-18 rounded-full glass-card border border-white/40 shadow-[0_10px_30px_rgba(255,154,158,0.5)] group overflow-hidden"
         >
            {/* Стилизация под милый объектив */}
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center shadow-inner relative">
               <Camera size={20} className="text-rose-600 group-hover:text-rose-500 transition-colors relative z-10" />
            </div>
         </motion.button>
      </div>

      {/* ОВЕРЛЕЙ ДЛЯ РАСШИРЕННОГО ПРОСМОТРА ПОЛАРОИДА */}
      <AnimatePresence>
        {selectedNoteId && polaroids[selectedNoteId] && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSelectedNoteId(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 cursor-pointer"
          >
            <motion.div
              layoutId={`polaroid-${selectedNoteId}`}
              className="bg-[#fffdf8] p-4 sm:p-6 pb-12 sm:pb-16 shadow-2xl rounded-md w-full max-w-sm sm:max-w-md cursor-auto border border-rose-900/5 relative"
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card itself
            >
              {/* Закрыть крестик */}
              <button onClick={() => setSelectedNoteId(null)} className="absolute top-4 right-4 text-rose-900/30 hover:text-rose-900 transition-colors">
                <X size={20} />
              </button>

              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-200 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(255,154,158,0.4)] border border-rose-300" />
              
              <div className="w-full aspect-square bg-gradient-to-br from-rose-200 to-amber-100 rounded-sm mb-6 relative overflow-hidden shadow-[inset_0_0_15px_rgba(255,154,158,0.4)] flex items-center justify-center">
                {polaroids[selectedNoteId].image ? (
                  <img src={polaroids[selectedNoteId].image} alt="polaroid" className="w-full h-full object-contain bg-black/5" draggable={false} />
                ) : (
                  <Heart className="w-12 h-12 text-rose-400/30" fill="currentColor" />
                )}
              </div>

              {polaroids[selectedNoteId].note && (
                <div className="w-full overflow-hidden px-2">
                  <p className={`font-hand text-2xl sm:text-3xl text-center leading-tight break-words break-all ${polaroids[selectedNoteId].from === 'sv' ? 'text-[#3b3531]' : 'text-[#d94a4a]'}`}>
                    {polaroids[selectedNoteId].note}
                  </p>
                </div>
              )}
              
              <div className="absolute bottom-4 right-5 text-xs font-mono text-rose-900/30 font-bold uppercase">
                {polaroids[selectedNoteId].from}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
