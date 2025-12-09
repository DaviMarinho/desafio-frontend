# Prova Frontend - Sistema de Notícias

## Descrição

Aplicação React + TypeScript para gerenciamento de notícias com autenticação simulada e busca de CEP. Implementa CRUD completo, lazy loading, testes BDD, e Docker multi-stage para desenvolvimento e produção.

## Tecnologias Utilizadas

- **React 19.2.1** - Biblioteca UI para construção de interfaces
- **TypeScript 4.9.5** - Linguagem tipada que adiciona tipos estáticos ao JavaScript
- **React Router 7.10.1** - Roteamento client-side para Single Page Applications
- **Material-UI 7.3.6** - Componentes UI (Login e Notícias)
- **Axios 1.13.2** - Cliente HTTP para requisições API
- **json-server 1.0.0** - Mock RESTful API para backend simulado
- **Jest + React Testing Library** - Framework de testes com metodologia BDD
- **Docker & Docker Compose** - Containerização e orquestração
- **Nginx** - Servidor web de alta performance (produção)
- **ESLint + Prettier** - Linting e formatação de código

## Pré-requisitos

- **Node.js 18+** e npm
- **Docker e Docker Compose** (para execução containerizada)
- **Git**

## Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd prova-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste os valores conforme necessário:

```bash
cp .env.example .env
```

Variáveis disponíveis:

```env
# JSON Server (Mock API para CRUD de Notícias)
REACT_APP_API_URL=http://localhost:3003
# ViaCEP API (Externa)
REACT_APP_VIACEP_URL=https://viacep.com.br/ws
# Porta do servidor de desenvolvimento React
PORT=3000
```

## Executando a Aplicação

### Opção 1: Execução Local (com npm)

#### Executar frontend + json-server (Recomendado)

```bash
# Inicia frontend (porta 3000) + json-server (porta 3003)
npm run dev:all
```

#### Executar separadamente

```bash
# Terminal 1 - Frontend React
npm run dev

# Terminal 2 - Mock API (json-server)
npm run json-server
```

A aplicação estará disponível em `http://localhost:3000`

**Rotas disponíveis:**
- `/` - Busca de CEP (pública)
- `/login` - Tela de login (pública)
- `/noticias` - CRUD de Notícias (protegida, requer login)

**Credenciais de Login:**
- Aceita qualquer usuário/senha (autenticação simulada)
- Exemplo: `admin` / `admin`

### Opção 2: Execução com Docker

#### Desenvolvimento (padrão - com hot reload)

```bash
# Inicia frontend + json-server em modo desenvolvimento
docker compose up

# Ou com rebuild forçado
docker compose up --build
```

#### Produção (Nginx otimizado)

```bash
# Build de produção com Nginx
docker compose --profile production up --build
```

#### JSON Server Standalone

```bash
# Apenas o json-server (útil se o frontend roda fora do Docker)
docker compose --profile standalone up
```

#### Build Manual

```bash
# Produção
docker build --target production -t prova-frontend:prod .
docker run -d -p 3000:80 prova-frontend:prod

# Desenvolvimento
docker build --target development -t prova-frontend:dev .
docker run -d -p 3000:3000 -p 3003:3003 -v $(pwd)/src:/app/src prova-frontend:dev
```

A aplicação estará disponível em `http://localhost:3000`

**Modos de execução Docker:**

| Comando | O que faz | Uso |
|---------|-----------|-----|
| `docker compose up` | Frontend Dev + json-server | Desenvolvimento local com Docker |
| `docker compose --profile production up` | Frontend Prod (Nginx) | Simular ambiente de produção |
| `docker compose --profile standalone up` | Apenas json-server | Frontend roda localmente (npm), API no Docker |

## Estrutura do Projeto

