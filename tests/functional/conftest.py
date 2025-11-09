import os
from typing import Generator, Optional

import allure
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

try:
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:  # pragma: no cover - optional dependency handled via requirements
    ChromeDriverManager = None  # type: ignore

DEFAULT_TIMEOUT = int(os.getenv("SELENIUM_WAIT_TIMEOUT", "20"))
DEFAULT_REMOTE_URL = os.getenv("SELENIUM_REMOTE_DEFAULT", "http://localhost:4444/wd/hub")


def _should_use_remote() -> bool:
    return os.getenv("SELENIUM_FORCE_LOCAL", "").lower() not in {"1", "true", "yes"}


def _resolve_remote_url() -> Optional[str]:
    if not _should_use_remote():
        return None
    return os.getenv("SELENIUM_REMOTE_URL") or DEFAULT_REMOTE_URL


def _build_chrome_options() -> ChromeOptions:
    options = ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    return options


def _build_local_driver(options: ChromeOptions) -> webdriver.Chrome:
    if ChromeDriverManager is None:
        raise RuntimeError(
            "webdriver-manager no está disponible. Instala las dependencias desde requirements.txt o "
            "configura SELENIUM_REMOTE_URL para usar un Selenium Grid existente."
        )
    try:
        service = ChromeService(executable_path=ChromeDriverManager().install())
    except AttributeError as exc:  # webdriver-manager no pudo detectar Chrome local
        raise RuntimeError(
            "No se pudo determinar la versión local de Google Chrome. Ejecuta el grid Selenium con "
            "'docker compose up -d selenium' o define SELENIUM_REMOTE_URL / WDM_BROWSER_VERSION para "
            "usar un navegador remoto."
        ) from exc
    except Exception as exc:  # pragma: no cover - errores inesperados se informan al usuario
        raise RuntimeError(
            "Fallo al inicializar el ChromeDriver local. Revisa la instalación de Chrome o usa SELENIUM_REMOTE_URL."
        ) from exc
    return webdriver.Chrome(service=service, options=options)


def _build_remote_driver(options: ChromeOptions, remote_url: str) -> webdriver.Remote:
    return webdriver.Remote(command_executor=remote_url, options=options)


@pytest.fixture(scope="session")
def base_url() -> str:
    return os.getenv("BASE_URL", "http://localhost:8080")


@pytest.fixture(scope="session")
def admin_credentials() -> tuple[str, str]:
    return (
        os.getenv("ADMIN_USER", "admin"),
        os.getenv("ADMIN_PASS", "admin"),
    )


@pytest.fixture
def driver() -> Generator[webdriver.Remote, None, None]:
    options = _build_chrome_options()
    remote_url = _resolve_remote_url()

    try:
        if remote_url:
            driver_instance = _build_remote_driver(options, remote_url)
        else:
            driver_instance = _build_local_driver(options)
    except Exception as exc:
        pytest.fail(
            "No fue posible inicializar el navegador para las pruebas funcionales. "
            "Verifica que el contenedor selenium esté activo (`docker compose up -d selenium`) "
            "o define SELENIUM_REMOTE_URL/SELENIUM_FORCE_LOCAL según corresponda.\n\n" + str(exc)
        )

    driver_instance.implicitly_wait(2)
    yield driver_instance
    driver_instance.quit()


@pytest.fixture
def wait(driver: webdriver.Remote) -> WebDriverWait:
    return WebDriverWait(driver, DEFAULT_TIMEOUT)


@pytest.fixture
def login(driver: webdriver.Remote, wait: WebDriverWait, base_url: str, admin_credentials: tuple[str, str]):
    username, password = admin_credentials

    with allure.step("Abrir pantalla de login"):
        driver.get(f"{base_url}/")
        wait.until(EC.visibility_of_element_located((By.NAME, "username")))

    with allure.step("Autenticar usuario administrador"):
        driver.find_element(By.NAME, "username").clear()
        driver.find_element(By.NAME, "username").send_keys(username)
        driver.find_element(By.NAME, "password").clear()
        driver.find_element(By.NAME, "password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit'],input[type='submit']").click()

    wait.until(
        EC.any_of(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fiche")),
            EC.visibility_of_element_located((By.ID, "mainmenu")),
        )
    )
    yield


@pytest.fixture(autouse=True)
def _attach_screenshot_on_failure(request: pytest.FixtureRequest, driver: webdriver.Remote):
    yield
    if request.node.rep_call.failed:  # type: ignore[attr-defined]
        try:
            allure.attach(
                driver.get_screenshot_as_png(),
                name=f"screenshot-{request.node.name}",
                attachment_type=allure.attachment_type.PNG,
            )
        except Exception:
            pass


@pytest.hookimpl(hookwrapper=True, tryfirst=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo):
    outcome = yield
    report = outcome.get_result()
    setattr(item, f"rep_{report.when}", report)
