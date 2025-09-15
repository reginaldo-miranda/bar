import React, { useState, useEffect } from 'react';
import './PDV.css';

const PDV = () => {
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
  const [quantidade, setQuantidade] = useState(1);
  const [buscarProduto, setBuscarProduto] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [categorias, setCategorias] = useState([
    { id: 'todos', nome: 'Todos', icon: '🍽️' }
  ]);
  
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
    } catch {
      console.error('Erro ao carregar funcionários');
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
        
        // Criar categorias baseadas nos grupos dos produtos
        const gruposUnicos = [...new Set(
          produtosAtivos.map(produto => produto.grupo).filter(Boolean)
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

  // Função para adicionar produto com quantidade específica (similar à comanda)
  const adicionarItem = (produto) => {
    const produtoExistente = produtosSelecionados.find(p => p.id === produto.id);
    if (produtoExistente) {
      setProdutosSelecionados(produtosSelecionados.map(p => 
        p.id === produto.id 
          ? { ...p, quantidade: p.quantidade + quantidade }
          : p
      ));
    } else {
      setProdutosSelecionados([...produtosSelecionados, { ...produto, quantidade: quantidade }]);
    }
    setSucesso(`${produto.nome} adicionado (${quantidade}x)!`);
    setTimeout(() => setSucesso(''), 2000);
  };



  // Função para limpar venda
  const limparVenda = () => {
    setProdutosSelecionados([]);
    setDesconto(0);
    setQuantidade(1);
    setBuscarProduto('');
    setCategoriaSelecionada('todos');
  };

  // Filtrar produtos baseado na categoria e busca
  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = categoriaSelecionada === 'todos' || produto.grupo === categoriaSelecionada;
    const matchBusca = produto.nome.toLowerCase().includes(buscarProduto.toLowerCase());
    return matchCategoria && matchBusca;
  });

  // Função para calcular subtotal
  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((total, produto) => {
      return total + ((produto.preco || 0) * (produto.quantidade || 1));
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

  // Função para calcular total simples (compatibilidade)
  const calcularTotalSimples = () => {
    return calcularTotalFinal();
  };

  const finalizarVendaBalcaoSimples = async () => {
    if (!funcionarioBalcao) {
      setErro('Selecione um funcionário para finalizar a venda');
      return;
    }

    if (produtosSelecionados.length === 0) {
      setErro('Selecione pelo menos um produto para finalizar a venda');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const vendaData = {
        funcionario_id: funcionarioBalcao,
        cliente_id: null,
        tipo: 'balcao',
        desconto: desconto,
        total: calcularTotalSimples(),
        itens: produtosSelecionados.map(produto => ({
          produto_id: produto.id,
          quantidade: produto.quantidade || 1,
          preco_unitario: produto.preco,
          subtotal: (produto.preco || 0) * (produto.quantidade || 1)
        }))
      };

      const response = await fetch('http://localhost:4000/api/sale/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendaData)
      });

      if (response.ok) {
        setSucesso('Venda finalizada com sucesso!');
        setProdutosSelecionados([]);
        setDesconto(0);
        setFuncionarioBalcao('');
        
        // Limpar mensagem de sucesso após 3 segundos
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



          {/* Botões de Ação Principal */}
          <div className="pdv-section">
            <div className="action-buttons-main">
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
            
            {/* Total */}
            <div className="totals">
              <div className="totals-display">
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span>R$ {vendaAtual ? vendaAtual.subtotal.toFixed(2) : '0.00'}</span>
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito - Venda Balcão */}
        <div className="pdv-right-panel">
          <div className="venda-balcao-nova">
            <div className="venda-header">
              <h2>💰 Ponto de Venda</h2>
              <div className="funcionario-select">
                <select
                   value={funcionarioBalcao}
                   onChange={(e) => setFuncionarioBalcao(e.target.value)}
                   className="select-funcionario-novo"
                 >
                   <option value="">Selecionar Funcionário</option>
                   {funcionarios.map((funcionario) => (
                     <option key={funcionario._id} value={funcionario._id}>
                       {funcionario.nome}
                     </option>
                   ))}
                 </select>
              </div>
            </div>

            {/* Filtros de categoria */}
            <div className="filtros-categoria">
              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  className={`btn-categoria ${categoriaSelecionada === categoria.id ? 'ativo' : ''}`}
                  onClick={() => setCategoriaSelecionada(categoria.id)}
                >
                  <span className="categoria-icon">{categoria.icon}</span>
                  <span className="categoria-nome">{categoria.nome}</span>
                </button>
              ))}
            </div>

            {/* Busca de produtos e controle de quantidade */}
            <div className="busca-produtos">
              <div className="busca-input-group">
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={buscarProduto}
                  onChange={(e) => setBuscarProduto(e.target.value)}
                  className="input-busca"
                />
                <div className="quantidade-controls">
                  <label>Qtd:</label>
                  <button 
                    className="btn-qtd" 
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  >
                    -
                  </button>
                  <span className="quantidade-display">{quantidade}</span>
                  <button 
                    className="btn-qtd" 
                    onClick={() => setQuantidade(quantidade + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Grade de Produtos */}
            <div className="produtos-grid-container">
              <div className="produtos-grid">
                {produtosFiltrados.map(produto => {
                  const produtoSelecionado = produtosSelecionados.find(p => p.id === produto.id);
                  const quantidadeSelecionada = produtoSelecionado ? produtoSelecionado.quantidade || 1 : 0;
                  return (
                    <div key={produto.id} className="produto-card">
                      <div className="produto-card-header">
                        <h4>{produto.nome}</h4>
                        <span className="produto-preco">R$ {produto.preco ? produto.preco.toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="produto-card-body">
                        <p className="produto-descricao">{produto.descricao}</p>
                        <p className="produto-grupo">{produto.grupo}</p>
                        {quantidadeSelecionada > 0 && (
                          <div className="produto-selecionado">
                            <span>Selecionado: {quantidadeSelecionada}x</span>
                          </div>
                        )}
                        <button 
                          className="btn-adicionar-item"
                          onClick={() => adicionarItem(produto)}
                        >
                          Adicionar ({quantidade}x)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>



            {/* Botões de Ação */}
            <div className="acoes-panel">
              <button
                onClick={limparVenda}
                className="btn-limpar"
                disabled={produtosSelecionados.length === 0}
              >
                🗑️ Limpar
              </button>
              <button
                onClick={finalizarVendaBalcaoSimples}
                disabled={loading || produtosSelecionados.length === 0 || !funcionarioBalcao}
                className="btn-finalizar-novo"
              >
                {loading ? '⏳ Finalizando...' : '✅ Finalizar Venda'}
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




    </div>
  );
};

export default PDV;