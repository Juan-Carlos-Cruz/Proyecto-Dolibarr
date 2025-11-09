from __future__ import annotations

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .data.products import build_physical_product
from .utils.dom import click_button_by_text, fill_input
from .utils.products import fill_product_fields, open_new_product_form


def _extract_product_id(url: str) -> str:
    if "id=" not in url:
        raise AssertionError("No se pudo obtener el ID del producto")
    return url.split("id=")[-1].split("&")[0]


@allure.feature("Inventario")
@allure.story("Movimientos básicos")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_inventory_movements(driver, wait, base_url):
    data = build_physical_product()

    with allure.step("Crear producto físico para inventario"):
        open_new_product_form(driver, wait, base_url, "product")
        fill_product_fields(driver, wait, data)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))
        product_id = _extract_product_id(driver.current_url)

    with allure.step("Registrar entrada de inventario"):
        driver.get(f"{base_url}/product/stock/movement.php?id={product_id}&action=create")
        wait.until(EC.visibility_of_element_located((By.NAME, "qty")))
        fill_input(driver, wait, (By.NAME, "qty"), "10")
        fill_input(driver, wait, (By.NAME, "label"), "Ingreso QA")
        click_button_by_text(driver, wait, ["Validar", "Validate", "Crear", "Create"])
        wait.until(lambda d: "Movimiento creado" in d.page_source or "Movement" in d.page_source)

    with allure.step("Registrar salida de inventario"):
        driver.get(f"{base_url}/product/stock/movement.php?id={product_id}&action=create")
        wait.until(EC.visibility_of_element_located((By.NAME, "qty")))
        fill_input(driver, wait, (By.NAME, "qty"), "-5")
        fill_input(driver, wait, (By.NAME, "label"), "Salida QA")
        click_button_by_text(driver, wait, ["Validar", "Validate", "Crear", "Create"])
        wait.until(lambda d: "Movimiento creado" in d.page_source or "Movement" in d.page_source)

    with allure.step("Consultar resumen de stock"):
        driver.get(f"{base_url}/product/stock/card.php?id={product_id}")
        wait.until(lambda d: "Stock" in d.page_source)
        assert "Ingreso QA" in driver.page_source
        assert "Salida QA" in driver.page_source
