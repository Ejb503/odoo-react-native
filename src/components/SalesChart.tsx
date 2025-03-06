import React from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView } from 'react-native';
import { LineChart, BarChart, ContributionGraph, PieChart } from 'react-native-chart-kit';
import { colors, spacing } from '../utils/theme';
import GlassCard from './GlassCard';

interface SalesChartProps {
  data?: {
    monthly: Array<{ month: string; sales: number }>;
    quarterly: Array<{ quarter: string; sales: number }>;
    categories: Array<{ category: string; percentage: number }>;
  };
}

// Mock data if none is provided
const mockData = {
  monthly: [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 49000 },
    { month: 'Apr', sales: 62000 },
    { month: 'May', sales: 78000 },
    { month: 'Jun', sales: 84000 },
    { month: 'Jul', sales: 91000 },
    { month: 'Aug', sales: 86000 },
    { month: 'Sep', sales: 94000 },
    { month: 'Oct', sales: 105000 },
    { month: 'Nov', sales: 118000 },
    { month: 'Dec', sales: 123000 },
  ],
  quarterly: [
    { quarter: 'Q1', sales: 146000 },
    { quarter: 'Q2', sales: 224000 },
    { quarter: 'Q3', sales: 271000 },
    { quarter: 'Q4', sales: 346000 },
  ],
  categories: [
    { category: 'Electronics', percentage: 35 },
    { category: 'Furniture', percentage: 25 },
    { category: 'Clothing', percentage: 20 },
    { category: 'Home Goods', percentage: 15 },
    { category: 'Other', percentage: 5 },
  ]
};

const formatCurrency = (value: number) => {
  return `$${(value / 1000).toFixed(0)}k`;
};

const chartConfig = {
  backgroundGradientFrom: `${colors.backgroundMedium}00`,
  backgroundGradientTo: `${colors.backgroundMedium}00`,
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary
  },
  propsForLabels: {
    fontSize: 11,
  }
};

const SalesChart: React.FC<SalesChartProps> = ({ data = mockData }) => {
  const { width } = Dimensions.get('window');
  const chartWidth = width > 500 ? 500 : width - 60;

  // Format data for line chart
  const lineChartData = {
    labels: data.monthly.map(item => item.month),
    datasets: [
      {
        data: data.monthly.map(item => item.sales / 1000), // Convert to thousands for cleaner display
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Monthly Sales ($k)']
  };

  // Format data for bar chart
  const barChartData = {
    labels: data.quarterly.map(item => item.quarter),
    datasets: [
      {
        data: data.quarterly.map(item => item.sales / 1000), // Convert to thousands
        colors: [
          (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          (opacity = 1) => `rgba(58, 191, 248, ${opacity})`,
          (opacity = 1) => `rgba(54, 211, 153, ${opacity})`,
          (opacity = 1) => `rgba(248, 114, 114, ${opacity})`,
        ]
      }
    ]
  };

  // Format data for pie chart
  const pieChartData = data.categories.map((item: { category: string; percentage: number }) => ({
    name: item.category,
    population: item.percentage,
    color: item.category === 'Electronics' ? colors.primary : 
           item.category === 'Furniture' ? colors.secondary :
           item.category === 'Clothing' ? colors.accent :
           item.category === 'Home Goods' ? colors.info :
           colors.error,
    legendFontColor: colors.textSecondary,
    legendFontSize: 12
  }));

  return (
    <ScrollView>
      <GlassCard style={styles.container}>
        <Text style={styles.title}>Sales Performance Dashboard</Text>
        <Text style={styles.subtitle}>Annual Sales Overview</Text>
        
        {/* Monthly Sales Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={lineChartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            yAxisSuffix="k"
            // Use decorator to format label with "$" prefix
            decorator={(value) => `$${value}`}
          />
        </View>

        <Text style={styles.subtitle}>Quarterly Summary</Text>
        
        {/* Quarterly Sales Bar Chart */}
        <View style={styles.chartContainer}>
          <BarChart
            data={barChartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, _index) => `rgba(58, 191, 248, ${opacity})`
            }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
            yAxisSuffix="k"
            // Use decorator to format label with "$" prefix
            decorator={(value) => `$${value}`}
          />
        </View>

        <Text style={styles.subtitle}>Sales by Category</Text>
        
        {/* Category Distribution Pie Chart */}
        <View style={styles.chartContainer}>
          <PieChart
            data={pieChartData}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
            style={styles.chart}
          />
        </View>

        {/* Sales statistics summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(987000)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>28.6%</Text>
            <Text style={styles.statLabel}>YoY Growth</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,243</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    margin: spacing.md,
    alignSelf: 'center',
    width: '95%',
    maxWidth: 600
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    textAlign: 'center'
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
    backgroundColor: `${colors.backgroundMedium}50`,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${colors.textPrimary}20`,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  chart: {
    borderRadius: 16,
    marginVertical: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default SalesChart;