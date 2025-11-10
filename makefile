# ====== Config ======
DC          := docker compose
E2E_SERVICE := e2e
ALLURE_SVC  := allure
ALLURE_UI   := allure-ui

# Cambia la ruta si quieres un spec distinto por defecto
SPEC        ?= tests/ui/terceros-crear-oa.spec.ts
BROWSER     ?= chromium        # chromium | firefox | webkit
HEADED      ?= 0               # 1 para headed (xvfb) si lo necesitas

# ====== Infra ======
.PHONY: up down restart build logs clean ps

up:
	$(DC) up -d

down:
	$(DC) down

restart:
	$(DC) down
	$(DC) up -d

build:
	$(DC) build

logs:
	$(DC) logs -f

ps:
	$(DC) ps

clean:
	$(DC) down -v

# ====== E2E - Playwright ======
.PHONY: e2e-shell test test-all test-spec test-chromium test-firefox test-webkit test-headed

# Shell interactivo en el contenedor de e2e
e2e-shell:
	$(DC) run --rm $(E2E_SERVICE) bash

# Test por defecto (variable SPEC controla el archivo)
test:
ifeq ($(HEADED),1)
	$(DC) run --rm $(E2E_SERVICE) bash -lc "xvfb-run -a npx playwright test $(SPEC) --project $(BROWSER)"
else
	$(DC) run --rm $(E2E_SERVICE) bash -lc "npx playwright test $(SPEC) --project $(BROWSER)"
endif

# Ejecuta toda la suite
test-all:
ifeq ($(HEADED),1)
	$(DC) run --rm $(E2E_SERVICE) bash -lc "xvfb-run -a npx playwright test"
else
	$(DC) run --rm $(E2E_SERVICE) bash -lc "npx playwright test"
endif

# Ejecuta un spec arbitrario: make test-spec SPEC=path/a/tu.spec.ts
test-spec:
	@$(MAKE) test SPEC="$(SPEC)"

# Atajos por navegador
test-chromium:
	@$(MAKE) test BROWSER=chromium

test-firefox:
	@$(MAKE) test BROWSER=firefox

test-webkit:
	@$(MAKE) test BROWSER=webkit

# Headed (usa xvfb en la imagen Playwright)
test-headed:
	@$(MAKE) test HEADED=1

# ====== Allure ======
.PHONY: allure-up allure-down allure-open allure-clean

# Levanta el servicio de Allure (API) y la UI
allure-up:
	$(DC) up -d $(ALLURE_SVC) $(ALLURE_UI)
	@echo "Allure API:   http://localhost:5050"
	@echo "Allure UI:    http://localhost:5252"

allure-down:
	$(DC) stop $(ALLURE_SVC) $(ALLURE_UI)

# Abre la UI de allure si ya está arriba
allure-open:
	@echo "Allure UI en http://localhost:5252 (arranca con: make allure-up)"

# Borra resultados y report estático compartido
allure-clean:
	$(DC) run --rm $(E2E_SERVICE) bash -lc "rm -rf report/allure-results/* report/allure-report/* || true"

# ====== Flujos cortos ======
.PHONY: dev test-ci

# Dev rápido: infra + una corrida de pruebas + allure
dev: up test allure-up

# Ejemplo para CI local (todo headless y logs)
test-ci: build up test-all
