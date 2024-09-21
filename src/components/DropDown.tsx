import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Colors from '../styles/Colors';
import {styles} from '../styles/Globals';

interface Option {
  id: string;
  title: string;
  description?: string;
}

interface DynamicDropdownProps {
  label: string;
  placeholder: string;
  options: Option[];
  value?: string;
  onSelect: (id: string) => void;
  isEnabled: boolean;
}

const DynamicDropdown = forwardRef(
  (
    {
      label,
      placeholder,
      options,
      value,
      onSelect,
      isEnabled,
    }: DynamicDropdownProps,
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionSelect = (id: string) => {
      onSelect(id);
      setIsOpen(false);
    };

    useImperativeHandle(ref, () => ({
      triggerOpen: () => {
        if (isEnabled) {
          setIsOpen(true);
        }
      },
    }));

    const renderOption = ({item, index}: {item: Option; index: number}) => {
      const isFirst = index === 0;
      const hasTopBorder = !isFirst ? 1 : 0;

      return (
        <TouchableOpacity
          style={[
            dropdownStyles.optionContainer,
            {borderTopWidth: hasTopBorder},
            item.id === value && dropdownStyles.selectedOption,
          ]}
          onPress={() => handleOptionSelect(item.id)}>
          <Text style={dropdownStyles.optionTitle}>{item.title}</Text>
          {item.description && (
            <Text style={dropdownStyles.optionDescription}>
              {item.description}
            </Text>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View style={dropdownStyles.container}>
        <View style={dropdownStyles.labelContainer}>
          <Text style={styles.smallSemiBoldText}>{label}</Text>
        </View>
        <TouchableOpacity
          style={[
            dropdownStyles.dropdownContainer,
            {borderColor: value ? Colors.placeholder : Colors.placeholder},
          ]}
          onPress={() => isEnabled && setIsOpen(true)}>
          <Text
            style={[
              dropdownStyles.selectedText,
              {color: value ? Colors.labelText : Colors.placeholder},
            ]}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}>
          <TouchableOpacity
            style={dropdownStyles.modalOverlay}
            onPress={() => setIsOpen(false)}>
            <View style={dropdownStyles.modalContainer}>
              <FlatList
                data={options}
                keyExtractor={item => item.id}
                renderItem={renderOption}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  },
);

const dropdownStyles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    marginBottom: 6,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 46,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  selectedText: {
    color: Colors.labelText,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderColor: Colors.placeholder,
  },
  optionTitle: {
    fontWeight: 'bold',
    color: Colors.labelText,
    fontSize: 16,
  },
  optionDescription: {
    color: Colors.placeholder,
  },
  selectedOption: {
    backgroundColor: Colors.primaryWithOpacity10,
  },
});

export default DynamicDropdown;
