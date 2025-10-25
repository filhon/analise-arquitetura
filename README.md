# Sistema Profissional de Eleição de Oficiais para Igrejas

Este projeto é um sistema completo para gestão de eleições de oficiais em igrejas, com foco em escalabilidade, segurança, experiência do usuário e geração de relatórios profissionais.

## Funcionalidades Principais

- **Gestão de Membros:** Importação via CSV, cadastro, edição e exclusão de membros.
- **Gestão de Candidatos:** Cadastro, edição, upload de foto (até 2MB, base64), separação por cargos (Presbíteros, Diáconos).
- **Votação Escalável:** Controle de votos por candidato, validação de quórum, projeção fullscreen para acompanhamento visual.
- **Presença em Tempo Real:** Marcação de presença, sincronização automática entre dispositivos (Firebase Realtime Database).
- **Relatórios Profissionais:** Geração de PDF com lista de presentes (Nome, CPF, Assinatura), exportação/importação de dados.
- **Interface Responsiva:** Design minimalista, modo escuro, Material Design 3, fonte Inter, ícones Google Material.
- **Sincronização Híbrida:** Utiliza localStorage e Firebase para garantir performance e disponibilidade offline.
- **Controle de Quórum:** Efeito blur e overlays explicativos quando quórum não atingido, validação em tempo real.
- **PWA Ready:** Suporte a Service Worker, manifest.json, uso offline.

## Tecnologias Utilizadas

- **TypeScript** (ES6 modules)
- **Vite** (bundler)
- **Firebase Realtime Database** (sincronização)
- **jsPDF, html2canvas** (relatórios PDF)
- **Google Fonts: Inter**
- **Google Material Icons**

## Estrutura de Pastas

```
/src
  /modules        # Componentes principais
  /types          # Definições TypeScript
  /utils          # Utilitários
/assets
  /css            # Estilos
  /icons          # Ícones
/docs             # Documentação técnica e de alterações
/public           # Arquivos estáticos
/reports          # Relatórios gerados
/tests            # Testes unitários
```

## Como Executar Localmente

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```sh
   npm run dev
   ```
3. Acesse em [http://localhost:3000/](http://localhost:3000/)

## 🚀 Deploy em Produção

Para fazer deploy em produção, siga o guia completo em [`DEPLOY-PRODUCAO.md`](./DEPLOY-PRODUCAO.md).

### Pré-requisitos Rápidos:

- Conta no [Vercel](https://vercel.com) ou similar
- Projeto Firebase configurado
- Variáveis de ambiente configuradas

### Deploy Automático:

1. Conecte seu repositório Git no Vercel
2. Configure as variáveis de ambiente do Firebase
3. Deploy automático será feito

### Verificação:

- ✅ Aplicação carrega sem erros
- ✅ Firebase sincroniza corretamente
- ✅ PWA funciona offline
- ✅ Votação simultânea funciona

## Documentação

A documentação detalhada está disponível na pasta `/docs`, incluindo:

- Guia de configuração do Firebase
- Checklist de sincronização
- Alterações de design e layout
- Correções e histórico de mudanças
- Referências de ícones e fontes

## Contribuição

1. Forke o projeto
2. Crie uma branch (`git checkout -b feature/nome-feature`)
3. Commit suas alterações (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nome-feature`)
5. Abra um Pull Request

## Licença

Este projeto é distribuído sob a licença MIT.

---

> Para dúvidas, sugestões ou suporte, consulte a documentação em `/docs` ou abra uma issue.
