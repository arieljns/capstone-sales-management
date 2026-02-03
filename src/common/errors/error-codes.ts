export const ErrorCodes = {
  AUTH_INVALID_TOKEN: {
    code: 'AUTH_401',
    httpStatus: 401,
    publicMessage: 'Authentication failed',
  },

  USER_NOT_FOUND: {
    code: 'USR_404',
    httpStatus: 404,
    publicMessage: 'User not found',
  },

  UNAUTHORIZED_ACCESS: {
    code: 'AUTH_403',
    httpStatus: 403,
    publicMessage: 'You do not have permission to access this resource',
  },

  RESOURCE_NOT_FOUND: {
    code: 'RES_404',
    httpStatus: 404,
    publicMessage: 'Requested resource not found',
  },

  INTERNAL_ERROR: {
    code: 'INT_500',
    httpStatus: 500,
    publicMessage: 'Something went wrong',
  },
} as const;
