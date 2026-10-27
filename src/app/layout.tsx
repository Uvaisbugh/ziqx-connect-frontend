import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import '@ziqx/react-comps/styles.css';
import { ScrollChrome } from '@/components/shell/ScrollChrome';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ziqx Connect - WhatsApp CRM & Conversations',
  description: 'WhatsApp CRM and conversations for Ziqx',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} text-ziqx-dark antialiased font-sans select-none overflow-x-hidden`}
      >
        <ScrollChrome />
        {children}
      </body>
    </html>
  );
}
