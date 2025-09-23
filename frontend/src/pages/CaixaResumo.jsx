import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CaixaResumo.css';

const CaixaResumo = () => {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [resumo, setResumo] = useState({
    dinheiro: { total: 0, quantidade: 0 },
    cartao: { total: 0, quantidade: 0 },
    pix: { total: 0, quantidade: 0 },
    totalGeral: 0,
    quantidadeTotal: 0
  });

  useEffect(() => {
    // Definir data de hoje como padrão
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    setDataInicio(dataHoje);
    setDataFim(dataHoje);
  }, []);

  useEffect(() => {
    if (dataInicio && dataFim) {
      buscarVendas();
    }
  }, [dataInicio, dataFim]);

  const buscarVendas = async () => {
    setLoading(true);
    setErro('');
    
    try {
      const response = await fetch(
        `http://localhost:4000/api/sale/finalizadas?dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      
      if (response.ok) {
        const vendasData = await response.json();
        setVendas(vendasData);
        calcularResumo(vendasData);
      } else {
        setErro('Erro ao buscar vendas');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const calcularResumo = (vendasData) => {
    const novoResumo = {
      dinheiro: { total: 0, quantidade: 0 },
      cartao: { total: 0, quantidade: 0 },
      pix: { total: 0, quantidade: 0 },
      totalGeral: 0,
      quantidadeTotal: 0
    };

    vendasData.forEach(venda => {
      const formaPagamento = venda.formaPagamento || 'dinheiro';
      const total = venda.total || 0;
      
      if (novoResumo[formaPagamento]) {
        novoResumo[formaPagamento].total += total;
        novoResumo[formaPagamento].quantidade += 1;
      }
      
      novoResumo.totalGeral += total;
      novoResumo.quantidadeTotal += 1;
    });

    setResumo(novoResumo);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="caixa-resumo">
      <div className="caixa-header">
        <button 
          className="voltar-btn"
          onClick={() => navigate('/pdv')}
        >
          ← Voltar
        </button>
        <h1>💰 Resumo do Caixa</h1>
      </div>

      {/* Filtros de Data */}
      <div className="filtros-data">
        <div className="filtro-grupo">
          <label>Data Início:</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="filtro-grupo">
          <label>Data Fim:</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <button 
          className="buscar-btn"
          onClick={buscarVendas}
          disabled={loading}
        >
          🔍 Buscar
        </button>
      </div>

      {erro && <div className="erro-message">{erro}</div>}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="resumo-cards">
            <div className="resumo-card dinheiro">
              <div className="card-icon">💵</div>
              <div className="card-content">
                <h3>Dinheiro</h3>
                <p className="valor">{formatarMoeda(resumo.dinheiro.total)}</p>
                <p className="quantidade">{resumo.dinheiro.quantidade} vendas</p>
              </div>
            </div>

            <div className="resumo-card cartao">
              <div className="card-icon">💳</div>
              <div className="card-content">
                <h3>Cartão</h3>
                <p className="valor">{formatarMoeda(resumo.cartao.total)}</p>
                <p className="quantidade">{resumo.cartao.quantidade} vendas</p>
              </div>
            </div>

            <div className="resumo-card pix">
              <div className="card-icon">📱</div>
              <div className="card-content">
                <h3>PIX</h3>
                <p className="valor">{formatarMoeda(resumo.pix.total)}</p>
                <p className="quantidade">{resumo.pix.quantidade} vendas</p>
              </div>
            </div>

            <div className="resumo-card total">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Total Geral</h3>
                <p className="valor">{formatarMoeda(resumo.totalGeral)}</p>
                <p className="quantidade">{resumo.quantidadeTotal} vendas</p>
              </div>
            </div>
          </div>

          {/* Lista de Vendas */}
          <div className="vendas-lista">
            <h3>Vendas do Período</h3>
            {vendas.length === 0 ? (
              <p className="sem-vendas">Nenhuma venda encontrada no período selecionado.</p>
            ) : (
              <div className="vendas-tabela">
                <div className="tabela-header">
                  <span>Data</span>
                  <span>Comanda</span>
                  <span>Forma Pagamento</span>
                  <span>Total</span>
                </div>
                {vendas.map(venda => (
                  <div key={venda._id} className="tabela-row">
                    <span>{formatarData(venda.dataFinalizacao)}</span>
                    <span>{venda.nomeComanda || venda.numeroComanda}</span>
                    <span className={`forma-pagamento ${venda.formaPagamento}`}>
                      {venda.formaPagamento === 'dinheiro' && '💵'}
                      {venda.formaPagamento === 'cartao' && '💳'}
                      {venda.formaPagamento === 'pix' && '📱'}
                      {venda.formaPagamento || 'Dinheiro'}
                    </span>
                    <span className="valor-venda">{formatarMoeda(venda.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CaixaResumo;