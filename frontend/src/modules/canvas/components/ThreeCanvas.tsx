import { useEffect, useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { CoreSettings } from '../../../types';

interface ThreeCanvasProps {
  settings: CoreSettings;
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
}

export default function ThreeCanvas({ settings, parallaxRef }: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const settingsRef = useRef<CoreSettings>(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x05050b, 0.04);

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.5, 6.5);
    camera.lookAt(0, 0, 0);

    // --- RENDERER — pixel ratio capped at 1 for performance ---
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,        // off = big win on mobile/mid-range GPUs
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL unavailable', e);
      return;
    }
    // Cap at 1 — retina screens at 2× render 4× the pixels for little visual gain
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x0f0f20, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f0ff, 3, 15);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    const dirLight1 = new THREE.DirectionalLight(0xff007f, 1);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x39ff14, 0.5);
    dirLight2.position.set(-5, -5, -3);
    scene.add(dirLight2);

    // --- GROUPS ---
    const mainCoreGroup = new THREE.Group();
    scene.add(mainCoreGroup);
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const getColorHex = (col: string): number => {
      switch (col) {
        case 'pink':  return 0xff007f;
        case 'green': return 0x39ff14;
        case 'amber': return 0xffaa00;
        default:      return 0x00f0ff;
      }
    };

    let activeColorHex = getColorHex(settingsRef.current.color);

    // --- STARS — reduced count ---
    const starsCount = Math.min(settingsRef.current.particleCount, 900);
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors    = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3]     = (Math.random() - 0.5) * 20;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;
      const mixRatio = Math.random();
      const stColor  = new THREE.Color();
      if (mixRatio < 0.4)      stColor.setHex(0x00f0ff);
      else if (mixRatio < 0.7) stColor.setHex(0x9d00ff);
      else                     stColor.setHex(0x050515);
      starColors[i * 3]     = stColor.r;
      starColors[i * 3 + 1] = stColor.g;
      starColors[i * 3 + 2] = stColor.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color',    new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // --- GRID — lightweight ---
    const customGrid = new THREE.GridHelper(24, 24, 0x00f0ff, 0x121225);
    customGrid.position.y = -2.5;
    if (Array.isArray(customGrid.material)) {
      customGrid.material.forEach(m => { m.transparent = true; m.opacity = 0.2; });
    } else {
      customGrid.material.transparent = true;
      customGrid.material.opacity = 0.2;
    }
    scene.add(customGrid);

    // --- TERRAIN — small segment count ---
    const terrainGeo = new THREE.PlaneGeometry(30, 30, 8, 8);
    terrainGeo.rotateX(-Math.PI / 2);
    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0x9d00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.10,
      depthWrite: false,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = -2.49;
    scene.add(terrain);

    // --- CORE GEOMETRY ---
    let innerCoreMesh: THREE.Mesh | null = null;
    let outerCoreMesh: THREE.Mesh | null = null;
    let coreVertexPoints: THREE.Points | null = null;
    let currentGeometryType = settingsRef.current.geometry;

    const rebuildCoreGeometry = (geomType: string) => {
      if (innerCoreMesh)    mainCoreGroup.remove(innerCoreMesh);
      if (outerCoreMesh)    mainCoreGroup.remove(outerCoreMesh);
      if (coreVertexPoints) mainCoreGroup.remove(coreVertexPoints);

      let geo: THREE.BufferGeometry;
      let outerGeo: THREE.BufferGeometry;
      switch (geomType) {
        case 'torusKnot':
          geo = new THREE.TorusKnotGeometry(0.8, 0.25, 48, 8, 2, 3);   // reduced segments
          outerGeo = new THREE.TorusKnotGeometry(1.2, 0.12, 32, 6, 3, 4);
          break;
        case 'dodecahedron':
          geo = new THREE.DodecahedronGeometry(1.1, 0);
          outerGeo = new THREE.DodecahedronGeometry(1.5, 0);
          break;
        case 'tetrahedron':
          geo = new THREE.TetrahedronGeometry(1.2, 1);
          outerGeo = new THREE.TetrahedronGeometry(1.6, 0);
          break;
        default: // sphere
          geo = new THREE.IcosahedronGeometry(1.2, 1);   // detail 1 instead of 2
          outerGeo = new THREE.IcosahedronGeometry(1.6, 1);
          break;
      }
      const meshColorVal = getColorHex(settingsRef.current.color);
      const innerMat = new THREE.MeshPhongMaterial({
        color: meshColorVal,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        shininess: 100,
        emissive: meshColorVal,
        emissiveIntensity: 0.15,
        flatShading: true,
      });
      const outerMat = new THREE.MeshBasicMaterial({
        color: meshColorVal,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      innerCoreMesh    = new THREE.Mesh(geo, innerMat);
      outerCoreMesh    = new THREE.Mesh(outerGeo, outerMat);
      coreVertexPoints = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      }));
      mainCoreGroup.add(innerCoreMesh, outerCoreMesh, coreVertexPoints);
      currentGeometryType = geomType;
    };
    rebuildCoreGeometry(currentGeometryType);

    // --- ORBIT RINGS ---
    const ring1Geo = new THREE.RingGeometry(2.1, 2.12, 48);
    const orbitRing1 = new THREE.Mesh(ring1Geo, new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.35 }));
    orbitRing1.rotation.x = Math.PI / 3;
    orbitGroup.add(orbitRing1);

    const ring2Geo = new THREE.TorusGeometry(2.5, 0.015, 6, 32);
    const orbitRing2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({ color: 0xff007f, transparent: true, opacity: 0.3 }));
    orbitRing2.rotation.x = -Math.PI / 4;
    orbitGroup.add(orbitRing2);

    const ring3Geo = new THREE.TorusGeometry(3.0, 0.01, 4, 24);
    const orbitRing3 = new THREE.Mesh(ring3Geo, new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.18 }));
    orbitRing3.rotation.y = Math.PI / 2;
    orbitGroup.add(orbitRing3);

    // --- MOUSE (for camera tilt) ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- TERRAIN UPDATE — throttled every 4 frames + small grid ---
    let terrainFrame = 0;
    const terrainPositions = terrainGeo.attributes.position as THREE.BufferAttribute;
    const updateWavyTerrain = (time: number) => {
      terrainFrame++;
      if (terrainFrame % 4 !== 0) return;
      const waveFreq   = 0.35;
      const waveSpeed  = 1.5;
      const waveHeight = settingsRef.current.mode === 'WAVE' ? 0.35 : 0.12;
      for (let i = 0; i < terrainPositions.count; i++) {
        const x = terrainPositions.getX(i);
        const z = terrainPositions.getZ(i);
        terrainPositions.setY(i, Math.sin(x * waveFreq + time * waveSpeed) * Math.cos(z * waveFreq + time * waveSpeed) * waveHeight);
      }
      terrainPositions.needsUpdate = true;
    };

    // --- ANIMATION LOOP — capped at ~30fps for the 3D background ---
    let animationFrameId = 0;
    const clock = new THREE.Clock();
    let lastRender = 0;
    const TARGET_INTERVAL = 1000 / 30; // 30fps cap — background, doesn't need 60fps

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (now - lastRender < TARGET_INTERVAL) return; // skip frame
      lastRender = now;

      const elapsedTime = clock.getElapsedTime();
      const currentSettings = settingsRef.current;

      // Color sync
      const desiredColorHex = getColorHex(currentSettings.color);
      if (activeColorHex !== desiredColorHex) {
        activeColorHex = desiredColorHex;
        pointLight.color.setHex(activeColorHex);
        if (innerCoreMesh && outerCoreMesh) {
          (innerCoreMesh.material as THREE.MeshPhongMaterial).color.setHex(activeColorHex);
          (innerCoreMesh.material as THREE.MeshPhongMaterial).emissive.setHex(activeColorHex);
          (outerCoreMesh.material as THREE.MeshBasicMaterial).color.setHex(activeColorHex);
        }
      }
      if (currentGeometryType !== currentSettings.geometry) rebuildCoreGeometry(currentSettings.geometry);
      if (innerCoreMesh) (innerCoreMesh.material as THREE.MeshPhongMaterial).wireframe = currentSettings.wireframe;

      // Mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      const px = parallaxRef.current.x;
      const py = parallaxRef.current.y;

      camera.position.x = mouse.x * 3.5 + px * 0.8;
      camera.position.y = 1.5 + mouse.y * 2 + py * 0.5;
      camera.position.z = 6.5 - Math.abs(px) * 0.3;
      camera.lookAt(px * 0.4, mouse.y * 0.3 + py * 0.2, 0);

      mainCoreGroup.rotation.x = py * 0.08;
      orbitGroup.rotation.x    = py * 0.05;
      orbitGroup.rotation.y    = px * 0.05;
      starPoints.rotation.x    = py * 0.03;
      starPoints.rotation.y    = elapsedTime * 0.005 + px * 0.02;
      customGrid.position.x    = px * 0.5;
      customGrid.position.z    = py * 0.5;

      const rotSpeed = 0.12 * currentSettings.speedMultiplier;
      if (currentSettings.autoRotate) {
        mainCoreGroup.rotation.y += rotSpeed * 0.05;
        mainCoreGroup.rotation.x += rotSpeed * 0.02;
        if (outerCoreMesh) {
          outerCoreMesh.rotation.y -= rotSpeed * 0.03;
          outerCoreMesh.rotation.z += rotSpeed * 0.015;
        }
        orbitRing1.rotation.z += 0.005 * currentSettings.speedMultiplier;
        orbitRing2.rotation.z -= 0.007 * currentSettings.speedMultiplier;
        orbitRing3.rotation.z += 0.003 * currentSettings.speedMultiplier;
      }

      if (currentSettings.mode === 'QUANTUM') {
        const pulse = 1.0 + Math.sin(elapsedTime * 6) * 0.08;
        mainCoreGroup.scale.set(pulse, pulse, pulse);
      } else if (currentSettings.mode === 'NEURAL') {
        const noise = currentSettings.noiseIntensity * 0.02;
        mainCoreGroup.scale.set(
          1.0 + (Math.random() - 0.5) * noise,
          1.0 + (Math.random() - 0.5) * noise,
          1.0 + (Math.random() - 0.5) * noise
        );
      } else {
        mainCoreGroup.scale.set(1, 1, 1);
      }

      updateWavyTerrain(elapsedTime);

      const beatFreq = currentSettings.mode === 'QUANTUM' ? 4.0 : 1.5;
      pointLight.intensity = 2.5 + Math.sin(elapsedTime * beatFreq) * 1.2;

      renderer.render(scene, camera);
    };

    animate(0);

    // --- RESIZE ---
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    let resizeFrameId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrameId !== null) cancelAnimationFrame(resizeFrameId);
      resizeFrameId = requestAnimationFrame(handleResize);
    });
    resizeObserver.observe(container);
    handleResize();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeFrameId !== null) cancelAnimationFrame(resizeFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      starGeometry.dispose(); starMaterial.dispose();
      customGrid.dispose();
      terrainGeo.dispose(); terrainMat.dispose();
      ring1Geo.dispose(); ring2Geo.dispose(); ring3Geo.dispose();
      if (innerCoreMesh)    { innerCoreMesh.geometry.dispose();    (innerCoreMesh.material as THREE.Material).dispose(); }
      if (outerCoreMesh)    { outerCoreMesh.geometry.dispose();    (outerCoreMesh.material as THREE.Material).dispose(); }
      if (coreVertexPoints) { coreVertexPoints.geometry.dispose(); (coreVertexPoints.material as THREE.Material).dispose(); }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" style={{ willChange: 'transform' }} />
      <div className="absolute inset-0 pointer-events-none scanlines mix-blend-color-burn opacity-70 z-[1]" />
    </div>
  );
}
