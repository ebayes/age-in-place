import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '../icons';
import Image from 'next/image';
import { Product, RightPanelProps } from '@/types/types';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { dummyProducts } from '@/data/dummy';
import {
  HoverCard as OnboardingHoverCard,
  HoverCardContent as OnboardingHoverCardContent,
  HoverCardTrigger as OnboardingHoverCardTrigger,
} from "@/components/ui/onboarding-hover";
import { useOnboarding } from '@/contexts/onboard';

export function RightPanel({
  allProductIds,
  currentProductIds,
  hoveredProductId,
  setHoveredProductId,
  productCounts,
  demoMode = false,
}: RightPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const supabaseClient = useSupabaseClient();
  const { onboardingStep, setOnboardingStep, shouldShowOnboarding } = useOnboarding();

  
  useEffect(() => {
    if (demoMode) {
      // Convert dummy products object to array format matching your Product type
      const dummyProductsArray = Object.entries(dummyProducts).map(([id, product]) => ({
        product_id: id,
        product_name: product.name,
        description: product.description,
        price: product.price,
        thumbnail: product.image_url,
        url: '#', // or some demo URL
        category: product.category,
        cost_rating: 0,
      }));
      setProducts(dummyProductsArray as Product[]);
      return;
    }
    const fetchProducts = async () => {
      if (!supabaseClient || allProductIds.length === 0) {
        setProducts([]);
        return;
      }

      try {
        const { data: productsData, error } = await supabaseClient
          .from('products')
          .select('*')
          .in('product_id', allProductIds);

        if (error) {
          //  console.error('Error fetching products:', error);
          return;
        }

        setProducts(productsData || []);
      } catch (error) {
        //  console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [allProductIds, supabaseClient, demoMode]);

  return (
    <div className="w-[400px] flex-shrink-0 rounded-[6px] flex flex-col bg-white border">
      {/* Header */}
      <div className="rounded-t h-[48px] bg-gray-50 border-b flex items-center px-[16px] py-[8px] gap-[8px]">
        <div className="flex-1">
          <p className="text-[14px] font-medium">Product</p>
        </div>
        <div className="flex w-[60px] items-start">
          <p className="text-[14px] font-medium">Price</p>
        </div>
        <div className="flex w-[40px] items-start">
          <p className="text-[14px] font-medium">#</p>
        </div>
        <div className="flex">
          <Button variant="ghost" size="square" disabled>
            <Link size="sm" />
          </Button>
        </div>
      </div>

      {/* Product List */}
      <div className="flex flex-col p-[8px] overflow-y-auto flex-1">
        {products.map((product, index) => {
          const isDisabled = !currentProductIds.includes(product.product_id);
          const isActive = hoveredProductId === product.product_id;

            return (
              <OnboardingHoverCard
              key={product.product_id}
              open={shouldShowOnboarding && index === 0 && onboardingStep === 4}
              onOpenChange={() => {}}
            >
              <OnboardingHoverCardTrigger asChild>
              <div
                key={product.product_id}
                className={`flex items-center p-[8px] gap-[8px] w-full ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${isActive ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => {
                if (!isDisabled) {
                  setHoveredProductId(product.product_id);
                }
              }}
                onMouseLeave={() => {
                  if (!isDisabled) {
                    setHoveredProductId(null); 
                  }
                }}
              >

              {/* Image */}
              <div className="w-[42px] h-[42px] rounded-[8px] overflow-hidden flex-shrink-0">
                <Image
                  src={product.thumbnail}
                  alt={product.product_name}
                  width={42}
                  height={42}
                  className="object-cover w-full h-full border border-gray-200 rounded-[8px]"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{product.product_id.charAt(0).toUpperCase() + product.product_id.slice(1)}</p>
                <p className="text-[12px] text-gray-500 truncate">{product.product_name}</p>
              </div>

              {/* Price */}
              <div className="flex items-center flex-shrink-0 w-[60px]">
                <p className="text-[12px] text-gray-500">${product.price.toFixed(2)}</p>
              </div>

              {/* Count */}
              <div className="flex items-center flex-shrink-0 w-[40px]">
                <p className="text-[12px] text-gray-500">
                  {productCounts[product.product_id] || 0}
                </p>
              </div>

              {/* Link Button */}
              <div className="flex flex-shrink-0">
                <Button
                  variant="ghost"
                  size="square"
                  onClick={() => !isDisabled && window.open(product.url, '_blank')}
                  disabled={isDisabled}
                >
                  <Link size="sm" />
                </Button>
              </div>
            </div>
            </OnboardingHoverCardTrigger>
              {index === 0 && (
                <OnboardingHoverCardContent side="left" align="center">
                  <div className="max-w-xs text-center">
                    <p className="font-medium text-[13px]">
                      View and compare product
                      <br />
                      recommendations here
                    </p>
                    <div className="mt-2 w-full flex justify-between items-center">
                      <p className="text-[12px] text-gray-500">4/5</p>
                      <Button 
                        size="sm" 
                        onClick={() => setOnboardingStep && setOnboardingStep(5)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </OnboardingHoverCardContent>
              )}
            </OnboardingHoverCard>
          );
        })}
      </div>

      {/* Bottom Div with Total */}
      <div className="rounded-b h-[56px] bg-gray-50 border-t flex items-center justify-end px-[16px]">
        <p className="text-[14px] font-medium">
          Total: $
          {products
            .reduce((sum, product) => sum + product.price * (productCounts[product.product_id] || 0), 0)
            .toFixed(2)}
        </p>
      </div>
    </div>
  );
}