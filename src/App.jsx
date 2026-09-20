import React, { useState, useEffect, useRef } from 'react';
import { Lock, Coffee, Croissant, Send, Volume2, VolumeX, Heart, X, LogOut } from 'lucide-react';

const SECRET_PASSWORD = '58';
const STORAGE_KEY = 'cafe-table-state';

// ─── Компонент: Эффект Дождя ───────────────────────────
function RainEffect() {
  const [drops, setDrops] = useState([]);
  useEffect(() => {
    const newDrops = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${0.5 + Math.random() * 1}s`,
      delay: `${Math.random() * 2}s`,
    }));
    setDrops(newDrops);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {drops.map(d => (
        <div key={d.id} className="rain-drop" style={{ left: d.left, animationDuration: d.duration, animationDelay: d.delay }} />
      ))}
    </div>
  );
}

// ─── Компонент: Пар от кофе ────────────────────────────
function SteamEffect() {
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex justify-center gap-1 w-full pointer-events-none">
      <div className="steam" style={{ animation: 'steam-rise 2s ease-in-out infinite 0s' }} />
      <div className="steam" style={{ animation: 'steam-rise 2.5s ease-in-out infinite 0.5s' }} />
      <div className="steam" style={{ animation: 'steam-rise 2.2s ease-in-out infinite 1s' }} />
    </div>
  );
}

// ─── Хранилище (localStorage) ────────────────────────────
function saveTableState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadTableState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { type: 'empty' };
  } catch {
    return { type: 'empty' };
  }
}

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('cafeRole') || '');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [tableState, setTableState] = useState(loadTableState);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const [isLeavingItem, setIsLeavingItem] = useState(false);
  const [itemType, setItemType] = useState('coffee');
  const [noteText, setNoteText] = useState('');

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!userRole) {
      setAuthError('Выберите кто вы');
      return;
    }
    if (password === SECRET_PASSWORD) {
      localStorage.setItem('cafeRole', userRole);
      setAuthError('');
      setUserRole(userRole + ' '); // Trick to force re-render
      setUserRole(userRole);
    } else {
      setAuthError('Неверный пароль');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cafeRole');
    setUserRole('');
    setPassword('');
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => setIsMusicPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const sendItem = () => {
    if (!noteText.trim()) return;
    const newState = {
      type: itemType,
      note: noteText,
      from: localStorage.getItem('cafeRole'),
      timestamp: Date.now()
    };
    saveTableState(newState);
    setTableState(newState);
    setIsLeavingItem(false);
    setNoteText('');
  };

  const consumeItem = () => {
    const emptyState = { type: 'empty' };
    saveTableState(emptyState);
    setTableState(emptyState);
    setIsNoteOpen(false);
    setIsLeavingItem(true);
  };

  // ═══ ЭКРАН ВХОДА ═══
  if (!localStorage.getItem('cafeRole')) {
    return (
      <div className="min-h-[100dvh] bg-[#0b090a] flex items-center justify-center p-4 relative overflow-hidden font-body">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1318] to-[#0a080c] z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] z-0" />

        <form onSubmit={handleLogin} className="premium-glass p-8 sm:p-10 rounded-3xl w-full max-w-sm z-10 animate-blur-fade flex flex-col items-center border border-white/5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-6 h-6 text-rose-300/70" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2 tracking-wide">Private Space</h1>
          <p className="text-white/40 text-xs mb-8 text-center uppercase tracking-[0.2em]">Только для двоих</p>

          <div className="flex w-full gap-3 mb-6">
            <button type="button" onClick={() => setUserRole('sv')} className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${userRole === 'sv' ? 'bg-rose-500/20 border-rose-400/50 text-rose-200' : 'bg-black/30 border-white/10 text-white/50 hover:bg-black/50'}`}>
              Я — Сурен
            </button>
            <button type="button" onClick={() => setUserRole('vika')} className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${userRole === 'vika' ? 'bg-rose-500/20 border-rose-400/50 text-rose-200' : 'bg-black/30 border-white/10 text-white/50 hover:bg-black/50'}`}>
              Я — Вика
            </button>
          </div>

          <input
            type="password"
            placeholder="Секретный код..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/40 text-white text-center focus:outline-none focus:border-rose-400/50 transition-all font-mono tracking-widest placeholder:tracking-normal placeholder:text-white/20 mb-4"
          />
          {authError && <p className="text-xs text-rose-400 mb-4">{authError}</p>}

          <button type="submit" className="premium-btn w-full py-4 rounded-xl text-white uppercase tracking-[0.1em] text-xs font-bold">
            Войти
          </button>
        </form>
      </div>
    );
  }

  // ═══ ЭКРАН КАФЕ ═══
  return (
    <div className="min-h-[100dvh] flex flex-col relative font-body bg-[#0b090a] overflow-hidden">

      {/* ═══ РОМАНТИЧНЫЙ ФОН КАФЕ ═══ */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0a1128 0%, #1a2a4f 100%)' }} />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Теплые лампы */}
        <div className="absolute" style={{ bottom: '20%', left: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,170,50,0.15) 0%, rgba(255,140,20,0.05) 40%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'candle-flicker 4s ease-in-out infinite' }} />
        <div className="absolute" style={{ top: '25%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,160,50,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', animation: 'candle-flicker 3s ease-in-out infinite 1s' }} />

        {/* Стекло окна */}
        <div className="absolute inset-0" style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderBottom: '2px solid rgba(255,255,255,0.05)' }} />

        {/* Боке огни */}
        {[
          { l: '10%', t: '20%', s: 80, o: 0.6, blur: 15, delay: 0 },
          { l: '70%', t: '30%', s: 120, o: 0.5, blur: 20, delay: 1 },
          { l: '85%', t: '15%', s: 60, o: 0.7, blur: 10, delay: 2 },
          { l: '20%', t: '40%', s: 90, o: 0.4, blur: 18, delay: 1.5 },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-full" style={{ left: b.l, top: b.t, width: `${b.s}px`, height: `${b.s}px`, background: `rgba(255, 170, 50, ${b.o})`, filter: `blur(${b.blur}px)`, animation: `bokeh-float 4s ease-in-out infinite alternate`, animationDelay: `${b.delay}s` }} />
        ))}

        {/* Поверхность стола */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '35%', background: 'linear-gradient(180deg, #3d2417 0%, #1e1109 100%)', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8)', borderTop: '1px solid rgba(255,170,50,0.2)' }} />
      </div>

      <RainEffect />
      <audio ref={audioRef} src="/music/sting.mp3" loop />

      {/* ШАПКА */}
      <div className="relative z-50 flex justify-between items-center p-4 sm:p-6 pt-[calc(env(safe-area-inset-top,0.5rem)+0.75rem)]">
        <button onClick={handleLogout} className="text-white/40 hover:text-white/80 transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold bg-black/30 px-3 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <LogOut size={12} /> Выйти
        </button>

        <button onClick={() => setIsMusicPlaying(!isMusicPlaying)} className={`premium-glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all border shadow-lg hover:scale-105 ${isMusicPlaying ? 'border-rose-400/50' : 'border-white/10 opacity-70'}`}>
          {isMusicPlaying ? <Volume2 className="w-4 h-4 text-rose-300" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      {/* ОСНОВНАЯ СЦЕНА */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">

        {/* СЦЕНА 1: Стол пуст */}
        {tableState.type === 'empty' && !isLeavingItem && (
          <div className="flex flex-col items-center text-center animate-blur-fade">
            <div className="w-24 h-24 sm:w-32 sm:h-32 border border-white/5 rounded-full flex items-center justify-center mb-8 bg-white/5 backdrop-blur-sm shadow-inner relative">
              <span className="text-white/20 text-sm">Пусто</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium text-white/90 mb-3">Ваш столик свободен</h2>
            <p className="text-white/40 text-sm mb-10 max-w-xs font-light">
              Оставьте заботливый жест, чтобы {localStorage.getItem('cafeRole') === 'sv' ? 'Вика улыбнулась' : 'Сурен улыбнулся'}, когда зайдет.
            </p>
            <button onClick={() => setIsLeavingItem(true)} className="premium-btn px-8 py-4 rounded-2xl text-rose-100 uppercase tracking-[0.15em] text-xs font-bold flex items-center gap-3">
              <Coffee size={16} /> Оставить сюрприз
            </button>
          </div>
        )}

        {/* СЦЕНА 2: На столе что-то есть */}
        {tableState.type !== 'empty' && !isLeavingItem && (
          <div className="flex flex-col items-center animate-blur-fade relative w-full max-w-md">

            <p className="text-rose-200/60 text-xs sm:text-sm uppercase tracking-widest mb-12 font-semibold">
              {tableState.from === localStorage.getItem('cafeRole')
                ? 'Вы оставили это. Ждем...'
                : `${tableState.from === 'sv' ? 'Сурен оставил' : 'Вика оставила'} сюрприз для вас`}
            </p>

            <div
              onClick={() => {
                if (tableState.from !== localStorage.getItem('cafeRole')) setIsNoteOpen(true);
              }}
              className={`relative mb-8 transition-transform duration-500 ease-out ${tableState.from !== localStorage.getItem('cafeRole') ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-70'}`}
            >
              {tableState.type === 'coffee' && (
                <div className="relative">
                  <SteamEffect />
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#e2d5c4] rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_-10px_20px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-[#fffaf0] relative z-10">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#4a2e1b] shadow-inner border-2 border-[#8c6239] flex items-center justify-center overflow-hidden">
                      <Heart className="w-8 h-8 text-[#d4b595] opacity-80" fill="currentColor" />
                    </div>
                  </div>
                </div>
              )}

              {tableState.type === 'dessert' && (
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/5 backdrop-blur-md rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center relative z-10">
                    <Croissant className="w-16 h-16 sm:w-20 sm:h-20 text-[#d4a373] drop-shadow-xl" strokeWidth={1} />
                  </div>
                </div>
              )}

              {tableState.from !== localStorage.getItem('cafeRole') && !isNoteOpen && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] uppercase tracking-widest whitespace-nowrap animate-pulse">
                  Нажмите, чтобы открыть
                </div>
              )}
            </div>

            {isNoteOpen && (
              <div className="napkin p-6 sm:p-8 w-[90%] sm:w-full min-h-[160px] animate-napkin flex flex-col justify-between z-20 absolute top-28 sm:top-36">
                <p className="font-hand text-2xl sm:text-3xl text-[#3b3531] leading-relaxed mb-6 -rotate-1">
                  "{tableState.note}"
                </p>
                <div className="flex justify-between items-end border-t border-black/10 pt-4 mt-auto">
                  <span className="font-hand text-lg text-rose-500/80 -rotate-2">
                    От: {tableState.from === 'sv' ? 'Твоего Сурена' : 'Твоей принцессы'} ❤️
                  </span>
                  <button onClick={consumeItem} className="text-[10px] uppercase tracking-widest bg-[#2c2a29] text-[#fdfbf7] px-4 py-2 rounded shadow-md hover:bg-black transition-colors font-body font-bold">
                    Ответить
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* СЦЕНА 3: Форма */}
        {isLeavingItem && (
          <div className="premium-glass p-6 sm:p-8 rounded-3xl w-full max-w-md animate-blur-fade border border-white/10 shadow-2xl flex flex-col relative z-20">
            <button onClick={() => setIsLeavingItem(false)} className="absolute top-4 right-4 text-white/30 hover:text-white/80 p-2">
              <X size={20} />
            </button>
            <h3 className="font-heading text-xl sm:text-2xl text-white mb-6 text-center">Что оставим на столике?</h3>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setItemType('coffee')}
                className={`flex-1 py-6 flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all ${itemType === 'coffee' ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(255,107,158,0.2)]' : 'bg-black/30 border-white/5 text-white/50 hover:bg-black/50'}`}
              >
                <Coffee size={28} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest font-bold">Кофе</span>
              </button>
              <button
                onClick={() => setItemType('dessert')}
                className={`flex-1 py-6 flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all ${itemType === 'dessert' ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(255,107,158,0.2)]' : 'bg-black/30 border-white/5 text-white/50 hover:bg-black/50'}`}
              >
                <Croissant size={28} strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-widest font-bold">Десерт</span>
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Напишите записку на салфетке..."
              className="w-full h-32 px-5 py-4 rounded-xl border border-white/10 bg-black/40 text-rose-100/90 text-sm focus:outline-none focus:border-rose-400/50 transition-all font-hand text-xl sm:text-2xl resize-none placeholder:font-body placeholder:text-sm placeholder:text-white/20 mb-6"
            />

            <button
              onClick={sendItem}
              disabled={!noteText.trim()}
              className="premium-btn w-full py-4 rounded-xl text-white uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> Оставить на столике
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
