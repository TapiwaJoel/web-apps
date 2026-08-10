// eslint-disable-next-line @nx/enforce-module-boundaries -- intentional: verifies barrel resolution through the public package entry
import {
  LoginDto,
  UserResponseDto,
  UserType,
  UserStatus,
  RoleResponseDto,
} from '@mushaviri/api-contracts';

describe('user-management contracts', () => {
  it('exposes DTOs and enums through the root barrel', () => {
    const login: LoginDto = { identifier: 'a@b.com', password: 'secret123' };
    const user: UserResponseDto = {
      _id: '1',
      name: 'A',
      phoneNumber: '+263771234567',
      userType: UserType.Individual,
      status: UserStatus.ACTIVE,
      country: 'Zimbabwe',
      role: 'r1',
      createdAt: '',
      updatedAt: '',
    };
    const role: RoleResponseDto | null = null;
    expect(login.identifier).toBe('a@b.com');
    expect(user.status).toBe('ACTIVE');
    expect(role).toBeNull();
  });
});
