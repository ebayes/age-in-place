import { ClerkProvider } from '@clerk/nextjs';
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
      </body>
      </html>
    </ClerkProvider>
  );
}