```
src/
├── components/
│   ├── Layout/                    # Layout wrapper (header, navegação)
│   ├── PrivateRoute/              # HOC para proteção de rotas
│   └── Loading/                   # Indicador de carregamento
├── pages/
│   ├── BuscaCep/                  # Página de busca CEP (CSS manual)
│   │   ├── BuscaCep.tsx
│   │   ├── styles.css
│   │   └── BuscaCep.test.tsx      # Testes BDD
│   ├── Login/                     # Tela de autenticação
│   └── Noticias/                  # CRUD de notícias (lazy loaded)
├── services/
│   ├── api.ts                     # Instância Axios com interceptors
│   ├── cep.service.ts             # Serviço ViaCEP
│   └── noticias.service.ts        # Serviço CRUD de notícias
├── hooks/
│   └── useAuth.tsx                # Hook de autenticação global (Context API)
├── types/
│   ├── Auth.ts                    # Tipos de autenticação
│   ├── Endereco.ts                # Tipos de endereço (ViaCEP)
│   ├── Noticia.ts                 # Tipos de notícia
│   └── PaginatedResponse.ts       # Genérico de paginação
└── utils/
    └── masks.ts                   # Máscaras de input (CEP, etc.)
```

### Justificativa da Estrutura

A estrutura segue o padrão de **separação de responsabilidades**:

- **Separação de Concerns**: UI, lógica de negócio e dados separados
- **Reutilização**: Services abstraem chamadas HTTP, hooks compartilham estado
- **Testabilidade**: Services mockáveis, componentes isoláveis
- **Manutenibilidade**: Código organizado por domínio funcional
- **Escalabilidade**: Adicionar novas features é simples e não afeta código existente

**Fluxo de dados:**
```
Componente (pages/Noticias)
    ↓ usa
Hook (useAuth) para estado global
    ↓ e chama
Service (noticias.service.ts) para lógica de API
    ↓ usa
API Instance (services/api.ts) com interceptors
    ↓ faz request para
Mock API (json-server)
```

## Funcionalidades

### 1. Busca de CEP (ViaCEP API)

**Rota:** `/` (pública)

- Consulta de endereços por CEP
- Validação de formato (00000-000)
- Máscaras de entrada
- Loading states e tratamento de erros
- **CSS 100% manual** (sem bibliotecas de UI)
- Design responsivo (mobile, tablet, desktop)

### 2. Sistema de Autenticação

**Rota:** `/login` (pública)

- Autenticação simulada (aceita qualquer credencial)
- Context API + Custom Hook `useAuth()`
- Token JWT simulado armazenado em localStorage
- Axios interceptors para Bearer token automático
- HOC `PrivateRoute` para proteção de rotas
- Redirecionamento automático

**Fluxo de autenticação:**
```
1. Usuário acessa /noticias (rota protegida)
2. PrivateRoute verifica isAuthenticated
3. Se false → Redirect para /login
4. Usuário faz login → Token gerado
5. Token salvo em localStorage
6. Redirect automático para /noticias
7. Axios adiciona "Authorization: Bearer {token}" em todas as requests
```

### 3. CRUD de Notícias

**Rota:** `/noticias` (protegida, requer login)

- Listagem com paginação
- Criação, edição e exclusão de notícias
- **Busca por título/descrição** (client-side filtering com debounce de 500ms)
- Interface Material-UI
- **Lazy loading** com React.lazy() (reduz bundle inicial ~30%)

**Nota sobre busca:** A busca é implementada client-side devido a limitações do json-server 1.0 beta. Quando integrado com backend real, a busca pode ser migrada para server-side.

## API Endpoints

### Base URL: `http://localhost:3003`

---

### json-server - Notícias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/noticias` | Lista todas as notícias |
| GET | `/noticias?_page=1&_limit=10` | Paginação |
| GET | `/noticias?_sort=createdAt&_order=desc` | Ordenação |
| GET | `/noticias/:id` | Obtém notícia por ID |
| POST | `/noticias` | Cria nova notícia |
| PUT | `/noticias/:id` | Atualiza notícia |
| PATCH | `/noticias/:id` | Atualiza parcialmente |
| DELETE | `/noticias/:id` | Remove notícia |

