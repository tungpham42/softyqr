import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Select,
  Input,
  Button,
  Slider,
  Switch,
  Upload,
  ColorPicker,
  InputNumber,
  Typography,
  Space,
  Divider,
  Empty,
} from "antd";
import type { Color } from "antd/es/color-picker";
import type { UploadProps } from "antd";
import {
  QrcodeOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  WifiOutlined,
  MailOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import { translations } from "../i18n/translations";
import { EncryptionType, Language, QRFormData, QRType } from "../types";
import "./QRCodeGenerator.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DEFAULT_FORM_DATA: QRFormData = {
  url: "",
  text: "",
  ssid: "",
  password: "",
  encryption: "WPA",
  email: "",
  subject: "",
  body: "",
};

const toHex = (color: Color | string): string =>
  typeof color === "string" ? color : color.toHexString();

const QRCodeGenerator: React.FC = () => {
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem("lang") as Language) || "vi"
  );
  const [type, setType] = useState<QRType>("url");
  const [formData, setFormData] = useState<QRFormData>(DEFAULT_FORM_DATA);
  const [qrData, setQrData] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [fgColor, setFgColor] = useState("#10202f");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isGenerated, setIsGenerated] = useState(false);
  const [centerImg, setCenterImg] = useState<string | null>(null);
  const [centerImgSizePct, setCenterImgSizePct] = useState(26);
  const [excavate, setExcavate] = useState(true);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const handleFieldChange = (field: keyof QRFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildQrData = (data: QRFormData, qrType: QRType) => {
    const { url, text, ssid, password, encryption, email, subject, body } =
      data;
    const dataByType: Record<QRType, string> = {
      url,
      text,
      wifi: `WIFI:T:${encryption};S:${ssid};P:${password};;`,
      email: `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`,
    };
    return dataByType[qrType] || "";
  };

  const generateQR = () => {
    setQrData(buildQrData(formData, type));
    setIsGenerated(true);
  };

  // Once a code exists, keep it live: any further tweak re-renders it
  // instead of forcing another click on Generate.
  useEffect(() => {
    if (!isGenerated) return;
    const next = buildQrData(formData, type);
    if (next) setQrData(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, type]);

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageSelect: UploadProps["beforeUpload"] = async (file) => {
    const dataUrl = await readFileAsDataURL(file as unknown as File);
    setCenterImg(dataUrl);
    return false;
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QRCode-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(
      unescape(encodeURIComponent(svgData))
    )}`;
  };

  const qrTypeOptions: { value: QRType; icon: React.ReactNode; label: string }[] =
    [
      { value: "url", icon: <LinkOutlined />, label: t.url },
      { value: "text", icon: <FileTextOutlined />, label: t.text },
      { value: "wifi", icon: <WifiOutlined />, label: t.wifi },
      { value: "email", icon: <MailOutlined />, label: t.email },
    ];

  return (
    <div className="qr-generator-page">
      {/* ambient liquid-glass backdrop */}
      <div className="qr-blob qr-blob-a" aria-hidden="true" />
      <div className="qr-blob qr-blob-b" aria-hidden="true" />
      <div className="qr-blob qr-blob-c" aria-hidden="true" />

      <div className="qr-generator-wrapper">
        <div className="qr-hero">
          <div>
            <Title level={2} className="qr-hero-title">
              {t.title}
            </Title>
            <Text className="qr-hero-subtitle">{t.subtitle}</Text>
          </div>
          <Select<Language>
            value={lang}
            onChange={setLang}
            className="qr-lang-select"
            suffixIcon={<GlobalOutlined />}
            options={[
              { value: "vi", label: "Tiếng Việt" },
              { value: "en", label: "English" },
            ]}
          />
        </div>

        <div className="qr-layout">
          <div className="qr-card glass-panel qr-form-panel">
            <div className="qr-field-group">
              <Text strong className="qr-label">
                <QrcodeOutlined className="qr-label-icon" />
                {t.qrType}
              </Text>
              <div className="qr-segmented" role="group">
                {qrTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={
                      "qr-segmented-btn" +
                      (type === opt.value ? " active" : "")
                    }
                    onClick={() => setType(opt.value)}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {type === "url" && (
              <div className="qr-field-group">
                <Text strong className="qr-label">
                  {t.url}
                </Text>
                <Input
                  size="large"
                  value={formData.url}
                  onChange={(e) => handleFieldChange("url", e.target.value)}
                  placeholder={t.placeholderUrl}
                />
              </div>
            )}

            {type === "text" && (
              <div className="qr-field-group">
                <Text strong className="qr-label">
                  {t.text}
                </Text>
                <TextArea
                  value={formData.text}
                  onChange={(e) => handleFieldChange("text", e.target.value)}
                  rows={4}
                  placeholder={t.placeholderText}
                />
              </div>
            )}

            {type === "wifi" && (
              <>
                <div className="qr-field-group">
                  <Text strong className="qr-label">
                    <WifiOutlined className="qr-label-icon" />
                    {t.ssid}
                  </Text>
                  <Input
                    size="large"
                    value={formData.ssid}
                    onChange={(e) => handleFieldChange("ssid", e.target.value)}
                    placeholder={t.placeholderSSID}
                  />
                </div>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div className="qr-field-group">
                      <Text strong className="qr-label">
                        {t.password}
                      </Text>
                      <Input.Password
                        size="large"
                        value={formData.password}
                        onChange={(e) =>
                          handleFieldChange("password", e.target.value)
                        }
                        placeholder={t.placeholderPassword}
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="qr-field-group">
                      <Text strong className="qr-label">
                        {t.encryption}
                      </Text>
                      <Select<EncryptionType>
                        size="large"
                        className="qr-full-width"
                        value={formData.encryption}
                        onChange={(value) =>
                          handleFieldChange("encryption", value)
                        }
                        options={[
                          { value: "WPA", label: t.encryptionWpa },
                          { value: "WEP", label: t.encryptionWep },
                          { value: "nopass", label: t.encryptionNone },
                        ]}
                      />
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {type === "email" && (
              <>
                <div className="qr-field-group">
                  <Text strong className="qr-label">
                    <MailOutlined className="qr-label-icon" />
                    {t.emailAddress}
                  </Text>
                  <Input
                    size="large"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder={t.placeholderEmail}
                  />
                </div>
                <div className="qr-field-group">
                  <Text strong className="qr-label">
                    {t.subject}
                  </Text>
                  <Input
                    size="large"
                    value={formData.subject}
                    onChange={(e) =>
                      handleFieldChange("subject", e.target.value)
                    }
                    placeholder={t.placeholderSubject}
                  />
                </div>
                <div className="qr-field-group">
                  <Text strong className="qr-label">
                    {t.body}
                  </Text>
                  <TextArea
                    value={formData.body}
                    onChange={(e) => handleFieldChange("body", e.target.value)}
                    rows={4}
                    placeholder={t.placeholderBody}
                  />
                </div>
              </>
            )}

            <Divider className="qr-divider" />

            <div className="qr-customize-panel">
              <Title level={5} className="qr-customize-title">
                <BgColorsOutlined className="qr-label-icon" />
                {t.customize}
              </Title>
              <Row gutter={[20, 20]}>
                <Col xs={24} md={8}>
                  <Text strong className="qr-label">
                    <ExpandOutlined className="qr-label-icon" />
                    {t.qrSize}
                  </Text>
                  <InputNumber
                    className="qr-full-width"
                    size="large"
                    value={qrSize}
                    min={100}
                    max={500}
                    onChange={(value) => setQrSize(value ?? 256)}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Text strong className="qr-label">
                    {t.fgColor}
                  </Text>
                  <div className="qr-color-row">
                    <ColorPicker
                      value={fgColor}
                      onChange={(color) => setFgColor(toHex(color))}
                      size="large"
                    />
                    <Text code>{fgColor}</Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text strong className="qr-label">
                    {t.bgColor}
                  </Text>
                  <div className="qr-color-row">
                    <ColorPicker
                      value={bgColor}
                      onChange={(color) => setBgColor(toHex(color))}
                      size="large"
                    />
                    <Text code>{bgColor}</Text>
                  </div>
                </Col>

                <Col xs={24}>
                  <Text strong className="qr-label">
                    <QrcodeOutlined className="qr-label-icon" />
                    {t.centerImage}
                  </Text>
                  {!centerImg ? (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={handleImageSelect}
                    >
                      <Button icon={<UploadOutlined />} className="qr-ghost-btn">
                        {t.uploadImage}
                      </Button>
                    </Upload>
                  ) : (
                    <Space align="center">
                      <img
                        src={centerImg}
                        alt="Center logo"
                        className="qr-center-preview"
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setCenterImg(null)}
                        className="qr-ghost-btn"
                      >
                        {t.removeImage}
                      </Button>
                    </Space>
                  )}

                  <Row gutter={24} className="qr-image-options">
                    <Col xs={24} md={12}>
                      <Text className="qr-label">{t.imageSize}</Text>
                      <Slider
                        min={10}
                        max={40}
                        value={centerImgSizePct}
                        onChange={setCenterImgSizePct}
                        disabled={!centerImg}
                      />
                      <Text type="secondary">{centerImgSizePct}%</Text>
                    </Col>
                    <Col xs={24} md={12} className="qr-switch-col">
                      <Space>
                        <Switch
                          checked={excavate}
                          onChange={setExcavate}
                          disabled={!centerImg}
                        />
                        <Text>{t.excavate}</Text>
                      </Space>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>

            <div className="qr-generate-row">
              <Button
                type="primary"
                size="large"
                icon={<QrcodeOutlined />}
                onClick={generateQR}
                className="qr-generate-button"
              >
                {t.generate}
              </Button>
            </div>
          </div>

          <div className="qr-card glass-panel qr-result-card">
            <Title level={5} className="qr-result-title">
              <QrcodeOutlined className="qr-label-icon" />
              {t.yourQR}
            </Title>

            {isGenerated ? (
              <div className="qr-result-body">
                <div className="qr-preview-frame">
                  <QRCodeSVG
                    id="qr-code"
                    value={qrData}
                    size={qrSize}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="H"
                    marginSize={1}
                    {...(centerImg
                      ? {
                          imageSettings: {
                            src: centerImg,
                            height: Math.round(
                              (qrSize * centerImgSizePct) / 100
                            ),
                            width: Math.round(
                              (qrSize * centerImgSizePct) / 100
                            ),
                            excavate,
                          },
                        }
                      : {})}
                  />
                </div>
                <Button
                  type="default"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={downloadQR}
                  className="qr-download-button"
                >
                  {t.download}
                </Button>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Paragraph>{t.emptyState}</Paragraph>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
