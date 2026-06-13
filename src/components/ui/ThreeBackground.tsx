'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  // Store theme ref to access inside the requestAnimationFrame loop
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ─── WebGL Renderer ───────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ─── Scene & Fog ──────────────────────────────────────────
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x0a0415);
    scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.015);

    // ─── Camera ───────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 28);

    // ─── Scroll Tracker ───────────────────────────────────────
    let targetScroll = 0;
    let currentScroll = 0;
    
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      targetScroll = window.scrollY / maxScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ─── Lighting ─────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(10, 20, 15);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const accentLight1 = new THREE.PointLight(0xf26419, 20, 50); // Orange
    accentLight1.position.set(-10, 5, 5);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x7c3aed, 20, 50); // Purple
    accentLight2.position.set(10, -5, 5);
    scene.add(accentLight2);

    // ─── Theme Color Palettes (Dynamic Lerp) ──────────────────
    const colors = {
      dark: {
        bg: new THREE.Color(0x050507),
        fog: new THREE.Color(0x0a0415),
        grid: new THREE.Color(0x1f2937),
        gridCenter: new THREE.Color(0xf26419),
        shapes: new THREE.Color(0xffffff),
        particles: new THREE.Color(0xffffff),
        ambient: 0.3,
        dirIntensity: 1.0,
      },
      light: {
        bg: new THREE.Color(0xf3f4f6),
        fog: new THREE.Color(0xf3f4f6),
        grid: new THREE.Color(0xe5e7eb),
        gridCenter: new THREE.Color(0xf26419),
        shapes: new THREE.Color(0x4b5563),
        particles: new THREE.Color(0x6b7280),
        ambient: 0.7,
        dirIntensity: 1.2,
      }
    };

    // ─── Grid helper (Disabled for clean aesthetics) ──────────
    // const gridHelper = new THREE.GridHelper(60, 60, 0xf26419, 0x1f2937);
    // gridHelper.position.y = -10;
    // scene.add(gridHelper);

    // ─── 3D Stories Groups ────────────────────────────────────
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ─── SECTION 1: Massive Building structure (Emerging) ────
    const structureGroup = new THREE.Group();
    rootGroup.add(structureGroup);

    // Grid Columns
    const cols = 5;
    const rows = 4;
    const spacingX = 2.5;
    const spacingZ = 2.5;
    const columnGeom = new THREE.BoxGeometry(0.15, 6, 0.15);
    const columns: THREE.Mesh[] = [];

    const matWire = new THREE.MeshBasicMaterial({ color: 0xf26419, wireframe: true, transparent: true, opacity: 0.4 });
    const matSolid = new THREE.MeshStandardMaterial({ color: 0x8892b0, roughness: 0.4, metalness: 0.8 });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const col = new THREE.Mesh(columnGeom, matWire);
        const x = -((cols - 1) * spacingX) / 2 + c * spacingX;
        const z = -((rows - 1) * spacingZ) / 2 + r * spacingZ;
        col.position.set(x, -3, z); // Start below ground
        structureGroup.add(col);
        columns.push(col);
      }
    }

    // Floor Slabs
    const slabGeom = new THREE.BoxGeometry((cols - 1) * spacingX + 0.5, 0.1, (rows - 1) * spacingZ + 0.5);
    const slabs: THREE.Mesh[] = [];
    for (let f = 0; f < 3; f++) {
      const slab = new THREE.Mesh(slabGeom, matWire);
      slab.position.set(0, -6, 0); // Start below
      structureGroup.add(slab);
      slabs.push(slab);
    }

    // ─── SECTION 2: Timeline Nodes ────────────────────────────
    const timelineGroup = new THREE.Group();
    timelineGroup.position.set(0, -20, 0); // hidden initially
    rootGroup.add(timelineGroup);

    const timelineCubes: THREE.Mesh[] = [];
    const timelineConnectorGeom = new THREE.BoxGeometry(16, 0.08, 0.08);
    const timelineConnector = new THREE.Mesh(timelineConnectorGeom, matWire);
    timelineConnector.position.set(0, 0, 0);
    timelineGroup.add(timelineConnector);

    for (let i = 0; i < 4; i++) {
      const nodeGeom = new THREE.IcosahedronGeometry(1.0, 0);
      const node = new THREE.Mesh(nodeGeom, matWire);
      node.position.set(-6 + i * 4, 0, 0);
      timelineGroup.add(node);
      timelineCubes.push(node);
    }

    // ─── SECTION 3: Product Showcase Geometry ────────────────
    const productsGroup = new THREE.Group();
    productsGroup.position.set(0, -30, 0); // hidden
    rootGroup.add(productsGroup);

    const productsList: THREE.Mesh[] = [];
    const prodGeometries = [
      new THREE.CylinderGeometry(0.8, 0.8, 2, 8),    // Cement bag/cylinder
      new THREE.TorusGeometry(0.8, 0.1, 8, 32),       // Rebar coil
      new THREE.BoxGeometry(1.5, 0.7, 0.8),           // Brick Block
      new THREE.DodecahedronGeometry(0.9, 0),         // Sand Aggregate
      new THREE.CylinderGeometry(0.5, 0.5, 2.5, 16)   // Plumbing pipe
    ];

    prodGeometries.forEach((geom, idx) => {
      const mesh = new THREE.Mesh(geom, matWire);
      const angle = (idx / prodGeometries.length) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 7, Math.sin(idx % 2 === 0 ? 1 : -1) * 1.5, Math.sin(angle) * 7);
      productsGroup.add(mesh);
      productsList.push(mesh);
    });

    // ─── SECTION 4: Logistics Dumper Truck ───────────────────
    const logisticsGroup = new THREE.Group();
    logisticsGroup.position.set(-20, -10, 0);
    rootGroup.add(logisticsGroup);

    const cabinGeom = new THREE.BoxGeometry(2, 1.5, 1.4);
    const cabin = new THREE.Mesh(cabinGeom, matWire);
    cabin.position.set(2, 0.25, 0);
    logisticsGroup.add(cabin);

    const bedGeom = new THREE.BoxGeometry(4, 1.2, 1.6);
    const bed = new THREE.Mesh(bedGeom, matWire);
    bed.position.set(-1.2, 0.4, 0);
    logisticsGroup.add(bed);

    const wheels: THREE.Mesh[] = [];
    const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8);
    wheelGeom.rotateX(Math.PI / 2);
    const wheelPositions = [
      { x: 1.5, y: -0.6, z: 0.8 },
      { x: 1.5, y: -0.6, z: -0.8 },
      { x: -1.0, y: -0.6, z: 0.8 },
      { x: -1.0, y: -0.6, z: -0.8 },
      { x: -2.2, y: -0.6, z: 0.8 },
      { x: -2.2, y: -0.6, z: -0.8 },
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, matWire);
      wheel.position.set(pos.x, pos.y, pos.z);
      logisticsGroup.add(wheel);
      wheels.push(wheel);
    });

    // ─── SECTION 6: Cityscape completed projects ──────────────
    const cityscapeGroup = new THREE.Group();
    cityscapeGroup.position.set(0, -10, -5);
    rootGroup.add(cityscapeGroup);

    const towers: THREE.Mesh[] = [];
    const towersCount = 18;
    for (let i = 0; i < towersCount; i++) {
      const h = 3 + Math.random() * 8;
      const tGeom = new THREE.BoxGeometry(1.2, h, 1.2);
      const tower = new THREE.Mesh(tGeom, matWire);
      const tx = (Math.random() - 0.5) * 24;
      const tz = (Math.random() - 0.5) * 16 - 8;
      tower.position.set(tx, -h / 2, tz); // Start below
      cityscapeGroup.add(tower);
      towers.push(tower);
    }

    // ─── SECTION 8: Globe ─────────────────────────────────────
    const globeGeom = new THREE.SphereGeometry(4.5, 16, 16);
    const globe = new THREE.Mesh(globeGeom, matWire);
    globe.position.set(0, 0, -8);
    rootGroup.add(globe);

    // ─── Particle star field (background dust) ────────────────
    const starsCount = 1000;
    const sGeom = new THREE.BufferGeometry();
    const sPos = new Float32Array(starsCount * 3);
    const sColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      sPos[i * 3]     = (Math.random() - 0.5) * 100;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

      sColors[i * 3]     = 0.95;
      sColors[i * 3 + 1] = 0.39; // Default orange tint
      sColors[i * 3 + 2] = 0.1;
    }
    sGeom.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeom.setAttribute('color', new THREE.BufferAttribute(sColors, 3));
    
    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(sGeom, starMat);
    scene.add(starField);

    // ─── Interaction Parallax ─────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ─── Resize Handler ───────────────────────────────────────
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ─── Animation loop ───────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 1. Smoothly lerp scroll values
      currentScroll += (targetScroll - currentScroll) * 0.08;

      // 2. Dynamic Theme Transitions (Lerp colors & intensities)
      const currentTheme = themeRef.current;
      const themePalette = currentTheme === 'dark' ? colors.dark : colors.light;

      // Lerp background and fog
      renderer.setClearColor(themePalette.bg, 1.0);
      scene.background = themePalette.bg;
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.lerp(themePalette.fog, 0.05);
      }
      
      // Lerp light intensities
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, themePalette.ambient, 0.05);
      dirLight1.intensity = THREE.MathUtils.lerp(dirLight1.intensity, themePalette.dirIntensity, 0.05);

      // Lerp material colors based on theme
      const targetMaterialColor = themePalette.shapes;
      matWire.color.lerp(targetMaterialColor, 0.05);
      matSolid.color.lerp(targetMaterialColor, 0.05);

      // 3. Dynamic Staggered X-Offset for alternating Left/Right Storytelling
      let targetGroupX = 0;
      if (currentScroll < 0.18) {
        // Section 1: Hero
        targetGroupX = 0;
      } else if (currentScroll >= 0.18 && currentScroll < 0.35) {
        // Section 2: Timeline (4 milestones alternating)
        const tTimeline = (currentScroll - 0.18) / 0.17;
        const milestoneIdx = Math.floor(tTimeline * 4);
        targetGroupX = milestoneIdx % 2 === 0 ? 5.5 : -5.5;
      } else if (currentScroll >= 0.35 && currentScroll < 0.52) {
        // Section 3: Product Showcase (Text list left, 3D right)
        targetGroupX = 5.5;
      } else if (currentScroll >= 0.52 && currentScroll < 0.70) {
        // Section 4: Logistics Supply Chain (4 steps alternating)
        const tLog = (currentScroll - 0.52) / 0.18;
        const stepIdx = Math.floor(tLog * 4);
        targetGroupX = stepIdx % 2 === 0 ? 5.5 : -5.5;
      } else if (currentScroll >= 0.70 && currentScroll < 0.88) {
        // Section 6: Cityscape Completed Projects
        targetGroupX = 0;
      } else {
        // Section 8: Sourcing Contact (Form right, globe left)
        targetGroupX = -5.5;
      }
      rootGroup.position.x += (targetGroupX - rootGroup.position.x) * 0.08;

      // 4. Scroll Storytelling States & Camera Choreography
      
      // -- Reset groups positions/visibilities based on scroll --
      structureGroup.position.y = -6 * currentScroll;
      globe.position.y = -40 * (1.0 - currentScroll);

      // SECTION 1: Hero (Scroll: 0.0 -> 0.18)
      if (currentScroll < 0.18) {
        const t = currentScroll / 0.18;
        
        // Assemble columns rising up
        columns.forEach((col, idx) => {
          const delay = (idx % 4) * 0.15;
          const targetY = THREE.MathUtils.lerp(-3, 3, Math.max(0, Math.min(1, (t - delay) / 0.55)));
          col.position.y = targetY;
        });

        // Assemble Slabs dropping down
        slabs.forEach((slab, idx) => {
          const delay = 0.2 + idx * 0.2;
          const targetY = THREE.MathUtils.lerp(-6, idx * 3, Math.max(0, Math.min(1, (t - delay) / 0.5)));
          slab.position.y = targetY;
        });

        // Camera positioning
        camera.position.x = THREE.MathUtils.lerp(0, 8, t);
        camera.position.y = THREE.MathUtils.lerp(3, 8, t);
        camera.position.z = THREE.MathUtils.lerp(18, 14, t);
        
        rootGroup.rotation.y = elapsed * 0.05;
        
        structureGroup.visible = true;
        timelineGroup.visible = false;
        productsGroup.visible = false;
        logisticsGroup.visible = false;
        cityscapeGroup.visible = false;
      }
      // SECTION 2: Timeline (Scroll: 0.18 -> 0.35)
      else if (currentScroll >= 0.18 && currentScroll < 0.35) {
        const t = (currentScroll - 0.18) / (0.35 - 0.18);

        structureGroup.visible = false;
        timelineGroup.visible = true;
        productsGroup.visible = false;
        logisticsGroup.visible = false;
        cityscapeGroup.visible = false;

        // Animate timeline entrance
        timelineGroup.position.y = THREE.MathUtils.lerp(-10, 0, t);
        timelineGroup.rotation.y = elapsed * 0.15;

        // Bounce nodes
        timelineCubes.forEach((node, idx) => {
          node.scale.setScalar(1 + Math.sin(elapsed * 2 + idx) * 0.08);
        });

        camera.position.x = THREE.MathUtils.lerp(8, 0, t);
        camera.position.y = THREE.MathUtils.lerp(8, 10, t);
        camera.position.z = THREE.MathUtils.lerp(14, 18, t);
      }
      // SECTION 3: Product Showcase (Scroll: 0.35 -> 0.52)
      else if (currentScroll >= 0.35 && currentScroll < 0.52) {
        const t = (currentScroll - 0.35) / (0.52 - 0.35);

        structureGroup.visible = false;
        timelineGroup.visible = false;
        productsGroup.visible = true;
        logisticsGroup.visible = false;
        cityscapeGroup.visible = false;

        productsGroup.position.y = THREE.MathUtils.lerp(-15, 0, t);
        productsGroup.rotation.y = elapsed * 0.25;

        // Rotate individual products
        productsList.forEach((prod, idx) => {
          prod.rotation.x += 0.01;
          prod.rotation.y += 0.015;
          prod.position.y = Math.sin(elapsed * 1.5 + idx) * 0.6;
        });

        camera.position.x = 0;
        camera.position.y = THREE.MathUtils.lerp(10, 6, t);
        camera.position.z = THREE.MathUtils.lerp(18, 15, t);
      }
      // SECTION 4: Supply Logistics Journey (Scroll: 0.52 -> 0.70)
      else if (currentScroll >= 0.52 && currentScroll < 0.70) {
        const t = (currentScroll - 0.52) / (0.70 - 0.52);

        structureGroup.visible = false;
        timelineGroup.visible = false;
        productsGroup.visible = false;
        logisticsGroup.visible = true;
        cityscapeGroup.visible = false;

        // Drive truck from left to right, rotating wheels
        logisticsGroup.position.x = THREE.MathUtils.lerp(-24, 24, t);
        logisticsGroup.position.y = -6 + Math.sin(elapsed * 12) * 0.05; // Engine vibration
        wheels.forEach(w => {
          w.rotation.z -= 0.15;
        });

        camera.position.x = 0;
        camera.position.y = 8;
        camera.position.z = 16;
      }
      // SECTION 6: Projects Cityscape (Scroll: 0.70 -> 0.88)
      else if (currentScroll >= 0.70 && currentScroll < 0.88) {
        const t = (currentScroll - 0.70) / (0.88 - 0.70);

        structureGroup.visible = false;
        timelineGroup.visible = false;
        productsGroup.visible = false;
        logisticsGroup.visible = false;
        cityscapeGroup.visible = true;

        // Skyscrapers rise on scroll
        towers.forEach((tower, idx) => {
          const h = (tower.geometry as THREE.BoxGeometry).parameters.height;
          const targetY = THREE.MathUtils.lerp(-h, -h / 2, Math.max(0, Math.min(1, t * 1.3 - (idx / towersCount) * 0.4)));
          tower.position.y = targetY;
        });

        cityscapeGroup.rotation.y = elapsed * 0.03;

        camera.position.x = THREE.MathUtils.lerp(0, -6, t);
        camera.position.y = THREE.MathUtils.lerp(8, 12, t);
        camera.position.z = THREE.MathUtils.lerp(16, 20, t);
      }
      // SECTION 7 & 8: Contact Map (Scroll: 0.88 -> 1.0)
      else {
        const t = (currentScroll - 0.88) / (1.0 - 0.88);

        structureGroup.visible = false;
        timelineGroup.visible = false;
        productsGroup.visible = false;
        logisticsGroup.visible = false;
        cityscapeGroup.visible = false;

        globe.rotation.y = elapsed * 0.15;
        globe.rotation.x = Math.sin(elapsed * 0.2) * 0.2;

        camera.position.x = THREE.MathUtils.lerp(-6, 0, t);
        camera.position.y = THREE.MathUtils.lerp(12, 2, t);
        camera.position.z = THREE.MathUtils.lerp(20, 15, t);
      }

      // Parallax mouse effect
      camera.position.x += (mouse.x * 2.2 - camera.position.x) * 0.015;
      camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);

      starField.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // ─── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // Dispose materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none select-none">
      <canvas ref={canvasRef} className="w-full h-full transition-opacity duration-700" />
      {/* Visual Overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-premium-glass)_100%)] pointer-events-none" />
    </div>
  );
}
