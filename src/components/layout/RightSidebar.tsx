import Link from "next/link";

export function RightSidebar() {
  return (
    <>
      <div className="card">
        <div className="card-pad">
          <div className="text-sm font-semibold">About</div>
          <div className="muted mt-1">
            Hubs + posts + lessons + tutor + DM. Reddit-like layout.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad">
          <div className="text-sm font-semibold">Top hubs</div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {["en","tr","de","fr","es","it"].map((l) => (
              <Link key={l} href={`/h/${l}`} className="rounded-xl border border-border px-3 py-1.5 hover:bg-[hsl(var(--muted))]">
                h/{l.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
