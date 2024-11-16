import React, {forwardRef, useState, useImperativeHandle} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import DynamicButton from './DynamicButton';
import DynamicTextInput from './DynamicTextInput';
import {isNumberOnly} from '../utils/Utils';

// Define the props types
interface CounterOfferModalProps {
  isVisible: boolean;
  onClose: (value?: number) => void;
}

// Define methods that can be exposed through the ref
export interface CounterOfferModalHandle {
  resetInput: () => void;
}

const CounterOfferModal = forwardRef<
  CounterOfferModalHandle,
  CounterOfferModalProps
>(({isVisible, onClose}, ref) => {
  const [pay, setPay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    resetInput() {
      setPay(''); // Clear input field when called from parent
    },
  }));

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={() => onClose()}>
      {/* Dimmed background (no blur package used) */}
      <View style={styles.overlay} />

      {/* Modal content */}
      <KeyboardAvoidingView behavior="position" style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Counter Offer</Text>
          <Text style={styles.subtitle}>Please enter the amount</Text>

          {/* Input field */}
          <DynamicTextInput
            keyboardType="decimal-pad"
            value={pay}
            onChangeText={setPay}
            isValid={isNumberOnly(pay)}
            suffixIcon="peso-sign"
            label="Pay Rate / hr"
            placeholder="Rate/hr"
            isRequired
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <DynamicButton
              onPress={() => onClose()} // Decline action, close without value
              disabled={isSubmitting}
              type="secondary"
              title="Cancel"
            />
            <DynamicButton
              onPress={() => {
                if (isNumberOnly(pay)) {
                  setIsSubmitting(true);
                  // Accept logic: pass the pay value to the parent
                  setIsSubmitting(false);
                  onClose(parseInt(pay, 10)); // Pass the pay value on accept
                }
              }}
              disabled={isSubmitting || !isNumberOnly(pay)}
              type="primary"
              title="Accept"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark background to simulate blur
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 36,
  },
});

export default CounterOfferModal;
