import React from "react";
import { ConfigProvider } from "antd";
import QRCodeGenerator from "./components/QRCodeGenerator";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff6a45",
          borderRadius: 12,
          fontFamily:
            "'Lexend Deca', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
      }}
    >
      <QRCodeGenerator />
    </ConfigProvider>
  );
};

export default App;
