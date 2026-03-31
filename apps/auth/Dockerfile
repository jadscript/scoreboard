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

# Email OTP / Magic Link authenticator (Phase Two)
ADD --chmod=644 https://repo1.maven.org/maven2/io/phasetwo/keycloak/keycloak-magic-link/0.59/keycloak-magic-link-0.59.jar /opt/keycloak/providers/keycloak-magic-link.jar

# Pre-bake runtime options so Keycloak won't re-build on every startup.
RUN /opt/keycloak/bin/kc.sh build \
    --db=postgres \
    --health-enabled=true \
    --metrics-enabled=true

# The base image sets ENTRYPOINT ["/opt/keycloak/bin/kc.sh"].
# --optimized skips the startup re-build since everything was compiled above.
CMD ["start", "--optimized"]
