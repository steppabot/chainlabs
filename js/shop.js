/* Product cards + products page logic */
(function () {
  const money = n => "$" + n.toLocaleString("en-US");
  const short = n => n.length > 11 ? n.replace("CJC-1295 without DAC", "CJC-1295").replace(" + ", "+").slice(0, 12) : n;

  window.renderCards = function (el, list, mode) {
    if (!list.length) { el.innerHTML = `<div class="empty">No compounds match that search.<br><br><button class="btn btn-ghost" onclick="resetFilters()">Clear filters</button></div>`; return; }
    el.innerHTML = list.map(p => {
      const c = CL_CATS[p.cat].c, s0 = p.sizes[0];
      return `<article class="card reveal" style="--c:${c}" data-id="${p.id}" data-size="${s0.size}" data-qty="1">
        <div class="stage"><span class="tag">${p.cat}</span><div class="vialbox">${vialSVG(c, short(p.name), s0.size)}</div></div>
        <div class="body">
          <div><h3>${p.name}</h3><div class="sub">${p.sizes.length} size${p.sizes.length > 1 ? "s" : ""} · from ${money(p.sizes[0].single)}/vial</div></div>
          <div class="sizes">${p.sizes.map((s, i) => `<button class="size ${i ? "" : "on"}" data-s="${s.size}">${s.size}</button>`).join("")}</div>
          <div class="buy">
            <div class="price" data-price></div>
            <div style="display:flex;gap:8px;align-items:center">
              <div class="qty"><button data-d="-1" aria-label="less">−</button><span data-qv>1</span><button data-d="1" aria-label="more">+</button></div>
              <button class="add" aria-label="Add to cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg></button>
            </div>
          </div>
        </div></article>`;
    }).join("");
    el.dataset.mode = mode;
    updatePrices(el);
    bindTilt(".card");
    observeReveal(el);
    if (!el.dataset.bound) { el.dataset.bound = 1; el.addEventListener("click", onCardClick); }
  };

  function updatePrices(scope) {
    const mode = scope.dataset.mode;
    scope.querySelectorAll(".card").forEach(card => {
      const p = CL_PRODUCTS.find(x => x.id === card.dataset.id), s = p.sizes.find(x => x.size === card.dataset.size);
      const per = mode === "kit" ? `<small>10-VIAL KIT · ${money(Math.round(s.kit / 10))}/VIAL</small>` : `<small>SINGLE VIAL</small>`;
      card.querySelector("[data-price]").innerHTML = money(s[mode]) + per;
    });
  }
  window.updatePrices = updatePrices;

  function onCardClick(e) {
    const card = e.target.closest(".card"); if (!card) return;
    const grid = card.parentElement, p = CL_PRODUCTS.find(x => x.id === card.dataset.id);
    const sz = e.target.closest(".size"), q = e.target.closest("[data-d]"), add = e.target.closest(".add");
    if (sz) {
      card.dataset.size = sz.dataset.s;
      card.querySelectorAll(".size").forEach(b => b.classList.toggle("on", b === sz));
      const box = card.querySelector(".vialbox");
      box.innerHTML = vialSVG(CL_CATS[p.cat].c, short(p.name), sz.dataset.s);
      box.firstElementChild.animate([{ transform: "translateY(20px) scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, easing: "cubic-bezier(.2,1.3,.4,1)" });
      updatePrices(grid);
    }
    if (q) { const v = Math.max(1, +card.dataset.qty + +q.dataset.d); card.dataset.qty = v; card.querySelector("[data-qv]").textContent = v; }
    if (add) {
      addToCart(p.id, card.dataset.size, grid.dataset.mode, +card.dataset.qty);
      add.classList.add("done"); add.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>`;
      flyToCart(card.querySelector(".vialbox svg"));
      setTimeout(() => { add.classList.remove("done"); add.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>`; }, 1400);
    }
  }

  function flyToCart(svg) {
    if (!svg) return;
    const a = svg.getBoundingClientRect(), b = document.getElementById("cartOpen").getBoundingClientRect();
    const ghost = svg.cloneNode(true);
    Object.assign(ghost.style, { position: "fixed", left: a.left + "px", top: a.top + "px", height: a.height + "px", zIndex: 400, pointerEvents: "none" });
    document.body.appendChild(ghost);
    ghost.animate([
      { transform: "none", opacity: 1 },
      { transform: `translate(${b.left - a.left}px,${b.top - a.top}px) scale(.15) rotate(25deg)`, opacity: .3 }
    ], { duration: 750, easing: "cubic-bezier(.6,-.2,.7,1)" }).onfinish = () => ghost.remove();
  }

  /* ---------- products page ---------- */
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const state = { q: params.get("q") || "", cat: params.get("cat") || "All", mode: params.get("mode") === "single" ? "single" : "kit", sort: "featured" };
  const search = document.getElementById("search"), chips = document.getElementById("chips"), sort = document.getElementById("sort");
  search.value = state.q;

  const counts = { All: CL_PRODUCTS.length }; CL_PRODUCTS.forEach(p => counts[p.cat] = (counts[p.cat] || 0) + 1);
  chips.innerHTML = ["All", ...Object.keys(CL_CATS)].map(c => `<button class="chip" data-c="${c}">${c}<i>${counts[c] || 0}</i></button>`).join("");

  // mode switch
  const sw = document.getElementById("modeSwitch"), knob = sw.querySelector(".knob");
  function placeKnob() { const b = sw.querySelector(`[data-m="${state.mode}"]`); knob.style.left = b.offsetLeft + "px"; knob.style.width = b.offsetWidth + "px"; sw.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); }
  sw.addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b) return; state.mode = b.dataset.m; placeKnob(); grid.dataset.mode = state.mode; updatePrices(grid); sync(); });

  window.resetFilters = () => { state.q = ""; state.cat = "All"; search.value = ""; apply(); };
  function sync() {
    const u = new URLSearchParams();
    if (state.q) u.set("q", state.q); if (state.cat !== "All") u.set("cat", state.cat); if (state.mode === "single") u.set("mode", "single");
    history.replaceState(null, "", "?" + u.toString());
  }
  function apply() {
    chips.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.c === state.cat));
    const q = state.q.toLowerCase().replace(/[\s-]/g, "");
    let list = CL_PRODUCTS.filter(p => (state.cat === "All" || p.cat === state.cat) && (!q || p.name.toLowerCase().replace(/[\s-]/g, "").includes(q)));
    const m = state.mode;
    const pin = ["retatrutide", "tirzepatide", "semaglutide", "bpc-157", "bpc157-tb-500", "tb-500", "ghk-cu", "nad", "tesamorelin"];
    const rank = p => { const i = pin.indexOf(p.id); return i < 0 ? 99 : i; };
    if (state.sort === "featured") list = [...list].sort((a, b) => rank(a) - rank(b));
    if (state.sort === "low") list = [...list].sort((a, b) => a.sizes[0][m] - b.sizes[0][m]);
    if (state.sort === "high") list = [...list].sort((a, b) => b.sizes[0][m] - a.sizes[0][m]);
    if (state.sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById("resultCount").textContent = `${list.length} compound${list.length === 1 ? "" : "s"}`;
    renderCards(grid, list, state.mode);
    sync();
  }
  search.addEventListener("input", () => { state.q = search.value; apply(); });
  chips.addEventListener("click", e => { const c = e.target.closest(".chip"); if (!c) return; state.cat = c.dataset.c; apply(); });
  sort.addEventListener("change", () => { state.sort = sort.value; apply(); });
  document.addEventListener("keydown", e => { if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); } });
  apply(); requestAnimationFrame(placeKnob); addEventListener("resize", placeKnob);
  document.fonts && document.fonts.ready.then(placeKnob);
})();
