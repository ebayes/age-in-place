// app/app/[room]/page.tsx

import Home from '@/components/app/home';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export default async function Page({ params }: { params: { room: string } }) {
  const user = await currentUser();
  const roomId = parseInt(params.room);

  if (!user && roomId !== 0) {
    redirect('/app/0');
    return;
  }

  if (!user && roomId === 0) {
    // User is not logged in and accessing demo room
    return <Home />;
  }

  if (user) {
    // Create Supabase client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key
    );

    // Check if the room exists and belongs to the user
    const { data: assessment, error } = await supabaseAdmin
      .from('assessments')
      .select('id')
      .eq('id', roomId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      // If room doesn't exist or doesn't belong to the user, redirect or show an error
      redirect('/app');
      return;
    }

    // Room exists and belongs to the user
    return <Home />;
  }

  // Default case (shouldn't happen)
  redirect('/app/0');
}