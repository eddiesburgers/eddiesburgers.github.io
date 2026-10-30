/* =========================================================
   EDDIE'S BURGERS · DATOS DE LA PÁGINA
   ---------------------------------------------------------
   Acá cambiás precios, productos, horarios y contacto.
   No hace falta tocar nada más: la página se arma sola
   con estos datos.
   - Los precios van sin puntos: 14500 (se muestra $14.500)
   - Días: 0 = domingo, 1 = lunes, 2 = martes ... 6 = sábado
   ========================================================= */

const CONFIG = {
  // WhatsApp con código de país (54) + 9 + número, sin espacios ni "+"
  whatsapp: "5493865797800",
  whatsappVisible: "3865 79 7800",
  mensajeConsulta: "¡Hola Eddie's! Tengo una consulta 🍔",

  instagram: "eddies.burgerr",

  direccion: "Roca 483",
  ciudad: "Concepción, Tucumán",
  // Lo que se busca en Google Maps al tocar "Cómo llegar"
  mapsQuery: "Roca 483, Concepción, Tucumán, Argentina",

  // Horarios para el cartel "Abierto ahora / Cerrado"
  horarios: [
    { dias: [1, 3, 4, 5, 6, 0], abre: "21:00", cierra: "01:30" }, // todos los días menos martes
  ],
  // Horarios tal cual se muestran en la sección "Vení a vernos"
  horariosTexto: [
    ["Lunes", "21:00 a 01:30"],
    ["Martes", "Cerrado"],
    ["Miércoles a domingo", "21:00 a 01:30"],
  ],

  // Opciones del formulario del pedido
  entregas: [
    { nombre: "Delivery", pideDireccion: true },
    { nombre: "Retiro en el local", pideDireccion: false },
  ],
  pagos: ["Efectivo", "QR", "Mercado Pago", "Tarjeta de débito o crédito"],

  // Panel del dueño (ranking de pedidos).
  // Pegá acá el link de Google que se obtiene siguiendo los pasos de
  // panel-dueno/INSTRUCCIONES.md. Mientras esté vacío, los pedidos no se
  // guardan y el panel muestra datos de ejemplo.
  registroPedidos: "",

  // Fotos para la galería de la sección "Smashers".
  // Guardalas en la carpeta img/fotos y escribí acá sus nombres.
  // Ejemplo: fotos: ["img/fotos/eddie.jpg", "img/fotos/papas.jpg"],
  // Si la lista está vacía, la galería no se muestra.
  fotos: [],
};

/* ---------- Extras para las burgers ---------- */
const EXTRAS = [
  { id: "carne", nombre: "Carne con queso", precio: 2500 },
  { id: "panceta", nombre: "Panceta", precio: 1500 },
  { id: "cheddar", nombre: "Queso cheddar", precio: 900 },
  { id: "tybo", nombre: "Queso tybo", precio: 900 },
  { id: "pepinillos", nombre: "Pepinillos", precio: 700 },
  { id: "crispy", nombre: "Cebolla crispy", precio: 1500 },
  { id: "chapa", nombre: "Cebolla a la chapa", precio: 700 },
];

