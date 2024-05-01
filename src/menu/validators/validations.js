export function validateMenuData(name, available) {
  if (!name || !available) {
    return false;
  }
  return true;
}

export function validateMenuId(id) {
  if (!id) {
    return false;
  }
  return true;
}
