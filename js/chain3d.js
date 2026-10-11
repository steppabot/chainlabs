/* Spinning 3D amino-acid chain (Three.js r128). Drag to spin, hover a residue to inspect it. */
window.initChain = function (canvas, opts = {}) {
  if (!window.THREE || !canvas) return;
  const o = Object.assign({ residues: 34, interactive: true, offsetX: 0.28, zoom: 15, particles: true }, opts);
  const AA = [
    ["Gly", "Glycine", "G", 0x6dffb3], ["Ala", "Alanine", "A", 0x4cd7ff], ["Pro", "Proline", "P", 0x8a7dff],
    ["Lys", "Lysine", "K", 0xffc46b], ["Arg", "Arginine", "R", 0xff7a9c], ["Ser", "Serine", "S", 0x6dffb3],
    ["His", "Histidine", "H", 0xc58bff], ["Glu", "Glutamate", "E", 0x4cd7ff], ["Val", "Valine", "V", 0xeef1f6],
    ["Leu", "Leucine", "L", 0x8a7dff], ["Asp", "Aspartate", "D", 0xffc46b], ["Thr", "Threonine", "T", 0x6dffb3],
    ["Trp", "Tryptophan", "W", 0xff7a9c], ["Cys", "Cysteine", "C", 0xffc46b], ["Met", "Methionine", "M", 0x4cd7ff]
  ];
  // BPC-157 sequence, used to pick residues
  const SEQ = "GEPPPGKPADDAGLVGEPPPGKPADDAGLVGEPPPGKPA";
  const pick = ch => AA.find(a => a[2] === ch) || AA[0];

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x06070a, 12, 30);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  cam.position.set(0, 0, o.zoom);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const k1 = new THREE.PointLight(0x6dffb3, 1.6, 40); k1.position.set(6, 6, 8); scene.add(k1);
  const k2 = new THREE.PointLight(0x8a7dff, 1.4, 40); k2.position.set(-8, -4, 6); scene.add(k2);
  const k3 = new THREE.DirectionalLight(0xffffff, 0.5); k3.position.set(0, 10, 10); scene.add(k3);

  const root = new THREE.Group(); scene.add(root);
  const chain = new THREE.Group(); root.add(chain);

  // backbone positions: alpha helix that unwinds into a coil
  const pts = [];
  for (let i = 0; i < o.residues; i++) {
    const t = i / (o.residues - 1);
    const a = i * 1.75;
    const r = 1.55 + Math.sin(t * Math.PI) * 0.35;
    pts.push(new THREE.Vector3(Math.cos(a) * r, (t - 0.5) * 13, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 400, 0.09, 10, false),
    new THREE.MeshStandardMaterial({ color: 0x9aa4b8, metalness: .6, roughness: .3, transparent: true, opacity: .55 })
  );
  chain.add(tube);
  // glowing ribbon
  const ribbon = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 400, 0.22, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x6dffb3, transparent: true, opacity: .06, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  chain.add(ribbon);

  const atoms = [];
  const sphere = new THREE.SphereGeometry(1, 32, 24);
  const bondGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xc9d2dc, metalness: .4, roughness: .4 });
  pts.forEach((p, i) => {
    const aa = pick(SEQ[i % SEQ.length]);
    const mat = new THREE.MeshPhysicalMaterial({ color: aa[3], emissive: aa[3], emissiveIntensity: .18, metalness: .1, roughness: .18, clearcoat: 1, clearcoatRoughness: .15 });
    const m = new THREE.Mesh(sphere, mat);
    m.scale.setScalar(0.42); m.position.copy(p);
    m.userData = { aa, i, base: 0.42 };
    chain.add(m); atoms.push(m);
    // side chain pointing outward
    const out = new THREE.Vector3(p.x, 0, p.z).normalize();
    const len = 0.7 + ((i * 37) % 5) * 0.12;
    const sp = p.clone().add(out.clone().multiplyScalar(len + 0.4));
    const s = new THREE.Mesh(sphere, new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: aa[3], emissiveIntensity: .25, roughness: .25, clearcoat: 1, transparent: true, opacity: .85 }));
    s.scale.setScalar(0.17 + (i % 3) * 0.04); s.position.copy(sp); chain.add(s);
    const b = new THREE.Mesh(bondGeo, bondMat);
    const mid = p.clone().add(sp).multiplyScalar(.5); b.position.copy(mid);
    b.scale.y = p.distanceTo(sp); b.lookAt(sp); b.rotateX(Math.PI / 2); chain.add(b);
  });

  // particles
  let dust;
  if (o.particles) {
    const g = new THREE.BufferGeometry(), N = 500, arr = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) arr[i] = (Math.random() - .5) * 34;
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x6dffb3, size: .04, transparent: true, opacity: .55 }));
    scene.add(dust);
  }

  // sizing
  let mobile = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    mobile = w < 760;
    root.position.x = mobile ? 1.6 : o.offsetX * (cam.position.z * Math.tan(cam.fov * Math.PI / 360) * cam.aspect);
    root.position.y = mobile ? -1 : 0;
    root.scale.setScalar(mobile ? .7 : 1);
  }
  new ResizeObserver(resize).observe(canvas); resize();

  // interaction
  const mouse = new THREE.Vector2(-9, -9), ray = new THREE.Raycaster();
  let tx = 0, ty = 0, drag = false, lx = 0, vel = 0.004, spin = 0, hovered = null;
  const tag = opts.tag;
  if (o.interactive) {
    canvas.addEventListener("pointerdown", e => { drag = true; lx = e.clientX; canvas.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", () => { drag = false; canvas.style.cursor = "grab"; });
    canvas.style.cursor = "grab";
    window.addEventListener("pointermove", e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      tx = mouse.x * .25; ty = mouse.y * .15;
      if (drag) { vel = (e.clientX - lx) * 0.0009; lx = e.clientX; }
      if (tag) { tag.style.left = (e.clientX - r.left) + "px"; tag.style.top = (e.clientY - r.top) + "px"; }
    }, { passive: true });
  }

  let scrollFade = 1;
  window.addEventListener("scroll", () => { scrollFade = Math.max(0, 1 - scrollY / (innerHeight * .9)); }, { passive: true });

  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(e => visible = e[0].isIntersecting).observe(canvas);
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!drag) vel += (0.004 - vel) * 0.02;
    spin += vel;
    chain.rotation.y = spin;
    root.rotation.x += ((-ty) + 0.18 - root.rotation.x) * .05;
    root.rotation.z += ((tx * .4) - 0.22 - root.rotation.z) * .05;
    chain.position.y = Math.sin(t * .6) * .25;
    if (dust) { dust.rotation.y = t * .02; dust.rotation.x = t * .01; }

    // hover
    if (o.interactive) {
      ray.setFromCamera(mouse, cam);
      const hit = ray.intersectObjects(atoms)[0];
      const h = hit ? hit.object : null;
      if (h !== hovered) {
        hovered = h;
        if (tag) {
          if (h) { const a = h.userData.aa; tag.innerHTML = `<b>${a[0]} · ${a[2]}</b>${a[1]} — residue ${h.userData.i + 1}`; tag.style.opacity = 1; }
          else tag.style.opacity = 0;
        }
      }
    }
    atoms.forEach((m, i) => {
      const pulse = 1 + Math.sin(t * 2 + i * .5) * .05;
      const target = m === hovered ? m.userData.base * 1.6 : m.userData.base * pulse;
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * .2);
      m.material.emissiveIntensity = m === hovered ? .9 : .18;
    });
    canvas.style.opacity = (opts.fadeOnScroll ? scrollFade : 1) * (mobile && opts.fadeOnScroll ? .45 : 1);
    renderer.render(scene, cam);
  })();
};
