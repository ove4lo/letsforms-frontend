import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
    >
      LetsForms
    </Link>
  );
}