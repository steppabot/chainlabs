/* ChainLab back office — orders list, status updates. Talks to Supabase REST directly. */
(function () {
  const CFG = window.CL_CONFIG, $ = s => document.querySelector(s);
  const URL_ = (CFG.supabaseUrl || "").replace(/\/$/, ""), KEY = CFG.supabaseAnonKey;
  const money = n => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const when = d => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const ST = {
    awaiting: { label: "Awaiting payment", c: "#8b93a4" }, verifying: { label: "Verifying", c: "#ffc46b" },
    paid: { label: "Paid · to ship", c: "#4cd7ff" }, shipped: { label: "Shipped", c: "#6dffb3" }, cancelled: { label: "Cancelled", c: "#ff7a9c" }
  };
  let toastT; const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); };

  if (!URL_ || !KEY) {
    document.querySelector("main").innerHTML = `<div class="a-empty" style="margin-top:60px">Back office isn't connected yet.<br><br>Add <code>supabaseUrl</code> and <code>supabaseAnonKey</code> in <code>js/config.js</code> (see README).</div>`;
    return;
  }

  /* ---------- auth ---------- */
  const ls = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  let sess = ls.get("cl_admin");
  async function authCall(grant, body) {
    const r = await fetch(`${URL_}/auth/v1/token?grant_type=${grant}`, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || "Sign-in failed");
    sess = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: j.user && j.user.email };
    ls.set("cl_admin", sess); return sess;
  }
  async function token() {
    if (!sess) throw new Error("auth");
    if (Date.now() > sess.exp - 60000) { try { await authCall("refresh_token", { refresh_token: sess.refresh }); } catch { logout(); throw new Error("auth"); } }
    return sess.access;
  }
  async function api(path, opts = {}) {
    const r = await fetch(`${URL_}/rest/v1/${path}`, { ...opts, headers: { apikey: KEY, Authorization: `Bearer ${await token()}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
    if (r.status === 401) { logout(); throw new Error("auth"); }
    if (!r.ok) throw new Error((await r.text()) || r.statusText);
    return r.status === 204 ? null : r.json();
  }
  function logout() { sess = null; ls.set("cl_admin", null); show(); }

  /* ---------- data ---------- */
  let orders = [], filter = "active", q = "", openIds = new Set();
  async function load() {
    try {
      orders = await api("orders?select=*&order=created_at.desc&limit=500");
      $("#lastSync").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      draw();
    } catch (e) { if (e.message !== "auth") toast("Couldn't load orders: " + e.message.slice(0, 80)); }
  }
  async function update(id, patch, msg) {
    try {
      const [row] = await api(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
      const i = orders.findIndex(o => o.id === id); if (row && i > -1) orders[i] = row;
      draw(); if (msg) toast(msg);
    } catch (e) { if (e.message !== "auth") toast("Update failed: " + e.message.slice(0, 80)); }
  }

  /* ---------- render ---------- */
  function draw() {
    const counts = { active: 0 }; Object.keys(ST).forEach(k => counts[k] = 0);
    orders.forEach(o => { counts[o.status]++; if (["awaiting", "verifying", "paid"].includes(o.status)) counts.active++; });
    const tiles = [["active", "Needs action", "#eef1f6"], ["verifying", "Verifying", ST.verifying.c], ["paid", "Paid · to ship", ST.paid.c], ["shipped", "Shipped", ST.shipped.c], ["all", "All orders", "#8a7dff"]];
    $("#kpis").innerHTML = tiles.map(([k, l, c]) => `<div class="kpi ${filter === k ? "on" : ""}" data-f="${k}" style="--c:${c}"><strong>${k === "all" ? orders.length : counts[k]}</strong><span>${l}</span></div>`).join("");
    const ql = q.toLowerCase();
    const list = orders.filter(o =>
      (filter === "all" || (filter === "active" ? ["awaiting", "verifying", "paid"].includes(o.status) : o.status === filter)) &&
      (!ql || [o.id, o.name, o.email, o.zip, o.city, o.txid, o.tracking].some(v => String(v || "").toLowerCase().includes(ql))));
    $("#list").innerHTML = list.length ? list.map(row).join("") : `<div class="a-empty">No orders here${q ? " matching “" + esc(q) + "”" : ""}.</div>`;
  }
  function row(o) {
    const st = ST[o.status] || ST.awaiting;
    const items = Array.isArray(o.items) ? o.items : [];
    const itemsHtml = items.length
      ? items.map(i => `<tr><td>${esc(i.qty)} × <b>${esc(i.name)}</b> ${esc(i.size)} <span class="muted">· ${esc(i.format)}</span></td><td>${money(i.price * i.qty)}</td></tr>`).join("")
      : `<tr><td style="white-space:pre-line">${esc(o.item_text)}</td><td></td></tr>`;
    const label = o.address || [o.name, o.address1 + (o.address2 ? ", " + o.address2 : ""), `${o.city || ""}, ${o.state || ""} ${o.zip || ""}`].join("\n");
    const mail = (subj, body) => `mailto:${encodeURIComponent(o.email || "")}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    const shippedMail = mail(`Your ChainLab order ${o.id} has shipped`, `Hi ${o.name || ""},\n\nGood news, your order ${o.id} has shipped.${o.tracking ? "\n\nTracking number: " + o.tracking : ""}\n\nThanks for ordering with ChainLab Peptides.\n${CFG.supportEmail}`);
    const paidMail = mail(`Payment received for ChainLab order ${o.id}`, `Hi ${o.name || ""},\n\nWe've received your payment of ${money(o.total)} for order ${o.id}. We'll email you tracking as soon as it ships.\n\nChainLab Peptides\n${CFG.supportEmail}`);
    let acts = "";
    if (o.status === "awaiting" || o.status === "verifying") acts = `<button class="a-btn mint" data-act="paid">✓ Mark paid</button><button class="a-btn rose" data-act="cancelled">Cancel order</button>`;
    if (o.status === "paid") acts = `<div class="ship-in" style="width:100%"><input class="input" data-tracking placeholder="Tracking number (optional)" value="${esc(o.tracking)}"><button class="a-btn violet" data-act="shipped">Mark shipped →</button></div><a class="a-btn" href="${paidMail}">✉ Email "payment received"</a><button class="a-btn" data-act="verifying">Undo paid</button>`;
    if (o.status === "shipped") acts = `<a class="a-btn mint" href="${shippedMail}">✉ Email customer tracking</a><button class="a-btn" data-act="paid">Undo shipped</button>`;
    if (o.status === "cancelled") acts = `<button class="a-btn" data-act="awaiting">Reopen order</button>`;
    return `<div class="orow ${openIds.has(o.id) ? "open" : ""}" data-id="${esc(o.id)}">
      <div class="orow-h" data-toggle>
        <div class="oid">${esc(o.id)}<small class="odate">${when(o.created_at)}</small></div>
        <div class="ocust"><b>${esc(o.name)}</b><small>${esc(o.city)}${o.state ? ", " + esc(o.state) : ""} ${esc(o.zip)}</small></div>
        <div class="odate muted" style="font-size:.85rem">${esc(o.email)}</div>
        <div class="ototal">${money(o.total)}</div>
        <div class="ost"><span class="stp s-${esc(o.status)}"><i></i>${st.label}</span></div>
        <div class="chev">›</div>
      </div>
      <div class="obody">
        <div style="display:grid;gap:14px;align-content:start">
          <div class="box"><h6>Products</h6><table class="items">${itemsHtml}
            <tr class="sum"><td>Subtotal</td><td>${money(o.subtotal)}</td></tr><tr class="sum"><td>Shipping</td><td>${Number(o.shipping) ? money(o.shipping) : "Free"}</td></tr>
            <tr class="tot"><td>Total</td><td>${money(o.total)}</td></tr></table></div>
          <div class="box"><h6>Payment</h6><div class="kv">
            <span>Expected</span><div>${money(o.total)}${o.btc ? ` <span class="muted">≈ ${esc(o.btc)} BTC</span>` : ""}</div>
            <span>Customer TXID</span><code>${o.txid ? `<a href="https://mempool.space/tx/${encodeURIComponent(o.txid)}" target="_blank" rel="noopener" style="color:var(--cyan)">${esc(o.txid)}</a>` : "—"}</code>
            <span>Placed</span><div>${when(o.created_at)}</div>
            <span>Last update</span><div>${o.updated_at ? when(o.updated_at) : "—"}</div>
          </div><div class="acts">${acts}</div></div>
        </div>
        <div style="display:grid;gap:14px;align-content:start">
          <div class="box"><h6>Ship to</h6><div class="label">${esc(label)}</div>
            <div class="acts"><button class="a-btn" data-copy="${esc(label)}">Copy label</button></div></div>
          <div class="box"><h6>Customer</h6><div class="kv"><span>Name</span><div>${esc(o.name)}</div><span>Email</span><div><a href="mailto:${esc(o.email)}" style="color:var(--cyan)">${esc(o.email)}</a></div>${o.tracking ? `<span>Tracking</span><code>${esc(o.tracking)}</code>` : ""}</div></div>
          <div class="box"><h6>Private note</h6><textarea class="input note-in" data-note rows="2" placeholder="Only you can see this">${esc(o.note)}</textarea></div>
        </div>
      </div></div>`;
  }

  /* ---------- events ---------- */
  $("#kpis").addEventListener("click", e => { const k = e.target.closest("[data-f]"); if (k) { filter = k.dataset.f; draw(); } });
  $("#q").addEventListener("input", e => { q = e.target.value.trim(); draw(); });
  $("#refresh").onclick = load;
  $("#list").addEventListener("click", e => {
    const rowEl = e.target.closest(".orow"); if (!rowEl) return;
    const id = rowEl.dataset.id, o = orders.find(x => x.id === id);
    if (e.target.closest("[data-toggle]")) { openIds.has(id) ? openIds.delete(id) : openIds.add(id); rowEl.classList.toggle("open"); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) { try { navigator.clipboard.writeText(cp.dataset.copy); } catch {} toast("Shipping label copied"); return; }
    const b = e.target.closest("[data-act]"); if (!b) return;
    const to = b.dataset.act;
    if (to === "cancelled" && !confirm(`Cancel order ${id}?`)) return;
    const patch = { status: to };
    if (to === "shipped") { const t = rowEl.querySelector("[data-tracking]"); patch.tracking = t && t.value.trim() || null; }
    b.disabled = true;
    update(id, patch, { paid: `${id} marked paid`, shipped: `${id} marked shipped`, cancelled: `${id} cancelled`, awaiting: `${id} reopened`, verifying: `${id} moved back to verifying` }[to]);
  });
  $("#list").addEventListener("change", e => {
    if (!e.target.matches("[data-note]")) return;
    const id = e.target.closest(".orow").dataset.id; update(id, { note: e.target.value.trim() || null }, "Note saved");
  });

  /* ---------- views ---------- */
  function show() {
    const ok = !!sess;
    $("#loginView").hidden = ok; $("#appView").hidden = !ok;
    $("#who").innerHTML = ok ? `${esc(sess.email || "")}<button class="a-btn" id="logout">Sign out</button>` : "";
    if (ok) { $("#logout").onclick = logout; load(); }
  }
  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault(); const fd = Object.fromEntries(new FormData(e.target)); $("#loginErr").textContent = "";
    try { await authCall("password", { email: fd.email, password: fd.password }); show(); }
    catch (err) { $("#loginErr").textContent = err.message; }
  });
  $("#walletLink").href = `https://mempool.space/address/${encodeURIComponent(CFG.btcAddress || "")}`;
  setInterval(() => { if (sess && !document.hidden && !document.activeElement.matches("input,textarea")) load(); }, 60000);
  show();
})();
