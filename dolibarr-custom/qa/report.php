<?php
require '../main.inc.php';
if (!$user->admin) accessforbidden();

llxHeader('', 'Reporte de Pruebas (Allure)');

// RUTA estática generada por "npm run report:allure" dentro del contenedor e2e.
// Queda montada en /var/www/html/custom/qa/reports/allure-report
$allureIndex = dol_buildpath('/custom/qa/reports/allure-report/index.html', 1);

print '<h1>Reporte de Pruebas (Playwright + Allure)</h1>';
print '<div style="height:80vh;border:1px solid #ddd">';
print '<iframe src="'.$allureIndex.'" style="width:100%;height:100%;border:0"></iframe>';
print '</div>';

llxFooter();
