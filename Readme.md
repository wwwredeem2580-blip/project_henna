# Development (Local)
```
docker compose -f docker-compose.dev.yaml up -d
```

# Production (VPS)
```
docker compose -f docker-compose.prod.yaml up -d
```

# NPM Security Issues(server)
AWS SDK v3 dependency chain includes fast-xml-parser advisory GHSA-37qj-frw5-hhjh.
Not exploitable because application does not parse untrusted XML input.