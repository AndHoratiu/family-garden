#!/usr/bin/env python3
"""
Backend API Testing for Family Garden E-commerce App
Tests new Settings API endpoints, multi-image product support, and dynamic delivery fee
"""

import requests
import json
import os
import time
from typing import Dict, Any, List

# Configuration
BASE_URL = "https://fresh-harvest-152.preview.emergentagent.com/api"
ADMIN_TOKEN = "familygarden2025"
HEADERS = {"Content-Type": "application/json"}
ADMIN_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ADMIN_TOKEN}"
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def assert_test(self, condition: bool, test_name: str, error_msg: str = ""):
        if condition:
            self.passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed += 1
            self.errors.append(f"{test_name}: {error_msg}")
            print(f"❌ {test_name}: {error_msg}")
            
    def summary(self):
        total = self.passed + self.failed
        print(f"\n📊 TEST SUMMARY: {self.passed}/{total} passed")
        if self.errors:
            print("\n🚨 FAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")

def test_public_settings_api(results: TestResults):
    """Test public settings endpoint (GET /api/settings)"""
    print("\n🔍 TESTING PUBLIC SETTINGS API")
    
    try:
        # Test public settings endpoint
        response = requests.get(f"{BASE_URL}/settings", headers=HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "Public settings returns 200",
            f"Got {response.status_code}"
        )
        
        if response.status_code == 200:
            data = response.json()
            results.assert_test(
                "settings" in data,
                "Response contains settings key",
                f"Response: {data}"
            )
            
            settings = data.get("settings", {})
            
            # Check required fields are present
            required_fields = ["hero", "whyUs", "contact", "social", "delivery", "payment"]
            for field in required_fields:
                results.assert_test(
                    field in settings,
                    f"Settings contains {field}",
                    f"Missing {field} in settings"
                )
            
            # Check that emails field is NOT present (sanitized)
            results.assert_test(
                "emails" not in settings,
                "Settings does not contain emails (sanitized)",
                "emails field should be removed for public endpoint"
            )
            
            # Check hero structure
            hero = settings.get("hero", {})
            hero_fields = ["title", "subtitle", "image"]
            for field in hero_fields:
                results.assert_test(
                    field in hero,
                    f"Hero contains {field}",
                    f"Missing {field} in hero"
                )
            
            # Check delivery structure
            delivery = settings.get("delivery", {})
            delivery_fields = ["enabled", "fee", "freeAbove", "pickupEnabled", "pickupAddress"]
            for field in delivery_fields:
                results.assert_test(
                    field in delivery,
                    f"Delivery contains {field}",
                    f"Missing {field} in delivery"
                )
                
    except Exception as e:
        results.assert_test(False, "Public settings API test", str(e))

