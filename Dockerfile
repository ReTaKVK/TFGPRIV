# Etapa 1: Construcción
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar todos los archivos del proyecto al contenedor
COPY . .

# Asegurar que el wrapper es ejecutable
RUN chmod +x mvnw

# Ejecutar la compilación sin tests para acelerar
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final para ejecutar la app
FROM eclipse-temurin:21-jre-alpine

# Crear directorio para la app
WORKDIR /app

# Copiar el JAR compilado de la etapa de build
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto donde corre la app
EXPOSE 8080

# Comando para ejecutar la app
ENTRYPOINT ["java", "-jar", "app.jar"]
