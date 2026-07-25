# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2026-07-25

### Added

- GitHub Actions workflows for CI (`ci.yml`) and npm release (`release.yml`).

### Changed

- Bump generated-project `rasti` dependency to `^4.1.0`.
- Bump generated-project `cssfun` dependency to `^0.1.0`.

## [0.0.1] - 2026-06-24

### Added

- Initial release.
- SPA, SSR, and Static project templates.
- Optional features: Tailwind CSS, CSSFUN, micro-router, rasti-icons.
- Interactive mode via `@clack/prompts`.
- Conditional template engine with `{{#if}}` / `{{#elif}}` / `{{#else}}` / `{{#endif}}`.
- Convention-based styled template resolution (`-tailwind`, `-cssfun` variants).

[unreleased]: https://github.com/8tentaculos/create-rasti/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/8tentaculos/create-rasti/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/8tentaculos/create-rasti/releases/tag/v0.0.1
