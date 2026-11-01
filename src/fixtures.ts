import { test as base, expect } from '@taqwright/taqwright';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import FormsScreen from './screens/FormsScreen';
import NativeAlert from './screens/components/NativeAlert';

/**
 * Fixtures Playwright — o equivalente idiomático do singleton `export default new X()`
 * do WDIO. Cada teste recebe screens já amarradas ao `mobile` da sessão.
 *
 * Comparar com o Appium: lá o `$`/`driver` é global, então o singleton funciona.
 * Aqui o driver vive no fixture `mobile`, então a injeção evita estado compartilhado.
 */
const APP_BUNDLE_ID = 'com.wdiodemoapp';

type Screens = {
  freshApp: void;
  homeScreen: HomeScreen;
  loginScreen: LoginScreen;
  formsScreen: FormsScreen;
  nativeAlert: NativeAlert;
};

export const test = base.extend<Screens>({
  /**
   * Volta o app para a Home sem desinstalar.
   * Mais barato que resetBetweenTests e evita tela/alerta herdados do teste anterior.
   */
  freshApp: [
    async ({ mobile }, use) => {
      await mobile.terminateApp(APP_BUNDLE_ID);
      await mobile.activateApp(APP_BUNDLE_ID);
      await use();
    },
    { auto: true },
  ],
  homeScreen: async ({ mobile, freshApp: _freshApp }, use) => {
    await use(new HomeScreen(mobile));
  },
  loginScreen: async ({ mobile, freshApp: _freshApp }, use) => {
    await use(new LoginScreen(mobile));
  },
  formsScreen: async ({ mobile, freshApp: _freshApp }, use) => {
    await use(new FormsScreen(mobile));
  },
  nativeAlert: async ({ mobile, freshApp: _freshApp }, use) => {
    await use(new NativeAlert(mobile));
  },
});

export { expect };
