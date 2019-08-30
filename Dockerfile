FROM node:12.9.1 AS builder
COPY . /app/
WORKDIR /app/
RUN npm ci              && \
    npm run build

FROM node:12.3.1-slim
WORKDIR /app/
COPY --from=builder /app/build/ /app/build/
COPY ./config ./config
ENTRYPOINT [ "node", "build/spawner.js" ]