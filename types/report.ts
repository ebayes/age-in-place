import { z } from 'zod'

// Report Sections (the generated report)
export const REPORT_SECTIONS = [
  'Executive Summary',
  'Health Assessment',
  'Home Environment',
  'Care Requirements',
  'Safety Analysis',
  'Budget Considerations',
] as const

export type ReportSection = {
  title: typeof REPORT_SECTIONS[number]
  content: string
}

// Onboarding Answers (the questionnaire data)
export type OnboardingAnswers = {
  // Personal Info
  relationship: 'Parent/Grandparent' | 'Myself' | 'Someone else'
  firstName: string
  lastName: string
  
  // Health
  overallHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  healthDetails: string
  
  // Home
  homeDetails: string
  
  // Care & Assistance
  bathingAssistance: 'Yes' | 'No' | 'Sometimes'
  householdAssistance: string[] // Multiple selection from options
  medicationAssistance: 'Yes' | 'No'
  medicationDetails?: string // Required only if medicationAssistance is 'Yes'
  
  // Mobility
  mobilityIndoors: 'Independently' | 'With support' | 'With difficulty'
  mobilityDevices: string[] // Multiple selection from options
  
  // Safety
  recentFalls: 'Yes' | 'No'
  fallDetails?: string // Required only if recentFalls is 'Yes'
  safetyDevices: string[] // Multiple selection from options
  
  // Budget
  budget: [number, number] // Range slider values [min, max]
}

// Database Record
export type ReportRecord = {
  user_id: string
  reports: OnboardingAnswers
  report_lines: ReportSection[]
  created_at?: string // Added by Supabase
}

// Zod schema for validation
export const ReportSectionSchema = z.object({
  title: z.enum(REPORT_SECTIONS),
  content: z.string().min(50)
})

export const OnboardingAnswersSchema = z.object({
  relationship: z.enum(['Parent/Grandparent', 'Myself', 'Someone else']),
  firstName: z.string(),
  lastName: z.string(),
  overallHealth: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  healthDetails: z.string(),
  homeDetails: z.string(),
  bathingAssistance: z.enum(['Yes', 'No', 'Sometimes']),
  householdAssistance: z.array(z.string()),
  medicationAssistance: z.enum(['Yes', 'No']),
  medicationDetails: z.string().optional(),
  mobilityIndoors: z.enum(['Independently', 'With support', 'With difficulty']),
  mobilityDevices: z.array(z.string()),
  recentFalls: z.enum(['Yes', 'No']),
  fallDetails: z.string().optional(),
  safetyDevices: z.array(z.string()),
  budget: z.tuple([z.number(), z.number()])
})

export const ReportRecordSchema = z.object({
  user_id: z.string(),
  reports: OnboardingAnswersSchema,
  report_lines: z.array(ReportSectionSchema),
  created_at: z.string().optional()
})