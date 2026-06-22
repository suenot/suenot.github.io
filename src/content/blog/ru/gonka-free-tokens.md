---
title: "Gonka дает $10 бесплатно без карты: миллиарды токенов Kimi K2.6 для AI-стартапов"
description: "GonkaGate раздает $10 бесплатного баланса без ввода карты и без крипто-пополнений. По цене ~$0.000334 за 1M токенов этого хватает на миллиарды токенов Kimi K2.6 — топливо для AI-стартапов, которым нужно много токенов. Внутри: тесты TPS и пошаговая настройка для opencode и Hermes Agent."
pubDate: 2026-06-23
heroImage: "/images/blog/gonka-hero.png"
tags: ["gonka", "llm", "tokens", "kimi", "opencode", "hermes-agent"]
draft: false
---

# Gonka дает $10 бесплатно без карты: миллиарды токенов Kimi K2.6 для AI-стартапов

Короткая выжимка для тех, кто палит токены пачками: [Gonka](https://gonka.ai) — децентрализованная сеть вычислений, а [GonkaGate](https://gonkagate.com/en) — OpenAI-совместимый шлюз поверх нее с биллингом в долларах. И там **дают $10 бесплатного баланса прямо на регистрации — без ввода карты и без крипто-пополнений**. Не нужен ни кошелек, ни токены GNK, ни единого цента предоплаты, чтобы начать слать запросы.

## Почему это интересно

Дело не в самих $10, а в том, **сколько токенов** на них помещается.

Прайс на `moonshotai/kimi-k2.6` в GonkaGate — порядка **$0.000334 за 1M токенов** (из них ~$0.000304 стоимость сети + ~$0.000030 комиссия шлюза). Это на порядки дешевле привычных облачных тарифов. По такой цене $10 — это **миллиарды токенов**. На практике даже этих $10 хватает примерно на **2.6 миллиарда токенов контекста** Kimi K2.6.

Это уже не "поиграться", а реальное топливо. На бесплатные $10 можно:

- прогнать массовую обработку (классификация, разметка, суммаризация тысяч документов);
- крутить фоновых агентов, которые жрут контекст пачками;
- **построить прототип AI-стартапа**, где экономика на токенах обычно убивает идею на старте.

Счет при желании пополняется в **USDT** — но для старта это не нужно, $10 дают сразу.

## Скорость

Замерил `moonshotai/kimi-k2.6` через шлюз: сквозная скорость генерации **примерно 60 ток/с**. Для децентрализованной сети по такой цене — более чем рабочие цифры.

## Получить ключ

1. Регистрируетесь на **[gonkagate.com/en/pricing](https://gonkagate.com/en/pricing)** — $10 падают на баланс автоматически.
2. Создаете API-ключ. Он начинается с `gp-...` и **показывается один раз** — сохраните сразу.
3. База API: `https://api.gonkagate.com/v1`, авторизация `Authorization: Bearer gp-...`. Шлюз OpenAI-совместимый: меняете base URL, ключ и model id — и любой OpenAI SDK работает как есть.

Быстрый smoke-тест (убедиться, что ключ живой):

```bash
curl https://api.gonkagate.com/v1/chat/completions \
  -H "Authorization: Bearer $GONKAGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2.6",
    "messages": [{"role": "user", "content": "Reply with exactly: GonkaGate ok"}]
  }'
```

## Настройка для opencode

[opencode](https://opencode.ai) — терминальный AI-агент. Подключается к GonkaGate как кастомный провайдер.

### Вариант А — официальный установщик (проще всего)

```bash
npx @gonkagate/opencode-setup
```

Без интерактива (для скриптов/CI):

```bash
GONKAGATE_API_KEY=gp-... npx @gonkagate/opencode-setup --scope project --yes
```

### Вариант Б — руками

1. Запустите opencode, выполните `/connect`, выберите `Other` и введите:
   - Provider id: `gonkagate`
   - API key: ваш `gp-...`
2. Добавьте провайдера в `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "gonkagate": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "GonkaGate",
      "options": {
        "baseURL": "https://api.gonkagate.com/v1"
      },
      "models": {
        "moonshotai/kimi-k2.6": {
          "name": "Kimi K2.6 (GonkaGate)"
        }
      }
    }
  },
  "model": "gonkagate/moonshotai/kimi-k2.6",
  "small_model": "gonkagate/moonshotai/kimi-k2.6"
}
```

3. Проверка:

```bash
opencode debug config --pure
```

Затем в opencode выполните `/models` — провайдер `GonkaGate` и модель `Kimi K2.6` должны появиться в списке. Актуальный список моделей всегда можно подтянуть с `GET /v1/models`.

## Настройка для Hermes Agent

[Hermes Agent](https://github.com/nousresearch/hermes-agent) от Nous Research — терминальный агент, который работает с любым провайдером моделей и помнит контекст между сессиями. Тоже цепляется к GonkaGate за один шаг.

**Требования:** Hermes Agent `v2026.5.16` / `v0.14.0`+ в `PATH`, Node.js ≥ `22.14.0`, ключ `gp-...`, интерактивный терминал (TTY), Linux/macOS/WSL2.

### Вариант А — официальный установщик

```bash
npx @gonkagate/hermes-agent-setup
```

Под отдельный профиль:

```bash
npx @gonkagate/hermes-agent-setup --profile work
```

### Вариант Б — руками

Установщик правит два файла; то же можно прописать вручную.

`~/.hermes/config.yaml`:

```yaml
model:
  provider: custom
  base_url: https://api.gonkagate.com/v1
  default: moonshotai/kimi-k2.6
```

`~/.hermes/.env`:

```
OPENAI_API_KEY=gp-...
```

Запуск и проверка:

```bash
hermes
# затем промпт: Reply with exactly: Hermes Agent connected to GonkaGate
```

## Подводные камни

- **RE2-регулярки в tool-схемах.** Бэкенд Kimi на Gonka использует Go RE2 — он не понимает lookahead. Если у MCP-инструмента в JSON-схеме есть `pattern` с `(?!` или `(?=`, запрос падает: `400 ... schema pattern is not a valid regular expression`. Лечится удалением таких паттернов из схемы инструмента.
- **Другие модели.** Кроме `moonshotai/kimi-k2.6` доступны Qwen3 235B, MiniMax M2.7 и др. — актуальный список на `GET /v1/models`. Id регистрозависимы, копируйте точно.
