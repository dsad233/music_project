# build
FROM node:22.11.0 as builder

WORKDIR /home/app

ENV DOCKERIZE_VERSION v0.9.3
RUN apt-get update \
    && apt-get install -y wget \
    && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin \
    && apt-get autoremove -yqq --purge wget && rm -rf /var/lib/apt/lists/*

USER node

COPY --chown=node:node ./ ./

RUN npm ci

RUN npx run build && \ 
    chmod +x ./dockerize.sh

# stage build
FROM node:22.11.0

WORKDIR /home/app

COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/node_modules ./node_modules
COPY --from=builder /home/app/dist ./dist
COPY --from=builder /home/app/src ./src
COPY --from=builder /home/app/dockerize.sh ./dockerize.sh
COPY --from=builder /usr/local/bin/dockerize /usr/local/bin/dockerize
COPY --from=builder /home/app/webpack-hmr.config.js ./

EXPOSE 3000

ENTRYPOINT ["./dockerize.sh"]