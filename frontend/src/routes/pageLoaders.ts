export const loadCartographyPage = () =>
  import('../pages/CartographyPage')

export const loadIncidentsPage = () =>
  import('../pages/IncidentsPage')

export const loadSupervisionPage = () =>
  import('../pages/SupervisionPage')

export const loadAdministrationPage = () =>
  import('../pages/AdministrationPage')

export function preloadCartographyPage() {
  return loadCartographyPage().then(() => undefined)
}
