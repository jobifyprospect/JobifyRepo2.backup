import React, {useState} from 'react';
import {View} from 'react-native';
import DynamicTextInput from './DynamicTextInput';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';
import {NavigationProp} from '@react-navigation/native';

interface LocationPickerInputProps {
  navigation: NavigationProp<any, any>;
  selectedLocation?: {latitude: number; longitude: number} | null; // Object for latitude and longitude
  onLocationChange?: (location: {latitude: number; longitude: number}) => void; // Callback with an object
}

const LocationPickerInput = ({
  navigation,
  selectedLocation = null,
  onLocationChange,
}: LocationPickerInputProps) => {
  // Use the passed `selectedLocation` or default to null
  const [inputValue, setInputValue] = useState(
    selectedLocation
      ? `${selectedLocation.latitude}, ${selectedLocation.longitude}`
      : '', // Initialize with formatted string if location exists
  );

  const label = 'Location Long Lat'; // Define your label
  const placeholder = 'Tap Icon to pick a location'; // Define your placeholder

  const handleOpenMap = () => {
    navigation.navigate('MapScreen', {
      onLocationSelect: (selectedLocationObj: {
        latitude: number;
        longitude: number;
      }) => {
        const selectedLocationStr = `${selectedLocationObj.latitude}, ${selectedLocationObj.longitude}`; // Convert to string for display
        console.log('Selected location:', selectedLocationObj); // Debug log
        setInputValue(selectedLocationStr); // Update state with string
        if (onLocationChange) {
          onLocationChange(selectedLocationObj); // Notify parent with object
        }
      },
    });
  };

  return (
    <View>
      <DynamicTextInput
        label={label}
        value={inputValue}
        placeholder={placeholder}
        onChangeText={() => {}}
        editable={false}
        suffixIcon={faLocationDot}
        suffixOnClick={handleOpenMap}
        isRequired={true}
      />
    </View>
  );
};

export default LocationPickerInput;
