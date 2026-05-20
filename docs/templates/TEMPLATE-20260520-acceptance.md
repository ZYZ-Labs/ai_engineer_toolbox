# TEMPLATE-20260520-acceptance

## Browser Acceptance

- Open `/`.
- Search for `SSE`.
- Open `/tools/ai/sse-parser`.
- Confirm default SSE sample parses into JSON-like event blocks.
- Open `/tools/crypto/aes`.
- Encrypt the default text and confirm an IV is displayed.
- Decrypt the ciphertext using the displayed IV and same passphrase.
- Open `/study/rag-roadmap`.
- Confirm the study page renders headings, lists, and body text.

## Deployment Acceptance

- Confirm GitHub Actions Pages workflow succeeds.
- Confirm the Pages artifact contains `CNAME`.
- Confirm `https://toolbox.silvericekey.fun` resolves to the deployed site after DNS propagation.
- Confirm HTTPS is enabled in GitHub Pages settings.
