import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { getAllAssessments } from '../../services/firestore/assessments';
import { NavigationProp, Route } from '@react-navigation/native';

import Colors from '../../styles/Colors';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { workerId: string }>;
}

const AssessmentSelection = ({ route, navigation }: RouterProps) => {

    const [assessmentChoices, setAssessmentChoices] = useState<Array<{ assessmentId: string, title: string }>>([]);

    async function fetchAllAssessments() {
        const assessments = await getAllAssessments();

        if (assessments) {
            setAssessmentChoices(assessments.map((assessment: any) => ({
                assessmentId: assessment.assessmentId,
                title: assessment.title
            })));
        }
    }

    useEffect(() => {
        fetchAllAssessments();
    }, []);

    if (!assessmentChoices) return <Text>Loading...</Text>;


    return (
        <ScrollView contentContainerStyle={localStyles.scrollViewContent}>
            <View style={localStyles.container}>
                <Text style={localStyles.title}>Skills Assessment</Text>
                <Text style={localStyles.description}>Select your line of work.</Text>

                <View style={localStyles.choiceContainer}>
                    {assessmentChoices.map((choice, index) => (
                        <TouchableOpacity
                            key={index}
                            style={localStyles.option}
                            onPress={() => navigation.navigate('AssessmentScreen', { workerId: route.params.workerId, assessmentId: choice.assessmentId })}
                        >
                            <Text style={localStyles.optionText}>{choice.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );

};

const { width, height } = Dimensions.get('window');

const localStyles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center',
    },
    option: {
        width: width * 0.40,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: Colors.primary,
        marginBottom: 20,
    },
    optionText: {
        textAlign: 'center',
        fontSize: 18,
        color: Colors.white,
        padding: 10,
    },
    choiceContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
    },
});


export default AssessmentSelection;