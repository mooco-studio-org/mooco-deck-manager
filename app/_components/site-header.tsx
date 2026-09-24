import Link from "next/link";

function Logo() {
  return (
    <svg
      viewBox="0 0 5442.52 3061.42"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MOOCO"
      className="block h-8 w-auto shrink-0 fill-ink sm:h-[42px]"
    >
      <path d="M1475.38,1887.32h-128.48v-617.11h-20.23l-124.43,617.11h-214.47l-130.5-617.11h-20.24v617.11h-128.48v-722.32h255.95l119.37,617.11h20.23l116.34-617.11h254.93v722.32Z" />
      <path d="M1940.76,1905.53c-224.59,0-374.31-150.74-374.31-376.34s149.72-373.3,374.31-373.3,373.3,149.72,373.3,373.3-149.72,376.34-373.3,376.34ZM1940.76,1784.13c146.69,0,244.82-102.18,244.82-254.94s-98.13-251.9-244.82-251.9-245.83,101.16-245.83,251.9,98.13,254.94,245.83,254.94Z" />
      <path d="M2769.31,1905.53c-224.59,0-374.31-150.74-374.31-376.34s149.72-373.3,374.31-373.3,373.3,149.72,373.3,373.3-149.72,376.34-373.3,376.34ZM2769.31,1784.13c146.69,0,244.82-102.18,244.82-254.94s-98.13-251.9-244.82-251.9-245.83,101.16-245.83,251.9,98.13,254.94,245.83,254.94Z" />
      <path d="M3571.56,1784.13c107.23,0,189.18-58.68,205.36-146.69h128.48c-28.33,160.85-161.87,268.09-333.85,268.09-208.4,0-348.01-151.75-348.01-378.36s139.61-371.27,348.01-371.27c175.01,0,308.55,102.18,333.85,254.93h-128.48c-15.18-79.92-97.12-133.54-205.36-133.54-131.51,0-219.53,100.15-219.53,249.87s88.01,256.96,219.53,256.96Z" />
      <path d="M4360.67,1905.53c-224.59,0-374.31-150.74-374.31-376.34s149.72-373.3,374.31-373.3,373.3,149.72,373.3,373.3-149.72,376.34-373.3,376.34ZM4360.67,1784.13c146.69,0,244.82-102.18,244.82-254.94s-98.13-251.9-244.82-251.9-245.83,101.16-245.83,251.9,98.13,254.94,245.83,254.94Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-faint"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SiteHeader({
  entryCount,
  categoryCount,
  query,
}: {
  entryCount: number;
  categoryCount: number;
  query: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-5 sm:h-[88px] sm:gap-6 sm:px-12">
        <Link href="/" aria-label="All entries">
          <Logo />
        </Link>
        <div className="flex-1" />
        <p className="hidden text-[11.5px] font-medium tracking-[0.08em] whitespace-nowrap text-ink-muted uppercase md:block">
          <strong className="font-semibold text-ink">{entryCount}</strong> entries ·{" "}
          <strong className="font-semibold text-ink">{categoryCount}</strong> categories
        </p>
        <form action="/" className="relative w-40 sm:w-60" role="search">
          <SearchIcon />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search…"
            aria-label="Search the index"
            autoComplete="off"
            className="w-full rounded-full border-[1.5px] border-line bg-page py-2.5 pr-3.5 pl-9.5 text-[13px] font-medium placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </form>
        <Link
          href="/new"
          className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-ink px-3.5 py-2.5 text-xs leading-none font-semibold whitespace-nowrap text-page hover:bg-card-surface sm:px-5 sm:text-[13px]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add
        </Link>
      </div>
    </header>
  );
}
