import type { Locale } from './locale';

/**
 * Every user-facing string rendered by the shared chrome — header, sidebar,
 * footer, command palette, dialogs and the not-found page. Long-form docs
 * prose is not routed through here; each locale gets its own page file so
 * translators edit readable markup instead of key soup.
 */
export interface Messages {
  header: {
    docs: string;
    search: string;
    githubLabel: string;
    themeLabel: string;
    /** Names of the three theme choices, used in the control's label. */
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    menuLabel: string;
    languageLabel: string;
  };
  nav: {
    sections: {
      overview: string;
      core: string;
      react: string;
      angular: string;
      vue: string;
      components: string;
      resources: string;
    };
    items: {
      gettingStarted: string;
      installation: string;
      ssr: string;
      guide: string;
      apiReference: string;
      storiesCore: string;
      reelPlayer: string;
      lightbox: string;
      storiesPlayer: string;
      troubleshooting: string;
      llms: string;
      changelog: string;
    };
    comingSoon: string;
  };
  footer: {
    tagline: string;
    documentation: string;
    gettingStarted: string;
    installation: string;
    examples: string;
    community: string;
    rights: (year: number) => string;
    privacy: string;
    terms: string;
  };
  search: {
    placeholder: string;
    empty: (query: string) => string;
    pagesGroup: (category: string) => string;
    sectionsGroup: (page: string) => string;
    navigate: string;
    open: string;
    close: string;
  };
  whatsNew: {
    title: string;
    since: (count: number) => string;
    more: (count: number) => string;
    dismiss: string;
    viewFull: string;
    close: string;
    closeOverlay: string;
  };
  nextSteps: {
    title: string;
  };
  notFound: {
    title: string;
    description: string;
    home: string;
    docs: string;
  };
}

const en: Messages = {
  header: {
    docs: 'Docs',
    search: 'Search',
    githubLabel: 'ReelKit on GitHub',
    themeLabel: 'Toggle theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    menuLabel: 'Toggle navigation',
    languageLabel: 'Change language',
  },
  nav: {
    sections: {
      overview: 'Overview',
      core: 'Core',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'Components',
      resources: 'Resources',
    },
    items: {
      gettingStarted: 'Getting Started',
      installation: 'Installation',
      ssr: 'SSR',
      guide: 'Guide',
      apiReference: 'API Reference',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: 'Troubleshooting',
      llms: 'AI / LLM Integration',
      changelog: "What's New?",
    },
    comingSoon: 'Soon',
  },
  footer: {
    tagline:
      'Headless, virtualized, zero-dependency slider engine. Build TikTok/Reels-style feeds with 60fps gestures and only 3 DOM nodes.',
    documentation: 'Documentation',
    gettingStarted: 'Getting Started',
    installation: 'Installation',
    examples: 'Examples',
    community: 'Community',
    rights: (year) => `© ${year} ReelKit. All rights reserved.`,
    privacy: 'Privacy',
    terms: 'Terms',
  },
  search: {
    placeholder: 'Search documentation...',
    empty: (query) => `No results found for “${query}”`,
    pagesGroup: (category) => `Pages · ${category}`,
    sectionsGroup: (page) => `${page} · Sections`,
    navigate: 'navigate',
    open: 'open',
    close: 'close',
  },
  whatsNew: {
    title: 'What’s new',
    since: (count) =>
      count === 1
        ? '1 new release since your last visit'
        : `${count} new releases since your last visit`,
    more: (count) => `+${count} more ${count === 1 ? 'release' : 'releases'}`,
    dismiss: 'Dismiss',
    viewFull: 'View full changelog',
    close: 'Close',
    closeOverlay: "Close what's new dialog",
  },
  nextSteps: {
    title: 'Next Steps',
  },
  notFound: {
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved.",
    home: 'Home',
    docs: 'Docs',
  },
};

