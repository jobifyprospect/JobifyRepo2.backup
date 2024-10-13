import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './interfaces/RouterStackInterfaceParams';
import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  detectCountryFromPhone,
  isNotEmpty,
  isPostalCodeValid,
  isValidPhoneNumber,
} from '../utils/Utils';
import countryData from '../utils/CountryData';
import DynamicDropdown from '../components/DropDown';
import DynamicButton from '../components/DynamicButton';
import DynamicTextInput from '../components/DynamicTextInput';
import {styles} from '../styles/Globals';
import BackButton from '../components/BackButton';
import Colors from '../styles/Colors';
import {updateUserDetails} from '../services/firestore/users';
import {showAlert} from '../components/AlertDialog';

type EditUserDetailsProps = NativeStackScreenProps<
  RootStackParamList,
  'EditUserDetails'
>;

type Option = {
  id: string;
  title: string;
  description: string;
};

const EditUserDetails = ({navigation, route}: EditUserDetailsProps) => {
  const {
    userId: userId,
    firstName: initialFirstName,
    lastName: initialLastName,
    phoneNumber: initialPhoneNumber,
    address,
  } = route.params;
  const [isDirty, setIsDirty] = useState(false);

  // Personal Details State
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const lastNameInputRef = useRef<TextInput>(null);
  const phoneNumberInputRef = useRef<TextInput>(null);

  // Address Details State
  const [country, setCountry] = useState<string>(
    address?.country || 'Philippines',
  );
  const [region, setRegion] = useState<string>(address?.region || '');
  const [province, setProvince] = useState<string>(address?.province || '');
  const [city, setCity] = useState<string>(address?.city || '');
  const [postalCode, setPostalCode] = useState<string>(
    address?.postalCode || '',
  );

  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);

  // Load regions based on country and phone number
  useEffect(() => {
    const detectedCountry = detectCountryFromPhone(phoneNumber);
    setCountry(detectedCountry);

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
    const initialRegions = Object.keys(countryData[country]?.Regions || {}).map(
      regionMap => ({
        id: regionMap,
        title: regionMap,
        description: '',
      }),
    );
    setRegions(initialRegions);
  }, [country]);
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
    initialValue: string,
  ) => {
    setter(value);
    if (value !== initialValue) {
      setIsDirty(true); // Mark form as dirty if value is different from initial value
    }
  };
  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion);
    setProvince('');
    setCity('');
    setProvinces([]);
    setCities([]);
    setPostalCode('');

    const selectProvinces = Object.keys(
      countryData[country]?.Regions[selectedRegion]?.Provinces || {},
    ).map(provinceMap => ({
      id: provinceMap,
      title: provinceMap,
      description: '',
    }));
    setProvinces(selectProvinces);
    setIsDirty(true);
  };

  const handleProvinceSelect = (selectedProvince: string) => {
    setProvince(selectedProvince);
    setCity('');
    setPostalCode('');

    const selectCities =
      countryData[country]?.Regions[region]?.Provinces[
        selectedProvince
      ]?.Cities.map(cityMap => ({
        id: cityMap,
        title: cityMap,
        description: '',
      })) || [];
    setCities(selectCities);
    setIsDirty(true);
  };
  // Track if form has been edited

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setPostalCode('');
    setIsDirty(true);
  };
  // Handle Save Button press
  const handleSave = async () => {
    const updates = {
      firstName,
      lastName,
      phoneNumber,
      address: {
        region,
        province,
        city,
        postalCode,
      },
    };

    try {
      // Call the updateUser function
      await updateUserDetails(userId, updates);
      Keyboard.dismiss();
      showAlert('Success', 'User Details changed successfully.');
      navigation.goBack();
    } catch (error) {
      console.error(error); // Handle error here, or show alert if needed
    }
  };
  return (
    <View style={localStyles.screen}>
      <ScrollView stickyHeaderIndices={[0]}>
        <View style={localStyles.headerContainer}>
          <View style={localStyles.btnContainerBetween}>
            <BackButton
              onPress={async () => {
                if (isDirty) {
                  showAlert(
                    'Cancel Changes?',
                    'Your Changes will be discarded.',
                    () => navigation.goBack(),
                  );
                } else {
                  navigation.goBack();
                }
              }}
            />

            <DynamicButton
              title="Save"
              type="primary"
              disabled={
                !isDirty ||
                !isNotEmpty(firstName) ||
                !isNotEmpty(lastName) ||
                !isValidPhoneNumber(phoneNumber) ||
                !isNotEmpty(region) ||
                !isNotEmpty(province) ||
                !isNotEmpty(city) ||
                !isPostalCodeValid(postalCode)
              }
              onPress={handleSave} // Only call post on button press
            />
          </View>
          <Text style={styles.largeHeading}>Edit User Details</Text>
        </View>
        <View style={localStyles.content}>
          {/* Personal Details Section */}
          <Text style={styles.mediumTextBlue}>Personal Details</Text>
          <DynamicTextInput
            label="First Name"
            value={firstName}
            onChangeText={value =>
              handleInputChange(setFirstName, value, initialFirstName)
            }
            placeholder="First Name"
            isRequired={true}
            prefixIcon="user"
            isValid={isNotEmpty(firstName)}
            returnKeyType="next"
            onSubmitEditing={() => lastNameInputRef.current?.focus()}
            autoCapitalize="sentences"
            errorMessage="First Name is less than 3"
          />
          <DynamicTextInput
            ref={lastNameInputRef}
            label="Last Name"
            value={lastName}
            onChangeText={value =>
              handleInputChange(setLastName, value, initialLastName)
            }
            placeholder="Last Name"
            isRequired={true}
            prefixIcon="user"
            isValid={isNotEmpty(lastName)}
            returnKeyType="next"
            onSubmitEditing={() => phoneNumberInputRef.current?.focus()}
            autoCapitalize="sentences"
            errorMessage="Last Name is less than 3"
          />
          <DynamicTextInput
            ref={phoneNumberInputRef}
            label="Phone Number"
            value={phoneNumber}
            onChangeText={value =>
              handleInputChange(setPhoneNumber, value, initialPhoneNumber)
            }
            placeholder="+63 000 000 0000"
            keyboardType="phone-pad"
            isRequired={true}
            prefixIcon="mobile"
            isValid={isValidPhoneNumber(phoneNumber)}
            returnKeyType="done"
            errorMessage="Invalid Phone Number"
          />
          <View style={localStyles.gap} />
          {/* Address Details Section */}
          <Text style={styles.mediumTextBlue}>Address Details</Text>
          <DynamicDropdown
            label="Region"
            placeholder=" - Select Region -"
            options={regions}
            value={region}
            onSelect={handleRegionSelect}
            isEnabled={!!country}
          />
          <DynamicDropdown
            label="Province"
            placeholder=" - Select Province - "
            options={provinces}
            value={province}
            onSelect={handleProvinceSelect}
            isEnabled={!!region}
          />
          <DynamicDropdown
            label="City"
            placeholder=" - Select City - "
            options={cities}
            value={city}
            onSelect={handleCitySelect}
            isEnabled={!!province}
          />
          <DynamicTextInput
            label="Postal Code"
            value={postalCode}
            onChangeText={value =>
              handleInputChange(setPostalCode, value, address?.postalCode || '')
            }
            placeholder="Postal Code"
            keyboardType="numeric"
            isRequired
            isValid={isPostalCodeValid(postalCode)}
            returnKeyType="done"
            errorMessage="Invalid Postal Code"
          />
        </View>
      </ScrollView>
    </View>
  );
};
const localStyles = StyleSheet.create({
  screen: {
    paddingHorizontal: 30,
    flex: 1,
    paddingTop: 25,
  },
  btnContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: {
    backgroundColor: Colors.defaultBackground,
  },
  gap: {
    padding: 8,
  },
  content: {
    paddingBottom: 100,
    paddingTop: 35,
  },
});
export default EditUserDetails;
