import { Rajdhani, Orbitron } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import Navbar from '@/components/ui/Navbar';
import CustomCursor from '@/components/ui/CustomCursor';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import ToastContainer from '@/components/ui/ToastContainer';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata = {
  title: 'Yu-Gi-Oh! Ultimate Card Explorer — AAA Card Database & Deck Builder',
  description:
    'The most immersive Yu-Gi-Oh! card database ever created. Explore 12,000+ cards in stunning 3D with holographic effects, build decks, and discover powerful combos.',
  keywords: [
    'Yu-Gi-Oh', 'card database', 'deck builder', 'YGO', 'duel monsters',
    'card explorer', '3D cards', 'holographic',
  ],
  openGraph: {
    title: 'Yu-Gi-Oh! Ultimate Card Explorer',
    description: 'The most immersive Yu-Gi-Oh! card database ever created.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0014',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${orbitron.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#04000d] text-white antialiased overflow-x-hidden">
        <QueryProvider>
          <CustomCursor />
          <AnimatedBackground />
          <Navbar />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
