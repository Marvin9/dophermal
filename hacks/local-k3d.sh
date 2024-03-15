# https://gist.github.com/bademux/82767b85eb17aacdb8e3a24b24ac7a26

REGISTRY_PORT=5555
CLUSTER_NAME=dophermal

k3d registry create registry.localhost --port $REGISTRY_PORT

k3d cluster create $CLUSTER_NAME -p "8081:80@loadbalancer" --registry-use k3d-registry.localhost:$REGISTRY_PORT --registry-config ./hacks/k3d-registries.yaml

docker build -t localhost:$REGISTRY_PORT/dophermal-ui services/ui
docker build -t localhost:$REGISTRY_PORT/dophermal-api services/api
docker build -t localhost:$REGISTRY_PORT/dophermal-controller services/controller

docker push localhost:$REGISTRY_PORT/dophermal-ui
docker push localhost:$REGISTRY_PORT/dophermal-api
docker push localhost:$REGISTRY_PORT/dophermal-controller