// Sistema de Controle de Estoque - app.js

// Dados iniciais
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let movimentacoes = JSON.parse(localStorage.getItem('movimentacoes')) || [];
let movimentacoesPaletes = JSON.parse(localStorage.getItem('movimentacoesPaletes')) || [];
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { id: 1, nome: 'Administrador', usuario: 'admin', senha: 'admin123', chave: 'admin123', dataCriacao: new Date().toISOString() }
];
let relatorios = JSON.parse(localStorage.getItem('relatorios')) || [];
let contadorSKU = parseInt(localStorage.getItem('contadorSKU')) || 1000;
let contadorRelatorio = parseInt(localStorage.getItem('contadorRelatorio')) || 1;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    if (localStorage.getItem('usuarioLogado') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // Inicializar componentes
    inicializarSidebar();
    inicializarNavegacao();
    inicializarDashboard();
    inicializarFormularios();
    inicializarTabelas();
    carregarDados();
    
    // Atualizar dados iniciais
    atualizarDashboard();
    atualizarTabelaEstoque();
    atualizarTabelaMovimentacoes();
    atualizarTabelaRelatorios();
    atualizarTabelaUsuarios();
});

// Inicializar sidebar
function inicializarSidebar() {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }
}

// Inicializar navegação
function inicializarNavegacao() {
    const navLinks = document.querySelectorAll('.components a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Adicionar classe active ao link clicado
            this.classList.add('active');
            
            // Mostrar a seção correspondente
            const targetId = this.getAttribute('href').substring(1);
            mostrarSecao(targetId);
            
            // Atualizar título e breadcrumb
            atualizarTituloPagina(targetId);
        });
    });
    
    // Logout
    document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('nomeUsuario');
        window.location.href = 'login.html';
    });
}

