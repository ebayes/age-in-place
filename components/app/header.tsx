"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser, useClerk } from '@clerk/nextjs'
import { Umbrella, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { AddFreeCredits } from '@/lib/actions'
import SubscriptionDialog from '@/components/subscription-dialog'
import { Badge } from '@/components/ui/badge'
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { session } = useClerk()
  const credits = user?.publicMetadata?.credits
  const newUser = typeof credits === 'undefined'
  const paidUser = user?.publicMetadata?.stripeCustomerId
  const hasUnlimitedCredits = credits === 'unlimited'
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const client = useSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (pathname.includes('/report')) return 'report'
    return 'rooms'
  })

  useEffect(() => {
    if (pathname.includes('/report')) {
      setSelectedTab('report')
    } else if (pathname.includes('/app')) {
      setSelectedTab('rooms')
    }
  }, [pathname])

  useEffect(() => {
    if (session) {
      session.reload()
    }
  }, [credits, session])

  async function handleReportClick(e: React.MouseEvent) {
    e.preventDefault();
    
    if (!user) {
      router.push('/app/report');
      return;
    }
    
    if (!client) return;  
  
    const { data, error } = await client
      .from('tasks')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
  
    if (error) {
      //  console.error('Error fetching tasks:', error);
      return;
    }
    setSelectedTab("report");
  
    if (data && data.length > 0) {
      router.push('/app/report');
    } else {
      router.push('/app/onboarding');
    }
  }

  async function handleClick() {
    const { success, error } = await AddFreeCredits()

    if (error) {
      toast.error(error)
      return
    }

    toast.success('3 credits added successfully.')
    // session?.reload()
  }

  return (
    <header className="h-[52px] flex justify-between items-center border-b bg-background">
      <div className="w-[52px] h-[52px] flex items-center justify-center border-r">
        <Link href='/'>
          <Umbrella
            className="w-[24px] h-[24px] text-gray-700 cursor-pointer"
          />
        </Link>
      </div>        
      <div className="flex items-center gap-[15px] px-[18px] flex-1">
        <p className="text-gray-700 text-[16px] font-medium">ageinplace.io</p>
        <div className="flex items-center gap-[8px]">
        {[
          { id: "rooms", label: "Rooms" },
          { id: "report", label: "Report" },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "report" ? "#" : "/app"}
            onClick={(e) => {
              if (tab.id === "report") {
                handleReportClick(e);
              } else {
                setSelectedTab(tab.id);
              }
            }}
            className={`cursor-pointer px-3 py-2 text-[14px] font-light transition-colors relative ${
              selectedTab === tab.id
                ? "text-foreground"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            {tab.label}
              {tab.id === "report" && (
                <Badge
                  color="purple"
                  className="absolute bottom-4 left-14"
                  size="sm"
                >
                  Create
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
      
      <div className='flex items-center gap-[12px] px-[18px]'>
        {isSignedIn && newUser && (
          <Button
            size='sm'
            variant='outline'
            className='border-emerald-500'
            onClick={handleClick}
          >
            Redeem 3 Free Credits
          </Button>
        )}
        {isSignedIn ? (
          <>
            {typeof credits === 'number' && (
              <>
                <div className='flex items-center gap-2'>
                  <Zap className='h-5 w-5 text-emerald-500' />
                  <span className='text-sm text-zinc-500'>Credits:</span>
                  <span className='font-medium'>{credits}</span>
                </div>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => setSubscriptionDialogOpen(true)}
                >
                  Get more credits
                </Button>
              </>
            )}
            {hasUnlimitedCredits && (
              <div className='flex items-center gap-2'>
                <Zap className='h-5 w-5 text-emerald-500' />
                <span className='text-sm text-zinc-500'>Credits:</span>
                <span className='font-medium'>Unlimited</span>
              </div>
            )}
          </>
        ) : (
          <div className='flex items-center gap-2'>
            <Zap className='h-5 w-5 text-emerald-500' />
            <span className='text-sm text-zinc-500'>Credits:</span>
            <span className='font-medium'>0</span>
          </div>
        )}
        <SignedIn>
          <UserButton afterSignOutUrl='/' />
        </SignedIn>

        <SignedOut>
          <SignInButton mode='modal'>
            <Button>
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SubscriptionDialog
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
        />
      </div>
    </header>
  )
}