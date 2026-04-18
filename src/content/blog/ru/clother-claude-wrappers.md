---
title: "Clother: чистые обёртки над Claude Code без правки глобальных настроек"
description: "Как использовать jolehuit/clother для переключения Claude Code между Z.AI, Kimi, MiniMax, OpenRouter, Alibaba, Ollama, LM Studio и собственными провайдерами через clother-* команды — без изменения ~/.claude и глобальных env-переменных."
pubDate: 2026-04-19
tags: ["claude-code", "clother", "llm", "providers", "tooling"]
draft: false
---

# Clother: чистые обёртки над Claude Code без правки глобальных настроек

Claude Code прекрасен — ровно до того момента, когда вы решаете запустить его не на собственном эндпоинте Anthropic. Сразу начинается возня: правка `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, ворох shell-скриптов под каждого провайдера, и постепенно ваш `~/.claude` и shell rc превращаются в кладбище полу-рабочих алиасов.

[Clother](https://github.com/jolehuit/clother) от [@jolehuit](https://github.com/jolehuit) решает ровно эту задачу. Это маленький бинарник на Go, который даёт вам семейство команд `clother-*` — по одной на каждого провайдера. Один раз поставили — и дальше переключение между Claude (по подписке), Z.AI GLM-5, Kimi, MiniMax, DeepSeek, Alibaba Coding Plan, OpenRouter, Ollama, LM Studio, llama.cpp или собственным эндпоинтом — это буквально другое имя команды.

Главное: **установка Claude Code остаётся полностью нетронутой**. Никаких правок `~/.claude/settings.json`, никакого постоянного засорения env-переменными, никакого риска завтра утром случайно отправить рабочую сессию не туда.

Если вы уже читали [Как сэкономить токены в LLM](/blog/saving-tokens-llm), то Clother — как раз тот практический тип «обёртки», который делает все эти идеи с переключением провайдеров реально удобными в ежедневной работе. А этот пост — подробный разбор.

## 1. Какую проблему решает Clother

Чтобы запустить Claude Code на не-Anthropic бэкенде, обычно нужно:

1. **Base URL** (`ANTHROPIC_BASE_URL`) — свой у каждого провайдера, иногда у каждого региона
2. **Auth token** (`ANTHROPIC_AUTH_TOKEN`) — отдельный секрет на провайдера
3. **Имя модели** — у всех своя схема (`glm-5`, `kimi-k2.5`, `MiniMax-M2.5`, …)
4. Иногда — специфические **флаги**, чтобы Claude Code корректно работал с этим бэкендом

В итоге люди обычно скатываются к одному из трёх плохих решений:

- **Правят shell rc.** Теперь каждая сессия терминала прибита к одному провайдеру, пока вы не вспомните всё `unset`.
- **Заводят папку с `.sh`-лаунчерами.** Они расходятся, пути ломаются, через месяц никто не помнит, какой куда смотрит.
- **Меняют `~/.claude/settings.json` под каждого провайдера.** Это худший вариант — расширение в редакторе, другие терминалы и фоновые сессии тихо начинают ходить не туда.

Clother закрывает третий путь насовсем: он никогда не правит ваш конфиг Claude. Вместо этого он выставляет нужные env-переменные **только на время жизни одного процесса**, после чего делает `exec` настоящего бинарника `claude`.

## 2. Что такое Clother на самом деле

Под капотом Clother — это один Go-бинарник плюс пачка симлинков с именами `clother-<провайдер>`. Бинарник смотрит на собственное имя запуска (`argv[0]`), находит соответствующий профиль, подгружает секреты из `~/.local/share/clother/secrets.env` (chmod 600), экспортирует нужные env-переменные и затем `exec`-ает настоящий `claude`, который лежит вне директории Clother.

Для `clother-zai` всё это морально эквивалентно:

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
exec /path/to/the/real/claude "$@"
```

Из этой архитектуры выпадает три приятных следствия:

