# Event Dispatcher

This project implements a real-time event dispatcher service for processing cryptocurrency market data and user notifications. It follows a clean hexagonal architecture where core business logic is separated from infrastructure concerns like REST endpoints and WebSockets.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Building the Project](#building-the-project)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Code Quality](#code-quality)
- [License](#license)

## Features

- **Real-Time Processing**: Efficiently handle cryptocurrency market data updates.
- **Clean Architecture**: Clear separation between domain, application, and infrastructure layers.
- **Event Handling**: Supports events such as cryptocurrency updates and user notifications.
- **WebSocket Integration**: Provides real-time event broadcasting via Socket.IO.
- **REST API Endpoints**: Exposes HTTP endpoints for external systems to send events.
- **Automated Testing**: Includes unit and integration tests using Mocha and Chai.
- **Versioning and CI/CD**: Uses Git Semantic Versioning and GitHub Actions for continuous integration and deployment.

## Architecture

The project follows a hexagonal architecture:

- **Domain Layer**: Contains business models (e.g. [`it.unibo.domain.Event`](app/src/domain/model/Event.ts), [`it.unibo.domain.model.CryptoData`](app/src/domain/model/CryptoData.ts)).
- **Application Layer**: Implements event handling logic (e.g. [`it.unibo.application.handlers.CryptoUpdateHandler`](app/src/application/handlers/CryptoUpdateHandler.ts), [`it.unibo.application.EventService`](app/src/application/EventService.ts)).
- **Infrastructure Layer**: Provides adapters for HTTP endpoints and WebSocket communications (e.g. [`it.unibo.infrastructure.adapters.EventAdapter`](app/src/infrastructure/adapters/EventAdapter.ts), [`it.unibo.infrastructure.adapters.SocketIOAdapter`](app/src/infrastructure/adapters/SocketIOAdapter.ts)).

## Getting Started

### Clone the repository

```sh
git clone https://github.com/CryptoMonitorASW-SPE/event-dispatcher.git
cd event-dispatcher
```

## Building the Project

This project uses Gradle and Node.js. To build the project, run the following commands:

Install npm dependencies for both the root and app directories:

```sh
./gradlew npmCiAll
```

Build the project:

```sh
./gradlew build
```

## Running the Application

After building, start the application with:

```sh
./gradlew start
```

The server runs on port 3000 by default and exposes the following endpoints:

- POST /realtime/events/notifyUser
- POST /realtime/events/cryptomarketdata
- GET /health

There are also various endpoints for WebSockets, both authenticated and unauthenticated, for the frontend.

## Testing

Unit and integration tests are implemented using Mocha, Chai, TSArch, Sinon, and Supertest.

To execute the tests run:

```sh
cd app
npm run test
```

Test reports are generated under the app/reports directory.

## Docker
A Dockerfile is included to build an image of the service. To build using Docker:

Build the Docker image:
``` docker build -t event-dispatcher . ```

## CI/CD

### Automatic Releases

Changes pushed to the main branch automatically trigger a release process that builds the project and creates a new release.

### CI/CD for Docker

Each release builds a Docker image that is pushed to GitHub Container Registry. The image is tagged with both `latest` and the release tag.

### Code Quality and Testing

For every pull request, the CI workflow:

-   Runs ESLint to check for code quality.
-   Executes the test suite to ensure all tests pass.

### Code Quality

ESLint and Prettier enforce a consistent code style. Lint the code by running:

```sh
cd app
npm run eslint
```

### Commitlint & Husky
Commit messages are standardized using Commitlint. Husky ensures linting and tests run before commits.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)