export const users = {
  valid: {
    email: 'test@webdriver.io',
    password: 'Test1234!',
  },
  invalid: {
    email: 'email-invalido',
    password: '123',
  },
  invalidEmail: {
    email: 'email-invalido',
    password: 'Test1234!',
  },
  empty: {
    email: '',
    password: '',
  },
  shortPassword: {
    email: 'test@webdriver.io',
    password: '1234567',
  },
  exactPassword: {
    email: 'test@webdriver.io',
    password: '12345678',
  },
} as const;
