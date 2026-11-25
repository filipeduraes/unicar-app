# AGENTS.md — Unicar

> Guia completo para um agente de IA trabalhar neste repositório. Leia isto antes de
> criar features, corrigir bugs ou testar qualquer coisa.
> Projeto: **Unicar** — protótipo de app de caronas para universitários da UFVJM.
> Disciplina: **Gerência de Projetos de Software (GPS)** — prof. Marcos Antonio Alves.
> Origem do design/lógica: protótipo web em `../Unicar App - Figma/` (React + Vite,
> Figma Make). **Não modifique esse projeto**; ele é a referência visual e funcional e
> está congelado.

---

## 1. O que é o app

Unicar conecta estudantes com trajetos parecidos (casa ↔ campus), dividindo custos de
combustível. Login institucional `@ufvjm.edu.br`, perfil com reputação, caronas com
pontos de embarque no mapa, recorrência semanal, solicitações/aprovações, lista de
espera, chat de grupo com moderação, pagamento simulado (PIX/cartão), histórico com
avaliações, notificações, denúncias/bloqueios, modo escuro **não** suportado.

Estado atual: PoC funcional, **sem backend**. Tudo é simulado no cliente e persistido
no dispositivo.

Plataforma alvo: **Android** (principal) e iOS (configurado, não verificado). **Web não
é e não será suportado** (ver §7).

## 2. Stack e versões (NÃO atualizar o SDK)

| Item | Versão | Observação |
|---|---|---|
| Expo SDK | **54** | `expo ~54.0.38`. O template veio quebrado (expo 54 + pacotes da linha 58); foi realinhado. Não atualizar para 55+ nem "corrigir" as versões. |
| React Native | 0.81.5 | matriz oficial do SDK 54 |
| React | 19.1 | |
| expo-router | ~6.0.24 | rotas em `src/app/`, `typedRoutes` ativo, `reactCompiler` ativo |
| TypeScript | ~5.9 | `strict: true`, paths `@/* → src/*`, `@/assets/* → assets/*` |
| Maplibre | @maplibre/maplibre-react-native 11 | modalidade nativa (não roda em Expo Go, não roda em web) |
| Persistência | @react-native-async-storage/async-storage 2.2.0 | único armazenamento (ver §6) |

Pacotes removidos propositalmente (não reintroduzir):
`@expo/ui`, `expo-symbols`, `expo-glass-effect`, `expo-device`, `expo-web-browser` —
orfãos do template demo; `@expo/ui` canary derrubava o app no boot com `NoClassDefFoundError`.

## 3. Comandos

```bash
npx expo run:android          # build debug + instalar + Metro (precisa emulador/aparelho)
npx expo start                # só o Metro (desenvolvimento diário)
adb reverse tcp:8081 tcp:8081 # túnel USB — celular acessa Metro como localhost
npx expo export --platform android   # valida bundle JS de produção (CI=1 recomendado)
./scripts/build-release.sh           # gera APK release completo (prebuild+signing+build); --help p/ flags
npx expo lint                 # eslint-config-expo (0 warnings esperados)
npx tsc --noEmit              # typecheck (deve passar limpo)
cd android && ./gradlew :app:assembleRelease [-PreactNativeArchitectures=arm64-v8a]  # APK release
```

Dev tools físicos: `adb` em `$ANDROID_HOME/platform-tools/`. Emulador: AVD `Medium_Phone` (API 36, x86_64).

## 4. Mapa de pastas e responsabilidades

