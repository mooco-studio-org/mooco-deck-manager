"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import type { CategoryGroup } from "@/lib/categories";
import { THUMBNAIL_MAX_BYTES, THUMBNAIL_TYPES } from "@/lib/thumbnail-limits";
import { registerEntry, type FormState } from "./actions";

const initialState: FormState = { errors: {} };

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-line bg-page px-3.5 py-[11px] text-sm leading-[1.4] font-medium placeholder:text-ink-faint focus:border-ink focus:outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className="text-xs font-medium text-danger">
      {message}
    </p>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-[11.5px] text-ink-muted">{children}</p>;
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase"
      >
        {label}
        {optional && <span className="font-medium text-ink-faint normal-case"> (opcional)</span>}
      </label>
      {children}
    </div>
  );
}

type Choice<T extends string> = { value: T; label: string };

// Radios styled as a pill switch. They stay uncontrolled on purpose: React resets the
// form after each submission, which restores radios to their default, so the default is
// tied to `value` to keep the checked pill in step with the fields shown.
function PillSwitch<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  choices: Choice<T>[];
  value: T;
  onChange?: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
        {legend}
      </legend>
      <div className="flex gap-2">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="cursor-pointer rounded-full border-[1.5px] border-line px-4 py-2 text-[13px] font-medium transition-colors hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-page has-focus-visible:outline-[1.5px] has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              defaultChecked={choice.value === value}
              onChange={() => onChange?.(choice.value)}
              className="sr-only"
            />
            {choice.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type EntryType = "deck" | "asset";

const TYPE_CHOICES: Choice<EntryType>[] = [
  { value: "deck", label: "Deck" },
  { value: "asset", label: "Asset" },
];

const VISIBILITY_CHOICES: Choice<"internal" | "public">[] = [
  { value: "internal", label: "Interna" },
  { value: "public", label: "Pública" },
];

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

function DeckFields({ errors }: { errors: FormState["errors"] }) {
  return (
    <>
      <Field label="Link publicado" htmlFor="publishedLink">
        <input
          id="publishedLink"
          name="publishedLink"
          required
          placeholder="https://docs.google.com/presentation/d/e/2PACX-.../pub"
          className={inputClass}
        />
        <Hint>
          En Google Slides: Archivo → Compartir → Publicar en la Web. Pega el link tal
          cual, sirve en cualquiera de sus formatos.
        </Hint>
        <FieldError message={errors.publishedLink} />
      </Field>

      <Field label="Link del editor" htmlFor="editorLink" optional>
        <input
          id="editorLink"
          name="editorLink"
          placeholder="https://docs.google.com/presentation/d/.../edit"
          className={inputClass}
        />
        <Hint>La URL de la barra del navegador con la presentación abierta.</Hint>
        <FieldError message={errors.editorLink} />
      </Field>
    </>
  );
}

function AssetFields({ errors }: { errors: FormState["errors"] }) {
  return (
    <>
      <Field label="Link de visita" htmlFor="visitLink">
        <input
          id="visitLink"
          name="visitLink"
          type="url"
          required
          placeholder="https://drive.google.com/file/d/.../view"
          className={inputClass}
        />
        <Hint>
          Donde se abre el asset. Cualquiera con este link puede verlo, sea cual sea la
          visibilidad.
        </Hint>
        <FieldError message={errors.visitLink} />
      </Field>

      <Field label="Link del archivo" htmlFor="fileLink" optional>
        <input
          id="fileLink"
          name="fileLink"
          type="url"
          placeholder="https://drive.google.com/drive/folders/..."
          className={inputClass}
        />
        <FieldError message={errors.fileLink} />
      </Field>
    </>
  );
}

// The Server Action checks the size too, but a file over the request body limit never
// reaches it: Next rejects the whole request first. Stopping it here keeps that from
// surfacing as a generic error page.
function checkThumbnailSize(input: HTMLInputElement) {
  const file = input.files?.[0];
  input.setCustomValidity(
    file && file.size > THUMBNAIL_MAX_BYTES ? "La miniatura no puede pesar más de 4 MB." : "",
  );
  input.reportValidity();
}

function ThumbnailField({ error }: { error?: string }) {
  return (
    <Field label="Miniatura" htmlFor="thumbnail" optional>
      <input
        id="thumbnail"
        name="thumbnail"
        type="file"
        accept={THUMBNAIL_TYPES.join(",")}
        onChange={(event) => checkThumbnailSize(event.currentTarget)}
        className={`${inputClass} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface-alt file:px-3 file:py-1 file:text-xs file:font-semibold`}
      />
      <Hint>
        JPG, PNG o WebP, hasta 4 MB. En la tarjeta se recorta a 16:10 desde arriba. Si el
        envío falla por otro campo, vuelve a elegirla.
      </Hint>
      <FieldError message={error} />
    </Field>
  );
}

export function NewEntryForm({ categoryGroups }: { categoryGroups: CategoryGroup[] }) {
  const [state, formAction, pending] = useActionState(registerEntry, initialState);
  const [type, setType] = useState<EntryType>("deck");
  const [category, setCategory] = useState("");
  const categorySelect = useRef<HTMLSelectElement>(null);

  // React resets the form after every submission, which puts the select back on its
  // placeholder while `category` still drives the fields shown. Re-apply the choice once
  // the result arrives.
  useEffect(() => {
    if (categorySelect.current) {
      categorySelect.current.value = category;
    }
  }, [state, category]);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-[18px] px-7 py-6">
        <FieldError message={state.errors.form} />

        <div className="flex flex-col gap-2">
          <PillSwitch
            name="type"
            legend="Tipo"
            choices={TYPE_CHOICES}
            value={type}
            onChange={setType}
          />
          <Hint>
            {type === "deck"
              ? "Una presentación de Google Slides con su propia página en este subdominio, lista para enviar a un cliente."
              : "Un reel, video o archivo alojado en otro sitio. Aparece en el índice y se abre donde esté."}
          </Hint>
          <FieldError message={state.errors.type} />
        </div>

        <Field label="Nombre" htmlFor="title">
          <input
            id="title"
            name="title"
            required
            placeholder="Ej: Craft Portafolio"
            className={inputClass}
          />
          <FieldError message={state.errors.title} />
        </Field>

        {type === "deck" ? (
          <DeckFields errors={state.errors} />
        ) : (
          <AssetFields errors={state.errors} />
        )}

        <Field label="Descripción" htmlFor="description" optional>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Breve descripción"
            className={`${inputClass} min-h-[60px] resize-y`}
          />
        </Field>

        <ThumbnailField error={state.errors.thumbnail} />

        <Field label="Categoría" htmlFor="category">
          <select
            id="category"
            name="category"
            required
            ref={categorySelect}
            defaultValue=""
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Elige una categoría
            </option>
            <CategoryOptions groups={categoryGroups} />
            <option value="new">+ Nueva categoría…</option>
          </select>
          <FieldError message={state.errors.category} />
          {category === "new" && (
            <>
              <input
                name="newCategory"
                required
                aria-label="Nombre de la nueva categoría"
                placeholder="Nombre de la nueva categoría"
                className={inputClass}
              />
              <FieldError message={state.errors.newCategory} />
            </>
          )}
        </Field>

        <Field label="Tags" htmlFor="tags" optional>
          <input
            id="tags"
            name="tags"
            placeholder="Portfolio, Craft, 3D"
            className={inputClass}
          />
          <Hint>Separados por comas. Solo se usan para el buscador.</Hint>
        </Field>

        <div className="flex flex-col gap-2">
          <PillSwitch
            name="visibility"
            legend="Visibilidad"
            choices={VISIBILITY_CHOICES}
            value="internal"
          />
          <Hint>
            Interna: solo el equipo de MOOCO. Pública: se puede compartir fuera del estudio.
          </Hint>
          <FieldError message={state.errors.visibility} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 rounded-b-[20px] border-t border-line bg-surface-alt px-7 py-4">
        <Link
          href="/"
          className="rounded-full border-[1.5px] border-line px-4 py-[9px] text-[13px] font-medium hover:border-ink"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border-[1.5px] border-ink bg-ink px-[18px] py-[9px] text-[13px] font-semibold text-page hover:bg-card-surface disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
