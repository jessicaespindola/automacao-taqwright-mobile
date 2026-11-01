import type { Mobile } from '@taqwright/taqwright';

/**
 * Screen base — equivalente ao BaseScreen do projeto Appium/WDIO.
 *
 * No WDIO o seletor `~id` é accessibility id (content-desc no Android).
 * No Taqwright isso mapeia para `getByLabel` (label de acessibilidade).
 * `getById` no Android aponta para resource-id, não para content-desc.
 */
export default class BaseScreen {
  constructor(
    protected readonly mobile: Mobile,
    protected readonly selector: string,
  ) {}

  /** Equivalente a `$('~id')` do WebdriverIO. */
  protected a11y(id: string) {
    return this.mobile.getByLabel(id);
  }

  async waitForIsShown(isShown = true): Promise<void> {
    const locator = this.a11y(this.selector);
    if (isShown) {
      await locator.assertVisible();
    } else {
      await locator.assertHidden();
    }
  }

  async hideKeyboardIfShown(): Promise<void> {
    if (await this.mobile.isKeyboardShown()) {
      try {
        await this.mobile.hideKeyboard();
      } catch {
        await this.a11y(this.selector).click();
      }
    }
  }
}
