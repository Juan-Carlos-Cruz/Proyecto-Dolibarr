from __future__ import annotations

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .utils.dom import click_button_by_text, click_link_by_text


@allure.feature("Configuración")
@allure.story("Activación de módulos")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_activate_products_module(driver, wait, base_url):
    with allure.step("Abrir pantalla de módulos"):
        driver.get(f"{base_url}/admin/modules.php")
        click_link_by_text(
            driver,
            wait,
            ["Productos", "Products"],
            partial=True,
        )

    with allure.step("Activar módulo Products si está inactivo"):
        status_locator = (By.CSS_SELECTOR, "div.fiche div.status")
        status_element = wait.until(EC.presence_of_element_located(status_locator))
        status_text = status_element.text.lower()
        if "disabled" in status_text or "inactive" in status_text or "desactivado" in status_text:
            click_button_by_text(driver, wait, ["Activar", "Enable"])
            wait.until(
                EC.any_of(
                    EC.text_to_be_present_in_element(status_locator, "active"),
                    EC.text_to_be_present_in_element(status_locator, "activo"),
                )
            )

    with allure.step("Guardar parámetros del módulo"):
        click_button_by_text(driver, wait, ["Guardar", "Save"])
        wait.until(
            EC.any_of(
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, "div.fiche"), "guard"),
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, "div.fiche"), "saved"),
                EC.text_to_be_present_in_element((By.CSS_SELECTOR, "div.fiche"), "guardado"),
            )
        )
