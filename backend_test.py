#!/usr/bin/env python3
"""
Family Garden Backend API Testing
Tests all backend endpoints for the Family Garden e-commerce application.
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://fresh-harvest-152.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_result(self, test_name, passed, message=""):
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.failed += 1
            print(f"❌ {test_name}: FAILED {message}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        print(f"{'='*60}")
        return self.failed == 0

def test_health_endpoints():
    """Test 1: Health check endpoints"""
    results = TestResults()
    
    try:
        # Test GET /api
        print("\n🔍 Testing GET /api...")
        response = requests.get(f"{API_BASE}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True and data.get("service") == "Family Garden API":
                results.add_result("GET /api", True, f"Response: {data}")
            else:
                results.add_result("GET /api", False, f"Unexpected response: {data}")
        else:
            results.add_result("GET /api", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        results.add_result("GET /api", False, f"Exception: {str(e)}")
    
    try:
        # Test GET /api/health
        print("\n🔍 Testing GET /api/health...")
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok":
                results.add_result("GET /api/health", True, f"Response: {data}")
            else:
                results.add_result("GET /api/health", False, f"Unexpected response: {data}")
        else:
            results.add_result("GET /api/health", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        results.add_result("GET /api/health", False, f"Exception: {str(e)}")
    
    return results

def test_create_order_happy_path():
    """Test 2: Create order - happy path with 'Livrare locală'"""
    results = TestResults()
    
    order_data = {
        "customerName": "Ion Popescu",
        "customerPhone": "0749476386",
        "customerEmail": "ion@example.ro",
        "customerAddress": "Strada Florilor 10, Alba Iulia",
        "notes": "Sunați înainte de livrare",
        "deliveryMethod": "Livrare locală",
        "paymentMethod": "Ramburs",
        "items": [
            {"id": "rosii-gradina", "name": "Roșii de grădină", "price": 8, "quantity": 2, "unit": "lei / kg"},
            {"id": "zmeura", "name": "Zmeură proaspătă", "price": 16, "quantity": 1, "unit": "lei / caserolă"}
        ]
    }
    
    try:
        print("\n🔍 Testing POST /api/orders (happy path with Livrare locală)...")
        response = requests.post(
            f"{API_BASE}/orders",
            json=order_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields in response
            required_fields = ["orderId", "orderNumber", "order"]
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                results.add_result("POST /api/orders - response structure", False, f"Missing fields: {missing_fields}")
                return results, None
            
            # Validate orderId is UUID format
            order_id = data["orderId"]
            if len(order_id) != 36 or order_id.count('-') != 4:
                results.add_result("POST /api/orders - orderId format", False, f"Invalid UUID format: {order_id}")
            else:
                results.add_result("POST /api/orders - orderId format", True, f"Valid UUID: {order_id}")
            
            # Validate orderNumber starts with "FG"
            order_number = data["orderNumber"]
            if order_number.startswith("FG") and len(order_number) == 8:
                results.add_result("POST /api/orders - orderNumber format", True, f"Valid format: {order_number}")
            else:
                results.add_result("POST /api/orders - orderNumber format", False, f"Invalid format: {order_number}")
            
            # Validate order calculations
            order = data["order"]
            expected_subtotal = 2 * 8 + 1 * 16  # 32
            expected_delivery_fee = 15  # Livrare locală
            expected_total = expected_subtotal + expected_delivery_fee  # 47
            
            if order.get("subtotal") == expected_subtotal:
                results.add_result("POST /api/orders - subtotal calculation", True, f"Correct: {expected_subtotal}")
            else:
                results.add_result("POST /api/orders - subtotal calculation", False, f"Expected {expected_subtotal}, got {order.get('subtotal')}")
            
            if order.get("deliveryFee") == expected_delivery_fee:
                results.add_result("POST /api/orders - delivery fee", True, f"Correct: {expected_delivery_fee}")
            else:
                results.add_result("POST /api/orders - delivery fee", False, f"Expected {expected_delivery_fee}, got {order.get('deliveryFee')}")
            
            if order.get("total") == expected_total:
                results.add_result("POST /api/orders - total calculation", True, f"Correct: {expected_total}")
            else:
                results.add_result("POST /api/orders - total calculation", False, f"Expected {expected_total}, got {order.get('total')}")
            
            # Validate order status fields
            if order.get("paymentStatus") == "pending":
                results.add_result("POST /api/orders - paymentStatus", True, "Correct: pending")
            else:
                results.add_result("POST /api/orders - paymentStatus", False, f"Expected 'pending', got {order.get('paymentStatus')}")
            
            if order.get("orderStatus") == "new":
                results.add_result("POST /api/orders - orderStatus", True, "Correct: new")
            else:
                results.add_result("POST /api/orders - orderStatus", False, f"Expected 'new', got {order.get('orderStatus')}")
            
            # Validate createdAt is ISO string
            created_at = order.get("createdAt")
            if created_at and "T" in created_at and created_at.endswith("Z"):
                results.add_result("POST /api/orders - createdAt format", True, f"Valid ISO format: {created_at}")
            else:
                results.add_result("POST /api/orders - createdAt format", False, f"Invalid ISO format: {created_at}")
            
            results.add_result("POST /api/orders - overall", True, "Order created successfully")
            return results, order_id
            
        else:
            results.add_result("POST /api/orders - overall", False, f"Status: {response.status_code}, Body: {response.text}")
            return results, None
            
    except Exception as e:
        results.add_result("POST /api/orders - overall", False, f"Exception: {str(e)}")
        return results, None

def test_create_order_pickup():
    """Test 3: Create order with 'Ridicare personală' - delivery fee should be 0"""
    results = TestResults()
    
    order_data = {
        "customerName": "Maria Ionescu",
        "customerPhone": "0756123456",
        "customerEmail": "maria@example.ro",
        "customerAddress": "",
        "notes": "Ridicare personală",
        "deliveryMethod": "Ridicare personală",
        "paymentMethod": "Ramburs",
        "items": [
            {"id": "castraveti", "name": "Castraveți proaspeți", "price": 10, "quantity": 2, "unit": "lei / kg"}
        ]
    }
    
    try:
        print("\n🔍 Testing POST /api/orders (Ridicare personală - zero delivery fee)...")
        response = requests.post(
            f"{API_BASE}/orders",
            json=order_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            order = data["order"]
            
            expected_subtotal = 2 * 10  # 20
            expected_delivery_fee = 0  # Ridicare personală
            expected_total = expected_subtotal + expected_delivery_fee  # 20
            
            if order.get("deliveryFee") == expected_delivery_fee:
                results.add_result("POST /api/orders - pickup delivery fee", True, f"Correct: {expected_delivery_fee}")
            else:
                results.add_result("POST /api/orders - pickup delivery fee", False, f"Expected {expected_delivery_fee}, got {order.get('deliveryFee')}")
            
            if order.get("total") == expected_total:
                results.add_result("POST /api/orders - pickup total", True, f"Correct: {expected_total}")
            else:
                results.add_result("POST /api/orders - pickup total", False, f"Expected {expected_total}, got {order.get('total')}")
            
            results.add_result("POST /api/orders - pickup overall", True, "Pickup order created successfully")
            
        else:
            results.add_result("POST /api/orders - pickup overall", False, f"Status: {response.status_code}, Body: {response.text}")
            
    except Exception as e:
        results.add_result("POST /api/orders - pickup overall", False, f"Exception: {str(e)}")
    
    return results

def test_validation_errors():
    """Test 4: Validation errors (400)"""
    results = TestResults()
    
    # Test missing customerName
    try:
        print("\n🔍 Testing POST /api/orders (missing customerName)...")
        invalid_data = {
            "customerPhone": "0749476386",
            "items": [{"id": "test", "name": "Test", "price": 10, "quantity": 1}]
        }
        response = requests.post(
            f"{API_BASE}/orders",
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            results.add_result("POST /api/orders - missing customerName", True, f"Correctly returned 400: {response.json()}")
        else:
            results.add_result("POST /api/orders - missing customerName", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_result("POST /api/orders - missing customerName", False, f"Exception: {str(e)}")
    
    # Test missing customerPhone
    try:
        print("\n🔍 Testing POST /api/orders (missing customerPhone)...")
        invalid_data = {
            "customerName": "Test User",
            "items": [{"id": "test", "name": "Test", "price": 10, "quantity": 1}]
        }
        response = requests.post(
            f"{API_BASE}/orders",
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            results.add_result("POST /api/orders - missing customerPhone", True, f"Correctly returned 400: {response.json()}")
        else:
            results.add_result("POST /api/orders - missing customerPhone", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_result("POST /api/orders - missing customerPhone", False, f"Exception: {str(e)}")
    
    # Test empty items array
    try:
        print("\n🔍 Testing POST /api/orders (empty items array)...")
        invalid_data = {
            "customerName": "Test User",
            "customerPhone": "0749476386",
            "items": []
        }
        response = requests.post(
            f"{API_BASE}/orders",
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            results.add_result("POST /api/orders - empty items", True, f"Correctly returned 400: {response.json()}")
        else:
            results.add_result("POST /api/orders - empty items", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_result("POST /api/orders - empty items", False, f"Exception: {str(e)}")
    
    return results

def test_get_single_order(order_id):
    """Test 5: GET single order"""
    results = TestResults()
    
    if not order_id:
        results.add_result("GET /api/orders/:id - setup", False, "No order ID available from previous test")
        return results
    
    try:
        print(f"\n🔍 Testing GET /api/orders/{order_id}...")
        response = requests.get(f"{API_BASE}/orders/{order_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "order" in data:
                order = data["order"]
                # Verify it contains expected fields
                expected_fields = ["id", "orderNumber", "customerName", "customerPhone", "items", "subtotal", "deliveryFee", "total", "paymentStatus", "orderStatus", "createdAt"]
                missing_fields = [f for f in expected_fields if f not in order]
                if missing_fields:
                    results.add_result("GET /api/orders/:id - fields", False, f"Missing fields: {missing_fields}")
                else:
                    results.add_result("GET /api/orders/:id - fields", True, "All expected fields present")
                
                results.add_result("GET /api/orders/:id - overall", True, f"Order retrieved successfully: {order['orderNumber']}")
            else:
                results.add_result("GET /api/orders/:id - overall", False, f"Missing 'order' field in response: {data}")
        else:
            results.add_result("GET /api/orders/:id - overall", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        results.add_result("GET /api/orders/:id - overall", False, f"Exception: {str(e)}")
    
    # Test 404 for non-existent order
    try:
        print("\n🔍 Testing GET /api/orders/non-existent-id...")
        response = requests.get(f"{API_BASE}/orders/non-existent-id", timeout=10)
        
        if response.status_code == 404:
            results.add_result("GET /api/orders/:id - 404", True, f"Correctly returned 404: {response.json()}")
        else:
            results.add_result("GET /api/orders/:id - 404", False, f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_result("GET /api/orders/:id - 404", False, f"Exception: {str(e)}")
    
    return results

def test_list_orders():
    """Test 6: List orders"""
    results = TestResults()
    
    try:
        print("\n🔍 Testing GET /api/orders...")
        response = requests.get(f"{API_BASE}/orders", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "orders" in data and isinstance(data["orders"], list):
                orders = data["orders"]
                results.add_result("GET /api/orders - structure", True, f"Found {len(orders)} orders")
                
                # Check if orders are sorted by createdAt desc (if we have multiple orders)
                if len(orders) >= 2:
                    first_date = orders[0].get("createdAt", "")
                    second_date = orders[1].get("createdAt", "")
                    if first_date >= second_date:
                        results.add_result("GET /api/orders - sorting", True, "Orders sorted by createdAt desc")
                    else:
                        results.add_result("GET /api/orders - sorting", False, f"Orders not sorted correctly: {first_date} vs {second_date}")
                else:
                    results.add_result("GET /api/orders - sorting", True, "Sorting check skipped (less than 2 orders)")
                
                # Verify orders contain expected fields
                if orders:
                    order = orders[0]
                    expected_fields = ["id", "orderNumber", "customerName", "items", "total"]
                    missing_fields = [f for f in expected_fields if f not in order]
                    if missing_fields:
                        results.add_result("GET /api/orders - order fields", False, f"Missing fields in order: {missing_fields}")
                    else:
                        results.add_result("GET /api/orders - order fields", True, "Orders contain expected fields")
                
                results.add_result("GET /api/orders - overall", True, "Orders list retrieved successfully")
            else:
                results.add_result("GET /api/orders - overall", False, f"Invalid response structure: {data}")
        else:
            results.add_result("GET /api/orders - overall", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        results.add_result("GET /api/orders - overall", False, f"Exception: {str(e)}")
    
    return results

def main():
    """Run all backend tests"""
    print(f"🚀 Starting Family Garden Backend API Tests")
    print(f"📍 Base URL: {BASE_URL}")
    print(f"📍 API Base: {API_BASE}")
    print(f"⏰ Started at: {datetime.now().isoformat()}")
    
    all_results = TestResults()
    created_order_id = None
    
    # Test 1: Health endpoints
    print(f"\n{'='*60}")
    print("TEST 1: Health Check Endpoints")
    print(f"{'='*60}")
    health_results = test_health_endpoints()
    all_results.results.extend(health_results.results)
    all_results.passed += health_results.passed
    all_results.failed += health_results.failed
    
    # Test 2: Create order - happy path
    print(f"\n{'='*60}")
    print("TEST 2: Create Order - Happy Path (Livrare locală)")
    print(f"{'='*60}")
    create_results, order_id = test_create_order_happy_path()
    created_order_id = order_id
    all_results.results.extend(create_results.results)
    all_results.passed += create_results.passed
    all_results.failed += create_results.failed
    
    # Test 3: Create order - pickup
    print(f"\n{'='*60}")
    print("TEST 3: Create Order - Pickup (Ridicare personală)")
    print(f"{'='*60}")
    pickup_results = test_create_order_pickup()
    all_results.results.extend(pickup_results.results)
    all_results.passed += pickup_results.passed
    all_results.failed += pickup_results.failed
    
    # Test 4: Validation errors
    print(f"\n{'='*60}")
    print("TEST 4: Validation Errors")
    print(f"{'='*60}")
    validation_results = test_validation_errors()
    all_results.results.extend(validation_results.results)
    all_results.passed += validation_results.passed
    all_results.failed += validation_results.failed
    
    # Test 5: Get single order
    print(f"\n{'='*60}")
    print("TEST 5: Get Single Order")
    print(f"{'='*60}")
    get_results = test_get_single_order(created_order_id)
    all_results.results.extend(get_results.results)
    all_results.passed += get_results.passed
    all_results.failed += get_results.failed
    
    # Test 6: List orders
    print(f"\n{'='*60}")
    print("TEST 6: List Orders")
    print(f"{'='*60}")
    list_results = test_list_orders()
    all_results.results.extend(list_results.results)
    all_results.passed += list_results.passed
    all_results.failed += list_results.failed
    
    # Final summary
    success = all_results.summary()
    print(f"⏰ Completed at: {datetime.now().isoformat()}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())