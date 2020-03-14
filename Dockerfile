FROM node:13.10.1 AS builder
COPY . /app/
WORKDIR /app/
RUN npm ci              && \
    npm run build

FROM node:13.10.1
WORKDIR /app/
COPY --from=builder /app/build/ /app/build/
COPY ./config ./config
ENTRYPOINT [ "node", "build/manager.js" ]
