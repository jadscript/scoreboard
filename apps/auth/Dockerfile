# Custom Keycloak image for Scoreboard
#
# Build:
#   docker build -t scoreboard-keycloak apps/auth
#
# Extend this image to add custom themes, providers (SPIs), or startup scripts.

# ── Stage 1: Build providers (Maven) ──────────────────────────────────────
# Uncomment when you have Java providers/plugins to compile.
#
# FROM maven:3.9-eclipse-temurin-21 AS builder
# WORKDIR /build
# COPY providers/pom.xml .
# RUN mvn dependency:go-offline -B
# COPY providers/src ./src
# RUN mvn package -DskipTests -B

# ── Stage 2: Keycloak ─────────────────────────────────────────────────────
FROM quay.io/keycloak/keycloak:26.5.6

# Custom themes — uncomment when themes/<theme-name>/ exists:
# COPY themes/ /opt/keycloak/themes/

# Custom providers (SPIs / plugins) — uncomment when JARs are ready:
# COPY providers/ /opt/keycloak/providers/
#
# When using the Maven builder stage above, use instead:
# COPY --from=builder /build/target/*.jar /opt/keycloak/providers/

# Rebuild the optimised Keycloak image with the added providers/themes.
RUN /opt/keycloak/bin/kc.sh build

# The base image sets ENTRYPOINT ["/opt/keycloak/bin/kc.sh"].
# Default to production mode — override with "start-dev" for local development.
CMD ["start"]
