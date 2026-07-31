# Karpathy LLM Wiki source record

Accessed: 2026-08-01 JST  
Status: confirmed primary source for this project's recording pattern

## Source

- Title: `LLM Wiki`
- Author/publisher: Andrej Karpathy, GitHub Gist
- Canonical URL: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Created: 2026-04-04 16:25 (as displayed by GitHub)
- Visible code revisions at access time: 1

## Confirmed source claims used here

- The core pattern is a persistent, incrementally maintained wiki between immutable raw sources and query-time use.
- Its three layers are raw sources, the LLM-maintained wiki, and a schema/configuration document that defines structure and workflows.
- Named operations are ingest, query, and lint.
- The suggested navigation separates a content-oriented `index.md` from a chronological `log.md`.
- The document is intentionally abstract and says the concrete structure should be adapted to the domain rather than copied mechanically.

## Freshness note

The Gist body still displayed one code revision on 2026-08-01. The discussion continued through at least 2026-07-28, including implementation reports about review gates, drift, deduplication, and physically enforcing the immutability boundary. Those comments are implementation leads, not Karpathy-authored requirements, so this project keeps the three-layer core and adds only the controls justified by its own needs.

## Project inference

For a 48-hour multi-agent build, the smallest useful instantiation is:

- append-only source records in `knowledge/raw/`;
- concise synthesized topic pages in `knowledge/wiki/`;
- ingest/query/lint rules in `knowledge/schema/README.md` plus agent recovery rules in `AGENTS.md`;
- active task state outside the wiki in `docs/imp/`, so research synthesis and execution status cannot silently overwrite one another.
