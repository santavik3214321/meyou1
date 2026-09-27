import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ─── CUSTOM SHADER FOR INSTANCED MESH ───────────────────
// ─── CUSTOM SHADER FOR INSTANCED MESH ───────────────────
const instancedVertexShader = `
uniform float uProgress;
uniform float uTime;
uniform float uScatterBlend;
uniform float uShapeFrom;
uniform float uShapeTo;

attribute vec3 aTargetPos;
attribute vec3 aTargetColor;
attribute vec3 aBouquetPos;
attribute vec3 aBouquetColor;

attribute vec3 aShape0;
attribute vec3 aShape1;
attribute vec3 aShape2;
attribute vec3 aShape3;

varying vec3 vColor;
varying vec2 vUv;
varying float vDist;

vec3 getShape(float index) {
    if (index < 0.5) return aShape0;
    if (index < 1.5) return aShape1;
    if (index < 2.5) return aShape2;
    return aShape3;
}

void main() {
    vUv = uv;

    vec4 bouquetPos = vec4(position + aBouquetPos, 1.0);
    vec4 portraitPos = vec4(position + aTargetPos, 1.0);
    
    float moveT1 = smoothstep(0.0, 0.5, uProgress);
    float moveT2 = smoothstep(0.5, 1.0, uProgress);
    
    vec3 shapeFrom = getShape(uShapeFrom);
    vec3 shapeTo = getShape(uShapeTo);
    // Use smoothstep for an elegant ease-in-out morph
    vec3 mixedScatter = mix(shapeFrom, shapeTo, smoothstep(0.0, 1.0, uScatterBlend));
    
    vec3 currentPos;
    vec3 currentColor;

    // EXPLOSION EFFECT 💥
    // moveT1 goes from 0.0 to 1.0 during the Bouquet -> Scatter transition.
    // sin(moveT1 * PI) creates an arc that starts at 0, peaks at 1 in the middle, and ends at 0.
    float explosionT = sin(moveT1 * 3.14159265);
    
    // Direction of explosion is outward from the center of the bouquet (0,0,0)
    vec3 explodeDir = normalize(aBouquetPos + vec3(0.0, 0.001, 0.0));
    
    // Randomize the explosion force per petal so it looks chaotic and natural
    float explodeForce = 18.0 * fract(sin(dot(aBouquetPos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);

    if (uProgress <= 0.5) {
        // Base interpolation from bouquet to shape
        vec3 basePos = mix(bouquetPos.xyz, position + mixedScatter, moveT1);
        
        // Add the explosion displacement!
        currentPos = basePos + explodeDir * (explodeForce * explosionT);
        
        currentColor = aBouquetColor; // Keep flower colors for Heart and Words
    } else {
        currentPos = mix(position + mixedScatter, portraitPos.xyz, moveT2);
        currentColor = mix(aBouquetColor, aTargetColor, moveT2); // Smoothly change to photo color WHILE flying!
    }

    // Fade out activity (breathing, rotation) as we reach the portrait phase
    float activity = smoothstep(0.0, 0.4, uProgress) * smoothstep(1.0, 0.8, uProgress);
    
    // Very subtle floating rotation, keep a tiny bit in portrait so it looks organic!
    float angle = sin(uTime * 0.5 + mixedScatter.x) * 0.2; 
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotatedUv = rot * (position.xy);
    
    vec3 localPos = position;
    localPos.xy = mix(position.xy, rotatedUv, mix(activity, 0.15, smoothstep(0.6, 1.0, uProgress)));
    
    // MAGIC TRICK: Scale petals!
    // Bouquet (0.0): scale 1.0 (big lush flowers)
    // Scatter (0.5): scale 0.25 (tiny crisp pointillism for legible letters)
    // Portrait (1.0): scale 0.55 (medium overlap for solid photo)
    float petalScale;
    if (uProgress <= 0.5) {
        petalScale = mix(1.0, 0.25, moveT1);
    } else {
        petalScale = mix(0.25, 0.55, moveT2);
    }
    localPos *= petalScale;

    // Subtle breathing so they seem alive, turns off in portrait phase
    currentPos.x += sin(uTime * 0.3 + mixedScatter.y * 2.0) * 0.05 * activity;
    currentPos.y += cos(uTime * 0.2 + mixedScatter.x * 2.0) * 0.05 * activity;
    currentPos.z += sin(uTime * 0.4 + mixedScatter.z * 2.0) * 0.05 * activity;

    // SPHERICAL BILLBOARDING
    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    mvPosition.xy += localPos.xy;
    mvPosition.z += localPos.z;
    
    vDist = -mvPosition.z; // distance to camera

    vColor = currentColor;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const instancedFragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
varying vec3 vColor;
varying vec2 vUv;
varying float vDist;

void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // RED channel = petal alpha mask (solid inside, soft at edges)
    float petalAlpha = texColor.r;
    if (petalAlpha < 0.05) discard;
    
    // GREEN channel = text engraving mask
    float textMask = texColor.g;
    
    // BLUE channel = tint/depth variation
    float tint = texColor.b;
    
    vec3 finalColor = vColor;
    
    // Natural depth: base of petal is slightly warmer/deeper
    finalColor *= (1.0 - tint * 0.12);
    
    // TEXT ENGRAVING: lighten where text is (like embossed/pressed text on a petal)
    // This is clearly visible on both pink and white petals
    finalColor = mix(finalColor, finalColor + vec3(0.25, 0.2, 0.22), textMask * 0.7);
    
    // Warm vibrancy 
    finalColor = min(finalColor * 1.08, 1.0);
    
    // Soft feathered edge
    float edgeSoft = smoothstep(0.0, 0.12, petalAlpha);
    
    // Very subtle shimmer
    float shimmer = 0.015 * sin(uTime * 1.2 + vUv.x * 18.0 + vUv.y * 14.0);
    finalColor += shimmer;
    
    gl_FragColor = vec4(finalColor, edgeSoft * 0.93);
}
`;

