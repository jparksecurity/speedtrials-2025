import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useQuery } from '@tanstack/react-query';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Badge } from '@/components/ui/Badge';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafetyLevel } from '@/hooks/useWaterSafety';

interface ViolationRecord {
  violation_desc: string;
  non_compl_per_begin_date: string;
  non_compl_per_end_date: string | null;
  violation_status: string;
  is_health_based_ind: string;
}

export default function DetailModal() {
  const router = useRouter();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{
    pwsid: string;
    utilityName: string;
    safetyLevel: SafetyLevel;
  }>();

  const [activeTab, setActiveTab] = React.useState<'overview' | 'violations'>('overview');
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const snapPoints = React.useMemo(() => ['25%', '50%', '90%'], []);

  // Bottom sheet will open automatically based on index prop

  const { data: violations, isLoading } = useQuery({
    queryKey: ['violations', params.pwsid],
    queryFn: async (): Promise<ViolationRecord[]> => {
      if (!params.pwsid) return [];
      
      const result = await db.getAllAsync<ViolationRecord>(`
        SELECT 
          VIOLATION_DESC as violation_desc,
          NON_COMPL_PER_BEGIN_DATE as non_compl_per_begin_date,
          NON_COMPL_PER_END_DATE as non_compl_per_end_date,
          VIOLATION_STATUS as violation_status,
          IS_HEALTH_BASED_IND as is_health_based_ind
        FROM SDWA_VIOLATIONS_ENFORCEMENT 
        WHERE PWSID = ? 
        ORDER BY NON_COMPL_PER_BEGIN_DATE DESC
        LIMIT 50
      `, [params.pwsid]);
      
      return result || [];
    },
    enabled: !!params.pwsid,
  });

  const safetyConfig = {
    GREEN: { variant: 'safe' as const, verdict: 'Safe' },
    AMBER: { variant: 'caution' as const, verdict: 'Caution' },
    RED: { variant: 'danger' as const, verdict: 'Do Not Drink' },
  };

  const config = safetyConfig[params.safetyLevel as SafetyLevel];

  const handleClose = () => {
    router.back();
  };

  const renderOverview = () => (
    <ThemedView style={styles.tabContent}>
      <ThemedView style={styles.headerSection}>
        <ThemedText style={[styles.utilityName, { color: textColor }]}>
          {params.utilityName}
        </ThemedText>
        <Badge text={config.verdict} variant={config.variant} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Safety Assessment
        </ThemedText>
        <ThemedText style={[styles.sectionText, { color: textColor }]}>
          {params.safetyLevel === 'GREEN' && 
            'This water system currently has no health-based violations and meets EPA safety standards.'
          }
          {params.safetyLevel === 'AMBER' && 
            'This water system has had some violations in recent years but no current health-based violations.'
          }
          {params.safetyLevel === 'RED' && 
            'This water system currently has active health-based violations that may pose health risks.'
          }
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          System Information
        </ThemedText>
        <ThemedView style={styles.infoGrid}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: textColor }]}>
              System ID
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: textColor }]}>
              {params.pwsid}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderViolations = () => (
    <ThemedView style={styles.tabContent}>
      <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
        Violation History
      </ThemedText>
      
      {isLoading ? (
        <ThemedText style={[styles.loadingText, { color: textColor }]}>
          Loading violations...
        </ThemedText>
      ) : violations && violations.length > 0 ? (
        <ScrollView style={styles.violationsList}>
          {violations.map((violation, index) => (
            <ThemedView key={index} style={styles.violationItem}>
              <ThemedView style={styles.violationHeader}>
                <ThemedText style={[styles.violationDesc, { color: textColor }]}>
                  {violation.violation_desc}
                </ThemedText>
                {violation.is_health_based_ind === 'Y' && (
                  <Badge text="Health-Based" variant="danger" />
                )}
              </ThemedView>
              <ThemedText style={[styles.violationDate, { color: textColor }]}>
                Started: {new Date(violation.non_compl_per_begin_date).toLocaleDateString()}
              </ThemedText>
              {violation.non_compl_per_end_date && (
                <ThemedText style={[styles.violationDate, { color: textColor }]}>
                  Resolved: {new Date(violation.non_compl_per_end_date).toLocaleDateString()}
                </ThemedText>
              )}
              <ThemedText style={[styles.violationStatus, { color: textColor }]}>
                Status: {violation.violation_status}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      ) : (
        <ThemedText style={[styles.noDataText, { color: textColor }]}>
          No violations found for this water system.
        </ThemedText>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
      </SafeAreaView>
      
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onClose={handleClose}
        backgroundStyle={{ backgroundColor }}
        handleIndicatorStyle={{ backgroundColor: textColor }}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.tabBar}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'overview' && [styles.activeTab, { backgroundColor: tintColor }],
              ]}
              onPress={() => setActiveTab('overview')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'overview' ? 'white' : textColor },
                ]}
              >
                Overview
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'violations' && [styles.activeTab, { backgroundColor: tintColor }],
              ]}
              onPress={() => setActiveTab('violations')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'violations' ? 'white' : textColor },
                ]}
              >
                Violations
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {activeTab === 'overview' ? renderOverview() : renderViolations()}
        </BottomSheetScrollView>
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    // backgroundColor set dynamically
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  tabContent: {
    paddingTop: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  utilityName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'SpaceMono',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 32,
    opacity: 0.6,
  },
  violationsList: {
    maxHeight: 400,
  },
  violationItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  violationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  violationDesc: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  violationDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  violationStatus: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 