# Knowledge maintenance schema

## Ingest

1. Search the existing raw and wiki records for the URL, title, and underlying claim.
2. Record new external evidence in `knowledge/raw/`; do not overwrite earlier observations.
3. Separate facts, user-provided context, inference, recommendation, and open uncertainty.
4. Prefer primary sources for technical, legal, accessibility, and platform constraints.
5. Research principles and counterexamples; do not copy protected expression or distinctive attraction design.

## Query

Start from `knowledge/wiki/index.md`, then open the relevant synthesis and only the raw sources needed to inspect its evidence.

## Lint

Before promoting a claim into the wiki, verify:

- a canonical URL and access date exist;
- freshness-sensitive claims include a source/update date;
- materially important claims are supported by the opened source rather than a search snippet;
- duplicate or syndicated sources are not counted as independent evidence;
- conflicts and inference are labeled;
- recommendations name their decision criteria.

## Update

- Maintain `knowledge/wiki/index.md` as the content-oriented entry point.
- Append material synthesis changes to `knowledge/wiki/log.md` chronologically.
- Supersede a claim explicitly; never erase the fact that an earlier source or decision existed.
