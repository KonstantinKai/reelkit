import type { HomeMessages } from '../home';

export const es: HomeMessages = {
  meta: {
    title: 'ReelKit — motor de slider headless y virtualizado para React',
    description:
      'Motor de slider virtualizado y sin dependencias. Crea feeds verticales al estilo de TikTok / Reels con gestos a 60 fps y solo tres nodos en el DOM.',
  },
  hero: {
    taglineLead: 'Slider de un solo elemento para',
    taglineHighlight: 'experiencias al estilo de TikTok / Instagram Reels',
    taglineTail: '',
    subtitle:
      'Independiente del framework, virtualizado y pensado para el tacto. Hecho para feeds verticales de vídeo, visores de stories y galerías a pantalla completa.',
    getStarted: 'Empezar',
    demoCaption: 'Demo en vivo: usa las flechas',
  },
  virtualization: {
    eyebrow: 'Cómo funciona',
    headingLead: 'Un feed entero.',
    headingHighlight: 'Solo tres slides.',
    intro:
      'Tu feed puede tener miles de elementos. Reel mantiene montados únicamente el slide actual y sus vecinos inmediatos.',
    steps: [
      {
        title: 'Tener listo el siguiente deslizamiento',
        description:
          'El slide actual ocupa la pantalla. Un vecino espera arriba y otro abajo.',
      },
      {
        title: 'Recorrer el feed',
        description:
          'Desliza hacia arriba para ir al siguiente elemento, o hacia abajo para volver al anterior. Los slides montados se mueven juntos.',
      },
      {
        title: 'Actualizar solo lo que cambió',
        description:
          'Cuando el slide se asienta, el elemento que salió del rango se desmonta y se monta el nuevo vecino. Los que siguen dentro se quedan donde estaban.',
      },
    ],
    footnote:
      'En cualquiera de los dos extremos de un feed sin bucle bastan dos slides. Mira cómo cambia el número de montados cuando la demo llega al borde.',
  },
  features: {
    heading: 'Pensado para el rendimiento',
    subheading:
      'Renderizado virtualizado, sin dependencias, transiciones a 60 fps',
    highlights: [
      {
        stat: '3',
        unit: 'en el DOM',
        title: 'Virtualizado',
        description:
          'Admite más de 10.000 elementos. Solo se renderizan 3 slides a la vez.',
      },
      {
        stat: '0',
        unit: 'dependencias',
        title: 'Sin dependencias',
        description:
          'Ninguna dependencia en tiempo de ejecución. El core ocupa ~10.1 kB con gzip.',
      },
      {
        stat: '60',
        unit: 'fps',
        title: 'Táctil ante todo',
        description:
          'Gestos de deslizamiento nativos con inercia y puntos de ajuste.',
      },
    ],
    more: [
      'Alto rendimiento',
      'Navegación con teclado',
      'Independiente del framework',
      'TypeScript ante todo',
      'Headless + con estilos',
      'Componentes listos para usar',
      'Estado en la URL compartible',
    ],
  },
  why: {
    heading: '¿Por qué «ReelKit»?',
    reelTerm: 'Reel',
    reelBody:
      '— feeds verticales de vídeo como los de Instagram Reels y TikTok. Un contenido cada vez; desliza para pasar al siguiente.',
    kitTerm: 'Kit',
    kitBody:
      '— un conjunto modular de paquetes. Usa el core headless para tener control total, los bindings de framework para empezar rápido o los overlays listos para usar para reproductores de vídeo y galerías de imágenes.',
  },
  api: {
    heading: 'API sencilla',
    subheading: 'Empieza con unas pocas líneas de código',
  },
  packages: {
    heading: 'Paquetes disponibles',
    subheading: 'Un ecosistema modular: elige lo que necesites',
    coreBadge: 'Core',
    coreDescription:
      'Motor de slider independiente del framework — virtualización, gestos, teclado, rueda del ratón, señales. Sin dependencias.',
    bindings: {
      react: 'Componentes, hooks y puentes de señales',
      angular: 'Componentes standalone con reactividad basada en señales',
      vue: 'Componentes y composables para Vue 3',
    },
  },
  cta: {
    heading: '¿Listo para empezar?',
    body: 'Consulta la documentación y los ejemplos para crear tu primer slider.',
    readDocs: 'Leer la documentación',
  },
};