```
src/
├── app/                       # TODAS as rotas (Expo Router)
│   ├── _layout.tsx            # providers (Auth, Store), fontes, gate onboarding↔app, Stack
│   ├── (tabs)/                # grupo de abas: Início, Caronas, Oferecer, Chat, Perfil
│   │   ├── _layout.tsx        # <Tabs backBehavior="history" tabBar={<UnicarTabBar/>}>
│   │   ├── index.tsx          # Início (mapa + busca + melhores rotas)
│   │   ├── viagens.tsx        # Minhas caronas (5 seções + bottom sheets)
│   │   ├── oferecer.tsx       # wizard de 4 etapas + tela de sucesso
│   │   ├── mensagens.tsx      # lista de conversas (busca + badges)
│   │   └── perfil.tsx         # perfil + painéis (editar/reviews/endereços/pref./bloqueados/termos)
│   ├── search.tsx             # Planejar trajeto (ida/volta + resultados)
│   ├── ride/[id].tsx          # Detalhes da carona (parâmetros: id, leg, campus, address)
│   ├── chat.tsx               # Conversa do grupo (moderação + anexos + denúncia)
│   ├── notifications.tsx      # Central de alertas HOJE/ONTEM
│   ├── payment.tsx            # Pagamento simulado (PIX/cartão)
│   └── support.tsx            # Ajuda e suporte
├── components/
│   ├── Icon.tsx               # ícones próprios (mesmos paths do SVG web; react-native-svg)
│   ├── Avatar.tsx / Stars.tsx # avatar com gradiente (expo-linear-gradient) / 5 estrelas
│   ├── TopBar.tsx             # header padrão (safe area + logo ou voltar + sino)
│   ├── Field.tsx              # InputShell/ShellInput/Label/Hint/FormGroup
│   ├── DateTimeField.tsx      # DateField/TimeField (@react-native-community/datetimepicker)
│   ├── ResponsiveRow.tsx      # layout que empilha abaixo de 380dp (fields lado a lado)
│   ├── WeekdayPicker.tsx      # Seg..Dom, usado na recorrência
│   ├── BottomNav.tsx          # bottom bar customizada (botão central "+" elevado)
│   ├── BottomSheet.tsx        # modal estilo bottom sheet (todas as telas usam)
│   ├── MapView.tsx            # MapLibre: rota OSRM, marcadores, pílulas de status
│   ├── RideCard.tsx           # card de carona usado em Início/Search
│   ├── Onboarding.tsx         # fluxo completo de login (4 passos + Termos)
│   └── ui.tsx                 # PrimaryButton/SecondaryButton/PendingButton/etc.
├── constants/theme.ts         # Colors, Fonts, Radius, Shadows — USE SEMPRE (sem valores soltos)
├── data.ts                    # fixtures do PoC (riders, fixtureRides) + coordenadas
├── store.tsx                  # StoreContext + AsyncStorage (ver §6)
├── auth.tsx                   # AuthProvider (login/logout, chave unicar-poc-logged)
└── lib/format.ts              # datas/tempos pt-BR determinísticos (Hermes tem ICU parcial)
```

Regra: **`src/app/` só tem rotas.** Lógica de negócio fica em `store.tsx`/`data.ts`;
componentes visuais em `src/components/`. Não duplique telas do web; o web é referência,
não uma etapa de build.

## 5. Design system

Tokens em `constants/theme.ts`. Principais:

- `Colors.brand` `#0984e3` (azul primário), `Colors.brandLight` `#74b9ff`, `Colors.ink` `#2d3436`
- `Colors.route` `#087f5b` (linha da rota/pin A), `Colors.destructivePink` `#d9485f` (pin B)
- `Colors.canvas` `#dfe6e9` (bordas), `Colors.muted` `#636e72` (texto secundário)
- `Colors.surface` `#ffffff`, `Colors.graySoft` `#f7f9fa`, `Colors.blueSoft` `#eaf4ff`
- Tipografia: `Fonts.body*` DM Sans; `Fonts.display*` Manrope (títulos). Pesos via nomes dos
  arquivos do pacote (`Manrope_800ExtraBold`, etc.).
- Bordas/raios: `Radius`; sombras: `Shadows.card`/`Shadows.raised` — não criar sombras soltas.

Padrões visuais a preservar: fundo branco; top bar com logo Unicar ou botão voltar; bottom bar
com botão central "+" elevado; cards com raio 12–18; botão primário `Colors.brand` com sombra
azulada.

## 6. Estado e dados

`src/store.tsx` — `StoreContext` com `StoreProvider` no `_layout` raiz.

- **Hidratação**: ao montar, lê `AsyncStorage` (chave `unicar-poc-state-v1`), mescla com o
  estado inicial e só então persiste. **Nunca** gravar antes de hidratar (senão sobrescreve o
  salvo).
- Fixtures (`data.ts` → `fixtureRides`/`riders`) são **dados de seed do PoC** — o web fazia o
  mesmo. São dados fictícios intencionais; não substituir por "integração real" inventada.
- `auth.tsx` — sessão: chave `unicar-poc-logged` (`"true"`). Sem backend/OAuth; fluxo de login
  é simulado (código `4-8-2-6`).
- Chaves usadas: `unicar-poc-state-v1`, `unicar-poc-logged`.
- Android back: `Tabs` usa `backBehavior="history"` (voltar leva à aba anterior, não sai do
  app). Pushed screens (search, ride, chat...) usam o pop padrão. Se adicionar uma aba nova,
  ela herda isso.

