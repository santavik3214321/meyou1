import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Text, Sparkles, Cloud, MeshReflectorMaterial, ContactShadows } from '@react-three/drei';
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
const distanceRef = ref(db, 'ocean-3d-2026-v2');
const PASSWORDS = { sv: '44', vika: '4' };

// ═══════════════════════════════════════════════════
// 3D COMPONENTS (Quiet Luxury / Cinematic)
// ═══════════════════════════════════════════════════

function CinematicWater() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[300, 300]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={60}
        roughness={0.05}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#010204"
        metalness={0.9}
        mirror={1}
      />
    </mesh>
  );
}

function GlassBottle({ dbState }) {
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
      targetX = dbState.from === 'sv' ? rightPos : leftPos;
      targetZ = 3; 
    }

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, delta * 0.5);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, delta * 0.8);
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 1.5);
    
    const isMoving = Math.abs(group.current.position.x - targetX) > 0.1;
    const tilt = group.current.position.x < targetX ? -0.15 : 0.15;
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, isMoving ? tilt : 0, delta * 2);
  });

  return (
    <group ref={group} position={[0, -0.2, 0]} scale={0.001}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2} floatingRange={[-0.1, 0.2]}>
        {/* Main Glass Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 2.2, 48]} />
          <meshPhysicalMaterial 
            transmission={1} 
            ior={1.52} 
            thickness={1.5} 
            roughness={0.02} 
            color="#ffffff" 
            transparent 
          />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.2, 0.5, 0.6, 48]} />
          <meshPhysicalMaterial transmission={1} ior={1.52} roughness={0.02} color="#ffffff" transparent />
        </mesh>
        
        {/* Cork */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.25, 24]} />
          <meshStandardMaterial color="#1a120b" roughness={0.9} />
        </mesh>
        
        {/* Scroll Inside */}
        <mesh rotation={[0, 0, 0.15]} position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.2, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
        
        {/* Magical internal glow */}
        <pointLight color="#ffffff" intensity={0.5} distance={3} position={[0, -0.3, 0]} />
        <Sparkles count={10} scale={1} size={1} speed={0.2} opacity={0.3} color="#ffffff" />
      </Float>
    </group>
  );
}

function Shores() {
  return (
    <group>
      {/* SEVAN SHORE (Left) */}
      <group position={[-18, -1.2, -12]}>
        <mesh position={[0, 3, -4]}>
          <coneGeometry args={[6, 10, 4]} />
          <meshPhysicalMaterial color="#000000" metalness={0.8} roughness={0.1} transmission={0.1} />
        </mesh>
        <pointLight position={[2, 6, 0]} color="#ffaa55" intensity={1.5} distance={25} />
        <Text position={[0, 1, 4]} fontSize={0.8} color="rgba(255,255,255,0.08)" letterSpacing={0.3} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf">
          SEVAN
        </Text>
      </group>

      {/* TOM RIVER SHORE (Right) */}
      <group position={[18, -1.2, -12]}>
        <mesh position={[0, 2, -2]}>
          <coneGeometry args={[4, 7, 8]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.5} />
        </mesh>
        <pointLight position={[-1, 5, 0]} color="#55aaff" intensity={1.5} distance={25} />
        <Text position={[0, 1, 4]} fontSize={0.8} color="rgba(255,255,255,0.08)" letterSpacing={0.3} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf">
          TOM RIVER
        </Text>
      </group>
    </group>
  );
}

function CinematicText() {
  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
      <Text 
        position={[0, 1.5, -20]} 
        fontSize={5} 
        color="#ffffff" 
        material-toneMapped={false} 
        material-transparent={true}
        material-opacity={0.03}
        font="https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpMt4.woff2"
      >
        Across the Water
      </Text>
    </Float>
  )
}