- **Нулевая утечка состояния.** Процесс Claude завершился — env-переменные исчезли вместе с ним.
- **Несколько провайдеров параллельно.** Открываете четыре вкладки терминала и одновременно запускаете `clother-native`, `clother-kimi`, `clother-zai` и `clother-or stepfun`. Они друг друга не видят.
- `**claude --resume` продолжает работать** между провайдерами, потому что Clother ставит ещё и shim для `claude`, который умеет роутить resume обратно к правильному профилю.

## 3. Установка

На macOS чище всего через Homebrew:

```bash
curl -fsSL https://claude.ai/install.sh | bash    # сам Claude Code
brew tap jolehuit/tap
brew install clother
```

На Linux (или macOS без Homebrew):

```bash
curl -fsSL https://claude.ai/install.sh | bash
curl -fsSL https://raw.githubusercontent.com/jolehuit/clother/main/scripts/install.sh | bash
```

Установщик кладёт `clother` и все симлинки `clother-*` в ту же bin-директорию, где уже лежит ваш `claude` (или в `~/bin` / `~/.local/bin` как запасной вариант). Команда `clother status` покажет, куда именно всё попало и есть ли эта директория в `PATH`.

Обновление — одна команда:

```bash
clother update
```

## 4. Повседневное использование

Ежедневный цикл сводится к выбору лаунчера.

```bash
clother-native                       # Anthropic, ваша подписка Claude Pro/Max/Team
clother-zai                          # Z.AI GLM-5
clother-kimi                         # Kimi (kimi-k2.5)
clother-minimax                      # MiniMax-M2.7
clother-deepseek                     # DeepSeek
clother-alibaba                      # Alibaba Coding Plan (по умолчанию qwen3.5-plus)
clother-ollama --model qwen3-coder   # локальный Ollama
clother-or stepfun                   # alias в OpenRouter
clother-custom sambanova --yolo      # кастомный провайдер
```

Несколько флагов, которые стоит запомнить:

- `--yolo` — короткая запись для `--dangerously-skip-permissions`. Очень полезно для пакетных субагентов, опасно везде ещё.
- `--model <имя>` — пробрасывается прямо в Claude. Позволяет на один запуск переопределить модель (`clother-zai --model glm-4.7`).
- `clother config <провайдер>` — задать/поменять API-ключ и дефолтную модель профиля.
- `clother info <провайдер>` — посмотреть, какой именно base URL, модель и token env-var будут использованы. Используйте каждый раз, когда непонятно, почему лаунчер делает не то, что вы ожидаете.
- `clother test` — проверка коннективности до того, как вы час дебажите «это я или провайдер?».

Для OpenRouter практический паттерн такой: `clother-or <алиас>`. Один раз заводите алиас (мапите на реальный id модели в OpenRouter), а потом передаёте его в OpenRouter entrypoint.

## 5. Кастомизация через `~/.config/clother/config.json`

Вот тут Clother реально расцветает для опытного пользователя. Всё интересное живёт в одном JSON-файле. Реальный пример:

```json
{
  "version": 1,
  "provider_overrides": {
    "zai": {
      "model": "glm-5.1"
    }
  },
  "openrouter_aliases": {
    "kimi25":    "moonshotai/kimi-k2.5:nitro",
    "minimax27": "minimax/minimax-m2.7:nitro",
    "qwen36":    "qwen/qwen3.6-plus",
    "stepfun":   "stepfun/step-3.5-flash:nitro"
  },
  "custom_providers": {
    "omni-local": {
      "name": "omni-local",
      "display_name": "omni-local",
      "base_url": "http://localhost:20128",
      "api_key_env": "OMNIROUTE_API_KEY",
      "default_model": "ollama/qwen3-coder",
      "api_type": "openai"
    },
    "sambanova": {
      "name": "sambanova",
      "display_name": "sambanova",
      "base_url": "https://api.sambanova.ai",
      "api_key_env": "SAMBA_API_KEY",
      "default_model": "MiniMax-M2.5",
      "api_type": "openai"
    }
  }
}
```

