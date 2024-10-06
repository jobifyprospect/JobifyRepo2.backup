export type RootStackParamList = {
  UserTypeSelection: undefined;
  Notification: undefined;
  Post: undefined;
  ClientDashboardScreen: undefined;
  PersonalDetails: {userType: 'client' | 'worker'};
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
  Inside: {role: string | null};
};
