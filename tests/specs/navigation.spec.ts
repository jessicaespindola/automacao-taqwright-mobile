import { allure } from 'allure-playwright';
import { test, expect } from '../../src/fixtures';

test.describe('Navegacao', () => {
  test.beforeEach(async ({ homeScreen }) => {
    allure.epic('Native Demo App');
    allure.feature('Navegacao');
    await homeScreen.waitForTabBarShown();
  });

  test('deve navegar da Home para Forms e validar o botao Active', async ({
    homeScreen,
    formsScreen,
  }) => {
    allure.severity('normal');
    allure.story('Home para Forms');

    await homeScreen.openHome();
    await expect(homeScreen.homeTab).toBeVisible();

    await homeScreen.openForms();
    await formsScreen.waitForIsShown(true);

    await formsScreen.activeButton.scrollIntoView();

    await expect(formsScreen.activeButton).toBeVisible();
    await expect(formsScreen.input).toBeVisible();
  });

  test('deve navegar da Home para Login', async ({
    homeScreen,
    loginScreen,
  }) => {
    allure.severity('normal');
    allure.story('Home para Login');

    await homeScreen.openHome();
    await expect(homeScreen.homeTab).toBeVisible();

    await homeScreen.openLogin();
    await loginScreen.waitForIsShown(true);
    await expect(loginScreen.email).toBeVisible();
  });

  test('deve navegar em ciclo entre Forms, Login e Forms', async ({
    homeScreen,
    formsScreen,
    loginScreen,
  }) => {
    allure.severity('normal');
    allure.story('Ciclo entre tabs');

    await homeScreen.openForms();
    await formsScreen.waitForIsShown(true);

    await homeScreen.openLogin();
    await loginScreen.waitForIsShown(true);

    await homeScreen.openForms();
    await formsScreen.waitForIsShown(true);
    await expect(formsScreen.input).toBeVisible();
  });

  test('deve manter a tab bar acessivel apos navegar', async ({
    homeScreen,
    loginScreen,
    formsScreen,
  }) => {
    allure.severity('normal');
    allure.story('Tab bar permanece acessivel');

    await homeScreen.openLogin();
    await loginScreen.waitForIsShown(true);

    await expect(homeScreen.homeTab).toBeVisible();
    await expect(homeScreen.formsTab).toBeVisible();
    await expect(homeScreen.loginTab).toBeVisible();

    await homeScreen.openForms();
    await formsScreen.waitForIsShown(true);

    await expect(homeScreen.homeTab).toBeVisible();
    await expect(homeScreen.formsTab).toBeVisible();
    await expect(homeScreen.loginTab).toBeVisible();
  });
});
