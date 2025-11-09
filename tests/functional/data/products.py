from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4


def unique_suffix() -> str:
    return datetime.utcnow().strftime("%Y%m%d%H%M%S") + uuid4().hex[:6]


@dataclass(frozen=True)
class ProductData:
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


def build_physical_product(label: str = "Producto Físico QA") -> ProductData:
    suffix = unique_suffix()
    return ProductData(
        reference=f"PROD-{suffix}",
        label=f"{label} {suffix}",
        description="Producto automatizado para pruebas funcionales",
        weight="0.10",
        length="10",
        width="10",
        height="5",
        hts="1234.56.78",
        price="10000",
        price_min="9000",
        vat_rate="19",
    )


def build_service(label: str = "Servicio QA") -> ProductData:
    suffix = unique_suffix()
    return ProductData(
        reference=f"SRV-{suffix}",
        label=f"{label} {suffix}",
        description="Servicio automatizado para pruebas funcionales",
        weight="0",
        length="0",
        width="0",
        height="0",
        hts="",
        price="5000",
        price_min="5000",
        vat_rate="0",
    )


@dataclass(frozen=True)
class VariantData:
    attribute_name: str
    attribute_value: str


def build_variant(attribute_name: str, attribute_value: str) -> VariantData:
    return VariantData(attribute_name, attribute_value)


VARIANT_COLOR = build_variant("Color", "Azul")
VARIANT_SIZE = build_variant("Talla", "M")
