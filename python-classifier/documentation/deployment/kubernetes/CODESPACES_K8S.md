# Codespaces Kubernetes Deployment - Nederlandse Documentatie

Deze documentatie legt uit hoe de AfvalAlert applicatie automatisch wordt 
gedeployed naar Kubernetes in GitHub Codespaces, en hoe je dit lokaal kunt 
reproduceren.

## Hoe Werkt Codespaces Kubernetes Deployment?

Wanneer je een Codespace start, wordt automatisch een Minikube Kubernetes 
cluster opgezet en de AfvalAlert applicatie gedeployed. Dit gebeurt via de 
GitHub Actions workflow gedefinieerd in `.github/workflows/codespaces-deploy.yml`.

## Automatische Deployment Process

1. **Minikube Setup**: Een lokale Kubernetes cluster wordt opgezet binnen de 
Codespace
2. **Image Build**: De Docker image wordt gebouwd en opgeslagen in de Minikube 
Docker registry
3. **Kubernetes Deployment**: De Kubernetes configuratiebestanden worden 
aangepast en toegepast
4. **Service Start**: De applicatie wordt gestart en beschikbaar gemaakt via 
Minikube services

## Handmatige Deployment in Codespaces

Als je de deployment handmatig wilt uitvoeren in een Codespace:

```bash
# Ga naar de root directory
cd $REPO_ROOT

# Start Minikube
minikube start --driver=docker

# Stel Docker environment in
eval $(minikube docker-env)

# Bouw de Docker image
cd classifier
docker build -t afval-alert:latest .

# Ga terug naar de root directory
cd ..

# Update de Kubernetes configuratie
sed -i 's|YOUR_REGISTRY/afval-alert:latest|afval-alert:latest|g' k8s/deployment.yaml

# Maak een secret aan voor de Gemini API key (gebruik een test key voor Codespaces)
kubectl create secret generic gemini-api-key \
  --from-literal=GEMINI_API_KEY=dummy-key-for-testing

# Deploy naar Kubernetes
kubectl apply -f k8s/

# Controleer de status
kubectl rollout status deployment/afval-alert
kubectl get pods
kubectl get services

# Open de applicatie in je browser
minikube service afval-alert-service
```

## Kubernetes Configuratiebestanden

De Kubernetes configuratiebestanden in de `k8s/` directory bevatten:

1. **deployment.yaml**: Definieert de Deployment en Service resources
2. **serviceaccount.yaml**: Definieert de ServiceAccount voor de applicatie
3. **configmap.yaml**: Bevat applicatie configuratie
4. **ingress.yaml**: Voor externe toegang (optioneel)

## Gemini API Key Management

De Gemini API key wordt automatisch beheerd via Kubernetes secrets:

```bash
# In productieomgevingen wordt de secret aangemaakt met:
kubectl create secret generic gemini-api-key --from-literal=GEMINI_API_KEY=your-api-key-here

# In Codespaces wordt dit gedaan via de GitHub Actions workflow
```

## Problemen oplossen

### Common Issues

1. **Deployment faalt**:
   ```bash
   # Controleer de pod logs
   kubectl logs deployment/afval-alert
   
   # Controleer de deployment status
   kubectl describe deployment/afval-alert
   
   # Controleer events
   kubectl get events
   ```

2. **Service is niet bereikbaar**:
   ```bash
   # Controleer service status
   kubectl get services
   
   # Controleer endpoints
   kubectl get endpoints
   
   # Probeer port-forwarding
   kubectl port-forward service/afval-alert-service 8000:80
   ```

3. **ImagePullBackOff fout**:
   ```bash
   # Controleer of de image bestaat
   docker images | grep afval-alert
   
   # Herbouw de image als nodig
   cd classifier
   docker build -t afval-alert:latest .
   ```

## Handige Commando's

```bash
# Bekijk alle resources
kubectl get all

# Bekijk logs van de applicatie
kubectl logs deployment/afval-alert

# Schaal de applicatie
kubectl scale deployment afval-alert --replicas=3

# Restart de applicatie
kubectl rollout restart deployment/afval-alert

# Verwijder de deployment
kubectl delete -f k8s/

# Bekijk Minikube dashboard
minikube dashboard
```

## Nieuwe GitHub Workflow

Er is een nieuwe GitHub workflow beschikbaar in `.github/workflows/deploy-k8s.yml` 
die deployment ondersteunt naar meerdere Kubernetes omgevingen:

- Minikube (voor lokale testen)
- Azure Kubernetes Service (AKS)
- Google Kubernetes Engine (GKE)

Deze workflow kan handmatig worden getriggerd via de GitHub UI met keuze van 
de doelomgeving.

## Volgende Stappen

1. **Test de API** via de URL die `minikube service` geeft
2. **Probeer een paar afbeeldingen** te classificeren
3. **Experimenteer met schalen** van de deployment
4. **Bekijk de logs** voor monitoring en debugging

Deze automatische deployment maakt het eenvoudig om de AfvalAlert applicatie 
lokaal te testen in een Kubernetes-achtige omgeving zonder complexe setup.