'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useSession, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { RightPanel } from './right-panel';
import { Header } from './room/header';
import { MainImageDisplay } from './room/main-image';
import { ImageCarousel } from './room/image-carousel';
import { EmptyState } from './room/empty-state';
import { Annotation, Modification } from '@/types/types';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from './room/delete-modal';
import { useAssessmentsContext } from '@/contexts/assessments';
import { usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Skeleton } from '../ui/skeleton';
import { dummyImages, dummyAnnotations } from '@/data/dummy';
import { useOnboarding } from '@/contexts/onboard'

interface HomeProps {
  demoMode?: boolean;
}

export default function Home({ demoMode = false }: HomeProps) {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { session } = useSession();
  const { openSignIn } = useClerk();
  const {
    assessments,
    loading: assessmentsLoading,
    refreshAssessments,
  } = useAssessmentsContext();
  const [processing, setProcessing] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [annotations, setAnnotations] = useState<Annotation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const maxWidth = 1000;
  const maxHeight = 500;
  const fallbackImageUrl = '/mountains.jpg';
  const pathname = usePathname();
  const roomId = parseInt(pathname.split('/').pop() || '0');
  const currentAssessment = assessments.find((a) => a.id === roomId);
  const currentRoomName = currentAssessment ? currentAssessment.room_name : 'Demo Assessment';
  const [allImages, setAllImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [annotationsList, setAnnotationsList] = useState<Annotation[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [allProductIds, setAllProductIds] = useState<string[]>([]);
  const [currentProductIds, setCurrentProductIds] = useState<string[]>([]);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [productCounts, setProductCounts] = useState<{ [productId: string]: number }>({});
  const supabaseClient = useSupabaseClient();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { onboardingStep, setOnboardingStep } = useOnboarding()
  const supabaseStorageClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

useEffect(() => {
  if (demoMode) {
    // Load dummy data when in demo mode
    setAllImages(dummyImages);
    setSelectedImageIndex(0);
    setAnnotationsList(dummyAnnotations as Annotation[]);

    // Calculate product counts and IDs from dummy annotations
    const counts: { [productId: string]: number } = {};
    const allProductIdsSet = new Set<string>();

    dummyAnnotations.forEach((annotation) => {
      if (annotation.modifications) {
        annotation.modifications.forEach((modification) => {
          if (modification.product_id) {
            counts[modification.product_id] = (counts[modification.product_id] || 0) + 1;
            allProductIdsSet.add(modification.product_id);
          }
        });
      }
    });

    setAllProductIds(Array.from(allProductIdsSet));
    setProductCounts(counts);

    return;
  }
  if (currentAssessment && currentAssessment.images.length > 0) {
    setAllImages(currentAssessment.images);
    setSelectedImageIndex(0);
    setAnnotationsList(currentAssessment.annotations || []);

    const allProductIdsSet = new Set<string>();
    const counts: { [productId: string]: number } = {};
    const annotations = currentAssessment.annotations || [];

    annotations.forEach((annotation) => {
      if (annotation.modifications) {
        annotation.modifications.forEach((modification) => {
          if (modification.product_id) {
            counts[modification.product_id] = (counts[modification.product_id] || 0) + 1;
            allProductIdsSet.add(modification.product_id); 
          }
        });
      }
    });

    setAllProductIds(Array.from(allProductIdsSet));
    setProductCounts(counts);
  } else {
    setAllImages([]);
    setSelectedImageIndex(null);
    setAnnotationsList([]);
    setAllProductIds([]);
    setCurrentProductIds([]);
    setProductCounts({});
  }
  }, [demoMode, currentAssessment]);

  const currentAnnotations = selectedImageIndex !== null ? annotationsList[selectedImageIndex] : null;

  useEffect(() => {
    if (selectedImageIndex !== null && annotationsList.length > selectedImageIndex) {
      const currentAnnotation = annotationsList[selectedImageIndex];
      const currentIdsSet = new Set<string>();
      if (currentAnnotation && currentAnnotation.modifications) {
        currentAnnotation.modifications.forEach((modification) => {
          if (modification.product_id) {
            currentIdsSet.add(modification.product_id);
          }
        });
      }
      setCurrentProductIds(Array.from(currentIdsSet));
    } else {
      setCurrentProductIds([]);
    }
  }, [selectedImageIndex, annotationsList]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabaseClient) {
      toast.error('Database connection not available');
      return;
    }
  
    setProcessing(true);
  
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
  
      const { error: uploadError } = await supabaseStorageClient.storage
        .from('rooms')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      const { data } = supabaseStorageClient.storage.from('rooms').getPublicUrl(filePath);
      const imageUrl = data.publicUrl;

    const base64Image = await readFileAsBase64(file);
    const productIdsArray = allProductIds;
    const productIdsString = productIdsArray.join(', ');

    const visionResponse = await fetch('/api/vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        product_ids: productIdsString,
      }),
    });

    if (!visionResponse.ok) {
      throw new Error('Error from Vision API');
    }

    const visionData = await visionResponse.json();
    const modifications = visionData.modifications;

    // Prepare prompt for Dino API
    const partDescriptions = modifications.map((mod: Modification) => mod.location).join(', ');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', partDescriptions);

    // Call Dino API
    const dinoResponse = await fetch('/api/dino', {
      method: 'POST',
      body: formData,
    });

    if (!dinoResponse.ok) {
      throw new Error('Error from Dino API');
    }

    const dinoData = await dinoResponse.json();

    const annotation: Annotation = {
      boundingBoxes: dinoData.jsonData?.boundingBoxes || [],
      modifications: modifications,
      frameWidth: dinoData.jsonData?.frameWidth || 0,
      frameHeight: dinoData.jsonData?.frameHeight || 0,
      resultImageUrl: dinoData.resultImageUrl || '',
    };

    setAllImages((prev) => [imageUrl, ...prev]);
    setSelectedImageIndex(0);
    setAnnotationsList((prev) => [annotation, ...prev]);

    const { error: updateError } = await supabaseClient
      .from('assessments')
      .update({
        images: [imageUrl, ...allImages],
        annotations: [annotation, ...annotationsList],
      })
      .eq('id', roomId);

    if (updateError) throw updateError;

    toast.success('Image uploaded successfully.');
  } catch (error) {
    //  console.error('Error uploading image:', error);
    toast.error('Failed to upload image.');
  } finally {
    setProcessing(false);
  }
};

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const handleDeleteImage = async (index: number) => {
  if (!currentAssessment) return;
  if (!supabaseClient) {
    toast.error('Database connection not available');
    return;
  }

  setProcessing(true);

  try {
    const imageUrl = allImages[index];
    const fileName = imageUrl.split('/').pop();

    if (!fileName) {
      throw new Error('Invalid file name');
    }

    // Delete the image from Supabase Storage
    const { error: deleteError } = await supabaseStorageClient.storage
      .from('rooms')
      .remove([fileName]);

    if (deleteError) throw deleteError;

    // Remove the image and associated annotations from state
    const newAllImages = [...allImages];
    newAllImages.splice(index, 1);

    const newAnnotationsList = [...annotationsList];
    newAnnotationsList.splice(index, 1);

    setAllImages(newAllImages);
    setAnnotationsList(newAnnotationsList);

    // Adjust selectedImageIndex
    if (newAllImages.length === 0) {
      // No images left
      setSelectedImageIndex(null);
    } else if (index < newAllImages.length) {
      // Deleted image is not the last one
      setSelectedImageIndex(index);
    } else {
      // Deleted image was the last one
      setSelectedImageIndex(newAllImages.length - 1);
    }

    const { error: updateError } = await supabaseClient
      .from('assessments')
      .update({
        images: newAllImages,
        annotations: newAnnotationsList,
      })
      .eq('id', currentAssessment.id);

    if (updateError) throw updateError;

    toast.success('Image deleted successfully.');
  } catch (error) {
    //  console.error('Error deleting image:', error);
    toast.error('Failed to delete image.');
  } finally {
    setProcessing(false);
  }
};

  const handleSubmit = async () => {
    if (!image) return;
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (!supabaseClient) {
      toast.error('Database connection not available');
      return;
    }

    setProcessing(true);

    try {
      const { data: roomData, error } = await supabaseClient
        .from('rooms')
        .select('product_ids')
        .eq('room_name', currentRoomName)
        .single();

      if (error || !roomData) {
        //  console.error('Error fetching product_ids:', error);
        toast.error('Failed to fetch product IDs.');
        setProcessing(false);
        return;
      }

      const productIdsArray = roomData.product_ids; 
      const productIdsString = productIdsArray.join(', ');

      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(',')[1]

        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            product_ids: productIdsString,
          }),
        })

        if (!response.ok) {
          const status = response.status;
          const errorText = await response.text(); 

          switch (status) {
            case 401:
              openSignIn();
              break;
            case 402:
              toast.error('You have no credits left.', {
                action: {
                  label: 'Get more',
                  onClick: () => setSubscriptionDialogOpen(true)
                }
              });
              break;
            default:
              toast.error(errorText || 'Something went wrong!');
              break;
          }
          return;
        }

        const data = await response.json()
        setModifications(data.modifications)

        const partDescriptions = data.modifications
          .map((mod: Modification) => mod.location)
          .join(', ')

        const formData = new FormData()
        formData.append('image', image)
        formData.append('prompt', partDescriptions)

        const dinoResponse = await fetch('/api/dino', {
          method: 'POST',
          body: formData,
        })

        if (dinoResponse.ok) {
          const dinoData = await dinoResponse.json()

          const annotation: Annotation = {
            boundingBoxes: dinoData.jsonData?.boxes || [],
            modifications: data.modifications,
            frameWidth: dinoData.jsonData?.frame_width || 0,
            frameHeight: dinoData.jsonData?.frame_height || 0,
            resultImageUrl: dinoData.resultImageUrl || ''
          }

          setAnnotations(annotation)
        }

        session?.reload()
      }
    } catch (error) {
      //  console.error('Error:', error)
      toast.error('Failed to process image')
    } finally {
      setProcessing(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p></p>
      </div>
    )
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAssessment = async () => {
    try {
      if (!isSignedIn || !supabaseClient) {
        openSignIn();
        return;
      }
  
      const currentAssessment = assessments.find(a => a.id === roomId);
      
      if (!currentAssessment) {
        toast.error('Assessment not found.');
        return;
      }
  
      const assessmentId = currentAssessment.id;
      const imageUrls: string[] = currentAssessment.images;
      
      const imagePaths = imageUrls.map((url) => {
        const urlObj = new URL(url);
        let path = urlObj.pathname;
  
        const prefix = '/storage/v1/object/public/rooms/';
        if (path.startsWith(prefix)) {
          path = path.substring(prefix.length);
        }
  
        path = decodeURIComponent(path);
        return path;
      });
  
      const { data, error: deleteError } = await supabaseClient.storage
        .from('rooms')
        .remove(imagePaths);
  
      if (deleteError) {
        toast.error('Failed to delete images.');
        return;
      }
  
      const { error: deleteAssessmentError } = await supabaseClient
        .from('assessments')
        .delete()
        .eq('id', assessmentId);
  
      if (deleteAssessmentError) {
        toast.error('Failed to delete room.');
        return;
      }
  
      toast.success('Room and images deleted successfully.');
      await refreshAssessments();
      router.push('/app');
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-row w-full p-[12px] gap-[12px] bg-gray-50">
      <div
        id="left-panel"
        className="flex flex-col flex-1 min-w-0 rounded-[6px] bg-white border overflow-hidden"
      >
        <Header
          currentRoomName={currentRoomName}
          loading={processing}
          image={image}
          handleSubmit={handleSubmit}
          onDeleteClick={handleDeleteClick}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteAssessment}
          title="Confirm Deletion"
          description="Are you sure you want to delete this room? All images and annotations will be deleted permanently."
        />
        <div className="flex-1 min-h-0 overflow-auto">
          {processing ? (
            <div className="w-full h-full flex items-center justify-center p-[100px]">
              <Skeleton className="w-full h-full" />
            </div>
          ) : selectedImageIndex !== null && allImages.length > 0 ? (
            <MainImageDisplay
              imageSrc={allImages[selectedImageIndex]}
              mainImageLoading={mainImageLoading}
              setMainImageLoading={setMainImageLoading}
              fallbackImageUrl={fallbackImageUrl}
              maxWidth={maxWidth}
              maxHeight={maxHeight}
              annotations={currentAnnotations}
              onAnnotationHover={setHoveredProductId}
              hoveredProductId={hoveredProductId}
            />
          ) : (
            <EmptyState handleImageUpload={handleImageUpload} />
          )}
        </div>
        <Separator />
        <ImageCarousel
          allImages={allImages}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          handleImageUpload={handleImageUpload}
          handleDeleteImage={handleDeleteImage}
          isSignedIn={isSignedIn}
          fallbackImageUrl={fallbackImageUrl}
        />
      </div>
      <RightPanel
        allProductIds={allProductIds}
        currentProductIds={currentProductIds}
        hoveredProductId={hoveredProductId}
        setHoveredProductId={setHoveredProductId}
        productCounts={productCounts}
        demoMode={demoMode}
      />
    </div>
  );
}