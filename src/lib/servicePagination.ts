export function serviceSwipePage(page: number, start: number | null, end: number | null, totalPages: number) {
  if (start === null || end === null || Math.abs(start - end) < 50 || totalPages < 1) return page;
  return (page + (start > end ? 1 : -1) + totalPages) % totalPages;
}