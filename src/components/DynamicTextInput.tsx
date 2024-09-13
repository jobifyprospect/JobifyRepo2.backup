import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faSearch,
  faUser,
  faLock,
  faUserAlt,
  faEnvelope,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import {dynamicTextInputStyles} from '../styles/DynamicTextInput';
import Colors from '../styles/Colors';
import {styles} from '../styles/globals';

library.add(faSearch, faUser, faLock, faUserAlt, faEnvelope, faEye, faEyeSlash);

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  prefixIcon?: any;
  suffixIcon?: any;
  errorMessage?: string;
  isRequired?: boolean;
  isValid?: boolean;
  multiline?: boolean;
  editable?: boolean;
  suffixOnClick?: () => void;
};

const DynamicTextInput = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  keyboardType = 'default',
  secureTextEntry = false,
  prefixIcon,
  suffixIcon,
  errorMessage,
  isRequired = false,
  isValid = true,
  multiline = false,
  editable = true,
  suffixOnClick,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasTouched, setHasTouched] = useState(false); // Track user interaction

  const handleFocus = () => {
    setIsFocused(true);
    setHasTouched(true); // Mark field as touched on focus
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={dynamicTextInputStyles.container}>
      {/* Label */}
      <View style={dynamicTextInputStyles.labelContainer}>
        <Text style={styles.smallText}>
          {label}{' '}
          {isRequired && <Text style={dynamicTextInputStyles.required}>*</Text>}
        </Text>
      </View>

      <View
        style={[
          dynamicTextInputStyles.inputContainer,
          isFocused && dynamicTextInputStyles.focusedInput,
          hasTouched && !isValid && dynamicTextInputStyles.errorInput, // Apply error only if touched and invalid
        ]}>
        {/* Prefix Icon */}
        {prefixIcon && (
          <View style={dynamicTextInputStyles.iconContainer}>
            <FontAwesomeIcon
              icon={prefixIcon}
              size={16}
              color={Colors.labelText}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            dynamicTextInputStyles.input,
            multiline && dynamicTextInputStyles.textArea,
          ]}
          selectionColor={Colors.primary}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          editable={editable}
          autoCapitalize="none"
        />

        {/* Suffix Icon */}
        {suffixIcon && (
          <TouchableOpacity onPress={suffixOnClick}>
            <FontAwesomeIcon
              icon={suffixIcon}
              size={16}
              color={Colors.placeholder}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasTouched && !isValid && errorMessage && (
        <View style={dynamicTextInputStyles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
};

export default DynamicTextInput;
