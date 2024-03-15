FROM node:21-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# COPY
COPY public /app/public
COPY /src /app/src
COPY package.json /app
COPY pnpm-lock.yaml /app
COPY tailwind.config.js /app
COPY tsconfig.json /app
COPY vite.config.ts /app
COPY postcss.config.js /app
COPY tsconfig.node.json /app
COPY index.html /app

WORKDIR /app

FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:1.25.4-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
