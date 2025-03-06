import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  Text,
  Portal,
  Dialog,
  Snackbar,
  Avatar,
  IconButton,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";

import { RootStackParamList } from "../App";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { logoutThunk } from "../state/slices/authSlice";
import { mcpService } from "../api/mcpService";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import AnimatedButton from "../components/AnimatedButton";

// Import module components
import SalesModule from "../components/modules/SalesModule";
import InventoryModule from "../components/modules/InventoryModule";
import CustomersModule from "../components/modules/CustomersModule";

// Import action bar and its types
import ActionBar, { ModuleType, RecordingState } from "../components/ActionBar";
import { colors, spacing, createShadow } from "../utils/theme";

// Module names to display titles
const MODULE_NAMES = {
  sales: 'Sales Dashboard',
  inventory: 'Inventory Management',
  customers: 'Customer Relationship'
};

type MainScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { token, username, serverUrl, user } = useAppSelector(
    (state) => state.auth
  );

  // State
  const [isMCPConnected, setIsMCPConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [currentModule, setCurrentModule] = useState<ModuleType>('sales');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');

  // Get device dimensions for responsive layout
  const windowWidth = Dimensions.get("window").width;

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
  
  // Action Bar handlers
  const handleRefresh = useCallback(() => {
    console.log(`Refreshing ${currentModule} data...`);
    // In a real app, you would fetch fresh data here
  }, [currentModule]);

  const handleExport = useCallback(() => {
    console.log(`Exporting ${currentModule} data...`);
    // In a real app, you would implement export functionality
  }, [currentModule]);

  const handleFilter = useCallback(() => {
    console.log(`Opening ${currentModule} filters...`);
    // In a real app, you would show a filter dialog
  }, [currentModule]);

  const handleSettings = useCallback(() => {
    console.log("Opening settings...");
    // In a real app, you would navigate to settings screen
  }, []);
  
  // Microphone handler
  const handleMicrophonePress = useCallback(() => {
    if (recordingState === 'idle') {
      // Start recording
      setRecordingState('listening');
      console.log('Started listening...');
      
      // Simulate processing after 3 seconds
      setTimeout(() => {
        setRecordingState('processing');
        console.log('Processing voice command...');
        
        // Return to idle state after 2 more seconds
        setTimeout(() => {
          setRecordingState('idle');
          console.log('Voice command processed');
        }, 2000);
      }, 3000);
    } else {
      // Cancel recording if already in progress
      setRecordingState('idle');
      console.log('Recording cancelled');
    }
  }, [recordingState]);

  // Module change handler
  const handleModuleChange = useCallback((module: ModuleType) => {
    setCurrentModule(module);
  }, []);

  // Render the current module content
  const renderModuleContent = () => {
    switch (currentModule) {
      case 'sales':
        return <SalesModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'customers':
        return <CustomersModule />;
      default:
        return <SalesModule />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.backgroundDark}
      />

      {/* Animated Background */}
      <AnimatedBackground />


      {/* Main Content - Dynamic Module Content */}
      <Animated.View 
        style={styles.contentContainer}
        entering={FadeIn.duration(300)}
        key={currentModule} // This forces re-render/re-animation when module changes
      >
        {renderModuleContent()}
      </Animated.View>

      {/* Action Bar with Module Selector */}
      <ActionBar 
        onRefresh={handleRefresh}
        onExport={handleExport}
        onFilter={handleFilter}
        onSettings={handleSettings}
        currentModule={currentModule}
        onModuleChange={handleModuleChange}
        recordingState={recordingState}
        onMicrophonePress={handleMicrophonePress}
      />

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
  contentContainer: {
    flex: 1,
    paddingBottom: 64, // Reduced padding to match ActionBar height + small buffer
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
  // Error
  errorSnackbar: {
    backgroundColor: colors.backgroundMedium,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
});

export default MainScreen;
