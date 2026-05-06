import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AppProvider>
  );
}
