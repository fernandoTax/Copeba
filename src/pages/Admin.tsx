import { useState, useEffect } from 'react';
import { supabase, type Registration, type QRCode } from '../lib/supabase';
import { Link } from 'react-router-dom';

type RegistrationWithQR = Registration & {
  qr_codes?: QRCode;
};

export default function Admin() {
  const [registrations, setRegistrations] = useState<RegistrationWithQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('registrations')
        .select(`
          *,
          qr_codes (
            code,
            destination_url
          )
        `)
        .order('registered_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Error al cargar los registros.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.includes(searchTerm)
  );

  const exportToCSV = () => {
    const headers = ['Nombre', 'Teléfono', 'Fecha de Registro', 'Código QR'];
    const rows = filteredRegistrations.map(reg => [
      reg.name,
      reg.phone,
      new Date(reg.registered_at).toLocaleString('es-GT'),
      reg.qr_codes?.code || 'Directo'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #011c6b 0%, #009900 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <Link
              to="/"
              style={{
                color: '#009900',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Generar QR
            </Link>
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#1a202c'
          }}>
            Registros
          </h1>
          <p style={{ color: '#718096', marginBottom: '30px' }}>
            Todos los registros capturados
          </p>

          <div style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#009900'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />

            <button
              onClick={fetchRegistrations}
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#a0aec0' : '#009900',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#007700';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#009900';
              }}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: filteredRegistrations.length === 0 ? '#a0aec0' : '#48bb78',
                border: 'none',
                borderRadius: '8px',
                cursor: filteredRegistrations.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (filteredRegistrations.length > 0) e.currentTarget.style.background = '#38a169';
              }}
              onMouseLeave={(e) => {
                if (filteredRegistrations.length > 0) e.currentTarget.style.background = '#48bb78';
              }}
            >
              Exportar CSV
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f7fafc',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <span style={{ color: '#4a5568', fontWeight: '600' }}>
                Total de registros: {filteredRegistrations.length}
              </span>
            </div>
            {searchTerm && (
              <span style={{ color: '#718096', fontSize: '14px' }}>
                Filtrando resultados
              </span>
            )}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '12px',
              background: '#fed7d7',
              color: '#c53030',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          </div>
        )}

        {loading && !error ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
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
            <p style={{ marginTop: '20px', color: '#4a5568' }}>Cargando registros...</p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .table-row:hover {
                background: #f7fafc;
              }
            `}</style>

            {filteredRegistrations.length === 0 ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#718096'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '10px'
                }}>
                  📋
                </div>
                <p style={{ fontSize: '18px' }}>
                  {searchTerm ? 'No se encontraron registros' : 'Aún no hay registros'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: '#f7fafc',
                      borderBottom: '2px solid #e2e8f0'
                    }}>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        color: '#2d3748',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        Nombre
                      </th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        color: '#2d3748',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        Teléfono
                      </th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        color: '#2d3748',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        Fecha
                      </th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        color: '#2d3748',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        Origen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className="table-row"
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{
                          padding: '16px',
                          color: '#2d3748',
                          fontWeight: '500'
                        }}>
                          {reg.name}
                        </td>
                        <td style={{
                          padding: '16px',
                          color: '#4a5568'
                        }}>
                          {reg.phone}
                        </td>
                        <td style={{
                          padding: '16px',
                          color: '#4a5568',
                          fontSize: '14px'
                        }}>
                          {new Date(reg.registered_at).toLocaleString('es-GT', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{
                          padding: '16px',
                          color: '#718096',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}>
                          {reg.qr_codes?.code || 'Directo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
