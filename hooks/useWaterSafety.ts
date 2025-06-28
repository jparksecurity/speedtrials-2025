import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

export type SafetyLevel = 'GREEN' | 'AMBER' | 'RED';

export function useWaterSafety(pwsid: string) {
  const db = useSQLiteContext();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['waterSafety', pwsid],
    queryFn: async (): Promise<SafetyLevel> => {
      if (!pwsid) return 'GREEN';
      
      const result = await db.getFirstAsync<{ flag: number }>(`
        SELECT
          CASE
            WHEN EXISTS(
              SELECT 1
              FROM SDWA_VIOLATIONS_ENFORCEMENT
              WHERE PWSID = ?
                AND IS_HEALTH_BASED_IND = 'Y'
                AND (NON_COMPL_PER_END_DATE IS NULL
                     OR VIOLATION_STATUS IN ('Unaddressed','Addressed'))
            ) THEN 2
            WHEN EXISTS(
              SELECT 1
              FROM SDWA_VIOLATIONS_ENFORCEMENT
              WHERE PWSID = ?
                AND DATE(NON_COMPL_PER_END_DATE) >= DATE('now', '-3 years')
            ) THEN 1
            ELSE 0
          END AS flag
      `, [pwsid, pwsid]);
      
      const flagValue = result?.flag ?? 0;
      return (['GREEN', 'AMBER', 'RED'] as const)[flagValue];
    },
    enabled: !!pwsid,
  });
  
  return { 
    safetyLevel: data, 
    isLoading, 
    error 
  };
}