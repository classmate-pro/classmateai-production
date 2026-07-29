/**
 * VortexBackground — ClassmateAI vortex, fully contained within viewport.
 * Canvas is clipped to viewport via CSS. Vortex radius sized so all objects
 * remain on-screen at all rotation angles.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─── seeded PRNG ─────────────────────────────────────────────────────────── */
const SEED = 20260328;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

function makeRng(seed = SEED) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ─── spiral math (local to group) ─────────────────────────────────────────── */
interface VortexCfg {
  bottomY: number; height: number;
  baseR: number; topR: number; turns: number;
}

function spiralPt(t: number, v: VortexCfg, rBias = 1, vOff = 0): THREE.Vector3 {
  const y = v.bottomY + t * v.height + vOff;
  const r = (v.baseR + (v.topR - v.baseR) * t) * rBias;
  const a = t * v.turns * Math.PI * 2;
  return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
}

export default function VortexBackground({
  scrollRef,
}: {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W      = window.innerWidth;
    const H      = window.innerHeight;
    const narrow = W < 700;
    const rng    = makeRng();

    /* ── vortex config — radius kept small enough to stay on screen ── */
    const vCfg: VortexCfg = {
      bottomY: -16,
      height:  narrow ? 38 : 46,
      baseR:   narrow ? 3  : 5,
      topR:    narrow ? 9  : 13,   // ← small enough to never exceed viewport
      turns:   3.2,
    };

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(0xffffff, 1);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    /* ── scene / camera ── */
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
    // Camera offset left → vortex occupies right ~60% of screen on desktop, centered on mobile
    camera.position.set(narrow ? 0 : -5, 0, 0);

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 3.5));
    const key = new THREE.DirectionalLight(0x0d9488, 7.0);
    key.position.set(-4, 7, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x134e4a, 4.5);
    rim.position.set(6, -2, 3); scene.add(rim);
    const fill = new THREE.PointLight(0x10b981, 70, 80, 2);
    fill.position.set(2, 8, -8); scene.add(fill);

    /* ── vortex group ── */
    const vortexGroup = new THREE.Group();
    vortexGroup.position.set(
      narrow ? 0 : 6,    // Centered on mobile, offset right on desktop
      0,
      narrow ? -24 : -40 // Pulled forward slightly on mobile so it's visible
    );
    scene.add(vortexGroup);

    /* ── materials ── */
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488, metalness: 0.88, roughness: 0.14,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e, metalness: 0.82, roughness: 0.20,
      transparent: true, opacity: 0.90,
    });
    const deepMat = new THREE.MeshStandardMaterial({
      color: 0x134e4a, metalness: 0.80, roughness: 0.24,
    });

    /* ── spiral dots ── */
    const DOT_N  = 160;
    const dotGeo = new THREE.SphereGeometry(0.16, 7, 7);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x0d9488 });
    for (let i = 0; i < DOT_N; i++) {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(spiralPt(i / (DOT_N - 1), vCfg));
      vortexGroup.add(dot);
    }

    /* ── cross-wire lines ── */
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x0f766e, transparent: true, opacity: 0.28,
    });
    for (let w = 0; w < 12; w++) {
      const t0 = w / 12;
      const t1 = (w + 0.44) / 12;
      vortexGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          spiralPt(t0, vCfg), spiralPt(t1, vCfg),
        ]),
        lineMat,
      ));
    }

    /* ── floating 3D objects ── */
    interface FloatObj {
      mesh: THREE.Object3D;
      baseSpeed: number; rotSpeed: THREE.Euler;
      pathOffset: number; rBias: number; vOff: number;
    }
    const floatObjs: FloatObj[] = [];
    const ROLES = ['orb', 'facet', 'ring', 'star'] as const;
    const OBJ_N = narrow ? 7 : 14;

    for (let i = 0; i < OBJ_N; i++) {
      const role = ROLES[Math.floor(rng() * ROLES.length)];
      let mesh: THREE.Object3D;

      if (role === 'orb') {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.30 + rng() * 0.45, 12, 12), darkMat.clone());
      } else if (role === 'facet') {
        const s = 0.35 + rng() * 0.55;
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), tealMat.clone());
      } else if (role === 'ring') {
        mesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.32 + rng() * 0.28, 0.07, 10, 26), deepMat.clone());
      } else {
        mesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.30 + rng() * 0.32, 0), tealMat.clone());
      }

      const t    = rng();
      const rBias = 1.05 + rng() * 0.25;  // max 1.3 — stays within topR*1.3=17 < 25.5
      const vOff  = (rng() - 0.5) * 4;
      mesh.position.copy(spiralPt(t, vCfg, rBias, vOff));
      mesh.scale.setScalar(0.5 + rng() * 0.45);
      vortexGroup.add(mesh);

      floatObjs.push({
        mesh,
        baseSpeed: 0.00020 + rng() * 0.00010,
        rotSpeed: new THREE.Euler(rng() * 0.008, rng() * 0.010, rng() * 0.006),
        pathOffset: t, rBias, vOff,
      });
    }

    /* ── meteor trails ── */
    interface Meteor {
      mesh: THREE.Mesh; baseSpeed: number;
      progress: number; rBias: number; vOff: number;
    }
    const meteors: Meteor[] = [];
    const meteorsGroup = new THREE.Group();
    vortexGroup.add(meteorsGroup);

    const ML   = narrow ? 10 : 15;
    const mGeo = new THREE.CylinderGeometry(0.006, 0.07, ML, 8);
    mGeo.translate(0, ML / 2, 0);
    mGeo.rotateX(-Math.PI / 2);

    const MC = narrow ? 8 : 16;
    for (let i = 0; i < MC; i++) {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor:   { value: new THREE.Color(0x0d9488) },
          uOpacity: { value: 0.60 },
        },
        vertexShader: `varying vec2 vUv;
          void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv;
          uniform vec3 uColor; uniform float uOpacity;
          void main(){
            float a=pow(1.-vUv.y,1.6)*smoothstep(0.,.18,1.-vUv.y)*smoothstep(0.,.07,vUv.y);
            gl_FragColor=vec4(uColor,a*uOpacity);
          }`,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(mGeo, mat);
      meteorsGroup.add(mesh);
      meteors.push({
        mesh,
        baseSpeed: (narrow ? 0.00035 : 0.00025) + rng() * 0.00010,
        progress:  (i + 0.5) / MC,
        rBias:     0.88 + rng() * 0.22,
        vOff:      (rng() - 0.5) * (narrow ? 3 : 5),
      });
    }

    /* ── scroll state ── */
    let scrollProgress = 0;
    let stormSpeed     = 0;
    const BASE_SPIN    = 0.0006;
    const MAX_STORM    = 0.025;

    const getEl = () => scrollRef?.current ?? null;
    const onScroll = () => {
      const el = getEl();
      const progress = el
        ? el.scrollTop / ((el.scrollHeight - el.clientHeight) || 1)
        : window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      scrollProgress = progress;

      if (containerRef.current) {
        const opacity = 1 - Math.min(1, Math.max(0, (progress - 0.35) / 0.15));
        containerRef.current.style.opacity = opacity.toString();
        containerRef.current.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      }
    };
    const scrollEl = getEl();
    if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true });
    else          window.addEventListener('scroll', onScroll, { passive: true });

    /* ── resize ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ── RAF ── */
    let rafId = 0;
    const tempA = new THREE.Vector3();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const sp   = scrollProgress;
      const mult = 1 + sp * sp * 4;

      /* Storm spin — smooth ramp */
      const target = BASE_SPIN + sp * sp * MAX_STORM;
      stormSpeed  += (target - stormSpeed) * 0.05;
      vortexGroup.rotation.y += stormSpeed;

      /* Camera drift */
      camera.position.y = -sp * 2.5;

      /* Float objects */
      for (const obj of floatObjs) {
        obj.pathOffset = (obj.pathOffset + obj.baseSpeed * mult) % 1;
        const pos = spiralPt(obj.pathOffset, vCfg, obj.rBias, obj.vOff);
        obj.mesh.position.lerp(pos, 0.05);
        obj.mesh.rotation.x += obj.rotSpeed.x * mult;
        obj.mesh.rotation.y += obj.rotSpeed.y * mult;
        obj.mesh.rotation.z += obj.rotSpeed.z * mult;
      }

      /* Meteors */
      for (const m of meteors) {
        m.progress = (m.progress + m.baseSpeed * mult) % 1;
        const pA = spiralPt(m.progress, vCfg, m.rBias, m.vOff);
        const pB = spiralPt((m.progress + 0.012) % 1, vCfg, m.rBias, m.vOff);
        m.mesh.position.copy(pA);
        tempA.copy(pB).sub(pA).normalize();
        if (tempA.lengthSq() > 0.001)
          m.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tempA);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      if (scrollEl) scrollEl.removeEventListener('scroll', onScroll);
      else          window.removeEventListener('scroll', onScroll);
      renderer.dispose();
    };
  }, [scrollRef]);

  return (
    /* Wrapper clips the canvas to the exact viewport — no overflow possible */
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',   // ← clips any 3-D projection bleed
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
