"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Markdown from '@/components/markdown'  // Import the new markdown component
import Link from 'next/link'

function Page() {
  const [markdown, setMarkdown] = useState("")

  useEffect(() => {
    fetch("/privacy.md")
      .then((res) => res.text())
      .then((text) => setMarkdown(text))
      .catch((error) => console.error("Error fetching markdown:", error))
  }, [])

  return (
    <div className='bg-white h-screen w-screen p-[18px]'>
      <div className='flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-[#8BAACD] to-[#F9DEBD] rounded-[8px]'>
        <div className='relative z-20 flex flex-col items-start justify-between h-full w-full p-[36px]'>
          <div className='flex flex-col gap-[36px] w-full'>
            <div className='flex flex-row w-full justify-between'>
              
                <Link href="/" className='flex flex-row gap-[15px] items-center'>
                <p className='text-white text-[21px]'>ageinplace.io</p>
                <Image src="/logo_white.svg" alt="ageinplace.io logo" width={24} height={24} />
                <p className='text-white text-[14px] font-medium'>
                  A smarter approach to aging in place
                </p>
                </Link>
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
            <div className='w-[697px] flex flex-col gap-3'>
              <p className='text-white text-[14px]'>Last Updated: February 10 2025</p>
              <p className='text-white text-[36px] leading-[32px]'>
                Website Privacy Policy
              </p>
            </div>
            <div id="markdown">
              {markdown ? <Markdown content={markdown} /> : "Loading..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page