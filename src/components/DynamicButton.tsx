import React, {useState} from 'react';
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
  onPress: () => Promise<void>; // Assuming the onPress is async to handle success/failure
  type?: 'primary' | 'secondary'; // Button type: primary (solid) or secondary (outlined)
  disabled?: boolean; // Disabled state
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  title,
  onPress,
  type = 'primary', // Default to primary if not specified
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  // Handle button press with loading state
  const handlePress = async () => {
    setLoading(true);
    try {
      await onPress(); // Assuming onPress returns a Promise
    } catch (error) {
      console.error(error); // Handle any errors
    } finally {
      setLoading(false); // Set loading to false after success or failure
    }
  };

  // Determine the styles based on the button type
  const containerStyle: ViewStyle[] = [
    dynamicButtonStyles.button,
    type === 'primary'
      ? dynamicButtonStyles.primary
      : dynamicButtonStyles.secondary,
  ];

  const textStyle: TextStyle = {
    color: type === 'primary' ? Colors.white : Colors.primary,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || loading} // Disable button when loading
    >
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
};

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
    backgroundColor: Colors.placeholder, // Grey out if disabled
    borderColor: Colors.placeholder,
  },
});

export default DynamicButton;
