#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Family Garden – Romanian e-commerce site for a family farm in Vințu de Jos, Alba.
  Sells fresh vegetables, fruits, flowers, seedlings (răsaduri), artisanal products.
  Core MVP feature: online ordering page (/comanda-online) with product browsing, filters,
  shopping cart, customer form, and order placement saved to MongoDB.
  Stack: Next.js + MongoDB (instead of Supabase from blueprint). No payment integration yet.

backend:
  - task: "Order placement API (POST /api/orders)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            POST /api/orders accepts: customerName, customerPhone, customerEmail (optional),
            customerAddress, notes, deliveryMethod ("Livrare locală" or "Ridicare personală"),
            paymentMethod ("Ramburs" or "Plată online"), items array (id, name, price, quantity, unit).
            Validates required fields (customerName, customerPhone, items not empty).
            Computes subtotal, deliveryFee (15 lei for "Livrare locală", 0 otherwise), total.
            Generates UUID `id` and short `orderNumber` (FG + last 6 digits of timestamp).
            Saves to MongoDB collection "orders" with createdAt ISO timestamp,
            paymentStatus="pending", orderStatus="new".
            Returns { orderId, orderNumber, order }.
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Happy path with "Livrare locală": Order created with correct subtotal (32), deliveryFee (15), total (47)
            • "Ridicare personală": Order created with deliveryFee (0), correct total calculation
            • Validation: Correctly returns 400 for missing customerName, customerPhone, empty items
            • Response format: Valid UUID orderId, correct orderNumber format (FG + 6 digits)
            • Order fields: All required fields present (paymentStatus=pending, orderStatus=new, ISO createdAt)
            • MongoDB persistence: Orders successfully saved and retrievable

  - task: "Get single order (GET /api/orders/:id)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/orders/:id - returns { order } by UUID. Returns 404 if not found.
            Used by /succes page after checkout to display order summary.
        - working: true
          agent: "testing"
          comment: |
            ✅ TESTING PASSED:
            • Successfully retrieves order by UUID with all expected fields
            • Returns 404 for non-existent order IDs
            • Response structure correct: { order: {...} }
            • All order fields present: id, orderNumber, customerName, customerPhone, items, subtotal, deliveryFee, total, paymentStatus, orderStatus, createdAt

  - task: "List orders (GET /api/orders)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "GET /api/orders returns last 100 orders sorted by createdAt desc."
        - working: true
          agent: "testing"
          comment: |
            ✅ TESTING PASSED:
            • Returns { orders: [...] } array structure
            • Orders correctly sorted by createdAt descending
            • All order objects contain expected fields
            • Successfully retrieves multiple orders from database

  - task: "Health/root endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "GET /api returns {ok:true, service:'Family Garden API'}. GET /api/health returns {status:'ok'}."
        - working: true
          agent: "testing"
          comment: |
            ✅ TESTING PASSED:
            • GET /api returns correct response: {ok: true, service: "Family Garden API"}
            • GET /api/health returns correct response: {status: "ok"}
            • Both endpoints respond with 200 status code

  - task: "Admin login (POST /api/admin/login)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            POST /api/admin/login with {password} returns {token: ADMIN_PASSWORD} on match.
            Wrong password returns 401. ADMIN_PASSWORD in /app/.env is "familygarden2025".
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Valid password ("familygarden2025"): Returns 200 with {token: "familygarden2025"}
            • Invalid password ("wrong"): Returns 401 with error message "Parolă incorectă"
            • Empty body: Returns 401 with error message "Parolă incorectă"
            • Authentication mechanism working correctly

  - task: "Admin orders list (GET /api/admin/orders)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/admin/orders requires header "Authorization: Bearer familygarden2025".
            Returns {orders: [...], stats: {total, new, confirmed, delivered, cancelled, revenue}}.
            stats.revenue = sum of order.total where orderStatus === "delivered".
            Without/wrong token returns 401.
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Valid Bearer token: Returns 200 with {orders: [...], stats: {...}}
            • Stats calculations verified: total matches orders.length, new count correct, revenue calculation correct
            • No Authorization header: Returns 401 with "Unauthorized" error
            • Invalid token: Returns 401 with "Unauthorized" error
            • Response structure correct with orders array and stats object

  - task: "Admin update order (PATCH /api/admin/orders/:id)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            PATCH /api/admin/orders/:id with auth header.
            Body fields allowed: orderStatus, paymentStatus, notes (only these are persisted).
            Returns {order: ...}. Adds updatedAt ISO string.
            Wrong/no token => 401. Unknown id => 404. No fields => 400.
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Update orderStatus to "confirmed": Returns 200, status updated, updatedAt timestamp added
            • Update multiple fields (orderStatus + paymentStatus): Both fields updated correctly with updatedAt
            • Update with no allowed fields: Returns 400 with "No fields to update" error
            • Update non-existent order: Returns 404 with "Order not found" error
            • Update without Authorization header: Returns 401 with "Unauthorized" error
            • Field validation working correctly - only allowed fields (orderStatus, paymentStatus, notes) are persisted

  - task: "Admin delete order (DELETE /api/admin/orders/:id)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            DELETE /api/admin/orders/:id requires auth header.
            Returns {ok:true} on success, 404 if not found, 401 without token.
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Delete with valid auth: Returns 200 with {ok: true}, order successfully deleted
            • Delete non-existent order: Returns 404 with "Order not found" error
            • Delete without Authorization header: Returns 401 with "Unauthorized" error
            • Deletion functionality working correctly with proper error handling

  - task: "Public products list (GET /api/products)"
    implemented: true
    working: "NA"
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/products returns { products: [...] } with active products only.
            On first DB call, products collection is auto-seeded from /app/lib/products-data.js
            (27 products) via ensureSeeded() in /app/lib/products-server.js.
            Each product has: id, name, category, description, price, unit, stock,
            minOrder, featured, season, image, active, sortOrder, createdAt.
            Sorted by sortOrder asc, then createdAt asc.

  - task: "Public single product (GET /api/products/:id)"
    implemented: true
    working: "NA"
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/products/:id returns { product } by string id.
            Returns 404 if not found.

  - task: "Admin products list (GET /api/admin/products)"
    implemented: true
    working: "NA"
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/admin/products requires Bearer token (ADMIN_PASSWORD = "familygarden2025").
            Returns ALL products including inactive (activeOnly: false). 401 without token.

  - task: "Admin create product (POST /api/admin/products)"
    implemented: true
    working: "NA"
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            POST /api/admin/products with auth + body { name, category, price, unit, ...optional }.
            Auto-generates slug-based unique id (with -2, -3 suffix on conflict).
            Auto-assigns sortOrder = max+1. Defaults: stock=0, minOrder=1, active=true,
            featured=false, season="Tot anul", description="", image="".
            Returns 400 if any required field missing. 401 without token.

  - task: "Admin update product (PATCH /api/admin/products/:id)"
    implemented: true
    working: "NA"
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            PATCH /api/admin/products/:id with auth. Allowed fields:
            name, category, description, price, unit, stock, minOrder, featured,
            season, image, active, sortOrder. Adds updatedAt. 404 if not found,
            400 if no allowed fields, 401 without token. Numeric coercion for
            price/stock/minOrder/sortOrder, boolean for featured/active.

  - task: "Admin delete product (DELETE /api/admin/products/:id)"
    implemented: true
    working: "NA"
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            DELETE /api/admin/products/:id with auth. Returns {ok:true} on success,
            404 if not found, 401 without token.

  - task: "Public site settings (GET /api/settings)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/settings returns sanitized site settings (no admin emails).
            Auto-creates with DEFAULT_SETTINGS if not yet saved.
            Schema: hero, whyUs[], contact, social, delivery, payment.
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Public settings endpoint returns 200 with correct structure
            • Response contains all required fields: hero, whyUs, contact, social, delivery, payment
            • emails field correctly sanitized (not present in public response)
            • Hero structure verified: title, subtitle, image fields present
            • Delivery structure verified: enabled, fee, freeAbove, pickupEnabled, pickupAddress fields present
            • Endpoint works without authentication as expected

  - task: "Admin settings GET/PUT (GET/PUT /api/admin/settings)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            GET /api/admin/settings returns full settings including emails.recipients.
            PUT /api/admin/settings (also PATCH supported) accepts partial payload.
            Allowed top-level keys: hero, whyUs, contact, social, delivery, payment, emails.
            Adds updatedAt. 401 without auth.
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Admin GET without auth: Returns 401 as expected
            • Admin GET with auth: Returns 200 with full settings including emails.recipients
            • Admin PUT without auth: Returns 401 as expected
            • Admin PUT with auth: Returns 200, partial updates work correctly
            • Partial update verification: hero.title and delivery.fee/freeAbove updated correctly
            • Untouched fields remain intact during partial updates
            • PATCH alias works correctly (same as PUT)
            • GET endpoint reflects changes after PUT/PATCH operations
            • Authentication and authorization working properly

  - task: "Multi-image product support"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            Products support `images: string[]` array. POST/PATCH accept it.
            When images updated, main `image` auto-syncs to images[0].
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Create product with images array: Successfully saves images array and auto-syncs main image to images[0]
            • Update images array: Main image auto-syncs when images updated without explicit image field
            • Update both image and images: Explicit image field is preserved when both are sent
            • GET product returns images array: Public endpoint includes images field
            • Image synchronization logic working correctly
            • Product creation and update with multi-image support fully functional

  - task: "Dynamic delivery fee from settings"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            POST /api/orders reads delivery fee from settings.
            Free shipping above threshold supported (settings.delivery.freeAbove).
        - working: true
          agent: "testing"
          comment: |
            ✅ COMPREHENSIVE TESTING COMPLETED - ALL SCENARIOS PASSED:
            • Dynamic delivery fee calculation: Orders correctly use settings.delivery.fee (tested with fee=25)
            • Free shipping threshold: Orders >= freeAbove get deliveryFee=0 (tested with freeAbove=50)
            • Below threshold orders: Orders < freeAbove get correct delivery fee
            • Delivery disabled: When settings.delivery.enabled=false, deliveryFee=0 even for local delivery
            • Settings integration: Order creation properly reads and applies current delivery settings
            • Order total calculation: Subtotal + deliveryFee = total calculated correctly
            • Settings reset: Successfully restored original delivery settings (enabled=true, fee=15, freeAbove=0)

