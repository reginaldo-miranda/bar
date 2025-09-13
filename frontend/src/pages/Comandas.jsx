import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Comandas.css';

const Comandas = () => {
  const navigate = useNavigate();
  const [comandas, setComandas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendaAtual, setVendaAtual] = useState(null);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);
  const [modalNovaComanda, setModalNovaComanda] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [novaComanda, setNovaComanda] = useState({
    nome: '',
    cliente: '',
    valorTotal: 0,
    observacoes: ''
  });
  const [quantidade, setQuantidade] = useState(1);
  const [buscarProduto, setBuscarProduto] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [categorias, setCategorias] = useState([
    { id: 'todos', nome: 'Todos', icon: '🍽️' }
  ]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    await Promise.all([
      carregarComandas(),
      carregarFuncionarios(),
      carregarClientes(),
      carregarProdutos()
    ]);
  };

  const carregarComandas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/sale/list');
      if (response.ok) {
        const data = await response.json();
        const comandasAbertas = data.filter(venda => 
          venda.tipoVenda === 'comanda' && venda.status === 'aberta'
        );
        setComandas(comandasAbertas);
      }
    } catch {
      console.error('Erro ao carregar comandas');
    }
  };

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

  const criarNovaComanda = async () => {
    if (!novaComanda.nome.trim()) {
      setErro('Digite um nome para a comanda');
      return;
    }

    if (!funcionarioSelecionado) {
      setErro('Selecione um funcionário para criar a comanda');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      const dadosComanda = {
        tipoVenda: 'comanda',
        nomeComanda: novaComanda.nome,
        cliente: novaComanda.cliente || null,
        funcionario: funcionarioSelecionado,
        valorTotal: novaComanda.valorTotal,
        observacoes: novaComanda.observacoes
      };

      const response = await fetch('http://localhost:4000/api/sale/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosComanda),
      });

      if (response.ok) {
        const novaVenda = await response.json();
        setSucesso('Comanda criada com sucesso!');
        setModalNovaComanda(false);
        setNovaComanda({ nome: '', cliente: '', valorTotal: 0, observacoes: '' });
        setFuncionarioSelecionado('');
        carregarComandas();
        setVendaAtual(novaVenda);
        setComandaSelecionada(novaVenda._id);
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao criar comanda');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const fecharComanda = (comandaId) => {
    const comanda = comandas.find(c => c._id === comandaId) || vendaAtual;
    if (comanda) {
      navigate('/caixa', { state: { comanda } });
    }
  };

  const adicionarItem = async (produto) => {
    if (!vendaAtual) {
      setErro('Selecione uma comanda primeiro');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
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
        carregarComandas();
        setSucesso(`${produto.nome} adicionado à comanda!`);
        setTimeout(() => setSucesso(''), 2000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao adicionar item');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = categoriaSelecionada === 'todos' || produto.grupo === categoriaSelecionada;
    const matchBusca = produto.nome.toLowerCase().includes(buscarProduto.toLowerCase());
    return matchCategoria && matchBusca;
  });

  return (
    <div className="comandas-container">
      <div className="comandas-header">
        <h1>📋 Gerenciamento de Comandas</h1>
        <div className="header-actions">
          <button 
            className="btn-nova-comanda"
            onClick={() => setModalNovaComanda(true)}
          >
            ➕ Nova Comanda
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

      <div className="comandas-layout">
        {/* Lista de Comandas */}
        <div className="comandas-lista">
          <h3>Comandas Ativas ({comandas.length})</h3>
          <div className="comandas-grid">
            {comandas
              .sort((a, b) => {
                const nomeA = a.nomeComanda || clientes.find(c => c._id === a.cliente)?.nome || 'Sem nome';
                const nomeB = b.nomeComanda || clientes.find(c => c._id === b.cliente)?.nome || 'Sem nome';
                return nomeA.localeCompare(nomeB);
              })
              .map(comanda => {
                const nomeComanda = comanda.nomeComanda || clientes.find(c => c._id === comanda.cliente)?.nome || 'Sem nome';
                const clienteNome = clientes.find(c => c._id === comanda.cliente)?.nome || 'Cliente avulso';
                const funcionarioNome = comanda.funcionario?.nome || 'Funcionário não definido';
                
                return (
                  <div 
                    key={comanda._id} 
                    className={`comanda-card ${comandaSelecionada === comanda._id ? 'selected' : ''}`}
                  >
                    <div className="comanda-info">
                      <div 
                        className="comanda-detalhes"
                        onClick={() => {
                          setVendaAtual(comanda);
                          setComandaSelecionada(comanda._id);
                        }}
                      >
                        <div className="comanda-funcionario">{funcionarioNome}</div>
                        <div className="comanda-nome">{nomeComanda}</div>
                         <div className="comanda-cliente">{clienteNome}</div>
                        <div className="comanda-total">R$ {comanda.total?.toFixed(2) || '0,00'}</div>
                        <div className="comanda-itens">{comanda.itens?.length || 0} itens</div>
                        {comanda.observacoes && (
                          <div className="comanda-observacoes">{comanda.observacoes}</div>
                        )}
                      </div>
                      <button
                        className="btn-fechar-comanda"
                        onClick={(e) => {
                          e.stopPropagation();
                          fecharComanda(comanda._id);
                        }}
                        title="Finalizar venda"
                      >
                        ✅
                      </button>
                    </div>
                  </div>
                );
              })
            }
            
            {comandas.length === 0 && (
              <div className="sem-comandas">
                <p>📋 Nenhuma comanda ativa</p>
                <p>Crie uma nova comanda para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Área de Produtos */}
        <div className="produtos-area">
          {vendaAtual ? (
            <>
              <div className="comanda-selecionada">
                <div className="comanda-info-header">
                  <div>
                    <h3>Comanda: {vendaAtual.nomeComanda || 'Sem nome'}</h3>
                    <p>Total: R$ {vendaAtual.total?.toFixed(2) || '0,00'}</p>
                  </div>
                  <button
                    className="btn-fechar-comanda-fixo"
                    onClick={() => fecharComanda(vendaAtual._id)}
                    title="Finalizar venda"
                    disabled={loading}
                  >
                    💰 Finalizar
                  </button>
                </div>
              </div>

              {/* Filtros de Categoria */}
              <div className="categorias-filtro">
                {categorias.map(categoria => (
                  <button
                    key={categoria.id}
                    className={`categoria-btn ${categoriaSelecionada === categoria.id ? 'active' : ''}`}
                    onClick={() => setCategoriaSelecionada(categoria.id)}
                  >
                    {categoria.icon} {categoria.nome}
                  </button>
                ))}
              </div>

              {/* Busca de Produtos */}
              <div className="busca-produto">
                <input
                  type="text"
                  placeholder="🔍 Buscar produto..."
                  value={buscarProduto}
                  onChange={(e) => setBuscarProduto(e.target.value)}
                />
                <div className="quantidade-control">
                  <label>Qtd:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Grid de Produtos */}
              <div className="produtos-grid">
                {produtosFiltrados.map(produto => (
                  <div key={produto._id} className="produto-card">
                    <div className="produto-info">
                      <h4>{produto.nome}</h4>
                      <p className="produto-preco">R$ {produto.precoVenda?.toFixed(2)}</p>
                      {produto.descricao && (
                        <p className="produto-descricao">{produto.descricao}</p>
                      )}
                    </div>
                    <button
                      className="btn-adicionar"
                      onClick={() => adicionarItem(produto)}
                      disabled={loading}
                    >
                      ➕ Adicionar
                    </button>
                  </div>
                ))}
                
                {produtosFiltrados.length === 0 && (
                  <div className="sem-produtos">
                    <p>Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="selecione-comanda">
              <h3>Selecione uma comanda para adicionar produtos</h3>
              <p>Clique em uma comanda da lista ao lado para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Comanda */}
      {modalNovaComanda && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📋 Nova Comanda</h3>
              <button 
                className="modal-close"
                onClick={() => setModalNovaComanda(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome da Comanda: *</label>
                <input
                  type="text"
                  value={novaComanda.nome}
                  onChange={(e) => setNovaComanda({...novaComanda, nome: e.target.value})}
                  placeholder="Ex: Mesa 5, João Silva, Aniversário..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Funcionário: *</label>
                <select
                  value={funcionarioSelecionado}
                  onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione um funcionário...</option>
                  {funcionarios.map(funcionario => (
                    <option key={funcionario._id} value={funcionario._id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cliente (opcional):</label>
                <select
                  value={novaComanda.cliente}
                  onChange={(e) => setNovaComanda({...novaComanda, cliente: e.target.value})}
                >
                  <option value="">Cliente avulso</option>
                  {clientes.map(cliente => (
                    <option key={cliente._id} value={cliente._id}>
                      {cliente.nome} - {cliente.telefone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Valor Total Estimado:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={novaComanda.valorTotal}
                  onChange={(e) => setNovaComanda({...novaComanda, valorTotal: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Observações:</label>
                <input
                  type="text"
                  value={novaComanda.observacoes}
                  onChange={(e) => setNovaComanda({...novaComanda, observacoes: e.target.value})}
                  placeholder="Ex: Cliente preferencial, desconto especial..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setModalNovaComanda(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-criar"
                onClick={criarNovaComanda}
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Comanda'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comandas;