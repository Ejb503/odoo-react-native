import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors, spacing } from '../../utils/theme';
import ModuleTemplate from '../ModuleTemplate';
import DataTable, { Column } from '../DataTable';

// Mock data for Customers module
const CUSTOMERS_DATA = {
  summary: {
    totalCustomers: 1245,
    newThisMonth: 37,
    activeCustomers: 912,
    retentionRate: 94.2,
    lifetimeValue: 2850
  },
  customerSegments: [
    { name: 'Enterprise', percentage: 15, color: colors.primary },
    { name: 'Small Business', percentage: 35, color: colors.secondary },
    { name: 'Retail', percentage: 45, color: colors.accent },
    { name: 'Other', percentage: 5, color: colors.error }
  ],
  detailedData: [
    { segment: 'Enterprise', count: 187, revenue: 855000, growth: 12.3, avgValue: 4572 },
    { segment: 'Small Business', count: 436, revenue: 523000, growth: 8.7, avgValue: 1199 },
    { segment: 'Retail', count: 560, revenue: 392000, growth: 5.2, avgValue: 700 },
    { segment: 'Other', count: 62, revenue: 68000, growth: -1.8, avgValue: 1096 }
  ]
};

const chartConfig = {
  backgroundGradientFrom: colors.backgroundMedium,
  backgroundGradientTo: colors.backgroundMedium,
  color: (opacity = 1) => `rgba(54, 211, 153, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
  propsForLabels: {
    fontSize: 13,
  }
};

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const renderGrowth = (value: number) => {
  const color = value >= 0 ? colors.success : colors.error;
  const prefix = value >= 0 ? '+' : '';
  
  return (
    <Text style={[styles.cellText, { color, textAlign: 'right' }]}>
      {prefix}{value.toFixed(1)}%
    </Text>
  );
};

const tableColumns: Column[] = [
  {
    id: 'segment',
    label: 'Segment',
    align: 'left',
    renderCell: (value: string, row: any) => {
      const segment = CUSTOMERS_DATA.customerSegments.find(s => s.name === value);
      return (
        <View style={styles.segmentCell}>
          <View style={[styles.segmentDot, { backgroundColor: segment?.color || colors.textSecondary }]} />
          <Text style={styles.segmentText}>{value}</Text>
        </View>
      );
    }
  },
  {
    id: 'count',
    label: 'Customers',
    align: 'right',
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {value.toLocaleString()}
      </Text>
    )
  },
  {
    id: 'revenue',
    label: 'Revenue',
    align: 'right',
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {formatCurrency(value)}
      </Text>
    )
  },
  {
    id: 'avgValue',
    label: 'Avg. Value',
    align: 'right',
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {formatCurrency(value)}
      </Text>
    )
  },
  {
    id: 'growth',
    label: 'Growth',
    align: 'right',
    renderCell: renderGrowth
  }
];

const CustomersModule: React.FC = () => {
  const { width } = Dimensions.get('window');

  // Format data for pie chart
  const pieChartData = CUSTOMERS_DATA.customerSegments.map(item => ({
    name: item.name,
    population: item.percentage,
    color: item.color,
    legendFontColor: colors.textPrimary,
    legendFontSize: 14
  }));

  // Render the chart component
  const renderChart = () => (
    <View style={styles.chartWrapper}>
      <PieChart
        paddingLeft='0'
        data={pieChartData}
        width={width}
        height={240}
        backgroundColor="transparent"
        chartConfig={chartConfig}
        accessor="population"
        center={[width / 2, 120]}
        hasLegend={false}
      />
    </View>
  );

  // Render the summary component
  const renderSummary = () => (
    <View style={styles.statsContainer}>
      {/* Segment legend */}
      <View style={styles.legendContainer}>
        {CUSTOMERS_DATA.customerSegments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendText}>
                {segment.name}
              </Text>
              <Text style={[styles.legendPercentage, { color: segment.color }]}>
                {segment.percentage}%
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* Summary stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{CUSTOMERS_DATA.summary.totalCustomers}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: colors.accent}]}>+{CUSTOMERS_DATA.summary.newThisMonth}</Text>
          <Text style={styles.statLabel}>New This Month</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: colors.success}]}>{CUSTOMERS_DATA.summary.retentionRate}%</Text>
          <Text style={styles.statLabel}>Retention Rate</Text>
        </View>
      </View>
    </View>
  );

  // Render the table component
  const renderTable = () => (
    <DataTable
      columns={tableColumns}
      data={CUSTOMERS_DATA.detailedData}
      horizontalScrollEnabled={true}
    />
  );

  return (
    <ModuleTemplate
      title="Customer Segments"
      chart={renderChart()}
      summary={renderSummary()}
      table={renderTable()}
    />
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  statsContainer: {
    width: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: `${colors.backgroundLight}20`,
    borderRadius: 8,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
    borderWidth: 2,
    borderColor: `${colors.backgroundLight}40`,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: `${colors.textPrimary}15`,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  segmentCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  segmentText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  cellText: {
    fontSize: 14,
    color: colors.textPrimary,
  }
});

export default CustomersModule;