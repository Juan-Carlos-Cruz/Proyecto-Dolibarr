FROM mcr.microsoft.com/playwright:v1.56.0-jammy

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-17-jre-headless wget \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

RUN mkdir -p /work && chown pwuser:pwuser /work
WORKDIR /work

USER pwuser
