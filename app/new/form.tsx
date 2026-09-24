"use client";

import { useActionState, useState } from "react";
import type { CategoryGroup } from "@/lib/categories";
import { registerEntry, type FormState } from "./actions";

const initialState: FormState = { errors: {} };

const fieldClass =
  "w-full rounded-md border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-current/50";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  );
}

type EntryType = "deck" | "asset";

function CategoryOptions({ groups }: { groups: CategoryGroup[] }) {
  return groups.map((group) => {
    const options = group.categories.map((category) => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ));
    return group.name ? (
      <optgroup key={group.categories[0].id} label={group.name}>
        {options}
      </optgroup>
    ) : (
      options
    );
  });
}

export function NewEntryForm({ categoryGroups }: { categoryGroups: CategoryGroup[] }) {
  const [state, formAction, pending] = useActionState(registerEntry, initialState);
  const [type, setType] = useState<EntryType>("deck");
  const [category, setCategory] = useState("");

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <FieldError message={state.errors.form} />

      {/* Uncontrolled on purpose: React resets the form after each submission, which
          restores radios to their default. Tying the default to state keeps the checked
          radio in step with the fields shown. */}
      <fieldset>
        <legend className="text-sm font-medium">Type</legend>
        <div className="mt-2 flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="deck"
              defaultChecked={type === "deck"}
              onChange={() => setType("deck")}
            />
            Deck — a Google Slides presentation with its own page here
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="asset"
              defaultChecked={type === "asset"}
              onChange={() => setType("asset")}
            />
            Asset — a reel, video or file hosted elsewhere
          </label>
        </div>
        <FieldError message={state.errors.type} />
      </fieldset>

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input id="title" name="title" required className={`mt-1 ${fieldClass}`} />
        <FieldError message={state.errors.title} />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="opacity-50">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className={`mt-1 ${fieldClass}`}
        />
      </div>

      {type === "deck" ? (
        <>
          <div>
            <label htmlFor="publishedLink" className="text-sm font-medium">
              Published link
            </label>
            <input
              id="publishedLink"
              name="publishedLink"
              required
              placeholder="https://docs.google.com/presentation/d/e/2PACX-.../pub?start=false"
              className={`mt-1 ${fieldClass}`}
            />
            <p className="mt-1 text-xs opacity-60">
              In Google Slides: File → Share → Publish to web, then paste the link as-is —
              any of its forms works.
            </p>
            <FieldError message={state.errors.publishedLink} />
          </div>

          <div>
            <label htmlFor="editorLink" className="text-sm font-medium">
              Editor link <span className="opacity-50">(optional)</span>
            </label>
            <input
              id="editorLink"
              name="editorLink"
              placeholder="https://docs.google.com/presentation/d/.../edit"
              className={`mt-1 ${fieldClass}`}
            />
            <FieldError message={state.errors.editorLink} />
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="visitLink" className="text-sm font-medium">
              Visit link
            </label>
            <input
              id="visitLink"
              name="visitLink"
              type="url"
              required
              placeholder="https://drive.google.com/file/d/.../view"
              className={`mt-1 ${fieldClass}`}
            />
            <p className="mt-1 text-xs opacity-60">
              Where the asset opens. Anyone with this link can reach it, whatever the
              visibility below.
            </p>
            <FieldError message={state.errors.visitLink} />
          </div>

          <div>
            <label htmlFor="fileLink" className="text-sm font-medium">
              File link <span className="opacity-50">(optional)</span>
            </label>
            <input
              id="fileLink"
              name="fileLink"
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              className={`mt-1 ${fieldClass}`}
            />
            <FieldError message={state.errors.fileLink} />
          </div>
        </>
      )}

      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        {/* Uncontrolled for the same reason as the type radios above. */}
        <select
          id="category"
          name="category"
          required
          defaultValue={category}
          onChange={(event) => setCategory(event.target.value)}
          className={`mt-1 ${fieldClass}`}
        >
          <option value="" disabled>
            Pick a category
          </option>
          <CategoryOptions groups={categoryGroups} />
          <option value="new">+ New category…</option>
        </select>
        <FieldError message={state.errors.category} />
        {category === "new" && (
          <>
            <input
              name="newCategory"
              required
              aria-label="New category name"
              placeholder="New category name"
              className={`mt-2 ${fieldClass}`}
            />
            <FieldError message={state.errors.newCategory} />
          </>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="text-sm font-medium">
          Tags <span className="opacity-50">(comma separated)</span>
        </label>
        <input
          id="tags"
          name="tags"
          placeholder="branding, case-study"
          className={`mt-1 ${fieldClass}`}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Visibility</legend>
        <div className="mt-2 flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="internal" defaultChecked />
            Internal — MOOCO team only
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="public" />
            Public — shareable outside the studio
          </label>
        </div>
        <FieldError message={state.errors.visibility} />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-current/20 px-4 py-2 text-sm font-medium transition hover:bg-current/5 disabled:opacity-50"
      >
        {pending ? "Registering…" : `Register ${type}`}
      </button>
    </form>
  );
}
