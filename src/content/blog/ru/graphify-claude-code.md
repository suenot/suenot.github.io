---
title: "graphify в Claude Code: граф знаний вместо чтения всего репо, семантика на дешевом OpenRouter"
description: "Моя готовая настройка graphify для Claude Code: граф знаний вместо full-repo reads, семантическое извлечение на дешевом OpenRouter (deepseek) вместо токенов Claude, авто-watch через хуки, защита от слива секретов в граф. Все собрано в репозиторий claude-code-token-savers."
pubDate: 2026-06-23
heroImage: "/images/blog/graphify-hero.png"
tags: ["graphify", "claude-code", "tokens", "knowledge-graph", "openrouter"]
draft: false
---

# graphify в Claude Code: граф знаний вместо чтения всего репо

В [гайде по экономии токенов](https://www.suenot.com/blog/saving-tokens-llm/) я коротко упомянул graphify в общем стеке. Тут — отдельно и подробно про то, как у меня настроена автоматизация: что именно держу включенным глобально и почему это не жрет токены Claude.

Проблема простая. Чтобы понять чужой (или свой полугодовой давности) код, агент читает файлы пачками — и каждый файл оседает в контексте. Дорого по input и вдобавок тянет context rot: чем больше навалено, тем хуже модель думает. [graphify](https://github.com/safishamsi/graphify) разрывает эту связку: один раз строит из репо граф знаний (узлы, связи, сообщества, god-nodes), который ты **запрашиваешь**, вместо того чтобы вываливать файлы в окно.

Все собрано в один репозиторий — **[suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers)** (папка `graphify/`, идемпотентный `setup.sh`, патчи, хуки).

## Главный трюк: семантика на чужих токенах

Сборка графа — это куча LLM-вызовов на извлечение сущностей и связей. Если гонять их через Claude, экономия превращается в трату. Поэтому семантическое извлечение уведено на **дешевый OpenRouter**, а не на бюджет Claude.

`~/.graphify/providers.json`:

```json
{
  "openrouter": {
    "base_url": "https://openrouter.ai/api/v1",
    "default_model": "deepseek/deepseek-v4-flash",
    "env_key": "OPENROUTER_API_KEY",
    "model_env_key": "GRAPHIFY_OPENROUTER_MODEL",
    "pricing": { "input": 0.09, "output": 0.18 },
    "temperature": 0,
    "max_tokens": 16384,
    "vision": false
  }
}
```

`deepseek/deepseek-v4-flash` — $0.09 / $0.18 за 1M токенов, контекст 1M. Сборка графа среднего проекта стоит **~$0.10 на OpenRouter и ноль токенов сессии Claude**. Модель меняется одной переменной: `export GRAPHIFY_OPENROUTER_MODEL=qwen/qwen3.7-plus`.

Важная деталь: `graphify install` перезаписывает `~/.claude/skills/graphify/SKILL.md`. В нем зашит приоритет бэкендов извлечения, и если его не восстановить — graphify свалится на Claude-субагентов и сожжет твои токены. Правильный приоритет:

1. **OpenRouter** (если есть `OPENROUTER_API_KEY`) — текстовые чанки сюда.
2. **Gemini** (если есть `GEMINI_API_KEY` / `GOOGLE_API_KEY`).
3. **Claude-субагенты** — только как последний запасной вариант.

## Установка

Нужны [`uv`](https://docs.astral.sh/uv/) и `OPENROUTER_API_KEY` в окружении.

```bash
cd graphify
./setup.sh          # ставит graphify, OpenRouter-бэкенд, патчи, хуки, no-media
```

`setup.sh` идемпотентный (с откатом). Под капотом, если хочется руками:

```bash
uv tool install --with watchdog "graphifyy[openai]"   # openai-extra = OpenRouter; watchdog = graphify watch
mkdir -p ~/.graphify
cp providers.json ~/.graphify/providers.json
cp build-and-watch.sh stop-watch.sh precommit-graph-guard.sh ~/.graphify/ && chmod +x ~/.graphify/*.sh
PY="$(sed -n '1s/^#!//p' "$(command -v graphify)")"
"$PY" patch-global-ignore.py     # глобальный слой ignore
"$PY" patch-merge-ignore.py      # мерж .gitignore + .graphifyignore (а не затмевание)
"$PY" patch-no-media.py          # тумблер no-media
touch ~/.graphify/no-media       # медиа выключено по умолчанию
graphify install --platform claude
```

## Авто-watch: граф сам себя обновляет

Сердце автоматизации — `SessionStart`-хук `build-and-watch.sh`. На каждом старте сессии он смотрит на проект и выбирает ветку:

- **граф есть** → запускает `graphify watch` (дешево, только AST, без LLM) + ставит pre-commit-guard → статус "watching".
- **граф не инициализирован** → печатает "run `/graphify .`" и ничего не делает. Это защита: случайно открытая корневая или гигантская папка не уйдет молча в индексацию и не сожрет токены.
- маркер `~/.graphify/autobuild` → дополнительно авто-собирает маленькие свежие проекты через OpenRouter (потолок 500 файлов / 2M слов; больше — пропуск и просьба собрать руками).

Предохранители: пропускает `$HOME`, корень ФС, системные/`tmp`-папки, предков `$HOME` и любой проект с `.graphify-skip`. Глобальный выключатель — `~/.graphify/disable-autowatch`. Ровно один watcher на проект (атомарный `mkdir`-лок + проверка PID). На `SessionEnd` его гасит `stop-watch.sh`. `watch` обновляет только код/AST-слой; доки требуют `/graphify . --update`.

Карта хуков в `~/.claude/settings.json` (мержить, не затирать существующие):

```
SessionStart  -> ~/.graphify/build-and-watch.sh    # статус + watch
SessionEnd    -> ~/.graphify/stop-watch.sh          # остановить watcher
```

## Что не попадет в граф (и почему это важно)

Граф может уехать в коммит — значит, в него нельзя пускать секреты. Три независимых механизма:

1. **Секреты и `.env`** — режутся встроенным `_is_sensitive` в graphify всегда, без конфига.
2. **Медиа** — чистый тумблер без возни с ignore-файлами: `patch-no-media.py` заставляет `detect()` пропускать картинки/pdf/видео/office, когда есть `~/.graphify/no-media` (или `GRAPHIFY_NO_MEDIA=1`). Удалил маркер — медиа снова в игре.
3. **Затмевание `.gitignore` — починено.** В апстриме `.graphifyignore` в папке **полностью затмевал** ее же `.gitignore`: паттерн, который есть только в `.gitignore` (например, секрет), все равно индексировался. `patch-merge-ignore.py` делает мерж вместо замены — это [PR #1364](https://github.com/safishamsi/graphify/pull/1364) в апстрим.

Поверх — **pre-commit-guard** (`precommit-graph-guard.sh`), который ставится в графифицированные git-репо и **блокирует коммит** `graphify-out/graph.json`, если в граф попал `.gitignore`-файл. Defense-in-depth от утечки секретов в закоммиченный граф. Обход — `git commit --no-verify`.

## Как пользоваться

Один раз собрать, дальше — запрашивать:

```bash
/graphify .                         # собрать граф текущей папки
/graphify https://github.com/o/r    # склонировать репо и собрать
/graphify url1 url2 ...              # несколько репо → один кросс-репо граф
/graphify . --mode deep             # тщательнее, больше INFERRED-связей
/graphify . --update                # инкрементально, только новое/измененное

/graphify query "где валидируется токен и что это вызывает"
/graphify query "..." --dfs         # трассировать конкретный путь, не широкий контекст
/graphify query "..." --budget 1500 # ограничить ответ N токенов
```

На выходе — интерактивный HTML, GraphRAG-JSON и человекочитаемый `GRAPH_REPORT.md`; есть `--mcp` (stdio-сервер для агентов) и `--wiki`. Дальше вместо "прочитай весь модуль auth" агент дергает граф и получает ровно нужный срез.

## После апгрейда graphify

`uv tool upgrade graphifyy` и `graphify install` стирают site-packages (теряются все 3 патча `detect.py`) и перезаписывают `SKILL.md`. Лечение — снова прогнать `./setup.sh` (вернет патчи, файлы, no-media-маркер) и восстановить блок приоритета бэкендов в `SKILL.md`. Переживают апгрейд: `~/.graphify/*`, хуки в `~/.claude/settings.json`, per-repo `.git/hooks/pre-commit`.

---

Итог: graphify снимает с контекста самый жирный слой — "прочитай весь репозиторий", — и делает это за чужие копеечные токены, сам обновляясь в фоне и не утаскивая секреты в граф. Связка с rtk (input команд) и caveman (output модели) разобрана в [гайде по экономии токенов](https://www.suenot.com/blog/saving-tokens-llm/).
