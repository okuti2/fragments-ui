#Build the fragments-ui web app and serve it via parcel 
# Stage 0: install the base dependencies
FROM node:20.11.1-bullseye@sha256:2056770f9050f845d41f0b025f966f2c49f0148d073ca65b110a2fbb4749774c AS dependencies
#FROM node:20.11.1@sha256:e06aae17c40c7a6b5296ca6f942a02e6737ae61bbbf3e2158624bb0f887991b5 AS dependencies
LABEL maintainer="Olutoyosi Kuti <okuti2@myseneca.ca>"\
      description="Fragments-ui web app"

ENV  NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false 
    

# Use /app as our working directory
WORKDIR /app

COPY package*.json /app/
# Install node dependencies defined in package-lock.json
RUN npm ci --omit

############################################################################

# Stage 1: build the app
FROM node:20.11.1-bullseye@sha256:2056770f9050f845d41f0b025f966f2c49f0148d073ca65b110a2fbb4749774c AS build
# FROM node:20.11.1@sha256:e06aae17c40c7a6b5296ca6f942a02e6737ae61bbbf3e2158624bb0f887991b5 AS build
ARG AWS_COGNITO_POOL_ID= \
    AWS_COGNITO_CLIENT_ID= \
    AWS_COGNITO_HOSTED_UI_DOMAIN= \
    OAUTH_SIGN_IN_REDIRECT_URL= \
    OAUTH_SIGN_OUT_REDIRECT_URL= \
    API_URL=

    
WORKDIR /app 
# Copy the generated dependencies (node_modules) from the dependencies stage
COPY --from=dependencies /app /app 
# Copy the rest of the app's source code
COPY . .
# Build the app, creating /build
RUN npm run build 

############################################################################

# Stage 2: serving the build app
FROM nginx:1.24.0-alpine@sha256:6845649eadc1f0a5dacaf5bb3f01b480ce200ae1249114be11fef9d389196eaf AS deploy

ENV API_URL=http://localhost:8000

COPY --from=build /app/dist/. /usr/share/nginx/html

EXPOSE 80
