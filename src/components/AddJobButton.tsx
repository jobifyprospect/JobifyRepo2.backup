import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Colors from '../styles/Colors';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

interface AddJobButtonProps {
  onPress: () => Promise<void>;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
}

const AddJobButton = forwardRef<
  {
    triggerPress: () => void;
  },
  AddJobButtonProps
>(({onPress, type = 'primary', disabled = false}, ref) => {
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
        <FontAwesomeIcon icon={faPlus} color={Colors.white} />
      )}
    </TouchableOpacity>
  );
});

const dynamicButtonStyles = StyleSheet.create({
  button: {
    height: 46,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.placeholder,
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

export default AddJobButton;
