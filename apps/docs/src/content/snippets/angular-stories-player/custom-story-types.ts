// The player is generic over the story type, so a feed can carry whatever
// extra fields a slide template needs.
interface PromoStory extends StoryItem {
  title?: string;
  ctaText?: string;
}

const groups: StoriesGroup<PromoStory>[] = [
  {
    author: { id: 'shop', name: 'Shop', avatar: '/shop.jpg' },
    stories: [
      { id: 'p1', mediaType: 'image', src: '/promo.jpg', title: 'Flash Sale', ctaText: 'Shop now' },
    ],
  },
];
