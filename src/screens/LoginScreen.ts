import type { Mobile } from '@taqwright/taqwright';
import BaseScreen from './BaseScreen';

export default class LoginScreen extends BaseScreen {
  constructor(mobile: Mobile) {
    super(mobile, 'Login-screen');
  }

  get screen() {
    return this.a11y('Login-screen');
  }

  get loginContainerButton() {
    return this.a11y('button-login-container');
  }

  get email() {
    return this.a11y('input-email');
  }

  get password() {
    return this.a11y('input-password');
  }

  get loginButton() {
    return this.a11y('button-LOGIN');
  }

  get emailError() {
    return this.mobile.getByText('Please enter a valid email address');
  }

  get passwordError() {
    return this.mobile.getByText('Please enter at least 8 characters', {
      exact: false,
    });
  }

  async openLoginTab(): Promise<void> {
    await this.loginContainerButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.openLoginTab();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.hideKeyboardIfShown();
    await this.loginButton.scrollIntoView();
    await this.loginButton.click();
  }
}