// ─── SHAPE GENERATORS ────────────────────────────────────
function getHeartPoints(numPoints) {
    const sPos = new Float32Array(numPoints * 3);
    let count = 0;
    while (count < numPoints) {
        const x = (Math.random() - 0.5) * 3.0;
        const y = (Math.random() - 0.5) * 3.0;
        const z = (Math.random() - 0.5) * 3.0;
        
        const term1 = x*x + (9.0/4.0)*y*y + z*z - 1.0;
        const val = term1*term1*term1 - x*x*z*z*z - (9.0/80.0)*y*y*z*z*z;
        
        if (val <= 0) {
            sPos[count * 3] = x * 6.0;       
            sPos[count * 3 + 1] = z * 6.0;
            sPos[count * 3 + 2] = y * 6.0;
            count++;
        }
    }
    return sPos;
}

function getTextPoints(text, numPoints) {
    const canvas = document.createElement('canvas');
    const w = 2048, h = 1024;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    
    let fontSize = 280;
    if (text.length <= 3) fontSize = 500;
    else if (text.length > 12) fontSize = 200;
    
    // REMOVED 'bold' so the letters are thinner and much more legible when made of petals!
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    
    const imgData = ctx.getImageData(0, 0, w, h).data;
    const validPixels = [];
    
    for (let y = 0; y < h; y+=4) {
        for (let x = 0; x < w; x+=4) {
            const idx = (y * w + x) * 4;
            if (imgData[idx] > 128) validPixels.push({x, y});
        }
    }
    
    const points = new Float32Array(numPoints * 3);
    const total = validPixels.length;
    if (total === 0) return points; 
    
    // Scale reduced so all words easily fit on narrow mobile screens
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const scale = isMobile ? 0.0055 : 0.009; 
    
    for (let i = 0; i < numPoints; i++) {
        const p = validPixels[i % total];
        points[i * 3] = (p.x - w / 2) * scale;
        points[i * 3 + 1] = -(p.y - h / 2) * scale;
        points[i * 3 + 2] = (Math.random() - 0.5) * 0.1; 
    }
    return points;
}

