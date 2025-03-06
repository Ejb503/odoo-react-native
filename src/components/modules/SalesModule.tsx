import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../utils/theme';
import ModuleTemplate from '../ModuleTemplate';
import DataTable from '../DataTable';

// Mock data for Sales module
const SALES_DATA = {
  monthlySales: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [45, 52, 49, 62, 78, 84, 91, 86, 94, 105, 118, 123],
    totalRevenue: 987000,
    yearGrowth: 28.6,
    currentMonth: 'December',
    currentValue: 123000
  },
  monthlyDetails: [
    { month: 'January', revenue: 45000, orders: 320, growth: -2.5 },
    { month: 'February', revenue: 52000, orders: 380, growth: 15.6 },
    { month: 'March', revenue: 49000, orders: 350, growth: -5.8 },
    { month: 'April', revenue: 62000, orders: 410, growth: 26.5 },
    { month: 'May', revenue: 78000, orders: 520, growth: 25.8 },
    { month: 'June', revenue: 84000, orders: 580, growth: 7.7 },
    { month: 'July', revenue: 91000, orders: 610, growth: 8.3 },
    { month: 'August', revenue: 86000, orders: 590, growth: -5.5 },
    { month: 'September', revenue: 94000, orders: 650, growth: 9.3 },
    { month: 'October', revenue: 105000, orders: 720, growth: 11.7 },
    { month: 'November', revenue: 118000, orders: 810, growth: 12.4 },
    { month: 'December', revenue: 123000, orders: 850, growth: 4.2 }
  ]
};

const chartConfig = {
  backgroundGradientFrom: colors.backgroundMedium,
  backgroundGradientTo: colors.backgroundMedium,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: colors.primary
  },
  propsForLabels: {
    fontSize: 12,
  }
};

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const renderGrowth = (value: number) => {
  const color = value >= 0 ? colors.success : colors.error;
  const prefix = value >= 0 ? '+' : '';
  
  return (
    <Text style={[styles.growthText, { color }]}>
      {prefix}{value.toFixed(1)}%
    </Text>
  );
};

const tableColumns = [
  {
    id: 'month',
    label: 'Month',
    align: 'left' as const,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    align: 'right' as const,
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {formatCurrency(value)}
      </Text>
    )
  },
  {
    id: 'orders',
    label: 'Orders',
    align: 'right' as const,
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {value}
      </Text>
    )
  },
  {
    id: 'growth',
    label: 'Growth',
    align: 'right' as const,
    renderCell: renderGrowth
  }
];

const SalesModule: React.FC = () => {
  const { width } = Dimensions.get('window');
  
  // Format data for line chart
  const lineChartData = {
    labels: SALES_DATA.monthlySales.labels,
    datasets: [
      {
        data: SALES_DATA.monthlySales.data,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 3
      }
    ],
    legend: ['Monthly Sales ($k)']
  };

  // Render the chart component
  const renderChart = () => (
    <View style={styles.chartWrapper}>
      <LineChart
        data={lineChartData}
        width={width - 20} // Slight padding to avoid clipping
        height={300}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisSuffix="k"
        yAxisLabel="$"
        withInnerLines={false}
        withOuterLines={true}
        withDots={true}
        withVerticalLines={false}
        fromZero={false}
      />
    </View>
  );

  // Render the summary component
  const renderSummary = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{formatCurrency(SALES_DATA.monthlySales.totalRevenue)}</Text>
        <Text style={styles.statLabel}>Total Revenue</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{formatCurrency(SALES_DATA.monthlySales.currentValue)}</Text>
        <Text style={styles.statLabel}>{SALES_DATA.monthlySales.currentMonth}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.accent }]}>+{SALES_DATA.monthlySales.yearGrowth}%</Text>
        <Text style={styles.statLabel}>YoY Growth</Text>
      </View>
    </View>
  );

  // Render the table component
  const renderTable = () => (
    <DataTable
      columns={tableColumns}
      data={SALES_DATA.monthlyDetails}
      horizontalScrollEnabled={true}
    />
  );

  return (
    <ModuleTemplate
      title="Sales Performance"
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
    height: 280,
  },
  chart: {
    borderRadius: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: `${colors.backgroundLight}10`,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cellText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  }
});

export default SalesModule;