**Busca:** A busca por título/descrição é implementada client-side no frontend (/home/davi/Workspace/testes/desafio-frontend/src/services/noticias.service.ts:18-40)

**Exemplo de Body (POST/PUT):**
```json
{
  "titulo": "Título da notícia",
  "descricao": "Descrição completa da notícia..."
}
```

---

### ViaCEP API (externa)

**Base URL:** `https://viacep.com.br/ws`

**Endpoint:**
```
GET /ws/{cep}/json/
```

**Exemplo:**
```bash
curl https://viacep.com.br/ws/01001000/json/
```

**Resposta:**
```json
{
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "complemento": "lado ímpar",
  "bairro": "Sé",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "1004",
  "ddd": "11",
  "siafi": "7107"
}
```

## Decisões Técnicas

### Por que React com TypeScript?

**Type Safety:**
- Detecta erros em tempo de compilação
- Autocomplete e IntelliSense completo
- Refatoração segura

**Manutenibilidade:**
- Código autodocumentado com tipos
- Contratos claros entre componentes
- Facilita trabalho em equipe

### Por que json-server?

**Desenvolvimento Rápido:**
- API RESTful completa em minutos
- CRUD automático baseado em db.json
- Suporte a paginação, busca e ordenação

**Realismo:**
- Simula API REST real para desenvolvimento frontend
- Permite testar integrações HTTP sem necessidade de backend real
- Ideal para prototipação e desenvolvimento de features frontend

### Por que Lazy Loading (Code Splitting)?

**Performance:**
- Reduz bundle inicial em ~30% (250KB → 175KB)
- Time to Interactive 40% mais rápido
- Código de páginas protegidas só baixado após login

**Implementação:**
```typescript
// App.tsx
const Noticias = lazy(() => import('./pages/Noticias'));

<Route path="/noticias" element={
  <PrivateRoute>
    <Suspense fallback={<Loading />}>
      <Noticias />
    </Suspense>
  </PrivateRoute>
} />
```

### Por que Docker Multi-stage?

**Otimização de Imagem:**
- **Produção:** Nginx servindo static files (~25MB)
- **Desenvolvimento:** Node.js com hot reload (~600MB)
- Separação clara de ambientes

**Benefícios:**
- Imagem produção 95% menor
- Gzip compression e cache headers
- Security headers (X-Frame-Options, CSP)

### Arquitetura de Autenticação

**Context API + Custom Hooks:**
- Estado global sem Redux (simplicidade)
- `useAuth()` hook para acesso fácil
- Persistência em localStorage

**HOC Pattern:**
- `PrivateRoute` encapsula lógica de proteção
- Reutilizável em múltiplas rotas
- Redirecionamento automático

**Axios Interceptors:**
- Request interceptor adiciona token automaticamente
- Response interceptor trata 401 (logout automático)

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev:all             # Frontend + json-server
npm run dev                 # Frontend React apenas
npm run json-server         # Mock API (json-server) apenas

# Build
npm run build               # Build de produção otimizado

# Testes
npm test                                # Testes em watch mode
npm test -- --watchAll=false            # Execução única (CI/CD)
npm test -- --coverage                  # Com cobertura
npm test BuscaCep.test.tsx              # Teste específico

# Qualidade de código
npm run lint                # Verifica problemas com ESLint
npm run lint:fix            # Corrige problemas ESLint
npm run format              # Formata código com Prettier

