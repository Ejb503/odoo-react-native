import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Button, Text, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { logout } from '../state/slices/authSlice';
import { authService } from '../api/authService';
import { mcpService, MCPResponse } from '../api/mcpService';
import VoiceInput from '../components/VoiceInput';
import MCPResponseRenderer from '../components/MCPResponseRenderer';
import { colors } from '../utils/theme';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const EXAMPLE_QUERIES = [
  'Show me open sales orders',
  'List inventory items low on stock',
  'Generate sales report for this month',
  'Show me a chart of monthly revenue'
];

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { token, username, serverUrl } = useAppSelector(state => state.auth);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [mcpResponse, setMcpResponse] = useState<MCPResponse | null>(null);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [isMCPConnected, setIsMCPConnected] = useState(false);

  useEffect(() => {
    const connectToMCP = async () => {
      if (token && serverUrl) {
        try {
          const connected = await mcpService.connect(serverUrl, token);
          setIsMCPConnected(connected);
        } catch (err) {
          console.error('Failed to connect to MCP service', err);
          Alert.alert('Connection Error', 'Failed to connect to MCP service');
        }
      }
    };

    connectToMCP();

    return () => {
      mcpService.disconnect();
    };
  }, [token, serverUrl]);

  const handleLogout = async () => {
    try {
      await mcpService.disconnect();
      await authService.logout();
      dispatch(logout());
      navigation.replace('Login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleSpeechResult = async (text: string) => {
    processQuery(text);
  };

  const generateMockResponse = () => {
    const mockQuery = "Show me a sample response";
    processQuery(mockQuery);
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    
    try {
      const response = await mcpService.processQuery(query);
      setMcpResponse(response);
      
      // Add to previous queries, keeping only the last 5
      setPreviousQueries(prev => [query, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Error processing query', err);
      setMcpResponse({
        type: 'error',
        content: 'Failed to process your request'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreviousQueryTap = (query: string) => {
    processQuery(query);
  };

  const handleExampleTap = (query: string) => {
    processQuery(query);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Odoo Voice Assistant" subtitle={username} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.connectionStatus}>
          <Text>Connection Status: </Text>
          <Chip 
            icon={isMCPConnected ? "check-circle" : "close-circle"} 
            mode="outlined" 
            style={[
              styles.statusChip, 
              isMCPConnected ? styles.connected : styles.disconnected
            ]}
          >
            {isMCPConnected ? 'Connected' : 'Disconnected'}
          </Chip>
        </View>

        <MCPResponseRenderer response={mcpResponse} />

        <VoiceInput 
          onSpeechResult={handleSpeechResult}
          isProcessing={isProcessing}
        />

        <Button 
          mode="contained" 
          style={styles.mockButton}
          onPress={generateMockResponse}
        >
          Generate Mock Response
        </Button>

        {previousQueries.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Recent Queries</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {previousQueries.map((query, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePreviousQueryTap(query)}
                  style={styles.historyItem}
                >
                  <Text style={styles.historyText} numberOfLines={1}>
                    {query}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.examplesContainer}>
          <Text style={styles.sectionTitle}>Try Asking</Text>
          <View style={styles.examplesGrid}>
            {EXAMPLE_QUERIES.map((query, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleItem}
                onPress={() => handleExampleTap(query)}
              >
                <Text style={styles.exampleText}>{query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusChip: {
    marginLeft: 8,
  },
  connected: {
    backgroundColor: colors.success + '20',
  },
  disconnected: {
    backgroundColor: colors.error + '20',
  },
  mockButton: {
    marginTop: 10,
  },
  historyContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  historyItem: {
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: 200,
  },
  historyText: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 20,
  },
  examplesContainer: {
    marginBottom: 30,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exampleItem: {
    backgroundColor: colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    maxWidth: '48%',
    flexGrow: 1,
  },
  exampleText: {
    fontSize: 14,
    color: colors.primary,
  },
});

export default MainScreen;