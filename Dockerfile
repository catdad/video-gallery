# ---- build stage ----
FROM node:22.13.0 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# ---- runtime stage ----
FROM node:22.13.0-slim

RUN mkdir /cache /input
COPY --from=builder /app /app
WORKDIR /app

CMD [ \
  "node", "server.js", \
  "--host", "0.0.0.0", \
  "--port", "3000", \
  "--directory", "/input", \
  "--cache", "/cache" \
]
