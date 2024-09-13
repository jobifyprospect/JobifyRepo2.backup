import React from 'react';
import {TouchableOpacity, Text, StyleSheet, TextStyle} from 'react-native';
import Colors from '../styles/Colors';

interface TextButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  textStyle?: TextStyle; // Optional custom text style
}

const TextButton: React.FC<TextButtonProps> = ({
  title,
  onPress,
  disabled = false,
  textStyle = {}, // Optional custom text style
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={styles.buttonContainer}>
      <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    color: Colors.primary, // Default to primary color
  },
  disabledText: {
    color: Colors.placeholder, // Grey out text when disabled
  },
});

export default TextButton;