def test_admin_settings_api(results: TestResults):
    """Test admin settings endpoints (GET/PUT /api/admin/settings)"""
    print("\n🔍 TESTING ADMIN SETTINGS API")
    
    try:
        # Test admin settings GET without auth
        response = requests.get(f"{BASE_URL}/admin/settings", headers=HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 401,
            "Admin settings GET returns 401 without auth",
            f"Got {response.status_code}"
        )
        
        # Test admin settings GET with auth
        response = requests.get(f"{BASE_URL}/admin/settings", headers=ADMIN_HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "Admin settings GET returns 200 with auth",
            f"Got {response.status_code}"
        )
        
        if response.status_code == 200:
            data = response.json()
            settings = data.get("settings", {})
            
            # Check that emails field IS present (full settings)
            results.assert_test(
                "emails" in settings,
                "Admin settings contains emails field",
                "emails field should be present for admin endpoint"
            )
            
            # Check emails structure
            emails = settings.get("emails", {})
            results.assert_test(
                "recipients" in emails,
                "Emails contains recipients",
                "Missing recipients in emails"
            )
            
            # Store original settings for restoration later
            original_settings = settings.copy()
            
            # Test admin settings PUT without auth
            test_update = {"hero": {"title": "Test Title"}}
            response = requests.put(
                f"{BASE_URL}/admin/settings", 
                headers=HEADERS, 
                json=test_update,
                timeout=10
            )
            results.assert_test(
                response.status_code == 401,
                "Admin settings PUT returns 401 without auth",
                f"Got {response.status_code}"
            )
            
            # Test admin settings PUT with auth - partial update
            test_update = {
                "hero": {"title": "Test Title Updated"},
                "delivery": {"fee": 25, "freeAbove": 100}
            }
            response = requests.put(
                f"{BASE_URL}/admin/settings", 
                headers=ADMIN_HEADERS, 
                json=test_update,
                timeout=10
            )
            results.assert_test(
                response.status_code == 200,
                "Admin settings PUT returns 200 with auth",
                f"Got {response.status_code}"
            )
            
            if response.status_code == 200:
                updated_data = response.json()
                updated_settings = updated_data.get("settings", {})
                
                # Check that partial update worked
                results.assert_test(
                    updated_settings.get("hero", {}).get("title") == "Test Title Updated",
                    "Hero title updated correctly",
                    f"Expected 'Test Title Updated', got {updated_settings.get('hero', {}).get('title')}"
                )
                
                results.assert_test(
                    updated_settings.get("delivery", {}).get("fee") == 25,
                    "Delivery fee updated correctly",
                    f"Expected 25, got {updated_settings.get('delivery', {}).get('fee')}"
                )
                
                results.assert_test(
                    updated_settings.get("delivery", {}).get("freeAbove") == 100,
                    "Delivery freeAbove updated correctly",
                    f"Expected 100, got {updated_settings.get('delivery', {}).get('freeAbove')}"
                )
                
                # Check that untouched fields remain intact
                results.assert_test(
                    updated_settings.get("contact", {}).get("phone") == original_settings.get("contact", {}).get("phone"),
                    "Untouched contact.phone remains intact",
                    "Contact phone should not change during partial update"
                )
            
            # Test PATCH alias
            patch_update = {"delivery": {"fee": 30}}
            response = requests.patch(
                f"{BASE_URL}/admin/settings", 
                headers=ADMIN_HEADERS, 
                json=patch_update,
                timeout=10
            )
            results.assert_test(
                response.status_code == 200,
                "Admin settings PATCH works as alias",
                f"Got {response.status_code}"
            )
            
            # Verify GET reflects the changes
            response = requests.get(f"{BASE_URL}/admin/settings", headers=ADMIN_HEADERS, timeout=10)
            if response.status_code == 200:
                current_data = response.json()
                current_settings = current_data.get("settings", {})
                results.assert_test(
                    current_settings.get("delivery", {}).get("fee") == 30,
                    "GET reflects PATCH changes",
                    f"Expected 30, got {current_settings.get('delivery', {}).get('fee')}"
                )
                
    except Exception as e:
        results.assert_test(False, "Admin settings API test", str(e))

