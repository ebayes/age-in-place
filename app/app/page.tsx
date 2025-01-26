// app/app/page.tsx

import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    // User is not logged in, redirect to demo room
    redirect('/app/0');
    return;
  }

  // Create a Supabase client using a service role key (from environment variables)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
  );

  // Fetch the user's rooms
  const { data: rooms, error } = await supabaseAdmin
    .from('assessments')
    .select('id')
    .eq('user_id', user.id)
    .order('id');

  if (error) {
    redirect('/app/0');
    return;
  }

  if (rooms && rooms.length > 0) {
    redirect(`/app/${rooms[0].id}`);
  } else {
    redirect('/app/new');
  }
}