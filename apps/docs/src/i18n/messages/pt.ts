import type { Messages } from '../messages';

export const pt: Messages = {
  header: {
    docs: 'Documentação',
    search: 'Buscar',
    githubLabel: 'ReelKit no GitHub',
    themeLabel: 'Alternar tema',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    themeSystem: 'Sistema',
    menuLabel: 'Alternar navegação',
    languageLabel: 'Mudar idioma',
  },
  nav: {
    sections: {
      overview: 'Visão geral',
      core: 'Core',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'Componentes',
      resources: 'Recursos',
    },
    items: {
      gettingStarted: 'Primeiros passos',
      installation: 'Instalação',
      ssr: 'SSR',
      guide: 'Guia',
      apiReference: 'Referência da API',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: 'Solução de problemas',
      llms: 'Integração com IA / LLM',
      changelog: 'O que há de novo?',
    },
    comingSoon: 'Em breve',
  },
  footer: {
    tagline:
      'Motor de slider headless, virtualizado e sem dependências. Feeds no estilo TikTok / Reels com gestos a 60 fps e apenas três nós no DOM.',
    documentation: 'Documentação',
    gettingStarted: 'Primeiros passos',
    installation: 'Instalação',
    examples: 'Exemplos',
    community: 'Comunidade',
    rights: (year) => `© ${year} ReelKit. Todos os direitos reservados.`,
    privacy: 'Privacidade',
    terms: 'Termos',
  },
  search: {
    placeholder: 'Buscar na documentação…',
    empty: (query) => `Nenhum resultado para “${query}”`,
    pagesGroup: (category) => `Páginas · ${category}`,
    sectionsGroup: (page) => `${page} · Seções`,
    navigate: 'navegar',
    open: 'abrir',
    close: 'fechar',
  },
  whatsNew: {
    title: 'O que há de novo',
    since: (count) =>
      count === 1
        ? '1 novo lançamento desde a sua última visita'
        : `${count} novos lançamentos desde a sua última visita`,
    more: (count) => `+${count} ${count === 1 ? 'lançamento' : 'lançamentos'}`,
    dismiss: 'Entendi',
    viewFull: 'Ver o histórico completo',
    close: 'Fechar',
    closeOverlay: 'Fechar a janela de novidades',
  },
  nextSteps: {
    title: 'Próximos passos',
  },
  notFound: {
    title: 'Página não encontrada',
    description: 'A página que você procura não existe ou mudou de endereço.',
    home: 'Início',
    docs: 'Documentação',
  },
};
