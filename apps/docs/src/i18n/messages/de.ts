import type { Messages } from '../messages';

export const de: Messages = {
  header: {
    docs: 'Dokumentation',
    search: 'Suchen',
    githubLabel: 'ReelKit auf GitHub',
    themeLabel: 'Design wechseln',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System',
    menuLabel: 'Navigation ein- oder ausblenden',
    languageLabel: 'Sprache wechseln',
  },
  nav: {
    sections: {
      overview: 'Überblick',
      core: 'Core',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'Komponenten',
      recipes: 'Rezepte',
      resources: 'Ressourcen',
    },
    items: {
      gettingStarted: 'Erste Schritte',
      installation: 'Installation',
      ssr: 'SSR',
      guide: 'Leitfaden',
      apiReference: 'API-Referenz',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      recipesOverview: 'Alle Rezepte',
      infiniteFeed: 'Endloser Feed',
      gridToPlayer: 'Vom Raster zum Player',
      gallerySlideshow: 'Galerie als Diashow',
      storiesTray: 'Stories-Leiste',
      troubleshooting: 'Fehlerbehebung',
      llms: 'KI- / LLM-Integration',
      changelog: 'Was ist neu?',
    },
    comingSoon: 'Bald',
  },
  footer: {
    tagline:
      'Headless, virtualisierte Slider-Engine ohne Abhängigkeiten. Feeds im Stil von TikTok / Reels mit Gesten in 60 fps und nur drei Knoten im DOM.',
    documentation: 'Dokumentation',
    gettingStarted: 'Erste Schritte',
    installation: 'Installation',
    examples: 'Beispiele',
    community: 'Community',
    rights: (year) => `© ${year} ReelKit. Alle Rechte vorbehalten.`,
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
  },
  search: {
    placeholder: 'Dokumentation durchsuchen…',
    empty: (query) => `Keine Ergebnisse für „${query}“`,
    pagesGroup: (category) => `Seiten · ${category}`,
    sectionsGroup: (page) => `${page} · Abschnitte`,
    navigate: 'navigieren',
    open: 'öffnen',
    close: 'schließen',
  },
  whatsNew: {
    title: 'Neuigkeiten',
    since: (count) =>
      count === 1
        ? '1 neue Version seit deinem letzten Besuch'
        : `${count} neue Versionen seit deinem letzten Besuch`,
    more: (count) =>
      `+${count} weitere ${count === 1 ? 'Version' : 'Versionen'}`,
    dismiss: 'Verstanden',
    viewFull: 'Vollständigen Verlauf ansehen',
    close: 'Schließen',
    closeOverlay: 'Fenster mit den Neuigkeiten schließen',
  },
  nextSteps: {
    title: 'Nächste Schritte',
  },
  notFound: {
    title: 'Seite nicht gefunden',
    description: 'Die gesuchte Seite gibt es nicht oder sie ist umgezogen.',
    home: 'Startseite',
    docs: 'Dokumentation',
  },
};
