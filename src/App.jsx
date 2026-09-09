import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Heart, Copy, Check, Users } from 'lucide-react';
import Peer from 'peerjs';

// ─── Компонент: Летающие Лепестки / Волшебная Пыльца ───────
function MagicParticles() {
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${10 + Math.random() * 15}s`,
      animationDelay: `${Math.random() * 10}s`,
      opacity: 0.3 + Math.random() * 0.5,
      scale: 0.5 + Math.random() * 0.8,
    }));
    setPetals(newPetals);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map(p => (
        <div key={p.id} className="petal" style={{ left: p.left, animation: `float-petal ${p.animationDuration} linear infinite`, animationDelay: p.animationDelay, opacity: p.opacity, transform: `scale(${p.scale})` }} />
      ))}
    </div>
  );
}

// ─── Компонент: Счетчик Времени ──────────────────────────
function TimeCounter() {
  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const startDate = new Date('2026-08-05T00:00:00+04:00').getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - startDate;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimePassed({ days, hours, minutes, seconds });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] glass px-4 py-2 sm:px-5 sm:py-2.5 rounded-[1.25rem] sm:rounded-full flex items-center justify-center gap-3 sm:gap-4 shadow-sm border border-white/60 animate-blur-fade">
      <div className="flex flex-col items-center min-w-[28px]">
        <span className="text-sm sm:text-base font-bold text-rose-500 font-heading leading-none">{timePassed.days}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest leading-none mt-1.5">дней</span>
      </div>
      <div className="w-px h-5 sm:h-6 bg-rose-200/60"></div>
      <div className="flex flex-col items-center min-w-[20px]">
        <span className="text-sm sm:text-base font-bold text-rose-500 font-heading leading-none">{String(timePassed.hours).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest leading-none mt-1.5">час</span>
      </div>
      <div className="w-px h-5 sm:h-6 bg-rose-200/60"></div>
      <div className="flex flex-col items-center min-w-[20px]">
        <span className="text-sm sm:text-base font-bold text-rose-500 font-heading leading-none">{String(timePassed.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest leading-none mt-1.5">мин</span>
      </div>
      <div className="w-px h-5 sm:h-6 bg-rose-200/60"></div>
      <div className="flex flex-col items-center min-w-[20px]">
        <span className="text-sm sm:text-base font-bold text-rose-500 font-heading leading-none">{String(timePassed.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest leading-none mt-1.5">сек</span>
      </div>
    </div>
  );
}

// ─── Компонент: Музыкальный плеер ──────────────────────────
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
      <button onClick={toggleMusic} className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] glass px-4 py-2.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-white/90 transition-all duration-300 border border-white/60 shadow-[0_4px_20px_rgba(244,143,177,0.3)] animate-blur-fade">
        {isPlaying ? (
          <><Volume2 className="w-5 h-5 text-rose-500 animate-breathe" /><span className="text-xs font-bold text-rose-500 uppercase tracking-wider hidden sm:inline">Музыка</span></>
        ) : (
          <><VolumeX className="w-5 h-5 text-gray-400" /><span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">Звук</span></>
        )}
      </button>
    </>
  );
}

// ─── Компонент: Общий Холст (Live Touch) ───────────────────
function SharedCanvas({ connection, onDisconnect }) {
  const canvasRef = useRef(null);
  const localPos = useRef({ x: -100, y: -100 });
  const remotePos = useRef({ x: -100, y: -100 });
  const [hearts, setHearts] = useState([]);
  
  useEffect(() => {
    if (!connection) return;
    const handleData = (data) => {
      if (data.type === 'pointer') {
        const x = data.x * window.innerWidth;
        const y = data.y * window.innerHeight;
        remotePos.current = { x, y };
        checkCollision(localPos.current.x, localPos.current.y, x, y);
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
     if (connection && connection.open) {
        connection.send({ type: 'pointer', x: -1, y: -1 });
     }
  }
  
  const checkCollision = (lx, ly, rx, ry) => {
    if (lx < 0 || rx < 0) return; 
    const dist = Math.hypot(lx - rx, ly - ry);
    if (dist < 50) {
      setHearts(prev => {
        if (prev.length > 0 && Date.now() - prev[prev.length-1].time < 1500) return prev;
        if (navigator.vibrate) navigator.vibrate(50);
        const id = Date.now();
        setTimeout(() => {
          setHearts(h => h.filter(heart => heart.id !== id));
        }, 3000);
        return [...prev, { id, x: (lx+rx)/2, y: (ly+ry)/2, time: Date.now() }];
      });
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
      ctx.fillStyle = 'rgba(15, 10, 30, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (remotePos.current.x >= 0) {
        ctx.beginPath();
        ctx.arc(remotePos.current.x, remotePos.current.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b9e';
        ctx.shadowColor = '#ff6b9e';
        ctx.shadowBlur = 25;
        ctx.fill();
      }

      if (localPos.current.x >= 0) {
        ctx.beginPath();
        ctx.arc(localPos.current.x, localPos.current.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 25;
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 touch-none cursor-crosshair z-0" 
      style={{ backgroundColor: '#0f0a1e' }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchStart={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {hearts.map(h => (
        <div 
          key={h.id}
          className="absolute pointer-events-none animate-photo-3d z-50"
          style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}
        >
          <Heart className="text-rose-500 w-24 h-24 drop-shadow-[0_0_40px_rgba(244,143,177,1)]" fill="#f48fb1" />
        </div>
      ))}
      
      <div className="absolute top-32 left-1/2 -translate-x-1/2 text-white/50 text-sm tracking-widest uppercase text-center font-bold font-body animate-breathe pointer-events-none">
        Коснитесь друг друга сквозь 3700 км...
      </div>
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

  useEffect(() => {
    // Force a specific ID prefix to ensure a clean connection but random suffix
    const id = 'vika-sv-love-' + Math.random().toString(36).substring(2, 9);
    const newPeer = new Peer(id);
    
    newPeer.on('open', (id) => {
      setPeerId(id);
    });

    newPeer.on('connection', (conn) => {
      // Someone connected to us
      conn.on('open', () => {
        setConnection(conn);
      });
      conn.on('close', () => setConnection(null));
    });
    
    newPeer.on('error', (err) => {
      setError('Ошибка соединения: ' + err.message);
      setIsConnecting(false);
    });

    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const handleConnect = () => {
    if (peer && remotePeerId) {
      setIsConnecting(true);
      setError('');
      const conn = peer.connect(remotePeerId);
      
      conn.on('open', () => {
        setConnection(conn);
        setIsConnecting(false);
      });
      
      conn.on('error', (err) => {
        setError('Не удалось подключиться: ' + err.message);
        setIsConnecting(false);
      });
      
      conn.on('close', () => setConnection(null));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1) Если уже соединены — показываем общий холст
  if (connection) {
    return (
      <div className="min-h-screen overflow-hidden relative font-body">
         <TimeCounter />
         <SharedCanvas connection={connection} onDisconnect={() => setConnection(null)} />
         <div className="opacity-100 transition-opacity duration-1000 z-50">
           <MusicPlayer isPlaying={isMusicPlaying} toggleMusic={() => setIsMusicPlaying(!isMusicPlaying)} setMusicState={setIsMusicPlaying} />
         </div>
      </div>
    );
  }

  // 2) Экран Лобби для соединения
  return (
    <div className="min-h-screen text-text-main overflow-x-hidden relative font-body selection:bg-rose-200 flex flex-col">
      <div className="magic-bg fixed inset-0 z-0" />
      <div className="fixed inset-0 z-0 pointer-events-none"><MagicParticles /></div>
      
      <TimeCounter />
      
      <main className="relative z-10 w-full flex-grow flex items-center justify-center py-10 px-4 sm:px-8">
        <div className="quest-container animate-blur-fade text-center max-w-md w-full glass p-6 sm:p-8">
          <Heart className="w-16 h-16 text-rose-400 mx-auto mb-6 animate-breathe drop-shadow-[0_0_20px_rgba(244,143,177,0.6)]" fill="currentColor" />
          <h1 className="font-heading text-3xl font-medium mb-2 text-gray-800">
            Живое Касание
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Создайте прямое соединение между Кемерово и Ереваном, чтобы коснуться друг друга.
          </p>

          <div className="mb-8 p-4 bg-white/50 rounded-2xl border border-rose-100 relative">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">Твой секретный код:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm sm:text-base font-mono text-rose-500 font-bold break-all bg-white px-3 py-1 rounded shadow-sm">
                {peerId || 'Создаю канал...'}
              </span>
              {peerId && (
                <button onClick={copyToClipboard} className="p-2 bg-white hover:bg-rose-50 shadow-sm rounded-full transition-colors text-rose-400 shrink-0">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Отправь этот код своей половинке</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold text-left px-2">Или введи её код:</p>
            <input 
              type="text" 
              placeholder="Код для подключения..." 
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white/80 text-center text-sm sm:text-base shadow-inner font-mono text-gray-600"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            
            <button 
              onClick={handleConnect}
              disabled={!remotePeerId || isConnecting}
              className="glass-btn w-full py-4 mt-2 rounded-xl text-rose-500 uppercase tracking-widest text-sm font-bold shadow-[0_10px_30px_rgba(244,143,177,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isConnecting ? 'Подключение...' : <><Users size={18} /> Соединить сердца</>}
            </button>
          </div>
        </div>
      </main>

      <div className="opacity-100 transition-opacity duration-1000 z-50">
        <MusicPlayer isPlaying={isMusicPlaying} toggleMusic={() => setIsMusicPlaying(!isMusicPlaying)} setMusicState={setIsMusicPlaying} />
      </div>
    </div>
  );
}
