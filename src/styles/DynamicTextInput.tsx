import {StyleSheet} from 'react-native';
import Colors from './Colors';
//TODO ALIGN TO FIGMA DESIGN
export const dynamicTextInputStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  labelContainer: {
    marginBottom: 6,
  },
  required: {
    color: Colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.placeholder,
    borderRadius: 8,
    height: 44,
    // padding: 10,
    paddingLeft: 14,
    paddingRight: 14,
  },
  focusedInput: {
    borderColor: Colors.primary,
  },
  errorInput: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.labelText,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconContainer: {
    marginRight: 10,
  },
  iconColor: {
    color: Colors.danger,
  },
  errorContainer: {
    marginTop: 6,
  },
});
