function getDate() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return `${year}-${month}-${day}`;
}

export { getDate };
