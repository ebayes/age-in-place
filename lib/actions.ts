'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'

import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16'
})

export async function AddFreeCredits() {
  const user = await currentUser()

  if (!user) {
    return { success: false, error: 'You need to sign in first.' }
  }

  await clerkClient.users.updateUserMetadata(user.id, {
    publicMetadata: {
      credits: 3
    }
  })

  return { success: true, error: null }
}

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem

export async function createStripeCheckoutSession(
  lineItems: LineItem[],
  isSubscription: boolean // Add this parameter
) {
  const user = await currentUser()
  if (!user) {
    return { sessionId: null, checkoutError: 'You need to sign in first.' }
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL as string

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: lineItems,
    success_url: `${origin}/checkout?sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: origin,
    customer_email: user.emailAddresses[0].emailAddress
  })

  return { sessionId: session.id, checkoutError: null }
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: 'No session ID provided.' }
  }

  const user = await currentUser()
  if (!user) {
    return { success: false, error: 'You need to sign in first.' }
  }

  const previousCheckoutSessionIds = Array.isArray(
    user.publicMetadata.checkoutSessionIds
  )
    ? user.publicMetadata.checkoutSessionIds
    : []

  if (previousCheckoutSessionIds.includes(sessionId)) {
    return {
      success: true,
      error: null
    }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription']
  })

  // Determine if this was a subscription or one-time purchase
  const isSubscription = session.mode === 'subscription'

  await clerkClient.users.updateUserMetadata(user.id, {
    publicMetadata: {
      // Set credits based on the purchase type
      credits: isSubscription ? 'unlimited' : 10, // 'unlimited' for subscription, 10 for one-time
      checkoutSessionIds: [...previousCheckoutSessionIds, sessionId],
      stripeCustomerId: session.customer,
      // Only include subscription data if it's a subscription
      ...(isSubscription && {
        stripeSubscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id,
        stripeCurrentPeriodEnd:
          typeof session.subscription === 'string'
            ? undefined
            : session.subscription?.current_period_end
      })
    }
  })

  return { success: true, error: null }
}

export async function manageSubscription() {
  const user = await currentUser()

  if (!user) {
    return { url: null, error: 'You need to sign in first.' }
  }

  const stripeCustomerId = user.publicMetadata?.stripeCustomerId

  if (!stripeCustomerId) {
    return { url: null, error: 'No associated Stripe customer found.' }
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL as string

  try {
    const { url } = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId as string,
      return_url: `${origin}/profile`
    })

    return { url, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}