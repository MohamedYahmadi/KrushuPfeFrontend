import id from "ajv/lib/vocabularies/core/id";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  RequestResetPassword: undefined;
  ResetPassword: { email: string };
  CreateAccount: undefined;
  Profile: undefined;
  DrawerNavigator: undefined;
  Dashboard: undefined;
  ChangePassword: undefined;
  UsersList: undefined;
  CreateAdminAccount: undefined;
  DepartmentList: { id: number; name: string; };
};