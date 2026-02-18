import Link from "next/link";

export function ProfileCard({ account }: { account: any }) {
  return (
    <div className="rounded border p-4 space-y-2">
      <div className="text-xl font-semibold">{account.displayName}</div>
      <div className="text-sm text-gray-600">@{account.username}</div>
      {account.bio ? <div className="whitespace-pre-wrap">{account.bio}</div> : null}
      <div className="text-xs text-gray-600">dmPolicy: {account.dmPolicy}</div>
      <div className="text-xs text-gray-600">type: {account.accountType} {account.verified ? "(verified)" : ""}</div>

      <div className="pt-2">
        <Link className="underline text-sm" href={`/messages?to=${account.username}`}>Send DM</Link>
      </div>
    </div>
  );
}