## 7. Restrições e armadilhas (leia antes de mudar qualquer coisa)

1. **Web está desabilitado.** Removido de `app.json` (`web`) e de `package.json` (script `web`),
   porque `@maplibre/maplibre-react-native` não tem implementação web e o export estático
   quebrava avaliando módulos nativos no Node. Não reativar sem um provedor de mapa web
   100% RN-compatível.
2. **Não atualizar o Expo SDK** (ver §2) nem "consertar" versões para o expo-doctor ficar verde;
   o objetivo é a matriz do SDK 54.
3. **expo-dev-client é obrigatório**; Expo Go não serve (nativos). Configuração de dev client
   já existe em `android/`; não usar `EXPO_USE_COMMUNITY_AUTOLINKING=1`.
4. **`expo prebuild --clean` destrói `android/`** — inclusive o signing de release (bloco
   `signingConfigs.release` em `android/app/build.gradle`, senhas em `android/gradle.properties`,
   keystore em `android/app/unicar-release.keystore`). Fazer backup antes de limpar e reaplicar o
   bloco de assinatura manualmente (ver README > Assinatura). `prebuild` sem `--clean` reutiliza
   o projeto e preserva as edições. **Nada disso está no repo.**
5. **Mapas precisam de internet** (tiles `tiles.openfreemap.org` + `router.project-osrm.org`).
   Em código, sempre tratar `routeState` como `"loading" | "ready" | "unavailable"` — nunca
   assumir disponibilidade.
6. **Injeção de toques via adb é bloqueada no aparelho físico** (Samsung One UI/Android 16:
   `SecurityException`). Testes de fluxo no aparelho são manuais; no emulador `input tap`
   funciona normalmente.
7. **Hermes tem Intl limitado** — nunca `toLocaleDateString/toLocaleTimeString` direto para
   exibição; use `src/lib/format.ts` (`formatDateBR`, `formatTimeBR`, etc.).
8. **Times/datas em `Text` não podem envolver para a linha de baixo**: sempre `numberOfLines={1}`
   (+ `adjustsFontSizeToFit` para valores curtos). Campos lado a lado em telas < 380dp devem
   usar `ResponsiveRow`.
9. **Safe area**: telas com CTA fixo no rodapé ou botão flutuante devem usar
   `useSafeAreaInsets()` (ver `ride/[id].tsx`, `chat.tsx`). Telas com `TopBar` já cobrem
   `insets.top`. Scroll content de abas usa `paddingBottom: 110+` (bottom bar ~78dp + insets).
10. **Tabs usam `backBehavior="history"`** — não remover; é o comportamento de voltar esperado
    (abas anteriores → sai só no Início).
11. **Ícones**: `IconName` union em `components/Icon.tsx`; se precisar de um novo ícone,
    adicionar o path lá (mesmo padrão stroke 1.8). Não usar emojis/ícones de pacote.
12. **Riverpod de estado**: só `createContext` + hooks; sem Redux/Zustand.
13. **Tipagem de rotas**: usar paths "flat" (`/viagens`, `/ride/1`), não grupos
    (`/(tabs)/viagens`) em `router.push` — typedRoutes pode recusar.
14. `Avatar` carrega foto de `state.profile.photo` (data URI ou file URI). Foto de perfil
    salva como base64 no perfil (limite ~o que o AsyncStorage aguenta; qualidade 0.7).
15. **Hermes/dev**: reload com Metro rodando e aparelho conectado via `adb reverse tcp:8081 tcp:8081`.
    No CI, `CI=1` evita prompts interativos (`expo export`, builds).

## 8. Convenções de implementação

- **Nomes**: variáveis/funções em inglês; textos ao usuário em **pt-BR**.
- **Componentes**: pequenas unidades reutilizáveis em `src/components/`; telas grandes
  (oferecer/viagens) podem ter sub-componentes locais, mas nada em `src/app/` fora do diretório.
- **Estilos**: `StyleSheet.create` no fim do arquivo + `inline style={}` para ajustes pontuais;
  sempre tokens de `constants/theme.ts` (cores, `Fonts`, `Radius`, `Shadows`). Nada de hex novo
  sem motivo (se necessário, adicione ao tema primeiro).
- **Listas**: `ScrollView` para telas longas; `gap` preferido a margins encadeadas.
- **Estados**: botões `Pressable` com `accessibilityRole="button"` + `accessibilityLabel`
  quando não há texto visível.
