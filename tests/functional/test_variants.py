from __future__ import annotations

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .data.products import VARIANT_COLOR, VARIANT_SIZE, build_physical_product
from .utils.dom import click_button_by_text
from .utils.products import fill_product_fields, open_new_product_form


def _open_variant_tab(driver, wait, base_url: str, product_id: str) -> None:
    driver.get(f"{base_url}/product/card.php?id={product_id}&tab=variants")
    wait.until(EC.visibility_of_element_located((By.ID, "variants")))


def _extract_product_id(driver) -> str:
    href = driver.current_url
    if "id=" not in href:
        raise AssertionError("No se pudo determinar el ID del producto")
    return href.split("id=")[-1].split("&")[0]


@allure.feature("Products")
@allure.story("Variantes")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_create_variants_for_product(driver, wait, base_url):
    data = build_physical_product()

    with allure.step("Crear producto base con variantes"):
        open_new_product_form(driver, wait, base_url, "product")
        fill_product_fields(driver, wait, data)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))
        product_id = _extract_product_id(driver)

    with allure.step("Abrir pestaña de variantes"):
        _open_variant_tab(driver, wait, base_url, product_id)

    with allure.step("Crear atributos de color y talla"):
        click_button_by_text(driver, wait, ["Nuevo atributo", "New attribute"])
        wait.until(EC.visibility_of_element_located((By.NAME, "label")))
        driver.find_element(By.NAME, "label").send_keys(VARIANT_COLOR.attribute_name)
        click_button_by_text(driver, wait, ["Guardar", "Save"])

        click_button_by_text(driver, wait, ["Nuevo valor", "New value"])
        wait.until(EC.visibility_of_element_located((By.NAME, "value")))
        driver.find_element(By.NAME, "value").send_keys(VARIANT_COLOR.attribute_value)
        click_button_by_text(driver, wait, ["Guardar", "Save"])

        click_button_by_text(driver, wait, ["Nuevo atributo", "New attribute"])
        wait.until(EC.visibility_of_element_located((By.NAME, "label")))
        driver.find_element(By.NAME, "label").clear()
        driver.find_element(By.NAME, "label").send_keys(VARIANT_SIZE.attribute_name)
        click_button_by_text(driver, wait, ["Guardar", "Save"])

        click_button_by_text(driver, wait, ["Nuevo valor", "New value"])
        wait.until(EC.visibility_of_element_located((By.NAME, "value")))
        driver.find_element(By.NAME, "value").send_keys(VARIANT_SIZE.attribute_value)
        click_button_by_text(driver, wait, ["Guardar", "Save"])

    with allure.step("Crear variante combinada"):
        click_button_by_text(driver, wait, ["Nueva variante", "New variant"])
        wait.until(EC.visibility_of_element_located((By.NAME, "variantref")))
        driver.find_element(By.NAME, "variantref").send_keys(f"{data.reference}-V1")
        driver.find_element(By.NAME, "variantlabel").send_keys("Variante QA")
        for select in driver.find_elements(By.CSS_SELECTOR, "select[name^='attr_']"):
            options = select.find_elements(By.TAG_NAME, "option")
            if options:
                options[-1].click()
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(lambda d: "Variante QA" in d.page_source)
