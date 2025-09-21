import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PetLogix Home",
  description: "Welcome to PetLogix",
  icons: {
    icon: "/favicon.ico", // points to /public/favicon.ico
  },
};

export default function Home() {
  return (
    <h1 className="text-5xl font-bold text-red-500">
      If this is BIG and RED, Tailwind works!
    </h1>
  );
}

