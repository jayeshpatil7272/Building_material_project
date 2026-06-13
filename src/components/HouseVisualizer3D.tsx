'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Layers, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VisualizerProps {
  sqft: number;
  floors: number;
  constructionType: string;
  soilType: string;
  layout?: 'custom' | '2bhk' | '3bhk';
}

export default function HouseVisualizer3D({ sqft, floors, constructionType, soilType, layout = 'custom' }: VisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'blueprint' | 'concrete' | 'structure'>('blueprint');

  // Interactive control states
  const rotationRef = useRef({ x: 0.5, y: -0.8 });
  const zoomRef = useRef(1.0);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 350;

    // ─── Scene & Camera Setup ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0e);
    scene.fog = new THREE.FogExp2(0x0a0a0e, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 100);
    camera.position.set(0, 8, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf26419, 0.4); // Neon orange fill
    dirLight2.position.set(-10, 5, -10);
    scene.add(dirLight2);

    // ─── Grid & Ground Helper ───
    const gridHelper = new THREE.GridHelper(24, 24, 0xf26419, 0x1f2937);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // ─── Compute Structural Scale ───
    const baseArea = sqft;
    const widthRatio = 0.75;
    const houseWidth = Math.max(4, Math.min(11, Math.sqrt(baseArea * widthRatio) * 0.25));
    const houseLength = Math.max(5, Math.min(13, (baseArea / Math.sqrt(baseArea * widthRatio)) * 0.25));
    const floorHeight = 1.6;

    // Root Group
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // Materials dictionary based on viewMode
    const materials = {
      concrete: new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.7, metalness: 0.2 }),
      orangeGlow: new THREE.MeshBasicMaterial({ color: 0xf26419, wireframe: true }),
      brick: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8, metalness: 0.1 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3, roughness: 0.1, transmission: 0.6 }),
      slab: viewMode === 'blueprint' 
        ? new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true })
        : new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6 }),
      column: viewMode === 'blueprint'
        ? new THREE.MeshBasicMaterial({ color: 0xf26419, wireframe: false })
        : new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.5 }),
      wall: viewMode === 'blueprint'
        ? new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.4 })
        : new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9, transparent: true, opacity: 0.85 }),
      partitionWall: viewMode === 'blueprint'
        ? new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.6 })
        : new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8, transparent: true, opacity: 0.9 }),
      foundation: viewMode === 'blueprint'
        ? new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true })
        : new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }),
      bed: new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true }), // Blue wireframe furniture
      sofa: new THREE.MeshBasicMaterial({ color: 0xeab308, wireframe: true }) // Yellow wireframe furniture
    };

    // ─── 1. Foundations (Soil dependent depth) ───
    let foundationDepth = 1.0;
    if (soilType === 'soft') foundationDepth = 1.8;
    if (soilType === 'rocky') foundationDepth = 0.6;

    const columnRows = 4;
    const columnCols = 4;
    const colSpacingX = houseWidth / (columnCols - 1);
    const colSpacingZ = houseLength / (columnRows - 1);

    for (let r = 0; r < columnRows; r++) {
      for (let c = 0; c < columnCols; c++) {
        const x = -houseWidth / 2 + c * colSpacingX;
        const z = -houseLength / 2 + r * colSpacingZ;

        // Foundation Pad
        const padSize = soilType === 'soft' ? 0.7 : 0.5;
        const fGeom = new THREE.BoxGeometry(padSize, foundationDepth, padSize);
        const fMesh = new THREE.Mesh(fGeom, materials.foundation);
        fMesh.position.set(x, -foundationDepth / 2, z);
        houseGroup.add(fMesh);

        // Foundation Pier Column
        const pierGeom = new THREE.BoxGeometry(0.2, foundationDepth, 0.2);
        const pierMesh = new THREE.Mesh(pierGeom, materials.column);
        pierMesh.position.set(x, -foundationDepth / 2, z);
        houseGroup.add(pierMesh);
      }
    }

    // ─── 2. Slabs, Columns, and Beams for each floor ───
    const isRCC = constructionType !== 'loadbearing';

    for (let f = 0; f < floors; f++) {
      const slabY = f * floorHeight;

      // Floor Slab
      const slabGeom = new THREE.BoxGeometry(houseWidth + 0.3, 0.1, houseLength + 0.3);
      const slabMesh = new THREE.Mesh(slabGeom, materials.slab);
      slabMesh.position.set(0, slabY, 0);
      slabMesh.receiveShadow = true;
      slabMesh.castShadow = true;
      houseGroup.add(slabMesh);

      // Columns (Only if RCC structure)
      if (isRCC) {
        for (let r = 0; r < columnRows; r++) {
          for (let c = 0; c < columnCols; c++) {
            const x = -houseWidth / 2 + c * colSpacingX;
            const z = -houseLength / 2 + r * colSpacingZ;

            const colGeom = new THREE.BoxGeometry(0.18, floorHeight, 0.18);
            const colMesh = new THREE.Mesh(colGeom, materials.column);
            colMesh.position.set(x, slabY + floorHeight / 2, z);
            colMesh.castShadow = true;
            houseGroup.add(colMesh);
          }
        }

        // Horizontal Beams connecting columns on X and Z
        for (let r = 0; r < columnRows; r++) {
          const z = -houseLength / 2 + r * colSpacingZ;
          const beamGeomX = new THREE.BoxGeometry(houseWidth, 0.12, 0.12);
          const beamMeshX = new THREE.Mesh(beamGeomX, materials.column);
          beamMeshX.position.set(0, slabY + floorHeight, z);
          houseGroup.add(beamMeshX);
        }
        for (let c = 0; c < columnCols; c++) {
          const x = -houseWidth / 2 + c * colSpacingX;
          const beamGeomZ = new THREE.BoxGeometry(0.12, 0.12, houseLength);
          const beamMeshZ = new THREE.Mesh(beamGeomZ, materials.column);
          beamMeshZ.position.set(x, slabY + floorHeight, 0);
          houseGroup.add(beamMeshZ);
        }
      }

      // Walls (Solid between columns, except for door/window spots)
      if (viewMode !== 'structure') {
        const wallThick = 0.12;
        const wallH = floorHeight - (isRCC ? 0.12 : 0);

        // ─── External Walls ───
        // Back Wall
        const backWallGeom = new THREE.BoxGeometry(houseWidth, wallH, wallThick);
        const backWallMesh = new THREE.Mesh(backWallGeom, materials.wall);
        backWallMesh.position.set(0, slabY + wallH / 2, -houseLength / 2);
        backWallMesh.castShadow = true;
        houseGroup.add(backWallMesh);

        // Front wall with door cutout (represented visually by split meshes)
        const frontLeftGeom = new THREE.BoxGeometry(houseWidth * 0.35, wallH, wallThick);
        const frontLeftMesh = new THREE.Mesh(frontLeftGeom, materials.wall);
        frontLeftMesh.position.set(-houseWidth * 0.325, slabY + wallH / 2, houseLength / 2);
        houseGroup.add(frontLeftMesh);

        const frontRightGeom = new THREE.BoxGeometry(houseWidth * 0.35, wallH, wallThick);
        const frontRightMesh = new THREE.Mesh(frontRightGeom, materials.wall);
        frontRightMesh.position.set(houseWidth * 0.325, slabY + wallH / 2, houseLength / 2);
        houseGroup.add(frontRightMesh);

        const lintelGeom = new THREE.BoxGeometry(houseWidth * 0.3, wallH * 0.3, wallThick);
        const lintelMesh = new THREE.Mesh(lintelGeom, materials.wall);
        lintelMesh.position.set(0, slabY + wallH - (wallH * 0.15), houseLength / 2);
        houseGroup.add(lintelMesh);

        // Side Walls (Left & Right)
        const sideWallGeom = new THREE.BoxGeometry(wallThick, wallH, houseLength);
        const leftWallMesh = new THREE.Mesh(sideWallGeom, materials.wall);
        leftWallMesh.position.set(-houseWidth / 2, slabY + wallH / 2, 0);
        leftWallMesh.castShadow = true;
        houseGroup.add(leftWallMesh);

        const rightWallMesh = new THREE.Mesh(sideWallGeom, materials.wall);
        rightWallMesh.position.set(houseWidth / 2, slabY + wallH / 2, 0);
        rightWallMesh.castShadow = true;
        houseGroup.add(rightWallMesh);

        // ─── 3. Injected Presets (2BHK / 3BHK Internal Plane structure) ───
        if (layout === '2bhk') {
          // Z-axis wall dividing back bedrooms from front hall/kitchen
          const centerWallGeom = new THREE.BoxGeometry(houseWidth, wallH, wallThick);
          const centerWall = new THREE.Mesh(centerWallGeom, materials.partitionWall);
          centerWall.position.set(0, slabY + wallH / 2, 0);
          houseGroup.add(centerWall);

          // Room divider separating the 2 bedrooms in the back
          const dividerWallGeom = new THREE.BoxGeometry(wallThick, wallH, houseLength / 2);
          const dividerWall = new THREE.Mesh(dividerWallGeom, materials.partitionWall);
          dividerWall.position.set(0, slabY + wallH / 2, -houseLength / 4);
          houseGroup.add(dividerWall);

          // Kitchen partition in the front right
          const kitchenWallGeom = new THREE.BoxGeometry(wallThick, wallH, houseLength / 4);
          const kitchenWall = new THREE.Mesh(kitchenWallGeom, materials.partitionWall);
          kitchenWall.position.set(houseWidth / 4, slabY + wallH / 2, houseLength / 8);
          houseGroup.add(kitchenWall);

          // ─── Glowing Wireframe Blueprint Furniture ───
          if (viewMode === 'blueprint') {
            // Bed in Bedroom 1 (Back-Left)
            const bed1Geom = new THREE.BoxGeometry(1.2, 0.3, 1.4);
            const bed1 = new THREE.Mesh(bed1Geom, materials.bed);
            bed1.position.set(-houseWidth / 4, slabY + 0.15, -houseLength / 4 - 0.2);
            houseGroup.add(bed1);

            // Bed in Bedroom 2 (Back-Right)
            const bed2Geom = new THREE.BoxGeometry(1.2, 0.3, 1.4);
            const bed2 = new THREE.Mesh(bed2Geom, materials.bed);
            bed2.position.set(houseWidth / 4, slabY + 0.15, -houseLength / 4 - 0.2);
            houseGroup.add(bed2);

            // Sofa in Living Room (Front-Left)
            const sofa1Geom = new THREE.BoxGeometry(1.5, 0.3, 0.5);
            const sofa1 = new THREE.Mesh(sofa1Geom, materials.sofa);
            sofa1.position.set(-houseWidth / 4, slabY + 0.15, houseLength / 4);
            houseGroup.add(sofa1);

            const sofa2Geom = new THREE.BoxGeometry(0.5, 0.3, 1.0);
            sofa2Geom.translate(-0.5, 0, -0.25);
            const sofa2 = new THREE.Mesh(sofa2Geom, materials.sofa);
            sofa2.position.set(-houseWidth / 4 - 0.5, slabY + 0.15, houseLength / 4 + 0.25);
            houseGroup.add(sofa2);
          }
        } else if (layout === '3bhk') {
          // Main central wall at Z = -houseLength/6 splitting the house
          const centerWallGeom3 = new THREE.BoxGeometry(houseWidth, wallH, wallThick);
          const centerWall3 = new THREE.Mesh(centerWallGeom3, materials.partitionWall);
          centerWall3.position.set(0, slabY + wallH / 2, -houseLength / 6);
          houseGroup.add(centerWall3);

          // Partition splitting Bedroom 1 (Master) and Bedroom 2 in the back
          const dividerWall3A = new THREE.BoxGeometry(wallThick, wallH, houseLength / 3);
          const dividerWall3 = new THREE.Mesh(dividerWall3A, materials.partitionWall);
          dividerWall3.position.set(0, slabY + wallH / 2, -houseLength / 3);
          houseGroup.add(dividerWall3);

          // Bedroom 3 partition wall in the middle-left
          const bedroom3Geom = new THREE.BoxGeometry(houseWidth * 0.45, wallH, wallThick);
          const bedroom3Wall = new THREE.Mesh(bedroom3Geom, materials.partitionWall);
          bedroom3Wall.position.set(-houseWidth * 0.275, slabY + wallH / 2, houseLength / 6);
          houseGroup.add(bedroom3Wall);

          const bedroom3DivGeom = new THREE.BoxGeometry(wallThick, wallH, houseLength / 3);
          const bedroom3Div = new THREE.Mesh(bedroom3DivGeom, materials.partitionWall);
          bedroom3Div.position.set(-houseWidth * 0.05, slabY + wallH / 2, 0);
          houseGroup.add(bedroom3Div);

          // Kitchen partition wall in the front right
          const kitchenWallGeom3 = new THREE.BoxGeometry(wallThick, wallH, houseLength / 3);
          const kitchenWall3 = new THREE.Mesh(kitchenWallGeom3, materials.partitionWall);
          kitchenWall3.position.set(houseWidth / 4, slabY + wallH / 2, houseLength / 4);
          houseGroup.add(kitchenWall3);

          // ─── Glowing Wireframe Blueprint Furniture ───
          if (viewMode === 'blueprint') {
            // Bed 1: Bedroom 1 (Back-Left)
            const bed1Geom3 = new THREE.BoxGeometry(1.2, 0.3, 1.4);
            const bed13 = new THREE.Mesh(bed1Geom3, materials.bed);
            bed13.position.set(-houseWidth / 4, slabY + 0.15, -houseLength / 3 - 0.2);
            houseGroup.add(bed13);

            // Bed 2: Bedroom 2 (Back-Right)
            const bed2Geom3 = new THREE.BoxGeometry(1.2, 0.3, 1.4);
            const bed23 = new THREE.Mesh(bed2Geom3, materials.bed);
            bed23.position.set(houseWidth / 4, slabY + 0.15, -houseLength / 3 - 0.2);
            houseGroup.add(bed23);

            // Bed 3: Bedroom 3 (Middle-Left)
            const bed3Geom3 = new THREE.BoxGeometry(1.2, 0.3, 1.4);
            const bed33 = new THREE.Mesh(bed3Geom3, materials.bed);
            bed33.position.set(-houseWidth / 4, slabY + 0.15, 0);
            houseGroup.add(bed33);

            // Sofa in Living Room (Front-Center)
            const sofa13Geom = new THREE.BoxGeometry(1.5, 0.3, 0.5);
            const sofa13 = new THREE.Mesh(sofa13Geom, materials.sofa);
            sofa13.position.set(houseWidth / 12, slabY + 0.15, houseLength / 3);
            houseGroup.add(sofa13);
          }
        }
      }
    }

    // ─── Roof Slab (Final Roof) ───
    const roofY = floors * floorHeight;
    const roofGeom = new THREE.BoxGeometry(houseWidth + 0.4, 0.1, houseLength + 0.4);
    const roofMesh = new THREE.Mesh(roofGeom, materials.slab);
    roofMesh.position.set(0, roofY, 0);
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);

    // Slanted Roof cap for aesthetics (only in concrete/blueprint mode)
    if (viewMode === 'concrete' || viewMode === 'blueprint') {
      const roofCapGeom = new THREE.ConeGeometry(houseWidth * 0.6, 0.8, 4);
      roofCapGeom.rotateY(Math.PI / 4);
      const roofCapMesh = new THREE.Mesh(roofCapGeom, materials.slab);
      roofCapMesh.position.set(0, roofY + 0.4, 0);
      roofCapMesh.scale.set(1, 1, houseLength / houseWidth);
      houseGroup.add(roofCapMesh);
    }

    // Centering the structure visually
    houseGroup.position.y = 0.05;

    setLoading(false);

    // ─── Interaction & Animation Loop ───
    let animationFrameId: number;
    let autoRotate = true;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging.current) {
        rotationRef.current.y += 0.002;
      }

      houseGroup.rotation.y = rotationRef.current.y;
      houseGroup.rotation.x = rotationRef.current.x;

      const scale = zoomRef.current;
      houseGroup.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };
    animate();

    // Mouse/Touch Drag Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      autoRotate = false;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      rotationRef.current.y += deltaX * 0.005;
      rotationRef.current.x = Math.max(-0.2, Math.min(1.4, rotationRef.current.x + deltaY * 0.005));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      setTimeout(() => {
        if (!isDragging.current) autoRotate = true;
      }, 4000);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        autoRotate = false;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      rotationRef.current.y += deltaX * 0.007;
      rotationRef.current.x = Math.max(-0.2, Math.min(1.4, rotationRef.current.x + deltaY * 0.007));

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleMouseUp);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('resize', handleResize);

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
  }, [sqft, floors, constructionType, soilType, viewMode, layout]);

  return (
    <div className="relative w-full h-[350px] bg-[#0a0a0e] rounded-3xl border border-premium-border overflow-hidden group">
      {/* 3D WebGL Canvas Target */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#0a0a0e] flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 text-const-orange animate-spin" />
          <span className="text-xs text-gray-400">Rendering 3D Blueprint...</span>
        </div>
      )}

      {/* Overlay Blueprint Info */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
        <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-xl text-[9px] text-const-orange font-bold uppercase tracking-wider">
          <Layers className="w-3 h-3" />
          Interactive 3D Blueprint
        </span>
        <h4 className="text-xs font-bold text-white pl-1">
          {floors === 1 ? 'Ground Floor' : `G+${floors - 1} Storey`} Model
        </h4>
        <p className="text-[10px] text-gray-400 pl-1 capitalize">
          {layout === 'custom' ? 'Open Floor Plan' : `${layout} Layout Preset`} • {Math.round(sqft)} sq.ft
        </p>
      </div>

      {/* View Mode Controls */}
      <div className="absolute top-4 right-4 flex gap-1 bg-black/60 backdrop-blur-md p-1 border border-white/5 rounded-xl text-[10px]">
        {[
          { id: 'blueprint', label: 'Blueprint' },
          { id: 'concrete', label: 'Solid' },
          { id: 'structure', label: 'RCC Frame' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as any)}
            className={`px-2 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === mode.id
                ? 'bg-const-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Zoom / Rotate Controls */}
      <div className="absolute bottom-4 right-4 flex gap-1.5 bg-black/60 backdrop-blur-md p-1 border border-white/5 rounded-xl">
        <button
          onClick={() => {
            zoomRef.current = Math.min(1.5, zoomRef.current + 0.1);
          }}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            zoomRef.current = Math.max(0.6, zoomRef.current - 0.1);
          }}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            rotationRef.current = { x: 0.5, y: -0.8 };
            zoomRef.current = 1.0;
          }}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Drag to Rotate | Scroll / Pinch to Zoom
      </div>
    </div>
  );
}
