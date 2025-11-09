# Dolibarr v22 Quality Automation Suite

Este repositorio contiene la infraestructura de automatización solicitada para cubrir las HU de Products y Bill of Materials (BOM) en Dolibarr v22 utilizando Playwright (TypeScript) para pruebas funcionales y PHPUnit para pruebas unitarias. También se integra Allure como dashboard de resultados y un generador de informe en Word.

## Estructura

```
playwright/
  playwright.config.ts
  fixtures/
  helpers/
  tests/
phpunit/
  bootstrap.php
  phpunit.xml
  tests/
Scripts y reportes complementarios
```

## Prerrequisitos

* Node.js >= 18
* npm
* Docker + docker-compose (para levantar Dolibarr)
* PHP >= 8.1 con extensiones necesarias para ejecutar Dolibarr
* Composer
* Python 3.10+
* Allure CLI (https://docs.qameta.io/allure/)

## Instalación

```bash
npm install
npx playwright install --with-deps
composer install
pip install -r requirements.txt
```

## Ejecución de pruebas funcionales (Playwright)

Configurar las variables de entorno:

```bash
export BASE_URL=http://localhost:8080
export ADMIN_USER=admin
export ADMIN_PASS=admin
```

Ejecutar todo el set de pruebas con reporter de Allure:

```bash
npm run test:ci
```

* Resultados HTML: `playwright/playwright-report`
* Resultados Allure: `playwright/allure-results`

Para abrir el dashboard de Allure:

```bash
npm run allure:serve
```

## Ejecución de pruebas unitarias (PHPUnit)

```bash
DOLIBARR_ROOT=/ruta/a/dolibarr php -d include_path=. ./vendor/bin/phpunit -c phpunit/phpunit.xml --testdox
```

Los reportes JUnit y TeamCity se almacenan en `playwright/reports/` para ser consumidos en el informe unificado.

## Generación de informe Word

Luego de ejecutar Playwright y PHPUnit:

```bash
npm run report:word
```

Esto genera `docs/informe-pruebas.docx` con los totales consolidados.

## Datos masivos y técnicas de prueba

* `playwright/fixtures/test-data.ts` genera 50 productos con combinatoria de segmentos, IVA, tipos y variantes para reforzar Particiones de Equivalencia, Valores Límite y Tablas de Decisión.
* Las suites contienen bucles y data-driven testing para ejercitar múltiples rutas.
* Las pruebas de PHPUnit contemplan validación de excepciones, reglas de negocio y cobertura de ramas.

## Integración continua sugerida

1. Levantar stack Docker definido en `docker-compose.yml` (ver informe).
2. Ejecutar semilleros de datos.
3. Correr `npm run test:ci` y `phpunit` en paralelo.
4. Publicar reportes Allure y Word como artefactos.

## Notas

* Las pruebas asumen que Dolibarr está poblado con los datos base descritos en el informe.
* Ajustar selectores en caso de personalizaciones de la interfaz.
* Las pruebas unitarias verifican la existencia de las clases del core antes de ejecutarse para permitir reutilización con fuentes oficiales de Dolibarr.
