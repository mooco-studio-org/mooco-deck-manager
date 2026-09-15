// The deck wrapper is what gets sent to clients: a bare full-bleed frame on the same
// dark ground the presentations themselves use, with no index chrome around it. The
// colours are pinned rather than inherited because the viewer's browser may be in light
// mode, and the index palette would render dark text on this dark background.
export default function PresentationLayout({ children }: LayoutProps<"/[slug]">) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1c1c1c] text-[#ededed]">
      {children}
    </div>
  );
}
