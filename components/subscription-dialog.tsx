import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader
} from '@/components/ui/drawer'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { createStripeCheckoutSession } from '@/lib/actions'

import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

const tiers = [
  {
    name: '2 Credits',
    id: 'tier-basic',
    price: { amount: '$5' },
    description: 'Perfect for one-off use',
    features: ['2 credits', 'Access all image analysis features'],
    mostPopular: false,
    priceId: 'price_1QlZefF48pxgOJqAdj1GS16q',
    isSubscription: false
  },
  {

    name: 'Unlimited Credits',
    id: 'tier-unlimited',
    price: { amount: '$99' },
    description: 'Best for regular users',
    features: ['Unlimited credits', 'Full home assessment report', 'Priority support'],
    mostPopular: true,
    priceId: 'price_1QlZcQF48pxgOJqAMsMkP9Hj',
    isSubscription: true
  }
]

export default function SubscriptionDialog(
  props: React.ComponentProps<typeof DrawerPrimitive.Root>
) {
  async function handleCheckout(priceId: string, isSubscription: boolean) {
    try {
      const lineItems = [
        {
          price: priceId,
          quantity: 1
        }
      ]
  
      const { sessionId, checkoutError } =
        await createStripeCheckoutSession(lineItems, isSubscription)

      if (!sessionId || checkoutError) {
        throw new Error(checkoutError || 'Failed to create checkout session!')
      }

      const stripe = await stripePromise
      if (!stripe) throw new Error('Failed to load Stripe!')

      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        if (error instanceof Error) throw new Error(error.message)
      } else {
        throw error
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create checkout session!')
    }
  }
  return (
    <Drawer {...props}>
      <DrawerContent>
        <div className='mx-auto w-full max-w-3xl'>
          <DrawerHeader>
            <h2 className='text-center text-lg font-medium'>Choose your plan</h2>
          </DrawerHeader>
          <div className='isolate grid grid-cols-1 gap-8 px-3 md:grid-cols-2'>
            {tiers.map(tier => (
              <div
                key={tier.id}
                className={cn(
                  tier.mostPopular
                    ? 'ring-2 ring-emerald-600'
                    : 'ring-1 ring-gray-200',
                  'rounded-3xl p-8 xl:p-10'
                )}
              >
                <div className='flex items-center justify-between gap-x-4'>
                  <h3
                    id={tier.id}
                    className={cn(
                      tier.mostPopular ? 'text-emerald-600' : 'text-gray-900',
                      'text-lg font-semibold leading-8'
                    )}
                  >
                    {tier.name}
                  </h3>
                  {tier.mostPopular ? (
                    <p className='rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-emerald-600'>
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className='mt-4 text-sm leading-6 text-gray-600'>
                  {tier.description}
                </p>
                <p className='mt-6 flex items-baseline gap-x-1'>
                  <span className='text-4xl font-bold tracking-tight text-gray-900'>
                    {tier.price.amount}
                  </span>
                  {tier.isSubscription && (
                    <span className='text-sm font-semibold leading-6 text-gray-600'>
                      /year
                    </span>
                  )}
                </p>
                <button
                  onClick={() => handleCheckout(tier.priceId, tier.isSubscription)}
                  aria-describedby={tier.id}
                  className={cn(
                  tier.mostPopular
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
                    : 'text-emerald-600 ring-1 ring-inset ring-emerald-200 hover:ring-emerald-300',
                  'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
                )}
              >
                Buy now
              </button>
                <ul
                  role='list'
                  className='mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10'
                >
                  {tier.features.map(feature => (
                    <li key={feature} className='flex gap-x-3'>
                      <Check
                        className='h-6 w-5 flex-none text-emerald-600'
                        aria-hidden='true'
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            </div>
            <DrawerFooter></DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }