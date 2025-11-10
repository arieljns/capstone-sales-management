import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guards';

const createContext = (user: any): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  it('allows execution when no roles metadata defined', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = createContext({ role: 'user' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('validates user role against required metadata', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = createContext({ role: 'admin' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('returns false when user role does not match requirements', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = createContext({ role: 'user' });
    expect(guard.canActivate(context)).toBe(false);
  });
});
