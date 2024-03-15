REGISTRY_PORT=5555

docker build -t localhost:$REGISTRY_PORT/dophermal-ui services/ui
docker build -t localhost:$REGISTRY_PORT/dophermal-api services/api
docker build -t localhost:$REGISTRY_PORT/dophermal-controller services/controller

docker push localhost:$REGISTRY_PORT/dophermal-ui
docker push localhost:$REGISTRY_PORT/dophermal-api
docker push localhost:$REGISTRY_PORT/dophermal-controller