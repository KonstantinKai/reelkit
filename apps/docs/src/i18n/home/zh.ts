import type { HomeMessages } from '../home';

export const zh: HomeMessages = {
  meta: {
    title: 'ReelKit — 面向 React 的无头虚拟化滑动引擎',
    description:
      '零依赖的虚拟化滑动引擎。用 60fps 手势和仅 3 个 DOM 节点，构建 TikTok / Reels 风格的竖向信息流。',
  },
  hero: {
    taglineLead: '为',
    taglineHighlight: 'TikTok / Instagram Reels 风格',
    taglineTail: '体验打造的单条目滑动器',
    subtitle:
      '与框架无关、虚拟化、触摸优先。专为竖向视频流、Stories 浏览器和全屏画廊而生。',
    getStarted: '开始使用',
    demoCaption: '在线演示 —— 点箭头试试',
  },
  virtualization: {
    eyebrow: '工作原理',
    headingLead: '一整条信息流。',
    headingHighlight: '只有三张幻灯片。',
    intro:
      '你的信息流可以有成千上万条内容。Reel 只保留当前这张幻灯片和它紧邻的上下两张处于挂载状态。',
    steps: [
      {
        title: '备好下一次滑动',
        description:
          '当前这张幻灯片铺满视口。一张邻居在上方候着，另一张在下方。',
      },
      {
        title: '在信息流中移动',
        description:
          '向上滑看下一条，向下滑回上一条。已挂载的几张幻灯片一起移动。',
      },
      {
        title: '只更新变化的部分',
        description:
          '幻灯片停稳之后，移出范围的那条被卸载，新的邻居被挂载。仍在范围内的保持原样。',
      },
    ],
    footnote:
      '在不循环的信息流两端，只需要两张幻灯片。留意演示滑到边缘时，挂载数量的变化。',
  },
  features: {
    heading: '为性能而生',
    subheading: '虚拟化渲染、零依赖、60fps 过渡',
    highlights: [
      {
        stat: '3',
        unit: '个 DOM 节点',
        title: '虚拟化',
        description: '扛得住 10,000+ 条目，任何时刻只渲染 3 张幻灯片。',
      },
      {
        stat: '0',
        unit: '依赖',
        title: '零依赖',
        description: '没有任何运行时依赖，核心包 gzip 后约 10.1 kB。',
      },
      {
        stat: '60',
        unit: 'fps',
        title: '触摸优先',
        description: '原生手感的滑动手势，带惯性和吸附点。',
      },
    ],
    more: [
      '高性能',
      '键盘导航',
      '与框架无关',
      'TypeScript 优先',
      '无头 + 开箱样式',
      '现成组件',
      '可分享的 URL 状态',
    ],
  },
  why: {
    heading: '为什么叫 “ReelKit”？',
    reelTerm: 'Reel',
    reelBody:
      ' —— 指 Instagram Reels 和 TikTok 那样的竖向视频流。一次只看一条内容，滑动切换下一条。',
    kitTerm: 'Kit',
    kitBody:
      ' —— 指一组模块化的包。想要完全掌控就用无头的核心包，想快速接入就用框架绑定，想直接上手就用现成的视频播放器和图片画廊浮层。',
  },
  api: {
    heading: '简洁的 API',
    subheading: '几行代码就能跑起来',
  },
  packages: {
    heading: '可用的包',
    subheading: '模块化的生态 —— 需要什么装什么',
    coreBadge: '核心',
    coreDescription:
      '与框架无关的滑动引擎 —— 虚拟化、手势、键盘、滚轮、信号。零依赖。',
    bindings: {
      react: '组件、Hooks 与信号桥接',
      angular: '基于信号响应式的独立组件',
      vue: '面向 Vue 3 的组件与组合式函数',
    },
  },
  cta: {
    heading: '准备好开始了吗？',
    body: '看看文档和示例，动手做出你的第一个滑动器。',
    readDocs: '阅读文档',
  },
};
