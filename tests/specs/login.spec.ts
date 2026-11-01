import { allure } from 'allure-playwright';
import { test, expect } from '../../src/fixtures';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ homeScreen, loginScreen }) => {
    allure.epic('Native Demo App');
    allure.feature('Login');
    await homeScreen.waitForTabBarShown();
    await homeScreen.openLogin();
    await loginScreen.waitForIsShown(true);
  });

  test('deve fazer login com credenciais validas', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('critical');
    allure.story('Login valido');

    await loginScreen.login(users.valid.email, users.valid.password);

    await nativeAlert.waitForIsShown(true);
    const alertText = await nativeAlert.text();
    expect(alertText).toContain('Success');
    expect(alertText).toContain('You are logged in!');

    await nativeAlert.tapButtonWithText('OK');
    await nativeAlert.waitForIsShown(false);
  });

  test('deve exibir erro ao tentar login com as duas credenciais invalidas', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login invalido');

    await loginScreen.login(users.invalid.email, users.invalid.password);

    await expect(loginScreen.emailError).toBeVisible();
    await expect(loginScreen.passwordError).toBeVisible();
    await nativeAlert.waitForIsShown(false);
  });

  test('deve exibir erro ao tentar login sem preencher o campo email', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login sem email');

    await loginScreen.login(users.empty.email, users.valid.password);

    await expect(loginScreen.emailError).toBeVisible();
    await nativeAlert.waitForIsShown(false);
  });

  test('deve exibir erro ao tentar login com email e senha vazio', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login com campos vazios');

    await loginScreen.login(users.empty.email, users.empty.password);

    await expect(loginScreen.emailError).toBeVisible();
    await expect(loginScreen.passwordError).toBeVisible();
    await nativeAlert.waitForIsShown(false);
  });

  test('deve exibir erro ao tentar informar senha com menos de 8 caracteres', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login com senha curta');

    await loginScreen.login(
      users.shortPassword.email,
      users.shortPassword.password,
    );

    await expect(loginScreen.passwordError).toBeVisible();
    await nativeAlert.waitForIsShown(false);
  });

  test('deve exibir erro ao tentar login com email invalido e senha valida', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login com email invalido');

    await loginScreen.login(
      users.invalidEmail.email,
      users.invalidEmail.password,
    );

    await expect(loginScreen.emailError).toBeVisible();
    await nativeAlert.waitForIsShown(false);
  });

  test('deve exibir erro ao tentar login com email valido e senha vazia', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login sem senha');

    await loginScreen.login(users.valid.email, users.empty.password);

    await expect(loginScreen.passwordError).toBeVisible();
    await nativeAlert.waitForIsShown(false);
  });

  test('deve fazer login com senha de exatamente 8 caracteres', async ({
    loginScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Login com senha no limite minimo');

    await loginScreen.login(
      users.exactPassword.email,
      users.exactPassword.password,
    );

    await nativeAlert.waitForIsShown(true);
    const alertText = await nativeAlert.text();
    expect(alertText).toContain('Success');
    expect(alertText).toContain('You are logged in!');

    await nativeAlert.tapButtonWithText('OK');
    await nativeAlert.waitForIsShown(false);
  });
});
