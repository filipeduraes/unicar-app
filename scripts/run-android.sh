#!/usr/bin/env bash
# run-android.sh — desenvolvimento Android em um comando.
#
# O que este script faz:
#   1. instala dependências se node_modules não existir
#   2. gera android/ com prebuild se ele ainda não existir (nunca --clean)
#   3. encontra o emulador/aparelho conectado (ou usa --device)
#   4. configura o túnel adb reverse em aparelhos físicos
#   5. roda `expo run:android`: build debug, instalação e Metro
#
# Uso:
#   scripts/run-android.sh                       # usa o único dispositivo conectado
#   scripts/run-android.sh --device emulator-5554
#   scripts/run-android.sh --help
#
# Também disponível como: npm run android:dev -- --device <id>

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DEVICE=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --device)
      DEVICE="${2:?informe o id do dispositivo (adb devices)}"; shift 2 ;;
    --device=*)
      DEVICE="${1#*=}"; shift ;;
    --help|-h)
      sed -n '2,18p' "$0"; exit 0 ;;
    *)
      echo "flag desconhecida: $1 (use --help)" >&2; exit 2 ;;
  esac
done

# --- adb (o ANDROID_HOME pode não estar no PATH) ---
ADB="$(command -v adb || true)"
if [[ -z "$ADB" && -n "${ANDROID_HOME:-}" && -x "$ANDROID_HOME/platform-tools/adb" ]]; then
  ADB="$ANDROID_HOME/platform-tools/adb"
fi
if [[ -z "$ADB" ]]; then
  echo "adb não encontrado. Instale o Android SDK/platform-tools e configure ANDROID_HOME." >&2
  exit 1
fi

# --- dispositivo ---
mapfile -t DEVICES < <("$ADB" devices | awk 'NR>1 && $2=="device" {print $1}')
if [[ ${#DEVICES[@]} -eq 0 ]]; then
  echo "Nenhum dispositivo conectado. Inicie o emulador Medium_Phone ou conecte o celular via USB." >&2
  echo "Confira com: $ADB devices" >&2
  exit 1
fi
if [[ -z "$DEVICE" ]]; then
  DEVICE="${DEVICES[0]}"
  if [[ ${#DEVICES[@]} -gt 1 ]]; then
    echo "Vários dispositivos conectados; usando $DEVICE."
    echo "Para escolher: scripts/run-android.sh --device <id>"
  fi
fi

echo "==> [1/4] dependências"
if [[ -d node_modules ]]; then
  echo "node_modules presente, pulando npm install"
else
  npm install
fi

echo "==> [2/4] projeto nativo (prebuild)"
if [[ -f android/gradlew ]]; then
  echo "android/ presente, pulando prebuild"
else
  npx expo prebuild --no-install --platform android
fi

echo "==> [3/4] dispositivo: $DEVICE"
if [[ "$DEVICE" != emulator-* ]]; then
  # No aparelho físico o Metro precisa ser localhost (evita Wi-Fi/roteador isolado).
  "$ADB" -s "$DEVICE" reverse tcp:8081 tcp:8081 || \
    echo "Aviso: não foi possível configurar o adb reverse; verifique o cabo/depuração USB."
fi

echo "==> [4/4] build debug + instalação + Metro"
echo "Deixe esta janela aberta. Salvar arquivos recarrega o app (ou pressione r no Metro)."
export ANDROID_SERIAL="$DEVICE"
exec npx expo run:android