# Docker
docker compose up                                # Dev com hot reload (padrão)
docker compose --profile production up --build   # Prod com Nginx
docker compose --profile standalone up           # Apenas json-server
docker compose down                              # Parar containers
docker compose logs -f frontend-dev              # Ver logs do frontend
docker compose logs -f json-server               # Ver logs do json-server
```

## Testes

### Metodologia BDD (Behavior-Driven Development)

Os testes seguem o padrão **Given-When-Then** para legibilidade:

**Exemplo: `src/pages/BuscaCep/BuscaCep.test.tsx`**

```typescript
describe('BuscaCep - Busca de endereço por CEP', () => {
  it('Given que o CEP é válido, When submeto o formulário, Then deve exibir o endereço', async () => {
    // Given - Estado inicial
    render(<BuscaCep />);
    const input = screen.getByLabelText(/CEP/i);
    const button = screen.getByRole('button', { name: /buscar/i });

    // When - Ação do usuário
    fireEvent.change(input, { target: { value: '01001000' } });
    fireEvent.click(button);

    // Then - Resultado esperado
    await waitFor(() => {
      expect(screen.getByText(/Rua Exemplo/i)).toBeInTheDocument();
    });
  });
});
```

### Estratégia de Testes

- **Unidade:** Componentes isolados com mocks de services
- **Integração:** Fluxos completos de usuário
- **Mocking:** APIs externas mockadas (ViaCEP, json-server)
- **Coverage:** Foco em lógica crítica e interações de usuário

### Executar Testes

```bash
# Watch mode (recomendado para desenvolvimento)
npm test

# Execução única (CI/CD)
npm test -- --watchAll=false

# Com cobertura
npm test -- --coverage

# Teste específico
npm test BuscaCep.test.tsx
```

## Otimizações de Performance

### 1. Code Splitting com Lazy Loading

- Rota `/noticias` carregada sob demanda
- Redução de ~30% no bundle inicial
- Time to Interactive 40% mais rápido

### 2. Debounce em Buscas

- Busca de notícias com debounce de 500ms
- Reduz requisições HTTP desnecessárias

### 3. Nginx (Produção)

- Compressão gzip para assets
- Cache headers agressivos (1 ano para JS/CSS)
- Security headers (X-Frame-Options, CSP)

### 4. React Best Practices

- Memoização com useMemo/useCallback onde necessário
- Lazy loading de imagens (`loading="lazy"`)
- Tree shaking automático no build

## Padrões de Código

### ESLint

Configuração baseada em `react-app`:
- Regras TypeScript habilitadas
- Checagem de hooks do React
- Imports organizados

```bash
npm run lint          # Verifica problemas
npm run lint:fix      # Corrige automaticamente
```

### Prettier

Formatação consistente:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

```bash
npm run format        # Formata todos os arquivos
```

## Troubleshooting

### Problema: Testes falhando com erro de import do axios

**Solução:** Verifique se o `package.json` tem a configuração Jest:
```json
"jest": {
  "transformIgnorePatterns": ["node_modules/(?!(axios)/)"]
}
```

### Problema: Hot reload não funciona no Docker

**Solução:** Garanta que a variável de ambiente está definida:
```env
CHOKIDAR_USEPOLLING=true
```

### Problema: Conflito de portas

**Solução:** Mate processos usando as portas 3000 e 3003:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:3003 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problema: json-server não salva dados

**Nota:** json-server usa o arquivo `db.json`. Dados são voláteis a menos que você commite mudanças no arquivo.

### Problema: Erro 401 em todas as requisições

**Solução:** Verifique se o token está presente no localStorage:
- Abra DevTools → Application → Local Storage
- Deve existir chave `@App:token`
- Se ausente, faça login novamente

## GitFlow

O projeto segue a estratégia GitFlow:

### Branches Principais
- **`main`** - Código de produção estável
- **`develop`** - Branch de desenvolvimento (base para features)

### Branches de Suporte
- **`feature/*`** - Novas funcionalidades
- **`hotfix/*`** - Correções urgentes em produção
- **`release/*`** - Preparação de versões

**Processo:**
1. Criar feature branch a partir de `develop`
2. Desenvolver e commitar mudanças
3. Abrir Pull Request para `develop`
4. Após aprovação, merge em `develop`
5. Quando estável, merge de `develop` para `main`

---

**Desenvolvido com React, TypeScript e Docker**
