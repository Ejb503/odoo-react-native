import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Pressable, 
  Platform,
  Dimensions
} from 'react-native';
import { 
  Appbar, 
  Button, 
  Text, 
  Chip, 
  Divider, 
  Snackbar,
  Portal,
  Dialog,
  ActivityIndicator,
  IconButton,
  Avatar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { logoutThunk } from '../state/slices/authSlice';
import { mcpService, MCPResponse } from '../api/mcpService';
import VoiceInput from '../components/VoiceInput';
import MCPResponseRenderer from '../components/MCPResponseRenderer';
import { colors } from '../utils/theme';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

// Example queries for the user to try
const EXAMPLE_QUERIES = [
  'Show me open sales orders',
  'List inventory items low on stock',
  'Generate sales report for this month',
  'Show me a chart of monthly revenue',
  'Hello',
  'What are my invoices?'
];

// Categories for organizing responses
const CATEGORIES = {
  SALES: 'Sales',
  INVENTORY: 'Inventory',
  FINANCE: 'Finance',
  REPORTING: 'Reporting',
  OTHER: 'Other'
};

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { token, username, serverUrl, user } = useAppSelector(state => state.auth);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [mcpResponse, setMcpResponse] = useState<MCPResponse | null>(null);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [isMCPConnected, setIsMCPConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // Get device dimensions for responsive layout
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  // Connect to MCP service when the component mounts
  useEffect(() => {
    const connectToMCP = async () => {
      if (token && serverUrl) {
        setIsConnecting(true);
        setError(null);
        
        try {
          // Connect to MCP service
          const connected = await mcpService.connect(serverUrl, token);
          setIsMCPConnected(connected);
          
          if (!connected) {
            setError('Unable to connect to the MCP service. Using fallback mode.');
          }
        } catch (err) {
          console.error('Failed to connect to MCP service', err);
          setError('Connection error: Failed to connect to MCP service');
        } finally {
          setIsConnecting(false);
        }
      }
    };

    // Set up connection listener
    const removeListener = mcpService.addConnectionListener((connected) => {
      setIsMCPConnected(connected);
    });

    connectToMCP();

    // Clean up
    return () => {
      mcpService.disconnect();
      if (removeListener) removeListener();
    };
  }, [token, serverUrl]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setShowLogoutDialog(false);
    
    try {
      // Disconnect from MCP service
      await mcpService.disconnect();
      
      // Dispatch logout action
      await dispatch(logoutThunk());
      
      // Navigate to login screen
      navigation.replace('Login');
    } catch (err) {
      console.error('Logout error', err);
      setError('Failed to logout. Please try again.');
    }
  }, [dispatch, navigation]);

  // Process voice query
  const handleSpeechResult = useCallback(async (text: string) => {
    processQuery(text);
  }, []);

  // Generate a sample response for testing
  const generateMockResponse = useCallback(() => {
    const mockQueries = [
      "Show me a sample response",
      "List all products",
      "Show sales report",
      "Generate chart for monthly sales",
      "Hello",
      "What are my tasks?"
    ];
    // Pick a random query from the list
    const randomIndex = Math.floor(Math.random() * mockQueries.length);
    const mockQuery = mockQueries[randomIndex];
    processQuery(mockQuery);
  }, []);

  // Process a query and update the UI
  const processQuery = useCallback(async (query: string) => {
    setIsProcessing(true);
    
    try {
      // Process the query through MCP service
      const response = await mcpService.processQuery(query);
      setMcpResponse(response);
      
      // Add to previous queries, keeping only the last 10
      setPreviousQueries(prev => {
        // Don't add duplicates
        if (prev.includes(query)) {
          return prev;
        }
        return [query, ...prev.slice(0, 9)];
      });
    } catch (err) {
      console.error('Error processing query', err);
      setMcpResponse({
        type: 'error',
        content: 'Failed to process your request. Please try again.',
        code: 'PROCESSING_ERROR'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Clear current response
  const clearResponse = useCallback(() => {
    setMcpResponse(null);
  }, []);

  // Filter example queries by category
  const getFilteredExamples = useCallback(() => {
    if (!selectedCategory) {
      return EXAMPLE_QUERIES;
    }
    
    // Filter example queries based on selected category
    // This is a simple implementation - in a real app, you would have more sophisticated categorization
    return EXAMPLE_QUERIES.filter(query => {
      const lowerQuery = query.toLowerCase();
      switch (selectedCategory) {
        case CATEGORIES.SALES:
          return lowerQuery.includes('sales') || lowerQuery.includes('order');
        case CATEGORIES.INVENTORY:
          return lowerQuery.includes('inventory') || lowerQuery.includes('stock');
        case CATEGORIES.FINANCE:
          return lowerQuery.includes('invoice') || lowerQuery.includes('payment');
        case CATEGORIES.REPORTING:
          return lowerQuery.includes('report') || lowerQuery.includes('chart');
        default:
          return true;
      }
    });
  }, [selectedCategory]);

  // Get visible history items
  const getVisibleHistory = useCallback(() => {
    if (showFullHistory) {
      return previousQueries;
    }
    return previousQueries.slice(0, 3);
  }, [previousQueries, showFullHistory]);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Avatar.Image 
          size={32} 
          source={{uri: 'https://www.odoo.com/web/image/website/1/logo/Odoo?unique=aaa901b'}} 
          style={styles.logoImage}
        />
        <Appbar.Content 
          title="Odoo Voice Assistant" 
          subtitle={user?.name || username} 
        />
        <Appbar.Action 
          icon={isMCPConnected ? "wifi" : "wifi-off"} 
          color={isMCPConnected ? colors.success : colors.error}
        />
        <Appbar.Action icon="logout" onPress={() => setShowLogoutDialog(true)} />
      </Appbar.Header>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <Text>Connection Status: </Text>
          {isConnecting ? (
            <ActivityIndicator size={20} color={colors.primary} style={{marginLeft: 8}} />
          ) : (
            <Chip 
              icon={isMCPConnected ? "check-circle" : "close-circle"} 
              mode="outlined" 
              style={[
                styles.statusChip, 
                isMCPConnected ? styles.connected : styles.disconnected
              ]}
            >
              {isMCPConnected ? 'Connected' : 'Fallback Mode'}
            </Chip>
          )}
        </View>

        {/* Render the MCP response */}
        {mcpResponse && (
          <View style={styles.responseContainer}>
            <View style={styles.responseHeader}>
              <Text style={styles.sectionTitle}>Response</Text>
              <IconButton 
                icon="close" 
                size={20} 
                onPress={clearResponse}
                accessibilityLabel="Clear response"
              />
            </View>
            <MCPResponseRenderer response={mcpResponse} />
          </View>
        )}

        {/* Voice input component */}
        <View style={styles.voiceInputContainer}>
          <VoiceInput 
            onSpeechResult={handleSpeechResult}
            isProcessing={isProcessing}
          />
        </View>

        {/* Mock response button and helper text */}
        <View style={styles.mockContainer}>
          <Button 
            mode="contained" 
            style={styles.mockButton}
            onPress={generateMockResponse}
            icon="waveform"
          >
            Generate Sample Response
          </Button>
          <Text style={styles.helperText}>
            {Platform.OS === 'web' 
              ? 'Voice input is not available on web. Use this button to test responses.' 
              : 'Use the microphone above or tap this button to test.'}
          </Text>
        </View>

        {/* Previous queries history */}
        {previousQueries.length > 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Queries</Text>
              {previousQueries.length > 3 && (
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => setShowFullHistory(!showFullHistory)}
                >
                  {showFullHistory ? "Show Less" : "Show All"}
                </Button>
              )}
            </View>
            <ScrollView 
              horizontal={!isTablet} 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={isTablet ? styles.historyGridContainer : undefined}
            >
              {getVisibleHistory().map((query, index) => (
                <Pressable
                  key={index}
                  onPress={() => processQuery(query)}
                  style={({ pressed }) => [
                    styles.historyItem,
                    isTablet && styles.historyItemTablet,
                    pressed && styles.itemPressed
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Previous query: ${query}`}
                >
                  <Text 
                    style={styles.historyText} 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {query}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Category filters */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
              style={styles.categoryChip}
              mode="outlined"
            >
              All
            </Chip>
            {Object.values(CATEGORIES).map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={styles.categoryChip}
                mode="outlined"
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Example queries */}
        <View style={styles.examplesContainer}>
          <Text style={styles.sectionTitle}>Try Asking</Text>
          <View style={styles.examplesGrid}>
            {getFilteredExamples().map((query, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.exampleItem,
                  pressed && styles.itemPressed
                ]}
                onPress={() => processQuery(query)}
                accessibilityRole="button"
                accessibilityLabel={`Example query: ${query}`}
              >
                <Text style={styles.exampleText}>{query}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Error snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'OK',
          onPress: () => setError(null),
        }}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      {/* Logout confirmation dialog */}
      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Logout Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingBottom: 40,
  },
  logoImage: {
    marginRight: 8,
    backgroundColor: 'transparent',
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
  responseContainer: {
    marginBottom: 16,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voiceInputContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  mockContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mockButton: {
    marginTop: 10,
    borderRadius: 20,
  },
  helperText: {
    fontSize: 12,
    color: colors.text + '80',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  historyGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyItem: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 150,
    maxWidth: 250,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  historyItemTablet: {
    maxWidth: '48%',
    flexGrow: 1,
  },
  historyText: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  examplesContainer: {
    marginBottom: 30,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  exampleItem: {
    backgroundColor: colors.primary + '15',
    padding: 14,
    borderRadius: 8,
    margin: 4,
    maxWidth: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  exampleText: {
    fontSize: 14,
    color: colors.primary,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  itemPressed: {
    opacity: 0.7,
    backgroundColor: colors.primary + '25',
  },
});

export default MainScreen;