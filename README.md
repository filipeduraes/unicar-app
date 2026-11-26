# Unicar

**Grupo:**

- Alvaro Patrocinio Leite Soares
- Américo Lucas Pereira Vilefort
- Ana Carolina Pereira Dos Santos
- Ana Julia Oliveira Araujo
- Camila Santos Barbosa
- Deivid Camargos Batista
- Filipe Hipólito Diniz Durães
- José Inácio de Moraes Santos
- Marcos Miller Jardim
- Rafael Meira de Menezes

**Disciplina:** Gerência de Projetos de Software

**Professor:** Marcos Antonio Alves

## Sobre o Projeto
Unicar é um protótipo de aplicativo de caronas entre estudantes da UFVJM (Diamantina, MG). O projeto foi feito para a disciplina Gerência de Projetos de Software (GPS), do professor Marcos Antonio Alves.

A ideia é conectar estudantes que fazem o mesmo trajeto, como casa e campus, para dividir o custo de combustível. O login usa o e-mail institucional `@ufvjm.edu.br`.

Este é um protótipo funcional (PoC). Pagamentos, código de verificação e dados de outros estudantes são simulados. O estado fica salvo apenas no dispositivo, sem backend.

- Plataformas: Android e iOS. O foco é Android. iOS está configurado, mas não foi testado neste repositório.
- Origem: o design e a lógica vieram do protótipo web em `../Unicar App - Figma/` (React, Vite e Figma Make). O app atual é nativo, feito com Expo e React Native. A versão web não é suportada.

## Funcionalidades

- Onboarding com boas-vindas, login pelo e-mail institucional (`@ufvjm.edu.br`), código de verificação e confirmação do perfil.
- Tela inicial com mapa da rota (OpenFreeMap e traçado pelo OSRM), busca de caronas e sugestões de trajeto.
- Planejamento de trajeto com ida e volta (casa e campus), escolha do campus (I ou JK), horário limite, data ou recorrência semanal e filtros de desvio, preço e horário.
- Detalhes da carona com mapa e pontos de embarque, motorista verificado, vagas, denúncia e bloqueio, solicitação de vaga e lista de espera.
- Minhas caronas: próximas (confirmação de presença), solicitações (aprovar ou recusar passageiros), recorrências (confirmar ou cancelar cada ocorrência), pagamentos e histórico com avaliação.
- Oferecer carona em quatro etapas (trajeto, agenda, vagas e valor, revisão), com recorrência separada para ida e volta.
- Mensagens com lista de conversas e busca, chat do grupo com moderação (bloqueio de dados financeiros e ofensas), anexos de imagem, documento, localização e carona, além de denúncia e saída do grupo.
- Notificações agrupadas em HOJE e ONTEM, com navegação pelo destino do alerta.
- Perfil com dados acadêmicos e reputação (32 avaliações, 47 viagens, 98%), edição de nome, curso e foto, endereços, preferências, bloqueados e termos.
- Pagamento simulado com PIX e cartão, com os estados aguardando, processando, aprovado, recusado e reembolsado.
- Ajuda e suporte com registro de problemas e protocolo.
- Persistência local do estado e da sessão no dispositivo, usando AsyncStorage.

## Preparar o ambiente do zero

### 1. Pré-requisitos

```bash
# Node.js 20 ou superior (testado com a versão 24) e npm
node --version && npm --version

# Java 17 ou superior (o build usa entre 17 e 21)
sudo apt install -y openjdk-21-jdk   # Debian/Ubuntu. Também serve Temurin 17 ou 21
java -version
```

### 2. Android SDK e NDK

Opção A, recomendada: instale o Android Studio, em https://developer.android.com/studio.

