// =============================================
// SISTEMA DE CONTROLE DE ESTOQUE - ESTOQUEPRO
// =============================================

// Dados iniciais do sistema
let sistema = {
    produtos: [],
    movimentacoes: [],
    movimentacoesPaletes: [],
    usuarios: [
        { 
            id: 1, 
            nome: "Administrador", 
            usuario: "admin",
            tipo: "administrador", 
            chave: "admin123", 
            dataCriacao: "2023-01-01",
            email: "admin@empresa.com"
        }
    ],
    relatorios: [],
    configuracoes: {
        nomeSistema: "EstoquePro",
        alertaVencimento: 365,
        autoBackup: true
    },
    usuarioLogado: null,
    produtosParaCadastrar: [],
    proximoRelatorioId: 1,
    proximoSku: 1000
};

// =============================================
// INICIALIZAÇÃO DO SISTEMA
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Sistema EstoquePro...');
    
    // Carregar dados salvos
    carregarDados();
    
    // Verificar se estamos na página de login ou sistema
    if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/')) {
        inicializarLogin();
    } else {
        inicializarSistema();
    }
});

function inicializarLogin() {
    // Verificar se já está logado
    if (sistema.usuarioLogado) {
        redirecionarParaSistema();
        return;
    }
    
    // Verificar login automático
    const usuarioSalvo = localStorage.getItem('estoquepro-usuario');
    const senhaSalva = localStorage.getItem('estoquepro-senha');
    
    if (usuarioSalvo && senhaSalva) {
        console.log('🔑 Tentando login automático...');
        const resultado = fazerLogin(usuarioSalvo, senhaSalva);
        if (resultado.success) {
            redirecionarParaSistema();
            return;
        }
    }
    
    // Configurar eventos de login
    configurarEventosLogin();
    
    // Adicionar dados de exemplo se necessário
    if (sistema.produtos.length === 0) {
        adicionarDadosExemplo();
    }
}

function inicializarSistema() {
    // Verificar se está logado
    if (!sistema.usuarioLogado) {
        redirecionarParaLogin();
        return;
    }
    
    // Mostrar sistema
    document.getElementById('systemContainer').style.display = 'block';
    
    // Configurar eventos
    configurarEventosSistema();
    
    // Atualizar interfaces
    atualizarDashboard();
    preencherListaProdutos();
    preencherSelectProdutos();
    preencherMovimentacoes();
    preencherRelatorios();
    preencherUsuarios();
    
    // Gerar SKU automático
    document.getElementById('sku').value = 'PROD' + sistema.proximoSku;
    
    // Navegar para dashboard
    navegarPara('dashboard');
    
    console.log('✅ Sistema inicializado com sucesso!');
}

// =============================================
// SISTEMA DE LOGIN
// =============================================

function configurarEventosLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🔐 Tentativa de login...');
        
        const identificador = document.getElementById('username').value;
        const senha = document.getElementById('password').value;
        const lembrar = document.getElementById('rememberMe').checked;
        
        const resultadoLogin = fazerLogin(identificador, senha);
        
        if (resultadoLogin.success) {
            console.log('✅ Login bem-sucedido!');
            
            // Salvar credenciais se solicitado
            if (lembrar) {
                localStorage.setItem('estoquepro-usuario', identificador);
                localStorage.setItem('estoquepro-senha', senha);
            } else {
                localStorage.removeItem('estoquepro-usuario');
                localStorage.removeItem('estoquepro-senha');
            }
            
            // Salvar estado de login
            localStorage.setItem('estoquepro-usuario-logado', 'true');
            
            redirecionarParaSistema();
            mostrarToast('Login realizado com sucesso!', 'success');
        } else {
            console.log('❌ Login falhou:', resultadoLogin.mensagem);
            mostrarErroLogin(resultadoLogin.mensagem);
        }
    });
}

