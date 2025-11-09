from __future__ import annotations

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .data.products import build_physical_product
from .utils.dom import click_button_by_text, fill_input
from .utils.products import fill_product_fields, open_new_product_form


def _create_component(driver, wait, base_url, reference_suffix: str) -> str:
    component = build_physical_product()
    open_new_product_form(driver, wait, base_url, "product")
    fill_product_fields(driver, wait, component)
    fill_input(driver, wait, (By.NAME, "ref"), f"{component.reference}-{reference_suffix}")
    click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))
    return driver.current_url.split("id=")[-1].split("&")[0]


@allure.feature("BOM")
@allure.story("Crear y validar BOM")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_create_and_validate_bom(driver, wait, base_url):
    with allure.step("Crear producto padre"):
        open_new_product_form(driver, wait, base_url, "product")
        parent_product = build_physical_product()
        fill_product_fields(driver, wait, parent_product)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))
        parent_id = driver.current_url.split("id=")[-1].split("&")[0]

    with allure.step("Crear componentes para BOM"):
        component_a = _create_component(driver, wait, base_url, "A")
        component_b = _create_component(driver, wait, base_url, "B")

    with allure.step("Crear BOM"):
        driver.get(f"{base_url}/bom/bom_card.php?action=create")
        wait.until(EC.visibility_of_element_located((By.NAME, "label")))
        driver.find_element(By.NAME, "label").send_keys("BOM QA")
        fill_input(driver, wait, (By.NAME, "fk_product"), parent_id)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(lambda d: "BOM QA" in d.page_source)
        bom_id = driver.current_url.split("id=")[-1].split("&")[0]

    with allure.step("Agregar componentes"):
        driver.get(f"{base_url}/bom/bom_card.php?id={bom_id}&action=addline")
        wait.until(EC.visibility_of_element_located((By.NAME, "fk_product_child")))
        fill_input(driver, wait, (By.NAME, "fk_product_child"), component_a)
        fill_input(driver, wait, (By.NAME, "qty"), "2")
        click_button_by_text(driver, wait, ["Agregar", "Add", "Añadir"])

        driver.get(f"{base_url}/bom/bom_card.php?id={bom_id}&action=addline")
        wait.until(EC.visibility_of_element_located((By.NAME, "fk_product_child")))
        fill_input(driver, wait, (By.NAME, "fk_product_child"), component_b)
        fill_input(driver, wait, (By.NAME, "qty"), "1")
        click_button_by_text(driver, wait, ["Agregar", "Add", "Añadir"])

    with allure.step("Validar BOM"):
        driver.get(f"{base_url}/bom/bom_card.php?id={bom_id}")
        click_button_by_text(driver, wait, ["Validar", "Validate"])
        wait.until(lambda d: "Validado" in d.page_source or "Validated" in d.page_source)
        assert "2" in driver.page_source
        assert "1" in driver.page_source
