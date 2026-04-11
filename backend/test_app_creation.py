#!/usr/bin/env python3
"""Test app creation and route registration."""

from app import create_app

try:
    app = create_app()
    print("✓ App created successfully")
    
    # Get all registered routes
    routes = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            routes.append(f"{rule.rule} -> {rule.endpoint} [{methods}]")
    
    routes.sort()
    print(f"\n✓ Total routes registered: {len(routes)}\n")
    for route in routes:
        print(route)
    
    print("\n✓ App is ready to serve requests")
    
except Exception as e:
    print(f"✗ Error creating app: {e}")
    import traceback
    traceback.print_exc()