function fazerLogin(identificador, senha) {
    // Verificar admin padrão
    if (identificador === 'admin' && senha === 'admin123') {
        sistema.usuarioLogado = sistema.usuarios.find(u => u.usuario === 'admin');
        return { success: true, mensagem: 'Login realizado com sucesso!' };
    }
    
    // Buscar usuário
    const usuario = sistema.usuarios.find(u => 
        (u.usuario === identificador || u.chave === identificador) && u.chave === senha);
    
    if (usuario) {
        sistema.usuarioLogado = usuario;
        return { success: true, mensagem: 'Login realizado com sucesso!' };
    }
    
    return { 
        success: false, 
        mensagem: 'Credenciais inválidas! Verifique seu usuário/chave e senha.' 
    };
}

function mostrarErroLogin(mensagem) {
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    if (usernameField) usernameField.classList.remove('is-invalid');
    if (passwordField) passwordField.classList.remove('is-invalid');
    
    if (usernameField) usernameField.classList.add('is-invalid');
    if (passwordField) passwordField.classList.add('is-invalid');
    
    // Remover alerta anterior
    const alertaAnterior = document.getElementById('loginAlert');
    if (alertaAnterior) alertaAnterior.remove();
    
    // Criar novo alerta
    const alerta = document.createElement('div');
    alerta.id = 'loginAlert';
    alerta.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alerta.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const loginBody = document.querySelector('.login-body');
    if (loginBody) {
        loginBody.appendChild(alerta);
    }
    
    if (usernameField) usernameField.focus();
}

function redirecionarParaSistema() {
    window.location.href = 'index.html';
}

function redirecionarParaLogin() {
    window.location.href = 'login.html';
}

// =============================================
// FUNÇÕES PRINCIPAIS DO SISTEMA
// =============================================

function configurarEventosSistema() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Deseja realmente sair do sistema?')) {
            localStorage.removeItem('estoquepro-usuario-logado');
            sistema.usuarioLogado = null;
            redirecionarParaLogin();
        }
    });

    // Navegação do menu
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pagina = this.getAttribute('data-page');
            navegarPara(pagina);
            
            document.querySelectorAll('#sidebar .nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Menu mobile
    document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('sidebar-active');
    });

    // Cadastro de Produtos
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarProdutos();
    });

    document.getElementById('clearFormBtn').addEventListener('click', function() {
        document.getElementById('productForm').reset();
        document.getElementById('sku').value = 'PROD' + sistema.proximoSku;
        mostrarToast('Formulário limpo!', 'info');
    });

    document.getElementById('addToListBtn').addEventListener('click', function() {
        adicionarProdutoParaCadastrar();
    });

    document.getElementById('generatePdfBtn').addEventListener('click', function() {
        gerarPdfProdutos();
    });

    // Estoque
    document.getElementById('searchProduct').addEventListener('input', filtrarProdutos);
    document.getElementById('filterCategory').addEventListener('change', filtrarProdutos);
    document.getElementById('exportExcelBtn').addEventListener('click', exportarExcel);

    // Movimentações
    document.getElementById('productMovementForm').addEventListener('submit', function(e) {
        e.preventDefault();
        registrarMovimentacaoProduto();
    });

    document.getElementById('palletMovementForm').addEventListener('submit', function(e) {
        e.preventDefault();
        registrarMovimentacaoPalete();
    });

    document.getElementById('filterMovementsBtn').addEventListener('click', filtrarMovimentacoes);

    // Relatórios
    document.getElementById('generateReportBtn').addEventListener('click', gerarRelatorio);
    document.getElementById('exportCsvBtn').addEventListener('click', exportarCsv);
    document.getElementById('generatePdfReportBtn').addEventListener('click', function() {
        gerarPdfRelatorio();
    });

    // Configurações
    document.getElementById('generateKeyBtn').addEventListener('click', gerarChaveAcesso);
    document.getElementById('exportDataBtn').addEventListener('click', exportarDados);
    document.getElementById('importDataBtn').addEventListener('click', function() {
        document.getElementById('importDataFile').click();
    });
    document.getElementById('importDataFile').addEventListener('change', function(e) {
        importarDados(e.target.files[0]);
    });
    document.getElementById('saveSettingsBtn').addEventListener('click', salvarConfiguracoes);

    // Modais
    document.getElementById('saveEditProductBtn').addEventListener('click', salvarEdicaoProduto);
    document.getElementById('saveAddBatchBtn').addEventListener('click', salvarNovoLote);

    // Preenchimento automático
    document.getElementById('productName').addEventListener('change', function() {
        const produtoId = this.value;
        if (produtoId) {
            const produto = sistema.produtos.find(p => p.id == produtoId);
            if (produto) {
                document.getElementById('productType').value = produto.tipo;
            }
        }
    });

    // Botões de navegação
    const verTodasBtn = document.querySelector('a[data-page="movimentacoes"]');
    if (verTodasBtn) {
        verTodasBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navegarPara('movimentacoes');
        });
    }

    const novoProdutoBtn = document.querySelector('button[data-page="cadastro-produto"]');
    if (novoProdutoBtn) {
        novoProdutoBtn.addEventListener('click', function() {
            navegarPara('cadastro-produto');
        });
    }
}

