FROM node:latest AS builder
COPY . /app/
WORKDIR /app/
RUN npm ci              && \
    npm run build

FROM node:slim
WORKDIR /app/
COPY --from=builder /app/build/ .
COPY ./config ./config
CMD node bundle.js