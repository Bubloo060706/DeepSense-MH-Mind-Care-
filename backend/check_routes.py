#!/usr/bin/env python
import sys
sys.path.insert(0, 'd:\\MindCare\\backend')

from app import create_app

app = create_app()
print("Registered routes:")
for rule in app.url_map.iter_rules():
    if 'static' not in rule.endpoint:
        print(f"  {rule.rule} -> {rule.endpoint} {list(rule.methods)}")
