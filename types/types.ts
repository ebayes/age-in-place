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
    resultImageUrl?: string;
  };


  export interface Assessment {
    id: number;
    room_name: string;
    images: string[];
    annotations: Annotation[];
  }
  
  export interface AssessmentsContextType {
    assessments: Assessment[];
    loading: boolean;
    refreshAssessments: () => Promise<void>;
  }

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
    demoMode?: boolean;
  }

export type LoadingStage = 'generating' | 'saving' | 'complete';

export type FieldBase = {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  group?: string;
};

export type TextField = FieldBase & {
  type: 'text';
};

export type TextareaField = FieldBase & {
  type: 'textarea';
};

export type SliderField = FieldBase & {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
};

export type RadioField = FieldBase & {
  type: 'radio';
  options: string[];
  multiple?: boolean;
  detailsField?: {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  };
};

export type CheckboxField = FieldBase & {
  type: 'checkbox';
  options: string[];
};

// Update the Field type to be a discriminated union
export type Field = 
  | (TextField & { type: 'text' })
  | (TextareaField & { type: 'textarea' })
  | (SliderField & { type: 'slider' })
  | (RadioField & { type: 'radio' })
  | (CheckboxField & { type: 'checkbox' });

export type InputValue = string | number | number[] | string[] | undefined;

export type InputValues = {
  [key: string]: InputValue;
};

export type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | {
  target: { name: string; value: InputValue; type?: string };
};

export type UserPublicMetadata = {
  credits?: number | string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export type CreditsType = number | string | undefined

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";