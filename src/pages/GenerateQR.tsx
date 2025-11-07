import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function GenerateQR() {
  const [qrCode, setQrCode] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateQRCode = async () => {
    setLoading(true);
    setError('');

    try {
      const uniqueCode = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const { data, error: insertError } = await supabase
        .from('qr_codes')
        .insert([
          {
            code: uniqueCode,
            destination_url: 'https://copeba.com.gt/',
            is_active: true
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const registrationUrl = `${window.location.origin}/register/${data.code}`;

      setQrCode(data.code);
      setQrUrl(registrationUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Error al generar el código QR. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg') as unknown as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 400, 400);
      const pngUrl = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `copeba_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #011c6b, #009900)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '50px 40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <Link
            to="/admin"
            style={{
              color: '#009900',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ← Ver registros
          </Link>
        </div>

        {!qrCode ? (
          <>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#1a202c',
              textAlign: 'center'
            }}>
              Generar Código QR
            </h1>
            <p style={{
              color: '#718096',
              textAlign: 'center',
              marginBottom: '40px',
              fontSize: '16px'
            }}>
              Crea códigos QR permanentes para copeba.com.gt
            </p>

            <button
              onClick={generateQRCode}
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                background: loading ? '#a0aec0' : 'linear-gradient(to right, #009900)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(0, 153, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 153, 0, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(18, 234, 18, 0.4)';
              }}
            >
              {loading ? 'Generando...' : 'Generar Código QR'}
            </button>

            {error && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#fed7d7',
                color: '#c53030',
                borderRadius: '10px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '30px' }}>
              <img
                src="/logo copeba (1).png"
                alt="Copeba Logo"
                style={{
                  height: '80px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#1a202c'
            }}>
            </h1>
            <p style={{
              color: '#718096',
              marginBottom: '35px',
              fontSize: '16px'
            }}>
            </p>

            <div style={{
              background: '#f7fafc',
              padding: '40px',
              borderRadius: '16px',
              marginBottom: '30px',
              display: 'inline-block'
            }}>
              <QRCodeSVG
                id="qr-code-svg"
                value={qrUrl}
                size={300}
                level="H"
                includeMargin={false}
              />
            </div>

            <p style={{
              color: '#718096',
              marginBottom: '30px',
              fontSize: '15px',
              lineHeight: '1.6'
            }}>
            </p>

            <button
              onClick={downloadQR}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(to right, #009900)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(0, 153, 0, 0.4)',
                marginBottom: '15px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 153, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 153, 0, 0.4)';
              }}
            >
              Descargar Código QR
            </button>

            <p style={{
              color: '#a0aec0',
              fontSize: '14px',
              marginTop: '20px'
            }}>
            </p>

            <button
              onClick={() => {
                setQrCode('');
                setQrUrl('');
              }}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#009900',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Generar otro código
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
