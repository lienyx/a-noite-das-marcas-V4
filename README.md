# A Noite das Marcas

Versão digital de "Town of Salem sem Mestre" para jogar no celular com amigos.

## Visual
Tema gótico em preto, azul-gelo e vermelho-sangue, com cartas de tarô e um personagem para cada um dos 25 papéis.
- `src/components/art/Characters.tsx`: os 25 personagens em SVG (um por papel) e as cores de cada facção.
- `src/components/art/TarotCard.tsx`: a carta de tarô usada na tela inicial, no pergaminho secreto e nas listas.
- `src/components/art/Ornaments.tsx`: caveira, corvo, morcego, bandeira, dado e a marca do jogo.
- `src/index.css`: cores, tipografia (Londrina Solid + Baloo 2, carregadas do Google Fonts) e componentes visuais.

## Rodar no seu computador
```
npm install
npm run dev
```
Abra http://localhost:3000. Para testar com outros celulares na mesma rede Wi-Fi, abra `http://IP-DO-SEU-PC:3000`.

## Publicar de graça (Render)
1. Suba esta pasta para o seu repositório no GitHub (substituindo os arquivos antigos; apague as pastas `db/` e `netlify/` e o `netlify.toml` se ainda existirem).
2. Em https://render.com, entre com sua conta do GitHub.
3. **New → Web Service** → escolha o repositório `A-Noite-das-Marcas`.
4. Preencha:
   - Runtime: Node
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free
   - Environment: `NODE_VERSION` = `22` e `NODE_ENV` = `production`
5. Clique em **Create Web Service**. Quando terminar, o link `https://....onrender.com` é o do jogo.

(O arquivo `render.yaml` já traz essas configurações, para quem preferir **New → Blueprint**.)

Observações:
- No plano grátis o servidor "dorme" após ~15 min sem uso. Abra o link 1 minuto antes de jogar para ele acordar.
- As salas ficam na memória do servidor: se ele reiniciar, as salas abertas se perdem. Para uma noite de jogo com amigos isso não é problema.
