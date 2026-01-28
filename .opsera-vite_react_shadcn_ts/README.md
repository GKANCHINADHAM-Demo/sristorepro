# Opsera Code-to-Cloud Deployment

Complete enterprise CI/CD setup for **vite_react_shadcn_ts** with GitOps, progressive delivery, and automated workflows.

## 🎯 Quick Start

### Prerequisites

1. **GitHub Secrets** (Settings → Secrets → Actions):
   ```
   AWS_ACCESS_KEY_ID       # AWS access key
   AWS_SECRET_ACCESS_KEY   # AWS secret key
   GH_PAT                  # GitHub Personal Access Token with workflow scope (optional for auto-chaining)
   ```

2. **AWS Resources**:
   - EKS Cluster: `gayathrikanchinadham-usw2-np`
   - VPC: `opsera-vpc` (will be created if not exists)
   - ECR Repository: Will be created automatically

3. **ArgoCD** installed in hub cluster: `argocd-usw2`

### Deployment Steps

#### Step 1: Bootstrap Infrastructure
```bash
# Via GitHub UI: Actions → 00-bootstrap-infrastructure → Run workflow
# This creates:
# - VPC (if needed)
# - ECR repository
# - Verifies EKS cluster exists
```

#### Step 2: Build & Push Docker Image
```bash
# Option A: Automatic (on push to main)
git push origin main

# Option B: Manual (via GitHub UI)
# Actions → 20-ci-build-push → Run workflow
```

This workflow will:
- Build multi-stage Docker image
- Push to ECR with SHA tag
- Automatically trigger deployment to DEV (if GH_PAT secret exists)

#### Step 3: Deploy to DEV
```bash
# If auto-triggered from build: Wait for workflow to complete
# If manual: Actions → 30-cd-deploy-dev → Run workflow with image tag
```

#### Step 4: Apply ArgoCD Application
```bash
# Update ArgoCD application with your GitHub repo
sed -i 's|GITHUB_ORG/GITHUB_REPO|YOUR_ORG/YOUR_REPO|g' .opsera-vite_react_shadcn_ts/argocd/application-dev.yaml

# Apply to ArgoCD (run in cluster with kubectl access)
kubectl apply -f .opsera-vite_react_shadcn_ts/argocd/application-dev.yaml
```

---

## 📁 Project Structure

```
.opsera-vite_react_shadcn_ts/
├── argocd/
│   └── application-dev.yaml          # ArgoCD app definition
├── k8s/
│   ├── base/                          # Base Kubernetes resources
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── networkpolicy.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       └── dev/                       # DEV environment overlay
│           ├── kustomization.yaml
│           └── namespace.yaml
└── README.md                          # This file

.github/workflows/
├── 00-bootstrap-infrastructure.yaml   # Infrastructure setup
├── 20-ci-build-push.yaml              # Build & push Docker image
└── 30-cd-deploy-dev.yaml              # Deploy to DEV

Dockerfile                             # Multi-stage production build
```

---

## 🚀 Deployment Strategy

### DEV Environment

| Aspect | Configuration |
|--------|---------------|
| **Strategy** | Direct Deploy |
| **Traffic** | 0% → 100% instant |
| **Replicas** | 1 |
| **URL** | https://vite-react-shadcn-ts-dev.agent.opsera.dev |
| **Auto-sync** | Yes (ArgoCD) |
| **Rollback** | Manual (via ArgoCD) |

---

## 🔧 Configuration

### Dockerfile
- **Build Stage**: Node.js 20 Alpine, npm ci, vite build
- **Production Stage**: NGINX Alpine
- **Port**: 8080 (non-root)
- **Health Check**: `/health` endpoint
- **User**: nginx (UID 101)

### Kubernetes Resources
- **Deployment**: 1 replica, health checks, security context
- **Service**: ClusterIP on port 80
- **Ingress**: NGINX with Let's Encrypt TLS
- **NetworkPolicy**: Restricted ingress/egress

### Resource Limits
```yaml
requests:
  cpu: 50m
  memory: 64Mi
limits:
  cpu: 500m
  memory: 512Mi
```

---

## 🔐 Security Features

- ✓ Non-root container (UID 101)
- ✓ Read-only root filesystem
- ✓ Drop all capabilities
- ✓ Network policies (ingress from NGINX only)
- ✓ TLS with Let's Encrypt
- ✓ Image scanning on push (ECR)

---

## 📊 Monitoring & Observability

### Health Checks
- **Liveness**: `/health` every 10s (3 failures = restart)
- **Readiness**: `/health` every 5s (3 failures = remove from service)
- **Startup**: `/health` every 2s (30 failures = restart)

### ArgoCD Dashboard
```bash
# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

---

## 🛠️ Troubleshooting

### Build Failures
```bash
# Check build logs
gh run list --workflow=20-ci-build-push.yaml
gh run view <RUN_ID> --log

# Test Docker build locally
docker build -t test-build .
docker run -p 8080:8080 test-build
curl http://localhost:8080/health
```

### Deployment Issues
```bash
# Check ArgoCD sync status
kubectl get applications -n argocd

# View application details
kubectl describe application vite-react-shadcn-ts-dev -n argocd

# Check pod status
kubectl get pods -n vite-react-shadcn-ts-dev
kubectl logs -n vite-react-shadcn-ts-dev deployment/vite-react-shadcn-ts
```

### ECR Authentication
```bash
# Login to ECR manually
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-west-2.amazonaws.com
```

### Ingress Not Working
```bash
# Check ingress status
kubectl get ingress -n vite-react-shadcn-ts-dev
kubectl describe ingress vite-react-shadcn-ts -n vite-react-shadcn-ts-dev

# Check cert-manager certificate
kubectl get certificate -n vite-react-shadcn-ts-dev
kubectl describe certificate vite-react-shadcn-ts-tls -n vite-react-shadcn-ts-dev
```

---

## 🔄 Workflow Chaining

When `GH_PAT` secret is configured:
```
Push to main → Build & Push → Auto-trigger Deploy to DEV → ArgoCD Sync
```

Without `GH_PAT`:
```
Push to main → Build & Push (manual deploy trigger required)
```

---

## 📈 Next Steps

### Add QA Environment
1. Create `.opsera-vite_react_shadcn_ts/k8s/overlays/qa/`
2. Add canary rollout strategy (10% → 30% → 60% → 100%)
3. Create workflow `40-cd-promote-qa.yaml`
4. Add APM analysis (New Relic/Datadog)

### Add Staging Environment
1. Create `.opsera-vite_react_shadcn_ts/k8s/overlays/staging/`
2. Add blue-green rollout strategy
3. Create preview service and ingress
4. Create workflow `50-cd-promote-staging.yaml`

### Production Deployment
1. Create production EKS cluster: `gayathrikanchinadham-usw2-prod`
2. Set up multi-region deployment
3. Add production-grade monitoring and alerting
4. Implement disaster recovery procedures

---

## 📚 References

- **Opsera Platform**: https://opsera.io
- **ArgoCD**: https://argo-cd.readthedocs.io
- **Kustomize**: https://kustomize.io
- **Argo Rollouts**: https://argoproj.github.io/rollouts

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check ArgoCD application status
4. Visit: https://opsera.io

---

**Generated by**: Opsera Code-to-Cloud v4.0
**Date**: 2026-01-28
**Powered by**: Opsera DevOps Platform
