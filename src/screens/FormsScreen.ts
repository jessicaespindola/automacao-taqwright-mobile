import type { Mobile } from '@taqwright/taqwright';
import BaseScreen from './BaseScreen';

export default class FormsScreen extends BaseScreen {
  constructor(mobile: Mobile) {
    super(mobile, 'Forms-screen');
  }

  get screen() {
    return this.a11y('Forms-screen');
  }

  get input() {
    return this.a11y('text-input');
  }

  get inputTextResult() {
    return this.a11y('input-text-result');
  }

  get switch() {
    return this.a11y('switch');
  }

  get switchText() {
    return this.a11y('switch-text');
  }

  get dropDown() {
    return this.a11y('Dropdown');
  }

  get activeButton() {
    return this.a11y('button-Active');
  }

  get inactiveButton() {
    return this.a11y('button-Inactive');
  }

  async isSwitchActive(): Promise<boolean> {
    return this.switch.isChecked();
  }

  async tapOnSwitch(): Promise<void> {
    await this.switch.click();
  }

  async tapOnDropDown(): Promise<void> {
    await this.dropDown.click();
  }

  async selectDropdown(value: string): Promise<void> {
    await this.tapOnDropDown();
    const list = this.mobile.getByType('android.widget.ListView');
    await list.assertVisible();
    const option = this.mobile.getByText(value, { exact: true });
    await list.locator(option).click();
    await list.assertHidden();
  }

  async getDropDownText(): Promise<string> {
    const field = this.mobile.getByType('android.widget.EditText');
    return this.dropDown.locator(field).getText();
  }

  async tapOnActiveButton(): Promise<void> {
    await this.activeButton.scrollIntoView();
    await this.activeButton.click();
  }

  async tapOnInactiveButton(): Promise<void> {
    await this.inactiveButton.scrollIntoView();
    await this.inactiveButton.click();
  }

  async submitForm(text: string, dropdownOption: string): Promise<void> {
    await this.input.fill(text);
    await this.hideKeyboardIfShown();

    if (!(await this.isSwitchActive())) {
      await this.tapOnSwitch();
    }

    await this.selectDropdown(dropdownOption);
    await this.tapOnActiveButton();
  }
}
