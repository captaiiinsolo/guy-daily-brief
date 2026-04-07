# 2026-04-06 - Movie download agent preferences

Solo chose Option A for a movie download agent: chat-driven selection with approval before starting downloads.

## Search and ranking preferences
- Prefer 1080p
- 720p is okay as fallback
- No 4K unless there is no other good option and it is explicitly approved
- Prefer x264
- x265 / HEVC is okay
- Avoid AV1
- Prefer efficient releases
- Avoid absurdly huge encodes
- Avoid low-seeder / high-leecher options
- Prefer highest quality audio first
- Avoid dual-audio clutter
- Avoid foreign-dub unless requested
- English subtitles only

## Preferred release groups
- YIFY
- BONES

## Filtering preferences
Avoid:
- CAM
- TS / telesync
- screeners
- passworded archives
- low-quality junk
- tracker-spam folders
- low-confidence or ambiguous releases

## Post-download handling
- Move to Movies destination on theK3yMedia
- Normalize names cleanly
- Strip tracker junk from filenames/folder names
- Keep post-download organization automatic after approval

## Malware scan gate
Before moving completed downloads to theK3yMedia:
- Run `clamscan` on the completed download/folder
- If the virus database is outdated, run `freshclam`
- Then run `clamscan` again
- Only move the download if the scan passes cleanly

## Approval boundary
- Always ask before starting the download
- After approval, handle organization automatically
- Ask only if result/title/year match is ambiguous
