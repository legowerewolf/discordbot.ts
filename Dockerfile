FROM node:13.10.1 AS builder
WORKDIR /project/
COPY . .
RUN npm ci
RUN npm run build

WORKDIR /project/build/dist/
COPY ./config ./config
ENTRYPOINT [ "node", "app/manager.js" ]



FROM node:13.10.1
WORKDIR /project/build/dist/

COPY --from=builder /project/build/dist .

ENTRYPOINT [ "node", "app/manager.js" ]