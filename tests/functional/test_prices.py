from __future__ import annotations

import re

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .data.products import build_physical_product
from .utils.dom import click_button_by_text, fill_input
from .utils.products import fill_product_fields, open_new_product_form


def _extract_product_id(current_url: str) -> str:
    match = re.search(r"id=(\d+)", current_url)
    if not match:
        raise AssertionError("No se pudo determinar el ID del producto")
    return match.group(1)


@allure.feature("Products")
@allure.story("Gestión de precios")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_update_sale_price_and_history(driver, wait, base_url):
    data = build_physical_product()

    with allure.step("Crear producto base para precios"):
        open_new_product_form(driver, wait, base_url, "product")
        fill_product_fields(driver, wait, data)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))
        product_id = _extract_product_id(driver.current_url)

    with allure.step("Abrir pestaña de precios"):
        driver.get(f"{base_url}/product/card.php?id={product_id}&action=edit_price")
        wait.until(EC.visibility_of_element_located((By.NAME, "price")))

    with allure.step("Actualizar precios y IVA"):
        fill_input(driver, wait, (By.NAME, "price"), "12000")
        fill_input(driver, wait, (By.NAME, "price_min"), "10000")
        select = driver.find_element(By.NAME, "tva_tx")
        for option in select.find_elements(By.TAG_NAME, "option"):
            if option.get_attribute("value") == "19.000":
                option.click()
                break
        click_button_by_text(driver, wait, ["Guardar", "Save"])

    with allure.step("Verificar histórico de precios"):
        driver.get(f"{base_url}/product/history.php?id={product_id}")
        wait.until(lambda d: "12000" in d.page_source)
        assert "12000" in driver.page_source
        assert "10000" in driver.page_source