/* ---------- Menú ----------
   tipo "burger": tiene 3 precios (simple, doble, triple)
   tipo "picada": combos para compartir
   tipo "simple": un solo precio
   etiqueta: cartelito opcional ("Nuevo", "La favorita"...)
   mayores: true → muestra "+18"
   foto: dónde está la foto del producto (opcional).
         Las burgers ya tienen su lugar: img/burgers/eddie.jpg, etc.
         Si la foto todavía no está, se muestra "Foto próximamente".
         Sirve .jpg, .jpeg, .png o .webp con el mismo nombre.
         A los demás productos también se les puede agregar, ej:
         foto: "img/productos/papas-cheddar.jpg"
   fotos: para poner VARIAS fotos (se pasan deslizando).
         La primera es la principal. Ej:
         fotos: ["img/burgers/eddie-1.jpg", "img/burgers/eddie-2.jpg"]
*/
const MENU = [
  {
    id: "burgers",
    nombre: "Smash Burgers",
    bajada: "Todas salen con papas",
    tipo: "burger",
    items: [
      {
        id: "eddie",
        nombre: "Eddie",
        etiqueta: "La favorita de la casa",
        destacado: true,
        fotos: ["img/burgers/eddie-1.jpg", "img/burgers/eddie-2.jpg"],
        desc: "Pan de zapallo suave, carne smasheada de 90 g, cheddar, lechuga crocante, aros de cebolla morada, pepinillos y nuestra irresistible salsa Eddie's.",
        queso: "cheddar",
        quesos: [3, 4, 5],
        precios: [14500, 16000, 17500],
      },
      {
        id: "cheeseburger",
        nombre: "Cheeseburger",
        fotos: ["img/burgers/cheeseburger-1.jpg", "img/burgers/cheeseburger-2.jpg", "img/burgers/cheeseburger-3.jpg"],
        desc: "Simple, clásica y perfecta. Carne smasheada de 90 g, cheddar y un mar de salsa Eddie's.",
        queso: "cheddar",
        quesos: [3, 4, 5],
        precios: [14500, 16000, 17500],
      },
      {
        id: "champions",
        nombre: "Champions",
        etiqueta: "Gourmet",
        fotos: ["img/burgers/champions-1.jpg", "img/burgers/champions-2.jpg", "img/burgers/champions-3.jpg"],
        desc: "Nuestra joyita gourmet. Carne smasheada de 90 g, queso tybo, cebolla morada y portobellos sudados en manteca y roquefort.",
        queso: "tybo",
        quesos: [2, 3, 4],
        precios: [15000, 16500, 18000],
      },
      {
        id: "oklahoma",
        nombre: "Oklahoma",
        fotos: ["img/burgers/oklahoma-1.jpg", "img/burgers/oklahoma-2.jpg"],
        desc: "El estilo americano en su mejor versión: carne smasheada de 90 g, cheddar, cebolla a la chapa y salsa Eddie's.",
        queso: "cheddar",
        quesos: [2, 3, 4],
        precios: [14500, 16000, 17500],
      },
      {
        id: "oklahoma-spicy",
        nombre: "Oklahoma Spicy",
        etiqueta: "Picante",
        foto: "img/burgers/oklahoma-spicy.jpg",
        desc: "La Oklahoma con carácter. Carne smasheada de 90 g, cheddar, cebolla a la chapa y nuestra salsa Eddie's.",
        queso: "cheddar",
        quesos: [2, 3, 4],
        precios: [14500, 16000, 17500],
      },
      {
        id: "crispy",
        nombre: "Crispy",
        fotos: ["img/burgers/crispy-1.jpg", "img/burgers/crispy-2.jpg", "img/burgers/crispy-3.jpg"],
        desc: "Para los amantes del crunch. Carne smasheada de 90 g, cheddar, lluvia de cebolla crispy y salsa Eddie's.",
        queso: "cheddar",
        quesos: [2, 3, 4],
        precios: [14500, 16000, 17500],
      },
      {
        id: "americana",
        nombre: "Americana",
        fotos: ["img/burgers/americana-1.jpg", "img/burgers/americana-2.jpg", "img/burgers/americana-3.jpg", "img/burgers/americana-4.jpg"],
        desc: "Clásica y contundente. Carne smasheada de 90 g, cheddar, cebolla caramelizada, panceta crocante y salsa BBQ.",
        queso: "cheddar",
        quesos: [2, 3, 4],
        precios: [14500, 16000, 17500],
      },
    ],
  },
  {
    id: "papitas",
    nombre: "Papitas",
    bajada: "Para compartir… o no",
    banner: "img/contenido/papas-caja.jpg", // foto grande arriba de la categoría (opcional)
    tipo: "simple",
    items: [
      { id: "papas-clasicas", nombre: "Papas clásicas", precio: 9000, desc: "Porción de papas doradas y crocantes con dip de salsa a elección." },
      { id: "papas-cheddar", nombre: "Papas con cheddar", precio: 10000, desc: "Una montaña de papas con cheddar derretido, panceta crocante y verdeo." },
      { id: "papas-smash", nombre: "Papas Smash", precio: 12500, desc: "Papas con carne smasheada y cheddar. Un plato que roba protagonismo." },
    ],
  },
  {
    id: "pickers",
    nombre: "Pickers",
    bajada: "Para picar mientras llega tu smash",
    tipo: "simple",
    items: [
      { id: "aros", nombre: "Aros de cebolla", precio: 9000, desc: "Crujientes, dorados y adictivos." },
      { id: "bastones", nombre: "Bastones de mozzarella", precio: 9000, desc: "Mozzarella fundida con rebozado crocante." },
      { id: "nuggets", nombre: "Nuggets de pollo", precio: 9000, etiqueta: "Nuevo", desc: "Crocantes por fuera, tiernos por dentro. Ideal para grandes y chicos." },
    ],
  },
  {
    id: "picadas",
    nombre: "Picadas",
    bajada: "Disfrutá en compañía, compartí lo que te gusta",
    tipo: "picada",
    items: [
      {
        id: "picada-simple",
        nombre: "Picada Simple",
        etiqueta: "Nuevo",
        personas: "2/3 personas",
        precio: 15000,
        incluye: ["5 bastones de mozzarella", "4 aros de cebolla", "4 nuggets de pollo", "1 carne smasheada con queso cheddar"],
      },
      {
        id: "picada-doble",
        nombre: "Picada Doble",
        etiqueta: "Nuevo",
        personas: "4/5 personas",
        precio: 30000,
        incluye: ["9 bastones de mozzarella", "8 aros de cebolla", "6 nuggets de pollo", "2 carnes smasheadas con queso cheddar"],
      },
    ],
  },
  {
    id: "bebidas",
    nombre: "Bebidas",
    bajada: "Para acompañar",
    tipo: "simple",
    items: [
      { id: "gaseosa", nombre: "Gaseosa línea Coca-Cola", precio: 3000, desc: "375 ml. Aclará el sabor en el pedido." },
      { id: "agua-saborizada", nombre: "Agua saborizada", precio: 3000, desc: "Aquarius o Levite. Consultá la variedad disponible." },
      { id: "heineken", nombre: "Cerveza Heineken", precio: 4000, mayores: true, desc: "Bien fría." },
      { id: "norte", nombre: "Cerveza Norte", precio: 5000, mayores: true, desc: "Bien fría." },
      { id: "imperial", nombre: "Cerveza Imperial", precio: 3500, mayores: true, desc: "Bien fría." },
    ],
  },
];

/* ---------- Solo en el salón (no se piden por la web) ---------- */
const SALON = [
  { nombre: "Fernet con Coca · Combo 1", desc: "1 Coca-Cola + hielo + 1 medida de fernet." },
  { nombre: "Fernet con Coca · Combo 2", desc: "1 Coca-Cola (rinde dos vasos) + hielo + 2 medidas de fernet." },
  { nombre: "Cerveza Miller", desc: "Litro." },
  { nombre: "Cerveza Grolsch", desc: "Litro." },
];
