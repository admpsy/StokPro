# Sistema de Controle de Estoque - EstoquePro

Sistema completo para gerenciamento de estoque com controle de produtos, movimentações, relatórios e usuários.

## Funcionalidades

### ✅ Autenticação de Usuários
- Login seguro com usuário e senha
- Controle de acesso administrativo
- Gerenciamento de múltiplos usuários

### ✅ Gestão Completa de Produtos
- Cadastro de produtos com SKU automático
- Controle de lotes e validades
- Cálculo automático de status (Em Estoque, Vencimento Próximo, Fora de Estoque)
- Notificações de vencimento (1 ano de antecedência)

### ✅ Movimentações de Estoque
- Registro de entradas, saídas e devoluções
- Controle de movimentações de paletes
- Histórico completo de movimentações

### ✅ Relatórios Avançados
- Relatórios diários automáticos
- Filtros por período e tipo de movimentação
- Exportação para PDF e Excel
- Estatísticas consolidadas

### ✅ Backup e Restauração
- Exportação de dados em JSON
- Importação de backups
- Validação de estrutura de dados

## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5.3 para interface
- Chart.js para gráficos
- Font Awesome para ícones
- LocalStorage para persistência de dados

## Como Usar

### Primeiro Acesso
1. Acesse o sistema através do arquivo `login.html`
2. Use as credenciais padrão:
   - **Usuário:** admin
   - **Senha:** admin123

### Cadastro de Produtos
1. Navegue até "Produtos" no menu lateral
2. Preencha os campos obrigatórios
3. Adicione à lista e salve os produtos

### Controle de Estoque
1. Acesse "Estoque" para visualizar todos os produtos
2. Use os filtros para buscar produtos específicos
3. Expanda as linhas para ver detalhes dos lotes

### Relatórios
1. Vá para "Relatórios" para visualizar movimentações
2. Aplique filtros por data e tipo
3. Exporte relatórios em PDF ou Excel

## Estrutura de Dados

O sistema armazena os seguintes dados:
- **Produtos:** SKU, nome, tipo, quantidade, lotes, datas
- **Movimentações:** Data, produto, tipo, quantidade, lote
- **Usuários:** Nome, usuário, senha, chave de acesso
- **Relatórios:** Número, data, movimentações, totais

## Personalização

### Cores do Sistema
Edite as variáveis CSS no arquivo `estilo.css`:
```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --success-color: #27ae60;
    --danger-color: #e74c3c;
}
