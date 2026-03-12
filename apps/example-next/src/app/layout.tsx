import './global.css';

export const metadata = {
  title: 'Reelkit Next.js SSR Example',
  description: '@reelkit/react with Next.js server-side rendering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