- **Sheets**: todo modal novo usa `BottomSheet` (nunca `Alert`/`Modal` direto).
- **Datas**: `DateTimeField` (`DateField`/`TimeField`), formato exibido com `format.ts`.

## 9. Como adicionar uma nova feature (fluxo obrigatório)

1. Leia esta seção e `README.md` (setup) antes de codar.
2. Se tocar em navegação: crie/ajuste a rota em `src/app/` (ou `src/app/(tabs)/` para abas),
   mantenha `backBehavior` e o `TopBar`.
3. Reutilize fixtures de `data.ts` e o estado de `store.tsx`; se a feature precisa de novos
   dados persistidos, estenda `StoreState` em `store.tsx` (mantendo hydration + merge).
4. Respeite §7 (restrições) e §8 (convenções).
5. Valide: `npx tsc --noEmit` → `npx expo lint` → `CI=1 npx expo export --platform android`
   (ou rode no emulador com `npx expo run:android`).
6. Se for visual, tire screenshot via `adb shell screencap -p /sdcard/x.png && adb pull ...`
   e confira: safe areas (câmera/gestos), horários em linha única, textos pt-BR.

## 10. Como testar/corrigir no dispositivo

```bash
adb devices                              # aparelho conectado (device)
npx expo run:android                     # build debug + instala + Metro
adb reverse tcp:8081 tcp:8081            # túnel USB para Metro
adb logcat -s ReactNativeJS:V            # logs JS
adb shell input keyevent 4               # botão voltar
adb shell screencap -p /sdcard/s.png     # screenshot
```

Emulador (`Medium_Phone`, API 36 x86_64) aceita `adb shell input tap x y`; o aparelho físico
não (ver §7.6). O app abre no onboarding na primeira vez; o login aceita qualquer
`@ufvjm.edu.br` e o código fixo `4-8-2-6` (simulação do PoC).

## 11. Mapa de bugs conhecidos / decisões de projeto

- **Expo e dependências da linha 58 misturadas no template** → realinhado para SDK 54;
  `react-native/setup-env` não existe mais no SDK 54 e o export falhava antes da correção.
- **`@expo/ui` canary** → `NoClassDefFoundError` no boot → removido; ninguém usava.
- **Web export quebrava** (`codegenNativeComponent is not a function` em Node) → web removido.
- **Ícone com logo passando do limite de máscara** → `adaptive-icon.png` (círculo escalado para
  ~64% do canvas, dentro da safe zone de 72dp de 108dp) em `assets/images/`.
- **Horários quebrando em 2 linhas** (ex.: `07:10` → `07:1` + `0`) → `numberOfLines={1}` +
  `adjustsFontSizeToFit` + `minimumFontScale={0.72}` em `DateTimeField` + `ResponsiveRow`
  empilhando abaixo de 380dp.
- **Voltar fechando o app** → `backBehavior="history"` nas Tabs + pop padrão nas telas empilhadas.
- **Pílulas sobrepostas no mapa de detalhes** (`1 ponto de embarque` vs `8,4 km · 32 min`) →
  distância movida para a esquerda (`left: 14`).
- **Ocorrencias não confirmadas** são canceladas automaticamente 30 min antes da saída (regra
  do PoC herdada do web — não remover sem regra de negócio equivalente).

## 12. O que NÃO fazer

- Não commitar/alterar `android/` ou `ios/` manualmente (CNG; mudanças via `app.json`/plugins).
- Não trocar AsyncStorage por SecureStore sem revisão (escopo da promessa do app).
- Não introduzir navegação por gesture ou novas stacks sem alinhar com `backBehavior`.
- Não usar `Alert`/`Confirm` nativos para fluxos do app (use `BottomSheet`).
- Não deixar código comentado morto nem dependências sem uso.
- Não mover nem renomear `../Unicar App - Figma/` (referência intocada).
- Não criar novo template Expo dentro deste repositório.

## 13. Contexto acadêmico

Protótipo PoC para avaliação na disciplina GPS (prof. Marcos Antonio Alves, UFVJM). Decisões
refletem escopo de protótipo: dados fictícios de terceiros (riders `Marina Lopes`,
`Lucas Vieira`, `Ana Clara`), pagamentos simulados, persistência local, sem auth real, sem
backend, sem loja de apps configurada. Ao evoluir o app para produto real, revisar nesta ordem:
backend/API, auth institucional (OAuth UFVJM), pagamentos reais, moderação real, LGPD.
