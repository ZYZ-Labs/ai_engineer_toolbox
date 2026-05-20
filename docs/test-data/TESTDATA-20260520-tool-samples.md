# TESTDATA-20260520-tool-samples

## JSON Diff

Left:

```json
{"temperature":0.2,"stream":true}
```

Right:

```json
{"temperature":0.3,"stream":true,"seed":7}
```

Expected output includes:

```txt
~ $.temperature: 0.2 -> 0.3
+ $.seed: 7
```

## SSE Parser

Input:

```txt
event: message
data: {"delta":"hello"}

event: done
data: [DONE]
```

Expected output includes two parsed event blocks.

## Messages Formatter

Input:

```json
[{"role":"system","content":"Be precise."},{"role":"user","content":"Explain RAG evaluation."}]
```

Expected output includes `SYSTEM` and `USER` sections.
