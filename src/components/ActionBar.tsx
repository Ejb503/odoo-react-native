import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, createShadow } from '../utils/theme';
import MicrophoneButton from './MicrophoneButton';

export type ModuleType = 'sales' | 'inventory' | 'customers';
export type RecordingState = 'idle' | 'listening' | 'processing';

interface ActionBarProps {
  onRefresh: () => void;
  onExport: () => void;
  onFilter: () => void;
  onSettings: () => void;
  currentModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  recordingState?: RecordingState;
  onMicrophonePress?: () => void;
}

const MODULE_ICONS = {
  sales: 'chart-line',
  inventory: 'package-variant-closed',
  customers: 'account-group'
};

const ActionBar: React.FC<ActionBarProps> = ({
  onRefresh,
  onExport,
  onFilter,
  onSettings,
  currentModule,
  onModuleChange,
  recordingState = 'idle',
  onMicrophonePress = () => {}
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const showMenu = () => setMenuVisible(true);
  const hideMenu = () => setMenuVisible(false);
  
  return (
    <LinearGradient
      colors={[
        'transparent',
        `${colors.backgroundMedium}CC`,
        colors.backgroundMedium,
      ]}
      locations={[0, 0.3, 0.7]}
      style={styles.container}
    >
      <View style={styles.actionContainer}>
        {/* Module Selector */}
        <Menu
          visible={menuVisible}
          onDismiss={hideMenu}
          anchor={
            <ActionButton
              icon={MODULE_ICONS[currentModule]}
              label={currentModule.charAt(0).toUpperCase() + currentModule.slice(1)}
              onPress={showMenu}
              color={colors.primary}
              showDropdownIcon
            />
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item 
            onPress={() => {
              onModuleChange('sales');
              hideMenu();
            }} 
            title="Sales" 
            leadingIcon="chart-line"
            titleStyle={{ color: currentModule === 'sales' ? colors.primary : colors.textPrimary }}
          />
          <Menu.Item 
            onPress={() => {
              onModuleChange('inventory');
              hideMenu();
            }} 
            title="Inventory" 
            leadingIcon="package-variant-closed"
            titleStyle={{ color: currentModule === 'inventory' ? colors.primary : colors.textPrimary }}
          />
          <Menu.Item 
            onPress={() => {
              onModuleChange('customers');
              hideMenu();
            }} 
            title="Customers" 
            leadingIcon="account-group"
            titleStyle={{ color: currentModule === 'customers' ? colors.primary : colors.textPrimary }}
          />
        </Menu>

        <View style={styles.divider} />
        
        {/* Settings button */}
        <ActionButton
          icon="cog"
          label="Settings"
          onPress={onSettings}
          color={colors.textPrimary}
        />
        
        <View style={styles.spacer} />
        
        {/* Microphone Button */}
        <View style={styles.microphoneContainer}>
          <MicrophoneButton
            recordingState={recordingState}
            onPress={onMicrophonePress}
            size="medium"
            theme={{
              listeningColor: colors.accent,
              processingColor: colors.warning,
              idleColor: colors.textPrimary,
              backgroundColor: `${colors.backgroundLight}80`,
            }}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
  showDropdownIcon?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  color,
  showDropdownIcon = false
}) => {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 380;
  
  return (
    <TouchableOpacity 
      style={styles.actionButton} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <IconButton
          icon={icon}
          iconColor={color}
          size={24}
          style={styles.icon}
        />
        
        {!isSmallScreen && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color }]}>
              {label}
            </Text>
            {showDropdownIcon && (
              <IconButton
                icon="chevron-down"
                size={16}
                iconColor={color}
                style={styles.dropdownIcon}
              />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    height: 72,
    paddingTop: 16,
    paddingHorizontal: spacing.md,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    height: 56,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: `${colors.textPrimary}20`,
    marginHorizontal: spacing.sm,
  },
  spacer: {
    flex: 1,
    minWidth: spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    height: 40,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    margin: 0,
    backgroundColor: `${colors.backgroundLight}50`,
    borderRadius: 8,
    ...createShadow(4, 'rgba(0,0,0,0.2)'),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 1,
  },
  dropdownIcon: {
    margin: 0,
    padding: 0,
    width: 16,
    height: 16,
    marginLeft: -4,
  },
  menuContent: {
    backgroundColor: colors.backgroundMedium,
    borderWidth: 1,
    borderColor: `${colors.textPrimary}15`,
    borderRadius: 8,
    marginBottom: 8,
    ...createShadow(8, 'rgba(0,0,0,0.2)'),
  },
  microphoneContainer: {
    position: 'relative',
    marginRight: -spacing.xs,
  },
});

export default ActionBar;