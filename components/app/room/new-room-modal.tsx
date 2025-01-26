'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser, useSession, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Plus, Cloud } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useAssessmentsContext } from '@/contexts/assessments';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Room } from '@/types/types';
import { formatRoomName, getIcon } from '@/utils/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectValue,
} from '@/components/ui/select';
import imageCompression from 'browser-image-compression';

function NewRoom() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { session } = useSession();
  const { openSignIn } = useClerk();
  const { refreshAssessments } = useAssessmentsContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const supabaseClient = useSupabaseClient();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [openPopover, setOpenPopover] = useState(false);

  useEffect(() => {
    if (!supabaseClient || !selectedRoomName) return;
  
    const fetchProductIds = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('rooms')
          .select('product_ids')
          .eq('room_name', selectedRoomName)
          .single(); 
  
        if (error) {
          //  console.error('Error fetching product_ids:', error);
          return;
        }
  
        if (data && data.product_ids) {
          setProductIds(data.product_ids);
        } else {
          setProductIds([]);
        }
      } catch (error) {
        //  console.error('Unexpected error fetching product_ids:', error);
      }
    };
  
    fetchProductIds();
  }, [supabaseClient, selectedRoomName]);

  useEffect(() => {
    console.log('Auth state:', {
      isUserLoaded: isLoaded,
      isSignedIn: isSignedIn,
      hasUser: !!user,
      hasSession: !!session,
      sessionDetails: session ? {
        accessToken: !!session.accessToken,
        expires: session.expires,
      } : null
    });

    console.log('Supabase Config:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  
    if (!user || !session || !supabaseClient) {
      console.log('Missing dependencies:', {
        hasUser: !!user,
        hasSession: !!session,
        hasSupabaseClient: !!supabaseClient
      });
      return;
    }  
    async function loadAvailableRooms() {
      try {
        if (!supabaseClient) {
          console.error('Supabase client not initialized');
          return;
        }
  
        const { data, error } = await supabaseClient
          .from('rooms')
          .select('id, room_name');
  
        if (error) throw error;
  
        setAvailableRooms(
          data?.map((room) => ({ id: room.id, name: room.room_name })) || []
        );
        console.log('Available rooms set:', // Add this log
          data?.map((room) => ({ id: room.id, name: room.room_name })) || []
        );
      } catch (error) {
        //  console.error('Error loading available rooms:', error);
      }
    }
  
    loadAvailableRooms();
  }, [user, session, supabaseClient]);

  const handleAddRoomClick = () => {
    if (isSignedIn) {
      setIsDialogOpen(true);
    } else {
      openSignIn(); 
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true
    };
    
    try {
      const compressedBlob = await imageCompression(file, options);
      return new File([compressedBlob], file.name, { type: file.type });
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return file;
    }
  };

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!supabaseClient) {
        alert('Supabase client is not initialized.');
        return;
      }
  
      try {
        setUploading(true);
        setUploadProgress(0);
  
        if (!event.target.files || event.target.files.length === 0) {
          throw new Error('You must select images to upload.');
        }
  
        const files = Array.from(event.target.files);
        setUploadedFiles((prev) => [...prev, ...files]);
  
        const previews = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls(previews);
  
        // Compress all files first
        const compressedFiles = await Promise.all(
          files.map(file => compressImage(file))
        );
  
        // Use compressed files for batching
        const BATCH_SIZE = 2;
        const batches = [];
        for (let i = 0; i < compressedFiles.length; i += BATCH_SIZE) {
          batches.push(compressedFiles.slice(i, i + BATCH_SIZE));
        }
  
        const allResults = [];
        let totalProgress = 0;
  
        for (const batch of batches) {
          const formData = new FormData();
          batch.forEach((file) => {
            formData.append('files', file);
          });
  
          const response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
  
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const batchProgress = Math.round((event.loaded * 100) / event.total);
                const overallProgress = Math.round(
                  (totalProgress + batchProgress / batches.length)
                );
                setUploadProgress(overallProgress);
              }
            });
  
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                totalProgress += (100 / batches.length);
                resolve(JSON.parse(xhr.response));
              } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
              }
            });
  
            xhr.addEventListener('error', () => {
              reject(new Error('Network error'));
            });
  
            xhr.open('POST', '/api/upload');
            xhr.send(formData);
          });
  
          const result = response as any;
          if (result.error) throw result.error;
          allResults.push(...result.data.paths);
        }
  
        const publicUrls = await Promise.all(
          allResults.map(async (path: string) => {
            const { data } = await supabaseClient.storage
              .from('rooms')
              .getPublicUrl(path);
            return data.publicUrl;
          })
        );
  
        setUploadedImagePaths((prev) => [...prev, ...publicUrls]);
      } catch (error: any) {
        toast.error(`Failed to upload files: ${error.message}`);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [supabaseClient]
  );

  const removeSelectedImage = (index: number) => {
    setUploadedImagePaths((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();

      if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
        return;
      }

      const files = Array.from(event.dataTransfer.files);
      if (!files.every((file) => file.type.startsWith('image/'))) {
        alert('Please upload image files only');
        return;
      }

      const syntheticEvent = {
        target: {
          files: event.dataTransfer.files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await handleUpload(syntheticEvent);
    },
    [handleUpload]
  );

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleCreateRoom = async () => {
    if (!user) {
      alert('Please select a room type and upload at least one image.');
      return;
    }
  
    if (uploadedImagePaths.length === 0) {
      alert('Please upload at least one image.');
      return;
    }
  
    if (!supabaseClient) {
      alert('Supabase client is not initialized.');
      return;
    }
  
    setUploading(true);
  
    try {
      const annotationsArray = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); 
          };
          reader.onerror = (error) => reject(error);
        });

        const visionResponse = await fetch('/api/vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            product_ids: productIds,
          }),
        });
        
        if (!visionResponse.ok) {
          const errorText = await visionResponse.text(); 
          //  console.error('Vision API error:', visionResponse.status, errorText);
          throw new Error(`Error from vision API: ${visionResponse.status} ${errorText}`);
        }

        const visionData = await visionResponse.json();
        const modifications = visionData.modifications;

        const partDescriptions = modifications
          .map((mod: any) => mod.location)
          .join(', ');

        const formData = new FormData();
        formData.append('image', file);
        formData.append('prompt', partDescriptions);

        const dinoResponse = await fetch('/api/dino', {
          method: 'POST',
          body: formData,
        });

        if (!dinoResponse.ok) {
          throw new Error('Error from dino API');
        }

        const dinoData = await dinoResponse.json();

        const annotation = {
          boundingBoxes: dinoData.jsonData?.boundingBoxes || [],
          modifications: modifications,
          frameWidth: dinoData.jsonData?.frameWidth || 0,
          frameHeight: dinoData.jsonData?.frameHeight || 0,
        };

        annotationsArray.push(annotation);
      }

      const { data, error } = await supabaseClient
      .from('assessments')
      .insert([
        {
          user_id: user.id,
          room_name: selectedRoomName,
          images: uploadedImagePaths,
          annotations: annotationsArray,
        },
      ])
      .select();

    if (error) {
      //  console.error('Supabase insert error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      router.push(`/app/${data[0].id}`);
    }

    await refreshAssessments();
  } catch (error: any) {
    //  console.error('Error creating new room:', error);
    toast.error(`Failed to create a new room: ${error.message}`);
  } finally {

    setSelectedRoomName('');
    setUploadedImagePaths([]);
    setUploadedFiles([]);
    setPreviewUrls([]);
    setUploadProgress(0);
    setUploading(false);
    setIsDialogOpen(false);
  }
};

