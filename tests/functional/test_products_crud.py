from __future__ import annotations

import allure
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from .data.products import build_physical_product, build_service
from .utils.dom import click_button_by_text, click_link_by_text, fill_input
from .utils.products import fill_product_fields, open_new_product_form


@allure.feature("Products")
@allure.story("CRUD básico")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_create_edit_deactivate_physical_product(driver, wait, base_url):
    data = build_physical_product()

    with allure.step("Crear producto físico"):
        open_new_product_form(driver, wait, base_url, "product")
        fill_product_fields(driver, wait, data)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead h1")))
        assert data.label in driver.find_element(By.CSS_SELECTOR, "div.fichehead").text

    with allure.step("Editar peso y dimensiones"):
        click_button_by_text(driver, wait, ["Modificar", "Modify", "Editar", "Edit"])
        fill_input(driver, wait, (By.NAME, "weight"), "0.20")
        fill_input(driver, wait, (By.NAME, "length"), "12")
        fill_input(driver, wait, (By.NAME, "width"), "12")
        click_button_by_text(driver, wait, ["Guardar", "Save"])
        wait.until(lambda d: "0.20" in d.page_source or "0.2" in d.page_source)

    with allure.step("Desactivar producto"):
        click_button_by_text(driver, wait, ["Desactivar", "Disable", "Inactivar"])
        click_button_by_text(driver, wait, ["Confirmar", "Yes", "Validate", "Sí"])
        wait.until(lambda d: "Inactivo" in d.page_source or "Disabled" in d.page_source)


@allure.feature("Products")
@allure.story("Servicios no visibles en Stock")
@pytest.mark.functional
@pytest.mark.usefixtures("login")
def test_service_hidden_from_stock_module(driver, wait, base_url):
    service = build_service()

    with allure.step("Crear servicio"):
        open_new_product_form(driver, wait, base_url, "service")
        fill_product_fields(driver, wait, service)
        click_button_by_text(driver, wait, ["Crear", "Create", "Guardar", "Save"])
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fichehead")))

    with allure.step("Verificar que no aparece en Stock/Shipment"):
        click_link_by_text(driver, wait, ["Almacén", "Stock"], partial=True)
        click_link_by_text(driver, wait, ["Productos en stock", "Stock movements"], partial=True)
        assert service.label not in driver.page_source
