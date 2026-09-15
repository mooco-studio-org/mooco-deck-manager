// Google Slides exposes two unrelated identifiers for the same deck: the published id
// (`2PACX-…`, minted by File → Share → Publish to web) which only works on /pub and
// /pubembed, and the file id, which only works on /edit. Neither derives from the other,
// so both are stored and the URLs around them are rebuilt from scratch.
const PUBLISHED_ID_IN_URL = /\/presentation\/d\/e\/([\w-]+)/;
const FILE_ID_IN_URL = /\/presentation\/d\/(?!e\/)([\w-]+)/;
const BARE_ID = /^[\w-]+$/;

function extract(
  input: string,
  pattern: RegExp,
  bareLooksRight: (candidate: string) => boolean,
): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const matched = trimmed.match(pattern);
  if (matched) {
    return matched[1];
  }

  // A pasted id has no path to disambiguate it, so it is only accepted for the kind its
  // own shape supports.
  return BARE_ID.test(trimmed) && bareLooksRight(trimmed) ? trimmed : null;
}

function isPublishedId(candidate: string): boolean {
  return candidate.startsWith("2PACX-");
}

export function extractPublishedId(input: string): string | null {
  return extract(input, PUBLISHED_ID_IN_URL, isPublishedId);
}

export function extractFileId(input: string): string | null {
  return extract(input, FILE_ID_IN_URL, (candidate) => !isPublishedId(candidate));
}

export function embedUrl(publishedId: string): string {
  return `https://docs.google.com/presentation/d/e/${publishedId}/pubembed?`;
}

export function editorUrl(fileId: string): string {
  return `https://docs.google.com/presentation/d/${fileId}/edit`;
}
