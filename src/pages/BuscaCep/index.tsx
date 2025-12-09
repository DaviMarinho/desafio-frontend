import React, { useState } from 'react';
import { Container, Paper } from '@mui/material';
import { buscarCep } from '../../services/cep.service';
import { Endereco } from '../../types/Endereco';
import { formatarCep } from '../../utils/masks';
import './styles.css';

const BuscaCep: React.FC = () => {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCep(e.target.value);
    setCep(formatted);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEndereco(null);

    try {
      const result = await buscarCep(cep);
      setEndereco(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCep('');
    setEndereco(null);
    setError(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 0 }}>
        <div className="busca-cep-container">
          <h1 className="busca-cep-title">Busca de CEP</h1>
          <p className="busca-cep-subtitle">
            Consulte endereços através do CEP utilizando a API ViaCEP
          </p>

          <form onSubmit={handleSubmit} className="busca-cep-form">
            <div className="form-group">
              <label htmlFor="cep" className="form-label">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || cep.length < 9}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                disabled={loading}
              >
                Limpar
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {endereco && (
            <div className="endereco-result">
              <h2 className="result-title">Endereço Encontrado</h2>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">CEP:</span>
                  <span className="result-value">{endereco.cep}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Logradouro:</span>
                  <span className="result-value">{endereco.logradouro || '-'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Complemento:</span>
                  <span className="result-value">{endereco.complemento || '-'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Bairro:</span>
                  <span className="result-value">{endereco.bairro || '-'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Cidade:</span>
                  <span className="result-value">{endereco.localidade || '-'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">UF:</span>
                  <span className="result-value">{endereco.uf || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Paper>
    </Container>
  );
};

export default BuscaCep;
