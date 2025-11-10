import { UnauthorizedException } from '@nestjs/common';
import { LocalAuthStrategy } from './local-auth.strategy';

describe('LocalAuthStrategy', () => {
  const usersService = { validateUser: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user when validation succeeds', async () => {
    const user = { id: 'u1' };
    usersService.validateUser.mockResolvedValue(user);
    const strategy = new LocalAuthStrategy(usersService);

    await expect(strategy.validate('email@example.com', 'secret')).resolves.toBe(user);
    expect(usersService.validateUser).toHaveBeenCalledWith('email@example.com', 'secret');
  });

  it('throws UnauthorizedException when service returns null', async () => {
    usersService.validateUser.mockResolvedValue(null);
    const strategy = new LocalAuthStrategy(usersService);

    await expect(strategy.validate('missing@example.com', 'secret')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
