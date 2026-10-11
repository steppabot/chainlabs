/* ChainLab Peptides — shared layout, cart, checkout, effects */
(function () {
  const CFG = window.CL_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  /* ---------- category meta ---------- */
  const CATS = {
    "Metabolic":  { c: "#6dffb3", blurb: "Incretin, amylin and metabolic-signaling research compounds." },
    "Repair":     { c: "#4cd7ff", blurb: "Tissue, matrix and repair-pathway research peptides and blends." },
    "GH Axis":    { c: "#8a7dff", blurb: "GHRH analogs, secretagogues and IGF-axis research materials." },
    "Longevity":  { c: "#ffc46b", blurb: "Mitochondrial, NAD and bioregulator research compounds." },
    "Neuro":      { c: "#ff7a9c", blurb: "Neuropeptide and sleep-signaling research materials." },
    "Signaling":  { c: "#c58bff", blurb: "Melanocortin, kisspeptin and hormone-signaling research." },
    "Supplies":   { c: "#b8c2d6", blurb: "Bacteriostatic water and lab essentials." }
  };
  window.CL_CATS = CATS;

  /* ---------- vial SVG ---------- */
  let vid = 0;
  window.vialSVG = function (color, label, size, cls = "vial") {
    const id = "g" + (vid++);
    return `<svg class="${cls}" viewBox="0 0 80 170" aria-hidden="true">
      <defs>
        <linearGradient id="${id}a" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>
        <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="${color}"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="${color}"/></linearGradient>
        <linearGradient id="${id}p" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#dfe6ee" stop-opacity=".8"/></linearGradient>
      </defs>
      <rect x="18" y="4" width="44" height="22" rx="4" fill="${color}"/>
      <rect x="18" y="4" width="44" height="22" rx="4" fill="url(#${id}c)" opacity=".35"/>
      <rect x="22" y="26" width="36" height="10" fill="#c9d2dc"/>
      <path d="M24 36h32v8c8 3 12 7 12 14v96c0 7-5 12-12 12H24c-7 0-12-5-12-12V58c0-7 4-11 12-14z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>
      <rect x="15" y="68" width="50" height="58" rx="3" fill="url(#${id}p)"/>
      <rect x="15" y="68" width="50" height="8" fill="${color}"/>
      <text x="40" y="92" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="${label.length > 9 ? 7 : 8.5}" fill="#0b0d12">${label}</text>
      <text x="40" y="106" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7.5" fill="#0b0d12">${size}</text>
      <text x="40" y="119" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="4.6" fill="#5b6372" letter-spacing=".5">CHAINLAB · RUO</text>
      <path d="M16 140c8 5 40 5 48 0v14c0 7-5 12-12 12H28c-7 0-12-5-12-12z" fill="#fff" opacity=".85"/>
      <path d="M12 58v96c0 7 5 12 12 12h32c7 0 12-5 12-12V58" fill="url(#${id}a)"/>
    </svg>`;
  };

  /* ---------- layout chrome ---------- */
  const logoSVG = `<svg viewBox="0 0 40 40"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6dffb3"/><stop offset=".5" stop-color="#4cd7ff"/><stop offset="1" stop-color="#8a7dff"/></linearGradient></defs>
    <path d="M8 28 L16 12 L24 26 L32 10" fill="none" stroke="url(#lg)" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="8" cy="28" r="4.2" fill="#6dffb3"/><circle cx="16" cy="12" r="4.2" fill="#4cd7ff"/><circle cx="24" cy="26" r="4.2" fill="#8a7dff"/><circle cx="32" cy="10" r="4.2" fill="#eef1f6"/></svg>`;
  const page = document.body.dataset.page;
  const icon = {
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>`,
    x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>`
  };

  const header = `
  <div class="announce">US-stocked research peptides · Ships from domestic inventory · Free shipping over ${money(CFG.freeShippingOver)}</div>
  <header class="nav"><div class="wrap">
    <a href="index.html" class="logo">${logoSVG}<div>ChainLab<small>PEPTIDES</small></div></a>
    <nav class="nav-links" id="navLinks">
      <a href="index.html" class="${page === "home" ? "active" : ""}">Home</a>
      <a href="products.html" class="${page === "products" ? "active" : ""}">Products</a>
      <a href="contact.html" class="${page === "contact" ? "active" : ""}">Contact</a>
    </nav>
    <button class="cart-btn" id="cartOpen" aria-label="Open cart">${icon.bag}<span class="lbl">Cart</span><span class="cart-count" id="cartCount">0</span></button>
    <button class="burger" id="burger" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>
  </div></header>`;

  const footer = `
  <footer><div class="wrap">
    <div class="foot-grid">
      <div><a href="index.html" class="logo">${logoSVG}<div>ChainLab<small>PEPTIDES</small></div></a>
        <p class="muted" style="margin-top:16px;max-width:320px;font-size:.92rem">Research-grade peptides stocked in the United States. Sold as single vials or 10-vial kits for laboratory research.</p></div>
      <div><h6>Shop</h6><ul>
        ${Object.keys(CATS).map(c => `<li><a href="products.html?cat=${encodeURIComponent(c)}">${c}</a></li>`).join("")}
      </ul></div>
      <div><h6>Company</h6><ul><li><a href="index.html#how">How it works</a></li><li><a href="contact.html">Contact</a></li><li><a href="contact.html#faq">FAQ</a></li></ul></div>
      <div><h6>Support</h6><ul><li><a href="mailto:${CFG.supportEmail}">${CFG.supportEmail}</a></li><li><a href="contact.html">Send a message</a></li></ul></div>
    </div>
    <div class="ruo"><b>⚠</b><div><b>For research use only.</b> All products sold by ChainLab Peptides are intended solely for in-vitro laboratory research by qualified professionals. Not for human or veterinary use, not for consumption, and not intended to diagnose, treat, cure or prevent any disease. These statements have not been evaluated by the FDA. Purchasers must be 21+.</div></div>
    <div class="huge-word">ChainLab</div>
    <div class="copy"><span>© ${new Date().getFullYear()} ChainLab Peptides. All rights reserved.</span><span>chainlabpeptides.com</span></div>
  </div></footer>`;

  const drawer = `
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Cart">
    <div class="drawer-head"><h3>Your cart</h3><button class="x" id="cartClose" aria-label="Close">${icon.x}</button></div>
    <div class="drawer-body" id="cartBody"></div>
    <div class="drawer-foot" id="cartFoot">
      <div class="ship-note" id="shipNote"></div><div class="ship-bar"><i id="shipBar"></i></div>
      <div class="row"><span>Subtotal</span><span id="subT">$0</span></div>
      <div class="row"><span>Shipping</span><span id="shipT">$0</span></div>
      <div class="row total"><span>Total</span><span id="totT">$0</span></div>
      <form class="checkout-form" id="checkoutForm">
        <input class="input" name="name" placeholder="Full name" required>
        <input class="input" name="email" type="email" placeholder="Email" required>
        <textarea class="input" name="address" placeholder="Shipping address" style="min-height:80px" required></textarea>
        <label class="ack"><input type="checkbox" required> I confirm I am 21+ and purchasing for laboratory research use only, not for human consumption.</label>
        <div id="paypal-buttons"></div>
        <button class="btn btn-primary" type="submit" id="orderSubmit">Submit order request</button>
        <p class="ship-note">We'll email your invoice and payment instructions to confirm the order.</p>
      </form>
      <button class="btn btn-primary" id="toCheckout">Checkout</button>
    </div>
  </aside>
  <div class="toast" id="toast"></div>
  <div class="gate" id="gate" hidden><div class="gate-box">
    <div style="display:flex;justify-content:center">${logoSVG.replace("<svg", '<svg width="56" height="56"')}</div>
    <h3>Research use only</h3>
    <p>This site sells peptides strictly for laboratory research. By entering you confirm you are 21 or older and agree that no product is for human or animal consumption.</p>
    <div class="btns"><button class="btn btn-primary" id="gateYes">I'm 21+ — Enter</button><a class="btn btn-ghost" href="https://www.google.com">Leave</a></div>
  </div></div>
  <div class="cursor-glow" id="glow"></div>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer + drawer);

  /* ---------- age gate ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  if (!store.get("cl_gate", false)) $("#gate").hidden = false;
  $("#gateYes").onclick = () => { store.set("cl_gate", true); $("#gate").hidden = true; };

  /* ---------- nav ---------- */
  $("#burger").onclick = () => $("#navLinks").classList.toggle("open");

  /* ---------- toast ---------- */
  let tt;
  window.toast = msg => { const t = $("#toast"); t.innerHTML = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2200); };

  /* ---------- cart ---------- */
  const P = window.CL_PRODUCTS || [];
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  let cart = store.get("cl_cart", []);
  const priceOf = it => { const p = byId[it.id]; const s = p && p.sizes.find(x => x.size === it.size); return s ? s[it.mode] : 0; };
  cart = cart.filter(it => priceOf(it) > 0);

  const save = () => { store.set("cl_cart", cart); render(); };
  window.addToCart = (id, size, mode, qty = 1) => {
    const ex = cart.find(i => i.id === id && i.size === size && i.mode === mode);
    ex ? ex.qty += qty : cart.push({ id, size, mode, qty });
    save();
    const c = $("#cartCount"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    toast(`✓ Added ${byId[id].name} ${size} · ${mode === "kit" ? "10-vial kit" : "single vial"}`);
  };
  const totals = () => {
    const sub = cart.reduce((a, i) => a + priceOf(i) * i.qty, 0);
    const free = CFG.freeShippingOver > 0 && sub >= CFG.freeShippingOver;
    const ship = sub === 0 || free ? 0 : CFG.shippingFlat;
    return { sub, ship, total: sub + ship };
  };

  function render() {
    const n = cart.reduce((a, i) => a + i.qty, 0);
    $("#cartCount").textContent = n;
    const body = $("#cartBody");
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><div style="display:flex;justify-content:center;opacity:.5;margin-bottom:16px">${vialSVG("#3a4150", "EMPTY", "—", "")}</div>Your cart is empty.<br><br><a class="btn btn-ghost" href="products.html">Browse products</a></div>`;
      $("#cartFoot").style.display = "none"; return;
    }
    $("#cartFoot").style.display = "";
    body.innerHTML = cart.map((it, i) => {
      const p = byId[it.id], c = CATS[p.cat].c;
      return `<div class="line-item"><div class="thumb">${vialSVG(c, p.name.length > 12 ? p.name.slice(0, 11) + "…" : p.name, it.size, "")}</div>
        <div><h5>${p.name}</h5><div class="meta">${it.size} · ${it.mode === "kit" ? "10-VIAL KIT" : "SINGLE VIAL"}</div>
          <div style="display:flex;gap:12px;align-items:center;margin-top:6px"><div class="qty"><button data-q="${i}" data-d="-1">−</button><span>${it.qty}</span><button data-q="${i}" data-d="1">+</button></div><button class="rm" data-rm="${i}">Remove</button></div></div>
        <div class="lp">${money(priceOf(it) * it.qty)}</div></div>`;
    }).join("");
    const t = totals();
    $("#subT").textContent = money(t.sub); $("#shipT").textContent = t.ship ? money(t.ship) : "Free"; $("#totT").textContent = money(t.total);
    if (CFG.freeShippingOver > 0) {
      const left = CFG.freeShippingOver - t.sub;
      $("#shipNote").innerHTML = left > 0 ? `You're <b style="color:var(--mint)">${money(left)}</b> away from free shipping` : `🎉 You've unlocked free shipping`;
      $("#shipBar").style.width = Math.min(100, t.sub / CFG.freeShippingOver * 100) + "%";
    }
  }
  $("#cartBody").addEventListener("click", e => {
    const q = e.target.closest("[data-q]"), r = e.target.closest("[data-rm]");
    if (q) { const it = cart[q.dataset.q]; it.qty += +q.dataset.d; if (it.qty < 1) cart.splice(q.dataset.q, 1); save(); }
    if (r) { cart.splice(r.dataset.rm, 1); save(); }
  });
  const open = () => { $("#drawer").classList.add("open"); $("#scrim").classList.add("open"); };
  const close = () => { $("#drawer").classList.remove("open"); $("#scrim").classList.remove("open"); };
  window.openCart = open;
  $("#cartOpen").onclick = open; $("#cartClose").onclick = close; $("#scrim").onclick = close;
  document.addEventListener("keydown", e => e.key === "Escape" && close());

  /* ---------- checkout ---------- */
  const orderText = () => cart.map(i => `${i.qty} × ${byId[i.id].name} ${i.size} (${i.mode === "kit" ? "10-vial kit" : "single vial"}) — ${money(priceOf(i) * i.qty)}`).join("\n");
  let paypalLoaded = false;
  $("#toCheckout").onclick = () => {
    $("#checkoutForm").classList.add("show"); $("#toCheckout").style.display = "none";
    $("#cartBody").scrollTop = 1e6;
    if (CFG.paypalClientId && !paypalLoaded) loadPayPal();
  };
  function loadPayPal() {
    paypalLoaded = true;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CFG.paypalClientId)}&currency=USD&disable-funding=paylater`;
    s.onload = () => paypal.Buttons({
      style: { shape: "pill", color: "black", label: "pay" },
      onClick: (d, actions) => $("#checkoutForm").reportValidity() ? actions.resolve() : actions.reject(),
      createOrder: (d, actions) => {
        const t = totals();
        return actions.order.create({ purchase_units: [{ description: "ChainLab Peptides order", amount: { currency_code: "USD", value: t.total.toFixed(2) } }] });
      },
      onApprove: (d, actions) => actions.order.capture().then(det => sendOrder("PAID via PayPal · " + det.id))
    }).render("#paypal-buttons");
    document.head.appendChild(s);
  }
  async function sendOrder(status) {
    const f = $("#checkoutForm"), fd = Object.fromEntries(new FormData(f)), t = totals();
    const btn = $("#orderSubmit"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch(CFG.formEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: `New order request — ${fd.name} — ${money(t.total)}`, _template: "box", name: fd.name, email: fd.email, shipping_address: fd.address, status, order: orderText(), subtotal: money(t.sub), shipping: money(t.ship), total: money(t.total) })
      });
      if (!r.ok) throw 0;
      cart = []; save(); f.reset(); f.classList.remove("show"); $("#toCheckout").style.display = "";
      $("#cartBody").innerHTML = `<div class="cart-empty"><div class="success show"><div class="ring">✓</div><h3 style="font-family:var(--fd);color:var(--text);margin-bottom:8px">Order received</h3>We'll email ${fd.email} with your invoice shortly.</div></div>`;
      $("#cartFoot").style.display = "none";
    } catch { toast("Couldn't send — please email " + CFG.supportEmail); }
    btn.disabled = false; btn.textContent = "Submit order request";
  }
  $("#checkoutForm").addEventListener("submit", e => { e.preventDefault(); sendOrder("Awaiting payment (invoice customer)"); });
  render();

  /* ---------- effects ---------- */
  const glow = $("#glow");
  window.addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  window.observeReveal = (root = document) => $$(".reveal:not(.in)", root).forEach(el => io.observe(el));
  observeReveal();

  // 3D tilt for cards/tiles
  window.bindTilt = (sel) => $$(sel).forEach(el => {
    if (el.dataset.tilt) return; el.dataset.tilt = 1;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-4px)`;
      el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    });
    el.addEventListener("pointerleave", () => el.style.transform = "");
  });

  // count-up numbers
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now();
    const tick = t => { const k = Math.min(1, (t - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = v + suf; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .5 });
  $$("[data-count]").forEach(el => cio.observe(el));
})();
