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
  const [modalProdutosComanda, setModalProdutosComanda] = useState(false);
  const [comandaProdutos, setComandaProdutos] = useState(null);
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
  const [buscarComanda, setBuscarComanda] = useState('');
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
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
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
        setTimeout(() => {
          setSucesso('');
          navigate('/pdv'); // Fechar a tela e voltar ao PDV
        }, 2000);
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
      navigate('/caixa', { state: { comanda, origem: '/comandas' } });
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

  const removerItem = async (produto) => {
    if (!vendaAtual) {
      setErro('Selecione uma comanda primeiro');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      const response = await fetch(`http://localhost:4000/api/sale/${vendaAtual._id}/item`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produtoId: produto._id,
          quantidade: 1
        })
      });

      if (response.ok) {
        const vendaAtualizada = await response.json();
        setVendaAtual(vendaAtualizada);
        carregarComandas();
        setSucesso(`${produto.nome} removido da comanda!`);
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
          <div className="buscar-comanda-container">
            <input
              type="text"
              className="buscar-comanda-input"
              placeholder="🔍 Buscar comanda pelo nome..."
              value={buscarComanda}
              onChange={(e) => setBuscarComanda(e.target.value)}
            />
          </div>
          <div className="comandas-grid">
            {comandas
              .filter(comanda => {
                const nomeComanda = comanda.nomeComanda || clientes.find(c => c._id === comanda.cliente)?.nome || 'Sem nome';
                return nomeComanda.toLowerCase().includes(buscarComanda.toLowerCase());
              })
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
                        <div className="comanda-total">R$ {comanda.total?.toFixed(2) || '0,00'}</div>
                        <div className="comanda-itens">{comanda.itens?.length || 0} itens</div>
                        {comanda.observacoes && (
                          <div className="comanda-observacoes">{comanda.observacoes}</div>
                        )}
                      </div>
                      <div className="comanda-actions">
                        <button
                          className="btn-abrir-modal"
                          onClick={(e) => {
                            e.stopPropagation();
                            setComandaProdutos(comanda);
                            setModalProdutosComanda(true);
                          }}
                          title="Ver Produtos"
                        >
                          📋
                        </button>
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
                  <div className="comanda-detalhes-principais">
                    <h3>Comanda: {vendaAtual.nomeComanda || 'Sem nome'}</h3>
                    <p>Total: R$ {vendaAtual.total?.toFixed(2) || '0,00'} | Itens: {vendaAtual.itens?.length || 0}</p>
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
                
                {/* Resumo dos itens da comanda */}
                {vendaAtual.itens && vendaAtual.itens.length > 0 && (
                  <div className="comanda-itens-resumo">
                    <h4>Itens na comanda:</h4>
                    <div className="itens-lista">
                      {vendaAtual.itens.map((item, index) => (
                        <div key={index} className="item-resumo">
                          <span className="item-nome">{item.produto.nome}</span>
                          <span className="item-quantidade">x{item.quantidade}</span>
                          <span className="item-preco">R$ {(item.quantidade * item.produto.precoVenda).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {produtosFiltrados.map(produto => {
                  // Calcular quantidade já adicionada na comanda
                  const itemNaComanda = vendaAtual?.itens?.find(item => item.produto._id === produto._id);
                  const quantidadeNaComanda = itemNaComanda ? itemNaComanda.quantidade : 0;
                  
                  return (
                    <div key={produto._id} className={`produto-card ${quantidadeNaComanda > 0 ? 'produto-adicionado' : ''}`}>
                      <div className="produto-nome">{produto.nome}</div>
                      <div className="produto-direita">
                        <div className="produto-preco">R$ {produto.precoVenda?.toFixed(2)}</div>
                        <div className="produto-botoes">
                          <button 
                            className="btn-remover-produto"
                            onClick={() => removerItem(produto)}
                            disabled={!vendaAtual || quantidadeNaComanda === 0}
                            title="Remover 1 unidade"
                          >
                            -
                          </button>
                          <span className="quantidade-display">{quantidadeNaComanda}</span>
                          <button
                            className="btn-adicionar-produto"
                            onClick={() => adicionarItem(produto)}
                            disabled={!vendaAtual}
                            title={`Adicionar ${quantidade} unidade(s)`}
                          >
                            +{quantidade > 1 ? quantidade : ''}
                          </button>
                        </div>
                      </div>
                      {quantidadeNaComanda > 0 && (
                        <div className="produto-total-item">
                          Total: R$ {(quantidadeNaComanda * produto.precoVenda).toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
                
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

      {modalProdutosComanda && comandaProdutos && (
        <div className="modal-overlay">
          <div className="modal-content modal-produtos">
            <div className="modal-header" style={{backgroundColor: '#27ae60', padding: '15px', borderRadius: '8px 8px 0 0'}}>
              <div className="mesa-info-header">
                <div>
                  <h3 style={{color: 'white', margin: '0 0 10px 0'}}>📋 Produtos da Comanda</h3>
                  <p style={{color: 'white', margin: '0 0 5px 0', fontSize: '14px'}}>👨‍💼 Funcionário: {comandaProdutos.funcionario?.nome?.toUpperCase() || comandaProdutos.funcionario?.toUpperCase() || 'NÃO DEFINIDO'}</p>
                  <p style={{color: 'white', margin: '0'}}>Total: R$ {comandaProdutos.total?.toFixed(2) || '0,00'}</p>
                </div>
                <button 
                  className="modal-close"
                  onClick={() => setModalProdutosComanda(false)}
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="produtos-lista">
                <h4>Produtos Adicionados ({comandaProdutos.itens?.length || 0})</h4>
                {comandaProdutos.itens && comandaProdutos.itens.length > 0 ? (
                  <div className="itens-mesa-lista">
                    {comandaProdutos.itens.map((item, index) => (
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
                         
                                 const response = await fetch(`http://localhost:4000/api/sale/${comandaProdutos._id}/item`, {
                                   method: 'POST',
                                   headers: {
                                     'Content-Type': 'application/json'
                                   },
                                   body: JSON.stringify(novoItem)
                                 });
                         
                                 if (response.ok) {
                                     // Atualizar os dados da comanda no modal
                                     const responseList = await fetch(`http://localhost:4000/api/sale/list`);
                                     const vendas = await responseList.json();
                                     const comandaAtualizada = vendas.find(v => v._id === comandaProdutos._id);
                                     setComandaProdutos(comandaAtualizada);
                                     // Atualizar vendaAtual se for a comanda selecionada
                                     if (comandaSelecionada === comandaProdutos._id) {
                                       setVendaAtual(comandaAtualizada);
                                     }
                                     // Atualizar as comandas na tela principal
                                     carregarComandas();
                                     setSucesso(`${item.nomeProduto} adicionado à comanda`);
                                     setTimeout(() => setSucesso(''), 3000);
                                 } else {
                                   const errorData = await response.json();
                                   setErro(errorData.error || 'Erro ao adicionar item');
                                   setTimeout(() => setErro(''), 3000);
                                 }
                               } catch (error) {
                                 console.error('Erro ao adicionar item:', error);
                                 setErro('Erro ao adicionar item à comanda');
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
                                 
                                 const response = await fetch(`http://localhost:4000/api/sale/${comandaProdutos._id}/item/${item.produto}`, {
                                   method: 'DELETE'
                                 });
                         
                                 if (response.ok) {
                                     // Atualizar os dados da comanda no modal
                                     const responseList = await fetch(`http://localhost:4000/api/sale/list`);
                                     const vendas = await responseList.json();
                                     const comandaAtualizada = vendas.find(v => v._id === comandaProdutos._id);
                                     setComandaProdutos(comandaAtualizada);
                                     // Atualizar vendaAtual se for a comanda selecionada
                                     if (comandaSelecionada === comandaProdutos._id) {
                                       setVendaAtual(comandaAtualizada);
                                     }
                                     // Atualizar as comandas na tela principal
                                     carregarComandas();
                                     setSucesso(`${item.nomeProduto} removido da comanda`);
                                     setTimeout(() => setSucesso(''), 3000);
                                 } else {
                                   const errorData = await response.json();
                                   setErro(errorData.error || 'Erro ao remover item');
                                   setTimeout(() => setErro(''), 3000);
                                 }
                               } catch (error) {
                                 console.error('Erro ao remover item:', error);
                                 setErro('Erro ao remover item da comanda');
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
                  <p>Nenhum produto adicionado ainda.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setModalProdutosComanda(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comandas;