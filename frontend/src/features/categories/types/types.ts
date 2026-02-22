export interface CategoryDto {
  id: number;
  name: string;
  priority: number;
  urlSlug: string;
  parentId: number | null;
  image: string | null;
  isDeleted?: boolean;
}
