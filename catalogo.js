// CATÁLOGO DE DRAKEN22 SCANS
// ESTE ES EL ARCHIVO PRINCIPAL PARA AÑADIR O EDITAR OBRAS.
// Cada objeto dentro de window.MANGAS representa una ficha del catálogo.
// title = título; autor = autor/artista; tipo = Manga o Doujinshi.
// imagen = ruta de la portada dentro de portadas/; description = descripción.
// status = "produccion" o "completo"; chapter = capítulos disponibles.
// totalVolumenes = total de volúmenes; volumenesDisponibles = volúmenes publicados.
// links = enlaces opcionales asociados a la obra. Si no quieres cambiar la lógica,
// conserva las comas y las llaves al copiar una ficha nueva.
// Para añadir un manga: copia una ficha y pégala antes del ]; final.
// Guarda las portadas dentro de portadas/ y escribe la ruta exacta.
// formato: "capitulos" o "volumenes".
// traduccionCompleta: true si todos los capítulos/volúmenes están traducidos.
window.MANGAS = [
  // ==================================================
  // 1. DRAGON BALL KAKUMEI — publicado por capítulos
  // ==================================================
  {
    id: "dragon-ball-kakumei",
    title: "Dragon Ball Kakumei",
    autor: "No especificado", // Cambia este texto por el nombre del autor.
    tipo: "Doujinshi",
    imagen: "portadas/DBKakumei.png",
    description: "Manga de Dragon Ball Kakumei.",
    status: "produccion",
    formato: "capitulos",
    chapter: 30,
    total: 30,
      totalVolumenes: 5,
    volumenesDisponibles: 5,
    traduccionCompleta: false,
    pages: 30,
    links: [
      {
        Manga: 1,
        label: "Leer capítulo 1",
        url: "https://enlace-real-del-capitulo"
      }
    ]
  },

  // ==================================================
  // 2. DRAGON BALL AF By Toyble
  // ==================================================
  {
    id: "dragon-ball-af",
    title: "Dragon Ball AF By Toyble",
    autor: "Toyble", // Autor o artista de esta obra.
    tipo: "Doujinshi",
    imagen: "portadas/DBAFToyble.png",
    description: "Manga de Dragon Ball AF.",
    status: "Completos",
    formato: "volumenes",
    chapter: 0,
    total: 0,
    totalVolumenes: 6,
    volumenesDisponibles: 6,
    traduccionCompleta: true,
    pages: 0,
    links: [
      {
        Manga: 1,
        label: "Leer volumen 1",
        url: "https://pon-aqui-el-enlace-real"
      }
    ]
  },
    // ==================================================
  // 3. DRAGON BALL AF By Young Jijii
  // ==================================================
  {
    id: "dragon-ball-afyj",
    title: "Dragon Ball AF By Young Jijii",
    autor: "Young Jijii", // Autor o artista de esta obra.
    tipo: "Doujinshi",
    imagen: "portadas/DBAFYoungJijii.png",
    description: "Manga de Dragon Ball AF.",
    status: "produccions",
    formato: "volumenes",
    chapter: 0,
    total: 0,
    totalVolumenes: 31,
    volumenesDisponibles: 31,
    traduccionCompleta: true,
    pages: 0,
    links: [
      {
        Manga: 1,
        label: "Leer volumen 1",
        url: "https://pon-aqui-el-enlace-real"
      }
    ]
  }
];
