# Minikube Deployment Gids

Deze gids legt uit hoe je de AfvalAlert applicatie kunt deployen naar een lokale Minikube Kubernetes cluster, wat perfect is voor development en testen in Codespaces.

## Vereisten

1. Docker
2. Minikube
3. kubectl
4. Python 3.12+

## Deployment Stappen

1. **Start Minikube**:
   ```bash
   minikube start --driver=docker
   ```

2. **Stel Docker omgeving in**:
   ```bash
   eval $(minikube docker-env)
   ```

3. **Bouw de Docker image**:
   ```bash
   cd classifier
   docker build -t afval-alert:latest .
   ```

4. **Update Kubernetes configuratie**:
   ```bash
   # Update de image naam in deployment.yaml
   sed -i 's|YOUR_ARTIFACT_REGISTRY/afval-alert:latest|afval-alert:latest|g' ../k8s/deployment.yaml
   ```

5. **Deploy naar Kubernetes**:
   ```bash
   kubectl apply -f ../k8s/
   ```

6. **Controleer deployment status**:
   ```bash
   kubectl get pods
   kubectl get services
   ```

7. **Toegang tot de applicatie**:
   ```bash
   minikube service afval-alert-service
   ```

## GitHub Codespaces Integratie

Bij gebruik van GitHub Codespaces wordt de deployment geautomatiseerd via de GitHub Actions workflow gedefinieerd in `.github/workflows/codespaces-deploy.yml`.

## Problemen oplossen

- Als je permissie problemen tegenkomt, zorg er dan voor dat je de juiste Docker omgeving gebruikt met `eval $(minikube docker-env)`
- Als de deployment faalt, controleer dan de pod logs met `kubectl logs deployment/afval-alert`