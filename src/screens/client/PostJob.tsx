import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { styles } from '../../styles/Globals';
import { NavigationProp } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import DynamicButton from '../../components/DynamicButton';
import Colors from '../../styles/Colors';
import { JOBS, USERS, FIREBASE_AUTH } from '../../config/firebase';
import { showAlert } from '../../components/AlertDialog';
import DynamicTextInput from '../../components/DynamicTextInput';
import { isNotEmpty } from '../../utils/Utils';
import uuid from 'react-native-uuid';
import { firebase } from '@react-native-firebase/firestore';
interface RouterProps {
    navigation: NavigationProp<any, any>;
}


export default function PostJob({ navigation }: RouterProps) {

    const [category, setCategory] = useState('');
    const [rate, setRate] = useState('');
    const [schedule, setSchedule] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);


    function resetForm() {
        setCategory('');
        setRate('');
        setSchedule('');
        setAddress('');
        setDescription('');
    }

    async function post() {
        Keyboard.dismiss();

        setIsSubmitting(true);

        if (!category || !rate || !schedule || !address || !description) {
            setIsSubmitting(false);
            showAlert('Missing fields.', 'Please fill out all required fields.')
            return;
        }

        try {
            await JOBS.add({
                job_id: uuid.v4().toString(),
                client_id: FIREBASE_AUTH.currentUser?.uid,
                category,
                rate,
                schedule,
                address,
                description,
            });

            showAlert('Success', 'Job posted.');
            setIsSubmitting(false);
            resetForm();

        } catch (error: unknown) {
            showAlert('An error occurred while posting the job, ', error as string || 'An error occurred');
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={localStyles.screen}>
                <View style={localStyles.btnContainerBetween}>
                    <BackButton onPress={async () => navigation.goBack()} />

                    <DynamicButton disabled={isSubmitting} title="Post" type="primary" onPress={() => post()} />
                </View>

                <View style={localStyles.headerContainer}>
                    <Text style={styles.xlargeHeading}> Post a Job </Text>
                </View>

                <View style={localStyles.content}>
                    <DynamicTextInput
                        label="Category"
                        value={category}
                        onChangeText={setCategory}
                        isValid={isNotEmpty(category)}
                        suffixIcon="list"
                        keyboardType="default"
                        placeholder="Labor, digital, marketing.."
                        isRequired
                    />

                    <DynamicTextInput
                        keyboardType="decimal-pad"
                        value={rate}
                        onChangeText={setRate}
                        isValid={isNotEmpty(rate)}
                        suffixIcon="peso-sign"
                        label="Rate"
                        placeholder="Rate/hr"
                        isRequired
                    />

                    <DynamicTextInput
                        value={schedule}
                        onChangeText={setSchedule}
                        isValid={isNotEmpty(schedule)}
                        suffixIcon="clock"
                        label="Schedule"
                        placeholder="Day, hours"
                        isRequired
                    />

                    <DynamicTextInput
                        value={address}
                        onChangeText={setAddress}
                        isValid={isNotEmpty(address)}
                        suffixIcon="location-dot"
                        label="Address"
                        placeholder="Job Location"
                        isRequired
                    />

                    <DynamicTextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        isValid={isNotEmpty(description)}
                        suffixIcon="pencil"
                        isRequired
                    />
                </View>

            </View>
        </TouchableWithoutFeedback>
    );
}

const localStyles = StyleSheet.create({
    screen: {
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 50,
        paddingHorizontal: 30,
    },
    btnContainerBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerContainer: {
        paddingTop: 40,
        gap: 50,
    },
    content: {
        flex: 1,
        gap: 15,
        paddingHorizontal: 16,
        paddingTop: 40,
        rowGap: 0,
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.placeholder,
        backgroundColor: Colors.white,
        paddingHorizontal: 6,
    },
    multiLineInput: {
        padding: 10,
        borderRadius: 8,
        borderColor: Colors.placeholder,
        backgroundColor: Colors.white,
        height: 150,
        paddingHorizontal: 6,
    },
});
