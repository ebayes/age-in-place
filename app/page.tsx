"use client"

import { Button } from '@/components/ui/button'
// import { Umbrella } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { ChevronRight } from '@/components/icons'
import { cn } from '@/lib/utils'
import HeroVideoDialog from "@/components/ui/hero-video-dialog";
import Image from 'next/image'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ONPATH_ANNOUNCEMENT_KEY = 'onpath-launch-announcement-dismissed'

function Page() {
  const [showOnPathAnnouncement, setShowOnPathAnnouncement] = useState(false)

  useEffect(() => {
    setShowOnPathAnnouncement(
      window.localStorage.getItem(ONPATH_ANNOUNCEMENT_KEY) !== 'true',
    )
  }, [])

  const handleAnnouncementOpenChange = (open: boolean) => {
    setShowOnPathAnnouncement(open)

    if (!open) {
      window.localStorage.setItem(ONPATH_ANNOUNCEMENT_KEY, 'true')
    }
  }

  return (
    <div className='bg-white h-screen w-screen p-[18px] '>
      <Dialog open={showOnPathAnnouncement} onOpenChange={handleAnnouncementOpenChange}>
        <DialogContent className="max-w-[560px] border-0 bg-white p-0 text-gray-900 shadow-2xl sm:rounded-[28px]">
          <div className="overflow-hidden rounded-[28px]">
            <div className="bg-gradient-to-r from-[#8BAACD] to-[#F9DEBD] px-8 py-7 text-white">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                A heartfelt update
              </p>
              <DialogHeader className="mt-3 text-left">
                <DialogTitle className="text-3xl font-semibold leading-tight">
                  AgeInPlace is becoming OnPath
                </DialogTitle>
                <DialogDescription className="text-base leading-7 text-white/90">
                  Thank you for being part of the AgeInPlace community as we
                  prepare to launch our new experience under the name OnPath.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-5 px-8 py-7">
              <p className="text-[15px] leading-7 text-gray-700">
                We are grateful for every customer, caregiver, and visitor who
                has trusted us to help make homes safer and more comfortable.
                This next chapter is designed to better support you and the
                people you care about.
              </p>
              <div className="rounded-2xl border border-[#8BAACD]/30 bg-[#8BAACD]/10 p-5">
                <p className="text-[15px] leading-7 text-gray-800">
                  If you are an existing customer and have not yet been
                  contacted about this transition, please reach out to{" "}
                  <a
                    href="mailto:Nick@ageinplace.com"
                    className="font-semibold text-[#4f7198] underline underline-offset-4"
                  >
                    Nick@ageinplace.com
                  </a>
                  .
                </p>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button size="xl" className="bg-[#4f7198] hover:bg-[#43617f]">
                    Thanks for the update
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className='flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#8BAACD] to-[#F9DEBD] rounded-[8px]'>
      <div className='relative z-20 flex flex-col items-start justify-between h-full w-full p-[36px]'>
        <div className='flex flex-col gap-[36px] w-full'>
          <div className='flex flex-row w-full justify-between'>
            <div className='flex flex-row gap-[15px] items-center'>
              <p className='text-white text-[21px]'>ageinplace.io</p>
              {/* <Umbrella className='w-[24px] h-[24px] text-white' />*/}
              <Image src="/logo_white.svg" alt="ageinplace.io logo" width={24} height={24} />
              <p className='text-white text-[14px] font-medium'>A smarter approach to aging in place</p>
            </div>
            <div className='flex flex-row gap-[15px] items-center'>
            <SignedIn>
          <UserButton afterSignOutUrl='/' />
        </SignedIn>

        <SignedOut>
          <SignInButton mode='modal'>
            <Button variant='secondary'>
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
            </div>
          </div>
          <div className='w-[697px]'>
            <p className='text-white text-[44px] leading-[40px]'>
              From photo to personalized recommendations in seconds. Create a safer home today.
            </p>
          </div>
          <div className='flex flex-col items-start justify-start gap-2'>
            <Link href="/app">
              <AnimatedGradientText className="text-lg"> 
                <SignedIn>
                  <span
                    className={cn(
                      `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                    )}
                  >
                    Go to account
                  </span>
                </SignedIn>
                <SignedOut>
                  <span
                    className={cn(
                      `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                    )}
                  >
                    Get started for free
                  </span>
                </SignedOut>
                <ChevronRight size="sm" className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedGradientText>
            </Link>
            <div className='flex flex-row gap-3'>
            <Link href="/terms">
              <p className='text-white text-[14px] hover:underline'>Terms of use</p>
            </Link>
            <Link href="/privacy">
              <p className='text-white text-[14px] hover:underline'>Privacy policy</p>
            </Link>
            </div>
          </div>
          
        </div>
        <div className='flex flex-row w-full justify-between items-end'>
          <div className='flex flex-col w-[601px] text-white'>
            Discover how simple changes can make your home safer and more
            comfortable, enhancing your quality of life.
            <br/><br/>
            Over 10x cheaper and 100x faster than traditional home assessments.
            <br/>
            Save $00s today
          </div>
          <div className="relative w-[601px] flex items-end"> {/* Added flex and items-end */}
          <HeroVideoDialog
              className="dark:hidden block"
              animationStyle="from-center"
              videoSrc="/video.mp4"
              thumbnailSrc="https://bjuozchwgphxqrkjekpq.supabase.co/storage/v1/object/public/rooms/screenshot.png"
              thumbnailAlt="Hero Video"
            />
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="from-center"
              videoSrc="/video.mp4"
              thumbnailSrc="https://bjuozchwgphxqrkjekpq.supabase.co/storage/v1/object/public/rooms/screenshot.png"
              thumbnailAlt="Hero Video"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Page