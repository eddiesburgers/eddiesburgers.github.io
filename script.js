/* =========================================================
   EDDIE'S BURGERS · Funcionamiento de la página
   (Los datos del menú y contacto están en datos.js)
   ========================================================= */
(() => {
  "use strict";

  // Si otra página intenta mostrar esta adentro suyo (para engañar con clics), se oculta
  if (window.top !== window.self) {
    let mismoSitio = false;
    try { mismoSitio = window.top.location.origin === window.location.origin; } catch (err) { /* es otro sitio */ }
    if (!mismoSitio) { document.documentElement.style.display = "none"; return; }
  }

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const fmt = (n) => "$" + Number(n).toLocaleString("es-AR");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TAMANOS = ["Simple", "Doble", "Triple"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICON = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c.6-.3 1.3-.5 2-.5 2.8 0 4 2 4 5"/></svg>',
  };

  /* ---------- Índice de productos ---------- */
  const PRODUCTOS = {};
  MENU.forEach((cat) => cat.items.forEach((it) => { PRODUCTOS[it.id] = Object.assign({ tipo: cat.tipo, categoria: cat.nombre }, it); }));
  const EXTRA = {};
  EXTRAS.forEach((e) => { EXTRA[e.id] = e; });

  /* =========================================================
     Datos de contacto en la página
     ========================================================= */
  const waLink = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

  $$("[data-wa]").forEach((a) => {
    a.href = waLink(CONFIG.mensajeConsulta);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-ig]").forEach((a) => {
    a.href = `https://www.instagram.com/${CONFIG.instagram}/`;
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-maps]").forEach((a) => {
    a.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-direccion]").forEach((el) => { el.textContent = CONFIG.direccion; });
  $$("[data-ciudad]").forEach((el) => { el.textContent = CONFIG.ciudad || ""; });
  $$("[data-wa-visible]").forEach((el) => { el.textContent = CONFIG.whatsappVisible; });
  $$("[data-ig-visible]").forEach((el) => { el.textContent = "@" + CONFIG.instagram; });
  $$("[data-pagos]").forEach((el) => {
    const p = CONFIG.pagos;
    el.textContent = p.length > 1 ? `${p.slice(0, -1).join(", ")} y ${p[p.length - 1]}` : p.join("");
  });

  const horariosLista = $("#horarios-lista");
  if (horariosLista) {
    horariosLista.innerHTML = CONFIG.horariosTexto
      .map(([dia, hora]) => `<div><dt>${esc(dia)}</dt><dd>${esc(hora)}</dd></div>`)
      .join("");
  }

  /* ---------- Cartel "Abierto ahora" ---------- */
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const aMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };

  function estadoLocal(ahora = new Date()) {
    const min = ahora.getHours() * 60 + ahora.getMinutes();
    const hoy = ahora.getDay();
    const ayer = (hoy + 6) % 7;

    for (const r of CONFIG.horarios) {
      const ini = aMin(r.abre);
      let fin = aMin(r.cierra);
      if (fin <= ini) fin += 24 * 60; // cierra después de medianoche
      const abiertoHoy = r.dias.includes(hoy) && min >= ini && min < fin;
      const sigueDeAyer = r.dias.includes(ayer) && min + 24 * 60 < fin;
      if (abiertoHoy || sigueDeAyer) return { abierto: true, texto: `Abierto ahora · hasta las ${r.cierra}` };
    }

    let proximo = null;
    for (let i = 0; i < 8; i++) {
      const dia = (hoy + i) % 7;
      for (const r of CONFIG.horarios) {
        if (!r.dias.includes(dia)) continue;
        const t = i * 24 * 60 + aMin(r.abre);
        if (t <= min) continue;
        if (!proximo || t < proximo.t) proximo = { t, i, dia, abre: r.abre };
      }
    }
    if (!proximo) return { abierto: false, texto: "Cerrado ahora" };
    const cuando = proximo.i === 0 ? "hoy" : proximo.i === 1 ? "mañana" : `el ${DIAS[proximo.dia]}`;
    return { abierto: false, texto: `Cerrado · abrimos ${cuando} a las ${proximo.abre}` };
  }

  const cartel = $("#estado");
  if (cartel && CONFIG.horarios && CONFIG.horarios.length) {
    const { abierto, texto } = estadoLocal();
    $(".status-text", cartel).textContent = texto;
    cartel.classList.toggle("is-closed", !abierto);
    cartel.hidden = false;
  }

  /* =========================================================
     Menú
     ========================================================= */
  function titulo(nombre) {
    const [primera, ...resto] = nombre.split(" ");
    return `<span class="t-red">${esc(primera)}</span>${resto.length ? " " + esc(resto.join(" ")) : ""}`;
  }

  // Fotos de un producto: "fotos" (varias, la primera es la principal) o "foto" (una sola)
  const listaFotos = (it) => (Array.isArray(it.fotos) && it.fotos.length ? it.fotos : it.foto ? [it.foto] : []);

  // Recuadro de fotos: muestra "Foto próximamente" hasta que hay al menos una foto
  function mediaHTML(it, conEtiqueta, clase = "") {
    const fotos = listaFotos(it);
    return `
      <div class="media is-empty${clase ? " " + clase : ""}"${fotos.length ? ` data-fotos="${esc(JSON.stringify(fotos))}"` : ""} data-nombre="${esc(it.nombre)}">
        <span class="media-ph" aria-hidden="true">
          <img src="img/eee-letras.png" alt="">
          <small>Foto próximamente</small>
        </span>
        ${conEtiqueta && it.etiqueta ? `<span class="pill media-pill">${esc(it.etiqueta)}</span>` : ""}
      </div>`;
  }

  function burgerCard(it, n) {
    const destacado = !!it.destacado;
    return `
      <article class="card burger-card${destacado ? " is-featured" : ""} reveal" id="burger-${it.id}" data-id="${it.id}" style="--d:${n % 3}">
        ${mediaHTML(it, true)}
        <div class="card-body">
          ${destacado ? '<img class="featured-mark" src="img/eee-letras.png" alt="">' : ""}
          <h3>${esc(it.nombre)}</h3>
          <p class="card-desc">${esc(it.desc)}</p>
          <fieldset class="sizes">
            <legend class="sr-only">Tamaño de ${esc(it.nombre)}</legend>
            ${it.precios.map((p, i) => `
              <label class="${i === 0 ? "is-checked" : ""}">
                <input type="radio" name="size-${it.id}" value="${i}"${i === 0 ? " checked" : ""}>
                <span class="s-name">${TAMANOS[i]}</span>
                <span class="s-price">${fmt(p)}</span>
              </label>`).join("")}
          </fieldset>
          <p class="cheese"><span data-cheese-size>${TAMANOS[0]}</span>: <b data-cheese>x${it.quesos[0]} ${esc(it.queso)}</b></p>
          <div class="card-actions">
            <button type="button" class="btn ${destacado ? "btn-white" : "btn-red"} btn-add" data-add-burger="${it.id}">${ICON.plus}<span>Agregar</span></button>
            <button type="button" class="btn btn-ghost" data-custom="${it.id}">+ Extras</button>
          </div>
        </div>
      </article>`;
  }

  function extrasCard() {
    return `
      <aside class="card extras-card reveal" style="--d:2">
        <span class="pill">Tu burger, tus reglas</span>
        <h3><span class="t-red">Extras</span></h3>
        <ul class="extras-mini">
          ${EXTRAS.map((e) => `<li><span>${esc(e.nombre)}</span><i></i><b>${fmt(e.precio)}</b></li>`).join("")}
        </ul>
        <p class="card-desc">Sumalos tocando <b>+ Extras</b> en cualquier burger.</p>
      </aside>`;
  }

  function itemCard(it, n) {
    return `
      <article class="item reveal" style="--d:${n % 3}">
        ${it.foto ? mediaHTML(it, false) : ""}
        <div class="item-body">
          <div class="item-top">
            <h3>${esc(it.nombre)}</h3>
            ${it.etiqueta ? `<span class="pill pill-solid">${esc(it.etiqueta)}</span>` : ""}
            ${it.mayores ? '<span class="pill pill-age" title="Solo para mayores de 18 años">+18</span>' : ""}
          </div>
          <p>${it.desc ? esc(it.desc) : ""}</p>
          <div class="item-foot">
            <span class="price">${fmt(it.precio)}</span>
            <button type="button" class="add-btn" data-add-simple="${it.id}" aria-label="Agregar ${esc(it.nombre)} al pedido">${ICON.plus}<span>Agregar</span></button>
          </div>
        </div>
      </article>`;
  }

  function picadaCard(it, n) {
    return `
      <article class="picada reveal" style="--d:${n}">
        ${it.foto ? mediaHTML(it, false) : ""}
        <div class="picada-body">
          <div class="picada-top">
            <span class="picada-people">${ICON.people} Ideal para ${esc(it.personas)}</span>
            ${it.etiqueta ? `<span class="pill pill-solid">${esc(it.etiqueta)}</span>` : ""}
          </div>
          <h3>${esc(it.nombre)}</h3>
          <ul>${it.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="picada-foot">
            <span class="price">${fmt(it.precio)}</span>
            <button type="button" class="btn btn-red" data-add-simple="${it.id}" aria-label="Agregar ${esc(it.nombre)} al pedido">${ICON.plus}<span>Agregar</span></button>
          </div>
        </div>
      </article>`;
  }

  function renderMenu() {
    $("#menu-root").innerHTML = MENU.map((cat) => {
      let cuerpo;
      if (cat.tipo === "burger") {
        cuerpo = `<div class="burger-grid">${cat.items.map(burgerCard).join("")}${extrasCard()}</div>`;
      } else if (cat.tipo === "picada") {
        cuerpo = `<div class="picada-grid">${cat.items.map(picadaCard).join("")}</div>`;
      } else {
        cuerpo = `<div class="item-grid">${cat.items.map(itemCard).join("")}</div>`;
      }
      return `
        <section class="cat" id="${cat.id}" aria-labelledby="t-${cat.id}">
          ${cat.banner ? `
          <div class="cat-banner reveal">
            <img src="${esc(cat.banner)}" alt="" loading="lazy" decoding="async">
            <div class="cat-banner-text">
              <h3 id="t-${cat.id}">${esc(cat.nombre)}</h3>
              ${cat.bajada ? `<p class="cat-bajada">${esc(cat.bajada)}</p>` : ""}
            </div>
          </div>` : `
          <div class="cat-head reveal">
            <h3 id="t-${cat.id}">${titulo(cat.nombre)}</h3>
            ${cat.bajada ? `<p class="cat-bajada">${esc(cat.bajada)}</p>` : ""}
          </div>`}
          ${cuerpo}
        </section>`;
    }).join("");

    $("#cat-tabs").innerHTML = MENU
      .map((cat) => `<a class="cat-tab" href="#${cat.id}" data-tab="${cat.id}">${esc(cat.nombre)}</a>`)
      .join("");

    $("#salon-list").innerHTML = SALON
      .map((s) => `<li><strong>${esc(s.nombre)}</strong><span>${esc(s.desc)}</span></li>`)
      .join("");
  }
  renderMenu();

  /* ---------- Fotos ---------- */
  // Prueba la foto con su nombre y también con otras extensiones (.jpg, .png...)
  const EXTENSIONES = ["jpg", "jpeg", "png", "webp"];
  const fotosProbadas = {};
  function probarFoto(ruta) {
    if (!ruta) return Promise.resolve(null);
    if (!fotosProbadas[ruta]) {
      const m = ruta.match(/^(.*)\.([a-z0-9]+)$/i);
      const base = m ? m[1] : ruta;
      const ext = m ? m[2].toLowerCase() : "";
      const lista = (m ? [ruta] : []).concat(EXTENSIONES.filter((e) => e !== ext).map((e) => `${base}.${e}`));
      fotosProbadas[ruta] = new Promise((resolve) => {
        const intentar = (i) => {
          if (i >= lista.length) return resolve(null);
          const img = new Image();
          img.onload = () => resolve(lista[i]);
          img.onerror = () => intentar(i + 1);
          img.src = lista[i];
        };
        intentar(0);
      });
    }
    return fotosProbadas[ruta];
  }

  const FLECHA = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  // Arma las fotos de un recuadro: una sola foto, o varias para deslizar
  function cargarMedia(media) {
    if (!media.dataset.fotos || media.dataset.cargada) return;
    media.dataset.cargada = "1";
    let lista = [];
    try { lista = JSON.parse(media.dataset.fotos); } catch (err) { return; }
    Promise.all(lista.map(probarFoto)).then((urls) => {
      const ok = urls.filter(Boolean);
      if (!ok.length) return;
      const nombre = media.dataset.nombre || "";
      const varias = ok.length > 1;
      media.insertAdjacentHTML("afterbegin", `
        <div class="media-track">
          ${ok.map((u, i) => `<img class="media-img" src="${esc(u)}" alt="${esc(nombre)}${varias ? ` (foto ${i + 1} de ${ok.length})` : ""}" decoding="async">`).join("")}
        </div>
        ${varias ? `
          <button type="button" class="media-nav media-prev" data-dir="-1" aria-label="Foto anterior">${FLECHA("M15 6l-6 6 6 6")}</button>
          <button type="button" class="media-nav media-next" data-dir="1" aria-label="Foto siguiente">${FLECHA("M9 6l6 6-6 6")}</button>
          <div class="media-dots" aria-hidden="true">${ok.map((_, i) => `<i${i ? "" : ' class="on"'}></i>`).join("")}</div>` : ""}`);
      media.classList.remove("is-empty");
      media.classList.toggle("has-many", varias);
      if (varias) {
        const track = $(".media-track", media);
        const dots = $$(".media-dots i", media);
        track.addEventListener("scroll", () => {
          const i = Math.round(track.scrollLeft / track.clientWidth);
          dots.forEach((d, k) => d.classList.toggle("on", k === i));
        }, { passive: true });
      }
    });
  }

  function cargarFotos(root = document) {
    $$(".media[data-fotos]", root).forEach(cargarMedia);
  }

  // Flechas para pasar las fotos (al final vuelve a la primera)
  document.addEventListener("click", (e) => {
    const nav = e.target.closest(".media-nav");
    if (!nav) return;
    const track = $(".media-track", nav.closest(".media"));
    const max = track.scrollWidth - track.clientWidth;
    let left = track.scrollLeft + Number(nav.dataset.dir) * track.clientWidth;
    if (left > max + 2) left = 0;
    else if (left < -2) left = max;
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  });

  const todasLasBurgers = () => MENU.filter((c) => c.tipo === "burger").flatMap((c) => c.items);

  // Sección "La favorita de la casa"
  function llenarDestacada() {
    const sec = $("#destacada");
    if (!sec) return;
    const it = todasLasBurgers().find((i) => i.destacado);
    if (!it) { sec.hidden = true; return; }
    $$("[data-spot-name]", sec).forEach((el) => { el.textContent = it.nombre; });
    $("[data-spot-desc]", sec).textContent = it.desc;
    $("[data-spot-price]", sec).textContent = fmt(it.precios[0]);
    $("[data-spot-btn]", sec).dataset.custom = it.id;
    const media = $("[data-spot-media]", sec);
    const fotos = listaFotos(it);
    if (fotos.length) media.dataset.fotos = JSON.stringify(fotos);
    media.dataset.nombre = it.nombre;
  }

  // Tira de fotos: aparece cuando hay al menos 3 burgers con foto
  async function armarTira() {
    const tira = $("#tira");
    if (!tira) return;
    const burgers = todasLasBurgers().filter((it) => listaFotos(it).length);
    const urls = await Promise.all(burgers.map((it) => probarFoto(listaFotos(it)[0])));
    const conFoto = burgers.map((it, i) => ({ it, url: urls[i] })).filter((x) => x.url);
    if (conFoto.length < 3) return;
    $("#tira-track").innerHTML = conFoto.map(({ it, url }) => `
      <a class="strip-tile" href="#burger-${it.id}">
        <img src="${esc(url)}" alt="" decoding="async">
        <span>${esc(it.nombre)}</span>
      </a>`).join("");
    tira.hidden = false;
  }

  llenarDestacada();
  cargarFotos();
  armarTira();

  // Botones "Pedila ahora" / "+ Extras" fuera del menú
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-custom]");
    if (!b || b.closest("#menu-root")) return;
    openCustom(b.dataset.custom, 0);
  });

  // Cambio de tamaño en las tarjetas
  $("#menu-root").addEventListener("change", (e) => {
    const input = e.target;
    if (!input.matches('.sizes input[type="radio"]')) return;
    const card = input.closest(".burger-card");
    const p = PRODUCTOS[card.dataset.id];
    const i = Number(input.value);
    $$(".sizes label", card).forEach((l) => l.classList.toggle("is-checked", l.contains(input)));
    $("[data-cheese-size]", card).textContent = TAMANOS[i];
    $("[data-cheese]", card).textContent = `x${p.quesos[i]} ${p.queso}`;
  });

  // Botones "Agregar" y "+ Extras"
  $("#menu-root").addEventListener("click", (e) => {
    const addBurger = e.target.closest("[data-add-burger]");
    const addSimple = e.target.closest("[data-add-simple]");
    const custom = e.target.closest("[data-custom]");

    if (addBurger) {
      const card = addBurger.closest(".burger-card");
      const size = Number($(".sizes input:checked", card).value);
      addLine({ id: addBurger.dataset.addBurger, size, extras: [], nota: "", cant: 1 });
      flashAdded(addBurger);
    } else if (addSimple) {
      addLine({ id: addSimple.dataset.addSimple, size: null, extras: [], nota: "", cant: 1 });
      flashAdded(addSimple);
    } else if (custom) {
      const card = custom.closest(".burger-card");
      const size = Number($(".sizes input:checked", card).value);
      openCustom(custom.dataset.custom, size);
    }
  });

  function flashAdded(btn) {
    const label = $("span", btn);
    if (!label || btn.classList.contains("is-added")) return;
    const original = label.textContent;
    btn.classList.add("is-added");
    label.textContent = "¡Listo!";
    setTimeout(() => {
      btn.classList.remove("is-added");
      label.textContent = original;
    }, 1300);
  }

  /* ---------- Pestañas que siguen el scroll ---------- */
  const tabs = $$(".cat-tab");
  const tabsBox = $("#cat-tabs");
  function setActiveTab(id) {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      if (on) {
        t.setAttribute("aria-current", "true");
        const left = t.offsetLeft - tabsBox.clientWidth / 2 + t.clientWidth / 2;
        tabsBox.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        t.removeAttribute("aria-current");
      }
    });
  }
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) setActiveTab(en.target.id); }),
      { rootMargin: "-35% 0px -60% 0px" }
    );
    $$(".cat").forEach((s) => spy.observe(s));
  }

  /* =========================================================
     Pedido (carrito)
     ========================================================= */
  const KEY_PEDIDO = "eddies-pedido-v1";
  const KEY_CLIENTE = "eddies-cliente-v1";

  const leer = (key, porDefecto) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : porDefecto;
    } catch (err) {
      return porDefecto;
    }
  };
  const guardar = (key, valor) => {
    try { localStorage.setItem(key, JSON.stringify(valor)); } catch (err) { /* sin almacenamiento */ }
  };

  const MAX_CANT = 50;
  const existe = (obj, id) => typeof id === "string" && Object.prototype.hasOwnProperty.call(obj, id);

  // Revisa el pedido guardado en el celular: si algo vino roto o cambiado, se descarta
  function limpiarLinea(l) {
    if (!l || typeof l !== "object" || !existe(PRODUCTOS, l.id)) return null;
    const p = PRODUCTOS[l.id];
    const cant = Math.floor(Number(l.cant));
    if (!(cant >= 1)) return null;
    const size = p.precios ? (Number.isInteger(l.size) && l.size >= 0 && l.size < p.precios.length ? l.size : 0) : null;
    return {
      id: l.id,
      size,
      extras: p.precios && Array.isArray(l.extras) ? l.extras.filter((id) => existe(EXTRA, id)) : [],
      nota: typeof l.nota === "string" ? l.nota.slice(0, 120) : "",
      cant: Math.min(cant, MAX_CANT),
    };
  }

  let pedido = leer(KEY_PEDIDO, []);
  pedido = Array.isArray(pedido) ? pedido.map(limpiarLinea).filter(Boolean) : [];

  const precioUnitario = (l) => {
    const p = PRODUCTOS[l.id];
    const base = l.size !== null && p.precios ? p.precios[l.size] : p.precio;
    return base + l.extras.reduce((s, id) => s + (EXTRA[id] ? EXTRA[id].precio : 0), 0);
  };
  const nombreLinea = (l) => {
    const p = PRODUCTOS[l.id];
    return l.size !== null && p.precios ? `${p.nombre} ${TAMANOS[l.size]}` : p.nombre;
  };
  const claveLinea = (l) => [l.id, l.size, l.extras.slice().sort().join("+"), (l.nota || "").trim().toLowerCase()].join("|");
  const totalPedido = () => pedido.reduce((s, l) => s + precioUnitario(l) * l.cant, 0);
  const cantidadPedido = () => pedido.reduce((s, l) => s + l.cant, 0);

  function addLine(linea) {
    const clave = claveLinea(linea);
    const existente = pedido.find((l) => claveLinea(l) === clave);
    if (existente) existente.cant = Math.min(MAX_CANT, existente.cant + linea.cant);
    else pedido.push(linea);
    guardar(KEY_PEDIDO, pedido);
    renderCart(true);
    toast(`Sumaste ${linea.cant > 1 ? linea.cant + "× " : ""}${nombreLinea(linea)} al pedido`);
  }

  const cartDialog = $("#cart");
  const cartBar = $(".cart-bar");

  function renderCart(bump = false) {
    const cant = cantidadPedido();
    const total = totalPedido();

    $$("[data-cart-count]").forEach((el) => {
      el.textContent = cant;
      el.hidden = cant === 0;
      if (bump) {
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    });
    $$("[data-cart-total]").forEach((el) => { el.textContent = fmt(total); });
    $$("[data-cart-count-text]").forEach((el) => { el.textContent = `${cant} ${cant === 1 ? "producto" : "productos"}`; });
    document.body.classList.toggle("has-items", cant > 0);
    updateCartBar();

    const vacio = cant === 0;
    $("#cart-empty").hidden = !vacio || !$("#cart-sent").hidden;
    $("#cart-filled").hidden = vacio || !$("#cart-sent").hidden;
    $("#cart-foot").hidden = vacio || !$("#cart-sent").hidden;
    $("#cart-age").hidden = !pedido.some((l) => PRODUCTOS[l.id].mayores);

    $("#cart-lines").innerHTML = pedido.map((l, i) => {
      const extras = l.extras.map((id) => (EXTRA[id] ? EXTRA[id].nombre : "")).filter(Boolean);
      return `
        <li class="line">
          <div class="line-info">
            <strong>${esc(nombreLinea(l))}</strong>
            ${extras.length ? `<span>+ ${esc(extras.join(", "))}</span>` : ""}
            ${l.nota ? `<em>“${esc(l.nota)}”</em>` : ""}
            <button type="button" class="line-remove" data-remove="${i}">Quitar</button>
          </div>
          <div class="line-side">
            <span class="line-price">${fmt(precioUnitario(l) * l.cant)}</span>
            <div class="qty qty-sm" role="group" aria-label="Cantidad de ${esc(nombreLinea(l))}">
              <button type="button" data-dec="${i}" aria-label="Restar uno">−</button>
              <output>${l.cant}</output>
              <button type="button" data-inc="${i}" aria-label="Sumar uno">+</button>
            </div>
          </div>
        </li>`;
    }).join("");
  }

  function updateCartBar() {
    const visible = cantidadPedido() > 0 && !cartDialog.open;
    cartBar.classList.toggle("is-visible", visible);
    cartBar.setAttribute("aria-hidden", String(!visible));
    cartBar.tabIndex = visible ? 0 : -1;
  }

  $("#cart-lines").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    if (inc) {
      const l = pedido[Number(inc.dataset.inc)];
      l.cant = Math.min(MAX_CANT, l.cant + 1);
    }
    else if (dec) {
      const l = pedido[Number(dec.dataset.dec)];
      l.cant--;
      if (l.cant <= 0) pedido.splice(Number(dec.dataset.dec), 1);
    } else if (rem) pedido.splice(Number(rem.dataset.remove), 1);
    else return;
    guardar(KEY_PEDIDO, pedido);
    renderCart();
  });

  function openCart() {
    $("#cart-sent").hidden = true;
    renderCart();
    if (!cartDialog.open) cartDialog.showModal();
    updateCartBar();
  }
  $$("[data-open-cart]").forEach((b) => b.addEventListener("click", openCart));
  cartDialog.addEventListener("close", updateCartBar);

  /* ---------- Formulario del pedido ---------- */
  const guardado = leer(KEY_CLIENTE, {});
  const cliente = guardado && typeof guardado === "object" ? guardado : {};
  const form = $("#cart-form");
  const inNombre = $("#cf-nombre");
  const inDir = $("#cf-dir");
  const inNota = $("#cf-nota");
  const errorBox = $("#cf-error");

  $("#cf-entrega").innerHTML = CONFIG.entregas.map((op, i) => `
    <label class="opt">
      <input type="radio" name="entrega" value="${i}">
      <span class="opt-name">${esc(op.nombre)}</span>
    </label>`).join("");
  $("#cf-pago").innerHTML = CONFIG.pagos.map((op, i) => `
    <label class="opt">
      <input type="radio" name="pago" value="${i}">
      <span class="opt-name">${esc(op)}</span>
    </label>`).join("");

  function marcarOpciones(grupo) {
    $$(`input[name="${grupo}"]`, form).forEach((r) => r.closest(".opt").classList.toggle("is-checked", r.checked));
  }
  function seleccionar(grupo, valor) {
    const r = $(`input[name="${grupo}"][value="${valor}"]`, form) || $(`input[name="${grupo}"]`, form);
    if (r) r.checked = true;
    marcarOpciones(grupo);
  }
  function entregaActual() {
    const r = $('input[name="entrega"]:checked', form);
    return CONFIG.entregas[r ? Number(r.value) : 0];
  }
  function toggleDireccion() {
    $("#cf-dir-wrap").hidden = !entregaActual().pideDireccion;
  }

  inNombre.value = typeof cliente.nombre === "string" ? cliente.nombre.slice(0, 60) : "";
  inDir.value = typeof cliente.direccion === "string" ? cliente.direccion.slice(0, 120) : "";
  seleccionar("entrega", Number.isInteger(cliente.entrega) ? cliente.entrega : 0);
  seleccionar("pago", Number.isInteger(cliente.pago) ? cliente.pago : 0);
  toggleDireccion();

  form.addEventListener("change", (e) => {
    if (e.target.name === "entrega") { marcarOpciones("entrega"); toggleDireccion(); }
    if (e.target.name === "pago") marcarOpciones("pago");
  });
  form.addEventListener("input", (e) => {
    if (e.target.classList.contains("is-invalid")) e.target.classList.remove("is-invalid");
  });

  function armarMensaje(datos, codigo) {
    const lineas = pedido.map((l) => {
      let txt = `• ${l.cant}x ${nombreLinea(l)} — ${fmt(precioUnitario(l) * l.cant)}`;
      const extras = l.extras.map((id) => (EXTRA[id] ? EXTRA[id].nombre : "")).filter(Boolean);
      if (extras.length) txt += `\n   + ${extras.join(", ")}`;
      if (l.nota) txt += `\n   Nota: ${l.nota}`;
      return txt;
    });
    const partes = [
      `🧾 *PEDIDO WEB #${codigo}*`,
      "",
      "¡Hola Eddie's! 🍔 Quiero hacer este pedido:",
      "",
      ...lineas,
      "",
      `*Total: ${fmt(totalPedido())}*`,
      "",
      `Nombre: ${datos.nombre}`,
      `Entrega: ${datos.entrega}`,
    ];
    if (datos.direccion) partes.push(`Dirección: ${datos.direccion}`);
    partes.push(`Pago: ${datos.pago}`);
    if (datos.nota) partes.push(`Aclaraciones: ${datos.nota}`);
    return partes.join("\n");
  }

  // Número de pedido (4 cifras) para que el dueño lo reconozca en WhatsApp.
  // Si el cliente toca "enviar" dos veces seguidas con el mismo pedido, mantiene el número.
  let ultimaFirma = "";
  let ultimaVez = 0;
  let ultimoCodigo = "";
  let ultimoId = "";
  function numerarPedido() {
    const items = pedido.map((l) => {
      const p = PRODUCTOS[l.id];
      return {
        nombre: p.nombre,
        categoria: p.categoria,
        tamano: l.size !== null && p.precios ? TAMANOS[l.size] : "",
        extras: l.extras.map((id) => (EXTRA[id] ? EXTRA[id].nombre : "")).filter(Boolean),
        cantidad: l.cant,
        subtotal: precioUnitario(l) * l.cant,
      };
    });
    const firma = JSON.stringify(items);
    const repetido = firma === ultimaFirma && Date.now() - ultimaVez < 10 * 60 * 1000;
    if (!repetido) {
      ultimaFirma = firma;
      ultimaVez = Date.now();
      ultimoCodigo = String(1000 + Math.floor(Math.random() * 9000));
      ultimoId = `${ultimoCodigo}-${Date.now().toString(36)}`;
    }
    return { items, codigo: ultimoCodigo, id: ultimoId, repetido };
  }

  // Guarda una copia del pedido para el panel del dueño.
  // Solo productos, total, entrega y pago: nunca nombre, dirección ni teléfono.
  function registrarPedido(datos, info) {
    const url = (CONFIG.registroPedidos || "").trim();
    if (!url || info.repetido) return;
    const items = info.items;
    const payload = {
      origen: "eddies-web",
      pedido: info.id,
      entrega: datos.entrega,
      pago: datos.pago,
      total: totalPedido(),
      items,
    };
    try {
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (err) { /* sin conexión: el pedido igual sale por WhatsApp */ }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pedido.length) return;
    const entrega = entregaActual();
    const pagoIdx = Number(($('input[name="pago"]:checked', form) || { value: 0 }).value);
    const datos = {
      nombre: inNombre.value.trim(),
      entrega: entrega.nombre,
      direccion: entrega.pideDireccion ? inDir.value.trim() : "",
      pago: CONFIG.pagos[pagoIdx],
      nota: inNota.value.trim(),
    };

    const faltan = [];
    if (!datos.nombre) { faltan.push("tu nombre"); inNombre.classList.add("is-invalid"); }
    if (entrega.pideDireccion && !datos.direccion) { faltan.push("la dirección de entrega"); inDir.classList.add("is-invalid"); }
    if (faltan.length) {
      errorBox.textContent = `Completá ${faltan.join(" y ")} para enviar el pedido.`;
      errorBox.hidden = false;
      (datos.nombre ? inDir : inNombre).focus();
      return;
    }
    errorBox.hidden = true;

    guardar(KEY_CLIENTE, {
      nombre: datos.nombre,
      direccion: inDir.value.trim(),
      entrega: Number($('input[name="entrega"]:checked', form).value),
      pago: pagoIdx,
    });

    const info = numerarPedido();
    registrarPedido(datos, info);
    const url = waLink(armarMensaje(datos, info.codigo));
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;

    $("#cart-code").textContent = `#${info.codigo}`;
    $("#cart-sent").hidden = false;
    renderCart();
    $(".sheet-body", cartDialog).scrollTop = 0;
  });

  $("#cart-back").addEventListener("click", () => {
    $("#cart-sent").hidden = true;
    renderCart();
  });
  $("#cart-clear").addEventListener("click", () => {
    pedido = [];
    guardar(KEY_PEDIDO, pedido);
    inNota.value = "";
    $("#cart-sent").hidden = true;
    renderCart();
    cartDialog.close();
  });

  /* =========================================================
     Ventana para armar una burger
     ========================================================= */
  const burgerDialog = $("#burger-dialog");
  const burgerForm = $("#burger-form");
  let armado = null;

  function openCustom(id, size = 0) {
    const p = PRODUCTOS[id];
    armado = { id, size, extras: new Set(), cant: 1 };
    $("#bd-title").textContent = p.nombre;
    $("#bd-desc").textContent = p.desc;
    const bdMedia = $("#bd-media");
    bdMedia.innerHTML = listaFotos(p).length ? mediaHTML(p, false, "media-dialog") : "";
    cargarFotos(bdMedia);
    $("#bd-sizes").innerHTML = p.precios.map((precio, i) => `
      <label class="opt${i === size ? " is-checked" : ""}">
        <input type="radio" name="bd-size" value="${i}"${i === size ? " checked" : ""}>
        <span class="opt-name">${TAMANOS[i]}</span>
        <span class="opt-meta">x${p.quesos[i]} ${esc(p.queso)}</span>
        <span class="opt-price">${fmt(precio)}</span>
      </label>`).join("");
    $("#bd-extras").innerHTML = EXTRAS.map((ex) => `
      <label class="opt opt-extra">
        <input type="checkbox" value="${ex.id}">
        <span class="opt-check" aria-hidden="true">${ICON.check}</span>
        <span class="opt-name">${esc(ex.nombre)}</span>
        <span class="opt-price">+${fmt(ex.precio)}</span>
      </label>`).join("");
    $("#bd-nota").value = "";
    actualizarArmado();
    burgerDialog.showModal();
    $(".sheet-body", burgerDialog).scrollTop = 0;
  }

  function actualizarArmado() {
    const p = PRODUCTOS[armado.id];
    let unit = p.precios[armado.size];
    armado.extras.forEach((id) => { unit += EXTRA[id].precio; });
    $("#bd-qty").textContent = armado.cant;
    $("#bd-total").textContent = fmt(unit * armado.cant);
  }

  burgerForm.addEventListener("change", (e) => {
    const t = e.target;
    if (t.name === "bd-size") {
      armado.size = Number(t.value);
      $$('input[name="bd-size"]', burgerForm).forEach((r) => r.closest(".opt").classList.toggle("is-checked", r.checked));
    } else if (t.type === "checkbox") {
      if (t.checked) armado.extras.add(t.value);
      else armado.extras.delete(t.value);
      t.closest(".opt").classList.toggle("is-checked", t.checked);
    }
    actualizarArmado();
  });

  $$("[data-bd-qty]", burgerForm).forEach((b) => b.addEventListener("click", () => {
    armado.cant = Math.max(1, Math.min(20, armado.cant + Number(b.dataset.bdQty)));
    actualizarArmado();
  }));

  burgerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addLine({
      id: armado.id,
      size: armado.size,
      extras: Array.from(armado.extras),
      nota: $("#bd-nota").value.trim(),
      cant: armado.cant,
    });
    burgerDialog.close();
  });

  /* ---------- Cerrar ventanas ---------- */
  $$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  });
  $$("[data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));

  $$("[data-open-carta]").forEach((b) => b.addEventListener("click", () => $("#carta").showModal()));

  /* =========================================================
     Varios
     ========================================================= */

  // Aviso flotante
  const toastEl = $("#toast");
  let toastTimer;
  function toast(texto) {
    toastEl.innerHTML = `<span class="toast-check">${ICON.check}</span><span>${esc(texto)}</span>`;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
  }

  // Copiar hashtag
  $$("[data-copy]").forEach((btn) => btn.addEventListener("click", async () => {
    const texto = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(texto);
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err2) { /* nada */ }
      ta.remove();
    }
    toast(`Copiado: ${texto}`);
  }));

  // Galería
  const galeria = $("#galeria");
  if (galeria && CONFIG.fotos && CONFIG.fotos.length) {
    galeria.innerHTML = CONFIG.fotos
      .map((src) => `<img src="${esc(src)}" alt="Foto de Eddie's Burgers" loading="lazy">`)
      .join("");
    galeria.hidden = false;
  }

  // Menú en celulares
  const toggle = $(".nav-toggle");
  const navLinks = $("#nav-links");
  function setMenu(abierto) {
    toggle.setAttribute("aria-expanded", String(abierto));
    $(".sr-only", toggle).textContent = abierto ? "Cerrar menú" : "Abrir menú";
    document.body.classList.toggle("nav-open", abierto);
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Borde del encabezado al hacer scroll
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Aparición suave
  const revelables = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revelables.forEach((el) => io.observe(el));
  } else {
    revelables.forEach((el) => el.classList.add("is-visible"));
  }

  // Año
  $("#year").textContent = new Date().getFullYear();

  renderCart();
})();
