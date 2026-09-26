# RAG — Retrieval Augmented Generation

**RAG means fetching relevant text at query time and putting it in the prompt, so the model answers from your data instead of from memory.** That is the entire idea. Everything below is about the fact that each of those words — *relevant*, *fetching*, *your data* — hides a system that is easy to build badly.

The framing that matters in an interview: **RAG is a search problem wearing an AI hat.** Teams reach for a better model when their answers are wrong, and the cause is almost always that the right passage never made it into the context. No model can answer from text it was not given.

## Table of Contents

- [1. Why RAG Exists](#1-why-rag-exists)
- [2. The Pipeline End to End](#2-the-pipeline-end-to-end)
- [3. Ingestion — Parsing Before Chunking](#3-ingestion-parsing-before-chunking)
- [4. Chunking](#4-chunking)
- [5. Embeddings for Retrieval](#5-embeddings-for-retrieval)
- [6. Vector Stores and Indexes](#6-vector-stores-and-indexes)
- [7. Hybrid Search — Why Vectors Alone Lose](#7-hybrid-search-why-vectors-alone-lose)
- [8. Reranking](#8-reranking)
- [9. Query Transformation](#9-query-transformation)
- [10. Context Assembly and the Generation Prompt](#10-context-assembly-and-the-generation-prompt)
- [11. Evaluation](#11-evaluation)
- [12. Beyond Naive RAG](#12-beyond-naive-rag)
- [13. Production Concerns](#13-production-concerns)
- [14. Failure Modes and How to Diagnose Them](#14-failure-modes-and-how-to-diagnose-them)
- [15. When NOT to Use RAG](#15-when-not-to-use-rag)
- [16. Interview Questions & Answers](#16-interview-questions-answers)
- [17. Tricky Questions](#17-tricky-questions)
- [18. Cheat Sheet](#18-cheat-sheet)
- [19. References](#19-references)

---

## 1. Why RAG Exists

A language model knows only what was in its training data, frozen at its **knowledge cutoff**. That leaves four gaps no amount of prompting closes:

| Gap | Why the model cannot help | What RAG does |
|---|---|---|
| **Private data** | your wiki was never in the training set | retrieves from your systems |
| **Fresh data** | training stopped at a date | retrieves the current version |
| **Scale** | a corpus can exceed any context window | retrieves only what is relevant |
| **Attribution** | weights cannot be cited | returns the source alongside the answer |

**The fifth reason is the one people forget: access control.** Facts baked into weights apply to everyone. Retrieved facts can be filtered per user, which is the only workable way to build anything multi-tenant.

**RAG vs fine-tuning vs long context** is the question underneath most RAG interviews:

| Approach | Best for | Breaks down when |
|---|---|---|
| **RAG** | facts that are private, large, changing, or need citing | the question needs the whole corpus at once ("summarise every complaint this year") |
| **Fine-tuning** | behaviour — format, tone, domain vocabulary | you use it for facts: cannot update, cite, or scope them |
| **Long context** | a small, bounded corpus you ask many questions about | cost, latency, and accuracy all degrade with length |

They are not rivals. A mature system is usually a fine-tuned or well-prompted model, answering from retrieved context, inside a large window that gives retrieval room to be imperfect.

---

## 2. The Pipeline End to End

Two phases. **Indexing** happens offline, **retrieval** happens per query, and most teams under-invest in the first and blame the second.

```text
INDEXING  (offline, on a schedule or on change)
  source ──► parse ──► chunk ──► enrich ──► embed ──► store
  (PDF,      (text +   (split    (title,    (vector)  (vector index
   HTML,      layout)   with      section,             + keyword index
   DB, API)             overlap)  dates,               + metadata)
                                  IDs)

RETRIEVAL  (per query, budget ≈ 200-800ms)
  question ──► transform ──► search ──────────────► rerank ──► assemble ──► generate
               (rewrite,     (vector + keyword,     (cross-    (top 3-5    (answer +
                expand,       filtered by ACL)       encoder)   chunks)     citations)
                route)             │
                              top 50-100
```

**The numbers on that diagram are the shape of a good default**: retrieve wide (50–100 candidates) optimising for *recall*, then rerank down to 3–5 optimising for *precision*. Retrieval and reranking answer different questions — "is the answer anywhere in here?" versus "which of these is best?" — and one model cannot do both cheaply.

---

## 3. Ingestion — Parsing Before Chunking

**Most RAG quality is lost before a single embedding is computed.** If your PDF parser turns a two-column layout into interleaved nonsense, no chunking strategy recovers it.

| Source | The trap | What works |
|---|---|---|
| **PDF** | multi-column text interleaves; tables flatten into word soup; scans have no text layer | layout-aware parsing, or send the page **as an image** to a multimodal model |
| **HTML** | nav, footers and cookie banners embed as content and match everything | extract the main content region; strip boilerplate before chunking |
| **Slides** | text is positioned, not ordered; meaning lives in the image | extract speaker notes too; consider captioning the slide image |
| **Spreadsheets** | a row is meaningless without its header | serialise each row *with* its column names, or query the data instead of retrieving it |
| **Code** | splitting mid-function destroys it | split on syntactic boundaries (function, class) using a real parser |
| **Email/chat** | quoting duplicates content endlessly; threads fragment | strip quoted replies; consider the thread as the unit |

**Tables deserve their own note** because they are the most common source of confidently wrong RAG answers. A table flattened to prose loses the row/column relationship, so the model reads numbers off the wrong row. Options that work: keep the table as markdown in one chunk, generate a natural-language summary of the table to embed alongside it, or — best where possible — do not retrieve tabular data at all and let the model query a database instead (see §15).

**Enrichment at ingest is cheap and pays back at query time.** Store with every chunk: its source document and URL, the section heading path, a created/updated timestamp, the owning team or tenant, and an ACL identifier (access-control list — which users or groups may read this document). All of it becomes a metadata filter later, and metadata filtering is the highest-leverage precision tool you have.

---

## 4. Chunking

The unit you index. Too large and one chunk covers many topics, so its embedding averages into vagueness and you waste context. Too small and it loses the surrounding meaning — "it increased by 12%" without what "it" is.

**Strategies, roughly in order of how often they are the right answer:**

| Strategy | How it splits | Use when |
|---|---|---|
| **Structure-aware** | on real boundaries — headings, sections, list items | the document has structure (markdown, HTML, code) — **usually the best choice** |
| **Recursive character** | try paragraph, then sentence, then word, until under the size limit | the default fallback for unstructured prose |
| **Semantic** | start a new chunk where adjacent sentences diverge in meaning | prose without headings and a corpus worth the extra cost |
| **Fixed-size** | every *n* tokens | almost never — it splits mid-sentence |
| **Page-level** | one chunk per page | scanned or visually-laid-out documents; surprisingly strong for PDFs |
| **Parent-child** | index small chunks, return their larger parent | precision in search, context in the answer — an excellent default |

**A starting point, not a law: 300–500 tokens with 10–20% overlap.** Then tune against a real evaluation set, because the right size depends on your documents and your questions. Short factual queries favour smaller chunks; "how does X work" questions favour larger ones.

**Overlap exists for one reason** — a fact that straddles a boundary would otherwise be in neither chunk intelligibly. It costs storage and creates near-duplicate results, which is a reason to deduplicate before assembling context.

**Parent-child (small-to-big) is worth understanding properly** because it resolves the core tension. Embed and search over small, precise chunks; when one matches, pass its larger parent section to the model. You get the retrieval accuracy of small chunks and the comprehension of large ones. The variant that also works well is **sentence-window**: index single sentences, return the sentences either side.

**Contextual retrieval** is the technique that has shown the largest measured gains: before embedding, prepend a short LLM-generated description of how the chunk fits into its document ("This section of the 2025 annual report discusses Q3 revenue in the EMEA segment"). It fixes the pronoun-and-orphan problem directly. Anthropic's published results put the reduction in top-20 retrieval failures at **35%** for contextual embeddings, **49%** combined with contextual BM25 (the same trick applied to the keyword index — BM25 is covered in §7), and **67%** with a reranker on top. It costs one cheap LLM call per chunk at ingest — an offline cost paid once.

---

## 5. Embeddings for Retrieval

An **embedding** turns text into a vector whose direction encodes meaning; similar meanings point in similar directions, measured by **cosine similarity**. That is what makes "how do I reset my password" find a document titled "credential recovery" with no shared words.

**What to actually decide:**

- **Dimensions.** More captures more nuance and costs more to store and search. Many current models support *Matryoshka* truncation — you can cut the vector down (3,072 → 512) and keep most of the quality, which is the cheap win once your index is large.
- **Max input length.** If a chunk exceeds it, the model silently truncates and you index half a chunk.
- **Multilingual** support, if your corpus or your users are.
- **Asymmetric search.** Some models expect a prefix or a separate encoding mode for the query versus the document, because a short question and a long passage are different shapes. Skipping this quietly costs you accuracy.
- **Domain fit.** General embedding models under-represent specialist jargon. Measure on your own data before assuming.

**Two rules that are not negotiable:**

1. **The same model must embed the query and the documents.** Vectors from different models are not comparable — not "less accurate", meaningless.
2. **Changing the embedding model means re-indexing the entire corpus.** Budget for it; it is the main cost of switching, and it is why you should evaluate candidates before you have a billion chunks.

---

## 6. Vector Stores and Indexes

A **vector database** stores embeddings and answers "which of these are nearest to my query vector?" Exact nearest-neighbour search is linear in corpus size, so real systems use **ANN (approximate nearest neighbour)** — dramatically faster, with a small, tunable accuracy cost.

| Index | How it works | Trade-off |
|---|---|---|
| **HNSW** | a navigable graph of vectors, searched greedily | fastest queries, high memory, the common default |
| **IVF** | cluster the space, search only nearby clusters | less memory; recall depends on how many clusters you probe |
| **Flat** | compare against everything | exact and simple — fine up to ~100k vectors |
| **Quantised (PQ/SQ — product / scalar quantisation)** | compress vectors to fewer bits | large memory savings, some recall loss |

**The tuning knob to name in an interview is recall versus latency.** HNSW's `ef_search` (and IVF's `nprobe`) controls how much of the graph is explored: raise it and you find more of the true nearest neighbours more slowly. Systems that "miss obvious documents" are often just under-searched.

**Choosing a store — the honest version:**

- **Already have Postgres?** `pgvector` is usually the right first answer. One database, real transactions, joins against your existing tables, and metadata filtering in SQL. It comfortably handles millions of vectors, and it means your ACLs and your vectors cannot drift apart.
- **Already have Elasticsearch/OpenSearch?** It does vectors and BM25 in one query, which makes hybrid search trivial.
- **A dedicated store** (Qdrant, Weaviate, Milvus, Pinecone) earns its place at very large scale, or when you need features like multi-vector, built-in hybrid fusion, or managed sharding.

**The feature that decides it in practice is filtered search.** Filtering by tenant, permission, date or document type must happen *inside* the ANN search — "pre-filtering" — not by retrieving 50 results and then discarding those the user cannot see. Post-filtering silently returns fewer results than requested, and in the worst case returns none while the answer sits one rank below the cut.

---

## 7. Hybrid Search — Why Vectors Alone Lose

Pure vector search fails in specific, predictable ways:

| Query | Why the vector fails |
|---|---|
| `ERR_CONN_REFUSED_4021` | an error code has no semantics; it needs an exact match |
| "the Hoffman clause" | rare proper nouns are poorly represented |
| "did the deploy **not** succeed?" | negation barely moves a vector — "succeeded" and "failed" are neighbours |
| `useSyncExternalStore` | identifiers need lexical matching, not gist |

**Keyword search (BM25)** — the standard keyword-ranking formula, which scores a document by how often the query's words appear in it, weighting rare words more heavily than common ones — has exactly the opposite strengths: it nails rare terms and exact strings, and it is useless when the user's words differ from the document's. So combine them.

**Fusing the two ranked lists** is usually done with **Reciprocal Rank Fusion (RRF)**, which is popular because it needs no score calibration — vector similarities and BM25 scores are on incomparable scales, and RRF uses only the *ranks*:

```text
score(doc) = Σ  1 / (k + rank_in_list)        k ≈ 60 by convention

           doc appears at rank 1 in vector, rank 8 in BM25
           = 1/(60+1) + 1/(60+8) = 0.0164 + 0.0147 = 0.0311
```

A document that both methods rank highly wins; a document either method ranks very highly still surfaces. The alternative — normalising and weighting the raw scores — gives you a tuning dial but needs recalibrating whenever either side changes.

**The practical answer to "how do I improve RAG retrieval?" is almost always: add BM25 and a reranker**, in that order, before touching models or chunk sizes.

---

## 8. Reranking

A **reranker** is a **cross-encoder**: it takes the query and one candidate *together* and scores how well they match. Embedding models are **bi-encoders** — they encode query and document separately, so they never see them side by side.

```text
Bi-encoder  (retrieval):   embed(query)  ·  embed(doc)      → precomputable, fast, approximate
Cross-encoder (reranking): score(query + doc together)      → not precomputable, slow, accurate
```

That difference is the whole justification for the two-stage design. A cross-encoder cannot be precomputed, so scoring a million documents is impossible — but scoring 50 is perfectly affordable and dramatically better at ordering.

**Where it helps most:** pushing the genuinely-correct chunk from rank 15 into the top 3. Retrieval commonly *finds* the answer and *ranks it below the cut*, and the model only ever sees what you pass it.

**The practical shape:** retrieve 50–100, rerank, pass 3–5. Costs 50–200 ms and a small fee, and is the highest return-on-effort change in most RAG systems. A reranker score also gives you something retrieval similarity does not: a usable **relevance threshold**, so you can answer "I don't have information on that" instead of dressing up the least-bad chunk.

---

## 9. Query Transformation

The user's question is often a poor search query. Transforming it before retrieval is cheap and effective.

| Technique | What it does | Use when |
|---|---|---|
| **Rewriting** | turn a conversational turn into a standalone query | multi-turn chat — "what about the second one?" retrieves nothing |
| **Multi-query** | generate 3–5 phrasings, search all, fuse the results | vocabulary mismatch between users and documents |
| **Decomposition** | split a compound question into sub-questions | "compare X and Y" needs two retrievals, not one |
| **HyDE** | generate a hypothetical *answer* and embed that | the question and the answer are worded very differently |
| **Routing** | choose the index, or skip retrieval entirely | multiple corpora, or chit-chat that needs no lookup |

**Query rewriting for follow-ups is not optional in a chatbot.** "How much does it cost?" embedded on its own retrieves nothing useful; rewritten against the conversation into "How much does the Enterprise plan cost?" it retrieves correctly. This is the single most common missing piece in chat RAG.

**Routing deserves emphasis too**: "hi", "thanks", and "can you rewrite that shorter" should never hit the retriever. A cheap classifier in front saves latency and prevents irrelevant context from derailing the answer.

---

## 10. Context Assembly and the Generation Prompt

Retrieval succeeded; now the chunks have to be turned into a prompt.

**Ordering matters** because of "lost in the middle" — models attend best to the beginning and end of long context. With several chunks, put the highest-ranked ones at the edges rather than in the middle.

**Label every chunk with its source** so the model can cite it and so you can verify the citation afterwards:

```text
<document id="7" title="Refund Policy" url="/policies/refunds" updated="2026-03-11">
Refunds are issued to the original payment method within 5 business days...
</document>
```

**Deduplicate.** Overlapping chunks from the same section will otherwise repeat the same sentences, wasting context and over-weighting whatever was duplicated.

**The generation prompt has four jobs**, and the third is the one teams omit:

1. State the task and the audience.
2. Instruct the model to answer **only** from the provided documents.
3. **Explicitly permit "the documents do not contain this."** Without permission, a model trained to be helpful will fill the gap.
4. Require inline citations by document id, so claims are traceable.

Then **verify the citations in code** — check the ids exist and, where you can, that the quoted text appears in that chunk. A model that cites document 7 for a sentence that is not in document 7 is the failure mode users notice first, and it is mechanically detectable.

---

## 11. Evaluation

**Evaluate retrieval and generation separately.** They fail for different reasons and mixing them makes every result uninterpretable.

**Retrieval metrics** need a small labelled set — questions paired with the chunks that genuinely answer them:

| Metric | Question it answers |
|---|---|
| **Recall@k** | is the right chunk in the top *k* at all? — **the one that matters most**, because generation cannot recover from a miss |
| **Precision@k** | how much of what we passed was useful? |
| **MRR** | how high up was the first correct chunk? |
| **NDCG** | rank quality when relevance is graded rather than binary |

**Generation metrics**, usually scored by an LLM judge against a rubric — the "RAG triad":

- **Faithfulness / groundedness** — is every claim supported by the retrieved context? This is the hallucination detector.
- **Answer relevance** — does it address what was asked?
- **Context relevance** — was the retrieved material actually about the question?

Those three localise the fault: low context relevance is a retrieval problem, low faithfulness with good context is a generation problem, low answer relevance with both good is usually a prompt problem.

**The operational part matters more than the metric names.** Build a golden set from real questions, version it, run it in CI, and gate deploys on a threshold. Every production surprise becomes a new case. And keep online signals — thumbs down, escalation to a human, whether the user rephrased — because offline evaluation only proves you did not regress against your own assumptions.

---

## 12. Beyond Naive RAG

Reach for these only when you have a measured failure that they address — each adds latency, cost and things to debug.

| Pattern | Fixes | Cost |
|---|---|---|
| **Contextual retrieval** | chunks that lose their meaning out of context | one cheap LLM call per chunk at ingest |
| **Late chunking** | the same, embedded differently — embed the whole document, then pool per chunk | needs a long-context embedding model |
| **Parent-child** | small chunks retrieve well but read badly | storage, slightly more plumbing |
| **Self-query** | "invoices from March over $10k" — filters expressed in natural language | an LLM call to build the metadata filter |
| **Agentic RAG** | questions needing several searches, or a decision about *where* to look | multiple LLM turns; latency and unpredictability |
| **GraphRAG** | multi-hop questions over entities and relationships | a graph build step and much higher ingest cost |
| **Corrective RAG (CRAG)** | retrieval that returns nothing good — grade results, fall back to web or ask | an extra grading call |

**Agentic RAG is the direction the field has moved**, and it is worth being able to describe: instead of one retrieve-then-generate pass, the model decides whether to search, formulates the query, inspects the results, and searches again if they were poor. It handles compound and exploratory questions that single-shot RAG cannot. The price is unpredictable latency and cost, so it needs a hard step budget.

**GraphRAG answers a question pure vector search structurally cannot** — "which customers are affected by the vendor that supplies component X?" requires traversing relationships, not finding similar text. It is expensive to build and worth it only when your questions are genuinely relational.

---

## 13. Production Concerns

**Freshness and deletion.** The index is a copy, and a copy goes stale. Decide the update mechanism at design time: full reindex (simple, expensive), incremental on change events (the usual answer), or scheduled deltas. **Deletion is the one people forget** — a document removed from the source is still answerable while it remains in the index, which is a compliance problem as much as a quality one.

**Multi-tenancy and access control.** Filter at retrieval time by the authenticated user's permissions, inside the search. Never instruct the model to respect permissions — it cannot enforce anything, and an instruction is not an access-control mechanism. Permissions also change after ingest, so the filter must read current ACLs rather than a snapshot. And **cache per user**, or one person's cached answer leaks to another.

**Cost.** The dominant line items are embedding at ingest (one-off per chunk, plus re-embedding when you change model), vector storage and memory (which is why quantisation and dimension truncation matter), and generation tokens per query (which is why you pass 3–5 chunks, not 20). Reranking is small but not free.

**Latency budget.** A conversational feature needs retrieval to finish in a few hundred milliseconds:

```text
query transform   30-100ms    (skip for single-turn)
vector search     10-50ms
keyword search    10-50ms     (in parallel with vector)
rerank            50-200ms
──────────────────────────
retrieval total   ~100-400ms   then generation streams
```

Parallelise the two searches, and stream the answer so time-to-first-token is what the user feels.

**Observability.** Log the query, the rewritten query, the retrieved ids with scores, what was passed to the model, and the answer with its citations. Without that trace you cannot tell a retrieval failure from a generation failure, and every incident becomes guesswork.

---

## 14. Failure Modes and How to Diagnose Them

**The first question for any bad answer: was the correct chunk in the context?** That single check splits the problem in half, and it is why you log retrieved ids.

| Symptom | Likely cause | Fix |
|---|---|---|
| Answer is right but ignores a document you know exists | it never retrieved — vocabulary mismatch | hybrid search, query rewriting, contextual retrieval |
| Correct chunk retrieved but ranked 20th | ranking, not retrieval | add a reranker; retrieve wider |
| Answers are vague and hedge | chunks too large, or too many passed | smaller chunks, parent-child, pass fewer |
| Confidently wrong numbers | a table was flattened at parse time | layout-aware parsing, keep tables whole, or query the database |
| Contradictory answers to the same question | stale duplicates in the index | deduplicate; delete superseded versions |
| Works single-turn, fails in conversation | no query rewriting for follow-ups | rewrite against history before retrieving |
| Cites a document that does not support the claim | generation, not retrieval | citation verification, lower temperature, stricter prompt |
| "I don't know" for things clearly in the corpus | over-strict threshold, or the ACL filter is too broad | check the filter first, then the threshold |
| Good in evaluation, bad in production | golden set does not match real queries | sample real traffic into the golden set |

---

## 15. When NOT to Use RAG

Saying this unprompted is a strong signal.

- **Structured, aggregate questions.** "What was total revenue by region last quarter?" is SQL. Retrieving text chunks about revenue and asking a model to add them up is slower, more expensive and wrong more often. Use text-to-SQL or a tool over the real database.
- **A corpus small enough to fit in context.** Below roughly a few tens of thousands of tokens, put it all in the prompt, use prompt caching, and skip the pipeline entirely.
- **Actions rather than knowledge.** "Cancel my order" is a tool call.
- **Questions over the whole corpus.** "Summarise every complaint this month" is a map-reduce job (summarise each batch, then summarise the summaries), not a top-k retrieval, because it needs every document rather than the few most similar ones.
- **When the model already knows it.** General knowledge needs no retrieval, and retrieving badly for it makes the answer worse.

---

## 16. Interview Questions & Answers

**Q1: Explain RAG end to end.**

Two phases. **Offline indexing**: parse sources into clean text, split into chunks, enrich each with metadata like title, section, timestamp and access identifiers, embed them, and store them in a vector index alongside a keyword index.

**Per query**: optionally rewrite the question — essential in multi-turn chat, where "what about the second one?" retrieves nothing on its own — then search vector and keyword indexes in parallel, filtered by what this user is allowed to see. Fuse the two ranked lists, typically with reciprocal rank fusion. Rerank the top 50–100 with a cross-encoder down to the best 3–5. Assemble those into a prompt with source labels, instruct the model to answer only from them and to say when they do not contain the answer, and generate with inline citations. Then verify the citations resolve.

The part I would emphasise is the two-stage retrieve-wide-then-rerank shape: the first stage optimises recall, the second precision, and they need different models because a cross-encoder cannot be precomputed.

---

**Q2: How do you choose a chunking strategy and size?**

I start from the document's own structure, because splitting on headings and sections preserves meaning that any length-based rule destroys. Recursive character splitting is the fallback for unstructured prose; code should be split with a parser on function and class boundaries; scanned or heavily laid-out PDFs often do best at page level.

For size I start around 300–500 tokens with 10–20% overlap and then tune against an evaluation set, because the answer depends on the documents and the questions. Short factual lookups favour smaller chunks; explanatory questions favour larger ones.

Where the two pull against each other I use **parent-child**: index small precise chunks for search, but pass their larger parent section to the model. That gives retrieval accuracy and reading comprehension at the same time. And I would mention **contextual retrieval** — prepending a one-line LLM-generated description of where the chunk sits in its document before embedding — because it directly fixes orphaned pronouns and has the largest published gains of anything in this area.

---

**Q3: Why is hybrid search usually better than vector search alone?**

Because embeddings capture gist, and several common queries are not about gist. Error codes, SKUs, function names and version strings need exact lexical matching — an embedding of `ERR_CONN_REFUSED_4021` carries almost no usable signal. Rare proper nouns are poorly represented. And negation barely moves a vector: "the deploy succeeded" and "the deploy failed" are near neighbours.

BM25 keyword search has the opposite profile — excellent on rare exact terms, useless when the user's wording differs from the document's. Running both and fusing the ranked lists covers both failure modes.

I would fuse with reciprocal rank fusion, because cosine similarities and BM25 scores are on incomparable scales and RRF uses only ranks, so it needs no calibration. Weighted score fusion gives you a tuning dial but has to be recalibrated whenever either retriever changes.

---

**Q4: What does a reranker do that retrieval does not?**

Retrieval uses a bi-encoder: query and document are embedded separately, so their vectors can be precomputed and searched fast, but the model never sees the pair together. A reranker is a cross-encoder — it processes query and candidate jointly and scores the match, which is far more accurate and impossible to precompute.

That is why the two-stage design exists. You cannot cross-encode a million documents, but cross-encoding 50 costs 50–200 ms. The usual pattern is retrieve 50–100 for recall, rerank, pass 3–5 for precision.

The failure it fixes is specific and common: the correct chunk *was* retrieved but ranked below the cut, so the model never saw it. A reranker also gives you a calibrated relevance score, which lets you say "I don't have information on that" rather than passing the least-bad chunk and getting a confident wrong answer.

---

**Q5: Your RAG system gives a wrong answer. How do you debug it?**

The first thing I check is whether the correct chunk was in the context at all, which is why I log the retrieved ids and scores for every request. That single check splits the problem into two very different investigations.

If it was **not retrieved**, it is a search problem: vocabulary mismatch (add hybrid search or query rewriting), a chunk that lost its meaning when split (contextual retrieval or parent-child), a metadata filter excluding it, or an ANN index under-searched — raising `ef_search`/`nprobe` sometimes recovers documents that were simply never visited.

If it **was retrieved but ranked low**, it is a ranking problem: add or improve the reranker, retrieve more candidates.

If it was **in the context and the answer still contradicted it**, it is generation: check the prompt actually restricts the model to the sources, verify the citations resolve, lower the temperature, and reduce how many chunks are passed, since a crowded context makes the model pick the wrong passage.

Finally I would ask whether the parse was right at all — flattened tables produce confidently wrong numbers that look like model failure and are actually ingestion failure.

---

**Q6: How do you evaluate a RAG system?**

Separately at each stage, because they fail for different reasons.

For **retrieval** I need a labelled set of questions with the chunks that genuinely answer them, and I track recall@k above everything else — if the right chunk is not in the top k, no amount of generation quality recovers it — plus MRR or NDCG for ranking quality.

For **generation** I use the three-way split usually called the RAG triad: **faithfulness** (is every claim supported by the retrieved context — this is the hallucination measure), **answer relevance** (does it address the question), and **context relevance** (was the retrieved material actually on topic). Those three localise the fault between retrieval, prompt and model.

Practically: a version-controlled golden set built from real questions, run in CI with a threshold that gates deploys, grown every time production surprises us. Plus online signals — thumbs down, escalation rate, whether the user rephrased — because offline evaluation only proves you have not regressed against your own assumptions. I would also use an LLM judge carefully, with a concrete rubric rather than "rate 1–10", and knowing its position and verbosity biases.

---

**Q7: How do you handle access control in RAG?**

Filtering happens in retrieval, inside the search, using the authenticated user's identity from the session — never from anything the model produced, and never as an instruction in the prompt. A model cannot enforce access control; telling it "only use documents the user can see" is not a security control.

Concretely: store an ACL identifier on every chunk at ingest and apply it as a pre-filter in the vector search, or use per-tenant indexes or namespaces where isolation must be structural. Pre-filtering matters — filtering after retrieving top-k silently returns fewer results, and can return none while the right answer sits just below the cut.

The parts people miss: permissions change after ingest, so the filter must consult current ACLs rather than a snapshot; deletions must propagate, because a document removed from the source is still answerable while it is in the index; caches must be keyed per user or one person's answer leaks to another; and even correct filtering can leak through side channels, where "no results" versus a refusal reveals that a document exists.

---

**Q8: When would you not use RAG?**

Several cases. **Structured or aggregate questions** — "total revenue by region last quarter" is a SQL query; retrieving text about revenue and asking a model to add it up is slower, costlier and wrong more often. **A small corpus** that fits in context — put it in the prompt, use prompt caching, skip the pipeline. **Whole-corpus questions** like "summarise every complaint this month", which is map-reduce, not top-k. **Actions**, which are tool calls. And **general knowledge** the model already has, where retrieving badly makes the answer worse.

I would also flag when RAG is the wrong fix for the actual problem: if the complaint is about tone, format, or the model not following instructions, that is fine-tuning or prompting, not retrieval. Fine-tuning supplies behaviour, retrieval supplies knowledge — using either for the other's job is the most common architecture mistake in this area.

---

**Q9: How do you keep the index fresh, and what breaks if you do not?**

The index is a copy of the source, so I plan the update path up front: event-driven incremental updates on create/update/delete are the usual answer, with a periodic full reconciliation to catch what the event stream missed.

What breaks without it is worse than staleness. **Deleted documents remain answerable**, which is a compliance problem, not just a quality one. **Superseded versions coexist with current ones**, so the same question gets contradictory answers depending on which chunk ranks higher — and users lose trust in the whole feature quickly. **Permission changes do not take effect**, so a revoked user keeps getting results.

Practical measures: store a content hash per chunk so unchanged content is not re-embedded, store the source version and a timestamp so the model and the UI can prefer and display recency, tombstone rather than silently drop so you can audit, and treat re-embedding after a model change as a planned migration with a dual-index cutover rather than an in-place rewrite.

---

**Q10: Design a RAG system for a company's internal documentation — 200k documents, 5,000 employees, mixed permissions.**

**Ingestion**: connectors per source (wiki, Drive, Confluence, ticket system) writing to a normalising pipeline. Layout-aware parsing, with pages sent as images to a multimodal model where the layout carries meaning. Structure-aware chunking on headings, roughly 400 tokens, parent-child so search is precise but the model reads the whole section. Enrich every chunk with source, URL, heading path, owner, updated-at and the ACL identifier from the source system. Contextual retrieval on ingest since the corpus is large and the cost is one-off.

**Storage**: at this scale I would start with Postgres and `pgvector` if the company already runs Postgres — one system, transactional consistency between documents and ACLs, SQL metadata filters — and move to a dedicated store only if measurements demand it. Keyword index alongside for hybrid.

**Query path**: rewrite follow-ups against the conversation; route chit-chat away from retrieval; run vector and BM25 in parallel with an ACL pre-filter; RRF; rerank to 5; assemble with source labels; generate with mandatory citations and explicit permission to say the documents do not cover it; verify citations resolve.

**Operations**: incremental updates from source webhooks plus nightly reconciliation, deletion propagation, per-user caching, full request tracing (query, rewritten query, retrieved ids and scores, final context, answer), a golden set in CI, and thumbs-down feedback routed into that golden set. For 5,000 employees the traffic is low enough that cost is dominated by ingest, not queries — which is the argument for spending on contextual retrieval and reranking rather than on a cheaper model.

---

## 17. Tricky Questions

**Q1: Your evaluation shows recall@10 of 0.95, but users still complain about wrong answers. What is going on?**

High recall@10 means the right chunk is almost always in the top 10 — it says nothing about whether the model saw it. If you rerank and pass only the top 3, the metric you care about is recall@3 after reranking, and that can be far lower.

Several other gaps produce exactly this. The evaluation set may not resemble real traffic: labelled sets are usually built from clean, well-formed questions, while real users write fragments and follow-ups that never get rewritten. Recall counts a chunk as retrieved even if a flattened table inside it makes the number wrong. And the answer can be unfaithful to a correctly retrieved chunk, which is a generation failure that retrieval metrics cannot see.

The diagnostic is to instrument the whole chain and measure at the point where the context is actually assembled, then split the failures: was the chunk in the final context or not? Those two buckets have entirely different fixes, and a single aggregate metric hides the split.

---

**Q2: You switch to a better embedding model. Retrieval quality collapses. Why?**

Almost certainly because the index was not rebuilt. Vectors from different models live in different spaces, so comparing a new query vector against old document vectors produces essentially arbitrary similarity — and crucially it does **not** error. You get results, they are just meaningless, which is why this often ships.

Even with a full re-index there are two more traps. Many embedding models expect **asymmetric** encoding, with a different prefix or mode for queries than for documents; using the document mode for queries degrades quality silently. And similarity scores are **not comparable across models** — a fixed threshold of 0.75 that filtered well before may now reject everything or nothing, so any cut-off has to be recalibrated.

The safe procedure is a dual-index migration: build the new index alongside the old, evaluate both against the golden set, cut over, then delete. Re-embedding cost is the real price of changing model, and it is a reason to evaluate candidates before the corpus grows.

---

**Q3: The same question returns a good answer in the morning and a bad one in the afternoon, with no deploys. What could cause that?**

The most likely cause is that the index changed — an ingestion job ran and added a near-duplicate or a superseded version of the document, and it now outranks the one that used to win. Contradictory duplicates are the classic cause of "it used to be right", and they are invisible unless you log retrieved ids per request.

Other real causes: the corpus grew past a point where ANN recall degrades at the current `ef_search`/`nprobe`, so results are now approximate in a way they were not; a semantic cache is serving a neighbouring question's answer; a provider-side model update behind an unpinned alias; or per-user ACL differences if the two requests were not actually the same user.

Sampling variance is worth mentioning but is the least likely explanation for a large quality swing, and it is testable — replay the exact query at temperature 0 and compare retrieved ids first, not the text.

---

**Q4: Your chatbot answers "the refund window is 30 days" but the policy changed to 14 days last month. The new policy is in the index. What went wrong?**

The old chunk is still in the index and it is winning. Updating a document usually means writing a *new* chunk; unless the old one is deleted, both are retrievable and the model gets two contradictory sources — and with no signal about which is current, it answers from whichever ranked higher or whichever it happened to attend to.

Fixes at three levels. **Ingestion**: deletion and supersession must propagate, so an update deletes or tombstones the chunks from the previous version rather than only inserting new ones. **Retrieval**: carry `updated_at` as metadata and filter or boost by recency, and for policy-type content only index the current version. **Generation**: include the effective date in the chunk text itself so the model can see the conflict, and instruct it to prefer the most recent and to flag contradictions rather than silently picking.

The broader point is that a RAG index is a cache of someone else's source of truth, and every cache needs an invalidation story decided at design time.

---

**Q5: Retrieval returns nothing for "invoices over $10,000 from March", although such invoices exist. Why, and what is the right fix?**

Because that is not a semantic-similarity question. The embedding of the query is about invoices generally; the numeric comparison and the date range are structured predicates that vector search cannot evaluate. An invoice for $12,400 is not "more similar" to "over $10,000" than one for $80 — the model has no arithmetic in vector space.

There are two correct answers depending on the data. If the invoices are structured records, **do not use RAG** — translate the question into a database query and let SQL do the filtering. That is the right answer here, and volunteering it matters.

If they are documents with extractable attributes, use **self-query**: an LLM call converts the natural-language question into a metadata filter (`amount > 10000 AND month = '2026-03'`) plus a semantic part, and the filter is applied inside the search as a pre-filter. That requires having extracted amount and date into metadata at ingest, which is the real lesson — anything you will want to filter by must become metadata at ingest time, because you cannot filter on it later.

---

**Q6: A user reports that your assistant told them about "Project Nightingale", which is confidential and they have no access to. Your ACL filter is correct and the document was never retrieved for them. How is that possible?**

If the document genuinely was not retrieved, the information came from somewhere else in the context or the model. The most common explanation is **contamination through another channel**: the project name appears in a document they *can* see — a meeting agenda, a shared roadmap, a ticket title — so the fact leaked through a legitimately retrieved chunk. Access control is per document, and secrets do not respect document boundaries.

The second explanation is **cross-user cache or history bleed**: a semantic cache not keyed by user, a shared conversation store, or a summarisation step that folded an earlier privileged turn into a system message that persisted.

The third is that the model simply **generated a plausible name** and the user recognised it — a hallucination that happens to collide with something real. This is why the incident response starts with the request trace: the retrieved ids, the exact context sent, and whether the phrase appears in it at all.

Mitigations differ per cause: entity-level redaction or a separate confidentiality classifier at ingest for leakage through readable documents; per-user cache keys and per-conversation isolation for bleed; and citation verification, which would show the claim had no supporting source.

---

## 18. Cheat Sheet

**Framing**
1. RAG is a search problem — most bad answers are retrieval failures.
2. Fine-tuning supplies behaviour; retrieval supplies knowledge.
3. The first debugging question is always: was the right chunk in the context?

**Ingestion**
4. Parsing quality caps everything downstream.
5. Flattened tables cause confidently wrong numbers.
6. Anything you will filter by must become metadata at ingest.
7. Store source, URL, section path, timestamp and ACL on every chunk.

**Chunking**
8. Split on real structure before falling back to length.
9. Start at 300–500 tokens with 10–20% overlap, then tune on an eval set.
10. Parent-child: search small, pass large.
11. Contextual retrieval — prepend a one-line document context before embedding.

**Embeddings**
12. Same model for query and documents, always.
13. Changing model = re-index everything. Plan a dual-index cutover.
14. Similarity scores are not comparable across models — recalibrate thresholds.

**Search**
15. Hybrid (vector + BM25) beats either alone; fuse with RRF.
16. Vectors fail on exact identifiers, rare names and negation.
17. Filter **inside** the search, not after it.
18. Retrieve 50–100, rerank, pass 3–5.

**Reranking**
19. Cross-encoder scores query+document together — accurate, not precomputable.
20. It gives you a threshold, so you can say "I don't know".

**Query**
21. Rewrite follow-ups against conversation history, or chat RAG breaks.
22. Route chit-chat away from retrieval.

**Generation**
23. Put the best chunks at the start and end — lost in the middle is real.
24. Explicitly permit "the documents do not contain this".
25. Require citations, then verify them in code.

**Operations**
26. Deletion must propagate, or removed documents stay answerable.
27. Cache per user, or answers leak across tenants.
28. Log query, rewritten query, retrieved ids and scores, final context, answer.
29. Evaluate retrieval and generation separately; recall@k first.
30. Not everything is RAG — aggregates are SQL, actions are tools.

---

## 19. References

- [Anthropic — Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
- [Reciprocal Rank Fusion (Cormack et al.)](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
- [HNSW: Efficient and robust approximate nearest neighbor search](https://arxiv.org/abs/1603.09320)
- [RAGAS — evaluation framework for RAG](https://docs.ragas.io/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Microsoft GraphRAG](https://microsoft.github.io/graphrag/)
- [Corrective Retrieval Augmented Generation (CRAG)](https://arxiv.org/abs/2401.15884)
