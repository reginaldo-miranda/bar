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
  const [buscarMesa, setBuscarMesa] = useState('');
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
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');
  const [modalProdutosMesa, setModalProdutosMesa] = useState(false);
  const [mesaProdutos, setMesaProdutos] = useState(null);
  const [modalUpdateKey, setModalUpdateKey] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [mesaParaAbrir, setMesaParaAbrir] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  // Recarregar dados quando a página volta a ser focada (retorno do caixa)
  useEffect(() => {
    const handleFocus = () => {
      carregarDados();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
        
        // Usar o status do banco de dados diretamente
        // O backend é responsável por manter a consistência
        return {
          ...mesa,
          vendaAtual: vendaAberta || null
          // status mantém o valor original do banco
        };
      });
      
      console.log('Mesas carregadas:', mesasComVendas);
      console.log('Vendas abertas:', vendasData.filter(v => v.status === 'aberta'));
      
      setMesas(mesasComVendas);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      setErro('Erro ao carregar mesas. Verifique se o servidor está rodando.');
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
    } catch {
      console.error('Erro ao carregar produtos');
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
        // Aguardar um pouco antes de recarregar para garantir que o servidor processou
        setTimeout(() => {
          carregarMesas();
        }, 500);
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao criar mesa');
      }
    } catch {
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
    } catch {
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
    } catch {
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
        observacoes: observacoes ? `Responsavel: ${responsavelSelecionado || funcionarios.find(f => f._id === funcionarioSelecionado)?.nome || ''} - ${observacoes}` : `Responsavel: ${responsavelSelecionado || funcionarios.find(f => f._id === funcionarioSelecionado)?.nome || ''}`,
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
        setResponsavelSelecionado('');
        setObservacoes('');
        setSucesso('Mesa aberta com sucesso!');
        setTimeout(() => setSucesso(''), 2000);
        // Recarregar mesas para atualizar o status
        setTimeout(() => {
          carregarMesas();
        }, 500);
        carregarProdutos();
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao abrir mesa');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const fecharMesa = (mesa) => {
    if (!vendaAtual) {
      setErro('Nenhuma venda ativa para fechar');
      return;
    }

    if (!vendaAtual.itens || vendaAtual.itens.length === 0) {
      setErro('Adicione pelo menos um item antes de fechar a mesa');
      return;
    }

    // Navegar para o caixa com os dados da mesa, igual às comandas
    navigate('/caixa', { 
      state: { 
        comanda: vendaAtual, 
        origem: '/mesas',
        mesa: mesa 
      } 
    });
  };

  const adicionarItem = async (produto) => {
    if (!vendaAtual || !mesaSelecionada) {
      setErro('Selecione uma mesa primeiro');
      return;
    }

    try {
      setLoading(true);
      
      const novoItem = {
        produtoId: produto._id,
        quantidade: 1
      };

      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoItem)
      });

      if (response.ok) {
        const vendaAtualizada = await response.json();
        setVendaAtual(vendaAtualizada);
        
        // Atualizar mesaProdutos se o modal estiver aberto para esta mesa
        if (modalProdutosMesa && mesaProdutos && mesaProdutos._id === mesaSelecionada) {
          setMesaProdutos({...mesaProdutos, vendaAtual: vendaAtualizada});
          setModalUpdateKey(prev => prev + 1);
        }
        
        setSucesso(`${produto.nome} adicionado à venda`);
        setTimeout(() => setSucesso(''), 3000);
      } else {
        throw new Error('Erro ao adicionar item');
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      setErro('Erro ao adicionar item à venda');
      setTimeout(() => setErro(''), 3000);
    } finally {
       setLoading(false);
     }
    };

  const removerItem = async (produto) => {
    if (!vendaAtual) {
      setErro('Nenhuma venda ativa');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item/${produto._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const vendaAtualizada = await response.json();
        setVendaAtual(vendaAtualizada);
        
        // Atualizar mesaProdutos se o modal estiver aberto para esta mesa
        if (modalProdutosMesa && mesaProdutos && mesaProdutos._id === mesaSelecionada) {
          setMesaProdutos({...mesaProdutos, vendaAtual: vendaAtualizada});
          setModalUpdateKey(prev => prev + 1);
        }
        
        setSucesso(`${produto.nome} removido da venda`);
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao remover item');
        setTimeout(() => setErro(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setErro('Erro ao remover item da venda');
      setTimeout(() => setErro(''), 3000);
    } finally {
      setLoading(false);
    }
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
            className="btn-voltar-pdv"
            onClick={() => navigate('/pdv')}
          >
            ← Voltar ao PDV
          </button>
        </div>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}
      {sucesso && <div className="sucesso-msg">{sucesso}</div>}

      <div className="mesas-layout">
        {/* Painel Esquerdo - Mesas e Itens Selecionados */}
        <div className="mesas-lista">
          <div className="mesas-section">
            <h3>Todas as Mesas ({mesas.length})</h3>
            <div className="buscar-mesa-container">
              <input
                type="text"
                className="buscar-mesa-input"
                placeholder="🔍 Buscar mesa por número ou responsável..."
                value={buscarMesa}
                onChange={(e) => setBuscarMesa(e.target.value)}
              />
            </div>
            <div className="mesas-grid">
              {mesas
                .filter(mesa => {
                  if (!buscarMesa) return true;
                  const termoBusca = buscarMesa.toLowerCase();
                  
                  // Buscar por número da mesa
                  if (mesa.numero.toString().includes(termoBusca)) return true;
                  
                  // Buscar por responsável (se a mesa estiver ocupada)
                  if (mesa.vendaAtual && mesa.vendaAtual.observacoes && mesa.vendaAtual.observacoes.includes('Responsavel:')) {
                    const responsavel = mesa.vendaAtual.observacoes.includes(' - ') 
                      ? mesa.vendaAtual.observacoes.split('Responsavel:')[1].split(' - ')[0].trim().toLowerCase()
                      : mesa.vendaAtual.observacoes.split('Responsavel:')[1].trim().toLowerCase();
                    if (responsavel && responsavel.includes(termoBusca)) return true;
                  }
                  
                  return false;
                })
                .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                .map(mesa => {
                  const mesaSelecionadaAtual = mesaSelecionada === mesa._id;
                  
                  // Detectar se a mesa está ocupada
                  const mesaOcupada = (mesa.status === 'ocupada') || 
                    (mesa.vendaAtual && mesa.vendaAtual.status === 'aberta') ||
                    (mesa.vendaAtual && mesa.vendaAtual.observacoes && mesa.vendaAtual.observacoes.includes('Responsavel:'));
                  

                  
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
                          <div className="mesa-numero">
                            <span>Mesa: {mesa.numero}</span>
                            {mesaOcupada && (
                              <div className="mesa-acoes">
                                <button
                                  className="btn-ver-produtos"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      // Buscar a venda atual da mesa
                                      const response = await fetch(`http://localhost:4000/api/sale/list`);
                                      const vendas = await response.json();
                                      const vendaAtual = vendas.find(venda => 
                                        venda.status === 'aberta' && venda.mesa === mesa._id
                                      );
                                      
                                      if (vendaAtual) {
                                        setMesaProdutos({...mesa, vendaAtual});
                                        setModalProdutosMesa(true);
                                      } else {
                                        setErro('Nenhuma venda ativa encontrada para esta mesa');
                                        setTimeout(() => setErro(''), 3000);
                                      }
                                    } catch (error) {
                                      console.error('Erro ao buscar venda da mesa:', error);
                                      setErro('Erro ao carregar dados da mesa');
                                      setTimeout(() => setErro(''), 3000);
                                    }
                                  }}
                                  title="Ver produtos"
                                >
                                  📋
                                </button>
                                {mesaSelecionadaAtual && (
                                  <button
                                    className="btn-fechar-mesa"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fecharMesa(mesa);
                                    }}
                                    title="Fechar mesa"
                                  >
                                    ✅
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {mesaOcupada ? (
                            <>
                              <div className="mesa-funcionario">Func: {mesa.vendaAtual && mesa.vendaAtual.funcionario ? (mesa.vendaAtual.funcionario.nome || mesa.vendaAtual.funcionario) : 'Não definido'}</div>
                              <div className="mesa-responsavel">Resp: {mesa.vendaAtual && mesa.vendaAtual.observacoes && mesa.vendaAtual.observacoes.includes('Responsavel:') ? (
                                mesa.vendaAtual.observacoes.includes(' - ') 
                                  ? mesa.vendaAtual.observacoes.split('Responsavel:')[1].split(' - ')[0].trim()
                                  : mesa.vendaAtual.observacoes.split('Responsavel:')[1].trim()
                              ) : 'Não definido'}</div>
                              <div className={`mesa-status-badge ocupada`}>
                                Status: OCUPADA
                              </div>
                            </>
                          ) : (
                            <div className={`mesa-status-badge livre`}>
                              Status: LIVRE
                            </div>
                          )}
                        </div>

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

          {/* Área de Itens Selecionados */}
          {vendaAtual && (
            <div className="itens-selecionados">
              <div className="itens-lista">
                <h4>Itens da Venda</h4>
                {vendaAtual.itens && vendaAtual.itens.length > 0 ? (
                  <div className="itens-grid">
                    {vendaAtual.itens.map((item, index) => (
                      <div key={index} className="item-venda">
                        <div className="item-nome">{item.nomeProduto}</div>
                        <div className="item-quantidade">Qtd: <strong>{item.quantidade}</strong></div>
                        <div className="item-preco">R$ {item.subtotal?.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sem-itens">
                    <p>Nenhum item adicionado</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito - Produtos */}
        <div className="produtos-area">
          {/* Área de Finalização */}
          {vendaAtual && (
            <div className="mesa-finalizacao" style={{backgroundColor: '#27ae60', padding: '15px', borderRadius: '8px'}}>
              <div className="mesa-info-header">
                  <div>
                    <h3 style={{color: 'white', margin: '0 0 10px 0'}}>Mesa: {mesas.find(m => m._id === mesaSelecionada)?.numero} - {mesas.find(m => m._id === mesaSelecionada)?.nome}</h3>
                    {vendaAtual.observacoes && vendaAtual.observacoes.includes(' - ') && (
                      <p style={{color: 'white', margin: '0 0 5px 0', fontSize: '14px'}}>👤 Responsável: {vendaAtual.observacoes.split(' - ')[1]?.trim().toUpperCase() || ''}</p>
                    )}
                    {vendaAtual.funcionario && (
                      <p style={{color: 'white', margin: '0 0 5px 0', fontSize: '14px'}}>👨‍💼 Funcionário: {funcionarios.find(f => f._id === vendaAtual.funcionario)?.nome?.toUpperCase() || vendaAtual.funcionario?.nome?.toUpperCase() || 'NÃO DEFINIDO'}</p>
                    )}
                    <p style={{color: 'white', margin: '0'}}>Total: R$ {vendaAtual.total?.toFixed(2) || '0,00'}</p>
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
          )}
          
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
              >
                <div className="produto-nome">{produto.nome}</div>
                <div className="produto-preco">R$ {produto.precoVenda?.toFixed(2)}</div>
                <div className="produto-botoes">
                  <button 
                    className="btn-remover-produto"
                    onClick={() => removerItem(produto)}
                    disabled={!vendaAtual}
                  >
                    -
                  </button>
                  <button 
                    className="btn-adicionar-produto"
                    onClick={() => adicionarItem(produto)}
                    disabled={!vendaAtual}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!vendaAtual && (
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
                <label>Nome do Responsável (opcional):</label>
                <input
                  type="text"
                  value={responsavelSelecionado}
                  onChange={(e) => setResponsavelSelecionado(e.target.value)}
                  placeholder="Digite o nome do responsável..."
                />
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

      {/* Modal de Produtos da Mesa */}
      {modalProdutosMesa && mesaProdutos && (
        <div className="modal-overlay">
          <div className="modal-content modal-produtos" key={`modal-${mesaProdutos.vendaAtual?._id}-${modalUpdateKey}`}>
            <div className="modal-header" style={{backgroundColor: '#27ae60', padding: '15px', borderRadius: '8px 8px 0 0'}}>
              <div className="mesa-info-header">
                <div>
                  <h3 style={{color: 'white', margin: '0 0 10px 0'}}>📋 Produtos da Mesa {mesaProdutos.numero}</h3>
                  {mesaProdutos.vendaAtual?.funcionario && (
                    <p style={{color: 'white', margin: '0 0 5px 0', fontSize: '14px'}}>👨‍💼 Funcionário: {mesaProdutos.vendaAtual.funcionario?.nome?.toUpperCase() || mesaProdutos.vendaAtual.funcionario?.toUpperCase() || 'NÃO DEFINIDO'}</p>
                  )}
                  {mesaProdutos.vendaAtual?.observacoes && mesaProdutos.vendaAtual.observacoes.includes(' - ') && (
                    <p style={{color: 'white', margin: '0 0 5px 0', fontSize: '14px'}}>👤 Responsável: {mesaProdutos.vendaAtual.observacoes.split(' - ')[1]?.trim().toUpperCase() || ''}</p>
                  )}
                  <p style={{color: 'white', margin: '0', fontSize: '18px', fontWeight: 'bold'}}>Total: R$ {mesaProdutos.vendaAtual?.total?.toFixed(2) || '0,00'}</p>
                </div>
                <button 
                  className="modal-close"
                  onClick={() => setModalProdutosMesa(false)}
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="produtos-lista">
                <h4>Produtos Adicionados ({mesaProdutos.vendaAtual?.itens?.length || 0})</h4>
                {mesaProdutos.vendaAtual?.itens && mesaProdutos.vendaAtual.itens.length > 0 ? (
                  <div className="itens-mesa-lista">
                    {mesaProdutos.vendaAtual.itens.map((item, index) => (
                      <div key={`${item.produto}-${index}-${item.quantidade}`} className="item-mesa-linha">
                        <div className="item-nome">{item.nomeProduto}</div>
                        <div className="item-preco">R$ {item.precoUnitario?.toFixed(2)}</div>
                        <div className="item-quantidade">Qtd: <strong>{item.quantidade}</strong></div>
                        <div className="item-subtotal">Subtotal: R$ {item.subtotal?.toFixed(2)}</div>
                        <div className="item-acoes">
                          <button 
                            className="btn-adicionar-item"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                
                                const novoItem = {
                                  produtoId: item.produto,
                                  quantidade: 1
                                };
                        
                                const response = await fetch(`http://localhost:4000/api/sale/${mesaProdutos.vendaAtual._id}/item`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify(novoItem)
                                });
                        
                                if (response.ok) {
                                   // Atualizar os dados da mesa no modal
                                   const responseList = await fetch(`http://localhost:4000/api/sale/list`);
                                   const vendas = await responseList.json();
                                   const vendaAtualizada = vendas.find(v => v._id === mesaProdutos.vendaAtual._id);
                                   setMesaProdutos({...mesaProdutos, vendaAtual: vendaAtualizada});
                                   // Atualizar vendaAtual se for a mesa selecionada
                                   if (mesaSelecionada === mesaProdutos._id) {
                                     setVendaAtual(vendaAtualizada);
                                   }
                                   // Forçar re-renderização do modal
                                   setModalUpdateKey(prev => prev + 1);
                                   // Atualizar as mesas na tela principal
                                   carregarMesas();
                                   setSucesso(`${item.nomeProduto} adicionado à venda`);
                                   setTimeout(() => setSucesso(''), 3000);
                                } else {
                                  const errorData = await response.json();
                                  setErro(errorData.error || 'Erro ao adicionar item');
                                  setTimeout(() => setErro(''), 3000);
                                }
                              } catch (error) {
                                console.error('Erro ao adicionar item:', error);
                                setErro('Erro ao adicionar item à venda');
                                setTimeout(() => setErro(''), 3000);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            title="Adicionar mais uma unidade"
                            disabled={loading}
                          >
                            ➕
                          </button>
                          <button 
                            className="btn-remover-item"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                
                                const response = await fetch(`http://localhost:4000/api/sale/${mesaProdutos.vendaAtual._id}/item/${item.produto}`, {
                                  method: 'DELETE'
                                });
                        
                                if (response.ok) {
                                   // Atualizar os dados da mesa no modal
                                   const responseList = await fetch(`http://localhost:4000/api/sale/list`);
                                   const vendas = await responseList.json();
                                   const vendaAtualizada = vendas.find(v => v._id === mesaProdutos.vendaAtual._id);
                                   setMesaProdutos({...mesaProdutos, vendaAtual: vendaAtualizada});
                                   // Atualizar vendaAtual se for a mesa selecionada
                                   if (mesaSelecionada === mesaProdutos._id) {
                                     setVendaAtual(vendaAtualizada);
                                   }
                                   // Forçar re-renderização do modal
                                   setModalUpdateKey(prev => prev + 1);
                                   // Atualizar as mesas na tela principal
                                   carregarMesas();
                                   setSucesso(`${item.nomeProduto} removido da venda`);
                                   setTimeout(() => setSucesso(''), 3000);
                                } else {
                                  const errorData = await response.json();
                                  setErro(errorData.error || 'Erro ao remover item');
                                  setTimeout(() => setErro(''), 3000);
                                }
                              } catch (error) {
                                console.error('Erro ao remover item:', error);
                                setErro('Erro ao remover item da venda');
                                setTimeout(() => setErro(''), 3000);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            title="Remover uma unidade"
                            disabled={loading}
                          >
                            ➖
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="sem-produtos">
                    <p>🍽️ Nenhum produto adicionado ainda</p>
                    <p>Adicione produtos para começar a venda</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setModalProdutosMesa(false)}
              >
                Fechar
              </button>
              <button 
                className="btn-adicionar-produtos"
                onClick={() => {
                  // Selecionar a mesa e fechar o modal para adicionar produtos
                  setMesaSelecionada(mesaProdutos._id);
                  setVendaAtual(mesaProdutos.vendaAtual);
                  setModalProdutosMesa(false);
                }}
              >
                ➕ Adicionar Produtos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mesas;