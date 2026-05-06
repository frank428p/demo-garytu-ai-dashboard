"use client";

import { Tabs, Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";
import StyleSelector from "@/components/video-selector/StyleSelector";
import MovementSelector from "@/components/video-selector/MovementSelector";
import MotionSelector from "@/components/video-selector/MotionSelector";

const { Title } = Typography;

const items = [
  { key: "style", label: "Style Selector", children: <StyleSelector /> },
  { key: "movement", label: "Movement Selector", children: <MovementSelector /> },
  { key: "motion", label: "Motion Selector", children: <MotionSelector /> },
];

export default function VideoSelectorPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>Video Selector</Title>
        <Tabs items={items} />
      </DashboardLayout>
    </AppProvider>
  );
}
