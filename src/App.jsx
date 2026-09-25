import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Text, Sparkles, ContactShadows, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { X, Play, Pause, Send } from 'lucide-react';
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
const distanceRef = ref(db, 'ocean-3d-2026');
const PASSWORDS = { sv: '44', vika: '4' };

// ═══════════════════════════════════════════════════
// 3D COMPONENTS
// ═══════════════════════════════════════════════════

function Bottle({ dbState }) {
  const group = useRef();
  
  const leftPos = -12;
  const rightPos = 12;

  useFrame((state, delta) => {
    if (!group.current) return;
    
    let targetX = 0;
    let targetScale = 0.001;
    let targetZ = 0;

    if (dbState.type === 'message') {
      targetScale = 1;
      // If from SV (left), it travels to Vika (right)
      targetX = dbState.from === 'sv' ? rightPos : leftPos;
      targetZ = 2; // bring slightly forward for the recipient
    }

    // Smooth movement and scaling
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, delta * 0.8);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, delta * 1);
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
    
    // Gentle rotation while moving
    if (Math.abs(group.current.position.x - targetX) > 0.5) {
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, (group.current.position.x < targetX ? -0.2 : 0.2), delta);
    } else {
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, delta * 2);
    }
  });

  return (
    <group ref={group} position={[0, -0.2, 0]} scale={0.001}>
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
        {/* Main Bottle Body (Simulated Glass) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 2.5, 32]} />
          <meshPhysicalMaterial 
            transmission={0.95} 
            ior={1.5} 
            thickness={0.5} 
            roughness={0.05} 
            color="#e6f2ff" 
            transparent 
          />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.25, 0.6, 0.6, 32]} />
          <meshPhysicalMaterial transmission={0.95} ior={1.5} roughness={0.05} color="#e6f2ff" transparent />
        </mesh>
        
        {/* Cork */}
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.3, 16]} />
          <meshStandardMaterial color="#3a2512" roughness={0.9} />
        </mesh>
        
        {/* Glowing Scroll Inside */}
        <mesh rotation={[0, 0, 0.2]} position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 1.4, 16]} />
          <meshStandardMaterial color="#fff4e0" emissive="#ffddaa" emissiveIntensity={0.2} roughness={0.8} />
        </mesh>
        
        {/* Magical internal glow */}
        <pointLight color="#ffcfa3" intensity={2} distance={4} position={[0, 0, 0]} />
        <Sparkles count={15} scale={1.2} size={2} speed={0.4} opacity={0.5} color="#ffddaa" />
      </Float>
    </group>
  );
}

function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#02050a" roughness={0.02} metalness={0.95} envMapIntensity={1} />
    </mesh>
  );
}

function SevanShore() {
  return (
    <group position={[-16, -1, -8]}>
      {/* Abstract Glass/Dark Matter Mountains */}
      <mesh position={[0, 3, -5]}>
        <coneGeometry args={[5, 8, 4]} />
        <meshPhysicalMaterial color="#010305" metalness={0.8} roughness={0.2} transmission={0.2} />
      </mesh>
      <mesh position={[4, 2, -3]}>
        <coneGeometry args={[4, 6, 4]} />
        <meshPhysicalMaterial color="#010305" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Lighthouse Beacon */}
      <pointLight position={[2, 4, 0]} color="#ffaa55" intensity={1} distance={20} />
      <Sparkles position={[2, 4, 0]} count={10} scale={2} color="#ffaa55" />
      <Text position={[0, 1, 2]} fontSize={0.6} color="rgba(255,255,255,0.15)" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf" letterSpacing={0.2}>
        SEVAN
      </Text>
    </group>
  );
}

function TomShore() {
  return (
    <group position={[16, -1, -8]}>
      {/* Abstract Pine Hills */}
      <mesh position={[0, 2, -2]}>
        <coneGeometry args={[3, 6, 8]} />
        <meshStandardMaterial color="#010305" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[-3, 1.5, 0]}>
        <coneGeometry args={[2.5, 5, 8]} />
        <meshStandardMaterial color="#010305" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Lighthouse Beacon */}
      <pointLight position={[-1, 3.5, 0]} color="#55aaff" intensity={1} distance={20} />
      <Sparkles position={[-1, 3.5, 0]} count={10} scale={2} color="#55aaff" />
      <Text position={[0, 1, 3]} fontSize={0.6} color="rgba(255,255,255,0.15)" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf" letterSpacing={0.2}>
        TOM RIVER
      </Text>
    </group>
  );
}

function Scene({ dbState, me }) {
  const cameraRef = useRef();

  useFrame((state) => {
    // Very slow, cinematic camera drift
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.pointer.x * 2), 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 4 + (state.pointer.y * 1), 0.02);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <Environment preset="night" environmentIntensity={0.2} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 5]} intensity={0.2} color="#ffffff" />
      
      <Water />
      <SevanShore />
      <TomShore />
      <Bottle dbState={dbState} me={me} />
      
      <Cloud position={[-10, 8, -15]} opacity={0.1} speed={0.2} width={20} depth={1.5} segments={20} />
      <Cloud position={[10, 6, -20]} opacity={0.1} speed={0.1} width={20} depth={1.5} segments={20} />
    </>
  );
}

