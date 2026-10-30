/* =========================================================
   EDDIE'S BURGERS · Panel del dueño
   Lee los pedidos guardados en la planilla de Google
   (ver panel-dueno/INSTRUCCIONES.md) y arma el ranking.
   ========================================================= */
(() => {
  "use strict";

  // Si otra página intenta mostrar el panel adentro suyo, se oculta
  if (window.top !== window.self) {
    let mismoSitio = false;
    try { mismoSitio = window.top.location.origin === window.location.origin; } catch (err) { /* es otro sitio */ }
    if (!mismoSitio) { document.documentElement.style.display = "none"; return; }
  }

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const fmtN = (n) => Math.round(n).toLocaleString("es-AR");
  const fmt$ = (n) => "$" + fmtN(n);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  const URL_REGISTRO = (CONFIG.registroPedidos || "").trim();
  const DEMO = !URL_REGISTRO;
  const KEY_CLAVE = "eddies-panel-clave";
  const TAMANOS = ["Simple", "Doble", "Triple"];
  const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const DIAS_LARGOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const catBurgers = MENU.find((c) => c.tipo === "burger");
  const BURGERS = catBurgers ? catBurgers.items : [];
  const NOMBRE_CAT_BURGERS = catBurgers ? catBurgers.nombre : "";
  const fotoPrincipal = (it) => (Array.isArray(it.fotos) && it.fotos.length ? it.fotos[0] : it.foto || "");

  const leerClave = () => { try { return localStorage.getItem(KEY_CLAVE) || ""; } catch (e) { return ""; } };
  const guardarClave = (v) => { try { localStorage.setItem(KEY_CLAVE, v); } catch (e) { /* nada */ } };
  const borrarClave = () => { try { localStorage.removeItem(KEY_CLAVE); } catch (e) { /* nada */ } };
  let claveSesion = leerClave();

  let dias = 7;

  /* ---------- Tooltip ---------- */
  const tip = $("#tip");
  function ubicarTip(x, y) {
    const r = tip.getBoundingClientRect();
    let left = x + 14;
    let top = y - r.height - 12;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top < 8) top = y + 18;
    tip.style.left = `${Math.max(8, left)}px`;
    tip.style.top = `${top}px`;
  }
  function conTip(el, valor, detalle) {
    const mostrar = () => {
      const s = document.createElement("strong");
      s.textContent = valor;
      const d = document.createElement("span");
      d.textContent = detalle;
      tip.replaceChildren(s, d);
      tip.hidden = false;
    };
    el.addEventListener("pointerenter", mostrar);
    el.addEventListener("pointermove", (e) => ubicarTip(e.clientX, e.clientY));
    el.addEventListener("pointerleave", () => { tip.hidden = true; });
    el.addEventListener("focus", () => {
      mostrar();
      const r = el.getBoundingClientRect();
      ubicarTip(r.left + r.width / 2, r.top);
    });
    el.addEventListener("blur", () => { tip.hidden = true; });
  }

  /* ---------- Tabla (para leer todo sin pasar el mouse) ---------- */
  function tabla(columnas, filas) {
    const det = document.createElement("details");
    det.className = "as-table";
    const sum = document.createElement("summary");
    sum.textContent = "Ver como tabla";
    const t = document.createElement("table");
    const thead = t.createTHead().insertRow();
    columnas.forEach((c, i) => {
      const th = document.createElement("th");
      th.textContent = c;
      if (i > 0) th.className = "num";
      thead.appendChild(th);
    });
    const tbody = t.createTBody();
    filas.forEach((f) => {
      const tr = tbody.insertRow();
      f.forEach((v, i) => {
        const td = tr.insertCell();
        td.textContent = v;
        if (i > 0) td.className = "num";
      });
    });
    det.append(sum, t);
    return det;
  }

  /* ---------- Barras horizontales ---------- */
  // filas: [{ label, value, detalle, cols: [..valores para la tabla..] }]
  function barras(cont, filas, { columnas, vacio = "Sin pedidos en este período." } = {}) {
    cont.replaceChildren();
    const max = Math.max(0, ...filas.map((f) => f.value));
    if (!filas.length || max === 0) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = vacio;
      cont.appendChild(p);
      return;
    }
    const ol = document.createElement("ol");
    ol.className = "hbars";
    filas.forEach((f) => {
      const li = document.createElement("li");
      li.className = "bar-row";
      li.tabIndex = 0;
      li.setAttribute("aria-label", `${f.label}: ${fmtN(f.value)}. ${f.detalle || ""}`);
      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = f.label;
      const area = document.createElement("span");
      area.className = "bar-area";
      const fill = document.createElement("span");
      fill.className = "bar-fill";
      fill.style.width = `${(f.value / max) * 82}%`;
      const val = document.createElement("span");
      val.className = "bar-value";
      val.textContent = fmtN(f.value);
      area.append(fill, val);
      li.append(label, area);
      conTip(li, `${fmtN(f.value)} · ${f.label}`, f.detalle || "");
      ol.appendChild(li);
    });
    cont.appendChild(ol);
    if (columnas) cont.appendChild(tabla(columnas, filas.map((f) => f.cols)));
  }

  /* ---------- Columnas: pedidos por día ---------- */
  function columnasDias(cont, valores) {
    cont.replaceChildren();
    const max = Math.max(0, ...valores);
    const total = valores.reduce((a, b) => a + b, 0);
    if (!max) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = "Sin pedidos en este período.";
      cont.appendChild(p);
      return;
    }
    const plot = document.createElement("div");
    plot.className = "cols";
    const labels = document.createElement("div");
    labels.className = "col-labels";
    labels.setAttribute("aria-hidden", "true");
    valores.forEach((v, i) => {
      const col = document.createElement("div");
      col.className = "col";
      col.tabIndex = 0;
      col.setAttribute("aria-label", `${DIAS_LARGOS[i]}: ${fmtN(v)} pedidos`);
      const val = document.createElement("span");
      val.className = "col-value";
      val.textContent = fmtN(v);
      const fill = document.createElement("span");
      fill.className = "col-fill";
      fill.style.height = `calc((100% - 30px) * ${v / max})`;
      col.append(val, fill);
      conTip(col, `${fmtN(v)} pedidos`, `${DIAS_LARGOS[i]} · ${pct(v, total)}% del total`);
      plot.appendChild(col);
      const l = document.createElement("span");
      l.textContent = DIAS_SEMANA[i];
      labels.appendChild(l);
    });
    cont.append(plot, labels, tabla(["Día", "Pedidos"], valores.map((v, i) => [DIAS_LARGOS[i], fmtN(v)])));
  }

  /* ---------- Resumen de los datos ---------- */
  function resumir(filas) {
    const pedidos = new Map();
    const productos = new Map();
    const burgers = new Map(BURGERS.map((b) => [b.nombre, { q: 0, s: 0 }]));
    const tamanos = new Map(TAMANOS.map((t) => [t, 0]));
    const extras = new Map();
    let unidadesBurgers = 0;

    filas.forEach((r) => {
      const q = Number(r.q) || 0;
      const s = Number(r.s) || 0;
      const nombre = String(r.n || "");
      if (!pedidos.has(r.p)) pedidos.set(r.p, { tot: Number(r.tot) || 0, en: r.en || "—", pa: r.pa || "—", f: r.f });

      const prod = productos.get(nombre) || { q: 0, s: 0 };
      prod.q += q;
      prod.s += s;
      productos.set(nombre, prod);

      if (r.c === NOMBRE_CAT_BURGERS || burgers.has(nombre)) {
        const b = burgers.get(nombre) || { q: 0, s: 0 };
        b.q += q;
        b.s += s;
        burgers.set(nombre, b);
        unidadesBurgers += q;
        if (r.t) tamanos.set(r.t, (tamanos.get(r.t) || 0) + q);
      }
      String(r.x || "").split(",").map((x) => x.trim()).filter(Boolean)
        .forEach((x) => extras.set(x, (extras.get(x) || 0) + q));
    });

    const porDia = Array(7).fill(0);
    const entregas = new Map();
    const pagos = new Map();
    let facturacion = 0;
    pedidos.forEach((p) => {
      facturacion += p.tot;
      const d = new Date(p.f);
      if (!isNaN(d)) {
        if (d.getHours() < 6) d.setDate(d.getDate() - 1); // la noche sigue después de las 00
        porDia[(d.getDay() + 6) % 7]++;
      }
      entregas.set(p.en, (entregas.get(p.en) || 0) + 1);
      pagos.set(p.pa, (pagos.get(p.pa) || 0) + 1);
    });

    return { pedidos: pedidos.size, facturacion, unidadesBurgers, productos, burgers, tamanos, extras, porDia, entregas, pagos };
  }

  const ordenar = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]);

  /* ---------- Dibujar todo ---------- */
  function dibujar(r) {
    $("#k-pedidos").textContent = fmtN(r.pedidos);
    $("#k-fact").textContent = fmt$(r.facturacion);
    $("#k-ticket").textContent = r.pedidos ? fmt$(r.facturacion / r.pedidos) : "—";
    $("#k-burgers").textContent = fmtN(r.unidadesBurgers);

    // La más pedida
    const ranking = [...r.burgers.entries()].sort((a, b) => b[1].q - a[1].q);
    const top = $("#top-card");
    top.replaceChildren();
    const foto = document.createElement("div");
    foto.className = "top-photo";
    const img = document.createElement("img");
    img.alt = "";
    const body = document.createElement("div");
    body.className = "top-body";
    const kicker = document.createElement("p");
    kicker.className = "top-kicker";
    const nombre = document.createElement("p");
    nombre.className = "top-name";
    const stat = document.createElement("p");
    stat.className = "top-stat";
    if (ranking.length && ranking[0][1].q > 0) {
      const [n, v] = ranking[0];
      const item = BURGERS.find((b) => b.nombre === n);
      const src = item ? fotoPrincipal(item) : "";
      if (src) img.src = src; else { foto.classList.add("is-mascot"); img.src = "img/mascota.png"; }
      kicker.textContent = "La más pedida";
      nombre.textContent = n;
      const b1 = document.createElement("b");
      b1.textContent = `${fmtN(v.q)} unidades`;
      const b2 = document.createElement("b");
      b2.textContent = `${pct(v.q, r.unidadesBurgers)}%`;
      stat.append(b1, " · el ", b2, " de las burgers vendidas");
    } else {
      foto.classList.add("is-mascot");
      img.src = "img/mascota.png";
      kicker.textContent = "La más pedida";
      nombre.textContent = "Todavía nada";
      stat.textContent = "No hay pedidos en este período.";
    }
    foto.appendChild(img);
    body.append(kicker, nombre, stat);
    top.append(foto, body);

    // Ranking de hamburguesas
    barras($("#ch-ranking"), ranking.map(([n, v], i) => ({
      label: `${i + 1}. ${n}`,
      value: v.q,
      detalle: `${pct(v.q, r.unidadesBurgers)}% de las burgers · ${fmt$(v.s)}`,
      cols: [n, fmtN(v.q), `${pct(v.q, r.unidadesBurgers)}%`, fmt$(v.s)],
    })), { columnas: ["Burger", "Unidades", "% del total", "Facturación"] });

    // Tamaños (en su orden natural)
    const totT = [...r.tamanos.values()].reduce((a, b) => a + b, 0);
    barras($("#ch-tamanos"), [...r.tamanos.entries()].map(([t, q]) => ({
      label: t, value: q, detalle: `${pct(q, totT)}% de las burgers`, cols: [t, fmtN(q), `${pct(q, totT)}%`],
    })), { columnas: ["Tamaño", "Unidades", "%"] });

    // Extras
    barras($("#ch-extras"), ordenar(r.extras).map(([x, q]) => ({
      label: x, value: q, detalle: "veces agregado", cols: [x, fmtN(q)],
    })), { columnas: ["Extra", "Veces"], vacio: "Todavía nadie agregó extras en este período." });

    // Por día de la semana
    columnasDias($("#ch-dias"), r.porDia);

    // Top 10 de todo el menú
    const top10 = [...r.productos.entries()].sort((a, b) => b[1].q - a[1].q).slice(0, 10);
    barras($("#ch-top"), top10.map(([n, v]) => ({
      label: n, value: v.q, detalle: fmt$(v.s), cols: [n, fmtN(v.q), fmt$(v.s)],
    })), { columnas: ["Producto", "Unidades", "Facturación"] });

    // Entrega y pago
    barras($("#ch-entrega"), ordenar(r.entregas).map(([n, q]) => ({
      label: n, value: q, detalle: `${pct(q, r.pedidos)}% de los pedidos`, cols: [n, fmtN(q), `${pct(q, r.pedidos)}%`],
    })), { columnas: ["Entrega", "Pedidos", "%"] });
    barras($("#ch-pago"), ordenar(r.pagos).map(([n, q]) => ({
      label: n, value: q, detalle: `${pct(q, r.pedidos)}% de los pedidos`, cols: [n, fmtN(q), `${pct(q, r.pedidos)}%`],
    })), { columnas: ["Forma de pago", "Pedidos", "%"] });
  }

  /* ---------- Datos ---------- */
  async function traer() {
    if (DEMO) return datosEjemplo(dias);
    const res = await fetch(`${URL_REGISTRO}?clave=${encodeURIComponent(claveSesion)}&dias=${dias}`);
    const json = await res.json();
    if (!json.ok) {
      const err = new Error(json.error || "error");
      err.code = json.error;
      throw err;
    }
    return json.filas || [];
  }

  // Datos inventados para ver cómo queda el panel antes de activarlo
  function datosEjemplo(d) {
    let semilla = 20261027;
    const rnd = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
    const elegir = (arr, pesos) => {
      let t = rnd() * pesos.reduce((a, b) => a + b, 0);
      for (let i = 0; i < arr.length; i++) { t -= pesos[i]; if (t <= 0) return arr[i]; }
      return arr[arr.length - 1];
    };
    const otros = MENU.filter((c) => c.tipo !== "burger").flatMap((c) => c.items.map((it) => ({ it, cat: c.nombre })));
    const pesosB = BURGERS.map((_, i) => [9, 6, 4, 5, 3, 5, 4][i] || 3);
    const pesosX = EXTRAS.map((_, i) => [3, 5, 4, 1, 2, 4, 2][i] || 1);
    const filas = [];
    const hoy = new Date();
    const total = d || 120;
    for (let k = 0; k < total; k++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() - k);
      if (dia.getDay() === 2) continue; // martes cerrado
      const finde = dia.getDay() === 5 || dia.getDay() === 6;
      const n = 5 + Math.floor(rnd() * 12) + (finde ? 9 : 0);
      for (let p = 0; p < n; p++) {
        const fecha = new Date(dia);
        fecha.setHours(21 + Math.floor(rnd() * 3), Math.floor(rnd() * 60), 0, 0);
        const items = [];
        const nb = 1 + Math.floor(rnd() * 3);
        for (let b = 0; b < nb; b++) {
          const it = elegir(BURGERS, pesosB);
          const t = elegir([0, 1, 2], [5, 4, 2]);
          const ex = rnd() < 0.35 ? [elegir(EXTRAS, pesosX)] : [];
          const s = it.precios[t] + ex.reduce((a, e) => a + e.precio, 0);
          items.push({ n: it.nombre, c: NOMBRE_CAT_BURGERS, t: TAMANOS[t], x: ex.map((e) => e.nombre).join(", "), q: 1, s });
        }
        if (rnd() < 0.5 && otros.length) {
          const o = elegir(otros, otros.map(() => 1));
          items.push({ n: o.it.nombre, c: o.cat, t: "", x: "", q: 1, s: o.it.precio });
        }
        const tot = items.reduce((a, b) => a + b.s, 0);
        const en = rnd() < 0.6 ? "Delivery" : "Retiro en el local";
        const pa = elegir(CONFIG.pagos, CONFIG.pagos.map((_, i) => [4, 3, 3, 2][i] || 1));
        items.forEach((it) => filas.push({ f: fecha.toISOString(), p: `ej-${k}-${p}`, n: it.n, c: it.c, t: it.t, x: it.x, q: it.q, s: it.s, tot, en, pa }));
      }
    }
    return filas;
  }

  /* ---------- Carga ---------- */
  async function cargar() {
    const dash = $("#dash");
    dash.classList.add("is-loading");
    $("#error").hidden = true;
    try {
      const filas = await traer();
      dibujar(resumir(filas));
      const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      $("#dash-sub").textContent = `Pedidos armados en la página web · actualizado a las ${hora}`;
    } catch (err) {
      const avisos = {
        clave: "La clave no es correcta. Probá de nuevo.",
        bloqueado: "Hubo muchos intentos con una clave incorrecta. Por seguridad, el panel queda bloqueado unos 15 minutos.",
        "clave-debil": "Falta cambiar la clave en el código de Google (Paso 2 de las instrucciones). Tiene que tener al menos 10 letras o números.",
      };
      if (avisos[err.code]) {
        borrarClave();
        claveSesion = "";
        mostrarLogin(avisos[err.code]);
        return;
      }
      $("#error").textContent = "No se pudieron traer los pedidos. Revisá la conexión a internet y tocá Actualizar.";
      $("#error").hidden = false;
    } finally {
      dash.classList.remove("is-loading");
    }
  }

  function mostrarDash() {
    $("#login").hidden = true;
    $("#dash").hidden = false;
    $("#salir").hidden = DEMO;
    cargar();
  }

  function mostrarLogin(error) {
    $("#dash").hidden = true;
    $("#login").hidden = false;
    $("#salir").hidden = true;
    const e = $("#login-error");
    e.textContent = error || "";
    e.hidden = !error;
    $("#clave").value = "";
    $("#clave").focus();
  }

  /* ---------- Eventos ---------- */
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#clave").value.trim();
    if (!v) return;
    claveSesion = v;
    guardarClave(v);
    mostrarDash();
  });

  $("#salir").addEventListener("click", () => {
    borrarClave();
    claveSesion = "";
    mostrarLogin();
  });

  $$(".chip[data-dias]").forEach((b) => b.addEventListener("click", () => {
    dias = Number(b.dataset.dias);
    $$(".chip[data-dias]").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    cargar();
  }));

  $("#actualizar").addEventListener("click", cargar);

  /* ---------- Inicio ---------- */
  if (DEMO) {
    $("#demo").hidden = false;
    mostrarDash();
  } else if (claveSesion) {
    mostrarDash();
  } else {
    mostrarLogin();
  }
})();
