import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {styles} from '../styles/Globals';
import Colors from '../styles/Colors';

interface DynamicButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  type?: 'primary' | 'secondary' | 'logout';
  disabled?: boolean;
}

const DynamicButton = forwardRef<
  {
    triggerPress: () => void;
  },
  DynamicButtonProps
>(({title, onPress, type = 'primary', disabled = false}, ref) => {
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

  const containerStyle: ViewStyle[] = [
    dynamicButtonStyles.button,
    type === 'primary'
      ? dynamicButtonStyles.primary
      : type === 'secondary'
      ? dynamicButtonStyles.secondary
      : dynamicButtonStyles.logout,
    disabled ? dynamicButtonStyles.disabled : {},
  ];

  const textStyle: TextStyle = {
    color:
      type === 'primary'
        ? Colors.white
        : type === 'secondary'
        ? Colors.primary
        : Colors.danger,
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
          color={
            type === 'primary'
              ? Colors.white
              : type === 'secondary'
              ? Colors.primary
              : Colors.danger
          }
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
    minWidth: 96,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  logout: {
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
