import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import '../globals.css'
import Header from '@/components/app/header'
import SideNavbar from '@/components/app/side-bar'
import { AssessmentsProvider } from '@/contexts/assessments'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "ageinplace.io | A smarter approach to aging in place.",
  description: "A smarter approach to aging in place.",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AssessmentsProvider>
    <html lang='en'>
    <body className={inter.className}>
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <SideNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster position="top-center" theme='light' richColors closeButton />
    </body>
  </html>
  </AssessmentsProvider>
  )
}