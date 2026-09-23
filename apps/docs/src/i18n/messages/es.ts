import type { Messages } from '../messages';

export const es: Messages = {
  header: {
    docs: 'Documentación',
    search: 'Buscar',
    githubLabel: 'ReelKit en GitHub',
    themeLabel: 'Cambiar tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Sistema',
    menuLabel: 'Mostrar u ocultar la navegación',
    languageLabel: 'Cambiar idioma',
  },
  nav: {
    sections: {
      overview: 'Introducción',
      core: 'Core',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'Componentes',
      resources: 'Recursos',
    },
    items: {
      gettingStarted: 'Primeros pasos',
      installation: 'Instalación',
      ssr: 'SSR',
      guide: 'Guía',
      apiReference: 'Referencia de la API',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: 'Solución de problemas',
      llms: 'Integración con IA / LLM',
      changelog: '¿Qué hay de nuevo?',
    },
    comingSoon: 'Pronto',
  },
  footer: {
    tagline:
      'Motor de slider headless, virtualizado y sin dependencias. Feeds al estilo de TikTok / Reels con gestos a 60 fps y solo tres nodos en el DOM.',
    documentation: 'Documentación',
    gettingStarted: 'Primeros pasos',
    installation: 'Instalación',
    examples: 'Ejemplos',
    community: 'Comunidad',
    rights: (year) => `© ${year} ReelKit. Todos los derechos reservados.`,
    privacy: 'Privacidad',
    terms: 'Condiciones',
  },
  search: {
    placeholder: 'Buscar en la documentación…',
    empty: (query) => `No hay resultados para «${query}»`,
    pagesGroup: (category) => `Páginas · ${category}`,
    sectionsGroup: (page) => `${page} · Secciones`,
    navigate: 'navegar',
    open: 'abrir',
    close: 'cerrar',
  },
  whatsNew: {
    title: 'Novedades',
    since: (count) =>
      count === 1
        ? '1 nueva versión desde tu última visita'
        : `${count} nuevas versiones desde tu última visita`,
    more: (count) => `+${count} ${count === 1 ? 'versión' : 'versiones'} más`,
    dismiss: 'Entendido',
    viewFull: 'Ver el historial completo',
    close: 'Cerrar',
    closeOverlay: 'Cerrar la ventana de novedades',
  },
  nextSteps: {
    title: 'Siguientes pasos',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o ha cambiado de dirección.',
    home: 'Inicio',
    docs: 'Documentación',
  },
};
