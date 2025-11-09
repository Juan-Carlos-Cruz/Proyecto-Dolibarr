from __future__ import annotations

from typing import Sequence

import allure
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


def click_link_by_text(
    driver: WebDriver,
    wait: WebDriverWait,
    texts: Sequence[str],
    *,
    partial: bool = False,
):
    for text in texts:
        locator = (By.PARTIAL_LINK_TEXT, text) if partial else (By.LINK_TEXT, text)
        try:
            element = wait.until(EC.element_to_be_clickable(locator))
        except Exception:
            continue
        with allure.step(f"Click en enlace '{text}'"):
            element.click()
        return
    raise AssertionError(f"No se encontró enlace con textos esperados: {texts}")


def click_button_by_text(driver: WebDriver, wait: WebDriverWait, texts: Sequence[str]):
    for text in texts:
        locator = (
            By.XPATH,
            "|".join(
                (
                    f"//button[contains(normalize-space(.), '{text}')]",
                    f"//input[@type='submit' and contains(@value, '{text}')]",
                    f"//a[contains(normalize-space(.), '{text}')]",
                )
            ),
        )
        try:
            element = wait.until(EC.element_to_be_clickable(locator))
        except Exception:
            continue
        with allure.step(f"Click en botón '{text}'"):
            element.click()
        return
    raise AssertionError(f"No se encontró botón con textos esperados: {texts}")


def fill_input(driver: WebDriver, wait: WebDriverWait, locator: tuple[str, str], value: str) -> None:
    element = wait.until(EC.visibility_of_element_located(locator))
    element.clear()
    element.send_keys(value)


def select_option(select_element, value: str | None = None, text: str | None = None) -> None:
    select = Select(select_element)
    if value is not None:
        select.select_by_value(value)
    elif text is not None:
        select.select_by_visible_text(text)
    else:
        raise ValueError("Debe proporcionar value o text para seleccionar una opción")
