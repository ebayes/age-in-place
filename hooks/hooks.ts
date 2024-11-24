import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { UserResource } from '@clerk/types';

export const useAssessments = (
  client: SupabaseClient | null,
  user: UserResource | null,
  isSignedIn: boolean,
  isLoaded: boolean
) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRoomName, setCurrentRoomName] = useState<string>('Demo Assessment');
  const [allImages, setAllImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const defaultImages = ['/test_1.jpg', '/test_2.png', '/test_3.jpg'];
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAssessments([]);
      setAllImages(defaultImages);
      setSelectedImageIndex(0);
      setLoading(false);
      return;
    }

    async function loadAssessments() {
      setLoading(true);
      try {
        const roomId = parseInt(pathname.split('/').pop() || '0');
        if (!client) return;

        const { data, error } = await client
          .from('assessments')
          .select('*')
          .eq('id', roomId)
          .eq('user_id', user?.id)
          .single();

        if (error) throw error;

        if (data) {
          setCurrentRoomName(data.room_name);
          setAssessments([data]);
          const images = data.images || [];
          setAllImages(images);
          setSelectedImageIndex(images.length > 0 ? 0 : null);
        } else {
          setCurrentRoomName('Demo Assessment');
          setAssessments([]);
          setAllImages([]);
          setSelectedImageIndex(null);
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
        setAssessments([]);
        setAllImages([]);
        setSelectedImageIndex(null);
      } finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, [isLoaded, isSignedIn, user, pathname, client]);

  return {
    assessments,
    loading,
    currentRoomName,
    allImages,
    setAllImages,
    selectedImageIndex,
    setSelectedImageIndex,
  };
};