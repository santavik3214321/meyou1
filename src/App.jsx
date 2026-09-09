import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Heart, Copy, Check, Sparkles, MessageCircleHeart, X } from 'lucide-react';
import { Peer } from 'peerjs';

// ─── Компонент: Летающие Частицы ───────────────────────────
function MagicParticles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${15 + Math.random() * 20}s`,
      animationDelay: `${Math.random() * 10}s`,
      opacity: 0.1 + Math.random() * 0.3,
      scale: 0.2 + Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{ left: p.left, width: '10px', height: '10px', animation: `float-particle ${p.animationDuration} linear infinite`, animationDelay: p.animationDelay, opacity: p.opacity, transform: `scale(${p.scale})` }} />
      ))}
    </div>
  );
}

// ─── Компонент: Счетчик Времени (С учетом Safe Area) ───────
function TimeCounter() {
  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const startDate = new Date('2026-08-05T00:00:00+04:00').getTime();
    const updateTimer = () => {
      const diff = new Date().getTime() - startDate;
      if (diff > 0) {
        setTimePassed({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60)
        });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="pointer-events-none premium-glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center justify-center gap-1.5 shadow-lg border border-white/10 animate-blur-fade">
      <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 animate-pulse" fill="currentColor" />
      <div className="flex gap-1 sm:gap-1.5 items-baseline">
        <span className="text-xs sm:text-sm font-bold text-white tracking-wide">{timePassed.days}д</span>
        <span className="text-[10px] sm:text-xs text-white/70">{String(timePassed.hours).padStart(2, '0')}:{String(timePassed.minutes).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// ─── Компонент: Музыкальный плеер (С учетом Safe Area) ──────
function MusicPlayer({ isPlaying, toggleMusic, setMusicState }) {
  const audioRef = useRef(null);
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Audio playback blocked", err);
          if (setMusicState) setMusicState(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setMusicState]);
  return (
    <>
      <audio ref={audioRef} src="/music/sting.mp3" loop autoPlay />
      <button onClick={toggleMusic} className={`pointer-events-auto premium-glass w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 border shadow-lg ${isPlaying ? 'border-rose-400/50 animate-pulse-ring' : 'border-white/10 opacity-70'} animate-blur-fade hover:scale-110 active:scale-90`}>
        {isPlaying ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />}
      </button>
    </>
  );
}

// ─── Компонент: Общий Холст (Live Touch) ───────────────────
function SharedCanvas({ connection, onDisconnect, isHost }) {
  const canvasRef = useRef(null);
  const localPos = useRef({ x: -100, y: -100 });
  const remotePos = useRef({ x: -100, y: -100 });
  const ripples = useRef([]);
  
  // Созвездие (Секрет)
  const isSyncing = useRef(false);
  const syncStartTime = useRef(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const localColor = isHost ? '#00e5ff' : '#ff3385';
  const remoteColor = isHost ? '#ff3385' : '#00e5ff';
  
  useEffect(() => {
    if (!connection) return;
    const handleData = (data) => {
      if (data.type === 'pointer') {
        const x = data.x * window.innerWidth;
        const y = data.y * window.innerHeight;
        remotePos.current = { x, y };
        checkCollision(localPos.current.x, localPos.current.y, x, y);
      }
      if (data.type === 'unlock') {
        setSecretUnlocked(true);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
      }
    };
    connection.on('data', handleData);
    connection.on('close', onDisconnect);
    connection.on('error', onDisconnect);
    return () => {
      connection.off('data', handleData);
      connection.off('close', onDisconnect);
      connection.off('error', onDisconnect);
    };
  }, [connection, onDisconnect]);

  const handlePointerMove = (e) => {
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    
    localPos.current = { x: clientX, y: clientY };
    
    if (connection && connection.open) {
      connection.send({
        type: 'pointer',
        x: clientX / window.innerWidth,
        y: clientY / window.innerHeight
      });
    }
    checkCollision(clientX, clientY, remotePos.current.x, remotePos.current.y);
  };
  
  const handlePointerUp = () => {
     localPos.current = { x: -100, y: -100 };
     if (connection && connection.open) connection.send({ type: 'pointer', x: -1, y: -1 });
     isSyncing.current = false;
     setSyncProgress(0);
  }
  
  const createRipple = (x, y) => {
    ripples.current.push({ x, y, radius: 0, alpha: 1, color: '#f48fb1' });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const checkCollision = (lx, ly, rx, ry) => {
    if (lx < 0 || rx < 0) return; 
    const dist = Math.hypot(lx - rx, ly - ry);
    
    if (dist < 50) {
      if (!isSyncing.current) {
         isSyncing.current = true;
         syncStartTime.current = Date.now();
         createRipple((lx+rx)/2, (ly+ry)/2);
      } else {
         const elapsed = Date.now() - syncStartTime.current;
         const progress = Math.min((elapsed / 4000) * 100, 100);
         setSyncProgress(progress);
         
         if (elapsed > 4000 && !secretUnlocked) {
            setSecretUnlocked(true);
            setSyncProgress(0);
            if (connection && connection.open) connection.send({ type: 'unlock' });
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
         }
      }
    } else {
      if (isSyncing.current) {
        isSyncing.current = false;
        setSyncProgress(0);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    
    let animationId;
    const render = () => {
      ctx.fillStyle = 'rgba(8, 6, 20, 0.08)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const r = ripples.current[i];
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 107, 158, ${r.alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        r.radius += 4;
        r.alpha -= 0.02;
        if (r.alpha <= 0) ripples.current.splice(i, 1);
      }

      if (remotePos.current.x >= 0) {
        ctx.beginPath();
        ctx.arc(remotePos.current.x, remotePos.current.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = remoteColor;
        ctx.shadowColor = remoteColor;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(remotePos.current.x, remotePos.current.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      if (localPos.current.x >= 0) {
        ctx.beginPath();
        ctx.arc(localPos.current.x, localPos.current.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = localColor;
        ctx.shadowColor = localColor;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(localPos.current.x, localPos.current.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [localColor, remoteColor]);

  return (
    <div 
      className="absolute inset-0 touch-none cursor-crosshair z-0 overflow-hidden" 
      style={{ backgroundColor: '#080614' }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchStart={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {syncProgress > 0 && !secretUnlocked && (
        <div 
          className="absolute pointer-events-none transition-all duration-100 ease-out"
          style={{ 
            left: (localPos.current.x + remotePos.current.x)/2, 
            top: (localPos.current.y + remotePos.current.y)/2, 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <svg width="80" height="80" className="animate-pulse">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,107,158,0.2)" strokeWidth="4" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="#ff6b9e" strokeWidth="4" 
                    strokeDasharray="226" strokeDashoffset={226 - (226 * syncProgress) / 100}
                    className="transition-all duration-100" style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
             <Heart className="w-8 h-8 text-rose-500 animate-breathe" fill="#f48fb1" />
          </div>
        </div>
      )}
      
      {!secretUnlocked && (
        <div className="absolute top-[30vh] left-1/2 -translate-x-1/2 text-white/40 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-center font-bold font-body animate-breathe pointer-events-none w-[90%]">
          Коснитесь друг друга и не отпускайте
        </div>
      )}

      {secretUnlocked && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-blur-fade pointer-events-auto overflow-y-auto">
          <div className="premium-glass p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center relative animate-pop-up border border-rose-400/30 shadow-[0_0_50px_rgba(255,107,158,0.2)] m-auto">
            <button onClick={() => setSecretUnlocked(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2">
              <X size={20} />
            </button>
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 mx-auto mb-4 animate-pulse-ring rounded-full" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold mb-4 text-white drop-shadow-md">Созвездие Открыто!</h2>
            <p className="text-rose-100/90 font-body text-xs sm:text-sm leading-relaxed mb-6">
              Расстояние в 3700 км не имеет значения, когда наши руки тянутся друг к другу.<br/><br/>
              <span className="font-hand text-xl sm:text-2xl text-rose-300 rotate-[-2deg] inline-block mt-2">Только моя принцесса ❤️</span>
            </p>
            <button onClick={() => setSecretUnlocked(false)} className="premium-btn w-full py-3 rounded-xl text-white text-xs sm:text-sm font-bold tracking-wider">
              Продолжить магию
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Главное Приложение ────────────────────────────────────
export default function App() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(true); 

  useEffect(() => {
    try {
      const id = 'vika-sv-love-' + Math.random().toString(36).substring(2, 6);
      const newPeer = new Peer(id);
      
      newPeer.on('open', (id) => setPeerId(id));

      newPeer.on('connection', (conn) => {
        setIsHost(true);
        conn.on('open', () => setConnection(conn));
        conn.on('close', () => setConnection(null));
      });
      
      newPeer.on('error', (err) => {
        setError('Ошибка сети. Проверьте интернет.');
        setIsConnecting(false);
      });

      setPeer(newPeer);
      return () => newPeer.destroy();
    } catch (e) {
      console.error(e);
      setError('Ошибка сети.');
    }
  }, []);

  const handleConnect = () => {
    if (peer && remotePeerId) {
      setIsConnecting(true);
      setError('');
      try {
        const conn = peer.connect(remotePeerId);
        setIsHost(false);
        
        conn.on('open', () => {
          setConnection(conn);
          setIsConnecting(false);
        });
        conn.on('error', () => {
          setError('Связь прервалась.');
          setIsConnecting(false);
        });
        conn.on('close', () => setConnection(null));
      } catch (e) {
         setError('Не удалось создать канал.');
         setIsConnecting(false);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-[100dvh] text-white relative font-body flex flex-col bg-[#080614] overflow-x-hidden">
      
      {/* ── Общий слой UI поверх всего (Таймер и Музыка) ── */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none p-4 sm:p-6 pb-0 pt-[calc(env(safe-area-inset-top,1rem)+1rem)] flex justify-between items-start">
         <TimeCounter />
         <MusicPlayer isPlaying={isMusicPlaying} toggleMusic={() => setIsMusicPlaying(!isMusicPlaying)} setMusicState={setIsMusicPlaying} />
      </div>

      {/* ── Состояние 1: Экран Холста ── */}
      {connection ? (
        <SharedCanvas connection={connection} onDisconnect={() => setConnection(null)} isHost={isHost} />
      ) : (
        /* ── Состояние 2: Лобби (Скроллируемое на мобилках) ── */
        <>
          <div className="premium-bg fixed inset-0 z-0 pointer-events-none" />
          <MagicParticles />
          
          <main className="relative z-10 w-full flex-grow flex items-center justify-center p-4 pt-32 pb-[env(safe-area-inset-bottom,2rem)]">
            <div className="premium-glass p-6 sm:p-8 rounded-[2rem] w-full max-w-sm animate-blur-fade flex flex-col items-center">
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(255,107,158,0.2)]">
                <MessageCircleHeart className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400" />
              </div>
              
              <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2 text-white text-center drop-shadow-md">
                Живое Касание
              </h1>
              <p className="text-white/60 mb-6 text-center text-xs sm:text-sm px-2 leading-relaxed font-light">
                Мост через 3 700 км. Отправь код половинке, чтобы прикоснуться сквозь экран.
              </p>

              <div className="w-full bg-black/20 p-4 sm:p-5 rounded-2xl border border-white/5 mb-6 relative group">
                <p className="text-[9px] sm:text-[10px] text-rose-200/50 uppercase tracking-widest font-bold mb-3 text-center">Твой личный код</p>
                <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-1 pl-4 border border-white/10">
                  <span className="text-xs sm:text-sm font-mono text-rose-300 font-medium tracking-wide truncate">
                    {peerId || '...'}
                  </span>
                  <button onClick={copyToClipboard} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-all shrink-0">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="w-full flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Введи её код..." 
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-white/10 bg-black/30 text-white text-center text-xs sm:text-sm focus:outline-none focus:border-rose-400/50 focus:bg-black/50 transition-all font-mono placeholder:text-white/20 placeholder:font-body"
                />
                {error && <p className="text-[10px] sm:text-xs text-rose-400 text-center">{error}</p>}
                
                <button 
                  onClick={handleConnect}
                  disabled={!remotePeerId || isConnecting}
                  className="premium-btn w-full py-3 sm:py-4 mt-1 rounded-xl text-white uppercase tracking-widest text-[10px] sm:text-xs font-bold disabled:opacity-50"
                >
                  {isConnecting ? 'Соединяем...' : 'Прикоснуться'}
                </button>
              </div>

            </div>
          </main>
        </>
      )}
    </div>
  );
}
