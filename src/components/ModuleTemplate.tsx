import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  ScrollView, 
  ViewStyle,
  ScrollViewProps
} from 'react-native';
import { colors, spacing, createShadow } from '../utils/theme';

interface ModuleTemplateProps {
  title: string;
  chart: React.ReactNode;
  table: React.ReactNode;
  summary?: React.ReactNode;
  style?: ViewStyle;
  scrollViewProps?: Partial<ScrollViewProps>;
}

const ModuleTemplate: React.FC<ModuleTemplateProps> = ({
  title,
  chart,
  table,
  summary,
  style,
  scrollViewProps
}) => {
  const { width, height } = Dimensions.get('window');
  // Use the same fixed height for all modules
  const chartHeight = 300;
  
  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {/* Chart Section - Fixed height, full width */}
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        {chart}
      </View>
      
      {/* Optional Summary Section (acts as legend) */}
      {summary && (
        <View style={styles.summaryContainer}>
          {summary}
        </View>
      )}
      
      {/* Table Section - Scrollable */}
      <View style={styles.tableContainer}>
        {table}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMedium,
  },
  contentContainer: {
    paddingBottom: 110, // Space for action bar
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chartContainer: {
    width: '100%',
    backgroundColor: colors.backgroundMedium,
    marginBottom: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  summaryContainer: {
    backgroundColor: colors.backgroundDark,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 0,
    ...createShadow(4, 'rgba(0,0,0,0.2)'),
  },
  tableContainer: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 0,
    overflow: 'hidden',
    ...createShadow(8, 'rgba(0,0,0,0.2)'),
  },
});

export default ModuleTemplate;