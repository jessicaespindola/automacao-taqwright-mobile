import type { Mobile } from '@taqwright/taqwright';

/**
 * Alerta nativo Android da Native Demo App.
 * Mesmos resource-ids do projeto Appium — aqui via getById / getByXpath.
 */
export default class NativeAlert {
  constructor(private readonly mobile: Mobile) {}

  get title() {
    return this.mobile.getById('com.wdiodemoapp:id/alert_title');
  }

  get message() {
    return this.mobile.getById('android:id/message');
  }

  async waitForIsShown(isShown = true): Promise<void> {
    if (isShown) {
      await this.title.assertVisible();
    } else {
      await this.title.assertHidden();
    }
  }

  async tapButtonWithText(text: string): Promise<void> {
    await this.mobile
      .getByXpath(`//android.widget.Button[@text="${text.toUpperCase()}"]`)
      .click();
  }

  async text(): Promise<string> {
    const title = await this.title.getText();
    const message = await this.message.getText();
    return `${title}\n${message}`;
  }
}
