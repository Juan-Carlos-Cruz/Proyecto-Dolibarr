from __future__ import annotations

from typing import Protocol

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from .dom import fill_input, select_option


class HasProductFields(Protocol):
    reference: str
    label: str
    description: str
    weight: str
    length: str
    width: str
    height: str
    hts: str
    price: str
    price_min: str
    vat_rate: str


def open_new_product_form(driver: WebDriver, wait: WebDriverWait, base_url: str, product_type: str) -> None:
    driver.get(f"{base_url}/product/card.php?action=create")
    wait.until(EC.visibility_of_element_located((By.NAME, "label")))
    select_option(driver.find_element(By.NAME, "type"), value="0" if product_type == "product" else "1")


def fill_product_fields(driver: WebDriver, wait: WebDriverWait, data: HasProductFields) -> None:
    fill_input(driver, wait, (By.NAME, "label"), data.label)
    fill_input(driver, wait, (By.NAME, "ref"), data.reference)
    fill_input(driver, wait, (By.NAME, "weight"), data.weight)
    fill_input(driver, wait, (By.NAME, "length"), data.length)
    fill_input(driver, wait, (By.NAME, "width"), data.width)
    fill_input(driver, wait, (By.NAME, "height"), data.height)
    fill_input(driver, wait, (By.NAME, "price"), data.price)
    fill_input(driver, wait, (By.NAME, "price_min"), data.price_min)
    select_option(driver.find_element(By.NAME, "tva_tx"), value=data.vat_rate)
    if data.hts:
        fill_input(driver, wait, (By.NAME, "customcode"), data.hts)
    if getattr(data, "description", ""):
        fill_input(driver, wait, (By.NAME, "description"), data.description)