// =============================================
// FUNÇÕES DE NAVEGAÇÃO
// =============================================

function navegarPara(pagina) {
    console.log('Navegando para:', pagina);
    
    // Esconder todas as páginas
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.add('d-none');
    });
    
    // Mostrar página selecionada
    const paginaAlvo = document.getElementById(`${pagina}-content`);
    if (paginaAlvo) {
        paginaAlvo.classList.remove('d-none');
    }
    
    // Atualizar título
    const titulos = {
        'dashboard': 'Dashboard',
        'produtos': 'Estoque de Produtos',
        'cadastro-produto': 'Cadastro de Produtos',
        'movimentacoes': 'Movimentações',
        'relatorios': 'Relatórios',
        'configuracoes': 'Configurações'
    };
    
    document.querySelector('.page-title').textContent = titulos[pagina] || 'Dashboard';
    
    // Verificar permissões para configurações
    if (pagina === 'configuracoes' && sistema.usuarioLogado.tipo !== 'administrador') {
        mostrarToast('Acesso restrito a administradores!', 'error');
        navegarPara('dashboard');
        return;
    }
    
    // Atualizar breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb');
    breadcrumb.innerHTML = `
        <li class="breadcrumb-item"><a href="#" data-page="dashboard">Home</a></li>
        <li class="breadcrumb-item active">${titulos[pagina]}</li>
    `;
    
    breadcrumb.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        navegarPara('dashboard');
    });
}

// =============================================
// FUNÇÕES DO DASHBOARD
// =============================================

function atualizarDashboard() {
    const totalProdutos = sistema.produtos.length;
    const emEstoque = sistema.produtos.filter(p => calcularStatus(p) === 'em-estoque').length;
    const vencimentoProximo = sistema.produtos.filter(p => calcularStatus(p) === 'vencimento-proximo').length;
    const foraDeEstoque = sistema.produtos.filter(p => calcularStatus(p) === 'fora-de-estoque').length;
    
    document.getElementById('totalProdutos').textContent = totalProdutos;
    document.getElementById('emEstoque').textContent = emEstoque;
    document.getElementById('vencimentoProximo').textContent = vencimentoProximo;
    document.getElementById('foraDeEstoque').textContent = foraDeEstoque;
    
    atualizarGraficoEstoque(emEstoque, vencimentoProximo, foraDeEstoque);
    preencherMovimentacoesRecentes();
}

