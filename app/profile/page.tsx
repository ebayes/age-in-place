'use client'

import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { manageSubscription } from '@/lib/actions'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'


export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  // Show nothing while checking auth status
  if (!isLoaded || !isSignedIn) {
    return null
  }

  const credits = user?.publicMetadata?.credits
  const hasUnlimitedCredits = credits === 'unlimited'
  const stripeCustomerId = user?.publicMetadata?.stripeCustomerId
  const stripeSubscriptionId = user?.publicMetadata?.stripeSubscriptionId

  async function handleManageSubscription() {
    try {
      setIsLoading(true)
      const { url, error } = await manageSubscription()
      
      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='py-24'>
      <div className='container max-w-3xl'>
        <h1 className='text-3xl font-bold'>Profile</h1>
        
        <div className='mt-8 rounded-lg border p-6'>
          <h2 className='text-xl font-semibold'>Subscription Details</h2>
          
          <div className='mt-4 space-y-4'>
            <div>
              <h3 className='font-medium'>Current Plan</h3>
              <p className='text-sm text-gray-500'>
                {hasUnlimitedCredits ? 'Unlimited Plan' : 'Pay As You Go'}
              </p>
            </div>

            <div>
              <h3 className='font-medium'>Credits</h3>
              <p className='text-sm text-gray-500'>
                {hasUnlimitedCredits ? 'Unlimited' : credits || 0}
              </p>
            </div>

            {stripeCustomerId && (
              <div>
                <Button
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {stripeSubscriptionId ? 'Manage Subscription' : 'View Payment History'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}