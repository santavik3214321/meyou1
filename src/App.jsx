import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

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
const boardRef = ref(db, 'editorial-board-2026/messages');
const PASSWORDS = { sv: '44', vika: '4' };

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('offbrandRole') || '');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('offbrandRole'));
  const [pwd, setPwd] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [writing, setWriting] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Fetch messages
  useEffect(() => {
    if (!isAuth) return;
    const unsub = onValue(boardRef, (snap) => {
      const data = snap.val();
      if (data) {
        // Convert to array and sort by newest first
        const msgs = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [isAuth]);

  const handleLogin = (role) => {
    if (pwd === PASSWORDS[role]) {
      localStorage.setItem('offbrandRole', role);
      setUserRole(role);
      setIsAuth(true);
      setPwd('');
    } else {
      alert("Invalid Clearance");
    }
  };

  const logout = () => {
    localStorage.removeItem('offbrandRole');
    setUserRole(''); setIsAuth(false);
  };

  const postMessage = () => {
    if (!noteText.trim()) return;
    push(boardRef, {
      text: noteText,
      from: userRole,
      timestamp: Date.now()
    });
    setNoteText('');
    setWriting(false);
  };

  // ─── SCREEN 1: THE HERO (LOGIN) ───
  if (!isAuth) {
    return (
      <div className="min-h-screen relative flex items-center px-8 sm:px-20 max-w-[1400px] mx-auto overflow-hidden">
        
        {/* The Signature Spheres */}
        <div className="iridescent-sphere" />
        <div className="concentric-rings" />
        <div className="concentric-rings" style={{ width: '120%', right: '-20%' }} />

        <div className="relative z-10 w-full max-w-2xl">
          <h1 className="text-display mb-12">
            3700<br/>
            KM<br/>
            APART.
          </h1>

          <div className="flex flex-col gap-8 max-w-xs">
            <input 
              type="password" 
              placeholder="ACCESS CODE" 
              value={pwd} 
              onChange={(e) => setPwd(e.target.value)}
              className="editorial-input text-label"
            />
            
            <div className="flex gap-4">
              <button onClick={() => handleLogin('sv')} className="ghost-link">
                SUREN <span className="font-normal">→</span>
              </button>
              <button onClick={() => handleLogin('vika')} className="ghost-link">
                VIKA <span className="font-normal">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN 2: EDITORIAL GRID (FEED) ───
  return (
    <div className="min-h-screen pb-32">
      
      {/* Top Nav */}
      <nav className="flex justify-between items-center px-8 py-6 hairline-bottom max-w-[1400px] mx-auto">
        <span className="text-label">THE DISTANCE</span>
        <button onClick={logout} className="ghost-link" style={{ padding: 0 }}>
          LOGOUT
        </button>
      </nav>

      <div className="max-w-[1400px] mx-auto px-8 mt-24">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Left Column: Context & Actions */}
          <div className="md:col-span-4 flex flex-col gap-12">
            <div>
              <p className="text-label mb-6 text-gray-500">WE ARE</p>
              <h2 className="text-[34px] font-bold leading-none tracking-tight uppercase">
                {userRole === 'sv' ? 'Suren' : 'Vika'}
              </h2>
            </div>

            <div>
              <p className="text-label mb-6 text-gray-500">ACTION</p>
              {!writing ? (
                <button onClick={() => setWriting(true)} className="ghost-link border border-black/10">
                  NEW TRANSMISSION <span className="font-normal">→</span>
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <textarea 
                    className="editorial-input resize-none h-32 text-body"
                    placeholder="Write your message..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <button onClick={postMessage} className="ghost-link border border-black/10">
                      SEND <span className="font-normal">→</span>
                    </button>
                    <button onClick={() => setWriting(false)} className="ghost-link text-gray-400">
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: The Feed */}
          <div className="md:col-span-8 flex flex-col gap-8">
            <p className="text-label text-gray-500 mb-2">ARCHIVE</p>
            
            {messages.length === 0 && (
              <div className="grid-card text-center py-32 text-gray-400 text-label">
                NO TRANSMISSIONS YET
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="grid-card flex flex-col justify-between min-h-[240px]">
                <p className="text-[34px] leading-[1.1] font-bold tracking-tight text-[#1d1d1d] whitespace-pre-wrap max-w-2xl">
                  {msg.text}
                </p>
                <div className="mt-12 flex justify-between items-end hairline-top pt-4">
                  <span className="text-label">{msg.from === 'sv' ? 'SUREN' : 'VIKA'}</span>
                  <span className="text-label text-gray-400">
                    {new Date(msg.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
    </div>
  );
}
