import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, Platform } from '@taqwright/taqwright';

dotenvConfig();

const apkPath = join(process.cwd(), 'apps', 'android.wdio.native.app.v2.2.0.apk');

if (!existsSync(apkPath)) {
  throw new Error(
    `APK não encontrado em "${apkPath}". Rode: npm run app:download`,
  );
}

const udid = process.env.ANDROID_UDID?.trim();
if (!udid) {
  throw new Error(
    'ANDROID_UDID é obrigatório. Conecte o Galaxy S23, rode `adb devices` e copie o serial para o .env.',
  );
}

const deviceName = process.env.ANDROID_DEVICE_NAME || 'Galaxy_S23';
const appiumPort = Number(process.env.APPIUM_PORT || 4723);
const resetBetweenTests =
  (process.env.RESET_BETWEEN_TESTS || 'false').toLowerCase() === 'true';
const trace = process.env.TAQWRIGHT_TRACE === 'on-failure' ? 'on-failure' : 'off';
const appBundleId = 'com.wdiodemoapp';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/specs/**/*.spec.ts'],
  timeout: 120_000,
  expectTimeout: 15_000,
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],
  outputDir: './test-results',
  projects: [
    {
      name: 'android-device',
      use: {
        platform: Platform.ANDROID,
        device: {
          provider: 'local-device',
          name: deviceName,
          udid,
          ...(process.env.ANDROID_PLATFORM_VERSION
            ? { osVersion: process.env.ANDROID_PLATFORM_VERSION }
            : {}),
          orientation: 'portrait',
        },
        appium: {
          autoStart: true,
          autoStartDevice: false,
          host: '127.0.0.1',
          port: appiumPort,
          path: '/',
          connectionTimeout: 120_000,
          logLevel: 'error',
        },
        ...(resetBetweenTests
          ? {
              resetBetweenTests: true as const,
              buildPath: apkPath,
              appBundleId,
            }
          : {
              resetBetweenTests: false as const,
              buildPath: apkPath,
              appBundleId,
            }),
        trace,
        video: 'off',
        capabilities: {
          'appium:autoGrantPermissions': true,
          'appium:appWaitActivity': 'com.wdiodemoapp.MainActivity',
          'appium:newCommandTimeout': 240,
          'appium:noReset': true,
          'appium:fullReset': false,
        },
      },
    },
  ],
});
