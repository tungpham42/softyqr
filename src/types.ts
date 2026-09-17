export type Language = "en" | "vi";

export type QRType = "url" | "text" | "wifi" | "email";

export type EncryptionType = "WPA" | "WEP" | "nopass";

export interface QRFormData {
  url: string;
  text: string;
  ssid: string;
  password: string;
  encryption: EncryptionType;
  email: string;
  subject: string;
  body: string;
}

export interface Translation {
  title: string;
  subtitle: string;
  qrType: string;
  url: string;
  text: string;
  wifi: string;
  email: string;
  ssid: string;
  password: string;
  encryption: string;
  emailAddress: string;
  subject: string;
  body: string;
  qrSize: string;
  fgColor: string;
  bgColor: string;
  generate: string;
  yourQR: string;
  download: string;
  customize: string;
  placeholderUrl: string;
  placeholderText: string;
  placeholderSSID: string;
  placeholderPassword: string;
  placeholderEmail: string;
  placeholderSubject: string;
  placeholderBody: string;
  centerImage: string;
  uploadImage: string;
  removeImage: string;
  imageSize: string;
  excavate: string;
  emptyState: string;
  encryptionWpa: string;
  encryptionWep: string;
  encryptionNone: string;
}
