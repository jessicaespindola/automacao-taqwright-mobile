import type { Mobile } from '@taqwright/taqwright';
import BaseScreen from './BaseScreen';

/**
 * Tab bar da Native Demo App.
 * Equivalente ao HomeScreen do projeto Appium — aqui `mobile` entra por injeção
 * (fixture Playwright), em vez do `$` global do WDIO.
 */
export default class HomeScreen extends BaseScreen {
  constructor(mobile: Mobile) {
    super(mobile, 'Home');
  }

  get homeTab() {
    return this.a11y('Home');
  }

  get loginTab() {
    return this.a11y('Login');
  }

  get formsTab() {
    return this.a11y('Forms');
  }

  get webviewTab() {
    return this.a11y('Webview');
  }

  get swipeTab() {
    return this.a11y('Swipe');
  }

  async waitForTabBarShown(): Promise<void> {
    await this.homeTab.assertVisible();
  }

  async openHome(): Promise<void> {
    await this.homeTab.click();
  }

  async openLogin(): Promise<void> {
    await this.loginTab.click();
  }

  async openForms(): Promise<void> {
    await this.formsTab.click();
  }

  async openWebview(): Promise<void> {
    await this.webviewTab.click();
  }

  async openSwipe(): Promise<void> {
    await this.swipeTab.click();
  }
}
