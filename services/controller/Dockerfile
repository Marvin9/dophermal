FROM --platform=linux/amd64 golang:1.21.1 AS build

WORKDIR /app

COPY go.mod go.sum /app/
RUN go mod download

COPY . /app/

RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/

FROM --platform=linux/amd64 alpine:3.15.11

COPY --from=build /bin /bin

ENTRYPOINT [ "/bin/controller" ]
