#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin}"
: "${DOLIBARR_ROOT?Se requiere la variable DOLIBARR_ROOT apuntando al htdocs de Dolibarr}"

export BASE_URL ADMIN_USER ADMIN_PASS DOLIBARR_ROOT

npm run test:ci
DOLIBARR_ROOT="$DOLIBARR_ROOT" php -d include_path=. ./vendor/bin/phpunit -c phpunit/phpunit.xml --testdox
npm run allure:generate
npm run report:word
