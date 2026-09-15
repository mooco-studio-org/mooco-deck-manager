import { slugify } from "./slug";

export type Visibility = "internal" | "public";

export type Presentation = {
  slug: string;
  title: string;
  description: string | null;
  publishedId: string;
  fileId: string | null;
  tags: string[];
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
};

export type Viewer = {
  isTeamMember: boolean;
};

export type PresentationDraft = {
  title: string;
  description: string | null;
  publishedId: string;
  fileId: string | null;
  tags: string[];
  visibility: Visibility;
};

const seed: Presentation[] = [
  {
    slug: "mooco-studio-credentials",
    title: "MOOCO Studio Credentials",
    description: "Who we are, what we do, and the work we are proudest of.",
    publishedId: "2PACX-1vTcredentials0aBc",
    fileId: "1aBcCredentials",
    tags: ["credentials", "studio"],
    visibility: "public",
    createdAt: "2026-01-14T10:00:00.000Z",
    updatedAt: "2026-01-14T10:00:00.000Z",
  },
  {
    slug: "brand-strategy-framework",
    title: "Brand Strategy Framework",
    description: "The method we walk clients through in the discovery phase.",
    publishedId: "2PACX-1vTbrand0dEf",
    fileId: "2dEfBrand",
    tags: ["strategy", "branding", "method"],
    visibility: "public",
    createdAt: "2026-02-03T09:30:00.000Z",
    updatedAt: "2026-03-11T16:45:00.000Z",
  },
  {
    slug: "2026-rate-card",
    title: "2026 Rate Card",
    description: "Internal pricing reference. Not for client distribution.",
    publishedId: "2PACX-1vTrates0ghI",
    fileId: "3ghRates",
    tags: ["pricing"],
    visibility: "internal",
    createdAt: "2026-01-06T08:00:00.000Z",
    updatedAt: "2026-06-22T11:20:00.000Z",
  },
  {
    slug: "motion-reel-q2",
    title: "Motion Reel Q2",
    description: null,
    publishedId: "2PACX-1vTmotion0ijK",
    fileId: null,
    tags: ["motion", "reel", "showcase"],
    visibility: "public",
    createdAt: "2026-04-18T14:10:00.000Z",
    updatedAt: "2026-04-18T14:10:00.000Z",
  },
  {
    slug: "onboarding-new-designers",
    title: "Onboarding New Designers",
    description: "Everything a designer needs in their first two weeks.",
    publishedId: "2PACX-1vTonboarding0klM",
    fileId: "5klOnboarding",
    tags: ["onboarding", "team"],
    visibility: "internal",
    createdAt: "2026-05-02T13:00:00.000Z",
    updatedAt: "2026-07-30T10:05:00.000Z",
  },
  {
    slug: "packaging-case-studies",
    title: "Packaging Case Studies",
    description: "Six packaging projects, with results.",
    publishedId: "2PACX-1vTpackaging0mnO",
    fileId: "6mnPackaging",
    tags: ["packaging", "case-study", "showcase"],
    visibility: "public",
    createdAt: "2026-08-09T15:40:00.000Z",
    updatedAt: "2026-08-09T15:40:00.000Z",
  },
];

const store = new Map(seed.map((presentation) => [presentation.slug, presentation]));

function canView(presentation: Presentation, viewer: Viewer): boolean {
  return viewer.isTeamMember || presentation.visibility === "public";
}

function uniqueSlug(title: string): string {
  const base = slugify(title);
  if (!store.has(base)) {
    return base;
  }

  let suffix = 2;
  while (store.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export async function listPresentations(viewer: Viewer): Promise<Presentation[]> {
  return [...store.values()]
    .filter((presentation) => canView(presentation, viewer))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPresentationBySlug(
  slug: string,
  viewer: Viewer,
): Promise<Presentation | null> {
  const presentation = store.get(slug);
  if (!presentation || !canView(presentation, viewer)) {
    return null;
  }
  return presentation;
}

export async function createPresentation(
  draft: PresentationDraft,
  viewer: Viewer,
): Promise<Presentation> {
  if (!viewer.isTeamMember) {
    throw new Error("Only team members can register presentations");
  }

  const now = new Date().toISOString();
  const presentation: Presentation = {
    ...draft,
    slug: uniqueSlug(draft.title),
    createdAt: now,
    updatedAt: now,
  };

  store.set(presentation.slug, presentation);
  return presentation;
}
