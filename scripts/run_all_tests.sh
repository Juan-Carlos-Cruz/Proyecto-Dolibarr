#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/reports"
FUNCTIONAL_RESULTS_DIR="$REPORTS_DIR/functional/allure-results"
PHPUNIT_REPORT_DIR="$REPORTS_DIR/phpunit"

mkdir -p "$FUNCTIONAL_RESULTS_DIR" "$PHPUNIT_REPORT_DIR"

: "${BASE_URL:=http://localhost:8080}"
: "${ADMIN_USER:=admin}"
: "${ADMIN_PASS:=admin}"
: "${DOLIBARR_ROOT:=$ROOT_DIR/docker/dolibarr/source}"
: "${SELENIUM_REMOTE_URL:=http://localhost:4444/wd/hub}"
: "${SELENIUM_AUTOSTART:=1}"

export BASE_URL ADMIN_USER ADMIN_PASS SELENIUM_REMOTE_URL DOLIBARR_ROOT

cd "$ROOT_DIR"

if [[ "$SELENIUM_AUTOSTART" == "1" ]]; then
  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      docker compose up -d selenium >/dev/null
    elif command -v docker-compose >/dev/null 2>&1; then
      docker-compose up -d selenium >/dev/null
    else
      echo "[WARN] No se encontró 'docker compose' ni 'docker-compose'. Inicia el grid Selenium manualmente." >&2
    fi
  else
    echo "[WARN] Docker no está disponible. Asegúrate de exponer SELENIUM_REMOTE_URL hacia un grid existente." >&2
  fi
fi

echo "[1/3] Ejecutando pruebas funcionales (pytest + Selenium)..."
pytest tests/functional -m functional --alluredir "$FUNCTIONAL_RESULTS_DIR"

echo "[2/3] Ejecutando pruebas unitarias (PHPUnit)..."
php -d include_path=. ./vendor/bin/phpunit -c phpunit/phpunit.xml --testdox --log-junit "$PHPUNIT_REPORT_DIR/phpunit-junit.xml"

echo "[3/3] Generando informe Word..."
python scripts/generate_word_report.py

echo "\nEjecución completa. Puedes abrir el dashboard de Allure con:\n  allure serve $FUNCTIONAL_RESULTS_DIR\n"
