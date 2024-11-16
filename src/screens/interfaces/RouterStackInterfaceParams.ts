export type RootStackParamList = {
  UserTypeSelection: undefined;
  Notification: undefined;
  Post: undefined;
  ClientDashboardScreen: undefined;
  Transaction: {_role: string};
  Home: undefined;
  JobDetailsClient: {id: string};
  WorkerReviews: {worker_id: string};
  AcceptOrDeclineApplicant: {worker_id: string; job_id: string; app_id: string};
  ApplyToJob: {id: string};
  PersonalDetails: {userType: 'client' | 'worker'};
  Profile: undefined;
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
  };
  Success: {
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
    idImage: string;
    selfieImage: string;
  };
  Login: undefined;
  Forgot: undefined;
  Loading: undefined;
  ChangePassword: undefined;
  Inside: {role: string | null};
  MapScreen: {
    latitude: number;
    longitude: number;
    onLocationSelect?: (location: {
      latitude: number;
      longitude: number;
    }) => void;
  };
};
