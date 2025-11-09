import { createDolibarrApp, type DolibarrApp, type ModuleName } from '../simulator/dolibarr';

export function loginAsAdmin(): DolibarrApp {
  return createDolibarrApp();
}

export function ensureModuleActivated(app: DolibarrApp, module: ModuleName): void {
  if (!app.isModuleActive(module)) {
    app.activateModule(module);
  }
}
