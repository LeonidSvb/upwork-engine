---
description: Architectural Decision Records
globs:
alwaysApply: false
---

# Architecture Decision Log

<!--
ADR_AGENT_PROTOCOL v1.0

You (the agent) manage this file as the single source of truth for all ADRs.

INVARIANTS
- Keep this exact file structure and headings.
- All ADR entries use H2 headings: "## ADR-XXXX — <Title>" (4-digit zero-padded ID).
- Allowed Status values: Proposed | Accepted | Superseded
- Date format: YYYY-MM-DD
- New entries must be appended to the END of the file.
- The Index table between the INDEX markers must always reflect the latest state and be sorted by ID desc (newest on top).
- Each ADR MUST contain: Date, Status, Owner, Context, Decision, Consequences.
- Each ADR must include an explicit anchor `<a id="adr-XXXX"></a>` so links remain stable.

END ADR_AGENT_PROTOCOL
-->

## Index

<!-- BEGIN:ADR_INDEX -->

| ID   | Title                                                        | Date       | Status   | Supersedes | Superseded by |
| ---- | ------------------------------------------------------------ | ---------- | -------- | ---------- | ------------- |
| 0001 | [Использование Cloudflare Tunnel для локальной разработки](#adr-0001) | 2025-09-27 | Accepted | —          | —             |

<!-- END:ADR_INDEX -->

---

## ADR-0001 — Использование Cloudflare Tunnel для локальной разработки

<a id="adr-0001"></a>
**Date**: 2025-09-27
**Status**: Accepted
**Owner**: Leonid

### Context

При разработке webhook-системы для приема данных от Volna возникла необходимость тестировать webhook локально без постоянного деплоя на Vercel. Volna требует публичный HTTPS URL для отправки данных, а localhost недоступен из интернета.

### Alternatives

- **Vercel деплой после каждого изменения**: медленно (1-2 минуты на деплой), расходует лимиты, неудобно для быстрой итерации
- **ngrok с бесплатным аккаунтом**: URL меняется каждый раз, требует регистрации
- **ngrok платный ($8/мес)**: статичный URL, но платно
- **localtunnel**: нестабильный, часто падает
- **Cloudflare Tunnel (бесплатный)**: без регистрации, стабильный, но URL меняется при каждом запуске

### Decision

Использовать **Cloudflare Tunnel (cloudflared)** для локальной разработки с динамическим URL. Для production использовать стабильный URL на Vercel: `https://upwork-engine.vercel.app/api/webhook`.

**Workflow:**
- Разработка: `npm run dev` + `cloudflared tunnel --url http://localhost:3000`
- Production: Vercel с постоянным URL

### Consequences

- **Pros**:
  - Мгновенное hot-reload при разработке
  - Бесплатно, без лимитов
  - Не требует регистрации
  - Стабильное соединение
  - Видим логи в реальном времени

- **Cons / risks**:
  - URL меняется при каждом запуске туннеля (нужно обновлять в Volna)
  - Для долгого тестирования нужно держать туннель активным

- **Supersedes**: —
- **Superseded by**: —

### Compliance / Verification

- Локальная разработка: проверяем что данные от Volna приходят в консоль Next.js
- Production: webhook URL `https://upwork-engine.vercel.app/api/webhook` остается постоянным
- При переходе в production обновляем URL в Volna на постоянный Vercel URL

---