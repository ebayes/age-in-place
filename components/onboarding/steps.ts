import { Field, RadioField, SliderField, TextareaField, TextField, CheckboxField } from '@/types/types';
import { OnboardingAnswers } from '@/types/report';

type GetPronounsFunction = (answers: Partial<OnboardingAnswers>) => {
  possessive: string;
  subject: string;
  object: string;
};

export const getPronouns: GetPronounsFunction = (answers) => {
  if (!answers.relationship || answers.relationship === 'Myself') {
    return { possessive: 'your', subject: 'you', object: 'you' };
  }
  return { possessive: 'their', subject: 'they', object: 'them' };
};

export const createSteps = (answers: Partial<OnboardingAnswers>) => [
  {
    title: "Hey! I'm Elizabeth. I'll create a personalized report for you in seconds. Ready to go?",
    fields: [
      {
        name: 'relationship',
        label: 'Who are you creating this report for?',
        type: 'radio' as const,
        options: ['Parent/Grandparent', 'Myself', 'Someone else'],
        required: true,
      },
    ] as Field[],
    buttonText: "Let's do this!",
  },
  {
    title: () => `What is ${getPronouns(answers).possessive} name?`,
    fields: [
      {
        name: 'firstName',
        type: 'text' as const,
        placeholder: `Enter ${getPronouns(answers).possessive} first name`,
        group: 'name',
        required: true,
      },
      {
        name: 'lastName',
        type: 'text' as const,
        placeholder: `Enter ${getPronouns(answers).possessive} last name`,
        group: 'name',
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `How would you describe ${getPronouns(answers).possessive} overall health?`,
    fields: [
      {
        name: 'overallHealth',
        type: 'radio' as const,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
        required: true,
      },
    ] as Field[],
  },
  {
    title: `Tell me more about ${answers.firstName || 'them'}`,
    fields: [
      {
        name: 'healthDetails',
        label: `Describe ${getPronouns(answers).possessive} health conditions, including any chronic conditions, recent injuries/surgeries, and mobility issues.`,
        type: 'textarea' as const,
        placeholder: `List any health conditions, injuries, surgeries, or mobility issues that ${getPronouns(answers).subject} may have.`,
        required: true,
      },
    ] as Field[],
  },
  {
    title: `What about ${getPronouns(answers).possessive} home? Describe it for me.`,
    fields: [
      {
        name: 'homeDetails',
        label: `Describe ${getPronouns(answers).possessive} home, including how many rooms there are, how many floors, and any safety issues to be aware of.`,
        type: 'textarea' as const,
        placeholder: `Describe ${getPronouns(answers).possessive} home.`,
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `Let's talk about personal care activities`,
    fields: [
      {
        name: 'bathingAssistance',
        label: `Do ${getPronouns(answers).subject} need help with bathing or personal hygiene?`,
        type: 'radio' as const,
        options: ['Yes', 'No', 'Sometimes'],
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `What about household tasks? Which need assistance? (You can select more than one)`,
    fields: [
      {
        name: 'householdAssistance',
        type: 'radio' as const,
        multiple: true,
        options: ['Cooking meals', 'Light cleaning', 'Heavy cleaning', 'Laundry', 'None needed'],
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `Let's discuss medication management`,
    fields: [
      {
        name: 'medicationAssistance',
        label: `Do ${getPronouns(answers).subject} need help managing medications?`,
        type: 'radio' as const,
        options: ['Yes', 'No'],
        required: true,
        detailsField: {
          name: 'medicationDetails',
          label: 'What type of help is needed?',
          placeholder: 'e.g., Reminders, organizing pills, etc.',
          required: true,
        },
      },
    ] as Field[],
  },
  {
    title: () => `What about getting around? How do ${getPronouns(answers).subject} move around inside the home?`,
    fields: [
      {
        name: 'mobilityIndoors',
        type: 'radio' as const,
        options: ['Independently', 'With support', 'With difficulty'],
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `Do ${getPronouns(answers).subject} use any mobility devices? (You can select more than one)`,
    fields: [
      {
        name: 'mobilityDevices',
        type: 'radio' as const,
        multiple: true,
        options: ['Walker', 'Cane', 'Wheelchair', 'Rollator', 'None needed'],
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `Let's discuss fall history. Have ${getPronouns(answers).subject} experienced any falls in the past year?`,
    fields: [
      {
        name: 'recentFalls',
        type: 'radio' as const,
        options: ['Yes', 'No'],
        required: true,
        detailsField: {
          name: 'fallDetails',
          label: 'Please provide details about the most recent fall',
          placeholder: 'When and where did it happen?',
          required: true,
        },
      },
    ] as Field[],
  },
  {
    title: () => `What safety devices are currently installed? (You can select more than one)`,
    fields: [
      {
        name: 'safetyDevices',
        type: 'radio' as const,
        multiple: true,
        options: [
          'Smoke detectors',
          'Carbon monoxide detectors',
          'Security system',
          'Medical alert system',
          'None',
        ],
        required: true,
      },
    ] as Field[],
  },
  {
    title: () => `Finally, what's ${getPronouns(answers).possessive} budget for modifications?`,
    fields: [
      {
        name: 'budget',
        label: 'Expected budget range for home modifications',
        type: 'slider' as const,
        min: 1000,
        max: 10000,
        step: 1000,
        required: true,
      },
    ] as Field[],
    buttonText: 'Generate Report',
  },
];