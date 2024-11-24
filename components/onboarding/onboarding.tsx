"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useUser, useSession } from '@clerk/nextjs';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Input } from '../ui/input';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ChevronLeft } from '../icons';
import { LoadingState } from './loading-state';
import { OnboardingAnswers } from '@/types/report'
import { LoadingStage } from '@/types/types';

export default function OnboardingStepPage({ step }: { step: string }) {
  const router = useRouter();
  const currentStep = parseInt(step);
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [inputValues, setInputValues] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('generating');

  const isStepComplete = () => {
    const currentFields = steps[currentStep - 1].fields;
    return !currentFields.some((field: any) => {
      if (!field.required) return false;
      
      const value = inputValues[field.name];
      if (field.type === 'radio' && field.multiple) {
        return !value || value.length === 0;
      }
      if (field.type === 'slider') {
        return !value || value.length !== 2;
      }
      if (field.detailsField && value === 'Yes') {
        return !inputValues[field.detailsField.name];
      }
      return !value;
    });
  };

  const getPronouns = () => {
    if (!answers.relationship || answers.relationship === 'Myself') {
      return { possessive: 'your', subject: 'you', object: 'you' };
    }
    return { possessive: 'their', subject: 'they', object: 'them' };
  };

  const steps = [

    {
      title: "Hey! I'm Elizabeth. I'll create a personalized report for you in seconds. Ready to go?",
      fields: [
        {
          name: 'relationship',
          label: 'Who are you creating this report for?',
          type: 'radio',
          options: ['Parent/Grandparent', 'Myself', 'Someone else'],
        },
      ],
      buttonText: "Let's do this!",
    },
    {
      title: () => `What is ${getPronouns().possessive} name?`,
      fields: [
        { name: 'firstName', type: 'text', placeholder: `Enter ${getPronouns().possessive} first name`, group: 'name' },
        { name: 'lastName', type: 'text', placeholder: `Enter ${getPronouns().possessive} last name`, group: 'name' },
      ],
    },
    {
      title: () => `How would you describe ${getPronouns().possessive} overall health?`,
      fields: [
        {
          name: 'overallHealth',
          type: 'radio',
          options: ['Excellent', 'Good', 'Fair', 'Poor'],
        },
      ],
    },
    {
      title: `Tell me more about ${answers.firstName || 'them'}`,
      fields: [
        {
          name: 'healthDetails',
          label: `Describe ${getPronouns().possessive} health conditions, including any chronic conditions, recent injuries/surgeries, and mobility issues.`,
          type: 'textarea',
          placeholder: `List any health conditions, injuries, surgeries, or mobility issues that ${getPronouns().subject} may have.`,
        },
      ],
    },
    {
      title: `What about ${getPronouns().possessive} home? Describe it for me.`,
      fields: [
        {
          name: 'homeDetails',
          label: `Describe ${getPronouns().possessive} home, including how many rooms there are, how many floors, and any safety issues to be aware of.`,
          type: 'textarea',
          placeholder: `Describe ${getPronouns().possessive} home.`,
        },
      ],
    },
    {
      title: () => `Let's talk about personal care activities`,
      fields: [
        {
          name: 'bathingAssistance',
          label: `Do ${getPronouns().subject} need help with bathing or personal hygiene?`,
          type: 'radio',
          options: ['Yes', 'No', 'Sometimes'],
          required: true,
        },
      ],
    },
    {
      title: () => `What about household tasks? Which need assistance? (You can select more than one)`,
      fields: [
        {
          name: 'householdAssistance',
          type: 'radio',
          multiple: true,
          options: ['Cooking meals', 'Light cleaning', 'Heavy cleaning', 'Laundry', 'None needed'],
          required: true,
        },
      ],
    },
    {
      title: () => `Let's discuss medication management`,
      fields: [
        {
          name: 'medicationAssistance',
          label: `Do ${getPronouns().subject} need help managing medications?`,
          type: 'radio',
          options: ['Yes', 'No'],
          required: true,
          detailsField: {
            name: 'medicationDetails',
            label: 'What type of help is needed?',
            placeholder: 'e.g., Reminders, organizing pills, etc.',
            required: true,
          },
        },
      ],
    },
    {
      title: () => `What about getting around? How do ${getPronouns().subject} move around inside the home?`,
      fields: [
        {
          name: 'mobilityIndoors',
          type: 'radio',
          options: ['Independently', 'With support', 'With difficulty'],
          required: true,
        },
      ],
    },
    {
      title: () => `Do ${getPronouns().subject} use any mobility devices? (You can select more than one)`,
      fields: [
        {
          name: 'mobilityDevices',
          type: 'radio',
          multiple: true,
          options: ['Walker', 'Cane', 'Wheelchair', 'Rollator', 'None needed'],
          required: true,
        },
      ],
    },
    {
      title: () => `Let's discuss fall history. Have ${getPronouns().subject} experienced any falls in the past year?`,
      fields: [
        {
          name: 'recentFalls',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true,
          detailsField: {
            name: 'fallDetails',
            label: 'Please provide details about the most recent fall',
            placeholder: 'When and where did it happen?',
            required: true,
          },
        },
      ],
    },
    {
      title: () => `What safety devices are currently installed? (You can select more than one)`,
      fields: [
        {
          name: 'safetyDevices',
          type: 'radio',
          multiple: true,
          options: [
            'Smoke detectors',
            'Carbon monoxide detectors',
            'Security system',
            'Medical alert system',
            'None'
          ],
          required: true,
        },
      ],
    },
    {
      title: () => `Finally, what's ${getPronouns().possessive} budget for modifications?`,
      fields: [
        {
          name: 'budget',
          label: 'Expected budget range for home modifications',
          type: 'slider',
          min: 1000,
          max: 10000,
          step: 1000,
          required: true,
        },
      ],
      buttonText: 'Generate Report',
    },
];

  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded) return;
    if (!user) {
      router.push('/');
    }
  }, [user, isUserLoaded, isSessionLoaded, router]);

  useEffect(() => {
    const storedAnswers = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}');
    setAnswers(storedAnswers);
    
    const stepFields = steps[currentStep - 1]?.fields || [];
    const newInputValues: any = {};
    
    stepFields.forEach((field: any) => {
      if (field.type === 'slider') {
        // Set default value if no stored value exists
        newInputValues[field.name] = storedAnswers[field.name] || [2000, 5000];
      } else if (field.type === 'radio' && field.multiple) {
        newInputValues[field.name] = Array.isArray(storedAnswers[field.name]) 
          ? storedAnswers[field.name] 
          : [];
      } else {
        newInputValues[field.name] = storedAnswers[field.name] || '';
      }
    });
    
    setInputValues(newInputValues);
  }, [currentStep]);

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox/multiple selection
    if (type === 'checkbox') {
      const currentValues = Array.isArray(inputValues[name]) ? inputValues[name] : [];
      const newValues = currentValues.includes(value) 
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      setInputValues({ ...inputValues, [name]: newValues });
    } else {
      // Handle all other input types
      setInputValues({ ...inputValues, [name]: value });
    }
  };
  
  const handleSliderChange = (value: number[], name: string = 'budget') => {
    setInputValues({ ...inputValues, [name]: value });
  };

  const handleNext = async () => {
    const currentFields = steps[currentStep - 1].fields;
    const missingFields = currentFields.filter((field: any) => {
      if (!field.required) return false;
      
      const value = inputValues[field.name];
      if (field.type === 'checkbox') return !value || value.length === 0;
      if (field.type === 'slider') return !value || value.length !== 2;
      return !value;
    });
  
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedAnswers = { ...answers, ...inputValues };
    setAnswers(updatedAnswers);
    localStorage.setItem('onboardingAnswers', JSON.stringify(updatedAnswers));

    if (currentStep < steps.length) {
      router.push(`/app/onboarding/${currentStep + 1}`);
    } else {
      setIsLoading(true);
      setLoadingStage('generating');
      
      try {
        // First, generate the report
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: updatedAnswers,
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to generate report: ${errorText}`);
        }
  
        const reportData = await response.json();
        setLoadingStage('saving');
          
        // Then save everything to Supabase
        const { error: upsertError } = await supabase
          .from('tasks')
          .upsert({
            user_id: user?.id,
            reports: updatedAnswers,
            report_lines: reportData.sections
          });
  
        if (upsertError) {
          throw upsertError;
        }
  
        localStorage.removeItem('onboardingAnswers');
        setLoadingStage('complete');
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        toast.error('Failed to generate report');
      }
    }
  };

  const handleBack = () => {
    router.push(`/app/onboarding/${currentStep - 1}`);
  };

  const renderFields = () => {
    const fields = steps[currentStep - 1]?.fields || [];

    // Group fields by 'group' property
    const groupedFields: { [key: string]: any[] } = {};
    const ungroupedFields: any[] = [];

    fields.forEach((field: any) => {
      if (field.group) {
        if (!groupedFields[field.group]) {
          groupedFields[field.group] = [];
        }
        groupedFields[field.group].push(field);
      } else {
        ungroupedFields.push(field);
      }
    });

    // Render grouped fields
    const groupedFieldComponents = Object.keys(groupedFields).map((groupName, index) => {
      const groupFields = groupedFields[groupName];
      return (
        <div key={`group-${index}`} className="flex flex-row items-center mb-4 gap-4">
          {groupFields.map((field: any, idx: number) => {
            if (field.type === 'text') {
              return (
                <div key={idx} className="flex flex-col">
                  {field.label && <label className="mb-2">{field.label}</label>}
                  <Input
                    type="text"
                    name={field.name}
                    value={inputValues[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    });

    // Render ungrouped fields
    const ungroupedFieldComponents = ungroupedFields.map((field: any, index: number) => {
      if (field.type === 'text') {
        return (
          <div key={index} className="flex flex-row items-center mb-4">
            {field.label && <label className="mr-2">{field.label}</label>}
            <Input
              type="text"
              name={field.name}
              value={inputValues[field.name]}
              onChange={handleInputChange}
              placeholder={field.placeholder}
            />
          </div>
        );
      } else if (field.type === 'textarea') {
        return (
          <div key={index} className="flex flex-col mb-4 max-w-[800px]">
            {field.label && <label className="mb-2 text-center text-sm">{field.label}</label>}
            <Textarea
              name={field.name}
              value={inputValues[field.name]}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className="min-h-[120px]"
            />
          </div>
        );
      } else if (field.type === 'slider') {
        const formatPrice = (price: number) => {
          return price === field.max ? `$${price.toLocaleString()}+` : `$${price.toLocaleString()}`;
        };
      
        return (
          <div key={index} className="mb-6 max-w-[600px] w-full">
            {field.label && <label className="block mb-2">{field.label}</label>}
            <div className="space-y-3">
              <Slider
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={inputValues[field.name] || [2000, 5000]}  // Remove defaultValue, just use value
                onValueChange={(value) => handleSliderChange(value, field.name)}
                className="w-full pb-4"
              />
              <div className="text-md text-gray-600 text-center items-start">
                From <span className='font-bold text-black'>{formatPrice(inputValues[field.name]?.[0] || 2000)}</span> to <span className='font-bold text-black'>{formatPrice(inputValues[field.name]?.[1] || 5000)}</span>
              </div>
            </div>
          </div>
        );
      } else if (field.type === 'radio') {
        return (
          <div key={index} className="mb-4">
            {field.label && <label className="block mb-5">{field.label}</label>}
            {field.multiple ? (
              <div className="flex flex-col gap-4">
                {field.options.map((option: string, idx: number) => (
                  <div key={idx} className='flex flex-row items-center px-5 py-3 border rounded-[8px] min-w-[300px]'>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${field.name}-${idx}`}
                        checked={Array.isArray(inputValues[field.name]) && inputValues[field.name]?.includes(option)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(inputValues[field.name]) ? inputValues[field.name] : [];
                          let newValues;
                          if (checked) {
                            // If selecting "None", clear other selections
                            if (option === 'None') {
                              newValues = ['None'];
                            } else {
                              // If selecting other options, remove "None"
                              newValues = [...currentValues.filter(v => v !== 'None'), option];
                            }
                          } else {
                            newValues = currentValues.filter(v => v !== option);
                          }
                          handleInputChange({
                            target: { name: field.name, value: newValues }
                          });
                        }}
                      />
                      <label
                        htmlFor={`${field.name}-${idx}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single selection (existing RadioGroup code)
              <RadioGroup
                name={field.name}
                value={inputValues[field.name] || ''}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: field.name, value }
                  });
                }}
                className="flex flex-col gap-4"
              >
                {field.options.map((option: string, idx: number) => (
                  <div key={idx} className='flex flex-row items-center px-5 py-3 border rounded-[8px] min-w-[300px]'>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={option} id={`${field.name}-${idx}`} />
                      <label
                        htmlFor={`${field.name}-${idx}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
            {field.detailsField && inputValues[field.name] === 'Yes' && (
              <div className="mt-2 flex flex-col">
                <label className="mb-2">{field.detailsField.label}</label>
                <Input
                  type="text"
                  name={field.detailsField.name}
                  value={inputValues[field.detailsField.name] || ''}
                  onChange={handleInputChange}
                  placeholder={field.detailsField.placeholder}
                />
              </div>
            )}
          </div>
        );
      } else if (field.type === 'checkbox') {
        return (
          <div key={index} className="mb-4">
            {field.label && <label className="block mb-2">{field.label}</label>}
            {field.options.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name={field.name}
                  value={option}
                  checked={inputValues[field.name]?.includes(option)}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
        );
      } else if (field.type === 'slider') {
        return (
          <div key={index} className="mb-6">
            {field.label && <label className="block mb-4">{field.label}</label>}
            <Slider
              min={field.min}
              max={field.max}
              step={field.step || 1}
              defaultValue={inputValues[field.name]}
              value={inputValues[field.name]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span>${inputValues[field.name][0]}</span>
              <span>${inputValues[field.name][1]}</span>
            </div>
          </div>
        );
      }
      // Add other field types as needed
      return null;
    });

    return (
      <>
        {groupedFieldComponents}
        {ungroupedFieldComponents}
      </>
    );
  };

  const currentStepData = steps[currentStep - 1];
  const title = typeof currentStepData.title === 'function' ? currentStepData.title() : currentStepData.title;

  return (
    <div className="flex flex-col items-center w-full h-full py-[100px]">
      {isLoading ? (
        <LoadingState 
        onComplete={() => router.push('/app/report')} 
        answers={answers}
        stage={loadingStage}
      />
      ) : (
        <>
          {/* Progress bar */}
          <div className="fixed top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm z-50">
            <div className="max-w-[600px] mx-auto">
              <Progress 
                value={(currentStep / steps.length) * 100} 
                className="h-2"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round((currentStep / steps.length) * 100)}% complete</span>
              </div>
            </div>
          </div>
      
          {/* Left side blur - now shows on all steps */}
          <div className="fixed left-0 top-0 bottom-0 flex items-center p-4 min-w-[100px] bg-white/20 backdrop-blur-sm z-50">
            {currentStep > 1 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="w-[64px] h-[64px] hover:bg-gray-100"
              >
                <ChevronLeft className="h-[48px] w-[48px]" />
              </Button>
            )}
          </div>
      
          {/* Main content */}
          <div className="relative w-full flex justify-center mb-[75px]">
            <Image
              src="/elizabeth.png"
              alt="Elizabeth"
              className="border-2 border-gray-300 rounded-full absolute top-1/2 transform -translate-y-1/2 z-10"
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-3xl mb-[50px] max-w-[600px] text-center">{title}</h1>
          {renderFields()}
          <div className="mt-4">
            <Button 
              size="xl" 
              onClick={handleNext}
              disabled={!isStepComplete()}
              className={!isStepComplete() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {currentStepData.buttonText || 'Continue'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}