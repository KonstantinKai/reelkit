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
  home: {
    meta: {
      title: 'ReelKit — motor de slider headless e virtualizado para React',
      description:
        'Motor de slider virtualizado e sem dependências. Monte feeds verticais no estilo TikTok / Reels com gestos a 60 fps e apenas três nós no DOM.',
    },
    hero: {
      taglineLead: 'Slider de um item por vez para',
      taglineHighlight: 'experiências no estilo TikTok / Instagram Reels',
      taglineTail: 'e stories',
      subtitle:
        'Independente de framework, virtualizado, pensado para o toque. Feito para feeds de vídeo vertical, visualizadores de stories e galerias em tela cheia.',
      getStarted: 'Começar',
      demoCaption: 'Demonstração ao vivo — use as setas',
    },
    virtualization: {
      eyebrow: 'Como funciona',
      headingLead: 'Um feed inteiro.',
      headingHighlight: 'Só três slides.',
      intro:
        'Seu feed pode ter milhares de itens. O Reel mantém montados apenas o slide atual e os vizinhos imediatos.',
      steps: [
        {
          title: 'Deixar o próximo deslize pronto',
          description:
            'O slide atual ocupa a tela. Um vizinho espera acima e outro abaixo.',
        },
        {
          title: 'Percorrer o feed',
          description:
            'Deslize para cima para ir ao próximo item, ou para baixo para voltar ao anterior. Os slides montados se movem juntos.',
        },
        {
          title: 'Atualizar só o que mudou',
          description:
            'Quando o slide assenta, o item que saiu do intervalo é removido e o novo vizinho é montado. Os que continuam no intervalo ficam onde estão.',
        },
      ],
      footnote:
        'Em qualquer uma das pontas de um feed sem laço bastam dois slides. Repare na contagem de montados mudando quando a demonstração chega à borda.',
    },
    features: {
      heading: 'Feito para o desempenho',
      subheading:
        'Renderização virtualizada, zero dependências, transições a 60 fps',
      highlights: [
        {
          stat: '3',
          unit: 'no DOM',
          title: 'Virtualizado',
          description:
            'Dá conta de mais de 10.000 itens. Apenas 3 slides renderizados por vez.',
        },
        {
          stat: '0',
          unit: 'dependências',
          title: 'Zero dependências',
          description:
            'Nenhuma dependência em tempo de execução. O core tem ~10.1 kB com gzip.',
        },
        {
          stat: '60',
          unit: 'fps',
          title: 'Toque em primeiro lugar',
          description:
            'Gestos de deslize nativos, com inércia e pontos de encaixe.',
        },
      ],
      more: [
        'Alto desempenho',
        'Navegação por teclado',
        'Independente de framework',
        'TypeScript em primeiro lugar',
        'Headless + estilos prontos',
        'Componentes prontos',
        'Estado na URL para compartilhar',
      ],
    },
    why: {
      heading: 'Por que “ReelKit”?',
      reelTerm: 'Reel',
      reelBody:
        '— feeds de vídeo vertical como os do Instagram Reels e do TikTok. Um conteúdo por vez, e um deslize leva ao próximo.',
      kitTerm: 'Kit',
      kitBody:
        '— um conjunto modular de pacotes. Use o core headless para ter controle total, os bindings de framework para começar rápido, ou os overlays prontos para players de vídeo e galerias de imagens.',
    },
    api: {
      heading: 'API simples',
      subheading: 'Algumas linhas de código e está funcionando',
    },
    packages: {
      heading: 'Pacotes disponíveis',
      subheading: 'Um ecossistema modular — pegue só o que precisar',
      coreBadge: 'Core',
      coreDescription:
        'Motor de slider independente de framework — virtualização, gestos, teclado, roda do mouse, sinais. Zero dependências.',
      bindings: {
        react: 'Componentes, hooks e pontes de sinais',
        angular: 'Componentes standalone com reatividade baseada em sinais',
        vue: 'Componentes e composables para Vue 3',
      },
    },
    cta: {
      heading: 'Pronto para começar?',
      body: 'Confira a documentação e os exemplos para montar seu primeiro slider.',
      readDocs: 'Ler a documentação',
    },
  },
};
