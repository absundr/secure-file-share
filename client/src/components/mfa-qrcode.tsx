import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface MfaQrCodeProps {
  mfaSetupUrl: string;
}

const MfaQrCode = ({ mfaSetupUrl }: MfaQrCodeProps) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(mfaSetupUrl);
        setImageData(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQrCode();
  }, [mfaSetupUrl]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
      {imageData && (
        <img src={imageData} alt="MFA QR Code" className="mb-4 w-48 h-48" />
      )}
      <p className="text-sm text-gray-600 mb-4">
        Scan this QR code with your authenticator app.
      </p>
      <Button onClick={() => navigate("/login")}>Proceed to Login</Button>
    </div>
  );
};

export default MfaQrCode;
