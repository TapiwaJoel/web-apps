export interface CreateUserForm {
  name: string;
  phoneNumber: string;
  emailAddress: string;
  role: string;
}

export const EMPTY_FORM: CreateUserForm = {
  name: '',
  phoneNumber: '',
  emailAddress: '',
  role: '',
};
