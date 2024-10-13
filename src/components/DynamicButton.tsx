import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { styles } from '../styles/Globals';
import Colors from '../styles/Colors';

interface DynamicButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  type?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
}

const DynamicButton = forwardRef<
  {
    triggerPress: () => void;
  },
  DynamicButtonProps
>(({ title, onPress, type = 'primary', disabled = false }, ref) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerPress: () => {
      handlePress();
    },
  }));

  const buttonStyles = {
    primary: dynamicButtonStyles.primary,
    secondary: dynamicButtonStyles.secondary,
    destructive: dynamicButtonStyles.destructive,
    disabled: dynamicButtonStyles.disabled,
  };

  const activityIndicatorColors = {
    primary: Colors.white,
    secondary: Colors.primary,
    destructive: Colors.danger,
    disabled: Colors.placeholder
    // Add more colors as needed
  };

  const containerStyle: ViewStyle[] = [
    dynamicButtonStyles.button,
    buttonStyles[type],
    disabled ? buttonStyles.disabled : {},
  ];

  const textStyle: TextStyle = {
    color: activityIndicatorColors[type],
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'primary' ? Colors.white : Colors.primary}
        />
      ) : (
        <Text style={[styles.boldText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

const dynamicButtonStyles = StyleSheet.create({
  button: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  destructive: {
    color: Colors.danger,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  disabled: {
    backgroundColor: Colors.placeholder,
    borderColor: Colors.placeholder,
  },
});

export default DynamicButton;
