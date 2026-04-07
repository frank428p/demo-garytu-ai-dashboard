"use client";

import { App, ConfigProvider, theme } from "antd";
import zhTW from "antd/locale/zh_TW";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        token: {
          colorPrimary: "#6366f1",
          colorInfo: "#6366f1",
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
