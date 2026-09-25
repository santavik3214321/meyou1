import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause } from 'lucide-react';
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
const distanceRef = ref(db, 'distance-2026');
const PASSWORDS = { sv: '44', vika: '4' };

// ═══════════════════════════════════════════════════
// BACKGROUND & GRAIN (Shared across all scenes)
// ═══════════════════════════════════════════════════
function CinematicBackground() {
  return (
    <>
      <div className="bg-cinematic" />
      <div className="luxury-overlay" />
      <div className="bg-grain" />
    </>
  );
}

// ═══════════════════════════════════════════════════
// TIME TOGETHER (Minimalist Counter)
// ═══════════════════════════════════════════════════
function MinimalCounter() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Date.now() - new Date('2026-08-05T00:00:00+07:00').getTime());
      setT({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff / 36e5) % 24),
        m: Math.floor((diff / 6e4) % 60)
      });
    };
    tick();
    const id = setInterval(tick, 60000); // Update every minute for quiet luxury feel
    return () => clearInterval(id);
  }, []);
  
  return (
    <div className="flex flex-col items-center sm:items-end text-white/50">
      <span className="font-heading italic text-lg sm:text-xl text-white/80">{t.d} days</span>
      <span className="text-[9px] uppercase tracking-[0.2em] font-light mt-1">
        {String(t.h).padStart(2,'0')}:{String(t.m).padStart(2,'0')} UTC+7
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// AMBIENT PLAYER (Invisible HUD style)
// ═══════════════════════════════════════════════════
function AmbientPlayer({ playing, onToggle }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-3 text-white/50 hover:text-white transition group focus:outline-none">
      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition">
        {playing ? <Pause size={10} className="fill-current" /> : <Play size={10} className="fill-current ml-0.5" />}
      </div>
      <span className="text-[9px] uppercase tracking-[0.2em] font-light hidden sm:block">
        Ambient Audio
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('luxRole') || '');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('luxRole'));
  const [pwd, setPwd] = useState('');
  const [authErr, setAuthErr] = useState('');

  const [dbState, setDbState] = useState({ type: 'empty' });
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [crossing, setCrossing] = useState(false); 

  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isAuth) return;
    const unsub = onValue(distanceRef, (snap) => {
      setDbState(snap.val() || { type: 'empty' });
      setLoading(false);
    });
    return () => unsub();
  }, [isAuth]);

  useEffect(() => {
    if (audioRef.current) {
      if (musicOn) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(() => setMusicOn(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicOn]);

  const login = (e) => {
    e.preventDefault();
    if (!userRole) { setAuthErr('SELECT IDENTITY'); return; }
    if (pwd === PASSWORDS[userRole]) {
      localStorage.setItem('luxRole', userRole);
      setAuthErr('');
      setIsAuth(true);
    } else setAuthErr('INVALID CLEARANCE');
  };

  const logout = () => {
    localStorage.removeItem('luxRole');
    setUserRole(''); setPwd(''); setIsAuth(false);
  };

  const me = localStorage.getItem('luxRole');
  const isForMe = dbState.from && dbState.from !== me;

  const sendMessage = () => {
    if (!noteText.trim()) return;
    setWriting(false);
    setCrossing(true);
    setTimeout(() => {
      set(distanceRef, { type: 'message', note: noteText, from: me, timestamp: Date.now() });
      setCrossing(false);
      setNoteText('');
    }, 4000);
  };

  const consumeMessage = () => {
    set(distanceRef, { type: 'empty' });
    setReading(false);
    // Optional: open write immediately to reply
    // setWriting(true); 
  };

  // ═══ SCREEN: LOGIN ═══
  if (!isAuth) {
    return (
      <div className="min-h-[100dvh] flex flex-col relative">
        <CinematicBackground />
        <div className="relative z-20 flex-grow flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center w-full max-w-sm">
            
            <p className="text-[10px] text-white/50 uppercase tracking-[0.3em] mb-4 reveal-up font-light">
              3,700 Kilometers
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-medium text-white mb-16 tracking-wide reveal-up reveal-up-delay-1 text-center">
              The Distance
            </h1>

            <form onSubmit={login} className="w-full flex flex-col items-center reveal-up reveal-up-delay-2">
              <div className="flex w-full gap-4 mb-10">
                {[['sv', 'SUREN'], ['vika', 'VIKA']].map(([r, l]) => (
                  <button key={r} type="button" onClick={() => setUserRole(r)}
                    className={`flex-1 py-4 text-[10px] uppercase tracking-[0.2em] transition-all border ${
                      userRole === r
                        ? 'border-white text-white bg-white/10'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                    }`}>{l}</button>
                ))}
              </div>

              <input type="password" placeholder="ACCESS CODE" value={pwd} onChange={e => setPwd(e.target.value)}
                className="luxury-input w-full px-2 py-3 text-center text-sm tracking-[0.3em] font-light placeholder:text-white/20 mb-4" />
              <div className="h-4 mb-8">
                {authErr && <p className="text-[9px] text-red-300/70 uppercase tracking-widest">{authErr}</p>}
              </div>

              <button type="submit" className="luxury-btn w-full py-4 text-[10px] uppercase font-medium">
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══ SCREEN: MAIN HUD ═══
  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <CinematicBackground />
      {/* Cinematic dark ambient audio from a reliable source */}
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3" loop />

      {/* ─── HUD TOP ─── */}
      <div className="relative z-30 flex justify-between items-start p-6 sm:p-10 fade-in">
        <AmbientPlayer playing={musicOn} onToggle={() => setMusicOn(!musicOn)} />
        <MinimalCounter />
      </div>

      {/* ─── HUD CENTER ─── */}
      <main className="relative z-20 flex-grow flex flex-col items-center justify-center p-6">
        
        {loading ? (
          <div className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-light fade-in">
            Synchronizing...
          </div>
        ) : (
          <>
            {/* CROSSING ANIMATION */}
            {crossing && (
              <div className="flex flex-col items-center w-full max-w-md fade-in">
                <p className="font-heading italic text-2xl text-white/70 mb-8">Crossing the distance...</p>
                <div className="w-full crossing-line" />
              </div>
            )}

            {/* EMPTY STATE */}
            {dbState.type === 'empty' && !writing && !crossing && (
              <div className="flex flex-col items-center reveal-up">
                <button onClick={() => setWriting(true)} 
                  className="font-heading text-3xl sm:text-4xl italic text-white/50 hover:text-white transition duration-700 cursor-pointer mb-2 focus:outline-none">
                  Leave a message
                </button>
                <div className="w-px h-12 bg-white/20 mt-6" />
              </div>
            )}

            {/* MESSAGE SENT (Waiting for other person) */}
            {dbState.type === 'message' && !isForMe && !writing && !crossing && (
              <div className="flex flex-col items-center reveal-up">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4 font-light">Signal Sent</p>
                <p className="font-heading text-2xl italic text-white/60">Awaiting {me === 'sv' ? 'Vika' : 'Suren'}</p>
              </div>
            )}

            {/* MESSAGE ARRIVED (Orb) */}
            {dbState.type === 'message' && isForMe && !reading && !crossing && (
              <div className="flex flex-col items-center reveal-up">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 mb-12 font-light">
                  Transmission Received
                </p>
                <div className="message-orb" onClick={() => setReading(true)} />
                <p className="font-heading italic text-lg text-white/40 mt-12">Click to open</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── HUD BOTTOM ─── */}
      <div className="relative z-30 flex justify-center p-6 sm:p-10 fade-in">
        <button onClick={logout} className="text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-white/80 transition font-light">
          Disconnect
        </button>
      </div>

      {/* ─── MODALS ─── */}

      {/* WRITE MODAL */}
      {writing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 luxury-panel fade-in">
          <button onClick={() => setWriting(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition">
            <X size={24} strokeWidth={1} />
          </button>
          
          <div className="w-full max-w-lg flex flex-col reveal-up">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4 font-light">To {me === 'sv' ? 'Vika' : 'Suren'}</p>
            <textarea 
              value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-40 bg-transparent text-white font-serif text-2xl sm:text-3xl leading-relaxed focus:outline-none resize-none placeholder:text-white/10 placeholder:italic mb-12"
              autoFocus
            />
            <div className="flex justify-end">
              <button onClick={sendMessage} disabled={!noteText.trim()}
                className="luxury-btn px-10 py-4 text-[10px] uppercase font-medium">
                Transmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READ MODAL (Luxury Magazine Style) */}
      {reading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 fade-in">
          <div className="letter-modal w-full max-w-2xl min-h-[50vh] p-10 sm:p-16 flex flex-col relative">
            
            <p className="text-[9px] uppercase tracking-[0.3em] text-black/40 mb-12 font-light border-b border-black/10 pb-4">
              Received • {new Date(dbState.timestamp || Date.now()).toLocaleDateString()}
            </p>
            
            <p className="font-serif text-2xl sm:text-4xl text-black/90 leading-relaxed mb-16 whitespace-pre-wrap">
              {dbState.note}
            </p>
            
            <div className="mt-auto flex justify-between items-end">
              <p className="font-heading italic text-xl text-black/60">
                — {dbState.from === 'sv' ? 'Suren' : 'Vika'}
              </p>
              
              <button onClick={consumeMessage}
                className="border border-black/20 text-black/70 hover:bg-black hover:text-white transition duration-500 px-6 py-3 text-[9px] uppercase tracking-[0.2em] font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
