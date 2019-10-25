FROM node:13.0.1 AS builder
COPY . /app/
WORKDIR /app/
RUN npm ci              && \
    npm run build

FROM node:13.0.0-slim
WORKDIR /app/
COPY --from=builder /app/build/ /app/build/
COPY ./config ./config
ENTRYPOINT [ "node", "build/manager.js" ]