import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { colors } from '../../utils/theme';
import ModuleTemplate from '../ModuleTemplate';
import DataTable from '../DataTable';

// Mock data for Inventory module
const INVENTORY_DATA = {
  summary: {
    totalProducts: 1548,
    lowStock: 32,
    outOfStock: 8,
    incomingShipments: 12
  },
  stockLevels: {
    categories: ["Electronics", "Furniture", "Clothing", "Home Goods"],
    values: [0.78, 0.62, 0.85, 0.44],
    details: [
      { category: "Electronics", level: 0.78, total: 487, warning: 32, critical: 8 },
      { category: "Furniture", level: 0.62, total: 356, warning: 24, critical: 6 },
      { category: "Clothing", level: 0.85, total: 512, warning: 12, critical: 2 },
      { category: "Home Goods", level: 0.44, total: 193, warning: 42, critical: 18 }
    ]
  },
  itemsData: [
    { id: 1, name: 'iPhone 13 Pro', category: 'Electronics', stock: 124, status: 'Good', reorder: 25 },
    { id: 2, name: 'Smart TV 55"', category: 'Electronics', stock: 58, status: 'Good', reorder: 15 },
    { id: 3, name: 'Wireless Earbuds', category: 'Electronics', stock: 253, status: 'Good', reorder: 50 },
    { id: 4, name: 'Leather Sofa', category: 'Furniture', stock: 14, status: 'Low', reorder: 10 },
    { id: 5, name: 'Office Chair', category: 'Furniture', stock: 27, status: 'Good', reorder: 20 },
    { id: 6, name: 'Coffee Table', category: 'Furniture', stock: 8, status: 'Critical', reorder: 15 },
    { id: 7, name: 'Winter Jacket', category: 'Clothing', stock: 82, status: 'Good', reorder: 30 },
    { id: 8, name: 'Cotton T-Shirt', category: 'Clothing', stock: 215, status: 'Good', reorder: 100 },
    { id: 9, name: 'Kitchen Mixer', category: 'Home Goods', stock: 0, status: 'Out', reorder: 12 },
    { id: 10, name: 'Blender', category: 'Home Goods', stock: 5, status: 'Critical', reorder: 15 }
  ]
};

const chartConfig = {
  backgroundGradientFrom: colors.backgroundMedium,
  backgroundGradientTo: colors.backgroundMedium,
  color: (opacity = 1) => `rgba(58, 191, 248, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  }
};

const formatQuantity = (value: number) => {
  return value.toLocaleString('en-US');
};

const getCategoryColor = (index: number) => {
  const categoryColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.info || '#36A2EB'
  ];
  return categoryColors[index % categoryColors.length];
};

const getStockLevelText = (value: number) => {
  if (value >= 0.75) return 'Healthy';
  if (value >= 0.5) return 'Adequate';
  if (value >= 0.25) return 'Low';
  return 'Critical';
};

const getStockLevelColor = (value: number) => {
  if (value >= 0.75) return colors.success;
  if (value >= 0.5) return colors.info;
  if (value >= 0.25) return colors.warning;
  return colors.error;
};

const getStatusColor = (status: string) => {
  const statusColors = {
    'Good': colors.success,
    'Low': colors.warning,
    'Critical': colors.error,
    'Out': colors.error
  };
  return statusColors[status as keyof typeof statusColors] || colors.textSecondary;
};

const renderStatus = (status: string) => {
  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
        {status}
      </Text>
    </View>
  );
};

const tableColumns = [
  {
    id: 'name',
    label: 'Product',
    align: 'left' as const,
    width: '35%',
  },
  {
    id: 'category',
    label: 'Category',
    align: 'left' as const,
    width: '20%',
  },
  {
    id: 'stock',
    label: 'Stock',
    align: 'right' as const,
    width: '15%',
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {formatQuantity(value)}
      </Text>
    )
  },
  {
    id: 'status',
    label: 'Status',
    align: 'center' as const,
    width: '15%',
    renderCell: renderStatus
  },
  {
    id: 'reorder',
    label: 'Reorder Point',
    align: 'right' as const,
    width: '15%',
    renderCell: (value: number) => (
      <Text style={[styles.cellText, { textAlign: 'right' }]}>
        {value}
      </Text>
    )
  }
];

const InventoryModule: React.FC = () => {
  const { width } = Dimensions.get('window');
  
  // Format data for progress chart
  const progressData = {
    labels: INVENTORY_DATA.stockLevels.categories,
    data: INVENTORY_DATA.stockLevels.values,
    colors: [
      colors.primary,
      colors.secondary,
      colors.accent,
      colors.info || '#36A2EB'
    ]
  };

  // Render the chart component
  const renderChart = () => (
    <View style={styles.chartWrapper}>
      <ProgressChart
        data={progressData}
        width={width}
        height={300}
        chartConfig={{
          ...chartConfig,
          color: (opacity = 1, index) => {
            if (typeof index === 'number') {
              return getCategoryColor(index);
            }
            return `rgba(255, 255, 255, ${opacity})`;
          }
        }}
        strokeWidth={16}
        radius={32}
        hideLegend={true}
      />
    </View>
  );

  // Render the summary component
  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      {/* Legend */}
      <View style={styles.legendGrid}>
        {INVENTORY_DATA.stockLevels.details.map((category, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getCategoryColor(index) }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <Text style={[styles.categoryStatus, { color: getStockLevelColor(category.level) }]}>
                {Math.round(category.level * 100)}% • {getStockLevelText(category.level)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* Summary stats */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatQuantity(INVENTORY_DATA.summary.totalProducts)}</Text>
          <Text style={styles.summaryLabel}>Total Products</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>{INVENTORY_DATA.summary.lowStock}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.error }]}>{INVENTORY_DATA.summary.outOfStock}</Text>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
        </View>
      </View>
    </View>
  );

  // Render the table component
  const renderTable = () => (
    <DataTable
      columns={tableColumns}
      data={INVENTORY_DATA.itemsData}
      horizontalScrollEnabled={true}
    />
  );

  return (
    <ModuleTemplate
      title="Inventory Status"
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
  summaryContainer: {
    width: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-around',
  },
  legendItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: `${colors.textPrimary}15`,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryName: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  categoryStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  cellText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  }
});

export default InventoryModule;