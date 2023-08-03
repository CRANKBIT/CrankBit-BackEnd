pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = credentials('AWS_ACCOUNT_ID')
        AWS_DEFAULT_REGION = credentials('AWS_DEFAULT_REGION')
        IMAGE_REPO_NAME = credentials('IMAGE_REPO_NAME')
        REPOSITORY_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
        COMMIT_HASH = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
        ECS_CLUSTER = "crankbit-dev-cluster"
        ECS_SERVICE = "crankbit-dev-ecs-service"
        ECS_FAMILY = "crankbit-dev-td"

    }

    stages {

        stage('Checkout') {
            steps {
                // Checkout your source code from the main repository(project repo)
                git branch: 'main', credentialsId: 'github', url: 'https://github.com/Barney7777/CrankBit-BackEnd.git'
            }
        }

        stage('Make script executable') {
            steps {
                // Give execution permission to build_image.sh
                sh 'chmod +x build_image.sh'
            }
        }
        
        stage('Build') {
            steps {
                script {
                    sh "export BUILD_NUMBER=${BUILD_NUMBER} && ./build_image.sh"
                    sh 'docker images'
                }
            }
        }

        stage('Image retag') {
            steps {
                script {
                    // Retrieve the current commit hash from git
                    // Tag the Docker image with the commit hash
                    sh "docker tag crankbit:${BUILD_NUMBER} ${ AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}:${COMMIT_HASH}"
                    sh 'docker images'
                }
            }
        }

        stage('login ecr and push docker image to ecr') {
            steps {
                script {
                    // This step will log in to ECR using the specified credentials
                    sh "aws ecr get-login-password | docker login --username AWS --password-stdin ${REPOSITORY_URI}"
                    // Your docker push commands can go here
                    sh "docker push ${REPOSITORY_URI}/${IMAGE_REPO_NAME}:${COMMIT_HASH}"

                }
            }
        }

        stage('Update ECS Service') {
            steps {
               script {
                    // Get existing task definition
                    def currentTaskDef = sh(script: "aws ecs describe-task-definition --task-definition ${ECS_FAMILY}",returnStdout: true).trim()

                    // # update the existing task definition by performing the following actions:
                    // # 1. Update the `containerDefinitions[0].image` to the new image we want to deploy
                    // # 2. Remove fields from the task definition that are not compatibile with `register-task-definition` --cli-input-json
                    def newTaskDef = sh(
                        script: "echo '$currentTaskDef' | jq --arg IMAGE '${REPOSITORY_URI}/${IMAGE_REPO_NAME}:${COMMIT_HASH}' '.taskDefinition | .containerDefinitions[0].image = \$IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)'",returnStdout: true).trim()

                    // # Register the new task definition and capture the output as JSON
                    def newTaskInfoCmd = "aws ecs register-task-definition --cli-input-json '${newTaskDef}'"
                    def newTaskInfo = sh(script: newTaskInfoCmd, returnStdout: true).trim()

                    // Capture the revision value from the updated task definition JSON using jq
                    def newTdRevision = sh(script: "echo '${newTaskInfo}' | jq '.taskDefinition.revision'",returnStdout: true).trim()

                    // Update service to use the new task definition
                    sh "aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --task-definition ${ECS_FAMILY}:${newTdRevision} --force-new-deployment"
                }
            }
        }

        // stage ('wait for ECS service to became stable') {
        //     steps {
        //         sh "aws ecs wait service-stable --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE}"
        //     }
        // }
    }
}