Здесь видно три независимых механизма, каждый стоит понимания:

`**provider_overrides**` — патч встроенного профиля. Лаунчер Z.AI идёт с дефолтом `glm-5`; этот конфиг поднимает его до `glm-5.1`, и `clother-zai` использует GLM-5.1 каждый раз — никому не нужно помнить про `--model`.

`**openrouter_aliases**` — короткие удобные имена для длинных id моделей OpenRouter. После такого конфига их можно вызывать как `clother-or kimi25`, `clother-or minimax27`, `clother-or qwen36`, `clother-or stepfun`. Суффикс `:nitro` направляет трафик через более быстрых провайдеров OpenRouter; ещё есть `:exacto` — хороший вариант, когда у модели начинаются проблемы с tool calling.

`**custom_providers**` — регистрация полностью новых провайдеров. В примере выше определены два:

- `omni-local` — *локальный* шлюз OmniRoute на `localhost:20128`, который по умолчанию смотрит на `qwen3-coder` через Ollama. Это убойный паттерн: Claude Code ходит в один стабильный локальный endpoint, а OmniRoute уже сам решает, находится ли реальный бэкенд в Ollama, llama.cpp, vLLM, OpenRouter, Gemini или где-то ещё за ним.
- `sambanova` — ещё одно OpenAI-совместимое облако, на этот раз лаунчер по умолчанию смотрит на MiniMax-M2.5. В этом конфиге я выбрал его потому, что для этой модели он даёт около `400 TPS`, а значит хорошо подходит для высокоскоростных coding-сессий и пакетной работы агентов.

Такие записи **не** создают отдельные лаунчеры вида `clother-<имя>`. Запускать их нужно через общий entrypoint кастомных провайдеров: например, `clother-custom sambanova --yolo` или `clother-custom omni-local --yolo`. Практический эффект тот же: для этого запуска Claude Code идёт в нужный провайдер, а все остальные терминалы продолжают жить в своём окружении.

### Бонус: OmniRoute как универсальный Anthropic-совместимый API для чего угодно

