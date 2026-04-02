# Changelog

## [0.8.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/backend@0.7.0...@scoreboard/backend@0.8.0) (2026-04-02)

### Features

* **backend:** add player creation functionality and corresponding DTO for player management ([8bb56fd](https://github.com/jadscript/scoreboard/commit/8bb56fd24f92c3e680427b2aecd39f8992f8f8e6))
* **backend:** add Webpack configuration and update TypeScript settings for improved module resolution and build process ([b8f0ac5](https://github.com/jadscript/scoreboard/commit/b8f0ac5033f183721ffb36ea21fa7f159f487c31))
* **backend:** implement player retrieval by user ID and add Prisma repository for player management ([75c0086](https://github.com/jadscript/scoreboard/commit/75c00867a0fad7f51a23bfc6b249d6cce77ab287))
* **frontend:** enhance UI components and refactor game setup logic ([bb90a09](https://github.com/jadscript/scoreboard/commit/bb90a0996bc1850844f1b5b027b8077c7f5c21f2))
* **frontend:** implement internationalization support with i18next and add English and Portuguese translations ([12d8d4a](https://github.com/jadscript/scoreboard/commit/12d8d4af197db6e779034d7eb11a8c3e5fe7f64d))

## [0.7.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/backend@0.6.0...@scoreboard/backend@0.7.0) (2026-04-01)

### Bug Fixes

* **backend:** update Dockerfile to include Prisma schema and configuration files for proper installation ([ec6b092](https://github.com/jadscript/scoreboard/commit/ec6b092afd72e906997967cd39280545fc6eb73d))

## [0.6.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/backend@0.5.0...@scoreboard/backend@0.6.0) (2026-04-01)

### Features

* :sparkles: add config and ranking page ([fb95e13](https://github.com/jadscript/scoreboard/commit/fb95e13ed29456d14b73f9fe1074def48e391554))
* :sparkles: add team name management to useScoreboard hook and update ScoreboardPage for dynamic team name input ([fa9cd12](https://github.com/jadscript/scoreboard/commit/fa9cd12a5f83a98691a95557c5958fc8703e04a1))
* :sparkles: enhance ranking page to include player rankings and refactor ranking stats logic ([916a0f8](https://github.com/jadscript/scoreboard/commit/916a0f8a2f3db7be526d4ddbb79fcb4a17c3d661))
* **auth:** :pencil: enhance Keycloak setup with passwordless Email OTP authentication and update Docker configurations ([f34363d](https://github.com/jadscript/scoreboard/commit/f34363d7dbe80a7d8df9b25f9b0de34607a83abb))
* **auth:** :sparkles: update Keycloak configuration and add custom auth app details ([314ff6d](https://github.com/jadscript/scoreboard/commit/314ff6d305a4d72e0aa96e04c7a536515852c523))
* **backend:** :sparkles: integrate Prisma for PostgreSQL with Player model, add migration strategies, and update Docker configuration ([a34a551](https://github.com/jadscript/scoreboard/commit/a34a551f48b4a6802219dbe59d72edb9e90ebd37))
* **backend:** add PlayerModule and PlayerController with a sample endpoint for player details ([db427d4](https://github.com/jadscript/scoreboard/commit/db427d4e889d4c314cf0a294293068f83ad80a84))
* **backend:** integrate Keycloak for authentication and authorization with environment configuration ([69faf98](https://github.com/jadscript/scoreboard/commit/69faf98cddd46e8ea0d0bda866d355803a053a57))
* **frontend:** :sparkles: add team display parsing and canonical key generation functions; update scoreboard components for improved team management ([4f994b9](https://github.com/jadscript/scoreboard/commit/4f994b9be8f68dcf31ff48d0ee1ba99341dd6885))
* **frontend:** :sparkles: implement environment variable validation with Joi and integrate Keycloak for authentication ([982fbce](https://github.com/jadscript/scoreboard/commit/982fbcecc59532560405b52d7b0b846ba4c9a724))
* **frontend:** add API integration and enhance routing with new HomePage component ([1928a1e](https://github.com/jadscript/scoreboard/commit/1928a1e3cbe42b80a6864bd9ecaaeb377048cde9))

### Bug Fixes

* **scoreboard:** adjust padding in ScoreboardPage layout for improved visual consistency ([823ed19](https://github.com/jadscript/scoreboard/commit/823ed19e9d92763c955ea8c0de0106da6090daa4))

## [0.5.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/backend@0.4.0...@scoreboard/backend@0.5.0) (2026-03-18)

### Features

* **backend:** log CORS configuration details on module initialization ([022765d](https://github.com/jadscript/scoreboard/commit/022765dd96f974ebe2b21c42c43e16894924b3c1))

## [0.4.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/backend@0.3.0...@scoreboard/backend@0.4.0) (2026-03-18)

### Features

* **backend:** implement OnModuleInit to log backend port on startup ([981ecfa](https://github.com/jadscript/scoreboard/commit/981ecfa6cef91fabccf2eddf910a86a9590981bc))

## [0.3.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/backend@0.2.0...@scoreboard/backend@0.3.0) (2026-03-18)

## 0.2.0 (2026-03-18)

### Features

* :sparkles: initial commit ([149e6c0](https://github.com/jadscript/scoreboard/commit/149e6c0835edcaf33698eca2666bea738ed40e13))
* add fullscreen toggle functionality to ScoreboardPage ([627fd91](https://github.com/jadscript/scoreboard/commit/627fd9104997ce51781c78c8686796dd14a8fafc))
* add lucide-react for icon support in ScoreboardPage ([27b0b1f](https://github.com/jadscript/scoreboard/commit/27b0b1ff0485ed2aff70c098be8f90f862c10b22))
* **backend:** :sparkles: add nestjs backend app ([7fc2cc1](https://github.com/jadscript/scoreboard/commit/7fc2cc1f518b6241a5e70711761b8821a3e44448))

### Bug Fixes

* **frontend:** :art: adjust layout and styling in ScoreboardPage for better responsiveness and visual hierarchy ([6feb275](https://github.com/jadscript/scoreboard/commit/6feb275676cc1aeb8846bc643db4812a23edbd4f))
* update import statement for Vite configuration ([b18e8ff](https://github.com/jadscript/scoreboard/commit/b18e8ffbad67d131eb76b3ce2da9ae5437cf0cfb))
