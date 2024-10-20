import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../styles/Colors';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

interface RadialSelectionProps {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const RadialSelection: React.FC<RadialSelectionProps> = ({
  title,
  description,
  isSelected,
  onSelect,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.container,
    borderColor: isSelected ? Colors.primary : Colors.placeholder,
    backgroundColor: isSelected ? Colors.primaryWithOpacity10 : Colors.white,
  };

  const textStyle: TextStyle = {
    color: isSelected ? Colors.primary : Colors.labelText,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onSelect}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, textStyle]}>{title}</Text>
          <Text style={[styles.description, textStyle]}>{description}</Text>
        </View>
        <View
          style={[
            styles.radialButton,
            isSelected && styles.radialButtonSelected,
          ]}>
          {isSelected && (
            <FontAwesomeIcon icon={faCheck} size={9} color={Colors.white} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  radialButton: {
    width: 16,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  radialButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  innerRadialButton: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
});

export default RadialSelection;
