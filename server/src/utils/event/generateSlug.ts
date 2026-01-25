export const generateSlug = (title: string, id?: string) => {
  return `${title.replace(/\s+/g, '-').toLowerCase()}-${id?.toString().slice(-6) || Math.random().toString(36).substring(2, 9)}`;
};