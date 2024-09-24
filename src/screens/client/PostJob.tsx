import { View, Text, StyleSheet, TextInput } from 'react-native';
import React from 'react';
import { styles } from '../../styles/Globals';
import { NavigationProp } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import AddJobButton from '../../components/AddJobButton';
import DynamicButton from '../../components/DynamicButton';
import Colors from '../../styles/Colors';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}


export default function PostJob({ navigation }: RouterProps) {
    return (
        <View style={localStyles.container}>
            <View style={localStyles.screen}>
                <View style={localStyles.btnContainerBetween}>
                    <BackButton onPress={async () => navigation.goBack()} />
                    <DynamicButton title='Post' type='primary' onPress={async () => navigation.navigate('Notification')} />
                </View>

                <View style={localStyles.headerContainer}>
                    <Text style={styles.xlargeHeading}> Post a Job </Text>
                </View>

                <View style={{ flex: 1, gap: 15, paddingHorizontal: 16, paddingTop: 40 }}>
                    <View style={{ gap: 5 }}>
                        <Text> Job Category </Text>
                        <TextInput style={localStyles.textInput} placeholder='Select Job Type' />
                    </View>

                    <View style={{ gap: 5 }}>
                        <Text> Pay Rate </Text>
                        <TextInput style={localStyles.textInput} placeholder='Select Job Type' />
                    </View>

                    <View style={{ gap: 5 }}>
                        <Text> Schedule </Text>
                        <TextInput style={localStyles.textInput} placeholder='Select Job Type' />
                    </View>

                    <View style={{ gap: 5 }}>
                        <Text> Address </Text>
                        <TextInput style={localStyles.textInput} placeholder='Select Job Type' />
                    </View>

                    <View style={{ gap: 5 }}>
                        <Text> Job Description </Text>
                        <TextInput
                            editable
                            multiline
                            numberOfLines={4}
                            maxLength={40}
                            style={{ padding: 10, borderRadius: 8, borderColor: Colors.placeholder, backgroundColor: Colors.white, height: 150, paddingHorizontal: 6 }}
                        />
                    </View>
                </View>

            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 40,
        flex: 1,
    },
    screen: {
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 50,
    },
    btnContainerBetween: {
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    headerContainer: {
        paddingTop: 40,
        gap: 50,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.placeholder,
        backgroundColor: Colors.white,
        paddingHorizontal: 6
    }
})
