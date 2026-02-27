import Sidebar from "@/components/Sidebar";

export default function SuperAdminLayout({ children }: any) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-10">
        {children}
      </div>

    </div>
  );
}