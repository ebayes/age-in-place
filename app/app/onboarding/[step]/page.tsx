import OnboardingStepPage from '@/components/onboarding/onboarding';

export default function Page({ params }: { params: { step: string } }) {
  return <OnboardingStepPage step={params.step} />;
}