// ═══════════════════════════════════════════════════
// UI & APP STATE
// ═══════════════════════════════════════════════════

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('oceanRole') || '');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('oceanRole'));
  const [pwd, setPwd] = useState('');
  const [authErr, setAuthErr] = useState('');

  const [dbState, setDbState] = useState({ type: 'empty' });
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState(false);
  const [noteText, setNoteText] = useState('');

  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isAuth) return;
    const unsub = onValue(distanceRef, (snap) => {
      setDbState(snap.val() || { type: 'empty' });
    });
    return () => unsub();
  }, [isAuth]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      if (musicOn) audioRef.current.play().catch(() => setMusicOn(false));
      else audioRef.current.pause();
    }
  }, [musicOn]);

  const login = (e) => {
    e.preventDefault();
    if (!userRole) { setAuthErr('SELECT SHORE'); return; }
    if (pwd === PASSWORDS[userRole]) {
      localStorage.setItem('oceanRole', userRole);
      setAuthErr('');
      setIsAuth(true);
    } else setAuthErr('INCORRECT');
  };

  const logout = () => {
    localStorage.removeItem('oceanRole');
    setUserRole(''); setPwd(''); setIsAuth(false);
  };

  const me = localStorage.getItem('oceanRole');
  const isForMe = dbState.type === 'message' && dbState.from !== me;
  const isSentByMe = dbState.type === 'message' && dbState.from === me;

  const sendMessage = () => {
    if (!noteText.trim()) return;
    setWriting(false);
    // Setting it in Firebase instantly starts the 3D travel animation for both clients
    set(distanceRef, { type: 'message', note: noteText, from: me, timestamp: Date.now() });
    setNoteText('');
  };

  const consumeMessage = () => {
    set(distanceRef, { type: 'empty' });
    setReading(false);
  };

  // ─── LOGIN SCREEN ───
  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col relative bg-[#02050a]">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
            <Suspense fallback={null}>
              <Water />
              <SevanShore />
              <TomShore />
              <Environment preset="night" />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6">
          <div className="luxury-panel p-8 sm:p-12 w-full max-w-sm reveal-up flex flex-col items-center border border-white/5">
            <h1 className="font-heading italic text-3xl sm:text-4xl text-white mb-2 text-center">Across the Ocean</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-10 text-center font-light">
              3,700 км. Sevan ⇄ Tom
            </p>

            <form onSubmit={login} className="w-full flex flex-col items-center">
              <div className="flex w-full gap-3 mb-8">
                {[['sv', 'SUREN'], ['vika', 'VIKA']].map(([r, l]) => (
                  <button key={r} type="button" onClick={() => setUserRole(r)}
                    className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] transition-all border ${
                      userRole === r ? 'border-white text-white bg-white/10' : 'border-white/10 text-white/40 hover:border-white/30'
                    }`}>{l}</button>
                ))}
              </div>
              <input type="password" placeholder="PASSWORD" value={pwd} onChange={e => setPwd(e.target.value)}
                className="luxury-input w-full px-2 py-3 text-center text-sm tracking-widest placeholder:text-white/20 mb-4" />
              <div className="h-4 mb-6">
                {authErr && <p className="text-[9px] text-red-300/70 uppercase tracking-widest">{authErr}</p>}
              </div>
              <button type="submit" className="luxury-btn w-full py-3.5 text-[10px] uppercase tracking-[0.2em]">Enter</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN 3D SCENE ───
  return (
    <div className="min-h-screen flex flex-col relative bg-[#02050a]">
      {/* 3D CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 5, 20], fov: 40 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene dbState={dbState} me={me} />
          </Suspense>
        </Canvas>
      </div>

      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3" loop />

      {/* HUD OVERLAY */}
      <div className="hud-layer justify-between">
        
        {/* Top Header */}
        <div className="p-6 sm:p-10 flex justify-between items-start fade-in hud-interactive">
          <button onClick={() => setMusicOn(!musicOn)} className="flex items-center gap-3 text-white/50 hover:text-white transition group">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition">
              {musicOn ? <Pause size={10} className="fill-current" /> : <Play size={10} className="fill-current ml-0.5" />}
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-light hidden sm:block">Ambient</span>
          </button>
          
          <button onClick={logout} className="text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-white/80 transition">
            Disconnect
          </button>
        </div>

        {/* Center UI Overlay */}
        <div className="flex-grow flex flex-col items-center justify-end pb-20 hud-interactive">
          
          {dbState.type === 'empty' && !writing && (
            <button onClick={() => setWriting(true)} className="luxury-btn px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 reveal-up">
              <Send size={12} /> Send a Message
            </button>
          )}

          {isSentByMe && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-light reveal-up">
              Bottle is traveling to {me === 'sv' ? 'Tom River' : 'Sevan'}...
            </p>
          )}

          {isForMe && !reading && (
            <div className="flex flex-col items-center reveal-up">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-4 font-light">A message arrived</p>
              <button onClick={() => setReading(true)} className="luxury-btn px-8 py-3.5 text-[10px] uppercase tracking-[0.2em]">
                Read Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WRITE MODAL */}
      {writing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md fade-in hud-interactive">
          <div className="luxury-panel w-full max-w-lg p-8 sm:p-12 reveal-up relative">
            <button onClick={() => setWriting(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition">
              <X size={20} strokeWidth={1} />
            </button>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-6 font-light">To {me === 'sv' ? 'Vika' : 'Suren'}</p>
            <textarea 
              value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Your message across the ocean..."
              className="w-full h-40 bg-transparent text-white font-heading italic text-2xl sm:text-3xl leading-relaxed focus:outline-none resize-none placeholder:text-white/20 mb-8"
              autoFocus
            />
            <div className="flex justify-end">
              <button onClick={sendMessage} disabled={!noteText.trim()} className="luxury-btn px-8 py-3 text-[10px] uppercase tracking-[0.2em]">
                Cast Bottle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READ MODAL */}
      {reading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in hud-interactive">
          <div className="letter-modal w-full max-w-2xl min-h-[50vh] p-10 sm:p-16 flex flex-col relative">
            <p className="text-[9px] uppercase tracking-[0.3em] text-black/40 mb-12 font-light border-b border-black/10 pb-4">
              From {dbState.from === 'sv' ? 'Suren (Sevan)' : 'Vika (Tom)'}
            </p>
            <p className="font-heading italic text-3xl sm:text-4xl text-black/90 leading-relaxed mb-16 whitespace-pre-wrap">
              "{dbState.note}"
            </p>
            <div className="mt-auto flex justify-end">
              <button onClick={consumeMessage} className="border border-black/20 text-black/70 hover:bg-black hover:text-white transition duration-500 px-8 py-3 text-[9px] uppercase tracking-[0.2em]">
                Keep Message
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
