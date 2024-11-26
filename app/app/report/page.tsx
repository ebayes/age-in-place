'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSession } from '@clerk/nextjs';
import { useSupabaseClient } from '@/hooks/useSupabaseClient'; 
import { ArrowDown, Link } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from './markdown';
import { ReportRecord } from '@/types/report';
import Image from 'next/image';
import { Product, Annotation } from '@/types/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ArrowHover } from '@/components/ui/arrow-hover';
import { toBase64, shimmer } from '@/utils/shimmer';
import { dummyAnnotations, dummyImages, dummyProducts, dummyReport } from '@/data/dummy';

type AssessmentData = {
  room_name: string;
  images: string[];
  annotations: Annotation[]; 
};

function Page() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isSessionLoaded } = useSession();
  const client = useSupabaseClient();

  const [report, setReport] = useState<ReportRecord | null>(null);
  const [assessmentsByRoom, setAssessmentsByRoom] = useState<AssessmentData[]>([]);
  const [productsByRoom, setProductsByRoom] = useState<{ [roomName: string]: Product[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isUserLoaded || !isSessionLoaded) return;

      // If no user, load dummy data
      if (!user) {
        setReport(dummyReport);
        // Use dummy data from annotations and products
        setAssessmentsByRoom([{
          room_name: 'Kitchen',
          images: dummyImages,
          annotations: dummyAnnotations
        }]);
        
        // Create dummy products by room mapping
        const dummyProductsByRoom: { [roomName: string]: Product[] } = {
          'Kitchen': Object.entries(dummyProducts).map(([id, product]) => ({
            product_id: id,
            product_name: product.name,
            description: product.description,
            price: product.price,
            thumbnail: product.image_url,
            url: '#',
            cost_rating: 0
          }))
        };
        setProductsByRoom(dummyProductsByRoom);
        setLoading(false);
        return;
      }

      // Regular data fetching for logged-in users
      if (!client) return;
      
      try {
        // Fetch report data
        const { data: reportData, error: reportError } = await client
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (reportError) throw reportError;
        if (reportData) {
          setReport(reportData as ReportRecord);
        }

        // Fetch assessments grouped by room
        const { data: assessmentData, error: assessmentError } = await client
          .from('assessments')
          .select('room_name, images, annotations')
          .eq('user_id', user.id);

        if (assessmentError) throw assessmentError;
        if (assessmentData) {
          setAssessmentsByRoom(assessmentData as AssessmentData[]);
        }

        // Collect all product IDs from annotations
        let productIds: string[] = [];
        assessmentData.forEach((assessment: AssessmentData) => {
          assessment.annotations.forEach((annotation) => {
            annotation.modifications.forEach((modification) => {
              if (modification.product_id) {
                productIds.push(modification.product_id);
              }
            });
          });
        });

        // Remove duplicates
        productIds = [...new Set(productIds)];

        // Fetch products by IDs
        const { data: productData, error: productError } = await client
          .from('products')
          .select('*')
          .in('product_id', productIds);

        if (productError) throw productError;

        if (productData) {
          // Map products to rooms
          const productsByRoomTemp: { [roomName: string]: Product[] } = {};

          assessmentData.forEach((assessment: AssessmentData) => {
            const roomProducts = productData.filter((product: Product) => {
              return assessment.annotations.some((annotation) =>
                annotation.modifications.some(
                  (modification) => modification.product_id === product.product_id
                )
              );
            });
            productsByRoomTemp[assessment.room_name] = roomProducts;
          });

          setProductsByRoom(productsByRoomTemp);
        }
      } catch (error) {
        // console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, isUserLoaded, isSessionLoaded, client]);

  if (loading) {
    return <div>
      {/* Loading state */}
    </div>;
  }

  if (!report) {
    return <div>No report found</div>;
  }

  return (
    <div className="flex flex-col items-start justify-start w-full px-[32px] bg-[#F9F8F9] pt-[30px] pb-[100px] overflow-auto fixed h-full">
      <div
        className="bg-white max-w-[1048px] w-full mx-auto px-[89px] py-[71px] rounded-[5px] border border-[#E9E8EA]"
        style={{
          boxShadow:
            '0px 43px 26px rgba(0, 0, 0, 0.02), 0px 19px 19px rgba(0, 0, 0, 0.03), 0px 5px 11px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="flex flex-col items-center justify-center gap-[50px] w-full">
          <Separator />
          <div className="flex items-center justify-between w-full">
            <p className="text-[13px] font-mono">AGEINPLACE.IO ASSESSMENT</p>
            <div id="download-pdf" className="flex items-center gap-[8px]">
              <ArrowHover />
              PDF
            </div>
          </div>
          
          <h1 className="text-[72px] leading-[68px]">
            Home Assessment for {report.reports.firstName} {report.reports.lastName}
          </h1>

          {/* Table of Contents */}
          <div id="contents" className="flex flex-col w-full">
            {report.report_lines.map((section, index) => (
              <div key={index} className="group">
                <div className="flex items-center h-[56px] gap-[16px] hover:bg-gray-100 rounded-[8px] px-[8px]">
                  <Button
                    size="square"
                    className="bg-foreground rounded-full w-[28px] h-[28px]"
                  >
                    <ArrowDown size="md" />
                  </Button>
                  <a href={`#section-${index}`}>{section.title}</a>
                </div>
                {index < report.report_lines.length - 1 && (
                  <Separator className="group-hover:opacity-0" />
                )}
              </div>
            ))}

            {/* Room Sections */}
            {assessmentsByRoom.map((assessment, index) => (
              <div key={index} className="group">
                <div className="flex items-center h-[56px] gap-[16px] hover:bg-gray-100 rounded-[8px] px-[8px]">
                  <Button
                    size="square"
                    className="bg-foreground rounded-full w-[28px] h-[28px]"
                  >
                    <ArrowDown size="md" />
                  </Button>
                  <a href={`#room-${assessment.room_name}`}>
                    {assessment.room_name.charAt(0).toUpperCase() + assessment.room_name.slice(1)}
                  </a>
                </div>
                {index < assessmentsByRoom.length - 1 && (
                  <Separator className="group-hover:opacity-0" />
                )}
              </div>
            ))}
          </div>

          {/* Report Sections */}
          <div className="flex flex-col w-full mt-[50px]">
            {report.report_lines.map((section, index) => (
              <div
                key={index}
                id={`section-${index}`}
                className="flex w-full gap-[32px] mb-[68px] pt-[32px] border-t"
              >
                <div className="w-[232px]">
                  <div className="sticky top-[30px]">
                    <p className="font-medium">
                      {section.title.charAt(0).toUpperCase() + section.title.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="w-full prose">
                  <ReactMarkdown components={markdownComponents}>
                    {section.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Room Sections */}
            {assessmentsByRoom.map((assessment, index) => (
              <div
                key={index}
                id={`room-${assessment.room_name}`}
                className="flex w-full gap-[32px] mb-[68px] pt-[32px] border-t"
              >
                <div className="w-[232px]">
                  <div className="sticky top-[30px]">
                    <p className="font-medium">
                      {assessment.room_name.charAt(0).toUpperCase() + assessment.room_name.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="w-full">
                  {/* Images for the Room */}
                  {assessment.images.length > 0 && (
                    <div className="flex-shrink-0 flex flex-col gap-2 p-[12px] bg-gray-50 mb-6">
                      <div
                        className="overflow-x-auto"
                        style={{
                          display: 'grid',
                          gridAutoFlow: 'column',
                          gridAutoColumns: '160px',
                          gap: '12px',
                          overflowX: 'auto',
                          padding: '4px',
                          scrollSnapType: 'x mandatory',
                        }}
                      >
                        {assessment.images.map((imageUrl, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 relative"
                            style={{ scrollSnapAlign: 'start' }}
                          >
                            <AspectRatio ratio={16 / 9} className="rounded-[6px] overflow-hidden">
                              <Image
                                src={imageUrl}
                                alt={`${assessment.room_name} photo ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="160px"
                                quality={60}
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(160, 90))}`}
                              />
                            </AspectRatio>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Products for the Room */}
                  {productsByRoom[assessment.room_name] &&
                    productsByRoom[assessment.room_name].length > 0 && (
                      <div className="mt-[20px]">
                        <h3 className="text-[14px] font-medium mb-4">Recommended Products</h3>
                        <div className="flex flex-col">
                          {/* Header */}
                          <div className="rounded-t h-[48px] bg-gray-50 border-b flex items-center px-[16px] py-[8px] gap-[8px]">
                            <div className="flex-1">
                              <p className="text-[14px] font-medium">Product</p>
                            </div>
                            <div className="flex w-[60px] items-start">
                              <p className="text-[14px] font-medium">Price</p>
                            </div>
                            <div className="flex">
                              <Button variant="ghost" size="square" disabled>
                                <Link size="sm" />
                              </Button>
                            </div>
                          </div>

                          {/* Product List */}
                          <div className="flex flex-col p-[8px] overflow-y-auto">
                            {productsByRoom[assessment.room_name].map((product) => (
                              <div
                                key={product.product_id}
                                className="flex items-center p-[8px] gap-[8px] w-full hover:bg-gray-100"
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
                                  <p className="text-[14px] font-medium truncate">
                                    {product.product_id.charAt(0).toUpperCase() + product.product_id.slice(1)}
                                  </p>
                                  <p className="text-[12px] text-gray-500 truncate">
                                    {product.product_name}
                                  </p>
                                </div>

                                {/* Price */}
                                <div className="flex items-center flex-shrink-0 w-[60px]">
                                  <p className="text-[12px] text-gray-500">${product.price.toFixed(2)}</p>
                                </div>

                                {/* Link Button */}
                                <div className="flex flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="square"
                                    onClick={() => window.open(product.url, '_blank')}
                                  >
                                    <Link size="sm" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Page;