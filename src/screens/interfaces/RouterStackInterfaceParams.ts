import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type RootStackParamList = {
  UserTypeSelection: undefined;
  Notification: undefined;
  Post: undefined;
  ClientDashboardScreen: undefined;
  Transaction: { _role: string };
  Home: undefined;
  AssessmentSelection: { workerId: string };
  ViewWorkerProfile: { workerId: string };
  ViewClientProfile: { clientId: string };
  AssessmentScreen: { workerId: string, assessmentId: string };
  Portfolio: { workerId: string, userId: string };
  JobDetailsClient: { id: string };
  JobDetailsWorker: { id: string };
  WorkerReviews: { worker_id: string };
  AcceptOrDeclineApplicant: { worker_id: string; job_id: string; app_id: string };
  ManageWorker: { worker_id: string; job_id: string; app_id: string };
  ApplyToJob: { id: string };
  PersonalDetails: { userType: 'client' | 'worker' };
  Profile: undefined;
  FilesUpload: {
    userType: 'client' | 'worker';
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: {
      country: string;
      region: string;
      province: string;
      city: string;
      postalCode: string;
    };
    email: string;
    password: string;
  };
  EditUserDetails: {
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: {
      country: string;
      region: string;
      province: string;
      city: string;
      postalCode: string;
    };
  };
  AddressDetails: {
    userType: 'client' | 'worker';
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  LoginInfo: {
    userType: 'client' | 'worker';
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: {
      country: string;
      region: string;
      province: string;
      city: string;
      postalCode: string;
    };
  };
  PasswordCreation: {
    userType: 'client' | 'worker';
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: {
      country: string;
      region: string;
      province: string;
      city: string;
      postalCode: string;
    };
    email: string;
  };
  IDUpload: {
    userType: 'client' | 'worker';
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: {
      country: string;
      region: string;
      province: string;
      city: string;
      postalCode: string;
    };
    email: string;
    password: string;
    pdfPortfolio: string;
    certificationImages: string[];
  };
  Success: undefined;
  Login: undefined;
  Forgot: undefined;
  Loading: undefined;
  ChangePassword: undefined;
  Inside: { role: string | null };
  MapScreen: {
    latitude: number;
    longitude: number;
    onLocationSelect?: (location: {
      latitude: number;
      longitude: number;
    }) => void;
  };
  WriteReview: {
    job: {
      jobId: string;
      title: string;
      clientId: string;
      createdAt:
      | FirebaseFirestoreTypes.Timestamp
      | FirebaseFirestoreTypes.FieldValue;
      updatedAt:
      | FirebaseFirestoreTypes.Timestamp
      | FirebaseFirestoreTypes.FieldValue;
      assignedWorker: string;
    };
  };
  WriteFeedback: {
    job: {
      jobId: string;
      title: string;
      clientId: string;
      workerId?: string;
      createdAt:
      | FirebaseFirestoreTypes.Timestamp
      | FirebaseFirestoreTypes.FieldValue;
      updatedAt:
      | FirebaseFirestoreTypes.Timestamp
      | FirebaseFirestoreTypes.FieldValue;
      assignedWorker: string;
    };
  };
};
