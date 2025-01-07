import firestore from '@react-native-firebase/firestore';
import { Assessment } from '../interfaces/assessment';
import { assessmentsRef } from '../../config/firebase';
import { showAlert } from '../../components/AlertDialog';

export const fetchAssessment = async (assessmentId: string) => {
    console.log('received assId', assessmentId);
    try {
        const assessmentDoc = await firestore().collection('assessments').doc(assessmentId).get();
        if (assessmentDoc.exists) {
            console.log(assessmentDoc.data() as Assessment);
            return assessmentDoc.data();

        } else {
            throw new Error('Assessment not found');
        }
    } catch (error) {
        console.error('Error fetching assessment:', error);
        throw error;
    }
};

export const getAssessment = async (assessmentId: string) => {
    try {
        const querySnapshot = await assessmentsRef.where('assessmentId', '==', assessmentId).limit(1).get();

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const assessment = {
                id: doc.id,
                ...doc.data()
            };
            return assessment;
        } else {
            console.log(`Assessment with assessmentId ${assessmentId} not found`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching assessment:', error);
        showAlert('Error', 'Failed to retrieve assessment.');
        throw error;
    }
};



export const getAllAssessments = async () => {
    try {
        const querySnapshot = await assessmentsRef.get();
        const assessments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Retrieved ${assessments.length} assessments`);

        // Log each assessment individually
        assessments.forEach((assessment, index) => {
            console.log(`Assessment ${index}:`, JSON.stringify(assessment, null, 2));
        });
        return assessments;
    } catch (error) {
        console.error('Error fetching all assessments:', error);
        showAlert('Error', 'Failed to retrieve assessments.');
        throw error;
    }
};



