import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { getAssessment } from '../services/firestore/assessments';
import { NavigationProp, Route } from '@react-navigation/native';
import Colors from '../styles/Colors';
import { styles } from '../styles/Globals';
import DynamicButton from '../components/DynamicButton';
import { updateWorker } from '../services/firestore/workers';
import { Worker } from '../services/interfaces/worker';
import { FIRESTORE_TIMESTAMP } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';
import { BadgeType } from '../services/interfaces/badge';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { workerId: string, assessmentId: string }>;
}

const AssessmentScreen = ({ navigation, route }: RouterProps) => {
    const { assessmentId } = route.params;
    const [assessment, setAssessment] = useState<any>();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [userAnswers, setUserAnswers] = useState<any>([]);
    const [passFail, setPassFail] = useState<boolean>();

    useEffect(() => {
        const loadAssessment = async () => {
            try {
                console.log('Fetching assessment with ID:', assessmentId);
                const data = await getAssessment(assessmentId);
                if (data) {
                    setAssessment(data)
                }
            } catch (error) {
                console.error('Error fetching assessment:', error);
            }
        };

        if (assessmentId) {
            loadAssessment();
        }
    }, [assessmentId]);

    useEffect(() => {
        // This function will be called when the component unmounts
        return () => {
            // Clear all the state variables
            setAssessment(undefined);
            setCurrentQuestionIndex(0);
            setScore(0);
            setIsCompleted(false);
            setUserAnswers([]);
        };
    }, [])

    async function updateWorkerBadge() {
        try {
            // Update the worker badge with the new score and pass/fail status
            const newDetails: Partial<Worker> = {
                badges: firestore.FieldValue.arrayUnion(assessment.title.toLowerCase()) as any,
                updatedAt: FIRESTORE_TIMESTAMP,
            }
            await updateWorker(route.params.workerId, newDetails);
        } catch (error) {
            console.error('Error updating worker badge:', error);
        }
    }

    useEffect(() => {
        if (isCompleted && passFail === true) {
            console.log('Passed. updating worker badge')
            updateWorkerBadge();
        }
    }, [passFail, isCompleted]);

    if (!assessment) return (
        <View style={localStyles.loadingContainer}>
            <Text style={localStyles.loadingText}>Loading...</Text>
        </View>
    );

    const currentQuestion = assessment.questions[currentQuestionIndex];

    const handleAnswer = (answerIndex: number) => {
        const isCorrect = answerIndex == assessment.questions[currentQuestionIndex].answer;
        setUserAnswers([...userAnswers, answerIndex]);

        const newScore = isCorrect ? score + 1 : score;
        setScore(newScore);

        if (currentQuestionIndex < assessment.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // This is the last question, so we're completing the assessment
            setIsCompleted(true);

            // Calculate the percentage score
            const percentageScore = (newScore / assessment.questions.length) * 100;

            // Set passFail based on whether the score is at least 80%
            setPassFail(percentageScore >= 80);

            console.log('Assessment completed. Final score:', newScore);
            console.log('Percentage score:', percentageScore.toFixed(2) + '%');
            console.log('Pass/Fail:', percentageScore >= 80 ? 'Pass' : 'Fail');
        }
    };


    if (isCompleted) {
        return (
            <ScrollView contentContainerStyle={localStyles.scrollViewContent}>
                <View style={localStyles.container}>
                    <Text style={localStyles.title}>Assessment Complete</Text>
                    <Text style={localStyles.score}>Your Score: {score}/{assessment.questions.length}</Text>

                    {passFail ?
                        <>
                            <Text style={localStyles.boldText}>Congratulations, you've earned a proficiency badge for</Text>
                            <Text style={localStyles.titleText}>{assessment.title}</Text>
                            <DynamicButton title="Back to Profile" type="primary" onPress={() => navigation.navigate('Profile')} />
                        </>
                        :
                        <>
                            <Text style={localStyles.boldText}>You must score at least 80% on an assessment test to earn the proficiency badge.</Text>
                            <DynamicButton title="Back to Profile" type="primary" onPress={() => navigation.navigate('Profile')} />
                        </>
                    }
                </View>

            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={localStyles.scrollViewContent}>
            <Text style={localStyles.titleText}>{assessment.title} Assessment Test. </Text>
            <View style={localStyles.container}>
                <Text style={localStyles.questionNumber}>Question {currentQuestionIndex + 1} of {assessment.questions.length}</Text>
                <Text style={localStyles.question}>{currentQuestion.text}</Text>
                {currentQuestion.options.map((option: string, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={localStyles.option}
                        onPress={() => handleAnswer(index)}
                    >
                        <Text style={localStyles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

};

const { width, height } = Dimensions.get('window');
const localStyles = StyleSheet.create({
    titleText: {
        marginTop: 24,
        fontSize: 24,
        color: Colors.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    boldText: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.labelText,
        textAlign: 'center'
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: Colors.primary,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.primary,
    },
    questionNumber: {
        fontSize: 16,
        marginBottom: 10,
        color: Colors.labelText,
    },
    question: {
        fontSize: 20,
        marginBottom: 30,
        textAlign: 'center',
        color: Colors.black,
    },
    option: {
        width: width * 0.8,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: Colors.white,
    },
    optionText: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.black,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        color: Colors.primary,
    },
});


export default AssessmentScreen;