function createLoveTexture() {
    const canvas = document.createElement('canvas');
    const S = 512;
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, S, S);
    
    // ── 1. PETAL SHAPE (RED channel = alpha mask) ──
    // Wide, rounded rose petal shape matching pink/white roses from the bouquet.
    // Solid center with only very gentle edge fade.
    
    // Draw the petal path first
    ctx.save();
    ctx.beginPath();
    // Wider, rounder shape like a real rose petal
    ctx.moveTo(256, 485);
    ctx.bezierCurveTo(120, 400, 55, 250, 80, 130);
    ctx.bezierCurveTo(100, 60, 180, 30, 256, 35);
    ctx.bezierCurveTo(332, 30, 412, 60, 432, 130);
    ctx.bezierCurveTo(457, 250, 392, 400, 256, 485);
    ctx.closePath();
    ctx.clip();
    
    // Fill with solid red (alpha = 1.0 everywhere inside the petal)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, S, S);
    
    // Soft edge fade — only at the very border using a second pass
    const edgeGrad = ctx.createRadialGradient(256, 260, 100, 256, 260, 250);
    edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
    edgeGrad.addColorStop(0.8, 'rgba(0,0,0,0)');
    edgeGrad.addColorStop(1.0, 'rgba(0,0,0,0.5)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, S, S);
    ctx.globalCompositeOperation = 'source-over';
    
    // ── 2. BLUE channel: subtle petal tint gradient (darker center → lighter tips) ──
    // This creates the natural color variation you see on real rose petals
    const tintGrad = ctx.createLinearGradient(256, 480, 256, 40);
    tintGrad.addColorStop(0, 'rgba(0,0,180,0.3)');   // stem base slightly deeper
    tintGrad.addColorStop(0.3, 'rgba(0,0,120,0.15)'); // mid subtle
    tintGrad.addColorStop(0.7, 'rgba(0,0,60,0.05)');  // tips very light
    tintGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tintGrad;
    ctx.fillRect(0, 0, S, S);
    
    // Delicate central vein
    ctx.strokeStyle = 'rgba(0,0,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(256, 470);
    ctx.quadraticCurveTo(254, 260, 256, 50);
    ctx.stroke();
    
    // Side veins — very subtle
    ctx.strokeStyle = 'rgba(0,0,255,0.06)';
    ctx.lineWidth = 0.7;
    const veins = [
        [[256,370], [200,330], [140,310]],
        [[256,370], [312,330], [372,310]],
        [[256,280], [195,245], [135,235]],
        [[256,280], [317,245], [377,235]],
        [[256,190], [210,165], [170,155]],
        [[256,190], [302,165], [342,155]],
    ];
    veins.forEach(([s, cp, e]) => {
        ctx.beginPath();
        ctx.moveTo(...s);
        ctx.quadraticCurveTo(...cp, ...e);
        ctx.stroke();
    });
    
    // ── 3. TEXT ENGRAVING (GREEN channel) ──
    // Bigger, clearer text so it's actually readable
    ctx.fillStyle = 'rgba(0,255,0,0.9)'; 
    ctx.font = 'italic 38px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const startY = 180;
    const gap = 55;
    const maxW = 220;
    
    ctx.fillText("Я тебя люблю", 256, startY, maxW);
    ctx.fillText("I love you", 256, startY + gap, maxW);
    ctx.fillText("Je t'aime", 256, startY + gap*2, maxW);
    ctx.fillText("Ti amo", 256, startY + gap*3, maxW);
    
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

const loadImageData = (src, maxDim = 300) => {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        img.onload = () => {
            const ratio = img.width / img.height;
            let w = maxDim, h = maxDim;
            if (ratio > 1) h = Math.floor(maxDim / ratio);
            else w = Math.floor(maxDim * ratio);
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve({ data: ctx.getImageData(0, 0, w, h).data, w, h });
        };
        img.onerror = () => resolve(null);
    });
};

