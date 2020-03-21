FROM node:13.10.1 AS builder
WORKDIR /project/
COPY . .
RUN npm ci
RUN npm run build

WORKDIR /project/dist/
COPY ./config ./config
ENTRYPOINT [ "node", "app/manager.js" ]


FROM node:13.10.1-slim
WORKDIR /project/
COPY --from=builder /project/dist .
ENTRYPOINT [ "node", "app/manager.js" ]