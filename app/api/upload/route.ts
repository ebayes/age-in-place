import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[] // Changed from 'file' to 'files'
    
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const { data, error } = await supabase
          .storage
          .from('rooms')
          .upload(`${Date.now()}-${file.name}`, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          throw error
        }
        return data.path
      })
    )

    return NextResponse.json({ 
      data: {
        paths: uploadResults // Return array of paths instead of single path
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}