import type { Viewer } from "./presentations";
import { supabase } from "./supabase";

export type Category = {
  id: string;
  name: string;
  groupName: string | null;
  position: number;
};

type CategoryRow = {
  id: string;
  name: string;
  group_name: string | null;
  position: number;
};

function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, groupName: row.group_name, position: row.position };
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select()
    .order("position")
    .overrideTypes<CategoryRow[], { merge: false }>();

  if (error) {
    throw error;
  }
  return data.map(toCategory);
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

// A category typed in the form may already exist under different casing; reusing it
// avoids near-duplicates like "Reels" and "reels" splitting the index.
export async function findOrCreateCategory(name: string, viewer: Viewer): Promise<Category> {
  if (!viewer.isTeamMember) {
    throw new Error("Only team members can create categories");
  }

  const { data: existing, error: findError } = await supabase
    .from("categories")
    .select()
    .ilike("name", escapeLikePattern(name))
    .maybeSingle<CategoryRow>();

  if (findError) {
    throw findError;
  }
  if (existing) {
    return toCategory(existing);
  }

  const { data: last, error: lastError } = await supabase
    .from("categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>();

  if (lastError) {
    throw lastError;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, position: (last?.position ?? 0) + 1 })
    .select()
    .single<CategoryRow>();

  if (error) {
    throw error;
  }
  return toCategory(data);
}

export type CategoryGroup = {
  name: string | null;
  categories: Category[];
};

// Groups are just a label shared by consecutive categories, so the order by position is
// what defines them: a group ends where the label changes.
export function groupCategories(categories: Category[]): CategoryGroup[] {
  const groups: CategoryGroup[] = [];
  for (const category of categories) {
    const current = groups.at(-1);
    if (current && current.name === category.groupName) {
      current.categories.push(category);
    } else {
      groups.push({ name: category.groupName, categories: [category] });
    }
  }
  return groups;
}
