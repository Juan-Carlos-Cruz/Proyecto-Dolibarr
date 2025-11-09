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
* Docker y Docker Compose plugin (para levantar Dolibarr)
* PHP >= 8.1 con extensiones necesarias para ejecutar Dolibarr
* Composer
* Python 3.10+
* Allure CLI (https://docs.qameta.io/allure/)

## Puesta en marcha del entorno Docker (Dolibarr v22)

1. Crea los volúmenes locales la primera vez (se generan automáticamente al levantar el stack, pero puedes revisarlos en `docker/`).
2. Levanta la infraestructura completa:

```bash
docker compose up -d
```

   Esto inicia:

   * `dolibarr_app`: contenedor oficial `dolibarr/dolibarr:22.0.2` servido en http://localhost:8080.
   * `dolibarr_db`: base de datos MariaDB 10.6 inicializada con credenciales predeterminadas (`dolibarr`/`dolibarr`).

3. Espera a que los contenedores estén saludables (el servicio `dolibarr_db` tiene healthcheck). Puedes validar con:

```bash
docker compose ps
```

4. Completa el asistente de instalación de Dolibarr en `http://localhost:8080/install` usando los valores preconfigurados:

   * **Servidor**: `db`
   * **Base de datos**: `dolibarr`
   * **Usuario BD**: `dolibarr`
   * **Password BD**: `dolibarr`
   * **Cuenta admin**: `admin` / `admin` (puedes cambiarla en el asistente o después desde la interfaz).

   El instalador generará automáticamente `docker/dolibarr/conf/conf.php` con la configuración persistida en el repositorio local.

5. (Opcional) Para cargar módulos o personalizaciones coloca los archivos dentro de:

   * `docker/dolibarr/custom/`
   * `docker/dolibarr/modules/`

### Comandos útiles

```bash
# Ver logs de los servicios
docker compose logs -f

# Reiniciar únicamente la aplicación web
docker compose restart dolibarr

# Derribar la infraestructura sin perder datos
docker compose down

# Derribar y limpiar volúmenes (reinstalación completa)
docker compose down -v
```

> **Sugerencia:** añade `127.0.0.1 dolibarr.local` a tu `/etc/hosts` y ajusta `DOLI_URL_ROOT` en `docker-compose.yml` si deseas un dominio local personalizado.

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

### Obtener el código fuente de Dolibarr para PHPUnit

Para que las pruebas unitarias puedan incluir clases del core, exporta una copia del código desde el contenedor (solo la primera vez o cuando actualices la versión):

```bash
# Crear un volcado local del core dentro de docker/dolibarr/source
docker compose exec dolibarr_app bash -lc 'tar -C /var/www/html -cf - htdocs core includes scripts' | tar -C docker/dolibarr/source -xf -

# Ejecutar PHPUnit apuntando a la copia exportada
DOLIBARR_ROOT=$(pwd)/docker/dolibarr/source php -d include_path=. ./vendor/bin/phpunit -c phpunit/phpunit.xml --testdox
```

El contenido de `docker/dolibarr/source` (excepto el marcador `.gitkeep`) queda fuera del control de versiones para que puedas actualizarlo libremente.

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
