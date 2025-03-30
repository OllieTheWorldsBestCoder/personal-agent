import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal AI Agent',
  description: 'Your personal AI assistant for email management and news updates',
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