"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useUser, useSession } from '@clerk/nextjs';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Input } from '../ui/input';
import Image from 'next/image';
// import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ChevronLeft, X } from '../icons';
import { LoadingState } from './loading-state';
import { OnboardingAnswers } from '@/types/report'
import { createSteps } from './steps';
import { InputChangeEvent, LoadingStage, Field, RadioField, SliderField, TextareaField, TextField, FieldBase, InputValues, InputValue, CheckboxField } from '@/types/types';
import Link from 'next/link';
const getInitialInputValues = (
  currentFields: Field[],
  storedAnswers: InputValues
): InputValues => {
  const newInputValues: InputValues = {};
  currentFields.forEach((field) => {
    const fieldName = field.name;
    if (field.type === 'slider') {
      newInputValues[fieldName] =
        (storedAnswers[fieldName] as [number, number]) || [2000, 5000];
    } else if (field.type === 'radio' && field.multiple) {
      newInputValues[fieldName] = Array.isArray(storedAnswers[fieldName])
        ? (storedAnswers[fieldName] as string[])
        : [];
    } else {
      newInputValues[fieldName] = (storedAnswers[fieldName] as string) || '';
    }
  });
  return newInputValues;
};

const isTextField = (field: Field): field is TextField => field.type === 'text';
const isTextareaField = (field: Field): field is TextareaField => field.type === 'textarea';
const isSliderField = (field: Field): field is SliderField => field.type === 'slider';
const isRadioField = (field: Field): field is RadioField => field.type === 'radio';
const isCheckboxField = (field: Field): field is CheckboxField => field.type === 'checkbox';