const samplePortraitPixels = (imgData, numPoints, scale = 0.05) => {
    const points = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);
    const { data, w, h } = imgData;
    
    const validPixels = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (data[idx] + data[idx+1] + data[idx+2] > 15) {
                validPixels.push({x, y, idx});
            }
        }
    }
    
    const total = validPixels.length;
    if (total === 0) return { points, colors };

    // Step evenly through all valid pixels to ensure 100% coverage without holes
    const step = total / numPoints;
    for (let i = 0; i < numPoints; i++) {
        const p = validPixels[Math.floor(i * step) % total];

        points[i * 3] = (p.x - w / 2) * scale;
        points[i * 3 + 1] = -(p.y - h / 2) * scale; 
        points[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        
        colors[i * 3] = data[p.idx] / 255;
        colors[i * 3 + 1] = data[p.idx+1] / 255;
        colors[i * 3 + 2] = data[p.idx+2] / 255;
    }
    return { points, colors };
};

// PRECOMPUTED SHAPES (Runs once when module loads in background)
const GLOBAL_SCATTER_SHAPES = [
    getTextPoints("SV", 40000),                 // 0: SV instead of Heart
    getTextPoints("Я тебя люблю", 40000),       // 1: Russian
    getTextPoints("Ես քեզ սիրում եմ", 40000), // 2: Armenian
    getTextPoints("I love you", 40000)          // 3: English
];

// ─── INSTANCED PARTICLES COMPONENT ───────────────────────
function MorphParticles({ fbxData, vikaData, numPoints, progress, nextScatterIdx, visible }) {
    const meshRef = useRef();
    const materialRef = useRef();
    
    const loveTexture = useMemo(() => createLoveTexture(), []);

    const { bouquetPos, bouquetColors, targetPos, targetColor } = useMemo(() => {
        const v = samplePortraitPixels(vikaData, numPoints, 0.05);

        let bPoints = new Float32Array(numPoints * 3);
        let bColors = new Float32Array(numPoints * 3);
        
        const { allV, allC, fbxScale } = fbxData;
        const total = allV.length / 3;
        
        for (let i = 0; i < numPoints; i++) {
            const rIdx = total > 0 ? Math.floor(Math.random() * total) : 0;
            bPoints[i * 3] = (allV[rIdx * 3] || 0) * fbxScale;
            bPoints[i * 3 + 1] = (allV[rIdx * 3 + 1] || 0) * fbxScale - 2.0; 
            bPoints[i * 3 + 2] = (allV[rIdx * 3 + 2] || 0) * fbxScale;
            
            bColors[i * 3] = allC[rIdx * 3] || 1;
            bColors[i * 3 + 1] = allC[rIdx * 3 + 1] || 1;
            bColors[i * 3 + 2] = allC[rIdx * 3 + 2] || 1;
        }

        return { 
            bouquetPos: bPoints,
            bouquetColors: bColors,
            targetPos: v.points, 
            targetColor: v.colors
        };
    }, [fbxData, vikaData, numPoints]);

    const uShapeFrom = useRef(0);
    const uShapeTo = useRef(0);
    const uScatterBlend = useRef(0);
    const isBlending = useRef(false);

    useEffect(() => {
        if (nextScatterIdx !== uShapeTo.current) {
            uShapeFrom.current = uShapeTo.current;
            uShapeTo.current = nextScatterIdx;
            uScatterBlend.current = 0.0;
            isBlending.current = true;
        }
    }, [nextScatterIdx]);

    const uniforms = useMemo(() => ({
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uShapeFrom: { value: 0 },
        uShapeTo: { value: 0 },
        uScatterBlend: { value: 0 },
        uTexture: { value: loveTexture }
    }), [loveTexture]);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uProgress.value,
                progress,
                0.02
            );

            if (isBlending.current) {
                // Smoothly interpolate over ~3 seconds for an elegant morph
                uScatterBlend.current += delta * 0.33; 
                if (uScatterBlend.current >= 1.0) {
                    uScatterBlend.current = 1.0;
                    isBlending.current = false;
                }
            }
            materialRef.current.uniforms.uShapeFrom.value = uShapeFrom.current;
            materialRef.current.uniforms.uShapeTo.value = uShapeTo.current;
            materialRef.current.uniforms.uScatterBlend.value = uScatterBlend.current;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, numPoints]} visible={visible}>
            <planeGeometry args={[0.25, 0.25]}>
                <instancedBufferAttribute attach="attributes-aTargetPos" args={[targetPos, 3]} />
                <instancedBufferAttribute attach="attributes-aTargetColor" args={[targetColor, 3]} />
                <instancedBufferAttribute attach="attributes-aBouquetPos" args={[bouquetPos, 3]} />
                <instancedBufferAttribute attach="attributes-aBouquetColor" args={[bouquetColors, 3]} />
                {/* 4 fixed shape attributes mapped in GPU - absolutely zero lag! */}
                <instancedBufferAttribute attach="attributes-aShape0" args={[GLOBAL_SCATTER_SHAPES[0], 3]} />
                <instancedBufferAttribute attach="attributes-aShape1" args={[GLOBAL_SCATTER_SHAPES[1], 3]} />
                <instancedBufferAttribute attach="attributes-aShape2" args={[GLOBAL_SCATTER_SHAPES[2], 3]} />
                <instancedBufferAttribute attach="attributes-aShape3" args={[GLOBAL_SCATTER_SHAPES[3], 3]} />
            </planeGeometry>
            <shaderMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
                vertexShader={instancedVertexShader}
                fragmentShader={instancedFragmentShader}
                uniforms={uniforms}
            />
        </instancedMesh>
    );
}

