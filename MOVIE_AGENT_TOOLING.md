# Movie Agent Tooling

## Current local tool
- `movie_agent_search.py`

## Purpose
Reads `movie-agent.config.toml`, logs into qBittorrent Web UI/API, runs a movie search through qBittorrent's internal search engine, and ranks the returned results using Solo's current preferences.

## Example
```bash
python3 /home/santos-family/.openclaw/workspace/movie_agent_search.py "Beethoven 1992" --limit 5
```

## Current behavior
- logs into qBittorrent locally
- starts a search job
- collects results
- ranks results by title/year, resolution, codec, size, seed health, and preference rules
- prints top candidates in a human-readable format

## Notes
- Uses the real local config file: `movie-agent.config.toml`
- Does not print the qBittorrent password
- This is the first building block for the full movie agent workflow
