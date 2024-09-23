import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {styles} from '../../../styles/globals';
import {RootStackParamList} from '../../interfaces/RouterStackInterfaceParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DynamicButton from '../../../components/DynamicButton';
import RadialSelection from '../../../components/RadialSelection';
import Background from '../../../components/Background';

type UserTypeSelectionProps = NativeStackScreenProps<
  RootStackParamList,
  'UserTypeSelection'
>;

const options = [
  {
    id: '1',
    title: 'Client',
    description:
      'Choose this if you want to hire services or post job opportunities.',
  },
  {
    id: '2',
    title: 'Worker',
    description:
      "Select this if you're looking to find job opportunities or projects to work on.",
  },
];

const UserTypeSelection = ({navigation}: UserTypeSelectionProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedOptionId(id);
  };

  const isValid = selectedOptionId !== null;

  return (
    <View style={styles.container}>
      <Background />

      <View style={styles.elevate}>
        <View style={styles.headerContainer}>
          <Text style={styles.largeHeading}>User Type</Text>
          <Text style={styles.regularText}>
            To tailor the experience to your needs, please select the type of
            user you are.
          </Text>
        </View>
        {options.map(option => (
          <RadialSelection
            key={option.id}
            title={option.title}
            description={option.description}
            isSelected={selectedOptionId === option.id}
            onSelect={() => handleSelect(option.id)}
          />
        ))}
        <View style={styles.bottomContainer}>
          <DynamicButton
            title="Next"
            onPress={() => {
              navigation.push('PersonalDetails', {
                userType:
                  selectedOptionId?.toString() === '1' ? 'client' : 'worker',
              });
            }}
            type="primary"
            disabled={!isValid}
          />
          <DynamicButton
            title="Cancel"
            onPress={() => {
              navigation.navigate('Login');
            }}
            type="secondary"
          />
        </View>
      </View>
    </View>
  );
};

export default UserTypeSelection;
