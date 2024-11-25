'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { Assessment, AssessmentsContextType } from '@/types/types';

const AssessmentsContext = createContext<AssessmentsContextType | undefined>(undefined);

export const AssessmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseClient = useSupabaseClient();

  const loadAssessments = async () => {
    setLoading(true);
    try {
      if (!supabaseClient || !isSignedIn || !user) return;

      const { data, error } = await supabaseClient
        .from('assessments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setAssessments(data || []);
    } catch (error) {
      //  console.error('Error loading assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadAssessments();
    } else {
      setAssessments([]);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <AssessmentsContext.Provider
      value={{
        assessments,
        loading,
        refreshAssessments: loadAssessments,
      }}
    >
      {children}
    </AssessmentsContext.Provider>
  );
};

export const useAssessmentsContext = () => {
  const context = useContext(AssessmentsContext);
  if (!context) {
    throw new Error('useAssessmentsContext must be used within an AssessmentsProvider');
  }
  return context;
};