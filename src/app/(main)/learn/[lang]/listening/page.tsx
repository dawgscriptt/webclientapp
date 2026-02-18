"use client";

import Link from "next/link";
import { useLessons } from "@/hooks/useLessons";

export default function ListeningList({ params }: { params: { lang: string } }) {
  const { data, isLoading } = useLessons(params.lang, "listening");

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <Link className="underline" href={`/h/${params.lang}`}>← Hub</Link>
      <h1 className="text-xl font-semibold">Listening · {params.lang}</h1>

      {isLoading ? <div>Loading...</div> : null}

      <div className="space-y-2">
        {(data?.lessons ?? []).map((l: any) => (
          <div key={l.id} className="rounded border p-3">
            <Link className="block" href={`/learn/${params.lang}/listening/${l.id}`}>
              <div className="font-medium">{l.title}</div>
              <div className="text-sm text-gray-600">{l.level}</div>
            </Link>
          </div>
        ))}
        {!isLoading && !(data?.lessons?.length) ? (
          <div className="text-sm text-gray-600">No lessons yet.</div>
        ) : null}
      </div>
    </div>
  );
}