function atualizarGraficoEstoque(emEstoque, vencimentoProximo, foraDeEstoque) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (window.stockChartInstance) {
        window.stockChartInstance.destroy();
    }
    
    window.stockChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Em Estoque', 'Vencimento Próximo', 'Fora de Estoque'],
            datasets: [{
                data: [emEstoque, vencimentoProximo, foraDeEstoque],
                backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function preencherMovimentacoesRecentes() {
    const tbody = document.getElementById('recentMovementsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const todasMovimentacoes = [
        ...sistema.movimentacoes.map(m => ({
            ...m,
            tipoItem: 'produto',
            descricao: sistema.produtos.find(p => p.id === m.produtoId)?.nome || 'Produto não encontrado'
        })),
        ...sistema.movimentacoesPaletes.map(m => ({
            ...m,
            tipoItem: 'palete',
            descricao: m.tipo,
            tipo: m.movimento
        }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5);
    
    todasMovimentacoes.forEach(mov => {
        const tr = document.createElement('tr');
        const tipoTexto = {
            'entrada': 'Entrada',
            'saida': 'Saída',
            'devolucao': 'Devolução'
        }[mov.tipo] || mov.tipo;
        
        tr.innerHTML = `
            <td>${formatarData(mov.data)}</td>
            <td>${mov.descricao} ${mov.tipoItem === 'palete' ? '(Palete)' : ''}</td>
            <td>${tipoTexto}</td>
            <td>${mov.quantidade}</td>
            <td>${mov.lote || 'N/A'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// =============================================
// FUNÇÕES DE PRODUTOS
// =============================================

function preencherListaProdutos() {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sistema.produtos.forEach(produto => {
        const status = calcularStatus(produto);
        const badgeClass = `badge-${status}`;
        const statusText = {
            'em-estoque': 'Em Estoque',
            'vencimento-proximo': 'Vencimento Próximo',
            'fora-de-estoque': 'Fora de Estoque'
        }[status];
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.sku}</td>
            <td>${produto.nome}</td>
            <td>${produto.tipo}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.lote || 'N/A'}</td>
            <td><span class="badge ${badgeClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-info expand-btn" data-id="${produto.id}">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${produto.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-success add-batch-btn" data-id="${produto.id}">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${produto.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    configurarEventosProdutos();
}

function configurarEventosProdutos() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const produto = sistema.produtos.find(p => p.id == id);
            if (produto) {
                mostrarToast(`Detalhes de ${produto.nome}: ${produto.quantidade} unidades em estoque`, 'info');
            }
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editarProduto(id);
        });
    });
    
    document.querySelectorAll('.add-batch-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            adicionarLote(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            excluirProduto(id);
        });
    });
}

// ... (continuar com as demais funções do sistema)

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

function calcularStatus(produto) {
    if (!produto.dataValidade) return 'em-estoque';
    
    const hoje = new Date();
    const validade = new Date(produto.dataValidade);
    const diffTime = validade - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'fora-de-estoque';
    if (diffDays <= 365) return 'vencimento-proximo';
    return 'em-estoque';
}

function formatarData(data) {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
}

function mostrarToast(mensagem, tipo) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
    }
    
    const config = {
        'success': { bg: 'bg-success', icon: 'fa-check' },
        'error': { bg: 'bg-danger', icon: 'fa-exclamation-triangle' },
        'warning': { bg: 'bg-warning', icon: 'fa-exclamation-circle' },
        'info': { bg: 'bg-info', icon: 'fa-info-circle' }
    }[tipo] || { bg: 'bg-info', icon: 'fa-info-circle' };
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${config.bg} border-0`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${config.icon} me-2"></i> ${mensagem}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function carregarDados() {
    try {
        const dadosSalvos = localStorage.getItem('estoquepro-data');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            sistema = { ...sistema, ...dados };
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function salvarDados() {
    try {
        localStorage.setItem('estoquepro-data', JSON.stringify(sistema));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function adicionarDadosExemplo() {
    sistema.produtos = [
        {
            id: 1,
            sku: 'PROD001',
            nome: 'Produto A',
            tipo: 'Tambor',
            quantidade: 50,
            lote: 'LOTE2023001',
            dataFabricacao: '2023-01-15',
            dataValidade: '2027-01-15',
            dataCadastro: '2023-01-20',
            dataAtualizacao: '2023-11-15'
        }
    ];
    
    sistema.movimentacoes = [
        {
            id: 1,
            produtoId: 1,
            tipo: 'entrada',
            quantidade: 50,
            data: '2023-01-20',
            usuario: 'Administrador',
            lote: 'LOTE2023001'
        }
    ];
    
    sistema.proximoRelatorioId = 1;
    sistema.proximoSku = 1000;
}