def test_multi_image_products(results: TestResults):
    """Test multi-image product support"""
    print("\n🔍 TESTING MULTI-IMAGE PRODUCT SUPPORT")
    
    test_product_id = None
    
    try:
        # Create product with multiple images
        product_data = {
            "name": "Multi Img Test 12345",
            "category": "Legume",
            "price": 5,
            "unit": "lei / kg",
            "images": ["https://example.com/a.jpg", "https://example.com/b.jpg"]
        }
        
        response = requests.post(
            f"{BASE_URL}/admin/products",
            headers=ADMIN_HEADERS,
            json=product_data,
            timeout=10
        )
        results.assert_test(
            response.status_code == 200,
            "Create product with images array",
            f"Got {response.status_code}: {response.text if response.status_code != 200 else ''}"
        )
        
        if response.status_code == 200:
            created_data = response.json()
            product = created_data.get("product", {})
            test_product_id = product.get("id")
            
            # Check images array is saved
            results.assert_test(
                "images" in product and len(product["images"]) == 2,
                "Product saved with images array",
                f"Expected 2 images, got {len(product.get('images', []))}"
            )
            
            # Check main image auto-syncs to images[0]
            results.assert_test(
                product.get("image") == "https://example.com/a.jpg",
                "Main image auto-syncs to images[0]",
                f"Expected 'https://example.com/a.jpg', got {product.get('image')}"
            )
            
            # Test updating images array
            update_data = {"images": ["https://x.com/c.jpg"]}
            response = requests.patch(
                f"{BASE_URL}/admin/products/{test_product_id}",
                headers=ADMIN_HEADERS,
                json=update_data,
                timeout=10
            )
            results.assert_test(
                response.status_code == 200,
                "Update product images array",
                f"Got {response.status_code}"
            )
            
            if response.status_code == 200:
                updated_data = response.json()
                updated_product = updated_data.get("product", {})
                
                # Check image auto-syncs when images updated
                results.assert_test(
                    updated_product.get("image") == "https://x.com/c.jpg",
                    "Main image auto-syncs when images updated",
                    f"Expected 'https://x.com/c.jpg', got {updated_product.get('image')}"
                )
            
            # Test updating both image and images (image should be preserved)
            update_data = {
                "image": "https://manual.com/d.jpg",
                "images": ["https://x.com/e.jpg", "https://x.com/f.jpg"]
            }
            response = requests.patch(
                f"{BASE_URL}/admin/products/{test_product_id}",
                headers=ADMIN_HEADERS,
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                updated_data = response.json()
                updated_product = updated_data.get("product", {})
                
                # Check that explicit image is preserved
                results.assert_test(
                    updated_product.get("image") == "https://manual.com/d.jpg",
                    "Explicit image is preserved when both image and images sent",
                    f"Expected 'https://manual.com/d.jpg', got {updated_product.get('image')}"
                )
            
            # Test GET returns images array
            response = requests.get(f"{BASE_URL}/products/{test_product_id}", headers=HEADERS, timeout=10)
            if response.status_code == 200:
                get_data = response.json()
                get_product = get_data.get("product", {})
                results.assert_test(
                    "images" in get_product,
                    "GET product returns images array",
                    "images field missing from GET response"
                )
                
    except Exception as e:
        results.assert_test(False, "Multi-image products test", str(e))
    
    finally:
        # Cleanup: delete test product
        if test_product_id:
            try:
                requests.delete(
                    f"{BASE_URL}/admin/products/{test_product_id}",
                    headers=ADMIN_HEADERS,
                    timeout=10
                )
                print(f"🧹 Cleaned up test product: {test_product_id}")
            except:
                pass

def test_dynamic_delivery_fee(results: TestResults):
    """Test dynamic delivery fee calculation from settings"""
    print("\n🔍 TESTING DYNAMIC DELIVERY FEE")
    
    test_order_ids = []
    
    try:
        # Set delivery settings: enabled=true, fee=25, freeAbove=0
        settings_update = {
            "delivery": {
                "enabled": True,
                "fee": 25,
                "freeAbove": 0
            }
        }
        response = requests.put(
            f"{BASE_URL}/admin/settings",
            headers=ADMIN_HEADERS,
            json=settings_update,
            timeout=10
        )
        results.assert_test(
            response.status_code == 200,
            "Set delivery settings (fee=25, freeAbove=0)",
            f"Got {response.status_code}"
        )
        
        # Test order with local delivery - should have fee=25
        order_data = {
            "customerName": "Test Customer",
            "customerPhone": "0123456789",
            "customerEmail": "test@example.com",
            "customerAddress": "Test Address",
            "deliveryMethod": "Livrare locală",
            "paymentMethod": "Ramburs",
            "items": [
                {"id": "test-item", "name": "Test Item", "price": 10, "quantity": 2, "unit": "buc"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            headers=HEADERS,
            json=order_data,
            timeout=10
        )
        results.assert_test(
            response.status_code == 200,
            "Create order with local delivery",
            f"Got {response.status_code}"
        )
        
        if response.status_code == 200:
            order_response = response.json()
            order = order_response.get("order", {})
            test_order_ids.append(order.get("id"))
            
            results.assert_test(
                order.get("deliveryFee") == 25,
                "Order has correct delivery fee (25)",
                f"Expected 25, got {order.get('deliveryFee')}"
            )
            
            results.assert_test(
                order.get("total") == 45,  # 20 subtotal + 25 delivery
                "Order total includes delivery fee",
                f"Expected 45, got {order.get('total')}"
            )
        
        # Set free shipping threshold: freeAbove=50
        settings_update = {
            "delivery": {
                "enabled": True,
                "fee": 25,
                "freeAbove": 50
            }
        }
        response = requests.put(
            f"{BASE_URL}/admin/settings",
            headers=ADMIN_HEADERS,
            json=settings_update,
            timeout=10
        )
        
        # Test order with subtotal >= 50 - should have free delivery
        order_data_large = {
            "customerName": "Test Customer Large",
            "customerPhone": "0123456789",
            "customerEmail": "test@example.com",
            "customerAddress": "Test Address",
            "deliveryMethod": "Livrare locală",
            "paymentMethod": "Ramburs",
            "items": [
                {"id": "test-item", "name": "Test Item", "price": 25, "quantity": 2, "unit": "buc"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            headers=HEADERS,
            json=order_data_large,
            timeout=10
        )
        
        if response.status_code == 200:
            order_response = response.json()
            order = order_response.get("order", {})
            test_order_ids.append(order.get("id"))
            
            results.assert_test(
                order.get("deliveryFee") == 0,
                "Free shipping for orders >= freeAbove threshold",
                f"Expected 0, got {order.get('deliveryFee')}"
            )
            
            results.assert_test(
                order.get("total") == 50,  # 50 subtotal + 0 delivery
                "Order total with free shipping",
                f"Expected 50, got {order.get('total')}"
            )
        
        # Test order with subtotal < 50 - should have delivery fee
        order_data_small = {
            "customerName": "Test Customer Small",
            "customerPhone": "0123456789",
            "customerEmail": "test@example.com",
            "customerAddress": "Test Address",
            "deliveryMethod": "Livrare locală",
            "paymentMethod": "Ramburs",
            "items": [
                {"id": "test-item", "name": "Test Item", "price": 10, "quantity": 3, "unit": "buc"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            headers=HEADERS,
            json=order_data_small,
            timeout=10
        )
        
        if response.status_code == 200:
            order_response = response.json()
            order = order_response.get("order", {})
            test_order_ids.append(order.get("id"))
            
            results.assert_test(
                order.get("deliveryFee") == 25,
                "Delivery fee for orders < freeAbove threshold",
                f"Expected 25, got {order.get('deliveryFee')}"
            )
        
        # Test with delivery disabled
        settings_update = {
            "delivery": {
                "enabled": False,
                "fee": 25,
                "freeAbove": 50
            }
        }
        response = requests.put(
            f"{BASE_URL}/admin/settings",
            headers=ADMIN_HEADERS,
            json=settings_update,
            timeout=10
        )
        
        # Test order with delivery disabled - should have no fee even for local delivery
        order_data_disabled = {
            "customerName": "Test Customer Disabled",
            "customerPhone": "0123456789",
            "customerEmail": "test@example.com",
            "customerAddress": "Test Address",
            "deliveryMethod": "Livrare locală",
            "paymentMethod": "Ramburs",
            "items": [
                {"id": "test-item", "name": "Test Item", "price": 10, "quantity": 1, "unit": "buc"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            headers=HEADERS,
            json=order_data_disabled,
            timeout=10
        )
        
        if response.status_code == 200:
            order_response = response.json()
            order = order_response.get("order", {})
            test_order_ids.append(order.get("id"))
            
            results.assert_test(
                order.get("deliveryFee") == 0,
                "No delivery fee when delivery disabled",
                f"Expected 0, got {order.get('deliveryFee')}"
            )
        
        # Reset settings to original values
        settings_reset = {
            "delivery": {
                "enabled": True,
                "fee": 15,
                "freeAbove": 0,
                "pickupEnabled": True,
                "pickupAddress": "Vințu de Jos, Telman, nr. 46, Alba"
            }
        }
        response = requests.put(
            f"{BASE_URL}/admin/settings",
            headers=ADMIN_HEADERS,
            json=settings_reset,
            timeout=10
        )
        results.assert_test(
            response.status_code == 200,
            "Reset delivery settings to original values",
            f"Got {response.status_code}"
        )
        
    except Exception as e:
        results.assert_test(False, "Dynamic delivery fee test", str(e))
    
    finally:
        # Cleanup: delete test orders
        for order_id in test_order_ids:
            if order_id:
                try:
                    requests.delete(
                        f"{BASE_URL}/admin/orders/{order_id}",
                        headers=ADMIN_HEADERS,
                        timeout=10
                    )
                except:
                    pass
        if test_order_ids:
            print(f"🧹 Cleaned up {len(test_order_ids)} test orders")

def test_regression(results: TestResults):
    """Test that previously working endpoints still work"""
    print("\n🔍 TESTING REGRESSION - EXISTING ENDPOINTS")
    
    try:
        # Test health endpoints
        response = requests.get(f"{BASE_URL}/", headers=HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "GET /api still works",
            f"Got {response.status_code}"
        )
        
        response = requests.get(f"{BASE_URL}/health", headers=HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "GET /api/health still works",
            f"Got {response.status_code}"
        )
        
        # Test admin login
        login_data = {"password": ADMIN_TOKEN}
        response = requests.post(
            f"{BASE_URL}/admin/login",
            headers=HEADERS,
            json=login_data,
            timeout=10
        )
        results.assert_test(
            response.status_code == 200,
            "Admin login still works",
            f"Got {response.status_code}"
        )
        
        # Test products endpoints
        response = requests.get(f"{BASE_URL}/products", headers=HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "GET /api/products still works",
            f"Got {response.status_code}"
        )
        
        response = requests.get(f"{BASE_URL}/admin/products", headers=ADMIN_HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "GET /api/admin/products still works",
            f"Got {response.status_code}"
        )
        
        # Test orders endpoints
        response = requests.get(f"{BASE_URL}/orders", headers=HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "GET /api/orders still works",
            f"Got {response.status_code}"
        )
        
        response = requests.get(f"{BASE_URL}/admin/orders", headers=ADMIN_HEADERS, timeout=10)
        results.assert_test(
            response.status_code == 200,
            "GET /api/admin/orders still works",
            f"Got {response.status_code}"
        )
        
    except Exception as e:
        results.assert_test(False, "Regression test", str(e))

def main():
    """Run all tests"""
    print("🚀 STARTING BACKEND API TESTING")
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Token: {ADMIN_TOKEN}")
    
    results = TestResults()
    
    # Run all test suites
    test_public_settings_api(results)
    test_admin_settings_api(results)
    test_multi_image_products(results)
    test_dynamic_delivery_fee(results)
    test_regression(results)
    
    # Print final summary
    results.summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit(main())