const resetStates = () => {
  setSelectedRoomName('');
  setUploadedImagePaths([]);
  setUploadedFiles([]);
  setPreviewUrls([]);
  setUploadProgress(0);
};

  return (
    <div>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="square" onClick={handleAddRoomClick}>
              <Plus className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>Add room</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isSignedIn && (
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { 
              resetStates();
            }
          }}
        >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new room</DialogTitle>
      </DialogHeader>
        <div className="space-y-4">
          {/* Replace the nested Popover with a single one */}
          <Select
              value={selectedRoomName}
              onValueChange={(value) => setSelectedRoomName(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableRooms.map((room) => {
                    const Icon = getIcon(room.name);
                    return (
                      <SelectItem key={room.id} value={room.name}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          {formatRoomName(room.name)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>

                <div>
                  <label
                    htmlFor="dropzone-file"
                    className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {uploading && (
                      <div className="text-center max-w-md">
                        
                        {previewUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {previewUrls.map((url, index) => (
                              <Image
                                key={url}
                                width={100}
                                height={100}
                                src={url}
                                className="w-full object-contain max-h-16 opacity-70"
                                alt={`uploading preview ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                        <Progress value={uploadProgress} />
                        <p className="text-sm font-semibold">
                          Uploading Pictures
                        </p>
                        <p className="text-xs text-gray-400">
                          Do not refresh or perform any other action while the
                          pictures are being uploaded
                        </p>
                      </div>
                    )}

                    {!uploading && uploadedImagePaths.length === 0 && (
                      <div className="text-center">
                        <div className="border p-2 rounded-md max-w-min mx-auto">
                          <Cloud size="1.6em" />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          <span className="font-semibold">Drag images</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Select images or drag here to upload directly
                        </p>
                      </div>
                    )}

{uploadedImagePaths.length > 0 && !uploading && (
  <div 
    className="grid grid-cols-2 gap-2 mt-4"
    onClick={(e) => e.stopPropagation()} // Add this wrapper div with click prevention
  >
    {uploadedImagePaths.map((path, index) => (
      <div 
        key={path} 
        className="relative"
        onClick={(e) => e.preventDefault()} // Add this as well
      >
        <Image
          width={100}
          height={100}
          src={path}
          className="w-full object-contain max-h-16"
          alt={`uploaded image ${index + 1}`}
        />
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeSelectedImage(index);
          }}
          type="button"
          variant="secondary"
          className="absolute top-0 right-0 p-1"
        >
          Remove
        </Button>
      </div>
    ))}
  </div>
)}
                  </label>

                  <input
                    id="dropzone-file"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleUpload}
                    className="hidden"
                    multiple
                    disabled={uploading}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedRoomName('');
                      setUploadedImagePaths([]);
                      setPreviewUrls([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                  onClick={handleCreateRoom}
                  disabled={
                    uploading || 
                    !selectedRoomName ||
                    uploadedImagePaths.length === 0
                  }
                >
                  {uploading ? 'Processing...' : 'Create Room'}
                </Button>
                </div>
              </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default NewRoom;