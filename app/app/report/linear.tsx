'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSession } from '@clerk/nextjs';
import { useSupabaseClient } from '@/hooks/useSupabaseClient'; 
import { ArrowDown } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { contentItems } from '@/app/app/report/content';
import { markdownComponents } from '@/app/app/report/markdown';

function Page() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded: isSessionLoaded } = useSession();
  const client = useSupabaseClient();

  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded || !client) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    async function checkTasks() {
      if (!client) return;
      const { data, error } = await client
        .from('tasks')
        .select('id')
        .eq('user_id', user)
        .limit(1);

      if (error) {
        //  console.error('Error fetching tasks:', error);
        return;
      }
      //  console.log('This data = ', data);

      if (data && data.length === 0) {
      } else {
        router.push('/app/onboarding');
      }
    }

    checkTasks();
  }, [user, isUserLoaded, isSessionLoaded, client, router]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-[32px] bg-[#F9F8F9] py-[30px]">
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
            <p className="text-[13px] font-mono">SWITCH INSTRUCTION MANUAL</p>
            <p className="text-[13px] font-mono">[ ] PDF</p>
          </div>
          <h1 className="text-[72px] leading-[68px]">
            Why and how product teams switch to Linear
          </h1>

          {/* Content Items */}
          <div id="contents" className="flex flex-col w-full">
            {contentItems.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center h-[56px] gap-[16px] hover:bg-gray-100 rounded-[8px] px-[8px]">
                  <Button
                    size="square"
                    className="bg-foreground rounded-full w-[28px] h-[28px]"
                  >
                    <ArrowDown size="md" />
                  </Button>
                  <a href={`#section-${index}`} className="flex-grow">
                    {item.title}
                  </a>
                </div>
                {index < contentItems.length - 1 && (
                  <Separator className="group-hover:opacity-0 transition-opacity duration-200" />
                )}
              </div>
            ))}
          </div>

          {/* Sections */}
          <div className="flex flex-col w-full mt-[50px]">
            {contentItems.map((item, index) => (
              <div
                key={index}
                id={`section-${index}`}
                className="flex w-full gap-[32px] mb-[68px] pt-[32px] border-t"
              >
                {/* Sticky Title */}
                <div className="w-[232px]">
                  <div className="sticky top-[30px]">
                    <p className="font-medium">{item.title}</p>
                  </div>
                </div>
                {/* Content */}
                <div className="w-full prose">
                  <ReactMarkdown components={markdownComponents}>
                    {item.content}
                  </ReactMarkdown>
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