frontend:
  - task: "Homepage with hero, stats, story, featured products"
    implemented: true
    working: "NA"
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Visually verified via screenshot - renders correctly."

  - task: "Comandă online page with cart and checkout"
    implemented: true
    working: "NA"
    file: "/app/app/comanda-online/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: |
            Visually verified - product grid + filters + cart + customer form all render.
            Add to cart, qty +/-, remove, submit order to /api/orders, redirect to /succes.

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
      message: |
        Family Garden MVP built. Backend: Next.js API at /api with MongoDB persistence
        (collection "orders"). Please test the order placement flow end-to-end:
        1. POST /api/orders with valid payload returns 200 + orderId + orderNumber + order object,
           and persists in MongoDB.
        2. POST /api/orders with missing customerName/customerPhone/items returns 400 with error.
        3. GET /api/orders/:id returns the saved order. 404 for unknown id.
        4. GET /api/orders returns list of orders.
        5. Verify subtotal/deliveryFee/total computation:
           - "Livrare locală" => deliveryFee = 15
           - "Ridicare personală" => deliveryFee = 0
        Use NEXT_PUBLIC_BASE_URL from /app/.env (https://fresh-harvest-152.preview.emergentagent.com)
        with /api prefix.
    - agent: "testing"
      message: |
        ✅ BACKEND TESTING COMPLETED SUCCESSFULLY - ALL 24 TESTS PASSED
        
        Comprehensive testing performed on all backend API endpoints:
        
        🔍 HEALTH ENDPOINTS: ✅ WORKING
        • GET /api → Returns {ok: true, service: "Family Garden API"}
        • GET /api/health → Returns {status: "ok"}
        
        🔍 ORDER CREATION: ✅ WORKING  
        • POST /api/orders with "Livrare locală" → Correct calculations (subtotal=32, deliveryFee=15, total=47)
        • POST /api/orders with "Ridicare personală" → Zero delivery fee (deliveryFee=0, total=20)
        • Validation errors → Correctly returns 400 for missing required fields
        • UUID generation → Valid orderId format
        • Order numbering → Correct FG + 6-digit format
        • MongoDB persistence → Orders successfully saved
        
        🔍 ORDER RETRIEVAL: ✅ WORKING
        • GET /api/orders/:id → Returns complete order data
        • GET /api/orders/invalid-id → Returns 404 as expected
        • GET /api/orders → Returns sorted list of orders (createdAt desc)
        
        All backend functionality is working correctly. MongoDB integration successful.
        No critical issues found. Backend API is production-ready.
    - agent: "testing"
      message: |
        ✅ ADMIN BACKEND TESTING COMPLETED SUCCESSFULLY - ALL 18 TESTS PASSED
        
        Comprehensive testing performed on all admin API endpoints:
        
        🔍 ADMIN LOGIN (POST /api/admin/login): ✅ WORKING
        • Valid password → Returns 200 with correct token
        • Invalid password → Returns 401 with error message
        • Empty body → Returns 401 with error message
        
        🔍 ADMIN ORDERS LIST (GET /api/admin/orders): ✅ WORKING
        • Valid Bearer token → Returns orders array + stats object
        • Stats calculations verified (total, new, confirmed, delivered, cancelled, revenue)
        • No Authorization header → Returns 401
        • Invalid token → Returns 401
        
        🔍 ADMIN UPDATE ORDER (PATCH /api/admin/orders/:id): ✅ WORKING
        • Update single field → Status updated with updatedAt timestamp
        • Update multiple fields → Both fields updated correctly
        • No allowed fields → Returns 400 error
        • Non-existent order → Returns 404 error
        • No authorization → Returns 401 error
        
        🔍 ADMIN DELETE ORDER (DELETE /api/admin/orders/:id): ✅ WORKING
        • Valid auth → Returns 200 with {ok: true}
        • Non-existent order → Returns 404 error
        • No authorization → Returns 401 error
        
        🔍 REGRESSION TESTING: ✅ ALL EXISTING ENDPOINTS WORKING
        • GET /api → Working correctly
        • POST /api/orders → Working correctly
        • GET /api/orders/:id → Working correctly
        • GET /api/orders → Working correctly
        
        All admin functionality is working correctly. Authentication, authorization, 
        and CRUD operations fully functional. No critical issues found.
    - agent: "main"
      message: |
        🔄 NEW PRODUCTS API ENDPOINTS — NEEDS TESTING
        
        Implemented full CRUD for products backed by MongoDB. Existing 27 products from
        /app/lib/products-data.js are auto-seeded into the "products" collection on the
        first DB call (via ensureSeeded() in /app/lib/products-server.js).
        
        Frontend (/, /comanda-online, /produs/[id]) was refactored to fetch products
        from the database (no longer reads static products-data.js).
        
        Please test these new endpoints:
        
        1. PUBLIC ENDPOINTS (no auth):
           • GET /api/products → expects { products: [...] } with active products only
             (length should be ~27 on first call due to seed; only active=true)
           • GET /api/products/:id → expects { product: {...} } for valid id (e.g. "rosii-gradina"),
             404 with { error: "Product not found" } for invalid id.
        
        2. ADMIN PRODUCTS ENDPOINTS (require Authorization: Bearer familygarden2025):
           • GET /api/admin/products → returns ALL products (including inactive). 401 without auth.
           • POST /api/admin/products → create with body { name, category, price, unit, ...optional }.
             - Returns { product } with auto-generated id (slug from name) and sortOrder.
             - Returns 400 if name/category/price/unit missing.
             - Returns 401 without auth.
             - Verify creating a product with same name produces unique id with suffix (-2).
           • PATCH /api/admin/products/:id → update allowed fields:
             name, category, description, price, unit, stock, minOrder, featured, season,
             image, active, sortOrder. Adds updatedAt timestamp.
             - 404 for unknown id, 400 if no allowed fields, 401 without auth.
             - Verify numeric coercion (e.g. price as string "9.5" stored as 9.5).
             - Verify boolean coercion for featured/active.
           • DELETE /api/admin/products/:id → returns { ok: true }. 404 unknown, 401 no auth.
        
        3. EDGE CASES TO VERIFY:
           • Image field accepts long base64 data URI (~300KB) without error.
           • Public GET /api/products excludes products with active=false.
           • Admin GET /api/admin/products includes products with active=false.
        
        Use NEXT_PUBLIC_BASE_URL with /api prefix.
        ADMIN_PASSWORD env var = "familygarden2025".
        
        Cleanup: tests should delete any products they create to keep DB clean.
        Please do NOT delete any of the seed products (id starts with "rosii-gradina",
        "castraveti", "spanac", etc.).
    - agent: "testing"
      message: |
        ✅ NEW SETTINGS API + MULTI-IMAGE + DYNAMIC DELIVERY FEE TESTING COMPLETED - ALL 52 TESTS PASSED
        
        Comprehensive testing performed on all new backend features:
        
        🔍 PUBLIC SETTINGS API (GET /api/settings): ✅ WORKING
        • Returns 200 with sanitized settings (emails field removed)
        • All required fields present: hero, whyUs, contact, social, delivery, payment
        • Hero and delivery structures verified with all expected fields
        • Works without authentication as expected
        
        🔍 ADMIN SETTINGS API (GET/PUT/PATCH /api/admin/settings): ✅ WORKING
        • GET without auth: Returns 401 as expected
        • GET with auth: Returns 200 with full settings including emails.recipients
        • PUT/PATCH without auth: Returns 401 as expected
        • PUT/PATCH with auth: Partial updates work correctly
        • Untouched fields remain intact during partial updates
        • PATCH works as alias for PUT
        • GET reflects changes after PUT/PATCH operations
        
        🔍 MULTI-IMAGE PRODUCT SUPPORT: ✅ WORKING
        • Create product with images array: Auto-syncs main image to images[0]
        • Update images array: Main image auto-syncs when images updated
        • Update both image and images: Explicit image field preserved
        • GET product returns images array in public endpoint
        
        🔍 DYNAMIC DELIVERY FEE: ✅ WORKING
        • Orders correctly use settings.delivery.fee for local delivery
        • Free shipping threshold: Orders >= freeAbove get deliveryFee=0
        • Below threshold orders get correct delivery fee
        • Delivery disabled: deliveryFee=0 when settings.delivery.enabled=false
        • Order total calculation: subtotal + deliveryFee = total
        • Settings successfully reset to original values
        
        🔍 REGRESSION TESTING: ✅ ALL EXISTING ENDPOINTS WORKING
        • All previously tested endpoints still functional
        • No breaking changes introduced
        
        All new features are working correctly. Settings API, multi-image products, 
        and dynamic delivery fee fully functional. No critical issues found.