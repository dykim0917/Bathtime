import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { BathEnvironment, UserProfile } from '@/src/engine/types';
import { useUserProfile } from '@/src/hooks/useUserProfile';

export default function OnboardingHealthRedirect() {
  const { environment, allowBack } = useLocalSearchParams<{
    environment?: string;
    allowBack?: string;
  }>();
  const { save } = useUserProfile();

  useEffect(() => {
    const completeWithoutHealthInfo = async () => {
      const now = new Date().toISOString();
      const profile: UserProfile = {
        bathEnvironment: (environment as BathEnvironment) || 'bathtub',
        healthConditions: ['none'],
        onboardingComplete: true,
        createdAt: now,
        updatedAt: now,
      };
      await save(profile);
      router.replace(
        allowBack === '1'
          ? { pathname: '/(tabs)/my', params: { tab: 'settings' } } as any
          : '/onboarding/greeting'
      );
    };

    void completeWithoutHealthInfo();
  }, [allowBack, environment, save]);

  return null;
}
