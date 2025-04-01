FROM openjdk:17-jdk-slim
WORKDIR /app
COPY ./alquilerplataforma-0.0.1-SNAPSHOT.jar alquilerplataforma.jar
ENTRYPOINT ["java", "-jar", "alquilerplataforma.jar"]