`localhost:20128` в примере с `omni-local` выше — не случайность. Это дефолтный порт [OmniRoute](https://github.com/diegosouzapw/OmniRoute), open-source AI-шлюза. Связка Clother → OmniRoute → что угодно настолько мощная, что заслуживает отдельного подраздела.

OmniRoute — это один TypeScript-сервис, который одним процессом отдаёт **сразу несколько диалектов API**:


| Путь                                                                        | Формат           |
| --------------------------------------------------------------------------- | ---------------- |
| `POST /v1/messages`                                                         | **Anthropic**    |
| `POST /v1/chat/completions`                                                 | OpenAI           |
| `POST /v1/responses`                                                        | OpenAI Responses |
| `POST /v1beta/models/{...}`                                                 | Gemini           |
| `POST /v1/api/chat`                                                         | Ollama           |
| `POST /v1/embeddings`, `/v1/images/generations`, `/v1/audio/transcriptions` | OpenAI           |


Интересен здесь именно `/v1/messages` — нативный Anthropic Messages API. То есть **сам OmniRoute выглядит для клиента как Anthropic-совместимый провайдер**. А за этим единственным эндпоинтом он умеет фанаутить в 67+ апстрим-провайдеров (OpenAI, Gemini, Mistral, DeepSeek, Together, Fireworks, OpenRouter, Ollama, vLLM, llama.cpp — всё, что говорит по OAuth-совместимым протоколам), с smart routing, фолбэками, ретраями, кэшем, rate limits и бюджетами на каждый ключ из коробки.

Связка Clother + OmniRoute даёт чистую двухслойную архитектуру:

```
Claude Code  →  Clother (переключение env-vars)  →  OmniRoute (трансляция протоколов)  →  любая LLM
```

Поднимаем OmniRoute локально:

```bash
npm install -g omniroute && omniroute
# или
docker run -d -p 20128:20128 -v omniroute-data:/app/data \
  diegosouzapw/omniroute:latest
```

И прописываем его в Clother как кастомного провайдера:

```json
{
  "custom_providers": {
    "omni-local": {
      "name": "omni-local",
      "display_name": "OmniRoute (local)",
      "base_url": "http://localhost:20128",
      "api_key_env": "OMNIROUTE_API_KEY",
      "default_model": "cc/claude-opus-4-6",
      "api_type": "openai"
    }
  }
}
```

Теперь `clother-custom omni-local --yolo` запускает Claude Code, направляет его на локальный OmniRoute, а OmniRoute уже сам решает, в какой реальный апстрим уйти, основываясь на имени модели (`cc/claude-opus-4-6`, `openai/gpt-...`, `gemini/...`, `ollama/...` и т. д.) и роутинговых combo, которые вы настроили у него в дашборде.

Именно combo здесь особенно важны. В OmniRoute можно создать **combo** с собственным именем модели, а за этим именем спрятать сразу несколько реальных апстрим-моделей с маршрутизацией по доступности и failover-логикой. Для Claude Code это всё равно выглядит как один обычный `model id`. То есть Claude Code может думать, что вызывает условный `my-fast-coding-stack`, а OmniRoute в этот момент сам решает, отправить ли запрос в Claude, GLM, Gemini, OpenRouter или локальную модель в зависимости от того, что сейчас доступно.

Почему это важно на практике:

- **Адаптер «что угодно → Anthropic».** Провайдеры, у которых нет нативного Anthropic-совместимого эндпоинта (сырое OpenAI API, Gemini, Ollama, vLLM, sglang, ваш собственный шлюз), внезапно становятся доступны Claude Code — без единой строчки кода с вашей стороны.
- **Одно место для ключей, бюджетов и наблюдаемости.** Clother рулит env-переменными на запуск; OmniRoute хранит апстрим-учётки, бюджеты на ключ, логи запросов и latency-телеметрию по провайдерам. Они не пересекаются по ответственности.
- **Failover и combos бесплатно.** Combos в OmniRoute позволяют завести одно кастомное имя модели для Claude Code, а за ним описать логику вида «сначала пробуй Claude Opus, упало — GLM-5.1, упало — локальный Qwen». Clother видит один стабильный URL, Claude Code — один стабильный `model id`, а всё настоящее дерево маршрутизации знает только OmniRoute.
- **Local-first.** Оба компонента крутятся у вас на машине. Реальная LLM тоже может быть локальной (Ollama / llama.cpp / vLLM за OmniRoute), и тогда вы получаете UX Claude Code на полностью оффлайн-бэкенде.

Это самый универсальный паттерн во всём посте. Если вы собираетесь настроить Clother на одну вещь — настройте его на `clother-custom omni-local --yolo`. После этого подключение любого нового провайдера сводится к «добавить его в дашборде OmniRoute», а не «снова править shell-конфиг».

## 6. Готовое меню провайдеров

Для справки, лаунчеры из коробки (по мотивам upstream README):


| Уровень             | Примеры                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Облако              | `clother-native`, `clother-zai`, `clother-kimi`, `clother-moonshot`, `clother-minimax`, `clother-deepseek`, `clother-mimo`, `clother-alibaba`, `clother-alibaba-us` |
| Китайские эндпоинты | `clother-zai-cn`, `clother-minimax-cn`, `clother-ve` (Volcengine), `clother-alibaba-cn`                                                                             |
| Локальные           | `clother-ollama`, `clother-lmstudio`, `clother-llamacpp`                                                                                                            |
| OpenRouter          | `clother-or <ваш-алиас>` (100+ моделей, вы сами выбираете, что выставлять)                                                                                          |
| Кастом              | `clother-custom <ваш-алиас>` для всего, что вы определите в `custom_providers`                                                                                      |


Семейство Alibaba Coding Plan интересно само по себе: один API-ключ даёт доступ к ротирующемуся меню моделей — `qwen3.5-plus`, `kimi-k2.5`, `glm-5`, `MiniMax-M2.5`, `qwen3-coder-next`, `qwen3-coder-plus`, `qwen3-max-2026-01-23`, `glm-4.7` — переключаемых через `--model`.

## 7. Resume и VS Code

Две детали интеграции, важные на практике:

**Resume.** Claude Code в конце каждой сессии печатает команду `claude --resume <id>`. Clother ставит shim для `claude`, который перехватывает такие resume и роутит их обратно на исходного провайдера: сессия, начатая через `clother-kimi`, ресьюмится в Kimi, а не в вашу подписку Anthropic. Если вы намеренно ресьюмите чужую сессию в нативный Claude, Clother на этот единственный запуск чистит несовместимые thinking-блоки и потом возвращает файл к исходному виду.

**VS Code.** В официальном расширении Claude Code (2.6+) есть настройка `Claude Process Wrapper`. Указываете в неё абсолютный путь до нужного лаунчера, например `/Users/you/bin/clother-zai`, перезагружаете VS Code — и расширение ходит через этого провайдера. Разные workspace'ы с разными путями к обёртке = изоляция провайдеров на уровне проекта.

## 8. Когда Clother — то, что нужно, а когда нет

Берите Clother, если:

- Хочется **попробовать** не-Anthropic бэкенды без того, чтобы коммитить под них всю глобальную настройку.
- У вас **массовые задачи на дешёвых провайдерах** (`clother-zai --yolo`, Alibaba Coding Plan, локальный Ollama под рефакторинг), а интерактивные сессии остаются на Anthropic.
- Нужна **изоляция провайдера на уровне терминала** — например, одно окно пристёгнуто к локальному llama.cpp под чувствительный код, другое — к фронтирной модели под обсуждение архитектуры.
- Хочется **чистого пути отката**. `clother uninstall` сносит всё, ваш Claude Code остаётся ровно таким, каким был.

Не нужен Clother, если:

- Вы пользуетесь только эндпоинтом Anthropic. Получать тут нечего.
- Нужны фичи провайдера, которых сам Claude Code не поддерживает (например, провайдер-специфичные structured outputs). Clother только подменяет env-переменные — он не может добавить возможностей, которых нет в Anthropic-совместимом API.
- Вы ожидаете идентичного поведения у всех провайдеров. Не получите. Tool calling, обработка system prompt и thinking-блоки отличаются — это свойство моделей, а не Clother.

## 9. Практические советы

Несколько вещей, о которых лучше знать заранее:

- После любой правки конфига запускайте `clother info <провайдер>`. Резолвнутые model + base URL — единственный источник истины.
- Храните API-ключи в shell init или менеджере секретов, который экспортит env-переменные. Поле `api_key_env` у custom-провайдера — это указатель, а не значение.
- Для локальных бэкендов сначала поднимайте сервер, потом дёргайте лаунчер — `clother-llamacpp` не будет ждать, пока поднимется `llama-server`.
- `--yolo` нормально для batch-задач в одноразовых workspace'ах. В основной репозиторий — нет.
- Если рабочий лаунчер вдруг перестал понимать флаги типа `--yolo`, скорее всего вы поставили новый Claude Code после последнего `clother install`. Перезапустите `clother install`, чтобы обновить симлинки.

## 10. Резюме

Clother — из тех инструментов, которые делают одну маленькую вещь хорошо: позволяют держать Claude Code как один стабильный интерфейс, а выбор провайдера превратить в runtime-решение. Никакого расползания глобального конфига, никаких форков сетапа под каждого провайдера, никакого страшного blast radius при экспериментах.

Если вы уже оптимизируете расходы (китайские подписки, OpenRouter-алиасы, локальные модели на скучные задачи) — читайте этот пост в паре с [Как сэкономить токены в LLM](/blog/saving-tokens-llm). Clother — та самая соединительная ткань, которая делает все эти оптимизации удобными в ежедневной работе.