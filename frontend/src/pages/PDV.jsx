import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PDV.css';

const PDV = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [funcionarios, setFuncionarios] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [vendaAtual, setVendaAtual] = useState(null);
  
  // Estados de seleção
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [tipoVenda, setTipoVenda] = useState('balcao'); // balcao, mesa, delivery
  
  // Estados de produto
  const [produtos, setProdutos] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [funcionarioBalcao, setFuncionarioBalcao] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [quantidadeRapida, setQuantidadeRapida] = useState(1);
  const [buscaRapida, setBuscaRapida] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');


  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [feedbackProduto, setFeedbackProduto] = useState(null);
  
  // Função para filtrar produtos
  const filtrarProdutos = () => {
    let produtosFiltrados = produtos;
    
    // Filtro por busca rápida
    if (buscaRapida.trim()) {
      produtosFiltrados = produtosFiltrados.filter(produto =>
        produto.nome.toLowerCase().includes(buscaRapida.toLowerCase()) ||
        produto.descricao?.toLowerCase().includes(buscaRapida.toLowerCase())
      );
    }
    

    
    // Filtro por categoria (usando grupo)
    if (categoriaAtiva !== 'todas') {
      produtosFiltrados = produtosFiltrados.filter(produto =>
        produto.grupo === categoriaAtiva
      );
    }
    
    return produtosFiltrados;
  };

  // Função para adicionar produto rapidamente
  const adicionarProdutoRapido = (produto) => {
    const novoItem = {
      id: produto._id,
      nome: produto.nome,
      precoVenda: produto.precoVenda,
      quantidade: quantidadeRapida
    };
    
    const itemExistente = produtosSelecionados.find(item => item.id === produto._id);
    
    if (itemExistente) {
      setProdutosSelecionados(prev => 
        prev.map(item => 
          item.id === produto._id 
            ? { ...item, quantidade: item.quantidade + quantidadeRapida }
            : item
        )
      );
    } else {
      setProdutosSelecionados(prev => [...prev, novoItem]);
    }
    
    // Feedback visual
    setFeedbackProduto({
      nome: produto.nome,
      quantidade: quantidadeRapida,
      acao: itemExistente ? 'atualizado' : 'adicionado'
    });
    
    // Remover feedback após 2 segundos
    setTimeout(() => {
      setFeedbackProduto(null);
    }, 2000);
  };

  // Função para obter categorias únicas baseadas nos grupos
  const obterCategorias = () => {
    const grupos = [...new Set(produtos
      .map(produto => produto.grupo)
      .filter(grupo => grupo && grupo.trim() !== '')
    )];
    return ['todas', ...grupos];
  };

  // Estados para modal de nova mesa
  const [modalNovaMesa, setModalNovaMesa] = useState(false);
  const [novaMesa, setNovaMesa] = useState({
    numero: '',
    nome: '',
    capacidade: 4,
    observacoes: '',
    tipo: 'interna'
  });
  const [tipoMesaSelecionado, setTipoMesaSelecionado] = useState('todos');

  


  // Tipos de mesa
  const tiposMesa = [
    { id: 'todos', nome: 'Todas', icon: '🪑' },
    { id: 'interna', nome: 'Interna', icon: '🏠' },
    { id: 'externa', nome: 'Externa', icon: '🌳' },
    { id: 'vip', nome: 'VIP', icon: '⭐' },
    { id: 'reservada', nome: 'Reservada', icon: '📅' },
    { id: 'balcao', nome: 'Balcão', icon: '🍺' }
  ];



  // Carregar dados iniciais
  useEffect(() => {
    carregarFuncionarios();
    carregarProdutos();
    carregarMesas();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/employee/list');
      if (response.ok) {
        const data = await response.json();
        setFuncionarios(data.filter(emp => emp.ativo));
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };



  const carregarMesas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/mesa/list');
      if (response.ok) {
        const data = await response.json();
        setMesas(data);
      }
    } catch {
      console.error('Erro ao carregar mesas');
    }
  };





  const criarNovaMesa = async () => {
    if (!novaMesa.numero || !novaMesa.nome) {
      setErro('Preencha número e nome da mesa');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      const response = await fetch('http://localhost:4000/api/mesa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaMesa)
      });

      if (response.ok) {
        setSucesso('Mesa criada com sucesso!');
        setModalNovaMesa(false);
        setNovaMesa({ numero: '', nome: '', capacidade: 4, observacoes: '', tipo: 'interna' });
        carregarMesas(); // Recarregar lista de mesas
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao criar mesa');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };



  const carregarProdutos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/product/list');
      if (response.ok) {
        const data = await response.json();
        const produtosAtivos = data.filter(prod => prod.ativo && !prod.oculto);
        setProdutos(produtosAtivos);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };





  // Função para limpar venda
  const limparVenda = () => {
    setProdutosSelecionados([]);
    setDesconto(0);
    setQuantidadeRapida(1);
    setBuscaRapida('');
    setCategoriaAtiva('todas');
  };



  // Função para calcular subtotal
  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((total, produto) => {
      return total + ((produto.precoVenda || 0) * (produto.quantidade || 1));
    }, 0);
  };

  // Função para calcular desconto
  const calcularDesconto = () => {
    return calcularSubtotal() * (desconto / 100);
  };

  // Função para calcular total final
  const calcularTotalFinal = () => {
    return calcularSubtotal() - calcularDesconto();
  };



  const finalizarVendaBalcaoSimples = () => {
    if (produtosSelecionados.length === 0) {
      setErro('Adicione pelo menos um produto para finalizar a venda');
      return;
    }

    if (!funcionarioBalcao) {
      setErro('Selecione um funcionário para finalizar a venda');
      return;
    }

    // Criar objeto de venda similar ao formato das comandas
    const vendaBalcao = {
      _id: 'venda_balcao_' + Date.now(),
      tipo: 'balcao',
      funcionario: { _id: funcionarioBalcao },
      itens: produtosSelecionados.map(item => ({
        nomeProduto: item.nome,
        quantidade: item.quantidade || 1,
        precoUnitario: item.precoVenda,
        subtotal: (item.precoVenda || 0) * (item.quantidade || 1)
      })),
      total: calcularTotalFinal(),
      status: 'aberta',
      nomeComanda: 'Venda Balcão'
    };

    // Navegar para tela de caixa com os dados da venda
    navigate('/caixa', { state: { comanda: vendaBalcao, origem: '/pdv' } });
  };

  const iniciarNovaVenda = async () => {
    if (!funcionarioBalcao) {
      setErro('Selecione um funcionário para iniciar a venda');
      return;
    }

    // Validar mesa se tipo for mesa
    if (tipoVenda === 'mesa' && !mesaSelecionada) {
      setErro('Selecione uma mesa para vendas do tipo mesa');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      const dadosVenda = {
        funcionario: funcionarioBalcao,
        cliente: '',
        tipoVenda: tipoVenda
      };

      // Adicionar mesa se tipo for mesa
      if (tipoVenda === 'mesa' && mesaSelecionada) {
        dadosVenda.mesa = mesaSelecionada;
      }

      const response = await fetch('http://localhost:4000/api/sale/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosVenda)
      });

      if (response.ok) {
        const novaVenda = await response.json();
        setVendaAtual(novaVenda);
        setSucesso('Nova venda iniciada com sucesso!');
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao iniciar venda');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };



  const salvarVenda = async () => {
    if (!vendaAtual) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/save`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setSucesso('Venda salva com sucesso!');
        setTimeout(() => setSucesso(''), 2000);
      }
    } catch {
      setErro('Erro ao salvar venda');
    }
  };

  const removerItem = async (produtoId) => {
    if (!vendaAtual) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item/${produtoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const vendaAtualizada = await response.json();
        setVendaAtual(vendaAtualizada);
        setSucesso('Item removido com sucesso!');
        setTimeout(() => setSucesso(''), 2000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao remover item');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };



  // Função para atualizar quantidade (implementar quando necessário)
  // const atualizarQuantidade = async (produtoId, novaQuantidade) => {
  //   if (!vendaAtual) return;
  //   // Implementação da atualização de quantidade
  // };

  // Função para aplicar desconto (implementar quando necessário)
  // const aplicarDesconto = async () => {
  //   if (!vendaAtual) return;
  //   // Implementação do desconto
  // };


  const cancelarVenda = async () => {
    if (!vendaAtual) return;

    if (window.confirm('Tem certeza que deseja cancelar esta venda?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/cancel`, {
          method: 'PUT'
        });

        if (response.ok) {
          setSucesso('Venda cancelada!');
          setVendaAtual(null);
          setDesconto(0);
          setTimeout(() => setSucesso(''), 3000);
        }
      } catch {
        setErro('Erro ao cancelar venda');
      }
    }
  };



  return (
    <div className="pdv-container">
      {/* Header */}
      <div className="pdv-header">
        <h1>🍺 PDV - Bar & Restaurante</h1>
        <div className="pdv-status">
          {vendaAtual && (
            <span className="venda-info">
              {tipoVenda === 'mesa' && mesaSelecionada && (
                <span>Mesa {mesas.find(m => m._id === mesaSelecionada)?.numero} - </span>
              )}
              Comanda #{vendaAtual.numeroComanda || vendaAtual._id?.slice(-6)}
            </span>
          )}
        </div>
      </div>

      {erro && <div className="erro-message">{erro}</div>}
      {sucesso && <div className="sucesso-message">{sucesso}</div>}

      {/* Botões de Navegação */}
      <div className="pdv-navigation">
        <button 
          className={`nav-btn ${tipoVenda === 'balcao' ? 'active' : ''}`}
          onClick={() => setTipoVenda('balcao')}
        >
          🏪 Venda Balcão
        </button>
        <button 
          className="nav-btn"
          onClick={() => window.location.href = '/mesas'}
        >
          🪑 Mesa
        </button>
        <button 
          className={`nav-btn ${tipoVenda === 'delivery' ? 'active' : ''}`}
          onClick={() => setTipoVenda('delivery')}
        >
          🚚 Delivery
        </button>
        <button 
          className="nav-btn"
          onClick={() => window.location.href = '/comandas'}
        >
          📋 Comanda
        </button>
        <button 
          className="nav-btn"
          onClick={() => window.location.href = '/caixa-resumo'}
        >
          💰 Caixa
        </button>
      </div>

      <div className="pdv-layout">
        {/* Painel Esquerdo - Controles */}
        <div className="pdv-left-panel">

          {/* Seleção de Mesa (apenas se tipo for mesa e não for balcão) */}
          {tipoVenda === 'mesa' && (
            <div className="pdv-section">
              <div className="mesas-header">
                <h3>🪑 Mesas</h3>
                <button 
                  className="btn-nova-mesa"
                  onClick={() => setModalNovaMesa(true)}
                >
                  ➕ Nova Mesa
                </button>
              </div>
              {/* Filtros de Tipo de Mesa */}
              <div className="tipos-mesa-filtro">
                {tiposMesa.map(tipo => (
                  <button
                    key={tipo.id}
                    className={`tipo-mesa-btn ${tipoMesaSelecionado === tipo.id ? 'active' : ''}`}
                    onClick={() => setTipoMesaSelecionado(tipo.id)}
                  >
                    {tipo.icon} {tipo.nome}
                  </button>
                ))}
              </div>
              
              <div className="mesas-grid">
                {mesas
                  .filter(mesa => tipoMesaSelecionado === 'todos' || mesa.tipo === tipoMesaSelecionado)
                  .map(mesa => (
                  <button
                    key={mesa._id}
                    className={`mesa-btn ${mesa.status} ${mesaSelecionada === mesa._id ? 'selected' : ''}`}
                    onClick={() => {
                      if (mesa.status === 'ocupada' && mesa.vendaAtual) {
                        // Se mesa ocupada, carregar a venda existente
                        setVendaAtual(mesa.vendaAtual);
                        setMesaSelecionada(mesa._id);
                      } else {
                        // Mesa livre, apenas selecionar
                        setMesaSelecionada(mesa._id);
                      }
                    }}
                    disabled={false}
                  >
                    <div className="mesa-numero">{mesa.numero}</div>
                    <div className="mesa-nome">{mesa.nome}</div>
                    <div className="mesa-status">{mesa.status}</div>
                    {mesa.status === 'ocupada' && (
                      <div className="mesa-tempo">{mesa.tempoOcupacao || 0}min</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}



          {/* Painel Esquerdo - Itens Selecionados */}
          <div className="pdv-section itens-selecionados-section">
            <h3>🛒 Itens da Venda</h3>
            
            {/* Lista de Itens Selecionados */}
            {produtosSelecionados.length > 0 ? (
              <div className="lista-itens-venda">
                {produtosSelecionados.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="item-venda-card">
                    <div className="item-info">
                      <div className="item-nome">{item.nome}</div>
                      <div className="item-detalhes">
                        <span className="item-qtd">{item.quantidade}x</span>
                        <span className="item-preco">R$ {((item.precoVenda || 0) * (item.quantidade || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="item-acoes">
                      <button 
                        className="btn-qtd-menos"
                        onClick={() => {
                          const novosProdutos = [...produtosSelecionados];
                          if (novosProdutos[index].quantidade > 1) {
                            novosProdutos[index].quantidade -= 1;
                          } else {
                            novosProdutos.splice(index, 1);
                          }
                          setProdutosSelecionados(novosProdutos);
                        }}
                      >
                        −
                      </button>
                      <button 
                        className="btn-qtd-mais"
                        onClick={() => {
                          const novosProdutos = [...produtosSelecionados];
                          novosProdutos[index].quantidade += 1;
                          setProdutosSelecionados(novosProdutos);
                        }}
                      >
                        +
                      </button>
                      <button 
                        className="btn-remover-item"
                        onClick={() => {
                          const novosProdutos = produtosSelecionados.filter((_, i) => i !== index);
                          setProdutosSelecionados(novosProdutos);
                        }}
                        title="Remover item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lista-vazia">
                <p>Nenhum item selecionado</p>
                <p>Selecione produtos no painel ao lado</p>
              </div>
            )}
            
            {/* Total */}
            <div className="totals">
              <div className="totals-display">
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span>R$ {produtosSelecionados.length > 0 ? (calcularTotalFinal() || 0).toFixed(2) : (vendaAtual ? (vendaAtual.subtotal || 0).toFixed(2) : '0.00')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itens da Venda */}
          <div className="pdv-section items-section">
            <div className="items-container">
              {vendaAtual && vendaAtual.itens && vendaAtual.itens.length > 0 ? (
                <div className="items-list">
                  {vendaAtual.itens.map((item, index) => (
                    <div key={`${item.produto}-${index}`} className="item-card">
                      <div className="item-info">
                        <div className="item-name">{item.nomeProduto}</div>
                        <div className="item-details">
                          <span className="item-qty">{item.quantidade}x</span>
                          <span className="item-price">R$ {(item.precoUnitario || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="item-actions">
                        <span className="item-total">R$ {(item.subtotal || 0).toFixed(2)}</span>
                        <button 
                          onClick={() => removerItem(item.produto)}
                          className="remove-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items">
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito - Venda Balcão Melhorado */}
        <div className="pdv-right-panel">
          <div className="venda-balcao-melhorada">
            {/* Header com Funcionário, Botões de Ação e Totais */}
            <div className="balcao-header">
              <div className="header-left">
                <h2>🛒 Venda Balcão</h2>
                <select
                  value={funcionarioBalcao}
                  onChange={(e) => setFuncionarioBalcao(e.target.value)}
                  className="select-funcionario-compacto"
                >
                  <option value="">👤 Funcionário</option>
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario._id} value={funcionario._id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
                
                {/* Botões de Ação Compactos */}
                <div className="action-buttons-compact">
                  <button 
                    onClick={iniciarNovaVenda}
                    className="btn-compact btn-new-compact"
                    disabled={loading}
                    title="Nova Venda"
                  >
                    🆕
                  </button>
                  
                  <button 
                    onClick={salvarVenda}
                    className="btn-compact btn-save-compact"
                    disabled={loading || !vendaAtual || !vendaAtual.itens?.length}
                    title="Salvar"
                  >
                    💾
                  </button>
                  
                  <button 
                    onClick={finalizarVendaBalcaoSimples}
                    className="btn-compact btn-finalize-compact"
                    disabled={loading || produtosSelecionados.length === 0 || !funcionarioBalcao}
                    title="Finalizar"
                  >
                    ✅
                  </button>
                  
                  <button 
                    onClick={cancelarVenda}
                    className="btn-compact btn-cancel-compact"
                    disabled={loading || !vendaAtual}
                    title="Cancelar"
                  >
                    ❌
                  </button>
                </div>
              </div>
              <div className="header-right">
                <div className="totais-rapidos">
                  <div className="total-itens">
                    <span className="label">Itens:</span>
                    <span className="valor">{produtosSelecionados.length}</span>
                  </div>
                  <div className="total-valor">
                    <span className="label">Total:</span>
                    <span className="valor">R$ {(calcularTotalFinal() || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Produtos */}
            <div className="produtos-section-right">
              <h3>🛍️ Produtos Disponíveis</h3>
              
              {/* Busca Rápida */}
              <div className="busca-rapida-right">
                <div className="busca-container">
                  <input
                    type="text"
                    placeholder="🔍 Digite para buscar produtos..."
                    value={buscaRapida}
                    onChange={(e) => setBuscaRapida(e.target.value)}
                    className="input-busca-rapida"
                  />
                  <div className="qtd-selector">
                    <button 
                      className="btn-qtd-rapida" 
                      onClick={() => setQuantidadeRapida(Math.max(1, quantidadeRapida - 1))}
                    >
                      −
                    </button>
                    <span className="qtd-atual">{quantidadeRapida}</span>
                    <button 
                      className="btn-qtd-rapida" 
                      onClick={() => setQuantidadeRapida(quantidadeRapida + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtros de Categoria */}
              <div className="categorias-filtros">
                <h4 className="filtros-titulo">📂 Filtrar por Grupo</h4>
                <div className="categorias-horizontais">
                  {obterCategorias().map(categoria => (
                    <button
                      key={categoria}
                      className={`categoria-chip ${categoriaAtiva === categoria ? 'ativo' : ''}`}
                      onClick={() => setCategoriaAtiva(categoria)}
                    >
                      {categoria === 'todas' ? '🍽️' : '📂'} {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Produtos */}
              <div className="produtos-area-right">
                <div className="produtos-lista-right">
                  {filtrarProdutos().map(produto => {
                    const produtoSelecionado = produtosSelecionados.find(p => p.id === produto._id);
                    const quantidadeSelecionada = produtoSelecionado ? produtoSelecionado.quantidade || 1 : 0;
                    return (
                      <div 
                        key={produto._id} 
                        className={`produto-linha ${quantidadeSelecionada > 0 ? 'selecionado' : ''}`}
                      >
                        <div className="produto-info-linha">
                          <span className="produto-nome-linha">{produto.nome}</span>
                          <span className="produto-preco-linha">R$ {(produto.precoVenda || 0).toFixed(2)}</span>
                        </div>
                        <div className="produto-acoes-linha">
                          {quantidadeSelecionada > 0 && (
                            <>
                              <button 
                                className="btn-diminuir"
                                onClick={() => {
                                  const novosProdutos = [...produtosSelecionados];
                                  const index = novosProdutos.findIndex(p => p.id === produto._id);
                                  if (index !== -1) {
                                    if (novosProdutos[index].quantidade > 1) {
                                      novosProdutos[index].quantidade -= 1;
                                    } else {
                                      novosProdutos.splice(index, 1);
                                    }
                                    setProdutosSelecionados(novosProdutos);
                                  }
                                }}
                              >
                                −
                              </button>
                              <input 
                                type="number"
                                min="1"
                                max="999"
                                value={quantidadeSelecionada}
                                onChange={(e) => {
                                  const novaQuantidade = parseInt(e.target.value) || 1;
                                  if (novaQuantidade > 0) {
                                    const novosProdutos = [...produtosSelecionados];
                                    const index = novosProdutos.findIndex(p => p.id === produto._id);
                                    if (index !== -1) {
                                      novosProdutos[index].quantidade = novaQuantidade;
                                      setProdutosSelecionados(novosProdutos);
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.target.blur(); // Remove o foco do input
                                  }
                                }}
                                className="input-quantidade-editavel"
                                onFocus={(e) => e.target.select()}
                                ref={(input) => {
                                  if (input) {
                                    input.dataset.produtoId = produto._id;
                                  }
                                }}
                              />
                            </>
                          )}
                          <button 
                            className="btn-adicionar"
                            onClick={() => {
                              if (quantidadeSelecionada > 0) {
                                // Se o produto já está selecionado, apenas incrementa
                                const novosProdutos = [...produtosSelecionados];
                                const index = novosProdutos.findIndex(p => p.id === produto._id);
                                if (index !== -1) {
                                  novosProdutos[index].quantidade += 1;
                                  setProdutosSelecionados(novosProdutos);
                                }
                              } else {
                                // Se o produto não está selecionado, usa a função original
                                adicionarProdutoRapido(produto);
                              }
                              
                              // Focar no input de quantidade após adicionar
                              setTimeout(() => {
                                const input = document.querySelector(`input[data-produto-id="${produto._id}"]`);
                                if (input) {
                                  input.focus();
                                  input.select();
                                }
                              }, 100);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resumo Simplificado da Venda */}
            {produtosSelecionados.length > 0 && (
              <div className="resumo-venda-simplificado">
                <div className="resumo-header">
                  <span className="total-itens">{produtosSelecionados.length} {produtosSelecionados.length === 1 ? 'item' : 'itens'}</span>
                  <span className="total-valor">R$ {(calcularTotalFinal() || 0).toFixed(2)}</span>
                </div>
                <div className="itens-lista">
                  {produtosSelecionados.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="item-linha">
                      <span className="item-info">
                        <span className="item-nome">{item.nome}</span>
                        <span className="item-detalhes">{item.quantidade}x R$ {((item.precoVenda || 0) * (item.quantidade || 1)).toFixed(2)}</span>
                      </span>
                      <button 
                        className="btn-remover"
                        onClick={() => {
                          const novosProdutos = produtosSelecionados.filter((_, i) => i !== index);
                          setProdutosSelecionados(novosProdutos);
                        }}
                        title="Remover item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações Principais */}
            <div className="acoes-principais">
              <button
                onClick={limparVenda}
                className="btn-limpar-rapido"
                disabled={produtosSelecionados.length === 0}
              >
                🗑️ Limpar
              </button>
              <button
                onClick={finalizarVendaBalcaoSimples}
                disabled={loading || produtosSelecionados.length === 0 || !funcionarioBalcao}
                className="btn-finalizar-rapido"
                type="button"
              >
                {loading ? '⏳ Processando...' : `✅ Finalizar (R$ ${(calcularTotalFinal() || 0).toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Mesa */}
      {modalNovaMesa && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Nova Mesa</h3>
              <button 
                className="modal-close"
                onClick={() => setModalNovaMesa(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Número da Mesa:</label>
                <input
                  type="text"
                  value={novaMesa.numero}
                  onChange={(e) => setNovaMesa({...novaMesa, numero: e.target.value})}
                  placeholder="Ex: 5"
                />
              </div>
              <div className="form-group">
                <label>Nome da Mesa:</label>
                <input
                  type="text"
                  value={novaMesa.nome}
                  onChange={(e) => setNovaMesa({...novaMesa, nome: e.target.value})}
                  placeholder="Ex: Mesa 5"
                />
              </div>
              <div className="form-group">
                <label>Capacidade:</label>
                <input
                  type="number"
                  value={novaMesa.capacidade}
                  onChange={(e) => setNovaMesa({...novaMesa, capacidade: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label>Tipo da Mesa:</label>
                <select
                  value={novaMesa.tipo}
                  onChange={(e) => setNovaMesa({...novaMesa, tipo: e.target.value})}
                >
                  <option value="interna">🏠 Interna</option>
                  <option value="externa">🌳 Externa</option>
                  <option value="vip">⭐ VIP</option>
                  <option value="reservada">📅 Reservada</option>
                  <option value="balcao">🍺 Balcão</option>
                </select>
              </div>
              <div className="form-group">
                <label>Observações:</label>
                <input
                  type="text"
                  value={novaMesa.observacoes}
                  onChange={(e) => setNovaMesa({...novaMesa, observacoes: e.target.value})}
                  placeholder="Ex: Mesa próxima à janela"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setModalNovaMesa(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-criar"
                onClick={criarNovaMesa}
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Mesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificação de Feedback */}
      {feedbackProduto && (
        <div className="feedback-produto">
          <div className="feedback-content">
            <span className="feedback-icon">✅</span>
            <div className="feedback-text">
              <strong>{feedbackProduto.nome}</strong>
              <span>
                {feedbackProduto.acao === 'adicionado' 
                  ? `Adicionado (${feedbackProduto.quantidade}x)` 
                  : `Quantidade atualizada (+${feedbackProduto.quantidade})`
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDV;