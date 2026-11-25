#!/usr/bin/env bash
# build-release.sh — gera o APK de release do Unicar do zero ao fim.
#
# O que este script faz (idempotente):
#   1. instala dependências (npm install), se node_modules não existir
#   2. regenera o projeto nativo (npx expo prebuild), se android/ não existir
#   3. cria a keystore de release, se ela não existir (ou reutiliza a existente)
#   4. escreve as senhas em android/gradle.properties (seção gerenciada pelo script)
#   5. aplica o signing de release em android/app/build.gradle (uma única vez)
#   6. compila com ./gradlew :app:assembleRelease
#   7. opcionalmente instala no aparelho conectado (--install)
#
# Uso:
#   scripts/build-release.sh                 # fluxo completo (APK universal arm64+x86_64)
#   scripts/build-release.sh --arch arm64    # APK menor, só para o celular (arm64)
#   scripts/build-release.sh --install       # build + instala no aparelho via adb
#   scripts/build-release.sh --help
#
# Env (todas opcionais; têm padrões sensatos):
#   UNICAR_KEYSTORE_PATH        caminho da keystore (padrão: android/app/unicar-release.keystore)
#   UNICAR_KEY_ALIAS            alias (padrão: unicar)
#   UNICAR_STORE_PASSWORD       senha do keystore (se omitida, gera aleatória — só vale para keystore nova)
#   UNICAR_KEY_PASSWORD         senha da chave (padrão: valor de UNICAR_STORE_PASSWORD)
#   UNICAR_DNAME                subject da keystore (padrão: CN=Unicar,...,C=BR)
#
# IMPORTANTE: a keystore e o gradle.properties NÃO são commitados. Para atualizar o app
# instalado com a MESMA assinatura, mantenha essa keystore em lugar seguro (backup).
# Se você quer outra identidade, deixe o script gerar uma nova keystore automaticamente.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ARCH="universal"
INSTALL=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --arch)
      ARCH="${2:?}"; shift 2 ;;
    --arch=*)
      ARCH="${1#*=}"; shift ;;
    --install) INSTALL=1; shift ;;
    --uninstall-first) shift ;; # tratado junto com --install
    --help|-h)
      sed -n '2,32p' "$0"
      exit 0 ;;
    *)
      echo "flag desconhecida: $1 (use --help)" >&2; exit 2 ;;
  esac
done

case "$ARCH" in
  universal|both) GRADLE_ARCH="x86_64,arm64-v8a" ;;
  arm64|arm64-v8a) GRADLE_ARCH="arm64-v8a" ;;
  x86_64) GRADLE_ARCH="x86_64" ;;
  *) echo "--arch inválido: $ARCH (universal|arm64|x86_64)" >&2; exit 2 ;;
esac

echo "==> [1/6] dependências"
if [[ ! -d node_modules ]]; then
  npm install
else
  echo "node_modules presente, pulando npm install"
fi

echo "==> [2/6] projeto nativo (prebuild)"
if [[ ! -f android/gradlew ]]; then
  npx expo prebuild --no-install --platform android
else
  echo "android/ presente, pulando prebuild"
fi

KEYSTORE="${UNICAR_KEYSTORE_PATH:-android/app/unicar-release.keystore}"
ALIAS="${UNICAR_KEY_ALIAS:-unicar}"
DNAME="${UNICAR_DNAME:-CN=Unicar, OU=UFVJM, O=UFVJM, L=Diamantina, S=MG, C=BR}"

echo "==> [3/6] keystore ($KEYSTORE)"
if [[ -f "$KEYSTORE" ]]; then
  STORE_PASS="${UNICAR_STORE_PASSWORD:-}"
  if [[ -z "$STORE_PASS" && -f android/gradle.properties ]]; then
    STORE_PASS="$(grep -E '^unicarReleaseStorePassword=' android/gradle.properties | head -1 | cut -d= -f2- || true)"
  fi
  if [[ -z "$STORE_PASS" ]]; then
    echo "keystore existente: informe UNICAR_STORE_PASSWORD (ou deixe a senha em android/gradle.properties)" >&2
    exit 1
  fi
  KEY_PASS="${UNICAR_KEY_PASSWORD:-$STORE_PASS}"
  echo "keystore existente reutilizado"
