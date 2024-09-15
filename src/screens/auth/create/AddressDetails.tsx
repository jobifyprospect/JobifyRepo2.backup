import React, {useState, useEffect} from 'react';
import {View, Text, Keyboard, TouchableWithoutFeedback} from 'react-native';
import DynamicTextInput from '../../../components/DynamicTextInput';
import {styles} from '../../../styles/globals';
import {RootStackParamList} from '../../interfaces/CreateInterfaceParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DynamicDropdown from '../../../components/DropDown';
import countryData from '../../../utils/CountryData';
import {
  detectCountryFromPhone,
  isNotEmpty,
  isPostalCodeValid,
} from '../../../utils/Utils';
import DynamicButton from '../../../components/DynamicButton';
import Background from '../../../components/Background';

type AddressDetailsProps = NativeStackScreenProps<
  RootStackParamList,
  'AddressDetails'
>;

type Option = {
  id: string;
  title: string;
  description: string;
};

const AddressDetails = ({navigation, route}: AddressDetailsProps) => {
  const {userType, firstName, lastName, phoneNumber} = route.params;

  const [country, setCountry] = useState<string>('Philippines'); // Default to Philippines
  const [region, setRegion] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState('');

  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);

  useEffect(() => {
    // Detect country from phone number and set it
    const detectedCountry = detectCountryFromPhone(phoneNumber);
    setCountry(detectedCountry);

    // Initialize regions based on detected country
    const initialRegions = Object.keys(
      countryData[detectedCountry]?.Regions || {},
    ).map(regionMap => ({
      id: regionMap,
      title: regionMap,
      description: '',
    }));
    setRegions(initialRegions);
  }, [phoneNumber]);

  useEffect(() => {
    // Update regions when country changes
    const initialRegions = Object.keys(countryData[country]?.Regions || {}).map(
      regionMap => ({
        id: regionMap,
        title: regionMap,
        description: '',
      }),
    );
    setRegions(initialRegions);
  }, [country]);

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion);
    setProvince('');
    setCity('');
    setProvinces([]);
    setCities([]);
    setPostalCode('');

    // Populate provinces for the selected region
    const selectProvinces = Object.keys(
      countryData[country]?.Regions[selectedRegion]?.Provinces || {},
    ).map(provinceMap => ({
      id: provinceMap,
      title: provinceMap,
      description: '',
    }));
    setProvinces(selectProvinces);
  };

  const handleProvinceSelect = (selectedProvince: string) => {
    setProvince(selectedProvince);
    setCity('');
    setPostalCode('');

    // Populate cities for the selected province
    const selectCities =
      countryData[country]?.Regions[region]?.Provinces[
        selectedProvince
      ]?.Cities.map(cityMap => ({
        id: cityMap,
        title: cityMap,
        description: '',
      })) || [];
    setCities(selectCities);
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setPostalCode('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Background />
        <View style={styles.elevate}>
          <View style={styles.headerContainer}>
            <Text style={styles.largeHeading}>Address details</Text>
          </View>
          <DynamicDropdown
            label="Region"
            placeholder=" - Select Region -"
            options={regions}
            value={region}
            onSelect={handleRegionSelect}
            isEnabled={!!country} // Enable if a country is selected
          />

          <DynamicDropdown
            label="Province"
            placeholder=" - Select Province - "
            options={provinces}
            value={province}
            onSelect={handleProvinceSelect}
            isEnabled={!!region} // Enable if a region is selected
          />

          <DynamicDropdown
            label="City"
            placeholder=" - Select City - "
            options={cities}
            value={city}
            onSelect={handleCitySelect}
            isEnabled={!!province} // Enable if a province is selected
          />

          <DynamicTextInput
            label="Postal Code"
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="Postal Code"
            keyboardType="numeric"
            isRequired
            isValid={isPostalCodeValid(postalCode)}
            returnKeyType="done"
            errorMessage="Invalid Postal Code"
          />
          <View style={styles.bottomContainer}>
            <DynamicButton
              title="Next"
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate('LoginInfo', {
                  userType,
                  firstName,
                  lastName,
                  phoneNumber,
                  address: {
                    country,
                    region,
                    province,
                    city,
                    postalCode,
                  },
                });
              }}
              type="primary"
              disabled={
                !isNotEmpty(region) ||
                !isNotEmpty(province) ||
                !isNotEmpty(city) ||
                !isPostalCodeValid(postalCode)
              }
            />
            <DynamicButton
              title="Back"
              onPress={() => {
                Keyboard.dismiss();

                navigation.goBack();
              }}
              type="secondary"
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddressDetails;
