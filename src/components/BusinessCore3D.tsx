import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BusinessCore3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0f17, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Light Sources
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x2563eb, 3, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xd97706, 3, 30);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x4f46e5, 2, 20);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    // 3. Central Hologram core (Pulsing Icosahedron)
    const coreGeometry = new THREE.IcosahedronGeometry(3, 2);
    
    // Create dual materials: a wireframe and a glowing translucent shell
    const coreWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    
    const coreMesh = new THREE.Mesh(coreGeometry, coreWireframeMaterial);
    scene.add(coreMesh);

    // Outer shell wireframe
    const outerCoreGeometry = new THREE.IcosahedronGeometry(3.1, 1);
    const outerWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const outerCoreMesh = new THREE.Mesh(outerCoreGeometry, outerWireframeMaterial);
    scene.add(outerCoreMesh);

    // 4. Particle System (Glowing Stars)
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorNavy = new THREE.Color(0x2563eb);
    const colorGold = new THREE.Color(0xd97706);
    const colorSlate = new THREE.Color(0x94a3b8);

    for (let i = 0; i < particleCount; i++) {
      // Position particles in a spherical cloud around the core
      const r = 3.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Assign custom gradient colors
      const mixRatio = Math.random();
      let vertexColor = new THREE.Color();
      if (mixRatio < 0.4) {
        vertexColor.copy(colorNavy).lerp(colorGold, Math.random());
      } else if (mixRatio < 0.8) {
        vertexColor.copy(colorGold).lerp(colorSlate, Math.random());
      } else {
        vertexColor.copy(colorSlate).lerp(colorNavy, Math.random());
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;

      sizes[i] = 1.0 + Math.random() * 2.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Canvas Texture for beautiful smooth circular glowing particles
    const createCircularTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(240, 246, 255, 0.9)');
        gradient.addColorStop(0.6, 'rgba(37, 99, 235, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: createCircularTexture(),
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 5. Dynamic Orbiting Satellite Nodes (representing business metrics)
    const satellites: Array<{
      mesh: THREE.Mesh;
      speed: number;
      radius: number;
      angle: number;
      axis: THREE.Vector3;
      name: string;
    }> = [];

    const nodeNames = ['GST', 'CashFlow', 'Invoices', 'Gemma AI', 'SIDBI', 'Roadmap'];
    const nodeColors = [0x991b1b, 0xd97706, 0xea580c, 0xfacc15, 0xef4444, 0xf87171];

    nodeNames.forEach((name, i) => {
      const nodeGeom = new THREE.SphereGeometry(0.25, 16, 16);
      const nodeMat = new THREE.MeshPhongMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 1.5,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      
      const orbitRadius = 4.8 + i * 0.4;
      const randomAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      scene.add(nodeMesh);

      satellites.push({
        mesh: nodeMesh,
        speed: 0.2 + Math.random() * 0.3,
        radius: orbitRadius,
        angle: Math.random() * Math.PI * 2,
        axis: randomAxis,
        name
      });

      // Draw orbit rings
      const ringGeom = new THREE.RingGeometry(orbitRadius - 0.01, orbitRadius + 0.01, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColors[i],
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      
      // Align ring to its random orbit axis
      const defaultAxis = new THREE.Vector3(0, 0, 1);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultAxis, randomAxis);
      ring.quaternion.copy(quaternion);
      scene.add(ring);
    });

    // 6. Interactivity & Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Slow dynamic core rotation
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = elapsedTime * 0.12;

      outerCoreMesh.rotation.y = -elapsedTime * 0.15;
      outerCoreMesh.rotation.z = elapsedTime * 0.1;

      // Pulse core mesh scale
      const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.06;
      coreMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Rotate whole particle system slowly
      particleSystem.rotation.y = elapsedTime * 0.08;
      particleSystem.rotation.x = elapsedTime * 0.04;

      // Parallax easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Warp scene slightly based on mouse
      scene.rotation.y = targetX * 0.6;
      scene.rotation.x = -targetY * 0.6;

      // Update orbiting satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed * clock.getDelta();
        
        // Calculate point in space around randomAxis using quaternion
        const position = new THREE.Vector3(sat.radius, 0, 0);
        const quaternion = new THREE.Quaternion().setFromAxisAngle(sat.axis, sat.angle);
        position.applyQuaternion(quaternion);
        
        sat.mesh.position.copy(position);

        // Make satellites hover/bob slightly
        const bob = Math.sin(elapsedTime * 3 + sat.radius) * 0.08;
        sat.mesh.position.addScaledVector(sat.axis, bob);
      });

      // Animate particles (make them wave gently)
      const positionsArr = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        // Apply slight offset wave
        const wave = Math.sin(elapsedTime + positionsArr[idx]) * 0.012;
        positionsArr[idx + 1] += wave;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose geometries & materials
      coreGeometry.dispose();
      outerCoreGeometry.dispose();
      coreWireframeMaterial.dispose();
      outerWireframeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      
      satellites.forEach(sat => {
        sat.mesh.geometry.dispose();
        if (Array.isArray(sat.mesh.material)) {
          sat.mesh.material.forEach(m => m.dispose());
        } else {
          sat.mesh.material.dispose();
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" id="business-core-three-canvas" />

      {/* Floating HUD Badges for futuristic, high-fidelity visuals */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-widest text-gray-400 pointer-events-none select-none">
        CORE_ACTIVE: <span className="text-[#22c55e] animate-pulse">OK</span>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-widest text-gray-400 pointer-events-none select-none">
        GEMMA_INTELLIGENCE: <span className="text-[#d97706]">100%</span>
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#991b1b]" />
          <span className="text-[9px] font-mono text-gray-400">Neural Network Nodes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
          <span className="text-[9px] font-mono text-gray-400">GSTIN Tracker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
          <span className="text-[9px] font-mono text-gray-400">Live Simulation</span>
        </div>
      </div>
    </div>
  );
}
