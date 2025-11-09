# Dolibarr v22 Quality Automation Suite

Este repositorio contiene la infraestructura de automatización solicitada para cubrir las HU de Products y Bill of Materials (BOM) en Dolibarr v22 utilizando Selenium (Python) para pruebas funcionales y PHPUnit para pruebas unitarias. También se integra Allure como dashboard de resultados y un generador de informe en Word.

## Estructura

```
tests/
  functional/
    data/
    utils/
    test_*.py
phpunit/
  bootstrap.php
  phpunit.xml
  tests/
scripts/
  generate_word_report.py
reports/
  functional/
  phpunit/
```

## Prerrequisitos

* Python 3.10+
* Pip y virtualenv (opcional pero recomendado)
* Google Chrome o Chromium disponible localmente **o** un Selenium Grid accesible (configurable vía `SELENIUM_REMOTE_URL`).
* Docker y Docker Compose plugin (para levantar Dolibarr)
* PHP >= 8.1 con extensiones necesarias para ejecutar Dolibarr
* Composer
* Allure CLI (<https://docs.qameta.io/allure/>)

## Puesta en marcha del entorno Docker (Dolibarr v22)

1. Levanta la infraestructura completa:

   ```bash
   docker compose up -d
   ```

   Esto inicia:

   * `dolibarr_app`: contenedor oficial `dolibarr/dolibarr:22.0.2` servido en <http://localhost:8080>.
   * `dolibarr_db`: base de datos MariaDB 10.6 inicializada con credenciales predeterminadas (`dolibarr`/`dolibarr`).

2. Espera a que los contenedores estén saludables (`docker compose ps`).
3. Completa el asistente de instalación de Dolibarr en `http://localhost:8080/install` usando los valores preconfigurados:

   * **Servidor**: `db`
   * **Base de datos**: `dolibarr`
   * **Usuario BD**: `dolibarr`
   * **Password BD**: `dolibarr`
   * **Cuenta admin**: `admin` / `admin` (puedes cambiarla en el asistente o después desde la interfaz).

   El instalador generará automáticamente `docker/dolibarr/conf/conf.php` con la configuración persistida en el repositorio local.

4. (Opcional) Para cargar módulos o personalizaciones coloca los archivos dentro de:

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
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
composer install
```

Si deseas utilizar un Selenium Grid remoto, exporta `SELENIUM_REMOTE_URL` antes de ejecutar las pruebas. En caso contrario, se instalará automáticamente `chromedriver` mediante `webdriver-manager` y se usará el navegador local en modo headless.

## Ejecución de pruebas funcionales (Selenium + Pytest)

Configura las variables de entorno mínimas:

```bash
export BASE_URL=http://localhost:8080
export ADMIN_USER=admin
export ADMIN_PASS=admin
```

Ejecuta la suite completa con reporter de Allure:

```bash
pytest tests/functional -m functional
```

* Resultados Allure (brutos): `reports/functional/allure-results`
* Capturas ante fallo: incrustadas en el reporte Allure

Para abrir el dashboard de Allure:

```bash
allure serve reports/functional/allure-results
```

Si necesitas forzar un Selenium Grid remoto:

```bash
SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub pytest tests/functional -m functional
```

## Ejecución de pruebas unitarias (PHPUnit)

```bash
DOLIBARR_ROOT=/ruta/a/dolibarr php -d include_path=. ./vendor/bin/phpunit -c phpunit/phpunit.xml --testdox --log-junit reports/phpunit/phpunit-junit.xml
```

Los reportes JUnit se almacenan en `reports/phpunit/phpunit-junit.xml` para ser consumidos en el informe unificado.

### Obtener el código fuente de Dolibarr para PHPUnit

Para que las pruebas unitarias puedan incluir clases del core, exporta una copia del código desde el contenedor (solo la primera vez o cuando actualices la versión):

```bash
# Crear un volcado local del core dentro de docker/dolibarr/source
docker compose exec dolibarr_app bash -lc 'tar -C /var/www/html -cf - htdocs core includes scripts' | tar -C docker/dolibarr/source -xf -

# Ejecutar PHPUnit apuntando a la copia exportada
DOLIBARR_ROOT=$(pwd)/docker/dolibarr/source php -d include_path=. ./vendor/bin/phpunit -c phpunit/phpunit.xml --testdox --log-junit reports/phpunit/phpunit-junit.xml
```

El contenido de `docker/dolibarr/source` (excepto el marcador `.gitkeep`) queda fuera del control de versiones para que puedas actualizarlo libremente.

## Generación de informe Word

Luego de ejecutar Pytest (Selenium) y PHPUnit:

```bash
python scripts/generate_word_report.py
```

Esto genera `docs/informe-pruebas.docx` con los totales consolidados.

## Datos masivos y técnicas de prueba

* `tests/functional/data/products.py` define datos dinámicos para reforzar Particiones de Equivalencia, Valores Límite y combinaciones de variantes.
* Las suites contienen pasos detallados y evidencias mediante Allure.
* Las pruebas de PHPUnit contemplan validación de excepciones, reglas de negocio y cobertura de ramas (ver informe de pruebas).

## Integración continua sugerida

1. Levantar stack Docker definido en `docker-compose.yml` (ver informe).
2. Ejecutar semilleros de datos.
3. Correr `pytest tests/functional -m functional` y `phpunit` en paralelo.
4. Publicar reportes Allure y Word como artefactos.

## Notas

* Las pruebas asumen que Dolibarr está poblado con los datos base descritos en el informe.
* Ajustar selectores en caso de personalizaciones de la interfaz.
* Las pruebas unitarias verifican la existencia de las clases del core antes de ejecutarse para permitir reutilización con fuentes oficiales de Dolibarr.