export default function OnboardingStepPage({ step }: { step: string }) {
  const router = useRouter();
  const currentStep = parseInt(step);
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('generating');


  const [answers, setAnswers] = useState<InputValues>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('onboardingAnswers') || '{}') as InputValues;
    }
    return {};
  });
  
  const steps = useMemo(() => createSteps(answers), [answers]);

  const currentStepFields = useMemo(() => steps[currentStep - 1]?.fields || [], [currentStep, steps]);
  
  const [inputValues, setInputValues] = useState<InputValues>(() => {
    if (typeof window !== 'undefined') {
      const storedAnswers = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}') as InputValues;
      return getInitialInputValues(currentStepFields, storedAnswers);
    }
    return {};
  });
  
  const isStepComplete = () => {
    const currentFields = steps[currentStep - 1].fields as Field[];
    return !currentFields.some((field: Field) => {
      if (!field.required) return false;
  
      const value = inputValues[field.name];
      if (isRadioField(field) && field.multiple) {
        return !value || ((value as string[]).length === 0);
      }
      if (isSliderField(field)) {
        return !value || ((value as number[]).length !== 2);
      }
      if (isRadioField(field) && field.detailsField && value === 'Yes') {
        return !inputValues[field.detailsField.name];
      }
      return !value;
    });
  };

  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded) return;
    if (!user) {
      router.push('/');
    }
  }, [user, isUserLoaded, isSessionLoaded, router]);


  useEffect(() => {
    if (currentStep !== parseInt(step)) {
      const storedAnswers = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}');
      const newInputValues = getInitialInputValues(currentStepFields, storedAnswers);
      setInputValues(newInputValues);
    }
  }, [currentStep, step, currentStepFields]);

  const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
  };
  
  const handleSliderChange = (value: [number, number], name: string = 'budget') => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    const currentStepData = steps[currentStep - 1];
    if (!currentStepData || !Array.isArray(currentStepData.fields)) {
      //  console.error('Invalid step data');
      return;
    }
  
    const currentFields = currentStepData.fields as Field[];
    const missingFields = currentFields.filter((field) => {
      if (!field || typeof field !== 'object' || !('type' in field)) {
        //  console.error('Invalid field:', field);
        return false;
      }
  
      if (!field.required) return false;
  
      const value = inputValues[field.name];
      if (isRadioField(field) && field.multiple) {
        return !value || (Array.isArray(value) && value.length === 0);
      }
      if (isSliderField(field)) {
        return !value || (Array.isArray(value) && value.length !== 2);
      }
      if (isRadioField(field) && field.detailsField && value === 'Yes') {
        return !inputValues[field.detailsField.name];
      }
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
        if (!supabase) {
          throw new Error('Database connection not available');
        }

        // Convert updatedAnswers to OnboardingAnswers type before sending to API
        const onboardingAnswers = updatedAnswers as OnboardingAnswers;

        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: onboardingAnswers,
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
              reports: onboardingAnswers,
              report_lines: reportData.sections,
            });

            if (upsertError) {
              throw upsertError;
            }

            localStorage.removeItem('onboardingAnswers');
            setLoadingStage('complete');
          } catch (error) {
            //  console.error(error);
            setIsLoading(false);
            toast.error('Failed to generate report');
          }
        }
  };

  const handleBack = () => {
    router.push(`/app/onboarding/${currentStep - 1}`);
  };

  const renderFields = () => {
    const currentStepData = steps[currentStep - 1];
    if (!currentStepData || !Array.isArray(currentStepData.fields)) {
      return null;
    }
  
    const fields = currentStepData.fields as Field[];
  
    const groupedFields: { [key: string]: Field[] } = {};
    const ungroupedFields: Field[] = [];
  
    fields.forEach((field) => {
      if (!field || typeof field !== 'object' || !('type' in field)) {
        //  console.error('Invalid field:', field);
        return;
      }
  
      const typedField = field as Field;
      if (typedField.group) {
        if (!groupedFields[typedField.group]) {
          groupedFields[typedField.group] = [];
        }
        groupedFields[typedField.group].push(typedField);
      } else {
        ungroupedFields.push(typedField);
      }
    });

    // Render grouped fields
    const groupedFieldComponents = Object.keys(groupedFields).map((groupName, index) => {
      const groupFields = groupedFields[groupName];
      return (
        <div key={`group-${index}`} className="flex flex-row items-center mb-4 gap-4">
          {groupFields.map((field: Field, idx: number) => {
            if (isTextField(field)) {
              return (
                <div key={idx} className="flex flex-col">
                  {field.label && <label className="mb-2">{field.label}</label>}
                  <Input
                    type="text"
                    name={field.name}
                    value={inputValues[field.name] as string}
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

    const ungroupedFieldComponents = ungroupedFields.map((field: Field, index: number) => {
      if (isTextField(field)) {
        return (
          <div key={index} className="flex flex-row items-center mb-4">
            {field.label && <label className="mr-2">{field.label}</label>}
            <Input
              type="text"
              name={field.name}
              value={inputValues[field.name] as string}
              onChange={handleInputChange}
              placeholder={field.placeholder}
            />
          </div>
        );
      }
    
      if (isTextareaField(field)) {
        return (
          <div key={index} className="flex flex-col mb-4 max-w-[800px]">
            {field.label && <label className="mb-2 text-center text-sm">{field.label}</label>}
            <Textarea
              name={field.name}
              value={inputValues[field.name] as string}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className="min-h-[120px]"
            />
          </div>
        );
      }
    
      if (isSliderField(field)) {
        const formatPrice = (price: number) => {
          return price === field.max ? `$${price.toLocaleString()}+` : `$${price.toLocaleString()}`;
        };
      
        const sliderValue = (inputValues[field.name] as number[]) || [field.min, field.max];
      
        return (
          <div key={index} className="mb-6 max-w-[600px] w-full">
            {field.label && <label className="block mb-2">{field.label}</label>}
            <div className="space-y-3">
              <Slider
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={sliderValue as [number, number]}
                onValueChange={(value) => handleSliderChange(value as [number, number], field.name)}
                className="w-full pb-4"
              />
              <div className="text-md text-gray-600 text-center items-start">
                From{' '}
                <span className="font-bold text-black">
                  {formatPrice(sliderValue[0] || field.min)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-black">
                  {formatPrice(sliderValue[1] || field.max)}
                </span>
              </div>
            </div>
          </div>
        );
      }
    
if (isRadioField(field)) {
  return (
    <div key={index} className="mb-4">
      {field.label && <label className="block mb-5">{field.label}</label>}
      {field.multiple ? (
        // Multiple selection (checkboxes)
        <div className="flex flex-col gap-4">
          {field.options.map((option: string, idx: number) => (
            <div
              key={idx}
              className="flex flex-row items-center px-5 py-3 border rounded-[8px] min-w-[300px]"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${field.name}-${idx}`}
                  checked={
                    Array.isArray(inputValues[field.name]) &&
                    (inputValues[field.name] as string[])?.includes(option)
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(inputValues[field.name])
                      ? (inputValues[field.name] as string[])
                      : [];
                    let newValues;
                    if (checked) {
                      if (option === 'None') {
                        newValues = ['None'];
                      } else {
                        newValues = [
                          ...currentValues.filter((v: string) => v !== 'None'),
                          option,
                        ];
                      }
                    } else {
                      newValues = currentValues.filter((v: string) => v !== option);
                    }
                    handleInputChange({
                      target: { name: field.name, value: newValues, type: 'checkbox' },
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
        <RadioGroup
          name={field.name}
          value={(inputValues[field.name] as string) || ''}
          onValueChange={(value) => {
            handleInputChange({
              target: { name: field.name, value },
            });
          }}
          className="flex flex-col gap-4"
        >
          {field.options.map((option: string, idx: number) => (
            <div
              key={idx}
              className="flex flex-row items-center px-5 py-3 border rounded-[8px] min-w-[300px]"
            >
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
            value={(inputValues[field.detailsField.name] as string) || ''}
            onChange={handleInputChange}
            placeholder={field.detailsField.placeholder}
          />
        </div>
      )}
    </div>
  );
} else if (isCheckboxField(field)) {
  return (
    <div key={index} className="mb-4">
      {field.label && <label className="block mb-2">{field.label}</label>}
      {field.options.map((option: string, idx: number) => (
        <div key={idx} className="flex items-center mb-2">
          <Checkbox
            id={`${field.name}-${idx}`}
            checked={
              Array.isArray(inputValues[field.name]) &&
              (inputValues[field.name] as string[]).includes(option)
            }
            onCheckedChange={(checked) => {
              const currentValues = Array.isArray(inputValues[field.name])
                ? (inputValues[field.name] as string[])
                : [];
              let newValues;
              if (checked) {
                newValues = [...currentValues, option];
              } else {
                newValues = currentValues.filter((v) => v !== option);
              }
              handleInputChange({
                target: { name: field.name, value: newValues },
              });
            }}
          />
          <label htmlFor={`${field.name}-${idx}`}>{option}</label>
        </div>
      ))}
    </div>
        );
      }
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
    <div className="fixed top-1 left-6 z-50">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.push('/app')}
        className="w-[48px] h-[48px] hover:bg-gray-100"
      >
        <X size="lg" />
      </Button>
    </div>
      {isLoading ? (
        <LoadingState 
        onComplete={() => router.push('/app/report')} 
        answers={answers}
        stage={loadingStage}
      />
      ) : (
        <>
          {/* Progress bar */}
          <div className="fixed top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm z-40">
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
          <div className="fixed left-0 top-0 bottom-0 flex items-center p-4 min-w-[100px] bg-white/20 backdrop-blur-sm z-40">
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