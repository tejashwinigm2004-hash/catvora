import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function NetworkScene({ color = '#1456E0', count }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    const small = window.innerWidth < 768; // fewer nodes on phones
    const N = count || (small ? 26 : 56);

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !small }); } catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.className = 'block h-full w-full';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    cam.position.z = 9;
    const group = new THREE.Group();
    scene.add(group);

    const pts = Array.from({ length: N }, () => new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8));
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    g.beginPath(); g.arc(16, 16, 14, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    const tex = new THREE.CanvasTexture(c);

    const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const pMat = new THREE.PointsMaterial({ color, size: small ? 0.22 : 0.18, map: tex, transparent: true, alphaTest: 0.4 });
    group.add(new THREE.Points(pGeo, pMat));

    const seg = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (pts[i].distanceTo(pts[j]) < 3.4) seg.push(pts[i], pts[j]);
    const lGeo = new THREE.BufferGeometry().setFromPoints(seg);
    const lMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
    group.add(new THREE.LineSegments(lGeo, lMat));

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const mouse = { x: 0, y: 0 };
    const move = (e) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('pointermove', move, { passive: true });

    let visible = true, raf;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return; // pause when off screen
      group.rotation.y += 0.0014;
      group.rotation.x = Math.sin(Date.now() / 6000) * 0.12;
      cam.position.x += (mouse.x * 0.8 - cam.position.x) * 0.04;
      cam.position.y += (-mouse.y * 0.5 - cam.position.y) * 0.04;
      cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', move);
      [pGeo, lGeo, pMat, lMat, tex].forEach((o) => o.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [color, count]);

  return <div ref={host} className="absolute inset-0" />;
}