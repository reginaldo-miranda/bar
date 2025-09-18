import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mesas.css';

const Mesas = () => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [buscarProduto, setBuscarProduto] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [vendaAtual, setVendaAtual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalNovaMesa, setModalNovaMesa] = useState(false);
  const [modalAbrirMesa, setModalAbrirMesa] = useState(false);
  const [novaMesa, setNovaMesa] = useState({
    numero: '',
    nome: '',
    capacidade: 4,
    tipo: 'interna',
    observacoes: ''
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mesaParaAbrir, setMesaParaAbrir] = useState(null);

  useEffect(() => {
    carregarMesas();
  }, []);

  const carregarDados = async () => {
    await Promise.all([
      carregarMesas(),
      carregarProdutos()
    ]);
  };

  const carregarMesas = async () => {
    try {
      // Carregar mesas
      const mesasResponse = await fetch('http://localhost:4000/api/mesa/list');
      const mesasData = await mesasResponse.json();
      
      // Carregar vendas abertas
      const vendasResponse = await fetch('http://localhost:4000/api/sale/list');
      const vendasData = await vendasResponse.json();
      
      // Associar vendas às mesas
      const mesasComVendas = mesasData.map(mesa => {
        const vendaAberta = vendasData.find(venda => 
          venda.status === 'aberta' && venda.mesa === mesa._id
        );
        
        return {
          ...mesa,
          vendaAtual: vendaAberta || mesa.vendaAtual,
          status: vendaAberta ? 'ocupada' : mesa.status
        };
      });
      
      setMesas(mesasComVendas);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    }
  };

  const carregarProdutos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/product/list');
      const data = await response.json();
      setProdutos(data);
      
      // Extrair categorias únicas dos produtos
      const categoriasUnicas = [...new Set(data
        .map(produto => produto.grupo)
        .filter(grupo => grupo && grupo.trim() !== '')
      )];
      
      // Mapear ícones para categorias
      const iconesPorGrupo = {
        'bebidas': '🍺',
        'comidas': '🍽️',
        'sobremesas': '🍰',
        'petiscos': '🍿',
        'pratos': '🍖',
        'lanches': '🥪',
        'default': '📦'
      };
      
      const categoriasComIcones = categoriasUnicas.map(categoria => ({
        id: categoria,
        nome: categoria.charAt(0).toUpperCase() + categoria.slice(1),
        icon: iconesPorGrupo[categoria.toLowerCase()] || iconesPorGrupo.default
      }));
      
      setCategorias([{ id: 'todas', nome: 'Todas', icon: '🍽️' }, ...categoriasComIcones]);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const criarNovaMesa = async () => {
    if (!novaMesa.numero.trim()) {
      setErro('Número da mesa é obrigatório');
      return;
    }
    if (!novaMesa.nome.trim()) {
      setErro('Nome da mesa é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/mesa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaMesa)
      });

      if (response.ok) {
        setModalNovaMesa(false);
        setNovaMesa({ numero: '', nome: '', capacidade: 4, tipo: 'interna', observacoes: '' });
        setSucesso('Mesa criada com sucesso!');
        carregarMesas();
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao criar mesa');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const abrirMesa = async (mesa) => {
    try {
      // Buscar vendas da mesa específica
      const response = await fetch(`http://localhost:4000/api/sale/list`);
      const vendas = await response.json();
      
      // Encontrar venda aberta desta mesa específica
      const vendaAberta = vendas.find(venda => 
        venda.status === 'aberta' && venda.mesa === mesa._id
      );
      
      if (vendaAberta) {
        setMesaSelecionada(mesa._id);
        setVendaAtual(vendaAberta);
        carregarProdutos();
      } else {
        // Se não há venda aberta, abrir modal para criar nova venda
        setMesaParaAbrir(mesa);
        setModalAbrirMesa(true);
        
        // Carregar funcionários
        const funcResponse = await fetch('http://localhost:4000/api/employee/list');
        const funcionariosData = await funcResponse.json();
        setFuncionarios(funcionariosData);
      }
    } catch (error) {
      setErro('Erro ao abrir mesa');
    }
  };

  const confirmarAbrirMesa = async (mesa) => {
    setMesaParaAbrir(mesa);
    setModalAbrirMesa(true);
    
    // Carregar funcionários
    try {
      const funcResponse = await fetch('http://localhost:4000/api/employee/list');
      const funcionariosData = await funcResponse.json();
      setFuncionarios(funcionariosData);
    } catch (error) {
      setErro('Erro ao carregar funcionários');
    }
  };

  const executarAbrirMesa = async () => {
    if (!funcionarioSelecionado) {
      setErro('Selecione um funcionário responsável');
      return;
    }

    setLoading(true);
    try {
      // Criar nova venda
      const dadosVenda = {
        mesa: mesaParaAbrir._id,
        funcionario: funcionarioSelecionado,
        observacoes: observacoes ? `Responsavel: ${funcionarios.find(f => f._id === funcionarioSelecionado)?.nome || ''} - ${observacoes}` : `Responsavel: ${funcionarios.find(f => f._id === funcionarioSelecionado)?.nome || ''}`,
        status: 'aberta',
        itens: [],
        subtotal: 0,
        total: 0
      };

      const response = await fetch('http://localhost:4000/api/sale/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosVenda)
      });

      if (response.ok) {
        const vendaCriada = await response.json();
        setMesaSelecionada(mesaParaAbrir._id);
        setVendaAtual(vendaCriada);
        setModalAbrirMesa(false);
        setFuncionarioSelecionado('');
        setObservacoes('');
        setSucesso('Mesa aberta com sucesso!');
        setTimeout(() => setSucesso(''), 2000);
        carregarProdutos();
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao abrir mesa');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const fecharMesa = async (mesaId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'fechada' })
      });

      if (response.ok) {
        setMesaSelecionada(null);
        setVendaAtual(null);
        carregarMesas();
        setTimeout(() => setSucesso(''), 3000);
      }
    } catch (error) {
      setErro('Erro ao fechar mesa');
    }
  };

  const adicionarItem = (produto) => {
    // Implementar lógica de adicionar item
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = categoriaSelecionada === 'todas' || produto.grupo === categoriaSelecionada;
    const matchBusca = produto.nome.toLowerCase().includes(buscarProduto.toLowerCase());
    return matchCategoria && matchBusca;
  });

  return (
    <div className="mesas-container">
      <div className="mesas-header">
        <h2>🍽️ Gerenciamento de Mesas</h2>
        <div className="header-actions">
          <button 
            className="btn-nova-mesa"
            onClick={() => setModalNovaMesa(true)}
          >
            ➕ Nova Mesa
          </button>
          <button 
            className="btn-voltar"
            onClick={() => navigate('/pdv')}
          >
            ← Voltar ao PDV
          </button>
        </div>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}
      {sucesso && <div className="sucesso-msg">{sucesso}</div>}

      <div className="mesas-layout">
        <div className="mesas-lista">
          <div className="mesas-section">
            <h3>Todas as Mesas ({mesas.length})</h3>
            <div className="mesas-grid">
              {mesas
                .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                .map(mesa => {
                  const mesaSelecionadaAtual = mesaSelecionada === mesa._id;
                  
                  // Detectar se a mesa está ocupada
                  const mesaOcupada = (mesa.status === 'ocupada') || 
                    (mesa.vendaAtual && mesa.vendaAtual.status === 'aberta') ||
                    (mesa.vendaAtual && mesa.vendaAtual.observacoes && mesa.vendaAtual.observacoes.includes('Responsavel:'));
                  
                  // Extrair nome do responsável
                  let nomeResponsavel = null;
                  if (mesa.vendaAtual && mesa.vendaAtual.observacoes) {
                    const observacoes = mesa.vendaAtual.observacoes;
                    if (observacoes.includes('Responsavel:')) {
                      nomeResponsavel = observacoes.replace('Responsavel:', '').replace('Responsavel: ', '').trim();
                    }
                  }
                  
                  return (
                    <div 
                      key={mesa._id} 
                      className={`mesa-card ${mesaOcupada ? 'ocupada' : 'livre'} ${mesaSelecionadaAtual ? 'selected' : ''}`}
                    >
                      <div className="mesa-info">
                        <div 
                          className="mesa-detalhes"
                          onClick={() => mesaOcupada ? abrirMesa(mesa) : confirmarAbrirMesa(mesa)}
                        >
                          <div className="mesa-numero">Mesa {mesa.numero}</div>
                          <div className="mesa-nome">{mesa.nome}</div>
                          <div className="mesa-tipo">{mesa.tipo}</div>
                          <div className="mesa-capacidade">👥 {mesa.capacidade}</div>
                          <div className={`mesa-status-badge ${mesaOcupada ? 'ocupada' : 'livre'}`}>
                            {mesaOcupada ? '🔴 OCUPADA' : '🟢 LIVRE'}
                          </div>
                          {mesaOcupada && nomeResponsavel && (
                             <div className="mesa-responsavel">
                               👤 RESPONSAVEL: {nomeResponsavel.toUpperCase()}
                             </div>
                           )}
                          {mesa.observacoes && (
                            <div className="mesa-observacoes">{mesa.observacoes}</div>
                          )}
                        </div>
                        {mesaSelecionadaAtual && mesaOcupada && (
                          <button
                            className="btn-fechar-mesa"
                            onClick={(e) => {
                              e.stopPropagation();
                              fecharMesa(mesa._id);
                            }}
                            title="Fechar mesa"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              }
              
              {mesas.length === 0 && (
                <div className="sem-mesas">
                  <p>🪑 Nenhuma mesa cadastrada</p>
                  <p>Crie uma nova mesa para começar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="produtos-area">
          {vendaAtual ? (
            <>
              <div className="mesa-selecionada">
                <div className="mesa-info-header">
                  <div>
                    <h3>Mesa: {mesas.find(m => m._id === mesaSelecionada)?.numero} - {mesas.find(m => m._id === mesaSelecionada)?.nome}</h3>
                    <p>Total: R$ {vendaAtual.total?.toFixed(2) || '0,00'}</p>
                  </div>
                  <button
                    className="btn-fechar-mesa-fixo"
                    onClick={() => fecharMesa(mesaSelecionada)}
                    title="Fechar mesa"
                  >
                    ✅ Fechar Mesa
                  </button>
                </div>
              </div>

              <div className="produtos-filtros">
                <div className="categorias-chips">
                  {categorias.map(categoria => (
                    <button
                      key={categoria.id}
                      className={`categoria-chip ${categoriaSelecionada === categoria.id ? 'ativo' : ''}`}
                      onClick={() => setCategoriaSelecionada(categoria.id)}
                    >
                      {categoria.icon} {categoria.nome}
                    </button>
                  ))}
                </div>

                <div className="busca-produto">
                  <input
                    type="text"
                    placeholder="🔍 Buscar produto..."
                    value={buscarProduto}
                    onChange={(e) => setBuscarProduto(e.target.value)}
                    className="input-busca"
                  />
                </div>
              </div>

              <div className="produtos-grid">
                {produtosFiltrados.map(produto => (
                  <div 
                    key={produto._id} 
                    className="produto-card"
                    onClick={() => adicionarItem(produto)}
                  >
                    <div className="produto-nome">{produto.nome}</div>
                    <div className="produto-preco">R$ {produto.precoVenda?.toFixed(2)}</div>
                    <div className="produto-grupo">{produto.grupo}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="selecione-mesa">
              <h3>Selecione uma mesa para adicionar produtos</h3>
              <p>Clique em uma mesa da lista ao lado para começar</p>
            </div>
          )}
        </div>
      </div>

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
                  placeholder="Ex: 1, 2, 3..."
                />
              </div>
              <div className="form-group">
                <label>Nome da Mesa:</label>
                <input
                  type="text"
                  value={novaMesa.nome}
                  onChange={(e) => setNovaMesa({...novaMesa, nome: e.target.value})}
                  placeholder="Ex: Mesa Principal, Varanda..."
                />
              </div>
              <div className="form-group">
                <label>Capacidade:</label>
                <input
                  type="number"
                  value={novaMesa.capacidade}
                  onChange={(e) => setNovaMesa({...novaMesa, capacidade: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={novaMesa.tipo}
                  onChange={(e) => setNovaMesa({...novaMesa, tipo: e.target.value})}
                >
                  <option value="interna">Mesa Interna</option>
                  <option value="externa">Mesa Externa</option>
                  <option value="vip">Mesa VIP</option>
                  <option value="reservada">Mesa Reservada</option>
                  <option value="balcao">Balcão</option>
                </select>
              </div>
              <div className="form-group">
                <label>Observações:</label>
                <textarea
                  value={novaMesa.observacoes}
                  onChange={(e) => setNovaMesa({...novaMesa, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
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

      {modalAbrirMesa && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🍽️ Abrir Mesa {mesaParaAbrir?.numero}</h3>
              <button 
                className="modal-close"
                onClick={() => setModalAbrirMesa(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Funcionário Responsável:</label>
                <select
                  value={funcionarioSelecionado}
                  onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                >
                  <option value="">Selecione um funcionário</option>
                  {funcionarios.map(funcionario => (
                    <option key={funcionario._id} value={funcionario._id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Observações:</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre a mesa..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setModalAbrirMesa(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-abrir-mesa"
                onClick={executarAbrirMesa}
                disabled={loading}
              >
                {loading ? 'Abrindo...' : '🍽️ Abrir Mesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mesas;