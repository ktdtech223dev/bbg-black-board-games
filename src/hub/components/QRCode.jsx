import { QRCodeSVG } from 'qrcode.react';

export default function QRCode({ value, size = 200 }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      includeMargin={false}
      bgColor="#ffffff"
      fgColor="#0a0a0a"
    />
  );
}
