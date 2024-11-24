"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function GeneratingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/app/report');
    }, 5000); // 10 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Generating your report...</h1>
      <p>Please wait while we generate your personalized report.</p>
    </div>
  );
}

export default GeneratingPage;