Opção B: instale apenas o cmdline-tools. Baixe as ferramentas de linha de comando do Google, aceite as licenças e rode:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
```

Se o NDK 27.1.12297006 estiver faltando, o Gradle baixa automaticamente. Isso pode levar cerca de 15 minutos.

### 3. Abrir o projeto e instalar dependências

```bash
cd ~/unicar-app
npm install
```

### 4. Conferir a instalação (opcional)

```bash
npx tsc --noEmit        # checagem de tipos
npx expo lint           # lint (eslint-config-expo)
```

## Comandos rápidos — comece aqui

Primeiro, inicie o emulador em um terminal separado (ou conecte o celular via USB):

```bash
$ANDROID_HOME/emulator/emulator -avd Medium_Phone   # deixe esta janela aberta
adb devices                                        # confirme: aparece como "device"
```

Se `ANDROID_HOME` não estiver definido, use o caminho completo, por exemplo `~/Android/Sdk/emulator/emulator`. O AVD `Medium_Phone` (API 36) pode ser criado no Device Manager do Android Studio.

Com o dispositivo pronto, são dois comandos para o dia a dia:

```bash
npm run android:dev       # desenvolvimento: dependências, APK debug e Metro
npm run android:release   # APK de release assinado (universal: celular + emulador)
```

| Objetivo | Comando | Resultado |
| --- | --- | --- |
| Iniciar o emulador | `$ANDROID_HOME/emulator/emulator -avd Medium_Phone` | janela aberta; `adb devices` mostra `emulator-5554` |
| Desenvolver com Fast Refresh | `npm run android:dev` | instala o app e deixa o Metro aberto; pressione `r` para recarregar |
| Escolher dispositivo explicitamente | `npm run android:dev -- --device emulator-5554` | útil com vários dispositivos conectados |
| APK de release para celular | `npm run android:release:arm64` | `app-release.apk` (~57 MB) |
| Release já instalado via adb | `npm run android:release:install` | desinstala o debug, builda e instala o release |
| Ver todas as opções | `./scripts/run-android.sh --help` / `./scripts/build-release.sh --help` | ajuda dos scripts |

Os scripts são idempotentes: instalam dependências se faltarem, geram `android/` com `prebuild` **sem `--clean`** e reaproveitam a keystore/senhas de release. O primeiro build pode levar 15–20 min (download do NDK/Gradle); os segundos terminam em menos de 1 min. O comando de desenvolvimento mantém o terminal aberto com o Metro; o de release termina mostrando o caminho do APK:

```
android/app/build/outputs/apk/release/app-release.apk
```

> Na primeira vez que o release roda, o script gera uma keystore e imprime as senhas uma única vez: anote e faça backup. Sem ela não é possível atualizar o app mantendo a mesma assinatura.

As formas manuais estão mais abaixo, caso você queira executar cada etapa separadamente.

## Rodar em desenvolvimento (forma manual)

O app usa módulos nativos (MapLibre), então Expo Go não funciona. Use o development build, que já está configurado.

### 1. Escolher um dispositivo

- Emulador: no Android Studio, abra o Device Manager e crie um `Medium_Phone` com API 36. Para iniciar pela linha de comando: `$ANDROID_HOME/emulator/emulator -avd Medium_Phone` (deixe a janela aberta).
- Aparelho físico: ative as Opções do desenvolvedor, a Depuração USB e a opção "Instalar via USB". Sem isso, o Samsung One UI bloqueia a instalação por USB e mostra o erro `INSTALL_FAILED_USER_RESTRICTED`. Mantenha a tela desbloqueada durante a instalação e toque em "Instalar" quando o diálogo aparecer no celular.

```bash
adb devices   # confirme que o aparelho ou emulador aparece como "device"
```

### 2. Instalar o development build e subir o Metro

```bash
# gera e instala o APK debug. Só precisa repetir quando mudar código nativo
npx expo run:android        # com emulador ou celular conectado

# no dia a dia, apenas suba o Metro e mantenha aberto
npx expo start

# em outro terminal, crie o túnel USB
adb reverse tcp:8081 tcp:8081   # o celular acessa o Metro como localhost
```

No celular, abra o app Unicar. Na tela do dev client, toque na entrada verde `http://localhost:8081`. Com `adb reverse`, o Metro fica em `localhost` para o aparelho, sem depender da Wi-Fi. Isso evita problemas com roteadores que isolam clientes.

O Fast Refresh está ativo: salvar um arquivo atualiza o app em cerca de 1 segundo.

Em aparelhos físicos com One UI/Android 16, `adb shell input tap` é bloqueado (`SecurityException`). A automação de toques por adb funciona só no emulador. Para capturas de tela, `adb shell screencap` funciona normalmente.

### 3. Debugar

