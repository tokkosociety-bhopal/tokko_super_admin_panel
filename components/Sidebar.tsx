import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-black text-white min-h-screen p-6">

      <Link
        href="/super-admin/dashboard"
        className="block text-2xl font-bold mb-8 hover:opacity-80 transition"
      >
        Super Admin
      </Link>

      <ul className="space-y-4">
        <li>
          <Link
            href="/super-admin/dashboard"
            className="hover:text-gray-300 transition"
          >
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            href="/super-admin/societies"
            className="hover:text-gray-300 transition"
          >
            Societies
          </Link>
        </li>

        <li>
          <Link
            href="/super-admin/suggestions"
            className="hover:text-gray-300 transition"
          >
            Suggestions
          </Link>
        </li>

        <li>
          <Link
            href="/super-admin/inquiries"
            className="hover:text-gray-300 transition"
          >
            Inquiries
          </Link>
        </li>

        <li>
          <Link
            href="/super-admin/subscriptions"
            className="hover:text-gray-300 transition"
          >
            Subscriptions
          </Link>
        </li>

        <li>
          <Link
            href="/super-admin/announcements"
            className="hover:text-gray-300 transition"
          >
            Announcements
          </Link>
        </li>

        <li>
          <Link
            href="/super-admin/unit-requests"
            className="hover:text-gray-300 transition"
          >
            Unit Requests
          </Link>
        </li>
      </ul>

    </div>
  );
}