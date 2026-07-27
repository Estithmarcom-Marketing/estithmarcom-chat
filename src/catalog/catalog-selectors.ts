import {
  catalogCategories,
  catalogGroups,
  catalogServices,
} from './catalog-data'

export function getCatalogCategories() {
  return [...catalogCategories].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  )
}

export function getCategoryById(
  categoryId: string,
) {
  return catalogCategories.find(
    (category) =>
      category.id ===
      categoryId,
  )
}

export function getGroupsByCategory(
  categoryId: string,
) {
  return catalogGroups
    .filter(
      (group) =>
        group.categoryId ===
        categoryId,
    )
    .sort(
      (a, b) =>
        a.displayOrder -
        b.displayOrder,
    )
}

export function getGroupById(
  groupId: string,
) {
  return catalogGroups.find(
    (group) =>
      group.id ===
      groupId,
  )
}

export function getServicesByGroup(
  groupId: string,
) {
  return catalogServices
    .filter(
      (service) =>
        service.groupId ===
        groupId,
    )
    .sort(
      (a, b) =>
        a.displayOrder -
        b.displayOrder,
    )
}

export function getServiceById(
  serviceId: string,
) {
  return catalogServices.find(
    (service) =>
      service.id ===
      serviceId,
  )
}