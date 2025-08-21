# Test Scripts Folder

Deze folder bevat gespecialiseerde test scripts voor verschillende use cases.

## Scripts

### `run-tests.py`
Interactive test menu - kiest automatisch de juiste test runner.

```bash
python scripts/run-tests.py
```

### `test-docker.py` 
Direct Docker integration tests - controleert Docker eerst.

```bash
python scripts/test-docker.py
```

### `test-e2e.py`
E2E tests met verschillende modes:

```bash
python scripts/test-e2e.py         # Basic E2E
python scripts/test-e2e.py live    # Live server E2E  
python scripts/test-e2e.py stress  # Stress tests
```

## Main Test Runner

Voor dagelijks gebruik, gebruik de main test runner:

```bash
python test.py unit        # Snelste
python test.py integration # Met API
python test.py docker      # Container tests
python test.py e2e         # End-to-end tests
python test.py all         # Alle tests
```

Deze scripts zijn georganiseerd om het root directory op te ruimen en gespecialiseerde functionaliteit te bieden.