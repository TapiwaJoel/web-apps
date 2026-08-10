export interface CreateSystemUserDto {
  _id?: string;
  name: string;
  phoneNumber: string;
  emailAddress: string;
  country: string;
  role: string;
  user?: string;
}