const zh: Messages = {
  header: {
    docs: '文档',
    search: '搜索',
    githubLabel: '在 GitHub 上查看 ReelKit',
    themeLabel: '切换主题',
    themeLight: '浅色',
    themeDark: '深色',
    themeSystem: '跟随系统',
    menuLabel: '切换导航栏',
    languageLabel: '切换语言',
  },
  nav: {
    sections: {
      overview: '概览',
      core: '核心',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: '组件',
      resources: '资源',
    },
    items: {
      gettingStarted: '快速开始',
      installation: '安装',
      ssr: '服务端渲染',
      guide: '指南',
      apiReference: 'API 参考',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: '疑难排查',
      llms: 'AI / 大模型集成',
      changelog: '更新日志',
    },
    comingSoon: '即将推出',
  },
  footer: {
    tagline:
      '无头、虚拟化、零依赖的滑动引擎。用 60fps 手势和仅 3 个 DOM 节点，构建 TikTok / Reels 风格的信息流。',
    documentation: '文档',
    gettingStarted: '快速开始',
    installation: '安装',
    examples: '示例',
    community: '社区',
    rights: (year) => `© ${year} ReelKit。保留所有权利。`,
    privacy: '隐私政策',
    terms: '服务条款',
  },
  search: {
    placeholder: '搜索文档…',
    empty: (query) => `没有找到与“${query}”匹配的结果`,
    pagesGroup: (category) => `页面 · ${category}`,
    sectionsGroup: (page) => `${page} · 章节`,
    navigate: '选择',
    open: '打开',
    close: '关闭',
  },
  whatsNew: {
    title: '最新动态',
    since: (count) => `自你上次访问以来有 ${count} 个新版本`,
    more: (count) => `还有 ${count} 个版本`,
    dismiss: '知道了',
    viewFull: '查看完整更新日志',
    close: '关闭',
    closeOverlay: '关闭最新动态弹窗',
  },
  nextSteps: {
    title: '下一步',
  },
  notFound: {
    title: '页面不存在',
    description: '你访问的页面不存在，或者已经被移动到别处。',
    home: '首页',
    docs: '文档',
  },
};

/**
 * Ukrainian counts do not split in two the way English does. One form
 * follows 1, 21, 31 and so on, a second follows 2 through 4, and a third
 * covers everything else — including the teens, which look like the first
 * two groups but take the third form.
 */
function ukPlural(count: number, one: string, few: string, many: string) {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  const last = count % 10;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

const uk: Messages = {
  header: {
    docs: 'Документація',
    search: 'Пошук',
    githubLabel: 'ReelKit на GitHub',
    themeLabel: 'Перемкнути тему',
    themeLight: 'Світла',
    themeDark: 'Темна',
    themeSystem: 'Системна',
    menuLabel: 'Перемкнути навігацію',
    languageLabel: 'Змінити мову',
  },
  nav: {
    sections: {
      overview: 'Огляд',
      core: 'Ядро',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'Компоненти',
      resources: 'Ресурси',
    },
    items: {
      gettingStarted: 'Початок роботи',
      installation: 'Встановлення',
      // Read and searched as an acronym, so it stays in Latin script.
      ssr: 'SSR',
      guide: 'Посібник',
      apiReference: 'Довідник API',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: 'Усунення несправностей',
      llms: 'Інтеграція з AI / LLM',
      changelog: 'Що нового?',
    },
    comingSoon: 'Скоро',
  },
  footer: {
    tagline:
      'Headless, віртуалізований рушій слайдера без залежностей. Стрічки у стилі TikTok / Reels із жестами на 60 fps і лише трьома вузлами DOM.',
    documentation: 'Документація',
    gettingStarted: 'Початок роботи',
    installation: 'Встановлення',
    examples: 'Приклади',
    community: 'Спільнота',
    rights: (year) => `© ${year} ReelKit. Усі права захищено.`,
    privacy: 'Конфіденційність',
    terms: 'Умови',
  },
  search: {
    placeholder: 'Пошук у документації…',
    empty: (query) => `Нічого не знайдено за запитом «${query}»`,
    pagesGroup: (category) => `Сторінки · ${category}`,
    sectionsGroup: (page) => `${page} · Розділи`,
    navigate: 'навігація',
    open: 'відкрити',
    close: 'закрити',
  },
  whatsNew: {
    title: 'Що нового',
    since: (count) =>
      `${count} ${ukPlural(count, 'новий реліз', 'нові релізи', 'нових релізів')} від вашого останнього візиту`,
    more: (count) =>
      `+${count} ${ukPlural(count, 'реліз', 'релізи', 'релізів')}`,
    dismiss: 'Зрозуміло',
    viewFull: 'Переглянути повний журнал змін',
    close: 'Закрити',
    closeOverlay: 'Закрити вікно «Що нового»',
  },
  nextSteps: {
    title: 'Наступні кроки',
  },
  notFound: {
    title: 'Сторінку не знайдено',
    description: 'Сторінка, яку ви шукаєте, не існує або її перенесено.',
    home: 'Головна',
    docs: 'Документація',
  },
};

export const messages: Record<Locale, Messages> = { en, zh, uk };
