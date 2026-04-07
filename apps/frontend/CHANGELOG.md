# Changelog

## [0.28.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.27.0...@scoreboard/frontend@0.28.0) (2026-04-07)

### Features

* **backend:** add endpoint to retrieve player by user ID ([3a8397a](https://github.com/jadscript/scoreboard/commit/3a8397a700cb45eeb98da3eaed3ab48ed1a7adcc))
* **frontend:** integrate ZXing library for QR and NFC functionality ([9745ea0](https://github.com/jadscript/scoreboard/commit/9745ea0bb27e230c326cbdf4bd17fd66325ca43a))

## [0.27.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.26.0...@scoreboard/frontend@0.27.0) (2026-04-07)

## [0.26.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.25.0...@scoreboard/frontend@0.26.0) (2026-04-07)

### Features

* **frontend:** add NFC writing functionality and enhance translations ([97fc401](https://github.com/jadscript/scoreboard/commit/97fc40140114b4ae2aa4488218fa5fa8e89ee6a9))
* **mobile:** enhance mobile app with new dependencies and layout updates ([3f6b07e](https://github.com/jadscript/scoreboard/commit/3f6b07ea53c7503767d820359d9f3903f7324b57))
* **mobile:** integrate Expo app into monorepo and update dependencies ([3412e8b](https://github.com/jadscript/scoreboard/commit/3412e8b0c662b87571bf8adc9bf86fd0e31c0638))

### Bug Fixes

* **backend:** update save method to handle DomainPlayer structure ([efba090](https://github.com/jadscript/scoreboard/commit/efba09050f84c1fbef1bcd60e2e8516a703e8f5e))

## [0.25.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.24.0...@scoreboard/frontend@0.25.0) (2026-04-06)

### Features

* **frontend:** enhance scoreboard functionality with audio feedback and snapshot management ([bb651ad](https://github.com/jadscript/scoreboard/commit/bb651ad1c5334ee1761637347ef9cb45fd12eef4))

## [0.24.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.23.0...@scoreboard/frontend@0.24.0) (2026-04-03)

### Features

* **frontend:** enhance scoreboard functionality and UI elements ([de01a9b](https://github.com/jadscript/scoreboard/commit/de01a9bc57642a24853ecea147796a58b7e0e127))

## [0.23.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.22.0...@scoreboard/frontend@0.23.0) (2026-04-03)

## [0.22.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.21.0...@scoreboard/frontend@0.22.0) (2026-04-03)

### Features

* **frontend:** integrate QR code functionality and enhance localization ([3697759](https://github.com/jadscript/scoreboard/commit/3697759f3f1108ccf38299be71a17228f8323903))

## [0.21.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.20.0...@scoreboard/frontend@0.21.0) (2026-04-03)

### Features

* **frontend:** enhance scoreboard UI and localization ([0741f3b](https://github.com/jadscript/scoreboard/commit/0741f3bf18fddaf0d7d36f1ec12bc5730f204dbb))

## [0.20.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.19.0...@scoreboard/frontend@0.20.0) (2026-04-03)

### Features

* **frontend:** enhance screen orientation handling on scoreboard page ([fbfdda2](https://github.com/jadscript/scoreboard/commit/fbfdda2f13d683d7abab83b5ee831b3fa53d0f59))

## [0.19.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.18.0...@scoreboard/frontend@0.19.0) (2026-04-03)

### Features

* **backend:** add Injectable decorator to PrismaPlayerRepository for dependency injection ([9580fc5](https://github.com/jadscript/scoreboard/commit/9580fc5889327015c3e1598b858cecbc8bb17cde))
* **frontend:** add screen orientation locking on scoreboard page ([c54b46a](https://github.com/jadscript/scoreboard/commit/c54b46a64d43d618f89612e898a562b7eeaa1a17))

### Bug Fixes

* **backend:** update Dockerfile to correct path for main application entry point ([c77a0aa](https://github.com/jadscript/scoreboard/commit/c77a0aaa96ea74736df2b58b424fefd814c20607))

## [0.18.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.17.0...@scoreboard/frontend@0.18.0) (2026-04-02)

### Features

* **backend:** add player creation functionality and corresponding DTO for player management ([8bb56fd](https://github.com/jadscript/scoreboard/commit/8bb56fd24f92c3e680427b2aecd39f8992f8f8e6))
* **backend:** add Webpack configuration and update TypeScript settings for improved module resolution and build process ([b8f0ac5](https://github.com/jadscript/scoreboard/commit/b8f0ac5033f183721ffb36ea21fa7f159f487c31))
* **backend:** implement player retrieval by user ID and add Prisma repository for player management ([75c0086](https://github.com/jadscript/scoreboard/commit/75c00867a0fad7f51a23bfc6b249d6cce77ab287))
* **frontend:** enhance UI components and refactor game setup logic ([bb90a09](https://github.com/jadscript/scoreboard/commit/bb90a0996bc1850844f1b5b027b8077c7f5c21f2))
* **frontend:** implement internationalization support with i18next and add English and Portuguese translations ([12d8d4a](https://github.com/jadscript/scoreboard/commit/12d8d4af197db6e779034d7eb11a8c3e5fe7f64d))

### Bug Fixes

* **backend:** update Dockerfile to include Prisma schema and configuration files for proper installation ([ec6b092](https://github.com/jadscript/scoreboard/commit/ec6b092afd72e906997967cd39280545fc6eb73d))

## [0.17.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.16.0...@scoreboard/frontend@0.17.0) (2026-04-01)

### Features

* **backend:** :sparkles: integrate Prisma for PostgreSQL with Player model, add migration strategies, and update Docker configuration ([a34a551](https://github.com/jadscript/scoreboard/commit/a34a551f48b4a6802219dbe59d72edb9e90ebd37))
* **backend:** add PlayerModule and PlayerController with a sample endpoint for player details ([db427d4](https://github.com/jadscript/scoreboard/commit/db427d4e889d4c314cf0a294293068f83ad80a84))
* **backend:** integrate Keycloak for authentication and authorization with environment configuration ([69faf98](https://github.com/jadscript/scoreboard/commit/69faf98cddd46e8ea0d0bda866d355803a053a57))
* **frontend:** add API integration and enhance routing with new HomePage component ([1928a1e](https://github.com/jadscript/scoreboard/commit/1928a1e3cbe42b80a6864bd9ecaaeb377048cde9))

## [0.16.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.15.0...@scoreboard/frontend@0.16.0) (2026-03-31)

## [0.15.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.14.0...@scoreboard/frontend@0.15.0) (2026-03-31)

### Features

* **auth:** :pencil: enhance Keycloak setup with passwordless Email OTP authentication and update Docker configurations ([f34363d](https://github.com/jadscript/scoreboard/commit/f34363d7dbe80a7d8df9b25f9b0de34607a83abb))

## [0.14.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.13.0...@scoreboard/frontend@0.14.0) (2026-03-31)

### Features

* **auth:** :sparkles: update Keycloak configuration and add custom auth app details ([314ff6d](https://github.com/jadscript/scoreboard/commit/314ff6d305a4d72e0aa96e04c7a536515852c523))
* **frontend:** :sparkles: implement environment variable validation with Joi and integrate Keycloak for authentication ([982fbce](https://github.com/jadscript/scoreboard/commit/982fbcecc59532560405b52d7b0b846ba4c9a724))

## [0.13.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.12.0...@scoreboard/frontend@0.13.0) (2026-03-30)

### Bug Fixes

* **scoreboard:** adjust padding in ScoreboardPage layout for improved visual consistency ([823ed19](https://github.com/jadscript/scoreboard/commit/823ed19e9d92763c955ea8c0de0106da6090daa4))

## [0.12.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.11.0...@scoreboard/frontend@0.12.0) (2026-03-30)

### Features

* **frontend:** :sparkles: add team display parsing and canonical key generation functions; update scoreboard components for improved team management ([4f994b9](https://github.com/jadscript/scoreboard/commit/4f994b9be8f68dcf31ff48d0ee1ba99341dd6885))

## [0.11.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.10.0...@scoreboard/frontend@0.11.0) (2026-03-28)

### Features

* :sparkles: enhance ranking page to include player rankings and refactor ranking stats logic ([916a0f8](https://github.com/jadscript/scoreboard/commit/916a0f8a2f3db7be526d4ddbb79fcb4a17c3d661))

## [0.10.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.9.0...@scoreboard/frontend@0.10.0) (2026-03-27)

### Features

* :sparkles: add config and ranking page ([fb95e13](https://github.com/jadscript/scoreboard/commit/fb95e13ed29456d14b73f9fe1074def48e391554))

## [0.9.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.8.0...@scoreboard/frontend@0.9.0) (2026-03-27)

### Features

* :sparkles: add team name management to useScoreboard hook and update ScoreboardPage for dynamic team name input ([fa9cd12](https://github.com/jadscript/scoreboard/commit/fa9cd12a5f83a98691a95557c5958fc8703e04a1))

## [0.8.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.7.0...@scoreboard/frontend@0.8.0) (2026-03-27)

### Features

* **backend:** :sparkles: add nestjs backend app ([7fc2cc1](https://github.com/jadscript/scoreboard/commit/7fc2cc1f518b6241a5e70711761b8821a3e44448))
* **backend:** implement OnModuleInit to log backend port on startup ([981ecfa](https://github.com/jadscript/scoreboard/commit/981ecfa6cef91fabccf2eddf910a86a9590981bc))
* **backend:** log CORS configuration details on module initialization ([022765d](https://github.com/jadscript/scoreboard/commit/022765dd96f974ebe2b21c42c43e16894924b3c1))

## [0.7.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.6.0...@scoreboard/frontend@0.7.0) (2026-03-16)

## [0.6.0](https://github.com/jadscript/scoreboard/compare/@scoreboard/frontend@0.5.0...@scoreboard/frontend@0.6.0) (2026-03-16)

## 0.5.0 (2026-03-16)

### Features

* :sparkles: initial commit ([149e6c0](https://github.com/jadscript/scoreboard/commit/149e6c0835edcaf33698eca2666bea738ed40e13))
* add fullscreen toggle functionality to ScoreboardPage ([627fd91](https://github.com/jadscript/scoreboard/commit/627fd9104997ce51781c78c8686796dd14a8fafc))
* add lucide-react for icon support in ScoreboardPage ([27b0b1f](https://github.com/jadscript/scoreboard/commit/27b0b1ff0485ed2aff70c098be8f90f862c10b22))

### Bug Fixes

* **frontend:** :art: adjust layout and styling in ScoreboardPage for better responsiveness and visual hierarchy ([6feb275](https://github.com/jadscript/scoreboard/commit/6feb275676cc1aeb8846bc643db4812a23edbd4f))
* update import statement for Vite configuration ([b18e8ff](https://github.com/jadscript/scoreboard/commit/b18e8ffbad67d131eb76b3ce2da9ae5437cf0cfb))

## [0.4.0](https://github.com/jadscript/scoreboard/compare/scoreboard@0.3.0...scoreboard@0.4.0) (2026-03-16)

### Bug Fixes

* **frontend:** :art: adjust layout and styling in ScoreboardPage for better responsiveness and visual hierarchy ([6feb275](https://github.com/jadscript/scoreboard/commit/6feb275676cc1aeb8846bc643db4812a23edbd4f))

## [0.3.0](https://github.com/jadscript/scoreboard/compare/scoreboard@0.2.0...scoreboard@0.3.0) (2026-03-16)

## [0.2.0](https://github.com/jadscript/scoreboard/compare/scoreboard@0.1.0...scoreboard@0.2.0) (2026-03-16)

## 0.1.0 (2026-03-16)