```bash
# logs do app (os logs de JS aparecem com a tag ReactNativeJS)
adb logcat -s ReactNativeJS:V

# menu de desenvolvedor no app: agite o aparelho ou pressione "r" no emulador
```



## Gerar APK de release

O APK de release já traz o bundle JavaScript embutido. Ele roda sem computador e sem Metro. Mapas e cálculo de rota continuam precisando de internet.

### Forma automática (recomendada)

```bash
npm run android:release            # fluxo completo: deps, prebuild, keystore, assinatura e build
npm run android:release:arm64      # APK só para o celular (~57 MB)
npm run android:release:install    # build e instalação via adb
```

### Script direto (sem npm)

Os comandos npm acima chamam este script; use-o se preferir passar flags avançadas:

```bash
./scripts/build-release.sh                  # APK universal (arm64 + x86_64)
./scripts/build-release.sh --arch arm64     # APK só para o celular (~57 MB)
./scripts/build-release.sh --install        # build e instalação via adb (desinstala a versão debug antes)
./scripts/build-release.sh --help
```

O script pode ser rodado várias vezes. Ele reutiliza `android/`, a keystore e as senhas quando já existem. Só cria uma keystore nova se não houver uma, e imprime as senhas uma vez. Ele também configura a assinatura de release no `build.gradle`.

### Assinatura

Este clone não traz a keystore de release do mantenedor, por segurança. Você tem duas opções.

Para manter a mesma assinatura do mantenedor, peça a `unicar-release.keystore` e as senhas a ele (o material está em `unicar-maintainer-backup/`) e coloque os arquivos em `android/`.

Para usar uma assinatura própria, gere uma keystore nova. O app é só um protótipo:

```bash
keytool -genkeypair -v -keystore android/app/unicar-release.keystore \
  -alias unicar -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass <senha> -keypass <senha> \
  -dname "CN=Unicar, OU=UFVJM, O=UFVJM, L=Diamantina, S=MG, C=BR"
```

Registre as senhas em `android/gradle.properties` (ignorado pelo Git):

```
unicarReleaseStoreFile=unicar-release.keystore
unicarReleaseStorePassword=<senha>
unicarReleaseKeyAlias=unicar
unicarReleaseKeyPassword=<senha>
```

O `build.gradle` gerado pelo prebuild não traz a assinatura de release. O template assina o release com a keystore de debug. Depois de rodar `npx expo prebuild --no-install --platform android`, ajuste `android/app/build.gradle` uma vez:

```gradle
// em signingConfigs, adicione:
release {
    storeFile file(findProperty('unicarReleaseStoreFile') ?: 'unicar-release.keystore')
    storePassword findProperty('unicarReleaseStorePassword')
    keyAlias findProperty('unicarReleaseKeyAlias') ?: 'unicar'
    keyPassword findProperty('unicarReleaseKeyPassword')
}

// em buildTypes > release, troque:
signingConfig signingConfigs.debug
// por:
signingConfig signingConfigs.release
```

Sem esse ajuste, `assembleRelease` assina o APK com a keystore de debug. Esse APK serve apenas para instalação local. A pasta `android/` é ignorada pelo Git, então não a commite.

### Build

```bash
# confira se as senhas de assinatura estão em android/gradle.properties
cat android/gradle.properties | grep unicarRelease

# build completo (arm64 + x86_64, cerca de 95 MB)
cd android && ./gradlew :app:assembleRelease

# build só para arm64 (cerca de 57 MB, ideal para o celular)
cd android && ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a

# resultado:
# android/app/build/outputs/apk/release/app-release.apk
```

Um build do zero leva de 15 a 20 minutos. Com cache, termina em menos de 1 minuto. Na primeira vez, o Gradle baixa o NDK automaticamente.

### Instalar no aparelho

A assinatura do release é diferente da do debug, e um APK não sobrescreve o outro. Desinstale o Unicar debug antes de instalar o release:

```bash
# troca a assinatura; os dados locais do app são apagados
adb uninstall br.edu.ufvjm.unicar

# instale o APK
adb install android/app/build/outputs/apk/release/app-release.apk

# ou copie para o celular e abra pelo app Meus Arquivos
adb push android/app/build/outputs/apk/release/app-release.apk /sdcard/Download/
```

