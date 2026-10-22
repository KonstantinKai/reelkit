import type { HomeMessages } from '../home';

export const de: HomeMessages = {
  meta: {
    title: 'ReelKit — headless, virtualisierte Slider-Engine für React',
    description:
      'Virtualisierte Slider-Engine ohne Abhängigkeiten. Baue vertikale Feeds im Stil von TikTok / Reels mit Gesten in 60 fps und nur drei Knoten im DOM.',
  },
  hero: {
    taglineLead: 'Ein-Element-Slider für',
    taglineHighlight: 'Erlebnisse wie TikTok / Instagram Reels',
    taglineTail: '',
    subtitle:
      'Framework-unabhängig, virtualisiert und für Touch gebaut. Gemacht für vertikale Video-Feeds, Story-Viewer und Galerien im Vollbild.',
    getStarted: 'Loslegen',
    demoCaption: 'Live-Demo: nutze die Pfeiltasten',
  },
  virtualization: {
    eyebrow: 'So funktioniert es',
    headingLead: 'Ein ganzer Feed.',
    headingHighlight: 'Nur drei Slides.',
    intro:
      'Dein Feed kann Tausende Elemente haben. Reel hält nur den aktuellen Slide und seine direkten Nachbarn gemountet.',
    steps: [
      {
        title: 'Den nächsten Swipe bereithalten',
        description:
          'Der aktuelle Slide füllt den Bildschirm. Ein Nachbar wartet darüber, einer darunter.',
      },
      {
        title: 'Durch den Feed bewegen',
        description:
          'Wische nach oben zum nächsten Element oder nach unten zurück zum vorherigen. Die gemounteten Slides bewegen sich gemeinsam.',
      },
      {
        title: 'Nur aktualisieren, was sich geändert hat',
        description:
          'Sobald der Slide zur Ruhe kommt, wird das Element außerhalb des Bereichs entfernt und der neue Nachbar gemountet. Alles, was im Bereich bleibt, bleibt an seinem Platz.',
      },
    ],
    footnote:
      'An beiden Enden eines Feeds ohne Schleife reichen zwei Slides. Achte darauf, wie sich die Zahl der gemounteten Slides ändert, wenn die Demo den Rand erreicht.',
  },
  features: {
    heading: 'Für Performance gebaut',
    subheading:
      'Virtualisiertes Rendering, keine Abhängigkeiten, Übergänge in 60 fps',
    highlights: [
      {
        stat: '3',
        unit: 'im DOM',
        title: 'Virtualisiert',
        description:
          'Kommt mit mehr als 10.000 Elementen zurecht. Es werden immer nur 3 Slides gerendert.',
      },
      {
        stat: '0',
        unit: 'Abhängigkeiten',
        title: 'Keine Abhängigkeiten',
        description:
          'Keine Abhängigkeiten zur Laufzeit. Der Core ist mit gzip ~11.2 kB groß.',
      },
      {
        stat: '60',
        unit: 'fps',
        title: 'Touch zuerst',
        description: 'Native Wischgesten mit Schwung und Einrastpunkten.',
      },
    ],
    more: [
      'Hohe Performance',
      'Tastaturnavigation',
      'Framework-unabhängig',
      'TypeScript zuerst',
      'Headless + gestylt',
      'Fertige Komponenten',
      'Teilbarer URL-State',
    ],
  },
  why: {
    heading: 'Warum „ReelKit“?',
    reelTerm: 'Reel',
    reelBody:
      '— vertikale Video-Feeds wie Instagram Reels und TikTok. Ein Inhalt auf einmal; wische weiter zum nächsten.',
    kitTerm: 'Kit',
    kitBody:
      '— ein modularer Satz von Paketen. Nutze den headless Core für volle Kontrolle, die Framework-Bindings für einen schnellen Start oder die fertigen Overlays für Videoplayer und Bildergalerien.',
  },
  api: {
    heading: 'Einfache API',
    subheading: 'Starte mit wenigen Zeilen Code',
  },
  packages: {
    heading: 'Verfügbare Pakete',
    subheading: 'Ein modulares Ökosystem: Wähle, was du brauchst',
    coreBadge: 'Core',
    coreDescription:
      'Framework-unabhängige Slider-Engine — Virtualisierung, Gesten, Tastatur, Mausrad, Signale. Keine Abhängigkeiten.',
    bindings: {
      react: 'Komponenten, Hooks und Brücken für Signale',
      angular: 'Standalone-Komponenten mit Reaktivität auf Basis von Signalen',
      vue: 'Komponenten und Composables für Vue 3',
    },
  },
  cta: {
    heading: 'Bereit für den Start?',
    body: 'Sieh dir die Dokumentation und die Beispiele an und baue deinen ersten Slider.',
    readDocs: 'Dokumentation lesen',
  },
};
