#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://fresh-harvest-152.preview.emergentagent.com/api"
ADMIN_PASSWORD = "familygarden2025"

def log_test(test_name, success, details=""):
    """Log test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_admin_login():
    """Test POST /api/admin/login endpoint"""
    print("=== Testing Admin Login (POST /api/admin/login) ===")
    
    # Test 1: Valid password
    try:
        response = requests.post(f"{BASE_URL}/admin/login", 
                               json={"password": "familygarden2025"},
                               timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("token") == "familygarden2025":
                log_test("Valid password login", True, f"Response: {data}")
            else:
                log_test("Valid password login", False, f"Expected token 'familygarden2025', got: {data}")
        else:
            log_test("Valid password login", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Valid password login", False, f"Exception: {str(e)}")
    
    # Test 2: Invalid password
    try:
        response = requests.post(f"{BASE_URL}/admin/login", 
                               json={"password": "wrong"},
                               timeout=10)
        
        if response.status_code == 401:
            data = response.json()
            log_test("Invalid password login", True, f"Correctly returned 401: {data}")
        else:
            log_test("Invalid password login", False, f"Expected 401, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Invalid password login", False, f"Exception: {str(e)}")
    
    # Test 3: Empty body
    try:
        response = requests.post(f"{BASE_URL}/admin/login", 
                               json={},
                               timeout=10)
        
        if response.status_code == 401:
            data = response.json()
            log_test("Empty body login", True, f"Correctly returned 401: {data}")
        else:
            log_test("Empty body login", False, f"Expected 401, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Empty body login", False, f"Exception: {str(e)}")

def create_test_order():
    """Create a test order for admin operations"""
    print("=== Creating Test Order ===")
    
    order_data = {
        "customerName": "Maria Popescu",
        "customerPhone": "0721234567",
        "customerEmail": "maria@example.com",
        "customerAddress": "Str. Florilor 123, Vințu de Jos",
        "deliveryMethod": "Livrare locală",
        "paymentMethod": "Ramburs",
        "items": [
            {"id": "1", "name": "Roșii", "price": 8, "quantity": 2, "unit": "kg"},
            {"id": "2", "name": "Castraveți", "price": 6, "quantity": 1, "unit": "kg"}
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/orders", json=order_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            order_id = data.get("orderId")
            log_test("Test order creation", True, f"Created order with ID: {order_id}")
            return order_id
        else:
            log_test("Test order creation", False, f"Status: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        log_test("Test order creation", False, f"Exception: {str(e)}")
        return None

def test_admin_orders():
    """Test GET /api/admin/orders endpoint"""
    print("=== Testing Admin Orders List (GET /api/admin/orders) ===")
    
    # Test 1: Valid Bearer token
    try:
        headers = {"Authorization": f"Bearer {ADMIN_PASSWORD}"}
        response = requests.get(f"{BASE_URL}/admin/orders", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            orders = data.get("orders", [])
            stats = data.get("stats", {})
            
            # Verify response structure
            if "orders" in data and "stats" in data:
                # Verify stats calculations
                total_matches = stats.get("total") == len(orders)
                new_count = len([o for o in orders if o.get("orderStatus") == "new"])
                new_matches = stats.get("new") == new_count
                delivered_orders = [o for o in orders if o.get("orderStatus") == "delivered"]
                revenue = sum(o.get("total", 0) for o in delivered_orders)
                revenue_matches = stats.get("revenue") == revenue
                
                if total_matches and new_matches and revenue_matches:
                    log_test("Valid Bearer token - orders list", True, 
                           f"Orders: {len(orders)}, Stats: {stats}")
                else:
                    log_test("Valid Bearer token - orders list", False, 
                           f"Stats mismatch - total:{total_matches}, new:{new_matches}, revenue:{revenue_matches}")
            else:
                log_test("Valid Bearer token - orders list", False, f"Missing orders or stats in response: {data}")
        else:
            log_test("Valid Bearer token - orders list", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Valid Bearer token - orders list", False, f"Exception: {str(e)}")
    
    # Test 2: No Authorization header
    try:
        response = requests.get(f"{BASE_URL}/admin/orders", timeout=10)
        
        if response.status_code == 401:
            log_test("No Authorization header", True, f"Correctly returned 401: {response.json()}")
        else:
            log_test("No Authorization header", False, f"Expected 401, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("No Authorization header", False, f"Exception: {str(e)}")
    
    # Test 3: Invalid token
    try:
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{BASE_URL}/admin/orders", headers=headers, timeout=10)
        
        if response.status_code == 401:
            log_test("Invalid token", True, f"Correctly returned 401: {response.json()}")
        else:
            log_test("Invalid token", False, f"Expected 401, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Invalid token", False, f"Exception: {str(e)}")

def test_admin_update_order(order_id):
    """Test PATCH /api/admin/orders/:id endpoint"""
    print(f"=== Testing Admin Update Order (PATCH /api/admin/orders/{order_id}) ===")
    
    if not order_id:
        log_test("Admin update order", False, "No order ID available for testing")
        return
    
    headers = {"Authorization": f"Bearer {ADMIN_PASSWORD}"}
    
    # Test 1: Update orderStatus to confirmed
    try:
        update_data = {"orderStatus": "confirmed"}
        response = requests.patch(f"{BASE_URL}/admin/orders/{order_id}", 
                                json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            order = data.get("order", {})
            if order.get("orderStatus") == "confirmed" and "updatedAt" in order:
                log_test("Update orderStatus to confirmed", True, 
                       f"Status updated, updatedAt: {order.get('updatedAt')}")
            else:
                log_test("Update orderStatus to confirmed", False, f"Status not updated correctly: {order}")
        else:
            log_test("Update orderStatus to confirmed", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Update orderStatus to confirmed", False, f"Exception: {str(e)}")
    
    # Test 2: Update multiple fields (orderStatus and paymentStatus)
    try:
        update_data = {"orderStatus": "delivered", "paymentStatus": "paid"}
        response = requests.patch(f"{BASE_URL}/admin/orders/{order_id}", 
                                json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            order = data.get("order", {})
            if (order.get("orderStatus") == "delivered" and 
                order.get("paymentStatus") == "paid" and 
                "updatedAt" in order):
                log_test("Update multiple fields", True, 
                       f"Both fields updated, updatedAt: {order.get('updatedAt')}")
            else:
                log_test("Update multiple fields", False, f"Fields not updated correctly: {order}")
        else:
            log_test("Update multiple fields", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Update multiple fields", False, f"Exception: {str(e)}")
    
    # Test 3: Update with no allowed fields
    try:
        update_data = {"random": "value"}
        response = requests.patch(f"{BASE_URL}/admin/orders/{order_id}", 
                                json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 400:
            log_test("Update with no allowed fields", True, f"Correctly returned 400: {response.json()}")
        else:
            log_test("Update with no allowed fields", False, f"Expected 400, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Update with no allowed fields", False, f"Exception: {str(e)}")
    
    # Test 4: Update non-existent order
    try:
        update_data = {"orderStatus": "confirmed"}
        response = requests.patch(f"{BASE_URL}/admin/orders/non-existent-id", 
                                json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 404:
            log_test("Update non-existent order", True, f"Correctly returned 404: {response.json()}")
        else:
            log_test("Update non-existent order", False, f"Expected 404, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Update non-existent order", False, f"Exception: {str(e)}")
    
    # Test 5: Update without Authorization header
    try:
        update_data = {"orderStatus": "confirmed"}
        response = requests.patch(f"{BASE_URL}/admin/orders/{order_id}", 
                                json=update_data, timeout=10)
        
        if response.status_code == 401:
            log_test("Update without Authorization", True, f"Correctly returned 401: {response.json()}")
        else:
            log_test("Update without Authorization", False, f"Expected 401, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Update without Authorization", False, f"Exception: {str(e)}")

def test_admin_delete_order():
    """Test DELETE /api/admin/orders/:id endpoint"""
    print("=== Testing Admin Delete Order (DELETE /api/admin/orders/:id) ===")
    
    # Create a test order specifically for deletion
    delete_order_id = create_test_order()
    if not delete_order_id:
        log_test("Admin delete order", False, "Could not create order for deletion test")
        return
    
    headers = {"Authorization": f"Bearer {ADMIN_PASSWORD}"}
    
    # Test 1: Delete with valid auth
    try:
        response = requests.delete(f"{BASE_URL}/admin/orders/{delete_order_id}", 
                                 headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") is True:
                log_test("Delete with valid auth", True, f"Order deleted successfully: {data}")
            else:
                log_test("Delete with valid auth", False, f"Expected {{ok: true}}, got: {data}")
        else:
            log_test("Delete with valid auth", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Delete with valid auth", False, f"Exception: {str(e)}")
    
    # Test 2: Delete same order again (should return 404)
    try:
        response = requests.delete(f"{BASE_URL}/admin/orders/{delete_order_id}", 
                                 headers=headers, timeout=10)
        
        if response.status_code == 404:
            log_test("Delete non-existent order", True, f"Correctly returned 404: {response.json()}")
        else:
            log_test("Delete non-existent order", False, f"Expected 404, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Delete non-existent order", False, f"Exception: {str(e)}")
    
    # Test 3: Delete without Authorization header
    try:
        # Create another order for this test
        another_order_id = create_test_order()
        if another_order_id:
            response = requests.delete(f"{BASE_URL}/admin/orders/{another_order_id}", timeout=10)
            
            if response.status_code == 401:
                log_test("Delete without Authorization", True, f"Correctly returned 401: {response.json()}")
            else:
                log_test("Delete without Authorization", False, f"Expected 401, got {response.status_code}: {response.text}")
        else:
            log_test("Delete without Authorization", False, "Could not create order for test")
    except Exception as e:
        log_test("Delete without Authorization", False, f"Exception: {str(e)}")

def test_regression():
    """Test that existing endpoints still work"""
    print("=== Testing Regression - Existing Endpoints ===")
    
    # Test 1: GET /api
    try:
        response = requests.get(f"{BASE_URL}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") is True and data.get("service") == "Family Garden API":
                log_test("GET /api", True, f"Response: {data}")
            else:
                log_test("GET /api", False, f"Unexpected response: {data}")
        else:
            log_test("GET /api", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api", False, f"Exception: {str(e)}")
    
    # Test 2: POST /api/orders (valid)
    try:
        order_data = {
            "customerName": "Test Customer",
            "customerPhone": "0721234567",
            "items": [{"id": "1", "name": "Test Product", "price": 10, "quantity": 1, "unit": "buc"}]
        }
        response = requests.post(f"{BASE_URL}/orders", json=order_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "orderId" in data and "orderNumber" in data:
                log_test("POST /api/orders (valid)", True, f"Order created: {data['orderNumber']}")
                return data["orderId"]  # Return for further tests
            else:
                log_test("POST /api/orders (valid)", False, f"Missing orderId or orderNumber: {data}")
        else:
            log_test("POST /api/orders (valid)", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/orders (valid)", False, f"Exception: {str(e)}")
        return None
    
    # Test 3: GET /api/orders/:id
    regression_order_id = create_test_order()
    if regression_order_id:
        try:
            response = requests.get(f"{BASE_URL}/orders/{regression_order_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "order" in data:
                    log_test("GET /api/orders/:id", True, f"Order retrieved successfully")
                else:
                    log_test("GET /api/orders/:id", False, f"Missing order in response: {data}")
            else:
                log_test("GET /api/orders/:id", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            log_test("GET /api/orders/:id", False, f"Exception: {str(e)}")
    
    # Test 4: GET /api/orders
    try:
        response = requests.get(f"{BASE_URL}/orders", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "orders" in data and isinstance(data["orders"], list):
                log_test("GET /api/orders", True, f"Orders list retrieved: {len(data['orders'])} orders")
            else:
                log_test("GET /api/orders", False, f"Invalid response structure: {data}")
        else:
            log_test("GET /api/orders", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/orders", False, f"Exception: {str(e)}")

def main():
    """Run all admin endpoint tests"""
    print("🚀 Starting Family Garden Admin Backend Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("=" * 60)
    
    # Test admin login
    test_admin_login()
    
    # Create a test order for admin operations
    test_order_id = create_test_order()
    
    # Test admin orders list
    test_admin_orders()
    
    # Test admin update order
    test_admin_update_order(test_order_id)
    
    # Test admin delete order
    test_admin_delete_order()
    
    # Test regression
    test_regression()
    
    print("=" * 60)
    print("🏁 Admin Backend Tests Completed")

if __name__ == "__main__":
    main()