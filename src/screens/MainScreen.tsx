import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  Appbar,
  Text,
  Chip,
  Divider,
  Snackbar,
  Portal,
  Dialog,
  ActivityIndicator,
  IconButton,
  Avatar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  SlideInRight,
} from "react-native-reanimated";

import { RootStackParamList } from "../App";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { logoutThunk } from "../state/slices/authSlice";
import { mcpService, MCPResponse } from "../api/mcpService";
// import VoiceInput from '../components/VoiceInput';
import MCPResponseRenderer from "../components/MCPResponseRenderer";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import AnimatedButton from "../components/AnimatedButton";
import { colors, spacing, createShadow } from "../utils/theme";

type MainScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

// Example queries for the user to try
const EXAMPLE_QUERIES = [
  "Show me open sales orders",
  "List inventory items low on stock",
  "Generate sales report for this month",
  "Show me a chart of monthly revenue",
  "Hello",
  "What are my invoices?",
];

// Categories for organizing responses
const CATEGORIES = {
  SALES: "Sales",
  INVENTORY: "Inventory",
  FINANCE: "Finance",
  REPORTING: "Reporting",
  OTHER: "Other",
};

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { token, username, serverUrl, user } = useAppSelector(
    (state) => state.auth
  );

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
  const windowWidth = Dimensions.get("window").width;
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
            setError(
              "Unable to connect to the MCP service. Using fallback mode."
            );
          }
        } catch (err) {
          console.error("Failed to connect to MCP service", err);
          setError("Connection error: Failed to connect to MCP service");
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
      navigation.replace("Login");
    } catch (err) {
      console.error("Logout error", err);
      setError("Failed to logout. Please try again.");
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
      "What are my tasks?",
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
      setPreviousQueries((prev) => {
        // Don't add duplicates
        if (prev.includes(query)) {
          return prev;
        }
        return [query, ...prev.slice(0, 9)];
      });
    } catch (err) {
      console.error("Error processing query", err);
      setMcpResponse({
        type: "error",
        content: "Failed to process your request. Please try again.",
        code: "PROCESSING_ERROR",
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
    return EXAMPLE_QUERIES.filter((query) => {
      const lowerQuery = query.toLowerCase();
      switch (selectedCategory) {
        case CATEGORIES.SALES:
          return lowerQuery.includes("sales") || lowerQuery.includes("order");
        case CATEGORIES.INVENTORY:
          return (
            lowerQuery.includes("inventory") || lowerQuery.includes("stock")
          );
        case CATEGORIES.FINANCE:
          return (
            lowerQuery.includes("invoice") || lowerQuery.includes("payment")
          );
        case CATEGORIES.REPORTING:
          return lowerQuery.includes("report") || lowerQuery.includes("chart");
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.backgroundDark}
      />

      {/* Animated Background */}
      <AnimatedBackground />

      {/* App Bar with Glass Effect */}
      <Animated.View entering={FadeInDown.duration(800)}>
        <GlassCard style={styles.appBar} elevation={4}>
          <View style={styles.appBarContent}>
            <View style={styles.appBarLeft}>
              <Avatar.Image
                size={36}
                source={{
                  uri: "https://www.odoo.com/web/image/website/1/logo/Odoo?unique=aaa901b",
                }}
                style={styles.logoImage}
              />
              <View>
                <Text style={styles.appBarTitle}>Odoo Voice Assistant</Text>
                <Text style={styles.appBarSubtitle}>
                  {user?.name || username}
                </Text>
              </View>
            </View>

            <View style={styles.appBarRight}>
              <IconButton
                icon={isMCPConnected ? "wifi" : "wifi-off"}
                iconColor={isMCPConnected ? colors.success : colors.error}
                size={24}
              />
              <IconButton
                icon="logout"
                iconColor={colors.textPrimary}
                size={24}
                onPress={() => setShowLogoutDialog(true)}
              />
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Connection Status */}
        <Animated.View
          style={styles.connectionStatus}
          entering={FadeIn.duration(800).delay(300)}
        >
          <Text style={styles.connectionLabel}>Connection Status: </Text>
          {isConnecting ? (
            <ActivityIndicator
              size={20}
              color={colors.primary}
              style={{ marginLeft: 8 }}
            />
          ) : (
            <Chip
              icon={isMCPConnected ? "check-circle" : "close-circle"}
              mode="outlined"
              style={[
                styles.statusChip,
                isMCPConnected ? styles.connected : styles.disconnected,
              ]}
              textStyle={{
                color: isMCPConnected ? colors.success : colors.error,
              }}
            >
              {isMCPConnected ? "Connected" : "Fallback Mode"}
            </Chip>
          )}
        </Animated.View>

        {/* Render the MCP response */}
        {mcpResponse && (
          <Animated.View
            style={styles.responseContainer}
            entering={FadeInDown.duration(500)}
          >
            <GlassCard style={styles.responseCard}>
              <View style={styles.responseHeader}>
                <Text style={styles.sectionTitle}>Response</Text>
                <IconButton
                  icon="close"
                  size={20}
                  iconColor={colors.textSecondary}
                  onPress={clearResponse}
                  accessibilityLabel="Clear response"
                />
              </View>
              <MCPResponseRenderer response={mcpResponse} />
            </GlassCard>
          </Animated.View>
        )}

        {/* Voice Input - Temporarily disabled */}
        {/*<View style={styles.voiceInputContainer}>
          <VoiceInput
            onSpeechResult={processQuery}
            isProcessing={isProcessing}
          />
        </View>*/}

        {/* Mock response button and helper text */}
        <Animated.View
          style={styles.mockContainer}
          entering={FadeInDown.duration(800).delay(400)}
        >
          <AnimatedButton
            title="Generate Sample Response"
            onPress={generateMockResponse}
            leftIcon={
              <IconButton
                icon="waveform"
                size={20}
                iconColor={colors.textPrimary}
              />
            }
          />
          <Text style={styles.helperText}>
            {Platform.OS === "web"
              ? "Voice input is not available on web. Use this button to test responses."
              : "Use the microphone above or tap this button to test."}
          </Text>
        </Animated.View>

        {/* Previous queries history */}
        {previousQueries.length > 0 && (
          <Animated.View
            style={styles.historyContainer}
            entering={FadeInDown.duration(800).delay(500)}
          >
            <GlassCard style={styles.historyCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Queries</Text>
                {previousQueries.length > 3 && (
                  <AnimatedButton
                    title={showFullHistory ? "Show Less" : "Show All"}
                    variant="text"
                    size="compact"
                    onPress={() => setShowFullHistory(!showFullHistory)}
                  />
                )}
              </View>
              <ScrollView
                horizontal={!isTablet}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  isTablet ? styles.historyGridContainer : undefined
                }
              >
                {getVisibleHistory().map((query, index) => (
                  <Animated.View
                    key={index}
                    entering={SlideInRight.duration(300).delay(index * 50)}
                  >
                    <Pressable
                      onPress={() => processQuery(query)}
                      style={({ pressed }) => [
                        styles.historyItem,
                        isTablet && styles.historyItemTablet,
                        pressed && styles.itemPressed,
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
                  </Animated.View>
                ))}
              </ScrollView>
            </GlassCard>
          </Animated.View>
        )}

        <Divider style={styles.divider} />

        {/* Category filters */}
        <Animated.View
          style={styles.categoryContainer}
          entering={FadeInDown.duration(800).delay(600)}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
              style={styles.categoryChip}
              mode="outlined"
              selectedColor={colors.primary}
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
                selectedColor={colors.primary}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Example queries */}
        <Animated.View
          style={styles.examplesContainer}
          entering={FadeInDown.duration(800).delay(700)}
        >
          <GlassCard style={styles.examplesCard} glowColor={colors.secondary}>
            <Text style={styles.sectionTitle}>Try Asking</Text>
            <View style={styles.examplesGrid}>
              {getFilteredExamples().map((query, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.duration(400).delay(100 + index * 100)}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.exampleItem,
                      pressed && styles.itemPressed,
                    ]}
                    onPress={() => processQuery(query)}
                    accessibilityRole="button"
                    accessibilityLabel={`Example query: ${query}`}
                  >
                    <Text style={styles.exampleText}>{query}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* Error snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: "Dismiss",
          onPress: () => setError(null),
          labelStyle: { color: colors.primary },
        }}
        duration={4000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      {/* Logout confirmation dialog */}
      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
          style={{
            backgroundColor: colors.backgroundMedium,
            borderRadius: 16,
            ...createShadow(8, `${colors.primary}40`),
          }}
        >
          <Dialog.Title style={{ color: colors.textPrimary }}>
            Logout Confirmation
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.textSecondary }}>
              Are you sure you want to logout?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <AnimatedButton
              title="Cancel"
              variant="text"
              onPress={() => setShowLogoutDialog(false)}
            />
            <AnimatedButton
              title="Logout"
              variant="primary"
              onPress={handleLogout}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // App Bar
  appBar: {
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  appBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appBarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  appBarSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  logoImage: {
    marginRight: spacing.sm,
    backgroundColor: "transparent",
  },
  // Connection Status
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  connectionLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  statusChip: {
    marginLeft: spacing.sm,
    borderColor: `${colors.textPrimary}30`,
  },
  connected: {
    backgroundColor: `${colors.success}20`,
    borderColor: `${colors.success}50`,
  },
  disconnected: {
    backgroundColor: `${colors.error}20`,
    borderColor: `${colors.error}50`,
  },
  // Response
  responseContainer: {
    marginBottom: spacing.lg,
  },
  responseCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  // Voice Input
  voiceInputContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  // Mock Controls
  mockContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
    fontStyle: "italic",
  },
  // History
  historyContainer: {
    marginVertical: spacing.lg,
  },
  historyCard: {
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  historyGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },
  historyItem: {
    backgroundColor: `${colors.backgroundLight}50`,
    padding: spacing.md,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minWidth: 150,
    maxWidth: 250,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    ...createShadow(2, colors.primary),
  },
  historyItemTablet: {
    maxWidth: "48%",
    flexGrow: 1,
  },
  historyText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.textPrimary}10`,
    marginVertical: spacing.lg,
  },
  // Categories
  categoryContainer: {
    marginBottom: spacing.lg,
  },
  categoryChip: {
    marginRight: spacing.sm,
    backgroundColor: `${colors.backgroundLight}70`,
  },
  // Examples
  examplesContainer: {
    marginBottom: spacing.xl,
  },
  examplesCard: {
    paddingVertical: spacing.md,
  },
  examplesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
  },
  exampleItem: {
    backgroundColor: `${colors.backgroundLight}80`,
    padding: spacing.md,
    borderRadius: 12,
    margin: 4,
    maxWidth: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: `${colors.secondary}50`,
    ...createShadow(2, colors.secondary),
  },
  exampleText: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "center",
  },
  // Error
  errorSnackbar: {
    backgroundColor: colors.backgroundMedium,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  itemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default MainScreen;
