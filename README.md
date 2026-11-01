# Automação Mobile — Taqwright (Android)

Projeto-espelho do repositório **Appium + WebdriverIO** (`appium-mobile`), usando **Taqwright 1.0** (runner do Playwright + engine Appium 3) contra o mesmo [WebdriverIO Native Demo App](https://github.com/webdriverio/native-demo-app).

Objetivo: **comparar estrutura, criação e manutenção** lado a lado, pontos positivos, negativos e neutros. Os **18 cenários** (login, navegação, formulário) são os mesmos.

> **Leia primeiro:** o Taqwright **não roda no Node 22**. Sem o 24 o CLI quebra ao importar `taqwright.config.ts`. O projeto Appium deste desafio continua no Node 18/22 — os dois podem coexistir no mesmo PC se você usar um gerenciador de versões (`nvm-windows` ou `fnm`).

---

## Setup neste Windows (checklist)

Valores já vistos neste host (ajuste se o seu caminho for outro):

| Item | Valor / comando |
|---|---|
| Node exigido | **v24.x ou maior** (`node -v`) |
| Node que estava instalado | v22.14.0 (insuficiente) |
| JDK | `C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot` |
| Android SDK | `C:\Users\cliente\AppData\Local\Android\Sdk` |
| Device | Galaxy S23 físico (USB). Este repo **não** sobe emulador — neste notebook o cold boot trava |
| APK | `apps/android.wdio.native.app.v2.2.0.apk` (`npm run app:download`) |
| Porta Appium (este repo) | **4723** (o projeto WDIO usa **4730** — não rode as duas suítes ao mesmo tempo no mesmo device) |

Ordem obrigatória depois de instalar o Node 24:

1. Fechar **todos** os terminais (incluindo os do Cursor) e abrir de novo — senão o `PATH` continua no 22.
2. `node -v` → tem que começar com `v24`.
3. `cd C:\PROJETOS\taqwright_mobile`
4. `npm install` de novo (o `node_modules` antigo foi gerado no 22; o npm avisou `EBADENGINE`).
5. Conferir `.env` (`JAVA_HOME`, `ANDROID_HOME`, `ANDROID_DEVICE_NAME`).
6. `npm run doctor` e `npm run devices`.
7. `npm test`.

---

## 1. Instalar o Node 24 (Windows)

O Taqwright importa `taqwright.config.ts` com `import()` nativo. Isso só existe no **Node 24+**. No 22 o erro é:

```text
Unknown file extension ".ts" for ...\taqwright.config.ts
```

Não é bug deste repositório. O `taqwright doctor` também marca `[error]` abaixo de v24.

### Opção A — nvm-windows (recomendado se você vai manter o Appium no Node 22)

1. Instale [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) (`nvm-setup.exe`).
2. **Feche o Cursor por completo** (não só o terminal) e abra de novo.
3. PowerShell **como o mesmo usuário** (não precisa Admin para `nvm use`):

```powershell
nvm version
nvm install 24
nvm use 24
node -v          # v24.x.x
npm -v
where.exe node   # um único caminho, sob a pasta do nvm
```

Para voltar ao projeto Appium:

```powershell
nvm use 22
cd "C:\PROJETOS\Desafio Técnico Outsera\MOBILE\appium-mobile"
node -v          # v22.x
npm test
```

Se `nvm` não for reconhecido depois do install: o instalador não entrou no `PATH` desta sessão. Feche o Cursor, abra de novo, ou deslogue/logue no Windows.

### Opção B — instalador oficial (substitui o Node do sistema)

1. Em [https://nodejs.org](https://nodejs.org) baixe o **24.x** (Windows Installer `.msi`, 64-bit).
2. Marque a opção de adicionar ao `PATH`.
3. Feche o Cursor por completo e abra de novo.
4. `node -v` tem que ser `v24.x`.

**Efeito colateral:** o Node 22 some do `PATH` global. O `appium-mobile` pode quebrar até você reinstalar o 22 ou passar a usar nvm/fnm. Para comparar os dois stacks no mesmo PC, prefira a opção A.

### Opção C — fnm (PowerShell)

O `fnm install 24` **só baixa** o binário. O `fnm use 24` **não funciona** até o PowerShell avaliar `fnm env`. Sem o hook, o erro é este:

```text
error: We can't find the necessary environment variables to replace the Node version.
You should setup your shell profile to evaluate `fnm env`
```

Nesse estado o `npm test` continua no Node 22 e quebra com `Unknown file extension ".ts"`.

**Nesta sessão** (vale na hora; some ao fechar o terminal):

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
fnm use 24
node -v          # v24.x.x
where.exe node   # o primeiro caminho deve ser ...\fnm_multishells\...\node.exe
```

**Em todo terminal PowerShell** — o hook vai no perfil (`$PROFILE`, em geral `Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`):

```powershell
New-Item -ItemType Directory -Force -Path (Split-Path $PROFILE) | Out-Null
@'
# fnm — obrigatório no PowerShell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
'@ | Set-Content -Path $PROFILE -Encoding UTF8
```

O perfil só carrega em **terminal novo**. Feche este e abra outro, ou rode o bloco “nesta sessão”.

Se o perfil existir e `fnm use` ainda falhar: `Get-ExecutionPolicy -Scope CurrentUser` precisa ser `RemoteSigned` (não `Restricted`):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Neste repo há um `.node-version` com `24`. Com `--use-on-cd` no perfil, ao entrar em `taqwright_mobile` o fnm seleciona o 24 sozinho.

Neste PC o Node 22 do instalador oficial continua em `C:\Program Files\nodejs\`. Isso é bom para o projeto Appium: **sem** o hook do fnm, o `node -v` volta a ser 22. Com o hook ativo neste repo, o 24 entra na frente no `PATH`.

Para o Appium (Node 22), num terminal **sem** ativar o fnm, ou:

```powershell
fnm install 22
fnm use 22
node -v
```

### Conferir que o Cursor está no 24

O terminal integrado herda o `PATH` de quando o Cursor **iniciou**. Depois de instalar o Node:

1. Command Palette → **Developer: Reload Window** (ou feche o Cursor).
2. Abra um terminal novo neste repo.
3. Rode:

```powershell
node -v
where.exe node
```

Se ainda aparecer `v22.14.0`, esta janela do Cursor não recarregou o `PATH`. Feche o aplicativo (bandeja também) e abra de novo.

---

## 2. Arquivo `.env`

```powershell
copy .env.example .env
```

Se o `.env` já existir, **não sobrescreva** sem conferir `JAVA_HOME` e `ANDROID_DEVICE_NAME`.

| Variável | Obrigatória | O que faz |
|---|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | Sim | SDK (`...\AppData\Local\Android\Sdk`) |
| `JAVA_HOME` | Sim (UiAutomator2) | Pasta do JDK 17+, **sem** `\bin` no final. Ex.: `C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot` |
| `ANDROID_DEVICE_NAME` | Sim | Nome lógico do aparelho. Neste PC: `Galaxy_S23`. |
| `ANDROID_PLATFORM_VERSION` | Não | Ex.: `16` — capability extra |
| `ANDROID_UDID` | Sim | Serial USB de `adb devices`. Sem ele o config recusa subir. |
| `APPIUM_PORT` | Não | Padrão **4723** (Appium 3). O WDIO deste desafio usa 4730. |
| `RESET_BETWEEN_TESTS` | Não | `true` = desinstala/reinstala o APK **a cada teste** (bem mais lento). `false` (padrão) = não reinstala. O isolamento da tela fica no fixture `freshApp`. |
| `TAQWRIGHT_TRACE` | Não | `off` (padrão, mais rápido) ou `on-failure` (screenshot + XML só para investigar). |

Conferir o celular:

```powershell
adb devices
npm run devices
```

Se `adb` não for reconhecido, o `doctor` vai reclamar. Acrescente o SDK no `PATH` **desta sessão** (ou nas variáveis de ambiente do Windows):

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:PATH = "$sdk\platform-tools;$sdk\emulator;$env:PATH"
adb version
```

Para valer em todo terminal: Painel de Controle → Variáveis de ambiente → `Path` → adicionar `%LOCALAPPDATA%\Android\Sdk\platform-tools`.

### Galaxy S23 (único alvo)

```env
ANDROID_DEVICE_NAME=Galaxy_S23
ANDROID_PLATFORM_VERSION=16
ANDROID_UDID=serial_que_o_adb_devices_mostrar
```

USB debugging ligado; no Samsung, driver USB da fabricante. Confirme `adb devices` com status `device` (não `unauthorized`). Tela desbloqueada. Serviço de acessibilidade de auto-click **desligado** — ele engole o toque do dedo e o teste parece travado. Não rode esta suíte e a do Appium ao mesmo tempo: as portas são 4723 e 4730, mas o aparelho é o mesmo.

---

## 3. Dependências, APK e doctor

Já no Node 24, neste diretório:

```powershell
cd C:\PROJETOS\taqwright_mobile
npm install
npm run app:download
npm run doctor
npm run devices
```

O `doctor` precisa ficar **sem `[error]`**. `[warn]` (Xcode, ffmpeg, iOS) no Windows é normal — este repo é Android.

Interpretação típica:

| Linha | Esperado |
|---|---|
| Node.js >= 24 | `[ok]` + `v24.x` |
| `adb` | `[ok]` no `PATH` |
| `ANDROID_HOME` | `[ok]` apontando para o SDK |
| `java` | `[ok]` JDK 17+ |
| Appium 3.x | `[ok]` (dependência local do projeto ou toolchain do Taqwright) |
| driver `uiautomator2` | `[ok]` |

Se o Appium 3 / UiAutomator2 faltar:

```powershell
npx appium driver install uiautomator2
npx taqwright doctor
```

O Taqwright também consegue provisionar toolchain Android gerenciada (`npx taqwright install`). Neste POC preferimos o SDK/JDK **já usados pelo projeto Appium**, para a comparação ser justa.

---

## 4. Como executar os testes

Celular conectado (`adb devices` mostra o serial do `.env` como `device`):

```powershell
npm test
```

O Taqwright sobe o Appium na porta `APPIUM_PORT` (`autoStart: true`) e fala com o S23. Não precisa de `appium` global separado e não liga emulador.

Suítes isoladas (iguais ao WDIO):

```powershell
npm run test:login
npm run test:navigation
npm run test:forms
```

Um arquivo / um título:

```powershell
npx taqwright test tests/specs/login.spec.ts
npx taqwright test -g "credenciais validas"
npx taqwright test --project android-device
```

### Relatórios

| Comando | O quê |
|---|---|
| `npm run report` | HTML **nativo** Playwright (`playwright-report/`) — `npx taqwright show-report` |
| `npm run report:allure` | Gera Allure em `reports/allure-report/` (precisa de JDK, como no WDIO) |
| `npm run report:allure:open` | Serve o Allure em HTTP (`http://127.0.0.1:5051/` — porta 5051 para não brigar com o Allure do Appium na 5050) |
| `npm run report:allure:full` | generate + open |

Relatório do dia a dia: `npm run report` (HTML do Playwright). Allure só quando for comparar com o WDIO (`npm run report:allure:full`). Trace fica `off` para a suíte ir mais rápido; para investigar, `TAQWRIGHT_TRACE=on-failure` no `.env` e abra o HTML → teste vermelho → **trace**. Vídeo fica desligado (`video: off`) — no S23 a gravação travou execução e inchou o log.

Codegen (grava taps e sugere locators):

```powershell
npx taqwright codegen
```

---

## Plano de aprendizado (1 semana)

Siga nesta ordem. Cada fase tem exercício neste repo **e** no `appium-mobile`.

| Fase | O quê | Exercício | Critério de pronto |
|---|---|---|---|
| **0 — Ambiente** | Node 24+, JDK 17+, Galaxy S23, Appium 3 | Seções 1–3 deste README; `npm run doctor` e `npm run devices` | doctor sem `[error]`; `adb devices` mostra o S23 |
| **1 — Hello world** | Fixture `mobile` | `npx taqwright codegen` e um tap na Home | `npx taqwright test tests/specs/navigation.spec.ts` passa |
| **2 — Locators** | `$('~id')` → `getByLabel` | Abrir `LoginScreen` nos dois projetos | você explica por que **não** usar `getById` no Android deste app |
| **3 — Screen Objects** | POM + fixtures | Ler `src/fixtures.ts` vs singletons do WDIO | você sabe por que o Taqwright injeta `mobile` e o WDIO usa `$` global |
| **4 — Suíte completa** | 18 cenários | `npm test` aqui e no Appium | 18/18 nos dois (ou lista de gaps com causa) |
| **5 — Evidências** | HTML, trace, Allure, codegen | Falhar um teste de propósito e abrir o trace | debug **sem** `console.log` |
| **6 — Manutenção** | Mudança de UI | Trocar o accessibility id do botão LOGIN nos dois POMs | cronometrar tempo e arquivos tocados |
| **7 — Decisão** | Checklist da empresa | Seção [Decisão](#decisão-para-a-empresa) | recomendação escrita |

Leitura oficial: [Installation](https://www.taqwright.dev/docs/installation) · [Writing tests](https://www.taqwright.dev/docs/writing-tests) · [Configuration](https://www.taqwright.dev/docs/configuration) · [README do Appium](../Desafio%20Técnico%20Outsera/MOBILE/appium-mobile/README.md).

Se o time já usa Playwright na web, as fases 1–3 ficam curtas.

---

## Comparação rápida com o projeto Appium

| Tema | Appium + WDIO (`appium-mobile`) | Taqwright (`taqwright-mobile`) |
|---|---|---|
| Runner | WebdriverIO 9 + Mocha | Playwright Test (via Taqwright) |
| Engine | Appium **2.19** + UiAutomator2 | Appium **3** + UiAutomator2 |
| Node | ≥ 18 (validado no 22) | **≥ 24** |
| API de UI | `$('~id')`, `driver` global | `mobile.getByLabel('id')`, fixture `mobile` |
| Auto-wait | `waitForDisplayed` / `expect` do WDIO | nativo em toda ação/asserção |
| POM | Singleton (`export default new LoginScreen()`) | Classe + fixture (`test.extend`) |
| Config | `config/wdio.android.conf.ts` (~300 linhas) | `taqwright.config.ts` (declarativo) |
| Sobe Appium | `@wdio/appium-service` | `appium.autoStart: true` |
| Device | Emulador ou USB, configurado no WDIO | **Só Galaxy S23** (`local-device` + UDID). Sem emulador |
| Relatório | Allure | HTML Playwright no dia a dia; Allure opcional para comparar |
| Codegen | Inspetor Appium / WDIO | `npx taqwright codegen` |
| Paralelo | `maxInstances` | `workers` + pool no config |
| Maturidade | Ecossistema consolidado | 1.0 (ago/2026), comunidade pequena |
| iOS neste desafio | Não | Mesma API; neste PC não foi executado. Ver [iOS](#ios-documentado-não-executado-aqui) |
| Sessão no S23 | **1 por arquivo** de spec (3 no total) | **1 por teste** (18) e ainda o `freshApp` |
| Tempo da suíte no S23 | **2 min 18 s** | **4,9 min** e **5,0 min** |

### Mapa de pastas (lado a lado)

```
appium-mobile/                         taqwright-mobile/
├── config/wdio.android.conf.ts        ├── taqwright.config.ts
├── src/screens/                       ├── src/screens/
├── src/data/                          ├── src/data/
├── test/specs/*.spec.ts               ├── tests/specs/*.spec.ts
├── (sem fixtures)                     ├── src/fixtures.ts
├── reports/allure-*                   ├── playwright-report/ + reports/allure-*
└── npm test → wdio                    └── npm test → taqwright
```

### Onde a manutenção muda de verdade

- **Trocar um locator:** um Screen Object nos dois. Empate.
- **Criar um teste novo:** Taqwright costuma ser mais curto (auto-wait). WDIO exige disciplina de `waitForDisplayed`.
- **Subir o ambiente:** Taqwright sobe o Appium sozinho. O S23 precisa estar no USB, desbloqueado. Emulador não entra neste repo.
- **Onboarding:** time Playwright web → Taqwright. Time Appium/Java/WDIO → curva menor no Appium.
- **Risco:** Taqwright é jovem. Appium/WDIO têm mais material e gente no mercado.
- **Motor:** os dois falam UiAutomator2. Accessibility id e teclado **transferem**. O dropdown aqui usa `getByText`, não XPath.

### Tempo no mesmo Galaxy S23

Mesmo aparelho (SM-S911B, Android 16), mesmo APK v2.2.0, os mesmos 18 cenários. As duas suítes fecharam verdes. Medido em 1º de novembro de 2026.

| Spec | Cenários | Appium + WDIO | Taqwright (rodada de 4,9 min) |
|---|---|---|---|
| Formulário | 6 | 30,4 s | 1 min 32 s (soma dos 6 testes) |
| Login | 8 | 50,3 s | 2 min 37 s (soma dos 8 testes) |
| Navegação | 4 | 10,3 s | 41 s (soma dos 4 testes) |
| **Suíte** | **18** | **2 min 18 s** | **4,9 min** (confirmação) e **5,0 min** |

O Appium ficou com cerca de metade do tempo. O WebdriverIO abre uma sessão e percorre o arquivo inteiro: 3 sessões para 18 testes. O fixture `mobile` do Taqwright abre uma sessão nova a cada `test`, e o `freshApp` ainda chama `terminateApp` + `activateApp` antes do cenário. O toque na tela é parecido. O que alonga a suíte é subir o UiAutomator2 de novo.

Condições de cada lado, para a próxima medição repetir o mesmo arranjo:

| | Appium + WDIO | Taqwright |
|---|---|---|
| Node | 22.14.0 | 24.21.0 |
| Porta | 4730 | 4723 |
| Engine | Appium 2.19 + UiAutomator2 4.2.9 | Appium 3.8 + UiAutomator2 5 |
| Reset | `noReset: false` (uma vez por sessão) | `noReset: true`, `fullReset: false`, mais `freshApp` |
| Trace / vídeo | Allure com screenshot | `trace: off`, `video: off` |
| Onde o tempo foi lido | linha `Spec Files` do WDIO | linha `18 passed` do Taqwright |

A primeira tentativa do Appium neste PC não chegou no celular: o `@wdio/appium-service` espera 30 segundos e o processo passou disso. A rodada de 2 min 18 s usou `appiumStartTimeout: 120_000` em `appium-mobile/config/wdio.android.conf.ts`.

---

## Possibilidades (documentação)

O que cada produto descreve, a partir da [documentação do Appium](https://appium.io/docs/en/latest/) e do [Taqwright](https://www.taqwright.dev/). A suíte deste desafio rodou só no Android, no Galaxy S23. iOS está nas duas documentações e não foi executado aqui.

O Appium é o servidor e a família de drivers. Ele não escolhe a linguagem nem o runner: o teste pode ser JavaScript, Python, Java, Ruby ou .NET, em cima de WebdriverIO, pytest, JUnit ou outro. Este repositório usa WebdriverIO 9 sobre Appium 2.19.

O Taqwright é um runner. A [escrita de testes](https://www.taqwright.dev/docs/writing-tests) descreve o Playwright Test por cima do Appium 3, com a API `mobile`, e por baixo só dois drivers: UiAutomator2 no Android e XCUITest no iOS. O teste é JavaScript ou TypeScript.

### Quem tem o quê

Uma linha por possibilidade. **Sim** está na documentação daquele produto. **Não** não está. Fontes: [Appium](https://appium.io/docs/en/latest/), [drivers](https://appium.io/docs/en/latest/ecosystem/drivers/) e [Taqwright](https://www.taqwright.dev/).

| Possibilidade | Appium | Taqwright |
|---|---|---|
| Android nativo, emulador e aparelho físico | Sim | Sim |
| iOS e iPadOS no macOS (simulador e aparelho físico) | Sim | Sim |
| Instalar, abrir, encerrar, background e deep link | Sim | Sim |
| Toque, texto, scroll, swipe, pinch, alerta, teclado | Sim | Sim |
| Permissão, rede e locale no Android | Sim | Sim |
| Reset do app entre testes | Sim | Sim |
| Vários aparelhos em paralelo | Sim | Sim |
| BrowserStack e LambdaTest | Sim | Sim |
| Gravação de tela | Sim | Sim |
| iOS na nuvem | Sim | Sim |
| Python, Java, Ruby, .NET e escolha do runner | Sim | Não |
| Espresso, tvOS, watchOS, navegador e desktop | Sim | Não |
| Driver Flutter, TV, Roku e Linux | Sim | Não |
| Guia de WebView ([contexts](https://appium.io/docs/en/latest/guides/context/)) | Sim | Não |
| Plugins, BiDi e Selenium Grid | Sim | Não |
| Runner Playwright, fixtures e HTML | Não | Sim |
| Auto-wait e `expect` a cada 200 ms | Não | Sim |
| `getByLabel` / `getByText` e codegen que ranqueia | Não | Sim |
| Trace por ação e HAR | Não | Sim |
| Agente `lime-cli` que devolve um spec | Não | Sim |
| iOS local no Windows ou Linux | Não | Não |
| Vários workers no mesmo aparelho | Não | Não |
| `toHaveScreenshot` / CSS no celular | Não | Não |
| Nuvem própria | Não | Não |
| Tizen de celular mantido | Não | Não |

iOS local pede macOS e Xcode nos dois. Neste notebook as duas suítes rodaram só no Galaxy S23. O tempo medido está em [Tempo no mesmo Galaxy S23](#tempo-no-mesmo-galaxy-s23). O servidor Appium não espera o elemento sozinho; o WebdriverIO deste desafio espera com `waitforTimeout`.

---

## Tecnologias

| Tecnologia | Papel |
|---|---|
| Node.js 24+ | Runtime (requisito duro do Taqwright) |
| Taqwright 1.0 (`@taqwright/taqwright`) | Runner Playwright + API `mobile` |
| Appium 3 + UiAutomator2 | Engine nativa Android |
| TypeScript | Screen Objects, config, specs |
| Allure Playwright | Relatório comparável ao do Appium |
| Native Demo App v2.2.0 | Mesmo APK do desafio Appium |

## Cenários cobertos

**Total: 18** — iguais ao `appium-mobile`.

| Spec | Arquivo | Cenários |
|---|---|---|
| Login | `tests/specs/login.spec.ts` | 8 |
| Formulário | `tests/specs/forms.spec.ts` | 6 |
| Navegação | `tests/specs/navigation.spec.ts` | 4 |

## Arquitetura

```
taqwright_mobile/
├── apps/                         # APK (não versionado)
├── scripts/download-apk.mjs
├── src/
│   ├── fixtures.ts               # test.extend → home/login/forms/alert
│   ├── screens/                  # Screen Objects (recebem `mobile`)
│   ├── screens/components/       # NativeAlert
│   └── data/                     # users.ts, forms.ts
├── tests/specs/                  # 18 cenários
├── taqwright.config.ts
├── .env.example
└── README.md
```

Fluxo:

1. Specs orquestram cenário e asserções (`test` / `expect`).
2. O fixture automático `freshApp` encerra e reabre o app (`terminateApp` + `activateApp`) sem desinstalar.
3. Fixtures entregam Screen Objects ligados à sessão `mobile`. `HomeScreen`, `LoginScreen` e `FormsScreen` estendem `BaseScreen`.
4. Screen Objects encapsulam locators e ações. Preferência: `getByLabel`, depois `getByText`.
5. `taqwright.config.ts` sobe o Appium contra o S23 e gera o HTML do Playwright.

---

## Boas práticas de performance e arquitetura

Medido neste notebook, no Galaxy S23 (SM-S911B, serial no `.env`, Android 16):

| Rodada | Resultado | Tempo |
|---|---|---|
| Antes destas mudanças (trace ligado em falha, sem `freshApp`) | 18 passaram | cerca de **5,4 min** |
| Depois das mudanças | 18 passaram | **5,0 min** |
| Confirmação, mesma configuração | 18 passaram | **4,9 min** |

O tempo estável depois das mudanças fica em torno de **5 minutos**. No mesmo S23, o Appium + WDIO fez os 18 testes em **2 min 18 s**, porque reaproveita a sessão dentro de cada arquivo. O detalhe está em [Tempo no mesmo Galaxy S23](#tempo-no-mesmo-galaxy-s23). A maior parte do tempo daqui continua sendo a sessão nova a cada teste. O emulador ficou de fora porque o cold boot neste PC trava (Galaxy Nexus API 30 passou de 7 minutos e a sessão morria).

### Tecnologias e estrutura usadas aqui

| Peça | Onde | Papel |
|---|---|---|
| Node.js 24+ | runtime | O Taqwright importa `taqwright.config.ts` com `import()` nativo |
| Taqwright 1.0 | `@taqwright/taqwright` | Runner do Playwright + API `mobile` (auto-wait, `expect`) |
| Appium 3 + UiAutomator2 | dependência local, porta **4723** | Engine nativa. O projeto WDIO usa a **4730** |
| TypeScript | config, screens, specs | Screen Objects e dados tipados |
| Projeto `android-device` | `taqwright.config.ts` | `provider: local-device`, UDID obrigatório, `workers: 1` |
| `BaseScreen` | `src/screens/BaseScreen.ts` | `getByLabel` no lugar do `$('~id')` do WDIO. `getById` neste app é resource-id, não content-desc |
| Screen Objects | `HomeScreen`, `LoginScreen`, `FormsScreen`, `NativeAlert` | POM injetado pelo fixture, sem singleton global |
| Dados | `src/data/users.ts`, `src/data/forms.ts` | Login válido é o do APK (`test@webdriver.io` / `Test1234!`). Texto livre pode ser Taqwright. As três frases do dropdown são as do APK |
| `freshApp` | `src/fixtures.ts` | `terminateApp` + `activateApp` antes de cada teste |
| HTML Playwright | `npm run report` | Relatório que se abre no dia a dia |
| Allure | `npm run report:allure:full` | Só para comparar com o WDIO. Não é o fluxo de cada execução |
| Native Demo App v2.2.0 | `apps/*.apk`, pacote `com.wdiodemoapp` | Mesmo app do desafio Appium |

### O que ficou ligado de propósito

- **`workers: 1` e `fullyParallel: false`.** A [documentação](https://www.taqwright.dev/docs/configuration) só libera paralelo com um `device.pool` do mesmo tamanho. Um S23 não é um pool.
- **`RESET_BETWEEN_TESTS=false`.** Não desinstala o APK a cada teste. O `noReset` evita reinstalar; o `fullReset` fica desligado.
- **`freshApp`.** Isola a tela (dropdown aberto, alerta, tab) sem o custo da reinstalação. Os `beforeEach` só navegam.
- **`TAQWRIGHT_TRACE=off` e `video: off`.** Trace em `on-failure` ainda fotografa cada ação durante o teste. Vídeo no Samsung travou uma execução. Para debugar: `TAQWRIGHT_TRACE=on-failure` e `npm run report`.
- **`connectionTimeout` de 120 segundos e `logLevel: error`.** Os 10 minutos de timeout de AVD eram do emulador. Log em `error` evita despejar screenshot em base64 no terminal.
- **Dropdown com `getByText` dentro do `ListView`**, e o valor escolhido lido pelo `EditText` dentro do `getByLabel('Dropdown')`. Sem XPath nessa tela.
- **`expectTimeout` de 15 segundos.** Falha mais cedo do que o padrão de 30 segundos da documentação, sem encurtar o que já passa.

### O que não usar neste aparelho

- Não criar projeto de emulador nem `autoStartDevice`.
- Não subir `workers` acima de 1.
- Não ligar `video`.
- Não recolocar uma frase de dropdown que o APK não tem. “Appium is awesome” e o e-mail `test@webdriver.io` vêm do app, não da marca Taqwright. Ver [Textos fixos do app](#textos-fixos-do-app-de-demo).
- Não deixar um auto-clicker de acessibilidade ligado no S23.
- Não rodar `npm test` aqui e no `appium-mobile` ao mesmo tempo.

---

## Locators (estratégia)

1. **`getByLabel`** — content-desc / accessibility id (o `~` do WDIO)
2. **`getByText`** — mensagens de validação
3. **`getById`** — resource-id nativo (`com.wdiodemoapp:id/alert_title`)
4. XPath só nos botões do alerta nativo (o texto do botão vem em maiúsculas)

| Elemento | WDIO | Taqwright |
|---|---|---|
| Tab Home / Login / Forms | `$('~Home')` | `mobile.getByLabel('Home')` |
| E-mail / senha | `$('~input-email')` | `mobile.getByLabel('input-email')` |
| LOGIN | `$('~button-LOGIN')` | `mobile.getByLabel('button-LOGIN')` |
| Opção do dropdown | XPath no `ListView` | `list.locator(mobile.getByText('Appium is awesome'))` |
| Erro de e-mail | `UiSelector().text(...)` | `mobile.getByText('Please enter a valid email address')` |
| Título do alerta | XPath resource-id | `mobile.getById('com.wdiodemoapp:id/alert_title')` |

`getById` **não** substitui o `~` neste app Android: no Taqwright, `getById` é resource-id; o `~` do WDIO é content-desc → **`getByLabel`**.

## Credenciais do demo

| Perfil | E-mail | Senha |
|---|---|---|
| Válido | `test@webdriver.io` | `Test1234!` |
| Inválido | `email-invalido` | `123` |

## Textos fixos do app de demo

O framework deste repositório é o **Taqwright**. A palavra **Appium** aparece por dois motivos diferentes, e só um deles é escolha nossa.

O motor por baixo do runner é o Appium 3 (UiAutomator2 no Android, XCUITest no iOS). Porta **4723**, `appium.autoStart`, driver `uiautomator2`. Isso é a ferramenta. O projeto WDIO ao lado usa Appium 2 na porta **4730**.

Os textos que o teste digita ou escolhe na tela vêm do [WebdriverIO Native Demo App](https://github.com/webdriverio/native-demo-app) v2.2.0. Eles já estão compilados no APK. Trocar por uma frase “Taqwright” faz o teste procurar um item que não existe — foi o que deixou o dropdown parado em **Select an item...**.

| Onde | Valor no app | Dá para trocar? |
|---|---|---|
| Pacote | `com.wdiodemoapp` | Não. É o id do APK |
| Login válido | `test@webdriver.io` / `Test1234!` | Não. O app só aceita esse par |
| Dropdown | `This app is awesome`, `webdriver.io is awesome`, `Appium is awesome` | Não. São as três linhas da lista |
| Campo de texto livre | `Formulario Taqwright Testes` | Sim. Não há lista fechada |
| Alertas | `This button is` / `active`, `Success` / `You are logged in!` | Não. São as frases do app |

`src/data/forms.ts` e `src/data/users.ts` repetem esses valores de propósito.

---

## iOS (documentado, não executado aqui)

Esta suíte rodou só no Galaxy S23, neste Windows. iOS **não foi testado**. A [documentação do Taqwright](https://www.taqwright.dev/docs/configuration) descreve a mesma API `mobile` nas duas plataformas: um segundo projeto no `taqwright.config.ts`, os mesmos specs, outro `platform` e outro binário.

Neste notebook isso não sobe. A [instalação](https://www.taqwright.dev/docs/installation) marca Windows e Linux como Android only. iOS local pede **macOS 14 (Sonoma) ou mais novo**, Xcode e o driver `xcuitest`. O `taqwright doctor` avisar de Xcode, ffmpeg e iOS no Windows é o esperado.

O que a documentação prevê, quando houver um Mac ou um device na nuvem:

| Caminho | O que a doc pede | Binário |
|---|---|---|
| Simulador local | `platform: Platform.IOS`, `device.provider: 'emulator'` (a doc usa esse nome também para simulador), `device.name` igual ao simulador (`iPhone 17 Pro` no exemplo). O XCUITest liga o simulador. UDID opcional. | `.app` em `buildPath` |
| iPhone físico | `provider: 'local-device'` e o UDID, no mesmo esquema usado aqui com o S23 | `.ipa` ou o app já instalado, com o bundle id |
| BrowserStack | `provider: 'browserstack'`, nome e `osVersion` do aparelho (`iPhone 15` / `17` no exemplo), `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY` no ambiente | `bs://…` ou um `.ipa` local |
| LambdaTest | `provider: 'lambdatest'`, credenciais `LAMBDATEST_USERNAME` e `LAMBDATEST_ACCESS_KEY` | app enviado ao provider |

Pontos que a doc destaca e que este Android não enfrenta:

- O bundle id iOS pode ser outro. No app de exemplo da Taqelah, Android é `com.taqelah.demo_app` e iOS é `com.taqelah.demoApp`.
- `npx taqwright test` roda **todos** os projetos. Um projeto `ios` neste config faria o Windows tentar o simulador e falhar. Por isso ele não está no `taqwright.config.ts`. No Mac seria `npx taqwright test --project ios`.
- Vídeo no **simulador** precisa de `ffmpeg` no PATH. iPhone físico grava no próprio aparelho. Android também grava no aparelho.
- A sessão iOS passa pelo WebDriverAgent na porta **8100**. A doc cita timeout na primeira compilação do WDA e simulador sem a plataforma iOS do Xcode (`xcodebuild -downloadPlatform iOS`).
- No simulador, o Taqwright liga `appium:forceSimulatorSoftwareKeyboardPresence: true`. Dá para desligar em `capabilities`.
- `npx taqwright devices` no Mac lista simuladores via `xcrun simctl`.

O APK deste repo (`com.wdiodemoapp`) é Android. Uma suíte iOS do mesmo demo precisaria do `.app` / `.ipa` correspondente, que não foi baixado nem executado aqui. Locators de acessibilidade (`getByLabel`) são os que a doc trata como estáveis nas duas plataformas; resource-id de Android (`getById('com.wdiodemoapp:id/...')`) não vale no iOS.

---

## CI

Não há workflow de emulador. A suíte deste repo roda no Galaxy S23 ligado ao notebook.

---

## Troubleshooting

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `Unknown file extension ".ts"` | Node &lt; 24 | Instalar 24; recarregar o Cursor; `node -v` |
| `EBADENGINE` no `npm install` | `npm` rodando no 22 | Mesmo que acima; depois `npm install` de novo |
| `node -v` ainda 22 depois do install | Terminal/Cursor com `PATH` velho | Fechar o Cursor por completo; `where.exe node` |
| `fnm use`: *can't find the necessary environment variables* | PowerShell sem `fnm env` no perfil | Rodar o bloco da [Opção C](#opção-c--fnm-powershell); abrir **terminal novo** depois de gravar `$PROFILE` |
| `nvm` / `fnm` não reconhecido | PATH da sessão | Novo terminal, ou reinstalar o gerenciador |
| doctor: `adb` missing | `platform-tools` fora do PATH | Seção 2 (`PATH` + `ANDROID_HOME`) |
| doctor: JAVA_HOME / java | JDK não apontado | `JAVA_HOME` no `.env` = pasta do JDK, sem `\bin` |
| `APK não encontrado` | Falta o binário | `npm run app:download` |
| Config pede `ANDROID_UDID` | `.env` sem serial | `adb devices` e cole o serial do S23 |
| `unauthorized` no `adb devices` | USB debugging | Aceitar o diálogo no celular; revogar autorizações USB |
| Porta em uso / Appium não sobe | Outro Appium (WDIO na 4730 ou resto na 4723) | Encerre o outro `npm test`; no Windows: `netstat -ano \| findstr :4723` |
| Testes no WDIO quebram depois do Node 24 | Instalador oficial substituiu o 22 | `nvm use 22` no repo Appium, ou reinstalar o 22 |
| Teclado cobre o LOGIN | IME do aparelho | O POM chama `hideKeyboardIfShown`; se falhar, tap fora da tela (mesmo fallback do WDIO) |
| Allure `file://` / Failed to fetch | Abrir HTML pelo Explorer | `npm run report:allure:open` (HTTP) |
| Allure generate falha | Sem Java no PATH | `JAVA_HOME` + `Path` com `%JAVA_HOME%\bin` |

Dois repos no mesmo PC:

- **Não** instale um Appium global único para os dois. Cada `package.json` traz o Appium dele (2.x no WDIO, 3.x aqui).
- **Não** rode `npm test` nos dois ao mesmo tempo no mesmo S23.
- Alterne Node com nvm: `nvm use 24` aqui, `nvm use 22` no Appium.

---

## Pontos de atenção (produto)

| Ponto | Detalhe |
|---|---|
| Node 24 | Requisito duro. O Appium/WDIO deste desafio roda no 22. |
| Appium 3 vs 2 | Dependências locais; não misturar binário global. |
| `RESET_BETWEEN_TESTS` | `false` no dia a dia. O isolamento da tela é o `freshApp`. `true` reinstala o APK e alonga a suíte. |
| Comunidade | Taqwright 1.0 é recente. Trate como POC até validar codegen, nuvem e iOS. |
| Plataforma medida | Este repo rodou no **Android** (S23). iOS está na documentação do Taqwright e não foi executado aqui. |

---

## Decisão para a empresa

Preencha depois da fase 7:

| Critério (peso sugerido) | Appium/WDIO | Taqwright | Nota (1–5) |
|---|---|---|---|
| Tempo para o 1º teste verde | | | |
| Tempo para o 18º teste | 2 min 18 s no S23 | 4,9–5,0 min no S23 | |
| Clareza do POM para o time | | | |
| Debug (screenshot vs trace) | | | |
| Device físico (S23) | | | |
| Risco de lock-in / maturidade | | | |
| Alinhamento com Playwright web | | | |
| Contratação / conhecimento no mercado | | | |

Recomendação: _Taqwright / Appium-WDIO / híbrido (web Playwright + mobile Appium) — preencher após a fase 6._

---

## Scripts (`package.json`)

| Script | Comando |
|---|---|
| `npm test` | Roda a suíte (`taqwright test`) |
| `npm run test:login` / `test:forms` / `test:navigation` | Spec isolada |
| `npm run doctor` | Saúde do ambiente |
| `npm run devices` | Emuladores / devices visíveis |
| `npm run codegen` | Gravador de testes |
| `npm run report` | HTML Playwright |
| `npm run report:allure:full` | Allure HTML + browser |
| `npm run app:download` | Baixa o APK oficial v2.2.0 |

## Referências

- [Taqwright — Installation](https://www.taqwright.dev/docs/installation)
- [Taqwright — Writing tests](https://www.taqwright.dev/docs/writing-tests)
- [Taqwright — Configuration](https://www.taqwright.dev/docs/configuration)
- [Taqwright — Projects](https://www.taqwright.dev/docs/projects)
- [npm `@taqwright/taqwright`](https://www.npmjs.com/package/@taqwright/taqwright)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)
- [WebdriverIO Native Demo App](https://github.com/webdriverio/native-demo-app)
- [Playwright Test](https://playwright.dev/docs/intro)
- [Appium](https://appium.io/docs/en/latest/)
- [Appium — Drivers](https://appium.io/docs/en/latest/ecosystem/drivers/)
- [Appium — Intro to drivers](https://appium.io/docs/en/latest/intro/drivers/)
