import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ViewStyle,
  Dimensions
} from 'react-native';
import { colors, spacing } from '../utils/theme';

export interface Column {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: any, row: any, index: number) => React.ReactNode;
  width?: number | string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  style?: ViewStyle;
  emptyMessage?: string;
  horizontalScrollEnabled?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  style,
  emptyMessage = 'No data to display',
  horizontalScrollEnabled = true
}) => {
  const { width } = Dimensions.get('window');
  const totalMinWidth = columns.reduce((acc, col) => {
    // If width is a percentage string, convert it to a number
    if (typeof col.width === 'string' && col.width.includes('%')) {
      const percentage = parseFloat(col.width) / 100;
      return acc + (width * percentage);
    }
    // If width is a number, use it directly
    if (typeof col.width === 'number') {
      return acc + col.width;
    }
    // Default width if none specified
    return acc + 100;
  }, 0);

  // Function to render cell content
  const renderCellContent = (column: Column, row: any, rowIndex: number) => {
    if (column.renderCell) {
      return column.renderCell(row[column.id], row, rowIndex);
    }
    
    return (
      <Text 
        style={[
          styles.cellText, 
          { textAlign: column.align || 'left' }
        ]}
      >
        {row[column.id]}
      </Text>
    );
  };

  const tableContent = (
    <>
      {/* Table Header */}
      <View style={styles.headerRow}>
        {columns.map((column, index) => (
          <View 
            key={`header-${index}`} 
            style={[
              styles.headerCell, 
              { 
                width: column.width, 
                flex: column.width ? undefined : 1,
              }
            ]}
          >
            <Text 
              style={[
                styles.headerText, 
                { textAlign: column.align || 'left' }
              ]}
            >
              {column.label}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Table Body */}
      {data.length > 0 ? (
        data.map((row, rowIndex) => (
          <View 
            key={`row-${rowIndex}`} 
            style={[
              styles.dataRow, 
              rowIndex % 2 === 0 ? styles.evenRow : null
            ]}
          >
            {columns.map((column, colIndex) => (
              <View 
                key={`cell-${rowIndex}-${colIndex}`} 
                style={[
                  styles.dataCell, 
                  { 
                    width: column.width, 
                    flex: column.width ? undefined : 1,
                  }
                ]}
              >
                {renderCellContent(column, row, rowIndex)}
              </View>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </>
  );

  // If horizontal scrolling is enabled and table is wider than screen
  if (horizontalScrollEnabled && totalMinWidth > width) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: totalMinWidth }}>
            {tableContent}
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // Otherwise, render normally
  return (
    <View style={[styles.container, style]}>
      {tableContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 0,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textPrimary}30`,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundDark,
  },
  headerCell: {
    paddingHorizontal: spacing.xs,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textPrimary}10`,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  evenRow: {
    backgroundColor: `${colors.backgroundMedium}40`,
  },
  dataCell: {
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default DataTable;