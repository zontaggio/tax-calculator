import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Estados brasileiros com alíquotas ICMS
const states = {
  'AC': { name: 'Acre', icms: 0.17 },
  'AL': { name: 'Alagoas', icms: 0.17 },
  'AP': { name: 'Amapá', icms: 0.18 },
  'AM': { name: 'Amazonas', icms: 0.18 },
  'BA': { name: 'Bahia', icms: 0.18 },
  'CE': { name: 'Ceará', icms: 0.18 },
  'DF': { name: 'Distrito Federal', icms: 0.18 },
  'ES': { name: 'Espírito Santo', icms: 0.17 },
  'GO': { name: 'Goiás', icms: 0.17 },
  'MA': { name: 'Maranhão', icms: 0.18 },
  'MT': { name: 'Mato Grosso', icms: 0.17 },
  'MS': { name: 'Mato Grosso do Sul', icms: 0.17 },
  'MG': { name: 'Minas Gerais', icms: 0.18 },
  'PA': { name: 'Pará', icms: 0.17 },
  'PB': { name: 'Paraíba', icms: 0.18 },
  'PR': { name: 'Paraná', icms: 0.17 },
  'PE': { name: 'Pernambuco', icms: 0.18 },
  'PI': { name: 'Piauí', icms: 0.18 },
  'RJ': { name: 'Rio de Janeiro', icms: 0.20 },
  'RN': { name: 'Rio Grande do Norte', icms: 0.18 },
  'RS': { name: 'Rio Grande do Sul', icms: 0.18 },
  'RO': { name: 'Rondônia', icms: 0.17 },
  'RR': { name: 'Roraima', icms: 0.17 },
  'SC': { name: 'Santa Catarina', icms: 0.17 },
  'SP': { name: 'São Paulo', icms: 0.18 },
  'SE': { name: 'Sergipe', icms: 0.18 },
  'TO': { name: 'Tocantins', icms: 0.18 },
};