// ─── MAIN SURPRISE VIEW ──────────────────────────────────
function SceneContent({ images, phase, nextScatterIdx, onReady }) {
    const gltf = useGLTF('/bouquet.glb'); 
    const fbx = gltf.scene;
    const controlsRef = useRef();
    const { camera } = useThree();
    const isMobile = window.innerWidth < 768;
    const optimalDistance = isMobile ? 32 : 18;
    const hasCentered = useRef(false);

    const cinematicTime = useRef(0);
    const [showFBX, setShowFBX] = useState(true);
    const [shaderProgress, setShaderProgress] = useState(0);
    const [fbxOpacity, setFbxOpacity] = useState(1);
    
    const lightRef = useRef();

    useEffect(() => {
        if (onReady) onReady();
    }, [onReady]);

    useEffect(() => {
        if (phase > 0) hasCentered.current = false;
        if (phase === 2) setShaderProgress(1.0);
    }, [phase]);
    
    const cinematicStarted = useRef(false);

    useFrame((state, delta) => {
        // CINEMATIC EXPLOSION SEQUENCE
        if (phase === 1 && cinematicTime.current < 4.0) {
            // Prepare materials for glow on first frame only
            if (!cinematicStarted.current) {
                cinematicStarted.current = true;
                fbx.traverse((child) => {
                    if (child.isMesh) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(m => {
                            m.transparent = true;
                        });
                    }
                });
            }
            cinematicTime.current += delta;
            const t = cinematicTime.current;
            
            // Phase A (0→1.5s): Warm golden-pink light grows INSIDE the flowers.
            // The flowers themselves glow from within using emissive color.
            if (t < 1.5) {
                const glow = t / 1.5; // 0 → 1
                if (lightRef.current) lightRef.current.intensity = glow * 80.0;
                
                // Make the bouquet's own materials glow warm pink/gold from within
                fbx.traverse((child) => {
                    if (child.isMesh) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(m => {
                            m.emissive = new THREE.Color(0xffb6c1).lerp(new THREE.Color(0xffd700), 0.3);
                            m.emissiveIntensity = glow * 2.5;
                        });
                    }
                });
            }
            // Phase B (1.5→2.5s): Bouquet dissolves, petals burst out
            else if (t < 2.5) {
                const dissolve = (t - 1.5) / 1.0; // 0 → 1
                
                if (showFBX && dissolve > 0.15) {
                    setShowFBX(false);
                    setShaderProgress(0.5);
                }
                
                // Fade out the bouquet and its glow
                setFbxOpacity(Math.max(0, 1.0 - dissolve * 2.0));
                fbx.traverse((child) => {
                    if (child.isMesh) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(m => {
                            m.opacity = Math.max(0, 1.0 - dissolve * 2.0);
                            m.emissiveIntensity = Math.max(0, 2.5 - dissolve * 3.0);
                        });
                    }
                });
                
                if (lightRef.current) lightRef.current.intensity = Math.max(0, 80.0 - dissolve * 100.0);
            }
        }

        if (phase > 0 && controlsRef.current && !hasCentered.current) {
            const currentSpherical = new THREE.Spherical().setFromVector3(camera.position);
            
            const distTheta = Math.abs(currentSpherical.theta);
            const distPhi = Math.abs(currentSpherical.phi - Math.PI/2);
            const distRadius = Math.abs(currentSpherical.radius - optimalDistance);
            
            if (distTheta > 0.005 || distPhi > 0.005 || distRadius > 0.1) {
                currentSpherical.theta = THREE.MathUtils.lerp(currentSpherical.theta, 0, 0.04);
                currentSpherical.phi = THREE.MathUtils.lerp(currentSpherical.phi, Math.PI / 2, 0.04);
                currentSpherical.radius = THREE.MathUtils.lerp(currentSpherical.radius, optimalDistance, 0.04);
                
                camera.position.setFromSpherical(currentSpherical);
                camera.lookAt(0, 0, 0);
                controlsRef.current.update();
            } else {
                hasCentered.current = true;
            }
        }
    });
    
    const clonedFbx = useMemo(() => fbx.clone(), [fbx]);

    const fbxData = useMemo(() => {
        let maxLen = 0;
        let allV = [], allC = [];
        
        clonedFbx.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const pos = child.geometry.attributes.position;
                const col = child.geometry.attributes.color;
                const uv = child.geometry.attributes.uv;
                
                child.updateWorldMatrix(true, false);
                const matrix = child.matrixWorld;

                let imgData = null, tW = 0, tH = 0;
                let mat = Array.isArray(child.material) ? child.material[0] : child.material;
                if (!col && mat && mat.map && mat.map.image) {
                    try {
                        const img = mat.map.image;
                        const canvas = document.createElement('canvas');
                        tW = canvas.width = img.width; tH = canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        imgData = ctx.getImageData(0, 0, tW, tH).data;
                    } catch (e) { console.error("Could not read texture data", e); }
                }
                
                for (let i = 0; i < pos.count; i++) {
                    const vec = new THREE.Vector3().fromBufferAttribute(pos, i);
                    vec.applyMatrix4(matrix);
                    allV.push(vec.x, vec.y, vec.z);
                    
                    if (col) {
                        allC.push(col.getX(i), col.getY(i), col.getZ(i));
                    } else if (imgData && uv) {
                        let u = uv.getX(i); let v = uv.getY(i);
                        u = u - Math.floor(u); v = v - Math.floor(v);
                        const px = Math.floor(u * tW), py = Math.floor((1 - v) * tH);
                        const idx = (py * tW + px) * 4;
                        allC.push(imgData[idx]/255, imgData[idx+1]/255, imgData[idx+2]/255);
                    } else {
                        allC.push(0.85, 0.75, 0.8);
                    }
                }
            }
        });
        
        // Find bounding box to center it
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        for (let i = 0; i < allV.length; i+=3) {
            if (allV[i] < minX) minX = allV[i];
            if (allV[i] > maxX) maxX = allV[i];
            if (allV[i+1] < minY) minY = allV[i+1];
            if (allV[i+1] > maxY) maxY = allV[i+1];
            if (allV[i+2] < minZ) minZ = allV[i+2];
            if (allV[i+2] > maxZ) maxZ = allV[i+2];
        }
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const cz = (minZ + maxZ) / 2;
        
        // Center and rotate 90 degrees around Y so flowers face front (Z axis)
        let actualMaxLen = 0;
        for (let i = 0; i < allV.length; i+=3) {
            const dx = allV[i] - cx;
            const dy = allV[i+1] - cy;
            const dz = allV[i+2] - cz;
            
            // Rotate -90 degrees around Y: newX = -dz, newZ = dx
            allV[i] = -dz;
            allV[i+1] = dy;
            allV[i+2] = dx;
            
            const l = Math.sqrt(allV[i]*allV[i] + dy*dy + allV[i+2]*allV[i+2]);
            if (l > actualMaxLen) actualMaxLen = l;
        }
        
        const fbxScale = actualMaxLen > 0 ? 6.0 / actualMaxLen : 1; 
        return { allV, allC, fbxScale, cx, cy, cz };
    }, [clonedFbx]);

    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 10]} intensity={2.5} />
            <pointLight position={[-10, -10, -10]} intensity={1.0} />
            
            {/* Floating sparkles for magical atmosphere */}
            <FloatingSparkles count={200} />
            
            {/* Warm light that lives INSIDE the bouquet flowers */}
            {showFBX && (
                <group scale={fbxData.fbxScale} rotation={[0, -Math.PI / 2, 0]}>
                    <group position={[-fbxData.cx, -fbxData.cy, -fbxData.cz]}>
                        <primitive object={fbx} />
                        <pointLight ref={lightRef} position={[fbxData.cx, fbxData.cy, fbxData.cz]} intensity={0} color="#ffc0cb" distance={500} decay={1} />
                    </group>
                </group>
            )}

            <MorphParticles 
                fbxData={fbxData}
                vikaData={images.vika} 
                numPoints={40000} 
                progress={shaderProgress}
                nextScatterIdx={nextScatterIdx}
                visible={!showFBX || shaderProgress > 0} 
            />
            <OrbitControls 
                ref={controlsRef}
                enableZoom={true} 
                enablePan={true} 
                autoRotate={phase === 0} 
                autoRotateSpeed={1.5}
                maxDistance={35}
                minDistance={1.5}
                minAzimuthAngle={phase === 0 ? -Infinity : -Math.PI / 2.5} 
                maxAzimuthAngle={phase === 0 ? Infinity : Math.PI / 2.5}
                minPolarAngle={phase === 0 ? 0 : Math.PI / 3}      
                maxPolarAngle={phase === 0 ? Math.PI : Math.PI - Math.PI / 3}
            />
        </>
    );
}

