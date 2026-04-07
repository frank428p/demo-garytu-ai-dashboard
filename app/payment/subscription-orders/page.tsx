"use client";

import { Typography } from "antd";
import AppProvider from "@/app/components/AppProvider";
import DashboardLayout from "@/app/components/DashboardLayout";

const { Title } = Typography;

export default function SubscriptionOrdersPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>Subscription Orders</Title>
      </DashboardLayout>
    </AppProvider>
  );
}
