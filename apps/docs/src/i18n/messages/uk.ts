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
  home: {
    meta: {
      title: 'ReelKit — headless віртуалізований рушій слайдера для React',
      description:
        'Віртуалізований рушій слайдера без залежностей. Створюйте вертикальні стрічки у стилі TikTok / Reels із жестами на 60 fps і лише трьома вузлами DOM.',
    },
    hero: {
      taglineLead: 'Слайдер по одному елементу для',
      taglineHighlight: 'стрічок у стилі TikTok / Instagram Reels',
      taglineTail: 'та історій',
      subtitle:
        'Незалежний від фреймворку, віртуалізований, орієнтований на дотик. Створений для вертикальних відеострічок, переглядачів історій і повноекранних галерей.',
      getStarted: 'Почати',
      demoCaption: 'Демо наживо — гортайте стрілками',
    },
    virtualization: {
      eyebrow: 'Як це працює',
      headingLead: 'Ціла стрічка.',
      headingHighlight: 'Лише три слайди.',
      intro:
        'У вашій стрічці можуть бути тисячі елементів. Reel тримає змонтованими тільки поточний слайд і його найближчих сусідів.',
      steps: [
        {
          title: 'Тримати напоготові наступний свайп',
          description:
            'Поточний слайд заповнює екран. Один сусід чекає згори, інший — знизу.',
        },
        {
          title: 'Рухатися стрічкою',
          description:
            'Свайп угору — наступний елемент, униз — попередній. Змонтовані слайди рухаються разом.',
        },
        {
          title: 'Оновлювати лише те, що змінилося',
          description:
            'Щойно слайд зупиняється, елемент, який вийшов за межі діапазону, прибирається, а новий сусід монтується. Ті, що лишилися в діапазоні, стоять на місці.',
        },
      ],
      footnote:
        'На будь-якому краї стрічки без зациклення достатньо двох слайдів. Подивіться, як змінюється кількість змонтованих, коли демо доходить до краю.',
    },
    features: {
      heading: 'Створено для продуктивності',
      subheading:
        'Віртуалізований рендеринг, нуль залежностей, переходи з 60 fps',
      highlights: [
        {
          stat: '3',
          unit: 'у DOM',
          title: 'Віртуалізований',
          description:
            'Витримує 10 000+ елементів. У DOM одночасно лише 3 слайди.',
        },
        {
          stat: '0',
          unit: 'залежностей',
          title: 'Нуль залежностей',
          description:
            'Жодних рантайм-залежностей. Ядро — близько 10.1 кБ у gzip.',
        },
        {
          stat: '60',
          unit: 'fps',
          title: 'Спершу дотик',
          description: 'Нативні свайпи з інерцією та точками прилипання.',
        },
      ],
      more: [
        'Продуктивний',
        'Навігація з клавіатури',
        'Незалежний від фреймворку',
        'TypeScript передусім',
        'Headless + готові стилі',
        'Готові компоненти',
        'Стан в URL, яким можна ділитися',
      ],
    },
    why: {
      heading: 'Чому «ReelKit»?',
      reelTerm: 'Reel',
      reelBody:
        '— вертикальні відеострічки, як в Instagram Reels і TikTok. По одному елементу за раз, свайп — і далі.',
      kitTerm: 'Kit',
      kitBody:
        '— модульний набір пакетів. Беріть headless-ядро для повного контролю, прив’язки до фреймворків для швидкого старту або готові оверлеї для відеоплеєрів і галерей зображень.',
    },
    api: {
      heading: 'Простий API',
      subheading: 'Кілька рядків коду — і все працює',
    },
    packages: {
      heading: 'Доступні пакети',
      subheading: 'Модульна екосистема — беріть те, що потрібно',
      coreBadge: 'Ядро',
      coreDescription:
        'Рушій слайдера без прив’язки до фреймворку — віртуалізація, жести, клавіатура, колесо миші, сигнали. Нуль залежностей.',
      bindings: {
        react: 'Компоненти, хуки та мости сигналів',
        angular: 'Автономні компоненти з реактивністю на сигналах',
        vue: 'Компоненти та композабли для Vue 3',
      },
    },
    cta: {
      heading: 'Готові почати?',
      body: 'Загляньте в документацію та приклади, щоб зібрати свій перший слайдер.',
      readDocs: 'Читати документацію',
    },
  },
};
