import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, DataTable } from 'react-native-paper';
import { MCPResponse } from '../api/mcpService';

interface MCPResponseRendererProps {
  response: MCPResponse | null;
}

const MCPResponseRenderer: React.FC<MCPResponseRendererProps> = ({ response }) => {
  if (!response) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {renderContent(response)}
      </Card>
    </ScrollView>
  );
};

const renderContent = (response: MCPResponse) => {
  switch (response.type) {
    case 'text':
      return (
        <Card.Content>
          <Text style={styles.textResponse}>{response.content}</Text>
        </Card.Content>
      );
    
    case 'image':
      return (
        <Card.Content>
          <Card.Cover source={{ uri: response.content }} style={styles.image} />
        </Card.Content>
      );
    
    case 'list':
      return (
        <Card.Content>
          <Text style={styles.listTitle}>{response.content.title}</Text>
          {response.content.items.map((item: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemDot}>•</Text>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </Card.Content>
      );
    
    case 'table':
      return (
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              {response.content.headers.map((header: string, index: number) => (
                <DataTable.Title key={index}>{header}</DataTable.Title>
              ))}
            </DataTable.Header>

            {response.content.rows.map((row: string[], rowIndex: number) => (
              <DataTable.Row key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <DataTable.Cell key={cellIndex}>{cell}</DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      );
    
    case 'error':
      return (
        <Card.Content>
          <Text style={styles.errorText}>{response.content}</Text>
        </Card.Content>
      );
    
    default:
      return (
        <Card.Content>
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
    marginBottom: 10,
  },
  textResponse: {
    fontSize: 16,
  },
  image: {
    margin: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listItemDot: {
    fontSize: 18,
    marginRight: 6,
  },
  listItemText: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default MCPResponseRenderer;