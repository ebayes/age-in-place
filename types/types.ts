export interface Product {
    product_id: string;
    product_name: string;
    url: string;
    cost_rating: number;
    price: number;
    description: string;
    thumbnail: string;
  }

export type Modification = {
    location: string;
    modification: string;
    product_id: string;
}
  
export interface BoundingBox {
    phrase: string;
    bboxes: [number, number, number, number][];
    confidence: number[]; 
}
  
export type Annotation = {
    boundingBoxes: BoundingBox[];
    modifications: Modification[];
    frameWidth: number;
    frameHeight: number;
    resultImageUrl: string;
  };

  export type DeleteConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    title?: string;
    description?: string;
  };

  export type HeaderProps = {
    currentRoomName: string;
    loading: boolean;
    image: File | null;
    handleSubmit: () => void;
    onDeleteClick: () => void;
  };

  export interface ImageCarouselProps {
    allImages: string[];
    selectedImageIndex: number | null;
    setSelectedImageIndex: React.Dispatch<React.SetStateAction<number | null>>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteImage: (index: number) => void;
    isSignedIn: boolean;
    fallbackImageUrl: string;
  }

  export type MainImageDisplayProps = {
    imageSrc: string;
    mainImageLoading: boolean;
    setMainImageLoading: React.Dispatch<React.SetStateAction<boolean>>;
    fallbackImageUrl: string;
    maxWidth: number;
    maxHeight: number;
    annotations?: Annotation | null;
    onAnnotationHover?: (productId: string | null) => void;
    hoveredProductId?: string | null;
  };

  export type Room = {
    id: number;
    name: string;
  };

  export interface Product {
    product_id: string;
    product_name: string;
    url: string;
    cost_rating: number;
    price: number;
    description: string;
    thumbnail: string;
  }
  
export interface RightPanelProps {
    allProductIds: string[];
    currentProductIds: string[];
    hoveredProductId: string | null;
    setHoveredProductId: React.Dispatch<React.SetStateAction<string | null>>;
    productCounts: { [productId: string]: number };
  }

  export type LoadingStage = 'generating' | 'saving' | 'complete';