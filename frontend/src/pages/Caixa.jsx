import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Caixa.css';

const Caixa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { comanda } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [troco, setTroco] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const inputValorRef = useRef(null);

  useEffect(() => {
    if (!comanda) {
      navigate('/comandas');
      return;
    }
    
    // Se for dinheiro, calcular troco automaticamente
    if (formaPagamento === 'dinheiro' && valorRecebido) {
      const valor = parseFloat(valorRecebido);
      const total = comanda.total || 0;
      setTroco(valor > total ? valor - total : 0);
    } else {
      setTroco(0);
    }
  }, [valorRecebido, formaPagamento, comanda, navigate]);

  const finalizarVenda = async () => {
    if (!formaPagamento) {
      setErro('Selecione uma forma de pagamento');
      return;
    }

    if (formaPagamento === 'dinheiro') {
      const valor = parseFloat(valorRecebido);
      if (!valor || valor < comanda.total) {
        setErro('Valor recebido deve ser maior ou igual ao total da venda');
        return;
      }
    }

    setLoading(true);
    setErro('');
    
    try {
      const response = await fetch(`http://localhost:4000/api/sale/${comanda._id}/finalize`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formaPagamento,
          valorRecebido: formaPagamento === 'dinheiro' ? parseFloat(valorRecebido) : comanda.total,
          troco: formaPagamento === 'dinheiro' ? troco : 0,
          observacoes
        })
      });

      if (response.ok) {
        setSucesso('Venda finalizada com sucesso!');
        setTimeout(() => {
          navigate('/comandas');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao finalizar venda');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => {
    navigate('/comandas');
  };

  if (!comanda) {
    return null;
  }

  return (
    <div className="caixa-container">
      <div className="caixa-header">
        <h1>💰 Finalizar Venda</h1>
        <button className="btn-voltar" onClick={cancelar}>
          ← Voltar
        </button>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}
      {sucesso && <div className="sucesso-msg">{sucesso}</div>}

      <div className="caixa-content">
        {/* Resumo da Venda */}
        <div className="resumo-venda">
          <h2>Resumo da Venda</h2>
          <div className="venda-info">
            <div className="info-linha">
              <span>Comanda:</span>
              <span>{comanda.nomeComanda || comanda.cliente?.nome || 'Sem nome'}</span>
            </div>
            <div className="info-linha">
              <span>Cliente:</span>
              <span>{comanda.cliente?.nome || 'Não informado'}</span>
            </div>
            <div className="info-linha">
              <span>Mesa:</span>
              <span>{comanda.mesa?.numero || 'Balcão'}</span>
            </div>
            <div className="info-linha total">
              <span>Total:</span>
              <span>R$ {comanda.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Itens da Venda */}
          <div className="itens-venda">
            <h3>Itens ({comanda.itens?.length || 0})</h3>
            <div className="itens-lista">
              {comanda.itens?.map((item, index) => (
                <div key={index} className="item-linha">
                  <span className="item-nome">{item.nomeProduto}</span>
                  <span className="item-qtd">{item.quantidade}x</span>
                  <span className="item-preco">R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="pagamento-area">
          <h2>Forma de Pagamento</h2>
          
          <div className="formas-pagamento">
            <div 
              className={`forma-card ${formaPagamento === 'dinheiro' ? 'selected' : ''}`}
              onClick={() => {
                setFormaPagamento('dinheiro');
                // Foco no input após um pequeno delay para garantir que o campo seja renderizado
                setTimeout(() => {
                  if (inputValorRef.current) {
                    inputValorRef.current.focus();
                  }
                }, 100);
              }}
            >
              <div className="forma-icon">💵</div>
              <div className="forma-nome">Dinheiro</div>
            </div>
            
            <div 
              className={`forma-card ${formaPagamento === 'cartao' ? 'selected' : ''}`}
              onClick={() => setFormaPagamento('cartao')}
            >
              <div className="forma-icon">💳</div>
              <div className="forma-nome">Cartão</div>
            </div>
            
            <div 
              className={`forma-card ${formaPagamento === 'pix' ? 'selected' : ''}`}
              onClick={() => setFormaPagamento('pix')}
            >
              <div className="forma-icon">📱</div>
              <div className="forma-nome">PIX</div>
            </div>
          </div>

          {/* Campos específicos para dinheiro */}
          {formaPagamento === 'dinheiro' && (
            <div className="dinheiro-campos">
              <div className="campo-grupo campo-inline">
                <input
                  ref={inputValorRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  placeholder="0.00"
                  className="input-valor"
                />
                <label>Valor Recebido</label>
              </div>
              
              {troco > 0 && (
                <div className="troco-info">
                  <span>Troco: R$ {troco.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="campo-grupo">
            <label>Observações (opcional):</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o pagamento..."
              className="input-observacoes"
              rows="3"
            />
          </div>

          {/* Botões de Ação */}
          <div className="acoes-caixa">
            <button 
              className="btn-cancelar" 
              onClick={cancelar}
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button 
              className="btn-finalizar" 
              onClick={finalizarVenda}
              disabled={loading || !formaPagamento}
            >
              {loading ? 'Finalizando...' : 'Finalizar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caixa;