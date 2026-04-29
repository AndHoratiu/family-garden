#!/usr/bin/env python3
"""
Comprehensive backend testing for Family Garden Products CRUD API endpoints.
Tests all public and admin endpoints with proper authentication and edge cases.
"""

import requests
import json
import base64
import os
from typing import Dict, List, Any

# Configuration
BASE_URL = "https://fresh-harvest-152.preview.emergentagent.com/api"
ADMIN_TOKEN = "familygarden2025"
HEADERS = {"Content-Type": "application/json"}
ADMIN_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ADMIN_TOKEN}"
}

# Track test products for cleanup
test_products_created = []

def log_test(test_name: str, success: bool, details: str = ""):
    """Log test results with clear formatting."""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   {details}")
    print()

def make_request(method: str, endpoint: str, headers: Dict = None, data: Dict = None) -> tuple:
    """Make HTTP request and return (response, success, error_msg)."""
    try:
        url = f"{BASE_URL}{endpoint}"
        kwargs = {"headers": headers or HEADERS}
        if data:
            kwargs["json"] = data
        
        response = requests.request(method, url, **kwargs)
        return response, True, ""
    except Exception as e:
        return None, False, str(e)

def test_public_products_list():
    """Test GET /api/products - should return active products only."""
    print("🔍 Testing Public Products List (GET /api/products)")
    
    response, success, error = make_request("GET", "/products")
    if not success:
        log_test("Public products list - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Public products list - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        if "products" not in data:
            log_test("Public products list - Structure", False, "Missing 'products' key in response")
            return False
        
        products = data["products"]
        if not isinstance(products, list):
            log_test("Public products list - Type", False, "Products should be a list")
            return False
        
        # Should have ~27 products on first call (auto-seeded)
        if len(products) < 20:
            log_test("Public products list - Count", False, f"Expected ~27 products, got {len(products)}")
            return False
        
        # All products should be active=true
        inactive_products = [p for p in products if p.get("active") is False]
        if inactive_products:
            log_test("Public products list - Active filter", False, f"Found {len(inactive_products)} inactive products")
            return False
        
        # Check product structure
        if products:
            product = products[0]
            required_fields = ["id", "name", "category", "price", "unit", "stock", "active"]
            missing_fields = [f for f in required_fields if f not in product]
            if missing_fields:
                log_test("Public products list - Fields", False, f"Missing fields: {missing_fields}")
                return False
        
        log_test("Public products list", True, f"Found {len(products)} active products")
        return True
        
    except json.JSONDecodeError:
        log_test("Public products list - JSON", False, "Invalid JSON response")
        return False

def test_public_single_product():
    """Test GET /api/products/:id for valid and invalid IDs."""
    print("🔍 Testing Public Single Product (GET /api/products/:id)")
    
    # Test valid product ID
    response, success, error = make_request("GET", "/products/rosii-gradina")
    if not success:
        log_test("Single product (valid) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Single product (valid) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        if "product" not in data:
            log_test("Single product (valid) - Structure", False, "Missing 'product' key in response")
            return False
        
        product = data["product"]
        if product.get("id") != "rosii-gradina":
            log_test("Single product (valid) - ID", False, f"Expected id 'rosii-gradina', got {product.get('id')}")
            return False
        
        log_test("Single product (valid)", True, f"Retrieved product: {product.get('name')}")
        
    except json.JSONDecodeError:
        log_test("Single product (valid) - JSON", False, "Invalid JSON response")
        return False
    
    # Test invalid product ID
    response, success, error = make_request("GET", "/products/does-not-exist")
    if not success:
        log_test("Single product (invalid) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 404:
        log_test("Single product (invalid) - Status", False, f"Expected 404, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        if data.get("error") != "Product not found":
            log_test("Single product (invalid) - Error", False, f"Expected 'Product not found', got {data.get('error')}")
            return False
        
        log_test("Single product (invalid)", True, "Correctly returned 404 for non-existent product")
        return True
        
    except json.JSONDecodeError:
        log_test("Single product (invalid) - JSON", False, "Invalid JSON response")
        return False

def test_admin_products_list():
    """Test GET /api/admin/products - should return ALL products including inactive."""
    print("🔍 Testing Admin Products List (GET /api/admin/products)")
    
    # Test without authentication
    response, success, error = make_request("GET", "/admin/products")
    if not success:
        log_test("Admin products (no auth) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 401:
        log_test("Admin products (no auth) - Status", False, f"Expected 401, got {response.status_code}")
        return False
    
    log_test("Admin products (no auth)", True, "Correctly returned 401 without authentication")
    
    # Test with authentication
    response, success, error = make_request("GET", "/admin/products", ADMIN_HEADERS)
    if not success:
        log_test("Admin products (with auth) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Admin products (with auth) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        if "products" not in data:
            log_test("Admin products (with auth) - Structure", False, "Missing 'products' key in response")
            return False
        
        products = data["products"]
        if not isinstance(products, list):
            log_test("Admin products (with auth) - Type", False, "Products should be a list")
            return False
        
        log_test("Admin products (with auth)", True, f"Retrieved {len(products)} products (including inactive)")
        return True
        
    except json.JSONDecodeError:
        log_test("Admin products (with auth) - JSON", False, "Invalid JSON response")
        return False

def test_admin_create_product():
    """Test POST /api/admin/products - create new products."""
    print("🔍 Testing Admin Create Product (POST /api/admin/products)")
    
    # Test without authentication
    product_data = {
        "name": "Test Tomato 12345",
        "category": "Legume",
        "price": 9.5,
        "unit": "lei / kg",
        "description": "Test product",
        "stock": 5
    }
    
    response, success, error = make_request("POST", "/admin/products", data=product_data)
    if not success:
        log_test("Create product (no auth) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 401:
        log_test("Create product (no auth) - Status", False, f"Expected 401, got {response.status_code}")
        return False
    
    log_test("Create product (no auth)", True, "Correctly returned 401 without authentication")
    
    # Test with authentication and valid data
    response, success, error = make_request("POST", "/admin/products", ADMIN_HEADERS, product_data)
    if not success:
        log_test("Create product (valid) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Create product (valid) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        if "product" not in data:
            log_test("Create product (valid) - Structure", False, "Missing 'product' key in response")
            return False
        
        product = data["product"]
        if not product.get("id"):
            log_test("Create product (valid) - ID", False, "Product should have auto-generated ID")
            return False
        
        if not product.get("sortOrder"):
            log_test("Create product (valid) - Sort", False, "Product should have auto-assigned sortOrder")
            return False
        
        # Track for cleanup
        test_products_created.append(product["id"])
        
        log_test("Create product (valid)", True, f"Created product with ID: {product['id']}")
        
    except json.JSONDecodeError:
        log_test("Create product (valid) - JSON", False, "Invalid JSON response")
        return False
    
    # Test creating product with same name (should get unique ID with suffix)
    response, success, error = make_request("POST", "/admin/products", ADMIN_HEADERS, product_data)
    if not success:
        log_test("Create product (duplicate name) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Create product (duplicate name) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        product = data["product"]
        if not product["id"].endswith("-2"):
            log_test("Create product (duplicate name) - Suffix", False, f"Expected ID with '-2' suffix, got {product['id']}")
            return False
        
        # Track for cleanup
        test_products_created.append(product["id"])
        
        log_test("Create product (duplicate name)", True, f"Created product with unique ID: {product['id']}")
        
    except json.JSONDecodeError:
        log_test("Create product (duplicate name) - JSON", False, "Invalid JSON response")
        return False
    
    # Test missing required field
    invalid_data = {"name": "Test", "category": "Legume"}  # Missing price and unit
    response, success, error = make_request("POST", "/admin/products", ADMIN_HEADERS, invalid_data)
    if not success:
        log_test("Create product (missing field) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 400:
        log_test("Create product (missing field) - Status", False, f"Expected 400, got {response.status_code}")
        return False
    
    log_test("Create product (missing field)", True, "Correctly returned 400 for missing required fields")
    return True

def test_admin_update_product():
    """Test PATCH /api/admin/products/:id - update existing products."""
    print("🔍 Testing Admin Update Product (PATCH /api/admin/products/:id)")
    
    if not test_products_created:
        log_test("Update product - Setup", False, "No test products available for update")
        return False
    
    product_id = test_products_created[0]
    
    # Test without authentication
    update_data = {"stock": 99, "price": "12.5", "featured": True, "active": False}
    response, success, error = make_request("PATCH", f"/admin/products/{product_id}", data=update_data)
    if not success:
        log_test("Update product (no auth) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 401:
        log_test("Update product (no auth) - Status", False, f"Expected 401, got {response.status_code}")
        return False
    
    log_test("Update product (no auth)", True, "Correctly returned 401 without authentication")
    
    # Test with authentication and valid data
    response, success, error = make_request("PATCH", f"/admin/products/{product_id}", ADMIN_HEADERS, update_data)
    if not success:
        log_test("Update product (valid) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Update product (valid) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        product = data["product"]
        
        # Verify numeric coercion
        if product.get("price") != 12.5:
            log_test("Update product (valid) - Numeric coercion", False, f"Expected price 12.5, got {product.get('price')}")
            return False
        
        # Verify boolean coercion
        if product.get("featured") is not True or product.get("active") is not False:
            log_test("Update product (valid) - Boolean coercion", False, "Boolean coercion failed")
            return False
        
        # Verify updatedAt timestamp
        if not product.get("updatedAt"):
            log_test("Update product (valid) - Timestamp", False, "Missing updatedAt timestamp")
            return False
        
        log_test("Update product (valid)", True, "Successfully updated product with type coercion")
        
    except json.JSONDecodeError:
        log_test("Update product (valid) - JSON", False, "Invalid JSON response")
        return False
    
    # Test with no allowed fields
    response, success, error = make_request("PATCH", f"/admin/products/{product_id}", ADMIN_HEADERS, {"invalid_field": "value"})
    if not success:
        log_test("Update product (no fields) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 400:
        log_test("Update product (no fields) - Status", False, f"Expected 400, got {response.status_code}")
        return False
    
    log_test("Update product (no fields)", True, "Correctly returned 400 for no allowed fields")
    
    # Test with unknown product ID
    response, success, error = make_request("PATCH", "/admin/products/unknown-id", ADMIN_HEADERS, {"stock": 10})
    if not success:
        log_test("Update product (unknown ID) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 404:
        log_test("Update product (unknown ID) - Status", False, f"Expected 404, got {response.status_code}")
        return False
    
    log_test("Update product (unknown ID)", True, "Correctly returned 404 for unknown product ID")
    return True

def test_active_filter_behavior():
    """Test that public endpoint excludes inactive products after update."""
    print("🔍 Testing Active Filter Behavior")
    
    if not test_products_created:
        log_test("Active filter test - Setup", False, "No test products available")
        return False
    
    # Get public products list (should NOT include the test product we set to active=false)
    response, success, error = make_request("GET", "/products")
    if not success:
        log_test("Active filter (public) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Active filter (public) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        products = data["products"]
        test_product_ids = [p["id"] for p in products if p["id"] in test_products_created]
        
        if test_product_ids:
            log_test("Active filter (public)", False, f"Public endpoint should not include inactive test products: {test_product_ids}")
            return False
        
        log_test("Active filter (public)", True, "Public endpoint correctly excludes inactive products")
        
    except json.JSONDecodeError:
        log_test("Active filter (public) - JSON", False, "Invalid JSON response")
        return False
    
    # Get admin products list (should include the inactive test product)
    response, success, error = make_request("GET", "/admin/products", ADMIN_HEADERS)
    if not success:
        log_test("Active filter (admin) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Active filter (admin) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        products = data["products"]
        test_product_ids = [p["id"] for p in products if p["id"] in test_products_created]
        
        if not test_product_ids:
            log_test("Active filter (admin)", False, "Admin endpoint should include inactive test products")
            return False
        
        log_test("Active filter (admin)", True, "Admin endpoint correctly includes inactive products")
        return True
        
    except json.JSONDecodeError:
        log_test("Active filter (admin) - JSON", False, "Invalid JSON response")
        return False

def test_admin_delete_product():
    """Test DELETE /api/admin/products/:id - delete products."""
    print("🔍 Testing Admin Delete Product (DELETE /api/admin/products/:id)")
    
    if not test_products_created:
        log_test("Delete product - Setup", False, "No test products available for deletion")
        return False
    
    product_id = test_products_created[0]
    
    # Test without authentication
    response, success, error = make_request("DELETE", f"/admin/products/{product_id}")
    if not success:
        log_test("Delete product (no auth) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 401:
        log_test("Delete product (no auth) - Status", False, f"Expected 401, got {response.status_code}")
        return False
    
    log_test("Delete product (no auth)", True, "Correctly returned 401 without authentication")
    
    # Test with authentication
    response, success, error = make_request("DELETE", f"/admin/products/{product_id}", ADMIN_HEADERS)
    if not success:
        log_test("Delete product (valid) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Delete product (valid) - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        if data.get("ok") is not True:
            log_test("Delete product (valid) - Response", False, f"Expected {{ok: true}}, got {data}")
            return False
        
        log_test("Delete product (valid)", True, f"Successfully deleted product {product_id}")
        
    except json.JSONDecodeError:
        log_test("Delete product (valid) - JSON", False, "Invalid JSON response")
        return False
    
    # Test deleting the same product again (should return 404)
    response, success, error = make_request("DELETE", f"/admin/products/{product_id}", ADMIN_HEADERS)
    if not success:
        log_test("Delete product (again) - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 404:
        log_test("Delete product (again) - Status", False, f"Expected 404, got {response.status_code}")
        return False
    
    log_test("Delete product (again)", True, "Correctly returned 404 for already deleted product")
    return True

def test_large_image_upload():
    """Test creating product with large base64 image data."""
    print("🔍 Testing Large Image Upload")
    
    # Create a large base64 string (~300KB)
    large_data = "A" * (300 * 1024)  # 300KB of 'A' characters
    base64_image = f"data:image/jpeg;base64,{base64.b64encode(large_data.encode()).decode()}"
    
    product_data = {
        "name": "Test Large Image Product",
        "category": "Legume",
        "price": 10.0,
        "unit": "lei / kg",
        "description": "Test product with large image",
        "stock": 1,
        "image": base64_image
    }
    
    response, success, error = make_request("POST", "/admin/products", ADMIN_HEADERS, product_data)
    if not success:
        log_test("Large image upload - Network", False, f"Network error: {error}")
        return False
    
    if response.status_code != 200:
        log_test("Large image upload - Status", False, f"Expected 200, got {response.status_code}")
        return False
    
    try:
        data = response.json()
        product = data["product"]
        
        if not product.get("image"):
            log_test("Large image upload - Image", False, "Image field should be preserved")
            return False
        
        # Track for cleanup
        test_products_created.append(product["id"])
        
        log_test("Large image upload", True, f"Successfully created product with large image: {product['id']}")
        return True
        
    except json.JSONDecodeError:
        log_test("Large image upload - JSON", False, "Invalid JSON response")
        return False

def cleanup_test_products():
    """Clean up all test products created during testing."""
    print("🧹 Cleaning up test products...")
    
    cleanup_success = True
    for product_id in test_products_created:
        response, success, error = make_request("DELETE", f"/admin/products/{product_id}", ADMIN_HEADERS)
        if success and response.status_code == 200:
            print(f"   ✅ Deleted {product_id}")
        elif success and response.status_code == 404:
            print(f"   ⚠️  {product_id} already deleted")
        else:
            print(f"   ❌ Failed to delete {product_id}: {error if not success else response.status_code}")
            cleanup_success = False
    
    if cleanup_success:
        print("✅ Cleanup completed successfully")
    else:
        print("⚠️  Some cleanup operations failed")
    
    test_products_created.clear()

def main():
    """Run all product API tests."""
    print("🚀 Starting Family Garden Products CRUD API Testing")
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Token: {ADMIN_TOKEN}")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Public Products List", test_public_products_list),
        ("Public Single Product", test_public_single_product),
        ("Admin Products List", test_admin_products_list),
        ("Admin Create Product", test_admin_create_product),
        ("Admin Update Product", test_admin_update_product),
        ("Active Filter Behavior", test_active_filter_behavior),
        ("Large Image Upload", test_large_image_upload),
        ("Admin Delete Product", test_admin_delete_product),
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ EXCEPTION in {test_name}: {str(e)}")
            test_results.append((test_name, False))
    
    # Cleanup
    cleanup_test_products()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Products CRUD API is working correctly.")
        return True
    else:
        print(f"⚠️  {total - passed} tests failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)