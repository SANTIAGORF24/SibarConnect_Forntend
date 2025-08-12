import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 select-none">
      <div className="h-9 w-9 rounded-md bg-[var(--color-primary)] text-white grid place-content-center font-bold">S</div>
      <span className="text-lg font-semibold tracking-wide text-foreground">SibarConnect</span>
    </Link>
  );
}


