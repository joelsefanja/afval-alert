# Cloud Computing en Kubernetes Begrippen Uitleg - Nederlandse Documentatie

Deze documentatie legt alle afkortingen en concepten uit die gebruikt worden 
in cloud computing en Kubernetes context van dit project.

## Cloud Platform Componenten

### Beheerde Kubernetes Services
Kubernetes services die beheerd worden door cloud providers zoals Google Cloud, 
Azure, of AWS. Deze stellen je in staat om containerized applicaties te draaien 
en schalen zonder de complexiteit van cluster management.

### IAM - Identity and Access Management
Cloud toegangsbeheersingssysteem. Het bepaalt wie toegang heeft tot welke 
resources en welke acties ze mogen uitvoeren.

### Workload Identity
Een service die workloads (zoals Kubernetes pods) toegang geeft tot cloud 
resources zonder handmatige key configuratie te gebruiken.

### Container Registry
Een opslagplaats waar Docker images worden opgeslagen en beheerd door de 
cloud provider.

## Kubernetes Concepten

### Deployment
Een Kubernetes resource die beschrijft hoe applicatie pods moeten worden 
gedraaid, geüpdatet en geschaald.

### Service
Een Kubernetes resource die interne netwerkt toegang biedt tot een set pods, 
fungerend als load balancer.

### Ingress
Een Kubernetes resource die externe HTTP en HTTPS toegang regelt tot services 
binnen het cluster.

### ServiceAccount
Een Kubernetes object dat pods authenticatie en autorisatie geeft voor 
toegang tot API's en cloud resources.

### Namespace
Een virtuele cluster binnen een fysieke cluster voor organisatie en isolatie 
van resources.

### Pod
De kleinste deployable unit in Kubernetes, bevat één of meerdere containers.

### Container
Een lichtgewicht, uitvoerbare package die applicatiecode en al zijn 
dependencies bevat.

## CI/CD en GitHub Actions

### Workflow
Een geautomatiseerd proces dat één of meerdere jobs uitvoert wanneer bepaalde 
triggers plaatsvinden.

### Secret
Versleutelde omgevingsvariabelen die gebruikt worden om gevoelige informatie 
zoals API keys veilig op te slaan.

### Trigger
Een gebeurtenis die een workflow start, zoals een code push of een handmatige 
activering.

## Docker en Containerization

### Dockerfile
Een tekstbestand dat instructies bevat voor het bouwen van een Docker image.

### Image
Een onveranderbare bestands die een snapshot bevat van een container met al 
zijn dependencies.

### Container Registry
Een opslagplaats voor Docker images, zoals Google Artifact Registry.

## Deployment Proces Stap voor Stap

1. **Code Push**: Developer pusht code naar GitHub repository
2. **Workflow Trigger**: GitHub Actions workflow wordt automatisch gestart bij pull requests
3. **Cloud Authentication**: Workflow authenticeert met cloud provider via beheerde identiteit
4. **Image Build**: Docker image wordt gebouwd van de applicatie
5. **Image Publish**: Image wordt gepushed naar container registry
6. **Kubernetes Update**: Kubernetes deployment wordt geüpdatet met nieuwe image
7. **Rollout**: Nieuwe pods worden gestart met de nieuwe image
8. **Health Check**: Kubernetes controleert of de nieuwe pods gezond zijn
9. **Live**: Nieuwe versie is live en serveert verkeer

## Veiligheid en Best Practices

### Beheerde Identiteit
Het systeem gebruikt cloud-beheerde identiteiten voor authenticatie tussen 
Kubernetes en cloud resources, zonder handmatige key configuratie.

### Resource Limits
Pods hebben gedefinieerde CPU en memory limits om resource verbruik te 
controleren.

### Health Probes
Readiness en liveness probes zorgen voor automatische health checks en 
herstarten van ongezonde pods.

## Voorbeeld Deployment Architectuur

```
Internet → Ingress → Service → Pods (containers)
                    ↑
            Kubernetes Cluster
                    ↑
         Beheerde Kubernetes Service
                    ↑
              Cloud Platform
```

## Belangrijke Environment Variabelen

- **PROJECT_ID**: Het unieke ID van het cloud project
- **CLUSTER_NAME**: Naam van het Kubernetes cluster
- **CLUSTER_ZONE**: Geografische zone waar het cluster draait
- **GEMINI_API_KEY**: API key voor toegang tot AI service (automatisch opgehaald via cloud secret management)

## Terminologie Vertaling

| Engels | Nederlands |
|--------|------------|
| Cluster | Cluster |
| Node | Node |
| Pod | Pod |
| Container | Container |
| Deployment | Deployment |
| Service | Service |
| Ingress | Ingress |
| Namespace | Namespace |
| Secret | Secret |
| ConfigMap | Configuratiebestand |
| Volume | Volume |
| Persistent Volume | Persistent Volume |
| Load Balancer | Load Balancer |
| Auto-scaling | Automatisch Schalen |
| Rolling Update | Rolling Update |

Deze documentatie is bedoeld om technische begrippen toegankelijk te maken voor 
developers die mogelijk niet vertrouwd zijn met alle cloud computing en 
Kubernetes concepten.