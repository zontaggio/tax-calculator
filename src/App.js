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
  const [dollarRate, setDollarRate] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [showStateOptions, setShowStateOptions] = useState(false);
  const dropdownRef = useRef(null);

  // Filtra os estados baseado na busca
  const filteredStates = Object.entries(states).filter(([uf, { name }]) => {
    const searchTerm = stateSearch.toLowerCase();
    return name.toLowerCase().includes(searchTerm) || uf.toLowerCase().includes(searchTerm);
  });

  useEffect(() => {
    if (!showStateOptions) return;

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTimeout(() => {
          setShowStateOptions(false);
        }, 100);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showStateOptions]);

  const handleStateSelect = (uf) => {
    setSelectedState(uf);
    setStateSearch(states[uf].name);
    setShowStateOptions(false);
  };

  const handleStateSearchChange = (e) => {
    const value = e.target.value;
    setStateSearch(value);
    setShowStateOptions(value.length > 0);
    
    // Se o valor digitado corresponder exatamente a um estado, seleciona automaticamente
    const exactMatch = Object.entries(states).find(([uf, { name }]) => 
      name.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setSelectedState(exactMatch[0]);
    } else {
      setSelectedState('');
    }
  };

  const calculateTaxes = () => {
    const value = parseFloat(productValue);
    if (!productValue || !selectedState || isNaN(value) || value <= 0) {
      setCalculation(null);
      return;
    }
    
    if (isNaN(parseFloat(dollarRate)) || parseFloat(dollarRate) <= 0) {
      setCalculation(null);
      return;
    }

    const rate = parseFloat(dollarRate);
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
            <label htmlFor="productValue">Valor Declarado do Produto</label>
            <div className="input-wrapper">
              <span>$</span>
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
          <div className="form-group" ref={dropdownRef}>
            <label htmlFor="state">Estado</label>
            <div className="custom-select-container">
              <input
                type="text"
                id="state"
                className="form-control"
                placeholder="Digite o nome do estado..."
                value={stateSearch}
                onChange={handleStateSearchChange}
                onFocus={() => setShowStateOptions(stateSearch.length > 0)}
              />
              {showStateOptions && filteredStates.length > 0 && (
                <div className="custom-select-options">
                  {filteredStates.map(([uf, { name }]) => (
                    <div
                      key={uf}
                      className="custom-select-option"
                      onClick={() => handleStateSelect(uf)}
                      onTouchEnd={() => handleStateSelect(uf)}
                    >
                      {name}
                      <span className="icms-badge-custom">
                        {Math.round(states[uf].icms * 100)}% ICMS
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
                <span className="result-label">Valor Declarado do Produto</span>
                <span className="result-value">{formatCurrency(calculation.valorOriginal, 'USD')}</span>
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
                <span className="result-label">Total de Impostos:</span>
                <span className="result-value">{formatCurrency(calculation.totalImpostos)}</span>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
