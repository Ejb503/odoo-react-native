import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, useWindowDimensions } from 'react-native';
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
import { MCPResponse, MCPErrorResponse } from '../api/mcpService';
import { colors } from '../utils/theme';

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
      <Surface style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </Surface>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} elevation={2}>
        <Card.Title
          title={getResponseTitle(response)}
          right={(props) => (
            <Chip {...props} mode="outlined" style={styles.typeChip}>
              {response.type}
            </Chip>
          )}
        />
        <Divider />
        {renderContent(response, { setImageLoading, imageLoading, screenWidth: width })}
      </Card>
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
    marginVertical: 10,
    width: '100%',
  },
  card: {
    marginHorizontal: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  contentPadding: {
    padding: 16,
  },
  imagePadding: {
    padding: 8,
    alignItems: 'center',
  },
  tablePadding: {
    padding: 8,
  },
  textResponse: {
    fontSize: 16,
    lineHeight: 24,
  },
  image: {
    borderRadius: 8,
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
    marginBottom: 12,
  },
  listItemBadge: {
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 2,
  },
  listItemText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    backgroundColor: colors.primary + '15',
  },
  tableHeaderCell: {
    padding: 4,
    justifyContent: 'center',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.primary,
  },
  tableRowEven: {
    backgroundColor: colors.background,
  },
  tableRowOdd: {
    backgroundColor: colors.surface,
  },
  tableCell: {
    padding: 4,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
  },
  errorContent: {
    padding: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.error + '15',
    padding: 16,
    borderRadius: 4,
  },
  errorIcon: {
    margin: 0,
    marginRight: 8,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 4,
  },
  errorCode: {
    color: colors.error + 'AA',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 20,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emptyText: {
    color: colors.text + '80',
    fontSize: 16,
  },
  typeChip: {
    margin: 8,
    backgroundColor: colors.primary + '20',
  },
});

export default MCPResponseRenderer;