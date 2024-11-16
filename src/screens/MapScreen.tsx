import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import MapView, {Marker, MapPressEvent} from 'react-native-maps';
import {NavigationProp, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from './interfaces/RouterStackInterfaceParams';

interface RouterProps {
  navigation: NavigationProp<RootStackParamList, 'MapScreen'>;
  route: RouteProp<RootStackParamList, 'MapScreen'>;
}

const MapScreen = ({navigation, route}: RouterProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {latitude, longitude} = route.params || {};

  const handleMapPress = (event: MapPressEvent) => {
    if (!latitude || !longitude) {
      const {latitude: latitudeA, longitude: longitudeA} =
        event.nativeEvent.coordinate;
      setSelectedLocation({latitude: latitudeA, longitude: longitudeA});
    }
  };

  const handleConfirm = () => {
    if (selectedLocation && route.params?.onLocationSelect) {
      route.params.onLocationSelect(selectedLocation); // Pass back the location
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: latitude || 10.6713,
          longitude: longitude || 122.9511,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        zoomEnabled={true} // Ensure zoom is enabled
        scrollEnabled={true} // Ensure scrolling is enabled
      >
        {latitude && longitude ? (
          <Marker
            coordinate={{
              latitude,
              longitude,
            }}
          />
        ) : (
          selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
            />
          )
        )}
      </MapView>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>
          {!latitude && !longitude ? 'Confirm Location' : 'Go Back'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Colors = {
  primary: '#007BFF',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default MapScreen;
