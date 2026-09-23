import type { Messages } from '../messages';

export const hi: Messages = {
  header: {
    docs: 'डॉक्स',
    search: 'खोजें',
    githubLabel: 'GitHub पर ReelKit',
    themeLabel: 'थीम बदलें',
    themeLight: 'लाइट',
    themeDark: 'डार्क',
    themeSystem: 'सिस्टम',
    menuLabel: 'नेविगेशन खोलें या बंद करें',
    languageLabel: 'भाषा बदलें',
  },
  nav: {
    sections: {
      overview: 'परिचय',
      core: 'Core',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'कंपोनेंट',
      resources: 'संसाधन',
    },
    items: {
      gettingStarted: 'शुरुआत',
      installation: 'इंस्टॉलेशन',
      ssr: 'SSR',
      guide: 'गाइड',
      apiReference: 'API रेफ़रेंस',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: 'समस्या निवारण',
      llms: 'AI / LLM इंटीग्रेशन',
      changelog: 'नया क्या है',
    },
    comingSoon: 'जल्द आ रहा है',
  },
  footer: {
    tagline:
      'Headless, वर्चुअलाइज़्ड और बिना dependency वाला स्लाइडर इंजन। 60 fps जेस्चर और सिर्फ़ 3 DOM नोड के साथ TikTok/Reels जैसी फ़ीड बनाएँ।',
    documentation: 'डॉक्स',
    gettingStarted: 'शुरुआत',
    installation: 'इंस्टॉलेशन',
    examples: 'उदाहरण',
    community: 'समुदाय',
    rights: (year) => `© ${year} ReelKit. All rights reserved.`,
    privacy: 'निजता',
    terms: 'शर्तें',
  },
  search: {
    placeholder: 'डॉक्स में खोजें…',
    empty: (query) => `"${query}" के लिए कोई नतीजा नहीं मिला`,
    pagesGroup: (category) => `पेज · ${category}`,
    sectionsGroup: (page) => `${page} · हिस्से`,
    navigate: 'चुनें',
    open: 'खोलें',
    close: 'बंद करें',
  },
  whatsNew: {
    title: 'नया क्या है',
    since: (count) => `आपकी पिछली विज़िट के बाद ${count} नई रिलीज़`,
    more: (count) => `+${count} और रिलीज़`,
    dismiss: 'हटाएँ',
    viewFull: 'बदलावों की पूरी सूची देखें',
    close: 'बंद करें',
    closeOverlay: 'नया क्या है वाली विंडो बंद करें',
  },
  nextSteps: {
    title: 'अगले कदम',
  },
  notFound: {
    title: 'पेज नहीं मिला',
    description:
      'आप जो पेज ढूँढ रहे हैं, वह मौजूद नहीं है या कहीं और चला गया है।',
    home: 'होम',
    docs: 'डॉक्स',
  },
  home: {
    meta: {
      title: 'ReelKit — React के लिए headless, वर्चुअलाइज़्ड स्लाइडर इंजन',
      description:
        'बिना dependency वाला, वर्चुअलाइज़्ड स्लाइडर इंजन। 60 fps जेस्चर और सिर्फ़ 3 DOM नोड के साथ TikTok/Reels जैसी वर्टिकल फ़ीड बनाएँ।',
    },
    hero: {
      taglineLead: '',
      taglineHighlight: 'TikTok/Instagram Reels जैसे',
      taglineTail: 'अनुभव के लिए सिंगल-आइटम स्लाइडर',
      subtitle:
        'फ़्रेमवर्क से स्वतंत्र, वर्चुअलाइज़्ड, टच सबसे पहले। वर्टिकल वीडियो फ़ीड, story व्यूअर और फ़ुलस्क्रीन गैलरी के लिए बना।',
      getStarted: 'शुरू करें',
      demoCaption: 'लाइव डेमो — तीरों से चलाएँ',
    },
    virtualization: {
      eyebrow: 'यह कैसे काम करता है',
      headingLead: 'पूरी फ़ीड।',
      headingHighlight: 'सिर्फ़ तीन स्लाइड।',
      intro:
        'आपकी फ़ीड में हज़ारों आइटम हो सकते हैं। Reel सिर्फ़ मौजूदा स्लाइड और उसके ठीक अगल-बगल वाले को ही माउंट रखता है।',
      steps: [
        {
          title: 'अगली स्वाइप तैयार रखना',
          description:
            'मौजूदा स्लाइड पूरी स्क्रीन घेरती है। एक पड़ोसी ऊपर इंतज़ार करता है, दूसरा नीचे।',
        },
        {
          title: 'फ़ीड में चलना',
          description:
            'अगले आइटम के लिए ऊपर स्वाइप करें, पिछले के लिए नीचे। माउंट की गई स्लाइड एक साथ चलती हैं।',
        },
        {
          title: 'सिर्फ़ बदला हुआ हिस्सा अपडेट करना',
          description:
            'स्लाइड के थमते ही, दायरे से बाहर गया आइटम हटा दिया जाता है और नया पड़ोसी माउंट हो जाता है। जो दायरे में बने रहे, वे अपनी जगह रहते हैं।',
        },
      ],
      footnote:
        'बिना लूप वाली फ़ीड के दोनों सिरों पर दो ही स्लाइड काफ़ी हैं। डेमो के किनारे तक पहुँचने पर माउंट की गिनती बदलते देखें।',
    },
    features: {
      heading: 'परफ़ॉर्मेंस के लिए बना',
      subheading:
        'वर्चुअलाइज़्ड रेंडरिंग, कोई dependency नहीं, 60 fps ट्रांज़िशन',
      highlights: [
        {
          stat: '3',
          unit: 'DOM में',
          title: 'वर्चुअलाइज़्ड',
          description:
            '10,000+ आइटम संभालता है। किसी भी समय सिर्फ़ 3 स्लाइड रेंडर होती हैं।',
        },
        {
          stat: '0',
          unit: 'dependency',
          title: 'कोई dependency नहीं',
          description:
            'कोई runtime dependency नहीं। gzip के बाद core लगभग 10.1 kB का है।',
        },
        {
          stat: '60',
          unit: 'fps',
          title: 'टच सबसे पहले',
          description:
            'momentum और snap points के साथ असली जैसे स्वाइप जेस्चर।',
        },
      ],
      more: [
        'तेज़ परफ़ॉर्मेंस',
        'कीबोर्ड नेविगेशन',
        'फ़्रेमवर्क से स्वतंत्र',
        'TypeScript सबसे पहले',
        'Headless + styled',
        'तैयार कंपोनेंट',
        'शेयर होने वाली URL स्टेट',
      ],
    },
    why: {
      heading: '"ReelKit" ही क्यों?',
      reelTerm: 'Reel',
      reelBody:
        '— Instagram Reels और TikTok जैसी वर्टिकल वीडियो फ़ीड। एक समय में एक कंटेंट, आगे बढ़ने के लिए स्वाइप करें।',
      kitTerm: 'Kit',
      kitBody:
        '— पैकेज का एक modular सेट। पूरे नियंत्रण के लिए headless core, जल्दी सेटअप के लिए फ़्रेमवर्क bindings, या वीडियो प्लेयर और इमेज गैलरी के लिए तैयार overlays इस्तेमाल करें।',
    },
    api: {
      heading: 'आसान API',
      subheading: 'बस कुछ लाइन के कोड से शुरू करें',
    },
    packages: {
      heading: 'उपलब्ध पैकेज',
      subheading: 'एक modular ecosystem — जो चाहिए, वही चुनें',
      coreBadge: 'Core',
      coreDescription:
        'फ़्रेमवर्क से स्वतंत्र स्लाइडर इंजन — वर्चुअलाइज़ेशन, जेस्चर, कीबोर्ड, व्हील, सिग्नल। कोई dependency नहीं।',
      bindings: {
        react: 'कंपोनेंट, hooks और signal bridges',
        angular: 'signal पर आधारित reactivity वाले standalone कंपोनेंट',
        vue: 'Vue 3 के लिए कंपोनेंट और composables',
      },
    },
    cta: {
      heading: 'शुरू करने के लिए तैयार हैं?',
      body: 'अपना पहला स्लाइडर बनाने के लिए डॉक्स और उदाहरण देखें।',
      readDocs: 'डॉक्स पढ़ें',
    },
  },
};