// Mostrar seção específica
function mostrarSecao(secaoId) {
    const sections = document.querySelectorAll('.page-section');
    
    sections.forEach(section => {
        section.classList.add('d-none');
    });
    
    const targetSection = document.getElementById(secaoId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// Atualizar título da página
function atualizarTituloPagina(secaoId) {
    const titles = {
        'dashboard': 'Dashboard',
        'produtos': 'Cadastro de Produtos',
        'estoque': 'Estoque de Produtos',
        'movimentacoes': 'Movimentações de Paletes',
        'relatorios': 'Relatórios de Estoque',
        'configuracoes': 'Configurações do Sistema'
    };
    
    const breadcrumbs = {
        'dashboard': ['Início'],
        'produtos': ['Início', 'Produtos'],
        'estoque': ['Início', 'Estoque'],
        'movimentacoes': ['Início', 'Movimentações'],
        'relatorios': ['Início', 'Relatórios'],
        'configuracoes': ['Início', 'Configurações']
    };
    
    document.getElementById('page-title').textContent = titles[secaoId] || 'Sistema';
    
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    if (breadcrumbs[secaoId]) {
        breadcrumbs[secaoId].forEach((item, index) => {
            const li = document.createElement('li');
            li.className = `breadcrumb-item ${index === breadcrumbs[secaoId].length - 1 ? 'active' : ''}`;
            li.textContent = item;
            breadcrumb.appendChild(li);
        });
    }
}

// Inicializar dashboard
function inicializarDashboard() {
    // Inicializar gráfico
    const ctx = document.getElementById('estoque-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Em Estoque', 'Vencimento Próximo', 'Fora de Estoque'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#27ae60',
                    '#f39c12',
                    '#e74c3c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Inicializar formulários
function inicializarFormularios() {
    // Formulário de produto
    document.getElementById('adicionar-lista').addEventListener('click', adicionarProdutoLista);
    document.getElementById('salvar-produtos').addEventListener('click', salvarProdutos);
    document.getElementById('limpar-campos').addEventListener('click', limparFormularioProduto);
    document.getElementById('gerar-pdf').addEventListener('click', gerarPDFProdutos);
    document.getElementById('novo-lote').addEventListener('click', mostrarModalNovoLote);
    
    // Formulário de movimentação de paletes
    document.getElementById('form-movimentacao-paletes').addEventListener('submit', registrarMovimentacaoPaletes);
    document.getElementById('filtro-diario').addEventListener('click', () => filtrarMovimentacoesPaletes('diario'));
    document.getElementById('filtro-mensal').addEventListener('click', () => filtrarMovimentacoesPaletes('mensal'));
    
    // Botões de estoque
    document.getElementById('novo-produto').addEventListener('click', mostrarModalNovoProduto);
    document.getElementById('exportar-excel').addEventListener('click', exportarExcelEstoque);
    document.getElementById('importar-excel').addEventListener('click', importarExcelEstoque);
    
    // Filtros de estoque
    document.getElementById('filtro-estoque').addEventListener('input', filtrarEstoque);
    document.getElementById('filtro-categoria').addEventListener('change', filtrarEstoque);
    document.getElementById('filtro-status').addEventListener('change', filtrarEstoque);
    
    // Relatórios
    document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltrosRelatorios);
    document.getElementById('gerar-relatorio-pdf').addEventListener('click', gerarRelatorioPDF);
    document.getElementById('exportar-csv').addEventListener('click', exportarCSVRelatorios);
    
    // Configurações
    document.getElementById('adicionar-usuario').addEventListener('click', mostrarModalUsuario);
    document.getElementById('exportar-dados').addEventListener('click', exportarDados);
    document.getElementById('importar-dados').addEventListener('click', importarDados);
    
    // Modais
    document.getElementById('salvar-novo-produto').addEventListener('click', salvarNovoProduto);
    document.getElementById('salvar-novo-lote').addEventListener('click', salvarNovoLote);
    document.getElementById('salvar-novo-usuario').addEventListener('click', salvarNovoUsuario);
}

// Inicializar tabelas
function inicializarTabelas() {
    // Tabela de estoque com linhas expansíveis
    document.getElementById('tabela-estoque').addEventListener('click', function(e) {
        if (e.target.closest('.expand-btn')) {
            const row = e.target.closest('tr');
            const sku = row.getAttribute('data-sku');
            toggleDetalhesProduto(sku);
        }
        
        if (e.target.closest('.edit-btn')) {
            const row = e.target.closest('tr');
            const sku = row.getAttribute('data-sku');
            editarProduto(sku);
        }
        
        if (e.target.closest('.delete-btn')) {
            const row = e.target.closest('tr');
            const sku = row.getAttribute('data-sku');
            excluirProduto(sku);
        }
        
        if (e.target.closest('.lote-btn')) {
            const row = e.target.closest('tr');
            const sku = row.getAttribute('data-sku');
            adicionarLoteProduto(sku);
        }
    });
    
    // Tabela de relatórios com linhas expansíveis
    document.getElementById('tabela-relatorios').addEventListener('click', function(e) {
        if (e.target.closest('.expand-btn')) {
            const row = e.target.closest('tr');
            const id = row.getAttribute('data-id');
            toggleDetalhesRelatorio(id);
        }
    });
}

// Carregar dados iniciais
function carregarDados() {
    // Carregar produtos no select
    const selectProdutos = document.getElementById('nome-produto');
    selectProdutos.innerHTML = '<option value="">Selecione um produto</option>';
    
    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.sku;
        option.textContent = produto.nome;
        selectProdutos.appendChild(option);
    });
    
    // Configurar auto-complete para SKU
    document.getElementById('nome-produto').addEventListener('change', function() {
        const sku = this.value;
        if (sku) {
            const produto = produtos.find(p => p.sku === sku);
            if (produto) {
                document.getElementById('sku').value = produto.sku;
                document.getElementById('tipo-embalagem').value = produto.tipo;
                // Preencher outros campos conforme necessário
            }
        }
    });
}

// Atualizar dashboard
function atualizarDashboard() {
    const totalProdutos = produtos.length;
    const totalEstoque = produtos.reduce((total, produto) => total + produto.quantidade, 0);
    
    // Calcular vencimentos
    const hoje = new Date();
    const umAno = new Date();
    umAno.setFullYear(hoje.getFullYear() + 1);
    
    const vencimentoProximo = produtos.filter(produto => {
        if (!produto.dataValidade) return false;
        const dataValidade = new Date(produto.dataValidade);
        return dataValidade > hoje && dataValidade <= umAno;
    }).length;
    
    const vencidos = produtos.filter(produto => {
        if (!produto.dataValidade) return false;
        return new Date(produto.dataValidade) <= hoje;
    }).length;
    
    // Atualizar estatísticas
    document.getElementById('total-produtos').textContent = totalProdutos;
    document.getElementById('total-estoque').textContent = totalEstoque;
    document.getElementById('total-vencimento').textContent = vencimentoProximo;
    document.getElementById('total-vencidos').textContent = vencidos;
    
    // Atualizar gráfico
    const chart = Chart.getChart('estoque-chart');
    if (chart) {
        chart.data.datasets[0].data = [
            totalProdutos - vencimentoProximo - vencidos,
            vencimentoProximo,
            vencidos
        ];
        chart.update();
    }
    
    // Atualizar tabela de movimentações recentes
    atualizarTabelaMovimentacoes();
}

// Adicionar produto à lista de cadastro
function adicionarProdutoLista() {
    const form = document.getElementById('form-produto');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const sku = document.getElementById('sku').value;
    const nome = document.getElementById('nome-produto').options[document.getElementById('nome-produto').selectedIndex].text;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const tipo = document.getElementById('tipo-embalagem').value;
    const lote = document.getElementById('lote').value;
    const dataFabricacao = document.getElementById('data-fabricacao').value;
    const tipoMovimento = document.getElementById('tipo-movimento').value;
    
    const tabela = document.getElementById('tabela-itens').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();
    
    novaLinha.innerHTML = `
        <td>${sku}</td>
        <td>${nome}</td>
        <td>${quantidade}</td>
        <td>${tipo}</td>
        <td>${lote || 'N/A'}</td>
        <td>
            <button class="btn btn-sm btn-danger remover-item">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    // Adicionar evento de remoção
    novaLinha.querySelector('.remover-item').addEventListener('click', function() {
        tabela.deleteRow(novaLinha.rowIndex - 1);
    });
    
    // Limpar campos do formulário (exceto SKU)
    document.getElementById('quantidade').value = '';
    document.getElementById('tipo-embalagem').value = '';
    document.getElementById('lote').value = '';
    document.getElementById('data-fabricacao').value = '';
    document.getElementById('tipo-movimento').value = '';
    document.getElementById('foto').value = '';
    
    mostrarToast('Produto adicionado à lista!', 'success');
}

// Salvar produtos da lista
function salvarProdutos() {
    const tabela = document.getElementById('tabela-itens').getElementsByTagName('tbody')[0];
    const linhas = tabela.rows;
    
    if (linhas.length === 0) {
        mostrarToast('Nenhum produto para salvar!', 'warning');
        return;
    }
    
    for (let i = 0; i < linhas.length; i++) {
        const celulas = linhas[i].cells;
        
        const produto = {
            sku: celulas[0].textContent,
            nome: celulas[1].textContent,
            quantidade: parseInt(celulas[2].textContent),
            tipo: celulas[3].textContent,
            lote: celulas[4].textContent === 'N/A' ? '' : celulas[4].textContent,
            dataCadastro: new Date().toISOString()
        };
        
        // Verificar se o produto já existe
        const index = produtos.findIndex(p => p.sku === produto.sku);
        if (index !== -1) {
            // Atualizar produto existente
            produtos[index] = { ...produtos[index], ...produto };
        } else {
            // Adicionar novo produto
            produtos.push(produto);
        }
        
        // Registrar movimentação
        const movimentacao = {
            id: Date.now(),
            data: new Date().toISOString(),
            sku: produto.sku,
            produto: produto.nome,
            tipo: 'Entrada', // Ou outro tipo baseado no formulário
            quantidade: produto.quantidade,
            lote: produto.lote
        };
        
        movimentacoes.push(movimentacao);
    }
    
    // Salvar dados
    salvarDados();
    
    // Limpar tabela
    tabela.innerHTML = '';
    
    // Atualizar visualizações
    atualizarDashboard();
    atualizarTabelaEstoque();
    
    mostrarToast('Produtos salvos com sucesso!', 'success');
}

// Limpar formulário de produto
function limparFormularioProduto() {
    document.getElementById('form-produto').reset();
    document.getElementById('tabela-itens').getElementsByTagName('tbody')[0].innerHTML = '';
    mostrarToast('Campos limpos!', 'info');
}

// Gerar PDF de produtos
function gerarPDFProdutos() {
    // Simulação de geração de PDF
    mostrarToast('PDF gerado com sucesso!', 'success');
}

// Mostrar modal de novo lote
function mostrarModalNovoLote() {
    const modal = new bootstrap.Modal(document.getElementById('modal-lote'));
    modal.show();
}

// Salvar novo lote
function salvarNovoLote() {
    const numeroLote = document.getElementById('numero-lote').value;
    const quantidade = parseInt(document.getElementById('quantidade-lote').value);
    const dataFabricacao = document.getElementById('data-fabricacao-lote').value;
    
    if (!numeroLote || !quantidade || !dataFabricacao) {
        mostrarToast('Preencha todos os campos obrigatórios!', 'warning');
        return;
    }
    
    // Adicionar lote ao select
    const selectLote = document.getElementById('lote');
    const option = document.createElement('option');
    option.value = numeroLote;
    option.textContent = numeroLote;
    selectLote.appendChild(option);
    selectLote.value = numeroLote;
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-lote'));
    modal.hide();
    
    // Limpar formulário
    document.getElementById('form-novo-lote').reset();
    
    mostrarToast('Lote criado com sucesso!', 'success');
}

// Registrar movimentação de paletes
function registrarMovimentacaoPaletes(e) {
    e.preventDefault();
    
    const data = document.getElementById('data-movimentacao').value;
    const quantidade = parseInt(document.getElementById('quantidade-paletes').value);
    const tipoProduto = document.getElementById('tipo-produto-palete').value;
    const tipoMovimento = document.getElementById('tipo-movimento-palete').value;
    
    if (!data || !quantidade || !tipoProduto || !tipoMovimento) {
        mostrarToast('Preencha todos os campos obrigatórios!', 'warning');
        return;
    }
    
    const movimentacao = {
        id: Date.now(),
        data: data,
        quantidade: quantidade,
        tipoProduto: tipoProduto,
        tipoMovimento: tipoMovimento
    };
    
    movimentacoesPaletes.push(movimentacao);
    salvarDados();
    
    // Atualizar tabela
    atualizarTabelaMovimentacoesPaletes();
    
    // Limpar formulário
    document.getElementById('form-movimentacao-paletes').reset();
    
    mostrarToast('Movimentação registrada com sucesso!', 'success');
}

// Filtrar movimentações de paletes
function filtrarMovimentacoesPaletes(tipo) {
    // Implementar filtro por dia ou mês
    atualizarTabelaMovimentacoesPaletes(tipo);
}

// Atualizar tabela de movimentações de paletes
function atualizarTabelaMovimentacoesPaletes(filtro = 'diario') {
    const tbody = document.getElementById('tabela-movimentacoes-paletes').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    let movimentacoesFiltradas = [...movimentacoesPaletes];
    
    if (filtro === 'diario') {
        const hoje = new Date().toISOString().split('T')[0];
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => m.data === hoje);
    } else if (filtro === 'mensal') {
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        movimentacoesFiltradas = movimentacoesFiltradas.filter(m => {
            const data = new Date(m.data);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        });
    }
    
    movimentacoesFiltradas.forEach(mov => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatarData(mov.data)}</td>
            <td>${mov.tipoProduto}</td>
            <td>${mov.tipoMovimento}</td>
            <td>${mov.quantidade}</td>
            <td>
                <button class="btn btn-sm btn-danger excluir-movimentacao">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Adicionar evento de exclusão
        row.querySelector('.excluir-movimentacao').addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
                movimentacoesPaletes = movimentacoesPaletes.filter(m => m.id !== mov.id);
                salvarDados();
                atualizarTabelaMovimentacoesPaletes(filtro);
                mostrarToast('Movimentação excluída!', 'success');
            }
        });
    });
    
    // Atualizar totais
    atualizarTotaisPaletes();
}

// Atualizar totais de paletes
function atualizarTotaisPaletes() {
    const hoje = new Date().toISOString().split('T')[0];
    
    const fracionado = movimentacoesPaletes
        .filter(m => m.tipoProduto === 'Fracionado' && m.data === hoje && m.tipoMovimento === 'Entrada')
        .reduce((total, m) => total + m.quantidade, 0);
    
    const tambor = movimentacoesPaletes
        .filter(m => m.tipoProduto === 'Tambor' && m.data === hoje && m.tipoMovimento === 'Entrada')
        .reduce((total, m) => total + m.quantidade, 0);
    
    const ibc = movimentacoesPaletes
        .filter(m => m.tipoProduto === 'IBC1000L' && m.data === hoje && m.tipoMovimento === 'Entrada')
        .reduce((total, m) => total + m.quantidade, 0);
    
    document.getElementById('total-fracionado').textContent = fracionado;
    document.getElementById('total-tambor').textContent = tambor;
    document.getElementById('total-ibc').textContent = ibc;
}

// Mostrar modal de novo produto
function mostrarModalNovoProduto() {
    const modal = new bootstrap.Modal(document.getElementById('modal-produto'));
    
    // Gerar SKU automático
    contadorSKU++;
    document.getElementById('novo-sku').value = `SKU${contadorSKU.toString().padStart(4, '0')}`;
    
    modal.show();
}

// Salvar novo produto
function salvarNovoProduto() {
    const sku = document.getElementById('novo-sku').value;
    const nome = document.getElementById('novo-nome').value;
    const tipo = document.getElementById('novo-tipo').value;
    const categoria = document.getElementById('novo-categoria').value;
    const descricao = document.getElementById('novo-descricao').value;
    
    if (!sku || !nome || !tipo) {
        mostrarToast('Preencha os campos obrigatórios!', 'warning');
        return;
    }
    
    // Verificar se SKU já existe
    if (produtos.find(p => p.sku === sku)) {
        mostrarToast('SKU já existe! Escolha outro.', 'warning');
        return;
    }
    
    const produto = {
        sku: sku,
        nome: nome,
        tipo: tipo,
        categoria: categoria,
        descricao: descricao,
        quantidade: 0,
        dataCadastro: new Date().toISOString()
    };
    
    produtos.push(produto);
    salvarDados();
    
    // Atualizar select de produtos
    const selectProdutos = document.getElementById('nome-produto');
    const option = document.createElement('option');
    option.value = sku;
    option.textContent = nome;
    selectProdutos.appendChild(option);
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-produto'));
    modal.hide();
    
    // Limpar formulário
    document.getElementById('form-novo-produto').reset();
    
    mostrarToast('Produto cadastrado com sucesso!', 'success');
}

// Exportar estoque para Excel
function exportarExcelEstoque() {
    // Simulação de exportação para Excel
    mostrarToast('Exportação para Excel iniciada!', 'success');
}

// Importar estoque de Excel
function importarExcelEstoque() {
    // Simulação de importação de Excel
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    
    input.onchange = function(e) {
        mostrarToast('Arquivo importado com sucesso!', 'success');
        // Aqui iria a lógica real de importação
    };
    
    input.click();
}

// Filtrar estoque
function filtrarEstoque() {
    const termo = document.getElementById('filtro-estoque').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const status = document.getElementById('filtro-status').value;
    
    const produtosFiltrados = produtos.filter(produto => {
        const matchTermo = produto.nome.toLowerCase().includes(termo) || 
                          produto.sku.toLowerCase().includes(termo);
        const matchCategoria = !categoria || produto.tipo === categoria;
        const matchStatus = !status || calcularStatusProduto(produto) === status;
        
        return matchTermo && matchCategoria && matchStatus;
    });
    
    atualizarTabelaEstoque(produtosFiltrados);
}

// Calcular status do produto
function calcularStatusProduto(produto) {
    if (!produto.dataValidade) return 'Em Estoque';
    
    const hoje = new Date();
    const dataValidade = new Date(produto.dataValidade);
    const umAnoAntes = new Date(dataValidade);
    umAnoAntes.setFullYear(dataValidade.getFullYear() - 1);
    
    if (dataValidade <= hoje) {
        return 'Fora de Estoque';
    } else if (hoje >= umAnoAntes && hoje <= dataValidade) {
        return 'Vencimento Próximo';
    } else {
        return 'Em Estoque';
    }
}

// Atualizar tabela de estoque
function atualizarTabelaEstoque(produtosExibir = produtos) {
    const tbody = document.getElementById('tabela-estoque').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    produtosExibir.forEach(produto => {
        const status = calcularStatusProduto(produto);
        const statusClass = {
            'Em Estoque': 'badge-em-estoque',
            'Vencimento Próximo': 'badge-vencimento-proximo',
            'Fora de Estoque': 'badge-fora-estoque'
        }[status];
        
        const row = tbody.insertRow();
        row.setAttribute('data-sku', produto.sku);
        row.innerHTML = `
            <td>
                <button class="btn btn-sm btn-outline-primary expand-btn">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </td>
            <td>${produto.sku}</td>
            <td>${produto.nome}</td>
            <td>${produto.tipo}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.lote || 'N/A'}</td>
            <td><span class="badge ${statusClass}">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-secondary lote-btn me-1" title="Adicionar Lote">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning edit-btn me-1" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Adicionar linha expansível para detalhes
        const detalhesRow = tbody.insertRow();
        detalhesRow.className = 'expandable-content';
        detalhesRow.setAttribute('data-parent', produto.sku);
        detalhesRow.innerHTML = `
            <td colspan="8">
                <div class="p-3">
                    <h6>Detalhes do Produto</h6>
                    <div class="row">
                        <div class="col-md-4">
                            <strong>SKU:</strong> ${produto.sku}
                        </div>
                        <div class="col-md-4">
                            <strong>Categoria:</strong> ${produto.categoria || 'N/A'}
                        </div>
                        <div class="col-md-4">
                            <strong>Data de Cadastro:</strong> ${formatarData(produto.dataCadastro)}
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-12">
                            <strong>Descrição:</strong> ${produto.descricao || 'Nenhuma descrição fornecida.'}
                        </div>
                    </div>
                    ${produto.dataValidade ? `
                    <div class="row mt-2">
                        <div class="col-md-6">
                            <strong>Data de Fabricação:</strong> ${formatarData(produto.dataFabricacao)}
                        </div>
                        <div class="col-md-6">
                            <strong>Data de Validade:</strong> ${formatarData(produto.dataValidade)}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </td>
        `;
    });
}

// Alternar detalhes do produto
function toggleDetalhesProduto(sku) {
    const detalhes = document.querySelector(`.expandable-content[data-parent="${sku}"]`);
    const btn = document.querySelector(`tr[data-sku="${sku}"] .expand-btn i`);
    
    if (detalhes.classList.contains('active')) {
        detalhes.classList.remove('active');
        btn.classList.remove('fa-chevron-up');
        btn.classList.add('fa-chevron-down');
    } else {
        // Fechar outros detalhes abertos
        document.querySelectorAll('.expandable-content.active').forEach(el => {
            el.classList.remove('active');
            const parentSku = el.getAttribute('data-parent');
            const parentBtn = document.querySelector(`tr[data-sku="${parentSku}"] .expand-btn i`);
            if (parentBtn) {
                parentBtn.classList.remove('fa-chevron-up');
                parentBtn.classList.add('fa-chevron-down');
            }
        });
        
        detalhes.classList.add('active');
        btn.classList.remove('fa-chevron-down');
        btn.classList.add('fa-chevron-up');
    }
}

// Editar produto
function editarProduto(sku) {
    const produto = produtos.find(p => p.sku === sku);
    if (produto) {
        // Preencher modal de edição (simplificado)
        mostrarToast(`Editando produto ${sku}`, 'info');
        // Implementar lógica completa de edição
    }
}

// Excluir produto
function excluirProduto(sku) {
    if (confirm(`Tem certeza que deseja excluir o produto ${sku}?`)) {
        produtos = produtos.filter(p => p.sku !== sku);
        salvarDados();
        atualizarTabelaEstoque();
        atualizarDashboard();
        mostrarToast('Produto excluído com sucesso!', 'success');
    }
}

// Adicionar lote ao produto
function adicionarLoteProduto(sku) {
    const produto = produtos.find(p => p.sku === sku);
    if (produto) {
        // Preencher e mostrar modal de lote
        document.getElementById('numero-lote').value = `LOTE${Date.now().toString().slice(-6)}`;
        const modal = new bootstrap.Modal(document.getElementById('modal-lote'));
        modal.show();
        
        // Configurar evento de salvamento específico para este produto
        const salvarBtn = document.getElementById('salvar-novo-lote');
        const originalClick = salvarBtn.onclick;
        
        salvarBtn.onclick = function() {
            const numeroLote = document.getElementById('numero-lote').value;
            const quantidade = parseInt(document.getElementById('quantidade-lote').value);
            const dataFabricacao = document.getElementById('data-fabricacao-lote').value;
            
            if (!numeroLote || !quantidade || !dataFabricacao) {
                mostrarToast('Preencha todos os campos obrigatórios!', 'warning');
                return;
            }
            
            // Calcular data de validade (4 anos após fabricação)
            const dataValidade = new Date(dataFabricacao);
            dataValidade.setFullYear(dataValidade.getFullYear() + 4);
            
            // Atualizar produto
            produto.lote = numeroLote;
            produto.quantidade = quantidade;
            produto.dataFabricacao = dataFabricacao;
            produto.dataValidade = dataValidade.toISOString().split('T')[0];
            
            salvarDados();
            atualizarTabelaEstoque();
            atualizarDashboard();
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-lote'));
            modal.hide();
            
            // Restaurar evento original
            salvarBtn.onclick = originalClick;
            
            mostrarToast('Lote adicionado com sucesso!', 'success');
        };
    }
}

// Aplicar filtros de relatórios
function aplicarFiltrosRelatorios() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const tipoMovimento = document.getElementById('filtro-tipo-movimento').value;
    
    let relatoriosFiltrados = [...relatorios];
    
    if (dataInicio) {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => r.data >= dataInicio);
    }
    
    if (dataFim) {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => r.data <= dataFim);
    }
    
    if (tipoMovimento) {
        relatoriosFiltrados = relatoriosFiltrados.filter(r => r.tipoMovimento === tipoMovimento);
    }
    
    atualizarTabelaRelatorios(relatoriosFiltrados);
    atualizarEstatisticasRelatorios(relatoriosFiltrados);
}

// Atualizar tabela de relatórios
function atualizarTabelaRelatorios(relatoriosExibir = relatorios) {
    const tbody = document.getElementById('tabela-relatorios').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    relatoriosExibir.forEach(relatorio => {
        const row = tbody.insertRow();
        row.setAttribute('data-id', relatorio.id);
        row.innerHTML = `
            <td>
                <button class="btn btn-sm btn-outline-primary expand-btn">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </td>
            <td>${relatorio.numero}</td>
            <td>${formatarData(relatorio.data)}</td>
            <td>${relatorio.tipoMovimento}</td>
            <td>${relatorio.totalProdutos || 0}</td>
            <td>${relatorio.totalPaletes || 0}</td>
            <td>
                <button class="btn btn-sm btn-outline-success me-1" title="Gerar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" title="Exportar Excel">
                    <i class="fas fa-file-excel"></i>
                </button>
            </td>
        `;
        
        // Adicionar linha expansível para detalhes
        const detalhesRow = tbody.insertRow();
        detalhesRow.className = 'expandable-content';
        detalhesRow.setAttribute('data-parent', relatorio.id);
        detalhesRow.innerHTML = `
            <td colspan="7">
                <div class="p-3">
                    <h6>Detalhes do Relatório - ${relatorio.numero}</h6>
                    
                    <div class="mb-3">
                        <h7>📦 MOVIMENTAÇÃO DE PRODUTOS</h7>
                        <ul class="list-group mt-2">
                            ${relatorio.produtos && relatorio.produtos.length > 0 ? 
                                relatorio.produtos.map(p => `
                                    <li class="list-group-item">
                                        ${p.sku} - ${p.nome} - Qtd: ${p.quantidade} - Tipo: ${p.tipo}
                                    </li>
                                `).join('') : 
                                '<li class="list-group-item">Nenhuma movimentação de produtos</li>'
                            }
                        </ul>
                    </div>
                    
                    <div>
                        <h7>🏭 MOVIMENTAÇÃO DE PALETES</h7>
                        <ul class="list-group mt-2">
                            ${relatorio.paletes && relatorio.paletes.length > 0 ? 
                                relatorio.paletes.map(p => `
                                    <li class="list-group-item">
                                        ${p.tipo} - Entrada: ${p.entrada} paletes - Saída: ${p.saida} paletes
                                    </li>
                                `).join('') : 
                                '<li class="list-group-item">Nenhuma movimentação de paletes</li>'
                            }
                        </ul>
                    </div>
                </div>
            </td>
        `;
    });
}

// Alternar detalhes do relatório
function toggleDetalhesRelatorio(id) {
    const detalhes = document.querySelector(`.expandable-content[data-parent="${id}"]`);
    const btn = document.querySelector(`tr[data-id="${id}"] .expand-btn i`);
    
    if (detalhes.classList.contains('active')) {
        detalhes.classList.remove('active');
        btn.classList.remove('fa-chevron-up');
        btn.classList.add('fa-chevron-down');
    } else {
        // Fechar outros detalhes abertos
        document.querySelectorAll('.expandable-content.active').forEach(el => {
            el.classList.remove('active');
            const parentId = el.getAttribute('data-parent');
            const parentBtn = document.querySelector(`tr[data-id="${parentId}"] .expand-btn i`);
            if (parentBtn) {
                parentBtn.classList.remove('fa-chevron-up');
                parentBtn.classList.add('fa-chevron-down');
            }
        });
        
        detalhes.classList.add('active');
        btn.classList.remove('fa-chevron-down');
        btn.classList.add('fa-chevron-up');
    }
}

// Atualizar estatísticas de relatórios
function atualizarEstatisticasRelatorios(relatoriosExibir = relatorios) {
    const totalEntradas = relatoriosExibir
        .filter(r => r.tipoMovimento === 'Entrada')
        .reduce((total, r) => total + (r.totalProdutos || 0), 0);
    
    const totalSaidas = relatoriosExibir
        .filter(r => r.tipoMovimento === 'Saída')
        .reduce((total, r) => total + (r.totalProdutos || 0), 0);
    
    const saldoFinal = totalEntradas - totalSaidas;
    const totalMovimentacoes = relatoriosExibir.length;
    
    document.getElementById('total-entradas').textContent = totalEntradas;
    document.getElementById('total-saidas').textContent = totalSaidas;
    document.getElementById('saldo-final').textContent = saldoFinal;
    document.getElementById('total-movimentacoes').textContent = totalMovimentacoes;
}

// Gerar relatório PDF
function gerarRelatorioPDF() {
    // Simulação de geração de PDF
    mostrarToast('Relatório PDF gerado com sucesso!', 'success');
}

// Exportar relatório CSV
function exportarCSVRelatorios() {
    // Simulação de exportação CSV
    mostrarToast('Exportação para CSV iniciada!', 'success');
}

// Mostrar modal de usuário
function mostrarModalUsuario() {
    const modal = new bootstrap.Modal(document.getElementById('modal-usuario'));
    modal.show();
}

// Salvar novo usuário
function salvarNovoUsuario() {
    const nome = document.getElementById('nome-usuario').value;
    const usuario = document.getElementById('login-usuario').value;
    const senha = document.getElementById('senha-usuario').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    
    if (!nome || !usuario || !senha || !confirmarSenha) {
        mostrarToast('Preencha todos os campos!', 'warning');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarToast('As senhas não coincidem!', 'warning');
        return;
    }
    
    // Verificar se usuário já existe
    if (usuarios.find(u => u.usuario === usuario)) {
        mostrarToast('Usuário já existe!', 'warning');
        return;
    }
    
    const novoUsuario = {
        id: Date.now(),
        nome: nome,
        usuario: usuario,
        senha: senha,
        chave: gerarChaveAcesso(),
        dataCriacao: new Date().toISOString()
    };
    
    usuarios.push(novoUsuario);
    salvarDados();
    atualizarTabelaUsuarios();
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-usuario'));
    modal.hide();
    
    // Limpar formulário
    document.getElementById('form-novo-usuario').reset();
    
    mostrarToast('Usuário criado com sucesso!', 'success');
}

// Gerar chave de acesso
function gerarChaveAcesso() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Atualizar tabela de usuários
function atualizarTabelaUsuarios() {
    const tbody = document.getElementById('tabela-usuarios').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.usuario}</td>
            <td>${usuario.chave}</td>
            <td>${formatarData(usuario.dataCriacao)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger excluir-usuario">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Adicionar evento de exclusão (exceto para admin)
        if (usuario.usuario !== 'admin') {
            row.querySelector('.excluir-usuario').addEventListener('click', function() {
                if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
                    usuarios = usuarios.filter(u => u.id !== usuario.id);
                    salvarDados();
                    atualizarTabelaUsuarios();
                    mostrarToast('Usuário excluído!', 'success');
                }
            });
        } else {
            row.querySelector('.excluir-usuario').disabled = true;
            row.querySelector('.excluir-usuario').classList.add('disabled');
        }
    });
}

// Exportar dados do sistema
function exportarDados() {
    const dados = {
        produtos: produtos,
        movimentacoes: movimentacoes,
        movimentacoesPaletes: movimentacoesPaletes,
        usuarios: usuarios,
        relatorios: relatorios,
        contadorSKU: contadorSKU,
        contadorRelatorio: contadorRelatorio,
        dataExportacao: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-estoquepro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarToast('Backup exportado com sucesso!', 'success');
}

// Importar dados do sistema
function importarDados() {
    const input = document.getElementById('arquivo-backup');
    
    if (!input.files.length) {
        mostrarToast('Selecione um arquivo de backup!', 'warning');
        return;
    }
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            // Validar estrutura dos dados
            if (!dados.produtos || !Array.isArray(dados.produtos)) {
                throw new Error('Estrutura de dados inválida!');
            }
            
            if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
                produtos = dados.produtos || [];
                movimentacoes = dados.movimentacoes || [];
                movimentacoesPaletes = dados.movimentacoesPaletes || [];
                usuarios = dados.usuarios || [];
                relatorios = dados.relatorios || [];
                contadorSKU = dados.contadorSKU || 1000;
                contadorRelatorio = dados.contadorRelatorio || 1;
                
                salvarDados();
                carregarDados();
                atualizarDashboard();
                atualizarTabelaEstoque();
                atualizarTabelaRelatorios();
                atualizarTabelaUsuarios();
                
                mostrarToast('Dados importados com sucesso!', 'success');
            }
        } catch (error) {
            mostrarToast('Erro ao importar dados: arquivo inválido!', 'danger');
        }
    };
    
    reader.readAsText(file);
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
    localStorage.setItem('movimentacoesPaletes', JSON.stringify(movimentacoesPaletes));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('relatorios', JSON.stringify(relatorios));
    localStorage.setItem('contadorSKU', contadorSKU.toString());
    localStorage.setItem('contadorRelatorio', contadorRelatorio.toString());
}

// Atualizar tabela de movimentações
function atualizarTabelaMovimentacoes() {
    const tbody = document.getElementById('tabela-movimentacoes').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    
    // Pegar as 5 movimentações mais recentes
    const recentes = [...movimentacoes]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);
    
    recentes.forEach(mov => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatarData(mov.data)}</td>
            <td>${mov.produto}</td>
            <td>${mov.tipo}</td>
            <td>${mov.quantidade}</td>
            <td>${mov.lote || 'N/A'}</td>
        `;
    });
}

// Formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Mostrar notificação toast
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toast-message');
    
    // Configurar cor baseada no tipo
    toast.className = `toast`;
    if (tipo === 'success') toast.classList.add('text-bg-success');
    else if (tipo === 'warning') toast.classList.add('text-bg-warning');
    else if (tipo === 'danger') toast.classList.add('text-bg-danger');
    else toast.classList.add('text-bg-info');
    
    toastMessage.textContent = mensagem;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Gerar relatório automático diário
function gerarRelatorioDiario() {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Verificar se já existe relatório para hoje
    if (relatorios.find(r => r.data === hoje)) {
        return;
    }
    
    // Movimentações de produtos do dia
    const movimentacoesHoje = movimentacoes.filter(m => m.data === hoje);
    
    // Movimentações de paletes do dia
    const paletesHoje = movimentacoesPaletes.filter(m => m.data === hoje);
    
    // Calcular totais por tipo de palete
    const paletesResumo = [
        { tipo: 'Fracionado', entrada: 0, saida: 0 },
        { tipo: 'Tambor', entrada: 0, saida: 0 },
        { tipo: 'IBC1000L', entrada: 0, saida: 0 }
    ];
    
    paletesHoje.forEach(p => {
        const resumo = paletesResumo.find(r => r.tipo === p.tipoProduto);
        if (resumo) {
            if (p.tipoMovimento === 'Entrada') {
                resumo.entrada += p.quantidade;
            } else {
                resumo.saida += p.quantidade;
            }
        }
    });
    
    const relatorio = {
        id: Date.now(),
        numero: `REL${contadorRelatorio.toString().padStart(6, '0')}`,
        data: hoje,
        tipoMovimento: 'Consolidado',
        totalProdutos: movimentacoesHoje.reduce((total, m) => total + m.quantidade, 0),
        totalPaletes: paletesHoje.reduce((total, p) => total + p.quantidade, 0),
        produtos: movimentacoesHoje,
        paletes: paletesResumo.filter(p => p.entrada > 0 || p.saida > 0)
    };
    
    relatorios.push(relatorio);
    contadorRelatorio++;
    salvarDados();
}

// Executar relatório diário às 18h
setTimeout(() => {
    gerarRelatorioDiario();
}, 1000);

// Executar a cada 24 horas
setInterval(() => {
    gerarRelatorioDiario();
}, 24 * 60 * 60 * 1000);
