import React, { useState, useEffect } from 'react';
import './PDV.css';

const PDV = () => {
  // Estados principais
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [vendaAtual, setVendaAtual] = useState(null);
  
  // Estados de seleção
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [tipoVenda, setTipoVenda] = useState('balcao'); // balcao, mesa, delivery
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  
  // Estados de produto
  const [quantidade, setQuantidade] = useState(1);
  const [desconto, setDesconto] = useState(0);
  const [buscarProduto, setBuscarProduto] = useState('');
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  
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

  
  // Categorias de produtos (dinâmicas baseadas nos grupos)
  const [categorias, setCategorias] = useState([
    { id: 'todos', nome: 'Todos', icon: '🍽️' }
  ]);

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
    carregarClientes();
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
    } catch {
      console.error('Erro ao carregar funcionários');
    }
  };

  const carregarClientes = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/customer/list');
      if (response.ok) {
        const data = await response.json();
        setClientes(data.filter(cli => cli.ativo));
      }
    } catch {
      console.error('Erro ao carregar clientes');
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
        const produtosAtivos = data.filter(prod => prod.ativo);
        setProdutos(produtosAtivos);
        
        // Extrair grupos únicos dos produtos para criar categorias dinâmicas
        const gruposUnicos = [...new Set(produtosAtivos
          .map(produto => produto.grupo)
          .filter(grupo => grupo && grupo.trim() !== '')
        )];
        
        // Mapear grupos para categorias com ícones
        const iconesPorGrupo = {
          'bebidas': '🥤',
          'comidas': '🍖',
          'limpeza': '🧽',
          'sobremesas': '🍰',
          'petiscos': '🍿',
          'default': '📦'
        };
        
        const novasCategorias = [
          { id: 'todos', nome: 'Todos', icon: '🍽️' },
          ...gruposUnicos.map(grupo => ({
            id: grupo,
            nome: grupo.charAt(0).toUpperCase() + grupo.slice(1),
            icon: iconesPorGrupo[grupo.toLowerCase()] || iconesPorGrupo.default
          }))
        ];
        
        setCategorias(novasCategorias);
      }
    } catch {
      console.error('Erro ao carregar produtos');
    }
  };

  const iniciarNovaVenda = async () => {
    if (!funcionarioSelecionado || !clienteSelecionado) {
      setErro('Selecione um funcionário e um cliente para iniciar a venda');
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
        funcionario: funcionarioSelecionado,
        cliente: clienteSelecionado,
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

  const adicionarItem = async (produto) => {
    if (!vendaAtual) {
      setErro('Inicie uma venda primeiro');
      return;
    }

    if (!produto) {
      setErro('Produto inválido');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      // Verificar se o item já existe na venda
      const itemExistente = vendaAtual.itens?.find(item => item.produto._id === produto._id);
      
      if (itemExistente) {
        // Se existe, incrementar quantidade
        const novaQuantidade = itemExistente.quantidade + quantidade;
        const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item/${itemExistente._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantidade: novaQuantidade
          })
        });

        if (response.ok) {
          const vendaAtualizada = await response.json();
          setVendaAtual(vendaAtualizada);
          setQuantidade(1);
          setBuscarProduto('');
          setSucesso(`Quantidade de ${produto.nome} atualizada!`);
          setTimeout(() => setSucesso(''), 2000);
        } else {
          const errorData = await response.json();
          setErro(errorData.error || 'Erro ao atualizar quantidade');
        }
      } else {
        // Se não existe, adicionar novo item
        const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            produtoId: produto._id,
            quantidade: quantidade
          })
        });

        if (response.ok) {
          const vendaAtualizada = await response.json();
          setVendaAtual(vendaAtualizada);
          setQuantidade(1);
          setBuscarProduto('');
          setSucesso(`${produto.nome} adicionado ao pedido!`);
          setTimeout(() => setSucesso(''), 2000);
        } else {
          const errorData = await response.json();
          setErro(errorData.error || 'Erro ao adicionar item');
        }
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

  const removerItemProduto = async (produto) => {
    if (!vendaAtual) return;
    
    const itemExistente = vendaAtual.itens?.find(item => item.produto._id === produto._id);
    if (!itemExistente) return;
    
    if (itemExistente.quantidade > 1) {
      // Se tem mais de 1, diminui a quantidade
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            produtoId: produto._id,
            quantidade: -1
          })
        });

        if (response.ok) {
          const vendaAtualizada = await response.json();
          setVendaAtual(vendaAtualizada);
        } else {
          const errorData = await response.json();
          setErro(errorData.error || 'Erro ao remover item');
        }
      } catch {
        setErro('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    } else {
      // Se tem apenas 1, remove completamente
      await removerItem(produto._id);
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

  const finalizarVenda = async () => {
    if (!vendaAtual || vendaAtual.itens.length === 0) {
      setErro('Adicione pelo menos um item para finalizar a venda');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/finalize`, {
        method: 'PUT'
      });

      if (response.ok) {
        setSucesso('Venda finalizada com sucesso!');
        setVendaAtual(null);
        setFuncionarioSelecionado('');
        setClienteSelecionado('');
        setDesconto(0);

        setTimeout(() => setSucesso(''), 3000);
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
          setFuncionarioSelecionado('');
          setClienteSelecionado('');
          setDesconto(0);
          setTimeout(() => setSucesso(''), 3000);
        }
      } catch {
        setErro('Erro ao cancelar venda');
      }
    }
  };

  // Filtrar produtos por categoria
  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = categoriaSelecionada === 'todos' || produto.grupo === categoriaSelecionada;
    const matchBusca = produto.nome.toLowerCase().includes(buscarProduto.toLowerCase());
    return matchCategoria && matchBusca && produto.ativo && produto.disponivel;
  });

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

      <div className="pdv-layout">
        {/* Painel Esquerdo - Controles */}
        <div className="pdv-left-panel">
          {/* Tipo de Venda */}
          <div className="pdv-section">
            <h3>📍 Tipo de Venda</h3>
            <div className="tipo-venda-buttons">
              <button 
                className={`tipo-btn ${tipoVenda === 'balcao' ? 'active' : ''}`}
                onClick={() => setTipoVenda('balcao')}
              >
                🏪 Balcão
              </button>
              <button 
                className={`tipo-btn ${tipoVenda === 'mesa' ? 'active' : ''}`}
                onClick={() => setTipoVenda('mesa')}
              >
                🪑 Mesa
              </button>

              <button 
                className={`tipo-btn ${tipoVenda === 'delivery' ? 'active' : ''}`}
                onClick={() => setTipoVenda('delivery')}
              >
                🚚 Delivery
              </button>
              <button 
                className="btn-comandas"
                onClick={() => window.location.href = '/comandas'}
              >
                📋 Comandas
              </button>
              <button 
                className="btn-mesas"
                onClick={() => window.location.href = '/mesas'}
              >
                🪑 Mesas
              </button>
            </div>
          </div>

          {/* Seleção de Mesa (se tipo mesa) */}
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



          {/* Seleção de Funcionário e Cliente */}
          <div className="pdv-section">
            <h3>👤 Atendimento</h3>
            <div className="selection-inputs">
              <div className="input-group">
                <label>Funcionário:</label>
                <select 
                  value={funcionarioSelecionado} 
                  onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {funcionarios.map(func => (
                    <option key={func._id} value={func._id}>
                      {func.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Cliente:</label>
                <select 
                  value={clienteSelecionado} 
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                >
                  <option value="">Cliente avulso</option>
                  {clientes.map(cliente => (
                    <option key={cliente._id} value={cliente._id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Itens da Venda */}
          <div className="pdv-section items-section">
            <h3>📋 Pedido</h3>
            <div className="items-container">
              {vendaAtual && vendaAtual.itens && vendaAtual.itens.length > 0 ? (
                <div className="items-list">
                  {vendaAtual.itens.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-info">
                        <div className="item-name">{item.nomeProduto}</div>
                        <div className="item-details">
                          <span className="item-qty">{item.quantidade}x</span>
                          <span className="item-price">R$ {item.precoUnitario.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="item-actions">
                        <span className="item-total">R$ {item.subtotal.toFixed(2)}</span>
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
                  <p>🍽️ Nenhum item no pedido</p>
                </div>
              )}
            </div>
          </div>

          {/* Totais e Ações */}
          <div className="pdv-section totals-actions">
            <div className="totals">
              <div className="discount-input">
                <label>Desconto (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                />
              </div>
              
              <div className="totals-display">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>R$ {vendaAtual ? vendaAtual.subtotal.toFixed(2) : '0.00'}</span>
                </div>
                {desconto > 0 && (
                  <div className="total-row discount">
                    <span>Desconto ({desconto}%):</span>
                    <span>-R$ {vendaAtual ? (vendaAtual.subtotal * desconto / 100).toFixed(2) : '0.00'}</span>
                  </div>
                )}
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span>R$ {vendaAtual ? (vendaAtual.subtotal * (1 - desconto / 100)).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={iniciarNovaVenda}
                className="btn btn-new"
                disabled={loading}
              >
                🆕 Nova Venda
              </button>
              
              <button 
                onClick={salvarVenda}
                className="btn btn-save"
                disabled={loading || !vendaAtual || !vendaAtual.itens?.length}
              >
                💾 Salvar
              </button>
              
              <button 
                onClick={finalizarVenda}
                className="btn btn-finalize"
                disabled={loading || !vendaAtual || !vendaAtual.itens?.length}
              >
                ✅ Finalizar
              </button>
              
              <button 
                onClick={cancelarVenda}
                className="btn btn-cancel"
                disabled={loading || !vendaAtual}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* Painel Direito - Produtos */}
        <div className="pdv-right-panel">
          {/* Categorias */}
          <div className="categorias-section">
            <h3>🍽️ Categorias</h3>
            <div className="categorias-grid">
              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  className={`categoria-btn ${categoriaSelecionada === categoria.id ? 'active' : ''}`}
                  onClick={() => setCategoriaSelecionada(categoria.id)}
                >
                  <span className="categoria-icon">{categoria.icon}</span>
                  <span className="categoria-nome">{categoria.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Busca */}
          <div className="busca-section">
            <input
              type="text"
              placeholder="🔍 Buscar produto..."
              value={buscarProduto}
              onChange={(e) => setBuscarProduto(e.target.value)}
              className="busca-input"
            />
          </div>

          {/* Lista de Produtos */}
          <div className="produtos-section">
            <div className="produtos-lista">
              {produtosFiltrados.map(produto => (
                <div key={produto._id} className="produto-item">
                  <div className="produto-detalhes">
                    <div className="produto-nome">{produto.nome}</div>
                    <div className="produto-descricao">{produto.descricao || 'Sem descrição'}</div>
                    <div className="produto-info-linha">
                      <span className="produto-unidade">Unidade: {produto.unidade || 'UN'}</span>
                      <span className="produto-preco">R$ {produto.precoVenda.toFixed(2)}</span>
                    </div>
                    {produto.quantidade <= 5 && (
                      <div className="produto-estoque-baixo">Estoque baixo: {produto.quantidade}</div>
                    )}
                  </div>
                  <div className="produto-acoes">
                    <button 
                      onClick={() => removerItemProduto(produto)}
                      className="produto-btn produto-btn-remover"
                      disabled={!vendaAtual || !vendaAtual.itens?.find(item => item.produto._id === produto._id)}
                    >
                      ➖
                    </button>
                    <span className="produto-quantidade">
                      {vendaAtual?.itens?.find(item => item.produto._id === produto._id)?.quantidade || 0}
                    </span>
                    <button 
                      onClick={() => adicionarItem(produto)}
                      className="produto-btn produto-btn-adicionar"
                      disabled={produto.quantidade === 0}
                    >
                      ➕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {produtosFiltrados.length === 0 && (
              <div className="no-products">
                <p>🔍 Nenhum produto encontrado</p>
              </div>
            )}
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




    </div>
  );
};

export default PDV;