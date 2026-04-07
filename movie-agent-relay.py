#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

MOVIE_AGENT_DIR = Path('/home/santos-family/.openclaw/workspace/movie-agent')


def main() -> int:
    parser = argparse.ArgumentParser(description='Workspace-level relay into the movie-agent Telegram/OpenClaw dispatcher.')
    parser.add_argument('message', help='Raw user movie-related message')
    args = parser.parse_args()

    return subprocess.call(
        [sys.executable, 'movie_agent_dispatch.py', args.message],
        cwd=str(MOVIE_AGENT_DIR),
    )


if __name__ == '__main__':
    raise SystemExit(main())
