import type { HomeMessages } from '../home';

export const ja: HomeMessages = {
  meta: {
    title: 'ReelKit — React 向けのヘッドレスで仮想化されたスライダーエンジン',
    description:
      '依存関係のない、仮想化されたスライダーエンジンです。60 fps のジェスチャーと 3 つの DOM ノードだけで、TikTok／Reels 風の縦型フィードを作れます。',
  },
  hero: {
    taglineLead: '',
    taglineHighlight: 'TikTok／Instagram Reels 風',
    taglineTail: 'の体験のための、1 アイテムずつ表示するスライダー',
    subtitle:
      'フレームワークに依存せず、仮想化され、タッチを優先します。縦型の動画フィード、ストーリービューアー、フルスクリーンのギャラリーのために作られています。',
    getStarted: 'はじめる',
    demoCaption: 'ライブデモ — 矢印で操作できます',
  },
  virtualization: {
    eyebrow: 'しくみ',
    headingLead: 'フィード全体を。',
    headingHighlight: 'スライドは 3 枚だけ。',
    intro:
      'フィードには何千ものアイテムを入れられます。Reel がマウントしておくのは、現在のスライドとその前後の隣だけです。',
    steps: [
      {
        title: '次のスワイプに備えておく',
        description:
          '現在のスライドが画面を埋めます。隣が 1 枚上に、もう 1 枚が下に控えています。',
      },
      {
        title: 'フィードを移動する',
        description:
          '上にスワイプすれば次のアイテム、下にスワイプすれば前のアイテムへ。マウント済みのスライドは一緒に動きます。',
      },
      {
        title: '変わったところだけ更新する',
        description:
          'スライドが落ち着くと、範囲から外れたアイテムが取り除かれ、新しい隣がマウントされます。範囲に残ったものはそのままです。',
      },
    ],
    footnote:
      'ループしないフィードの両端では、スライドは 2 枚で足ります。デモが端に着いたとき、マウント数が変わるのを見てみてください。',
  },
  features: {
    heading: 'パフォーマンスのための設計',
    subheading: '仮想化された描画、依存関係ゼロ、60 fps のトランジション',
    highlights: [
      {
        stat: '3',
        unit: 'DOM 内',
        title: '仮想化',
        description:
          '10,000 件を超えるアイテムを扱えます。描画されるスライドは常に 3 枚だけです。',
      },
      {
        stat: '0',
        unit: '依存関係',
        title: '依存関係ゼロ',
        description:
          '実行時の依存関係はありません。コアは gzip 後で約 10.1 kB です。',
      },
      {
        stat: '60',
        unit: 'fps',
        title: 'タッチ優先',
        description:
          '慣性とスナップポイントのある、ネイティブなスワイプジェスチャー。',
      },
    ],
    more: [
      '高いパフォーマンス',
      'キーボード操作',
      'フレームワークに依存しない',
      'TypeScript ファースト',
      'ヘッドレス + スタイル付き',
      'すぐ使えるコンポーネント',
      '共有できる URL の状態',
    ],
  },
  why: {
    heading: 'なぜ「ReelKit」？',
    reelTerm: 'Reel',
    reelBody:
      '— Instagram Reels や TikTok のような縦型の動画フィード。一度に 1 つのコンテンツを表示し、スワイプで次へ進みます。',
    kitTerm: 'Kit',
    kitBody:
      '— モジュール式のパッケージのセット。すべてを制御したいならヘッドレスのコアを、すばやく始めたいならフレームワークのバインディングを、動画プレイヤーや画像ギャラリーにはすぐ使えるオーバーレイを使えます。',
  },
  api: {
    heading: 'シンプルな API',
    subheading: '数行のコードで動き始めます',
  },
  packages: {
    heading: '利用できるパッケージ',
    subheading: 'モジュール式のエコシステム — 必要なものだけを選べます',
    coreBadge: 'Core',
    coreDescription:
      'フレームワークに依存しないスライダーエンジン — 仮想化、ジェスチャー、キーボード、ホイール、シグナル。依存関係はゼロです。',
    bindings: {
      react: 'コンポーネント、フック、シグナルのブリッジ',
      angular:
        'シグナルベースのリアクティビティを持つスタンドアロンコンポーネント',
      vue: 'Vue 3 のコンポーネントとコンポーザブル',
    },
  },
  cta: {
    heading: 'さっそく始めましょう',
    body: 'ドキュメントと例を見て、最初のスライダーを作ってみてください。',
    readDocs: 'ドキュメントを読む',
  },
};