Ao instalar pelo arquivo, o aparelho pede permissão para "Instalar apps desconhecidos". Em Samsung, o Bloqueador automático também pode barrar a instalação. Desative-o ou use `adb install`.

### Atualizar depois de mudar o código

```bash
# aumente o versionCode no app.json se for distribuir
npx expo prebuild --no-install --platform android   # regera ícones e recursos nativos (opcional)
cd android && ./gradlew :app:assembleRelease
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Telas (rotas do Expo Router)

```
(tabs)/          Início, Caronas, Oferecer, Chat, Perfil
search           Planejar trajeto (ida e volta)
ride/[id]        Detalhes da carona (parâmetros: id, leg, campus, address)
chat             Conversa do grupo
notifications    Central de alertas
payment          Pagamento da carona (simulado)
support          Ajuda e suporte
```

## Estrutura de pastas

```
unicar/
├── app.json                 # configuração do Expo (plugins, ícone, splash, id de pacote)
├── package.json             # dependências. SDK 54, não atualizar
├── tsconfig.json
├── scripts/
│   ├── run-android.sh       # desenvolvimento em um comando (npm run android:dev)
│   └── build-release.sh     # assinatura e build de release (npm run android:release)
├── README.md                # este arquivo
├── AGENTS.md                # guia para agentes de IA (contribuir, testar, corrigir)
├── assets/images/           # logos e ícone adaptativo (únicos assets do app)
├── android/                 # projeto nativo gerado por prebuild, não versionado
└── src/
    ├── app/                 # rotas (Expo Router)
    │   ├── _layout.tsx      # providers (Auth, Store) e controle de onboarding/sessão
    │   ├── (tabs)/          # abas principais e barra inferior customizada
    │   ├── search.tsx       # Planejar trajeto
    │   ├── ride/[id].tsx    # Detalhes da carona
    │   ├── chat.tsx         # Chat do grupo
    │   ├── notifications.tsx
    │   ├── payment.tsx
    │   └── support.tsx
    ├── components/          # componentes visuais reutilizáveis (ver AGENTS.md)
    ├── constants/theme.ts   # tokens de design (cores, fontes, raios, sombras)
    ├── data.ts              # dados do protótipo e coordenadas (campus e lugares)
    ├── store.tsx            # estado global e persistência com AsyncStorage
    ├── auth.tsx             # sessão local (onboarding e app)
    └── lib/format.ts        # datas em pt-BR sem depender de ICU completo (Hermes)
```

## Verificação

| Verificação | Comando |
| --- | --- |
| TypeScript | `npx tsc --noEmit` |
| Lint | `npx expo lint` |
| Bundle JS de produção | `CI=1 npx expo export --platform android` |
| Desenvolvimento (script) | `npm run android:dev` |
| Debug + emulador (manual) | `npx expo run:android` |
| Release (script) | `npm run android:release` |
| Release (manual) | `cd android && ./gradlew :app:assembleRelease` |
| Instalar APK | `adb install -r android/app/build/outputs/apk/release/app-release.apk` |



## Limitações e observações

- Expo Go não funciona porque o MapLibre é nativo. Use o development build.
- A versão web não é suportada, pois o MapLibre não roda no export de servidor web. Ela foi removida de `app.json` e `package.json`.
- iOS está configurado. Não foi verificado por falta de macOS, e a configuração pode precisar de ajustes.
- Não há backend. Pagamentos, código de verificação (gerado a cada envio, com preenchimento simulado por ação explícita) e dados de terceiros são simulações do PoC. O estado salvo é apenas local.
- Mapas precisam de internet para os tiles do OpenFreeMap e o cálculo de rota pelo OSRM. Sem rede, a tela mostra "Rota indisponível" sem travar.
- Em aparelhos físicos com One UI/Android 16, a instalação só funciona com "Instalar via USB" ativado. `adb shell input tap` é bloqueado, e as capturas de tela funcionam.
- O SDK do Expo é o 54. O template veio com pacotes da linha 58 misturados e foi realinhado para o SDK 54. Não atualize.
- A pasta `android/` é gerada por `expo prebuild` e é ignorada pelo Git. Edições feitas ali, como assinatura e mudanças em JS, são perdidas com `prebuild --clean`.
