"use client";

import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

const { Title } = Typography;

export default function UserListPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>User List</Title>
      </DashboardLayout>
    </AppProvider>
  );
}