function App() {
  const [productValue, setProductValue] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [calculation, setCalculation] = useState(null);
  const [currency, setCurrency] = useState('BRL');
  const [dollarRate, setDollarRate] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const isScrolling = { current: false };

    const handleTouchMove = () => {
      isScrolling.current = true;
    };

    const handleClickOrTouch = (event) => {
      if (isScrolling.current) {
        isScrolling.current = false;
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mousedown', handleClickOrTouch);
    document.addEventListener('touchend', handleClickOrTouch);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mousedown', handleClickOrTouch);
      document.removeEventListener('touchend', handleClickOrTouch);
    };
  }, [isDropdownOpen, dropdownRef]);

  const handleStateSelect = (uf) => {
    setSelectedState(uf);
    setIsDropdownOpen(false);
  };

  const calculateTaxes = () => {
    const value = parseFloat(productValue);
    if (!productValue || !selectedState || isNaN(value) || value <= 0) {
      setCalculation(null);
      return;
    }
    
    if (currency === 'USD' && (isNaN(parseFloat(dollarRate)) || parseFloat(dollarRate) <= 0)) {
      setCalculation(null);
      return;
    }

    const rate = currency === 'USD' ? parseFloat(dollarRate) : 1;
    const valorAduaneiro = value * rate;
    const aliquotaII = 0.60;
    const impostoImportacao = valorAduaneiro * aliquotaII;
    
    const state = states[selectedState];
    const aliquotaICMS = state.icms;
    const baseCalculoICMS = (valorAduaneiro + impostoImportacao) / (1 - aliquotaICMS);
    const valorICMS = baseCalculoICMS * aliquotaICMS;
    const totalImpostos = impostoImportacao + valorICMS;
    const totalAPagar = valorAduaneiro + totalImpostos;

    setCalculation({
      valorOriginal: value,
      estado: selectedState,
      nomeEstado: state.name,
      impostoImportacao,
      aliquotaICMS,
      valorICMS,
      totalImpostos,
      totalAPagar,
    });
  };

  const formatCurrency = (value, currencyCode = 'BRL') => {
    const locale = currencyCode === 'USD' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  return (
    <div className="app">
      <div className="calculator-container">
        <header className="header">
          <img src="https://importinghub.app/assets/images/logo-dark.svg" alt="Logo" className="header-logo" />
          <h1>
            Calculadora de Impostos de Importação
          </h1>
          <p>
            {selectedState
              ? `Resultado detalhado para o estado do ${states[selectedState].name} (${selectedState})`
              : 'Preencha os dados para calcular'
            }
          </p>
        </header>

        <section className="input-section">
          <div className="form-group">
            <label>Moeda</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${currency === 'BRL' ? 'active' : ''}`}
                onClick={() => setCurrency('BRL')}
                onTouchEnd={() => setCurrency('BRL')}
              >
                BRL (R$)
              </button>
              <button
                className={`toggle-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
                onTouchEnd={() => setCurrency('USD')}
              >
                USD ($)
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="productValue">Valor do Produto</label>
            <div className="input-wrapper">
              <span>{currency === 'BRL' ? 'R$' : '$'}</span>
              <input
                type="text"
                inputMode="decimal"
                id="productValue"
                className="form-control"
                placeholder="0,00"
                value={productValue}
                onChange={(e) => setProductValue(e.target.value.replace(',', '.'))}
              />
            </div>
          </div>
          {currency === 'USD' && (
            <div className="form-group">
              <label htmlFor="dollarRate">Cotação do Dólar</label>
              <div className="input-wrapper">
                <span>R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  id="dollarRate"
                  className="form-control"
                  placeholder="0,00"
                  value={dollarRate}
                  onChange={(e) => setDollarRate(e.target.value.replace(',', '.'))}
                />
              </div>
            </div>
          )}
          <div className="form-group" ref={dropdownRef}>
            <label htmlFor="state">Estado</label>
            <div className="custom-select-container">
              <button
                type="button"
                className="custom-select-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onTouchEnd={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {selectedState ? states[selectedState].name : 'Selecione um estado...'}
                </span>
                <span className="custom-select-arrow">▼</span>
              </button>
              {isDropdownOpen && (
                <div className="custom-select-options">
                  {Object.entries(states).map(([uf, { name, icms }]) => (
                    <div
                      key={uf}
                      className="custom-select-option"
                      onClick={() => handleStateSelect(uf)}
                      onTouchEnd={() => handleStateSelect(uf)}
                    >
                      {name}
                      <span className="icms-badge-custom">
                        {Math.round(icms * 100)}% ICMS
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className="calculate-btn" onClick={calculateTaxes} onTouchEnd={calculateTaxes}>
            Calcular Impostos
          </button>
        </section>

        {calculation && (
          <>
            <section className="results-section">
              <div className="result-row">
                <span className="result-label">Valor do Produto</span>
                <span className="result-value">{formatCurrency(calculation.valorOriginal, currency)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Impostos</span>
                <span className="result-value"></span>
              </div>
              <div className="result-row">
                <span className="result-label sub-label">Imposto de Importação (60%)</span>
                <span className="result-value">{formatCurrency(calculation.impostoImportacao)}</span>
              </div>
              <div className="result-row">
                <span className="result-label sub-label">ICMS ({Math.round(calculation.aliquotaICMS * 100)}%)</span>
                <span className="result-value">{formatCurrency(calculation.valorICMS)}</span>
              </div>
              <div className="result-row total-taxes">
                <span className="result-label">Total de Impostos</span>
                <span className="result-value">{formatCurrency(calculation.totalImpostos)}</span>
              </div>
            </section>
            
            <section className="total-section">
                <span className="result-label">Total a Pagar:</span>
                <span className="result-value">{formatCurrency(calculation.totalAPagar)}</span>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
