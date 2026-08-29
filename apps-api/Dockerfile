FROM node:22-bookworm-slim AS asset-previews

WORKDIR /preview
RUN apt-get update \
  && apt-get install -y --no-install-recommends imagemagick \
  && rm -rf /var/lib/apt/lists/*
COPY . .
RUN node scripts/generatePdfAssetPreviews.js

FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY package*.json ./
RUN npm ci --omit=dev \
  && npx playwright install --with-deps chromium \
  && npm cache clean --force

COPY . .
COPY --from=asset-previews /preview/assets/pdf-previews ./assets/pdf-previews
COPY --from=asset-previews /preview/assets/evolution-jpeg ./assets/evolution-jpeg

EXPOSE 3001
CMD ["npm", "start"]
