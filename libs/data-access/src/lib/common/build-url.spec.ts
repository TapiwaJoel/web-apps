import { buildUrl } from './build-url';

describe('buildUrl', () => {
  it('joins base, service path, and segments with single slashes', () => {
    expect(
      buildUrl(
        'http://localhost:3000',
        'user-management-service',
        'authentications',
        'login',
      ),
    ).toBe(
      'http://localhost:3000/user-management-service/authentications/login',
    );
  });

  it('trims stray slashes from every part', () => {
    expect(
      buildUrl(
        'http://localhost:3000/',
        '/user-management-service/',
        '/users/',
      ),
    ).toBe('http://localhost:3000/user-management-service/users');
  });
});
