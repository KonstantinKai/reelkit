import { Feed } from './feed';

export interface FeedItem {
  id: number;

  title: string;

  color: string;
}

// Simulates server-side data fetching (e.g. from a database or API)
async function getFeedItems(): Promise<FeedItem[]> {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    title: `Slide ${i + 1}`,
    color: `hsl(${(i * 37) % 360}, 70%, 65%)`,
  }));
}

export default async function Home() {
  const items = await getFeedItems();

  return (
    <main>
      <Feed items={items} />
    </main>
  );
}
