# Entorno Docker de Dolibarr v22

Este directorio agrupa los volúmenes montados en el contenedor de Dolibarr.

- `conf/`: se llenará automáticamente con `conf.php` después del instalador web. Puedes colocar aquí configuraciones personalizadas.
- `custom/`: módulos externos o personalizaciones que quieras montar dentro de Dolibarr.
- `modules/`: paquetes `.zip` descargados desde Dolistore; se montan en `htdocs/module_packages` para facilitar la instalación.
- `source/`: carpeta opcional para exportar el core de Dolibarr si deseas ejecutar PHPUnit contra el código descargado desde el contenedor.

> **Nota:** No elimines estos directorios para preservar la configuración y los artefactos generados por el instalador.
