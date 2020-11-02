# CI/CD: node JS and Jenkins deployment on Kubernetes

Jenkins is a well known, widely adopted Continuous Integration platform in enterprises.

## Deployment of Jenkins on one of your Kubernetes clusters
  Here we are going to deploy Jenkins on top of platform9 managed kubernetes freedom tier. The Jenkins docker image provided here has Openjdk8, Maven, Go and NodeJS preinstalled with commonly used plugins. It can be further customized once Jenkins is up and running. Ensure that bare metal cluster has metallb load-balancer pre configured before deploying jenkins. It is also required for exposing the NodeJS app that will get deployed with Jenkins pipeline at the end.

## Jenkins configuration
Before deploying Jenkins label one node with a specific key value pair so that Jenkins pod gets scheduled on this node.

Select the node with enough resources for Jenkins to run on. Label it in the following manner.

(Optional)
```bash
$ kubectl label nodes <node-name> jenkins=allow
```
Now clone the  repository on any machine from where the kubectl can deploy json manifests to your kubernetes cluster.

```bash
$ git clone https://github.com/piyush7/jenkins-cicd
```
Deploy Jenkins using kubectl
```bash
$ kubectl apply -f cicd/jenkins/ci/jenkins.yaml
```
This creates a persistent volume with node affinity to schedule the jenkins pod on the node with label set to 'jenkins'. It ensures existing plus new configurations in Jenkins home directory are automatically persisted across jenkins pod restart.

At the end of this deployment a service type loadbalancer is created and Jenkins can be accessed via http://Load-Balancer-IP:8080. You can also use Nodeport 31257 or any other port that gets used in your case.

```bash
$ kubectl  get svc jenkins
NAME      TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)                          AGE
jenkins   LoadBalancer   10.21.4.173   10.128.231.206   8080:31257/TCP,50000:32492/TCP   59s
```

## Store Dockerhub and GitHub credentials
Storing DockerHub username and password of your DockerHub repository into Jenkins is required so that pipeline can upload images to your dockerhub repository. Additionally store your GitHub credentials to pull the cicd repository. To do this in Jenkins UI, on the home page click Credentials -> Jenkins -> Global credentials (unrestricted) -> Add credentials. Fill out the dockerhub username, password and set ID as 'dockerhub'.




## Bring your DockerHub registry to publish image
You must use a pre-existing dockerhub repository or create a new one on hub.docker.com. Set your dockerhub registry location as environment variable by clicking Jenkins -> Manage Jenkins -> Configure System. Scroll down to Global Properties. Tick 'Environment Variables' and click on Add button. Set the variable Name as 'DOCKERHUB_REGISTRY' and path to your dockerhub repository in 'Value'. Click save at the bottom of the page. This setting allows the pipeline to publish the image to your dockerhub repository using the global credentials set earlier.


## Run Pipeline
Now you are all set to configure pipeline in Jenkins. A sample web application pipeline is already defined in the cicd repository. it just need to be run from Jenkins. For this click ‘New Item’ on the home page,  provide some name to this pipeline and select ‘Multibranch Pipeline’ from the available list of options. Click OK to move to next page.


On this page under 'Branch Source' click Add source. Set 'GitHub' in credentials from drop-down menu. Add the full path of the cicd GitHub repository 'https://github.com/piyush7/jenkins-cicd' in 'Repository HTTPS URL'. Clicking 'Validate' button will verify jenkins can access the repo.


Further scroll down on the page to 'Build Configuration' and set the script path to 'jenkins/webapp01/Jenkinsfile'. Finally press 'Save' button at the bottom of the webpage to finish configuring.


The Pipeline will execute immediately after you click on 'Save'.


Pipeline will move through stages namely checkout SCM, Build, Publish and Deploy. Once the build stage is successful, the 'Publish' stage will create a docker image of the NodeJS application and push it to your Dockerhub repository. Finally the 'Deploy' stage will kick in and deploy the app to the same kubernetes cluster. It will pull the image uploaded during the 'Publish' stage from your dockerhub repository and deploy on the node with label 'jenkins'.


By now the NodeJS application should have become accessible on the network via the load balancer IP.

```bash
$ kubectl get svc p9-react-app
NAME           TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)        AGE
p9-react-app   LoadBalancer   10.21.245.88   10.128.231.207   80:31298/TCP   13m
```




Security Guidelines that should be used -

1. Source base image from trusted repositories - One should always use trusted repos for any apps

2. Minimizing the attack surface - One should use alpine images etc and not use OS images unless absolutely needed because the more utilities/executables the image has, the more chances of attackers exploiting it.

3. No secrets/AWS keys/passwords etc should be present in the Docker images.

4. One should try and use private secure registries.

5. Not to use Privileged mode unless absolutely necessary. 
