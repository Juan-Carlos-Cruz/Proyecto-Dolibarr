from __future__ import annotations

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .data.products import build_physical_product
from .utils.dom import click_button_by_text, fill_input
from .utils.products import fill_product_fields, open_new_product_form


@allure.feature("Products")
@allure.story("Listado y filtros")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_products_listing_filters_and_order(driver, wait, base_url):
    data = build_physical_product()

    with allure.step("Crear producto base para listado"):
        open_new_product_form(driver, wait, base_url, "product")
        fill_product_fields(driver, wait, data)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))

    with allure.step("Abrir listado de productos"):
        driver.get(f"{base_url}/product/list.php")
        wait.until(EC.visibility_of_element_located((By.ID, "search_ref")))

    with allure.step("Aplicar filtros y orden"):
        fill_input(driver, wait, (By.ID, "search_ref"), data.reference)
        click_button_by_text(driver, wait, ["Buscar", "Search"])
        wait.until(lambda d: data.reference in d.page_source)
        driver.find_element(By.CSS_SELECTOR, "th.liste_titre a").click()  # cambiar orden

    with allure.step("Cambiar vista a rejilla si está disponible"):
        view_switchers = driver.find_elements(By.CSS_SELECTOR, "a.viewtype")
        if view_switchers:
            view_switchers[-1].click()

    assert data.reference in driver.page_source
    assert data.label in driver.page_source
