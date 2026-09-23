import type { Messages } from '../messages';

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

export const uk: Messages = {
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
