import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useQuery } from '@tanstack/react-query';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

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

interface DetailBottomSheetProps {
  pwsid: string;
  utilityName: string;
  safetyLevel: SafetyLevel;
}

export const DetailBottomSheet = React.forwardRef<BottomSheetModal, DetailBottomSheetProps>(
  ({ pwsid, utilityName, safetyLevel }, ref) => {
    const db = useSQLiteContext();
    const [activeTab, setActiveTab] = React.useState<'overview' | 'violations'>('overview');
    
    const bottomSheetBg = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');
    const bottomSheetTextColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
    const subtleTextColor = useThemeColor({ light: '#666666', dark: '#cccccc' }, 'text');
    const activeTabBg = useThemeColor({ light: '#0a7ea4', dark: '#0a7ea4' }, 'tint');

    const snapPoints = React.useMemo(() => ['25%', '50%', '90%'], []);

    const { data: violations, isLoading } = useQuery({
      queryKey: ['violations', pwsid],
      queryFn: async (): Promise<ViolationRecord[]> => {
        if (!pwsid) return [];
        
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
        `, [pwsid]);
        
        return result || [];
      },
      enabled: !!pwsid,
    });

    const safetyConfig = {
      GREEN: { variant: 'safe' as const, verdict: 'Safe' },
      AMBER: { variant: 'caution' as const, verdict: 'Caution' },
      RED: { variant: 'danger' as const, verdict: 'Do Not Drink' },
    };

    const config = safetyConfig[safetyLevel];

    const renderOverview = () => (
      <ThemedView style={styles.tabContent}>
        <ThemedView style={styles.headerSection}>
          <ThemedText style={[styles.utilityName, { color: bottomSheetTextColor }]}>
            {utilityName}
          </ThemedText>
          <Badge text={config.verdict} variant={config.variant} />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: bottomSheetTextColor }]}>
            Safety Assessment
          </ThemedText>
          <ThemedText style={[styles.sectionText, { color: subtleTextColor }]}>
            {safetyLevel === 'GREEN' && 
              'This water system currently has no health-based violations and meets EPA safety standards.'
            }
            {safetyLevel === 'AMBER' && 
              'This water system has had some violations in recent years but no current health-based violations.'
            }
            {safetyLevel === 'RED' && 
              'This water system currently has active health-based violations that may pose health risks.'
            }
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: bottomSheetTextColor }]}>
            System Information
          </ThemedText>
          <ThemedView style={styles.infoGrid}>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: subtleTextColor }]}>
                System ID
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: bottomSheetTextColor }]}>
                {pwsid}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );

    const renderViolations = () => (
      <ThemedView style={styles.tabContent}>
        <ThemedText style={[styles.sectionTitle, { color: bottomSheetTextColor }]}>
          Violation History
        </ThemedText>
        
        {isLoading ? (
          <ThemedText style={[styles.loadingText, { color: bottomSheetTextColor }]}>
            Loading violations...
          </ThemedText>
        ) : violations && violations.length > 0 ? (
          <ScrollView style={styles.violationsList}>
            {violations.map((violation, index) => (
              <ThemedView key={index} style={styles.violationItem}>
                <ThemedView style={styles.violationHeader}>
                  <ThemedText style={[styles.violationDesc, { color: bottomSheetTextColor }]}>
                    {violation.violation_desc}
                  </ThemedText>
                  {violation.is_health_based_ind === 'Y' && (
                    <Badge text="Health-Based" variant="danger" />
                  )}
                </ThemedView>
                <ThemedText style={[styles.violationDate, { color: subtleTextColor }]}>
                  Started: {new Date(violation.non_compl_per_begin_date).toLocaleDateString()}
                </ThemedText>
                {violation.non_compl_per_end_date && (
                  <ThemedText style={[styles.violationDate, { color: subtleTextColor }]}>
                    Resolved: {new Date(violation.non_compl_per_end_date).toLocaleDateString()}
                  </ThemedText>
                )}
                <ThemedText style={[styles.violationStatus, { color: subtleTextColor }]}>
                  Status: {violation.violation_status}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        ) : (
          <ThemedText style={[styles.noDataText, { color: subtleTextColor }]}>
            No violations found for this water system.
          </ThemedText>
        )}
      </ThemedView>
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: bottomSheetBg }}
        handleIndicatorStyle={{ backgroundColor: subtleTextColor }}
      >
        <ThemedView style={[styles.header, { backgroundColor: bottomSheetBg }]}>
          <ThemedView style={[styles.tabBar, { backgroundColor: useThemeColor({ light: 'rgba(0, 0, 0, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' }, 'background') }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'overview' && [styles.activeTab, { backgroundColor: activeTabBg }],
              ]}
              onPress={() => setActiveTab('overview')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'overview' ? 'white' : bottomSheetTextColor },
                ]}
              >
                Overview
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'violations' && [styles.activeTab, { backgroundColor: activeTabBg }],
              ]}
              onPress={() => setActiveTab('violations')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'violations' ? 'white' : bottomSheetTextColor },
                ]}
              >
                Violations
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <BottomSheetScrollView contentContainerStyle={[styles.content, { backgroundColor: bottomSheetBg }]}>
          {activeTab === 'overview' ? renderOverview() : renderViolations()}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

DetailBottomSheet.displayName = 'DetailBottomSheet';

const styles = StyleSheet.create({
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
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
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
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
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