// ─── FLOATING SPARKLES ───────────────────────────────────
function FloatingSparkles({ count = 200 }) {
    const meshRef = useRef();
    
    const { positions, sizes, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            sizes[i] = Math.random() * 0.08 + 0.02;
            speeds[i] = Math.random() * 0.5 + 0.2;
        }
        return { positions, sizes, speeds };
    }, [count]);
    
    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.getElapsedTime();
        const pos = meshRef.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.003;
            pos[i * 3] += Math.cos(t * speeds[i] * 0.7 + i * 0.5) * 0.002;
        }
        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.material.opacity = 0.3 + 0.2 * Math.sin(t * 0.5);
    });
    
    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.06} color="#ffd4e5" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
        </points>
    );
}

export default function SurpriseMorph({ onClose }) {
    const [images, setImages] = useState(null);
    const [phase, setPhase] = useState(0); 
    const [shapeIdx, setShapeIdx] = useState(0);
    const [fbxLoaded, setFbxLoaded] = useState(false);

    useEffect(() => {
        loadImageData('/vika.jpg').then(vika => {
            if (vika) setImages({ vika });
        });
    }, []);

    useEffect(() => {
        if (phase === 1) {
            const timer = setInterval(() => {
                setShapeIdx(prev => (prev + 1) % 4);
            }, 10000);
            return () => clearInterval(timer);
        }
    }, [phase]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const initialZ = isMobile ? 32 : 18;

    return (
        <div className="fixed inset-0 z-[200] font-body overflow-hidden" style={{
            background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0d0515 40%, #050208 100%)'
        }}>
            {/* Subtle animated CSS stars in the background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {Array.from({length: 40}).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            background: i % 3 === 0 ? '#ffd4e5' : i % 3 === 1 ? '#ffe4c9' : '#d4e5ff',
                            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
                            opacity: 0,
                        }}
                    />
                ))}
            </div>
            
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glowPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(255,154,158,0.3), 0 0 60px rgba(255,154,158,0.1); }
                    50% { box-shadow: 0 0 30px rgba(255,154,158,0.5), 0 0 80px rgba(255,154,158,0.2); }
                }
            `}</style>
            
            <Canvas camera={{ position: [0, 0, initialZ], fov: 45 }}>
                <React.Suspense fallback={null}>
                    {images && (
                        <SceneContent 
                            images={images} 
                            phase={phase} 
                            nextScatterIdx={shapeIdx}
                            onReady={() => setFbxLoaded(true)}
                        />
                    )}
                </React.Suspense>
            </Canvas>

            {(!images || !fbxLoaded) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50" style={{
                    background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0d0515 40%, #050208 100%)'
                }}>
                    <div className="w-10 h-10 border-2 border-t-pink-300 border-white/10 rounded-full animate-spin mb-6" />
                    <p className="font-heading italic text-lg md:text-xl text-pink-200/80 tracking-wide">
                        Собираем магию для Вики...
                    </p>
                </div>
            )}

            {images && fbxLoaded && (
                <>
                    <div className="absolute top-6 md:top-8 w-full text-center pointer-events-none z-10 px-4">
                        {phase === 0 && (
                            <div style={{ animation: 'fadeSlideDown 1.2s ease-out forwards' }}>
                                <h2 className="font-heading italic text-3xl md:text-5xl text-pink-100/90 drop-shadow-[0_0_30px_rgba(255,182,193,0.3)] mb-3">
                                    ✿ Тот самый букет... ✿
                                </h2>
                                <p className="text-pink-200/40 text-[10px] md:text-xs uppercase tracking-[5px]">
                                    Покрути его пальцем — он настоящий 3D
                                </p>
                            </div>
                        )}
                        {phase === 2 && (
                            <div style={{ animation: 'fadeSlideDown 1.5s ease-out forwards' }}>
                                <h2 className="font-heading italic text-3xl md:text-5xl text-pink-100/90 drop-shadow-[0_0_30px_rgba(255,182,193,0.3)] mb-3">
                                    Моя девочка...
                                </h2>
                                <p className="text-pink-200/40 text-[10px] md:text-xs uppercase tracking-[5px]">
                                    Моя вселенная
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-10 md:bottom-12 w-full flex flex-col items-center z-10 gap-3">
                        {phase === 0 && (
                            <button 
                                onClick={() => setPhase(1)}
                                style={{ animation: 'fadeSlideUp 1s ease-out 0.5s both, glowPulse 3s ease-in-out infinite' }}
                                className="px-10 py-4 rounded-full text-[11px] md:text-xs font-semibold uppercase tracking-[3px] text-white/90 bg-gradient-to-r from-pink-500/20 to-rose-400/20 backdrop-blur-xl border border-pink-300/20 hover:border-pink-300/40 hover:bg-pink-500/30 transition-all duration-500"
                            >
                                Развеять лепестки 🌸
                            </button>
                        )}
                        {phase === 1 && (
                            <button 
                                onClick={() => setPhase(2)}
                                style={{ animation: 'fadeSlideUp 1s ease-out both, glowPulse 3s ease-in-out infinite' }}
                                className="px-10 py-4 rounded-full text-[11px] md:text-xs font-semibold uppercase tracking-[3px] text-white/90 bg-gradient-to-r from-pink-500/20 to-rose-400/20 backdrop-blur-xl border border-pink-300/20 hover:border-pink-300/40 hover:bg-pink-500/30 transition-all duration-500"
                            >
                                Сотворить чудо ✨
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            style={{ animation: 'fadeSlideUp 1s ease-out 0.8s both' }}
                            className="px-6 py-2 rounded-full text-[9px] md:text-[10px] uppercase tracking-[3px] text-pink-200/30 hover:text-pink-200/70 transition-colors duration-500"
                        >
                            Вернуться
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
