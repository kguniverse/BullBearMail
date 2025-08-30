import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Welcome | BullBearMail",
  description: "Your dashboard for BullBearMail.",
};

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Welcome to BullBearMail!
      </h1>
      <p className="mb-6 text-lg text-gray-700 text-center">
        Start exploring your dashboard for more features.
      </p>
      <Link
        href="/dashboard"
        className="rounded-full border border-solid border-blue-600 bg-blue-600 text-white font-medium text-base h-12 px-5 hover:bg-blue-700 transition flex items-center justify-center"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
