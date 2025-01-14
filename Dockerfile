FROM node:22.13.0

RUN mkdir /input
RUN mkdir /cache
WORKDIR /app

COPY . /app
RUN npm install --production && npm cache clean --force

CMD [
  "node", "server.js",
  "--host", "0.0.0.0",
  "--port", "3000",
  "--directory", "/input",
  "--cache", "/cache"
]