function Scene({ dbState, me }) {
  useFrame((state) => {
    // Ultra-smooth, expensive-feeling camera drift
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.pointer.x * 1.5), 0.015);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 3 + (state.pointer.y * 0.5), 0.015);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <Environment preset="night" environmentIntensity={0.1} />
      <ambientLight intensity={0.05} />
      
      <CinematicWater />
      <Shores />
      <GlassBottle dbState={dbState} me={me} />
      <CinematicText />
      
      <Cloud position={[-10, 5, -25]} opacity={0.05} speed={0.1} width={20} depth={1.5} segments={20} />
      <Cloud position={[10, 4, -25]} opacity={0.05} speed={0.1} width={20} depth={1.5} segments={20} />
    </>
  );
}

// ═══════════════════════════════════════════════════
// UI & APP STATE
// ═══════════════════════════════════════════════════

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('lux3dRole') || '');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('lux3dRole'));
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
    const unsub = onValue(distanceRef, (snap) => setDbState(snap.val() || { type: 'empty' }));
    return () => unsub();
  }, [isAuth]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      if (musicOn) audioRef.current.play().catch(() => setMusicOn(false));
      else audioRef.current.pause();
    }
  }, [musicOn]);

  const login = (e) => {
    e.preventDefault();
    if (!userRole) { setAuthErr('SELECT LOCATION'); return; }
    if (pwd === PASSWORDS[userRole]) {
      localStorage.setItem('lux3dRole', userRole);
      setAuthErr('');
      setIsAuth(true);
    } else setAuthErr('ACCESS DENIED');
  };

  const logout = () => {
    localStorage.removeItem('lux3dRole');
    setUserRole(''); setPwd(''); setIsAuth(false);
  };

  const me = localStorage.getItem('lux3dRole');
  const isForMe = dbState.type === 'message' && dbState.from !== me;
  const isSentByMe = dbState.type === 'message' && dbState.from === me;

  const sendMessage = () => {
    if (!noteText.trim()) return;
    setWriting(false);
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
      <div className="min-h-screen flex flex-col relative bg-[#02050a] selection:bg-white/10">
        <div className="absolute inset-0 z-0 opacity-50">
          <Canvas camera={{ position: [0, 2, 15], fov: 40 }}>
            <Suspense fallback={null}>
              <CinematicWater />
              <Shores />
              <Environment preset="night" />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm reveal-up flex flex-col items-center">
            <h1 className="font-heading italic text-4xl sm:text-5xl text-white mb-2 text-center tracking-wide">Across the Water</h1>
            <p className="font-hud text-[9px] uppercase tracking-[0.3em] text-white/30 mb-12 text-center">
              3,700 KM • SEVAN TO TOM
            </p>

            <form onSubmit={login} className="w-full flex flex-col items-center">
              <div className="flex w-full gap-4 mb-8">
                {[['sv', 'SUREN'], ['vika', 'VIKA']].map(([r, l]) => (
                  <button key={r} type="button" onClick={() => setUserRole(r)}
                    className={`flex-1 py-4 font-hud text-[9px] uppercase tracking-[0.3em] transition-all border ${
                      userRole === r ? 'border-white text-white bg-white/5' : 'border-white/10 text-white/30 hover:border-white/30'
                    }`}>{l}</button>
                ))}
              </div>
              <input type="password" placeholder="ENTER CODE" value={pwd} onChange={e => setPwd(e.target.value)}
                className="luxury-input w-full px-2 py-4 text-center font-hud text-[10px] tracking-[0.4em] placeholder:text-white/10 mb-4" />
              <div className="h-4 mb-8">
                {authErr && <p className="font-hud text-[9px] text-white/50 uppercase tracking-[0.3em]">{authErr}</p>}
              </div>
              <button type="submit" className="luxury-btn w-full py-4 font-hud text-[9px] uppercase tracking-[0.3em]">Initialize</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN 3D SCENE ───
  return (
    <div className="min-h-screen flex flex-col relative bg-[#02050a] selection:bg-white/10">
      
      {/* 3D CANVAS */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 4, 18], fov: 40 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene dbState={dbState} me={me} />
          </Suspense>
        </Canvas>
      </div>

      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3" loop />

      {/* HUD OVERLAY */}
      <div className="hud-layer justify-between">
        
        {/* Top Header */}
        <div className="p-8 sm:p-12 flex justify-between items-start fade-in hud-interactive">
          <button onClick={() => setMusicOn(!musicOn)} className="flex items-center gap-4 text-white/30 hover:text-white transition group outline-none">
            <div className="w-8 h-8 border border-white/10 flex items-center justify-center group-hover:border-white/40 transition">
              {musicOn ? <Pause size={10} className="fill-current" /> : <Play size={10} className="fill-current ml-0.5" />}
            </div>
            <span className="font-hud text-[9px] uppercase tracking-[0.3em] hidden sm:block">Atmosphere</span>
          </button>
          
          <button onClick={logout} className="font-hud text-[9px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition">
            Disconnect
          </button>
        </div>

        {/* Center UI Overlay */}
        <div className="flex-grow flex flex-col items-center justify-end pb-24 hud-interactive">
          
          {dbState.type === 'empty' && !writing && (
            <button onClick={() => setWriting(true)} className="group flex flex-col items-center gap-4 reveal-up outline-none">
              <span className="font-heading italic text-3xl text-white/40 group-hover:text-white transition duration-700">Write a letter</span>
              <div className="w-px h-12 bg-white/20 group-hover:bg-white/60 transition duration-700" />
            </button>
          )}

          {isSentByMe && (
            <div className="flex flex-col items-center reveal-up">
              <p className="font-hud text-[9px] uppercase tracking-[0.4em] text-white/30 mb-3">En Route</p>
              <p className="font-heading italic text-xl text-white/50">To {me === 'sv' ? 'Tom River' : 'Sevan'}</p>
            </div>
          )}

          {isForMe && !reading && (
            <button onClick={() => setReading(true)} className="group flex flex-col items-center gap-4 reveal-up outline-none">
              <p className="font-hud text-[9px] uppercase tracking-[0.4em] text-white/50">Message Awaits</p>
              <span className="font-heading italic text-3xl text-white/80 group-hover:text-white transition duration-700">Open Glass</span>
            </button>
          )}
        </div>
      </div>

      {/* WRITE MODAL */}
      {writing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#02050a]/80 backdrop-blur-md fade-in hud-interactive">
          <div className="w-full max-w-2xl p-8 sm:p-16 reveal-up relative flex flex-col">
            <button onClick={() => setWriting(false)} className="absolute top-8 right-8 text-white/30 hover:text-white transition">
              <X size={24} strokeWidth={1} />
            </button>
            <p className="font-hud text-[9px] uppercase tracking-[0.4em] text-white/30 mb-12">To {me === 'sv' ? 'Vika' : 'Suren'}</p>
            <textarea 
              value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Your message..."
              className="w-full h-48 bg-transparent text-white font-heading italic text-3xl sm:text-4xl leading-relaxed focus:outline-none resize-none placeholder:text-white/10 mb-12"
              autoFocus
            />
            <div className="flex justify-start">
              <button onClick={sendMessage} disabled={!noteText.trim()} className="luxury-btn px-12 py-4 font-hud text-[9px] uppercase tracking-[0.3em]">
                Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READ MODAL (Magazine Style) */}
      {reading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#02050a]/90 backdrop-blur-xl fade-in hud-interactive">
          <div className="letter-modal w-full max-w-3xl min-h-[60vh] p-12 sm:p-24 flex flex-col relative">
            <p className="font-hud text-[9px] uppercase tracking-[0.4em] text-black/30 mb-16 border-b border-black/5 pb-6">
              From {dbState.from === 'sv' ? 'Suren (Sevan)' : 'Vika (Tom)'}
            </p>
            <p className="font-heading italic text-3xl sm:text-5xl text-black/90 leading-tight mb-20 whitespace-pre-wrap">
              {dbState.note}
            </p>
            <div className="mt-auto flex justify-end">
              <button onClick={consumeMessage} className="border border-black/20 text-black/60 hover:bg-black hover:text-white transition duration-700 px-10 py-4 font-hud text-[9px] uppercase tracking-[0.3em]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
