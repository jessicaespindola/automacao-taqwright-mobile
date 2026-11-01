import { allure } from 'allure-playwright';
import { test, expect } from '../../src/fixtures';
import { forms } from '../../src/data/forms';

test.describe('Formulario', () => {
  test.beforeEach(async ({ homeScreen, formsScreen }) => {
    allure.epic('Native Demo App');
    allure.feature('Forms');
    await homeScreen.waitForTabBarShown();
    await homeScreen.openForms();
    await formsScreen.waitForIsShown(true);
  });

  test('deve preencher o formulario e enviar os dados', async ({
    formsScreen,
    nativeAlert,
  }) => {
    allure.severity('critical');
    allure.story('Preencher e enviar formulario');

    await formsScreen.submitForm(forms.sample.text, forms.sample.dropdown);

    await nativeAlert.waitForIsShown(true);
    const alertText = await nativeAlert.text();
    expect(alertText).toContain('This button is');
    expect(alertText.toLowerCase()).toContain('active');

    await nativeAlert.tapButtonWithText('OK');
    await nativeAlert.waitForIsShown(false);

    await expect(formsScreen.inputTextResult).toContainText(forms.sample.text);
    expect(await formsScreen.isSwitchActive()).toBe(true);
    expect(await formsScreen.getDropDownText()).toContain(forms.sample.dropdown);
  });

  test('deve digitar no input e validar o texto espelhado', async ({
    formsScreen,
  }) => {
    allure.severity('normal');
    allure.story('Input espelha texto digitado');

    await formsScreen.input.fill(forms.sample.text);
    await formsScreen.hideKeyboardIfShown();

    await expect(formsScreen.inputTextResult).toContainText(forms.sample.text);
  });

  test('deve ligar e desligar o switch', async ({ formsScreen }) => {
    allure.severity('normal');
    allure.story('Toggle do switch');

    if (await formsScreen.isSwitchActive()) {
      await formsScreen.tapOnSwitch();
    }
    expect(await formsScreen.isSwitchActive()).toBe(false);

    await formsScreen.tapOnSwitch();
    expect(await formsScreen.isSwitchActive()).toBe(true);

    await formsScreen.tapOnSwitch();
    expect(await formsScreen.isSwitchActive()).toBe(false);
  });

  test('deve selecionar cada opcao do dropdown', async ({ formsScreen }) => {
    allure.severity('normal');
    allure.story('Selecao de dropdown');

    for (const option of forms.dropdownOptions) {
      await formsScreen.selectDropdown(option);
      expect(await formsScreen.getDropDownText()).toContain(option);
    }
  });

  test('deve abrir o alert Active e fecha-lo com os 3 botoes', async ({
    formsScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Alert Active com multiplos botoes');

    await formsScreen.tapOnActiveButton();
    await nativeAlert.waitForIsShown(true);
    expect(await nativeAlert.text()).toContain('This button is');

    await nativeAlert.tapButtonWithText('Ask me later');
    await nativeAlert.waitForIsShown(false);

    await formsScreen.tapOnActiveButton();
    await nativeAlert.waitForIsShown(true);
    await nativeAlert.tapButtonWithText('Cancel');
    await nativeAlert.waitForIsShown(false);

    await formsScreen.tapOnActiveButton();
    await nativeAlert.waitForIsShown(true);
    await nativeAlert.tapButtonWithText('OK');
    await nativeAlert.waitForIsShown(false);
  });

  test('deve determinar que o botao Inactive nao abre alert', async ({
    formsScreen,
    nativeAlert,
  }) => {
    allure.severity('normal');
    allure.story('Botao Inactive');

    await nativeAlert.waitForIsShown(false);
    await formsScreen.tapOnInactiveButton();
    await expect(nativeAlert.title).toBeHidden();
  });
});
