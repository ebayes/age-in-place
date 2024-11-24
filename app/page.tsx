"use client"

import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

function Page() {

  return (
    <div className='bg-white h-screen w-screen p-[18px] '>
      <div className='flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#8BAACD] to-[#F9DEBD] rounded-[8px]'>
      <div className='relative z-20 flex flex-col items-start justify-between h-full w-full p-[36px]'>
        <div className='flex flex-col gap-[36px] w-full'>
          <div className='flex flex-row w-full justify-between'>
            <div className='flex flex-row gap-[15px] items-center'>
              <p className='text-white text-[21px]'>ageinplace.io</p>
              <Globe className='w-[24px] h-[24px] text-white' />
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
          <div>
            <Link href="/app">
              <Button size='xl' className='rounded-full'>
                Try demo now
              </Button>
            </Link>
          </div>
        </div>
        <div className='flex flex-col w-[601px] text-white'>
          Discover how simple changes can make your home safer and more
          comfortable, enhancing your quality of life.
          <br/><br/>
          Empowering you to live independently — one step at a time.
        </div>
      </div>
    </div>
    </div>
  )
}

export default Page