else
  STORE_PASS="${UNICAR_STORE_PASSWORD:-$(openssl rand -hex 12)}"
  KEY_PASS="${UNICAR_KEY_PASSWORD:-$STORE_PASS}"
  mkdir -p "$(dirname "$KEYSTORE")"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" -alias "$ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$STORE_PASS" -keypass "$KEY_PASS" \
    -dname "$DNAME" > /dev/null
  echo "keystore NOVA gerada em $KEYSTORE"
  echo "SENHAS (anote, não serão impressas de novo):"
  echo "  storePassword=$STORE_PASS"
  echo "  keyPassword  =$KEY_PASS"
fi

echo "==> [4/6] gradle.properties (seção de assinatura)"
PROPS="android/gradle.properties"
python3 - "$PROPS" "$KEYSTORE" "$ALIAS" "$STORE_PASS" "$KEY_PASS" <<'PYEOF'
import pathlib, re, sys
props_path, store_file, alias, store_pass, key_pass = sys.argv[1:6]
store_file_rel = store_file.replace('android/app/', '')
block = f"""# --- Unicar release signing (gerenciado por scripts/build-release.sh) ---
unicarReleaseStoreFile={store_file_rel}
unicarReleaseStorePassword={store_pass}
unicarReleaseKeyAlias={alias}
unicarReleaseKeyPassword={key_pass}
# --- fim Unicar release signing ---
"""
p = pathlib.Path(props_path)
s = p.read_text() if p.exists() else ''
pattern = re.compile(r'# --- Unicar release signing.*?# --- fim Unicar release signing ---\n', re.DOTALL)
if pattern.search(s):
    s = pattern.sub(block, s)
else:
    s = s.rstrip('\n') + '\n\n' + block
p.write_text(s)
PYEOF
chmod 600 "$PROPS"
echo "gradle.properties atualizado"

echo "==> [5/6] build.gradle (signing de release)"
BG="android/app/build.gradle"
python3 - "$BG" <<'PYEOF'
import pathlib, sys
p = pathlib.Path(sys.argv[1])
s = p.read_text()

signing_block = """        release {
            storeFile file(findProperty('unicarReleaseStoreFile') ?: 'unicar-release.keystore')
            storePassword findProperty('unicarReleaseStorePassword')
            keyAlias findProperty('unicarReleaseKeyAlias') ?: 'unicar'
            keyPassword findProperty('unicarReleaseKeyPassword')
        }
"""

if 'unicarReleaseStoreFile' in s:
    print('build.gradle já configurado, pulando patch')
    sys.exit(0)

old = """        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }"""
new = """        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
""" + signing_block + "    }"
assert old in s, 'bloco signingConfigs.debug não encontrado em build.gradle'
s = s.replace(old, new)

bt = s.find('    buildTypes {')
assert bt != -1, 'buildTypes não encontrado em build.gradle'
idx = s.find('        release {', bt)
assert idx != -1, 'bloco release não encontrado em buildTypes'
rel = s[idx:]
old2 = 'signingConfig signingConfigs.debug'
new2 = 'signingConfig signingConfigs.release'
assert old2 in rel, 'release signingConfig não encontrado em build.gradle'
rel = rel.replace(old2, new2, 1)
s = s[:idx] + rel
p.write_text(s)
print('build.gradle com signing de release aplicado')
PYEOF

echo "==> [6/6] compilando (assembleRelease, arch=$GRADLE_ARCH) — pode levar 7–20 min"
cd android
./gradlew :app:assembleRelease -PreactNativeArchitectures="$GRADLE_ARCH"
cd ..

APK="android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "APK de release gerado:"
echo "  $ROOT/$APK"
ls -lh "$APK"

if [[ "$INSTALL" == "1" ]]; then
  echo ""
  echo "==> instalando no aparelho conectado"
  adb devices | awk 'NR>1 && $2=="device" {print $1}' | while read -r dev; do
    echo "aparelho: $dev"
    adb -s "$dev" uninstall br.edu.ufvjm.unicar || true   # assinatura pode ser diferente (debug→release)
    adb -s "$dev" install "$APK"
  done
fi

echo ""
echo "Pronto. Lembre-se: a keystore e as senhas NÃO vão para o git. Faça backup delas."
