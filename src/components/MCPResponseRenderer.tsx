import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { 
  Text, 
  Card, 
  DataTable, 
  IconButton, 
  Divider, 
  Surface,
  Chip,
  Badge,
  ActivityIndicator
} from 'react-native-paper';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Platform } from 'react-native';
import { MCPResponse, MCPErrorResponse } from '../api/mcpService';
import { colors, spacing, createShadow } from '../utils/theme';
import GlassCard from './GlassCard';

interface MCPResponseRendererProps {
  response: MCPResponse | null;
}

/**
 * Component that renders different types of responses from the MCP service
 * Handles text, image, list, table, and error responses with appropriate UI
 */
const MCPResponseRenderer: React.FC<MCPResponseRendererProps> = ({ response }) => {
  const [imageLoading, setImageLoading] = useState(false);
  const { width } = useWindowDimensions();
  
  // If no response yet, show nothing
  if (!response) {
    return null;
  }

  // Show a placeholder when empty
  const isEmptyResponse = 
    (response.type === 'text' && !response.content) ||
    (response.type === 'list' && (!response.content.items || response.content.items.length === 0)) ||
    (response.type === 'table' && (!response.content.rows || response.content.rows.length === 0));

  if (isEmptyResponse) {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <GlassCard style={styles.emptyContainer} elevation={2}>
          <IconButton 
            icon="information-outline" 
            size={28} 
            iconColor={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No data available</Text>
        </GlassCard>
      </Animated.View>
    );
  }

  // Different rendering for web vs native for better compatibility
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={styles.container}>
        <View>
          <GlassCard style={styles.card} elevation={4}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{getResponseTitle(response)}</Text>
              <Chip 
                mode="outlined" 
                style={styles.typeChip}
                textStyle={{ color: colors.primary }}
              >
                {response.type}
              </Chip>
            </View>
            <Divider style={styles.divider} />
            <View>
              {renderContent(response, { setImageLoading, imageLoading, screenWidth: width })}
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    );
  }

  // Native platforms with animations
  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeIn.duration(500)}>
        <GlassCard style={styles.card} elevation={4}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{getResponseTitle(response)}</Text>
            <Chip 
              mode="outlined" 
              style={styles.typeChip}
              textStyle={{ color: colors.primary }}
            >
              {response.type}
            </Chip>
          </View>
          <Divider style={styles.divider} />
          <Animated.View entering={SlideInUp.duration(400).delay(200)}>
            {renderContent(response, { setImageLoading, imageLoading, screenWidth: width })}
          </Animated.View>
        </GlassCard>
      </Animated.View>
    </ScrollView>
  );
};

// Get an appropriate title based on response type
const getResponseTitle = (response: MCPResponse): string => {
  switch (response.type) {
    case 'text':
      return 'Text Response';
    case 'image':
      return 'Image';
    case 'list':
      return response.content.title || 'List';
    case 'table':
      return 'Table Data';
    case 'error':
      return 'Error';
    default:
      return 'Response';
  }
};

// Render the appropriate content based on response type
const renderContent = (
  response: MCPResponse, 
  options: { 
    setImageLoading: (loading: boolean) => void; 
    imageLoading: boolean;
    screenWidth: number; 
  }
) => {
  const { setImageLoading, imageLoading, screenWidth } = options;
  
  switch (response.type) {
    case 'text':
      return (
        <Card.Content style={styles.contentPadding}>
          <Text style={styles.textResponse}>{response.content}</Text>
        </Card.Content>
      );
    
    case 'image':
      return (
        <Card.Content style={styles.imagePadding}>
          {imageLoading && (
            <View style={styles.imageLoaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          <Image 
            source={{ uri: response.content }} 
            style={[styles.image, { width: screenWidth * 0.85, height: screenWidth * 0.5 }]}
            resizeMode="contain"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
        </Card.Content>
      );
    
    case 'list':
      return (
        <Card.Content style={styles.contentPadding}>
          {response.content.items.map((item: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <Badge size={24} style={styles.listItemBadge}>{index + 1}</Badge>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </Card.Content>
      );
    
    case 'table':
      return (
        <Card.Content style={styles.tablePadding}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.tableHeader}>
                {response.content.headers.map((header: string, index: number) => (
                  <DataTable.Title key={index} style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>{header}</Text>
                  </DataTable.Title>
                ))}
              </DataTable.Header>

              {response.content.rows.map((row: string[], rowIndex: number) => (
                <DataTable.Row key={rowIndex} style={rowIndex % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  {row.map((cell, cellIndex) => (
                    <DataTable.Cell key={cellIndex} style={styles.tableCell}>
                      <Text style={styles.tableCellText}>{cell}</Text>
                    </DataTable.Cell>
                  ))}
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        </Card.Content>
      );
    
    case 'error':
      const errorResponse = response as MCPErrorResponse;
      return (
        <Card.Content style={styles.errorContent}>
          <View style={styles.errorContainer}>
            <IconButton
              icon="alert-circle"
              size={24}
              iconColor={colors.error}
              style={styles.errorIcon}
            />
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorText}>{errorResponse.content}</Text>
              {errorResponse.code && (
                <Text style={styles.errorCode}>Error code: {errorResponse.code}</Text>
              )}
            </View>
          </View>
        </Card.Content>
      );
    
    default:
      return (
        <Card.Content style={styles.contentPadding}>
          <Text>Unknown response type</Text>
        </Card.Content>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    width: '100%',
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.textPrimary}15`,
  },
  contentPadding: {
    padding: spacing.lg,
  },
  imagePadding: {
    padding: spacing.md,
    alignItems: 'center',
  },
  tablePadding: {
    padding: spacing.md,
  },
  textResponse: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  image: {
    borderRadius: 12,
    ...createShadow(3, colors.backgroundLight),
  },
  imageLoaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textPrimary}10`,
  },
  listItemBadge: {
    backgroundColor: colors.primary,
    marginRight: spacing.md,
    marginTop: 2,
  },
  listItemText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    backgroundColor: `${colors.backgroundLight}80`,
  },
  tableHeaderCell: {
    padding: spacing.sm,
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.primary,
  },
  tableRowEven: {
    backgroundColor: `${colors.backgroundMedium}50`,
  },
  tableRowOdd: {
    backgroundColor: `${colors.backgroundLight}30`,
  },
  tableCell: {
    padding: spacing.sm,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  errorContent: {
    padding: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.backgroundLight}70`,
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    ...createShadow(2, `${colors.error}30`),
  },
  errorIcon: {
    margin: 0,
    marginRight: spacing.sm,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  errorCode: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyContainer: {
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: `${colors.backgroundMedium}80`,
    ...createShadow(2, colors.backgroundLight),
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  typeChip: {
    backgroundColor: `${colors.backgroundLight}50`,
    borderColor: `${colors.primary}40`,
  },
});

export default MCPResponseRenderer;