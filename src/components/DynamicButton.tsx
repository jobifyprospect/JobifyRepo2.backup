import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {styles} from '../styles/globals';
import Colors from '../styles/Colors';

interface DynamicButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  type?: 'primary' | 'secondary';
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
      : dynamicButtonStyles.secondary,
    disabled ? dynamicButtonStyles.disabled : {},
  ];

  const textStyle: TextStyle = {
    color: type === 'primary' ? Colors.white : Colors.primary,
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
  disabled: {
    backgroundColor: Colors.placeholder,
    borderColor: Colors.placeholder,
  },
});

export default DynamicButton;
