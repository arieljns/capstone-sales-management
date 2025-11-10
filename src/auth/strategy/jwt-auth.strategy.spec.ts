import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthStrategy } from './jwt-auth.strategy';

describe('JwtAuthStrategy', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns a shaped user object from payload', () => {
    const strategy = new JwtAuthStrategy();
    const payload = { sub: 'user-1', email: 'user@example.com', role: 'user' };

    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      role: 'user',
    });
  });

  it('throws UnauthorizedException when payload missing', () => {
    const strategy = new JwtAuthStrategy();
    expect(() => strategy.validate(undefined as any)).toThrow(UnauthorizedException);
  });
});
