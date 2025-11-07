import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, type QRCode } from '../lib/supabase';

export default function Register() {
  const { code } = useParams<{ code: string }>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState<QRCode | null>(null);
  const [validating, setValidating] = useState(!!code);

  useEffect(() => {
    if (code) {
      validateQRCode();
    }
  }, [code]);

  const validateQRCode = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Código QR no encontrado');
      } else {
        setQrData(data);
      }
    } catch (err) {
      console.error('Error validating QR code:', err);
      setError('Error al validar el código QR');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('registrations')
        .insert([
          {
            qr_code_id: qrData?.id || null,
            name: name.trim(),
            phone: phone.trim(),
          }
        ]);

      if (insertError) throw insertError;

      const destination = qrData?.destination_url || 'https://copeba.com.gt/';
      setTimeout(() => {
        window.location.href = destination;
      }, 100);
    } catch (err) {
      console.error('Error saving registration:', err);
      setError('Error al guardar el registro. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #011c6b 0%, #009900 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #009900',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ marginTop: '20px', color: '#4a5568' }}>Validando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #011c6b 0%, #009900 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
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
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#1a202c',
          textAlign: 'center'
        }}>
          Bienvenido
        </h1>
        <p style={{
          color: '#718096',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Por favor completa la siguiente información
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Nombre completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#009900'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Número de teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ingresa tu número"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#009900'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#fed7d7',
              color: '#c53030',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #009900 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Redirigiendo...' : 'Continuar'}
          </button>
        </form>

        <p style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#a0aec0'
        }}>
          Tu información será guardada de forma segura
        </p>
      </div>
    </div>
  );
}
