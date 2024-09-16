import React, {useState, forwardRef} from 'react';
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
  faMobile,
} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import {dynamicTextInputStyles} from '../styles/DynamicTextInput';
import Colors from '../styles/Colors';
import {styles} from '../styles/globals';
import {formatPhoneNumber} from '../utils/Utils';

library.add(
  faSearch,
  faUser,
  faLock,
  faUserAlt,
  faEnvelope,
  faEye,
  faEyeSlash,
  faMobile,
);

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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  suffixOnClick?: () => void;
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
};

const DynamicTextInput = forwardRef<TextInput, InputProps>(
  (
    {
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
      autoCapitalize = 'none',
      returnKeyType = 'done',
      onSubmitEditing,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasTouched, setHasTouched] = useState(false);
    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (!isValid) {
        setHasTouched(true);
      }
    };

    const handleChangeText = (text: string) => {
      if (text) {
        setHasTouched(true);
      } else {
        setHasTouched(false);
      }
      if (keyboardType === 'phone-pad') {
        const formattedPhone = formatPhoneNumber(text);
        onChangeText(formattedPhone);
      } else {
        onChangeText(text);
      }
    };

    return (
      <View style={dynamicTextInputStyles.container}>
        {/* Label */}
        <View style={dynamicTextInputStyles.labelContainer}>
          <Text style={styles.smallSemiBoldText}>
            {label}{' '}
            {isRequired && (
              <Text style={dynamicTextInputStyles.required}>*</Text>
            )}
          </Text>
        </View>

        <View
          style={[
            dynamicTextInputStyles.inputContainer,
            isFocused && dynamicTextInputStyles.focusedInput,
            hasTouched && !isValid && dynamicTextInputStyles.errorInput,
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
            ref={ref}
            style={[
              dynamicTextInputStyles.input,
              multiline && dynamicTextInputStyles.textArea,
            ]}
            selectionColor={Colors.primary}
            placeholderTextColor={Colors.placeholder}
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            editable={editable}
            autoCapitalize={autoCapitalize}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
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
  },
);

export default DynamicTextInput;
