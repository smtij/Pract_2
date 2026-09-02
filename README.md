# CI/CD Pipeline & Container Orchestration

A Jenkins-driven CI/CD pipeline that builds, tests and ships a small Node.js
service, plus an Ansible-provisioned Kubernetes deployment of the same
service — coursework covering both a traditional CI/CD pipeline and container
orchestration.

## What's here

**The application** (`server.js`) is a minimal Node.js HTTP server that
responds `Hello, DevOps World!` on port 8080 — deliberately simple so the
pipeline and orchestration tooling around it are the focus, not the app
itself.

**The Jenkins pipeline** (`Jenkinsfile`) runs on every build:

1. Checks out the code from source control.
2. Cleans up any container already running from a previous build.
3. Builds a Docker image from the `Dockerfile`.
4. Starts the image as a container and tests it with a `curl` request,
   failing the build if the response doesn't match what's expected.
5. Logs in to Docker Hub (via a Jenkins-stored credential, not a hardcoded
   secret) and pushes the image.
6. Deploys the new image to a production AWS EC2 instance over SSH,
   replacing the previously running container.
7. Verifies the deployment by curling the production server.

**The Kubernetes/Ansible side** (`ansible_playbook.yml`, `deployment.yml`)
provisions a separate deployment target: the Ansible playbook installs
`kubectl` and Minikube and starts a local Kubernetes cluster, then applies
`deployment.yml`, which defines a Deployment running **3 replicated pods**
of the same container image behind a load-balancing Kubernetes Service.

## Stack

Node.js, Docker, Jenkins, AWS EC2, Ansible, Kubernetes (Minikube).

## Files

| File | Purpose |
|---|---|
| `server.js` / `package.json` | The Node.js application |
| `Dockerfile` | Builds the application into a container image |
| `Jenkinsfile` | CI/CD pipeline: build, test, push, deploy, verify |
| `ansible_playbook.yml` | Provisions Kubernetes tooling and deploys the app |
| `deployment.yml` | Kubernetes Deployment (3 replicas) and Service |
