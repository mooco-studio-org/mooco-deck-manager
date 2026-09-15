"use client";

import { useActionState } from "react";
import { registerPresentation, type FormState } from "./actions";

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

export function NewPresentationForm() {
  const [state, formAction, pending] = useActionState(
    registerPresentation,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <FieldError message={state.errors.form} />

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

      <div>
        <label htmlFor="embedUrl" className="text-sm font-medium">
          Published embed link
        </label>
        <input
          id="embedUrl"
          name="embedUrl"
          type="url"
          required
          placeholder="https://docs.google.com/presentation/d/e/2PACX-.../pubembed?"
          className={`mt-1 ${fieldClass}`}
        />
        <p className="mt-1 text-xs opacity-60">
          In Google Slides: File → Share → Publish to web → Embed, then copy the link.
        </p>
        <FieldError message={state.errors.embedUrl} />
      </div>

      <div>
        <label htmlFor="editorUrl" className="text-sm font-medium">
          Google Slides editable URL <span className="opacity-50">(optional)</span>
        </label>
        <input
          id="editorUrl"
          name="editorUrl"
          type="url"
          placeholder="https://docs.google.com/presentation/d/.../edit"
          className={`mt-1 ${fieldClass}`}
        />
        <FieldError message={state.errors.editorUrl} />
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
        {pending ? "Registering…" : "Register deck"}
      </button>
    </form>
  );
}
