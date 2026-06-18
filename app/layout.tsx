import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignInUrl='/app' afterSignUpUrl='/app' >
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {children}
        <Analytics />
      </body>
      </html>
    </ClerkProvider>
  );
}