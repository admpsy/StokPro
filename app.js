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
    
    // Verificar se estamos na página de login
    if (document.getElementById('loginContainer')) {
        inicializarLogin();
    } else {
        inicializarSistema();
    }
});

function inicializarLogin() {
    console.log('🔐 Inicializando página de login...');
    
    // Verificar se já está logado
    const usuarioLogado = localStorage.getItem('estoquepro-usuario-logado');
    if (usuarioLogado === 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar eventos de login
    configurarEventosLogin();
    
    // Adicionar dados de exemplo se necessário
    if (sistema.produtos.length === 0) {
        adicionarDadosExemplo();
    }
}

function inicializarSistema() {
    console.log('⚙️ Inicializando sistema principal...');
    
    // Verificar se está logado
    if (!sistema.usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar sistema
    const systemContainer = document.getElementById('systemContainer');
    if (systemContainer) {
        systemContainer.style.display = 'block';
    }
    
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
    const skuField = document.getElementById('sku');
    if (skuField) {
        skuField.value = 'PROD' + sistema.proximoSku;
    }
    
    // Navegar para dashboard
    navegarPara('dashboard');
    
    console.log('✅ Sistema inicializado com sucesso!');
}

// =============================================
// SISTEMA DE LOGIN
// =============================================

function configurarEventosLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('❌ Formulário de login não encontrado!');
        return;
    }

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
            
            window.location.href = 'index.html';
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

// =============================================
// FUNÇÕES PRINCIPAIS DO SISTEMA
// =============================================

function configurarEventosSistema() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('estoquepro-usuario-logado');
                sistema.usuarioLogado = null;
                window.location.href = 'login.html';
            }
        });
    }

    // Navegação do menu
    const navLinks = document.querySelectorAll('#sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pagina = this.getAttribute('data-page');
            navegarPara(pagina);
            
            // Atualizar menu ativo
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Menu mobile
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const content = document.getElementById('content');
            if (sidebar && content) {
                sidebar.classList.toggle('active');
                content.classList.toggle('sidebar-active');
            }
        });
    }

    // Cadastro de Produtos
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarProdutos();
        });
    }

    const clearFormBtn = document.getElementById('clearFormBtn');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            document.getElementById('productForm').reset();
            document.getElementById('sku').value = 'PROD' + sistema.proximoSku;
            mostrarToast('Formulário limpo!', 'info');
        });
    }

    // ... (continuar com os outros eventos)
}

// =============================================
// FUNÇÕES DE NAVEGAÇÃO
// =============================================

function navegarPara(pagina) {
    console.log('📍 Navegando para:', pagina);
    
    // Esconder todas as páginas
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.add('d-none');
    });
    
    // Mostrar página selecionada
    const paginaAlvo = document.getElementById(`${pagina}-content`);
    if (paginaAlvo) {
        paginaAlvo.classList.remove('d-none');
    } else {
        console.error('❌ Página não encontrada:', pagina);
        return;
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
    
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = titulos[pagina] || 'Dashboard';
    }
    
    // Verificar permissões para configurações
    if (pagina === 'configuracoes' && sistema.usuarioLogado.tipo !== 'administrador') {
        mostrarToast('Acesso restrito a administradores!', 'error');
        navegarPara('dashboard');
        return;
    }
    
    // Atualizar breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <li class="breadcrumb-item"><a href="#" data-page="dashboard">Home</a></li>
            <li class="breadcrumb-item active">${titulos[pagina]}</li>
        `;
        
        // Adicionar evento ao breadcrumb
        const breadcrumbLink = breadcrumb.querySelector('a');
        if (breadcrumbLink) {
            breadcrumbLink.addEventListener('click', function(e) {
                e.preventDefault();
                navegarPara('dashboard');
            });
        }
    }
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

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
    
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white ${config.bg} border-0`;
    toast.setAttribute('role', 'alert');
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
    
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function carregarDados() {
    try {
        const dadosSalvos = localStorage.getItem('estoquepro-data');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            sistema = { ...sistema, ...dados };
            console.log('✅ Dados carregados do localStorage');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

function salvarDados() {
    try {
        localStorage.setItem('estoquepro-data', JSON.stringify(sistema));
        console.log('💾 Dados salvos no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
    }
}

function adicionarDadosExemplo() {
    console.log('📦 Adicionando dados de exemplo...');
    
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
        },
        {
            id: 2,
            sku: 'PROD002',
            nome: 'Produto B',
            tipo: 'Bombona',
            quantidade: 30,
            lote: 'LOTE2023002',
            dataFabricacao: '2022-06-10',
            dataValidade: '2026-06-10',
            dataCadastro: '2022-06-15',
            dataAtualizacao: '2023-11-10'
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
    
    console.log('✅ Dados de exemplo adicionados');
}

// =============================================
// FUNÇÕES DE VALIDAÇÃO E FORMATAÇÃO
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

function calcularDataValidade(dataFabricacao) {
    if (!dataFabricacao) return null;
    const fabricacao = new Date(dataFabricacao);
    fabricacao.setFullYear(fabricacao.getFullYear() + 4);
    return fabricacao.toISOString().split('T')[0];
}

function formatarData(data) {
    if (!data) return 'N/A';
    try {
        return new Date(data).toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

// =============================================
// EXPORTAÇÃO DE FUNÇÕES PARA USO GLOBAL
// =============================================

// Tornar funções disponíveis globalmente para debugging
window.debugSistema = function() {
    console.log('=== DEBUG DO SISTEMA ===');
    console.log('Usuário logado:', sistema.usuarioLogado);
    console.log('Total produtos:', sistema.produtos.length);
    console.log('Total movimentações:', sistema.movimentacoes.length);
    console.log('Total usuários:', sistema.usuarios.length);
    console.log('========================');
};

window.limparDados = function() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        localStorage.removeItem('estoquepro-data');
        localStorage.removeItem('estoquepro-usuario-logado');
        location.reload();
    }
};

console.log('📦 Sistema EstoquePro carregado com sucesso!');
