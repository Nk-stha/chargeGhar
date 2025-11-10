GET
/api/admin/late-fee-configs
Get All Late Fee Configurations
api_admin_late_fee_configs_retrieve


Get all late fee configurations with filtering and pagination (Admin only)

Parameters
Cancel
Name	Description
fee_type
string
(query)
Filter by fee type (MULTIPLIER, FLAT_RATE, COMPOUND)

fee_type
is_active
boolean
(query)
Filter by active status (true/false)


--
page
integer
(query)
Page number (default: 1)

page
page_size
integer
(query)
Items per page (default: 20)

page_size
search
string
(query)
Search in configuration name

search
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/late-fee-configs' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/late-fee-configs
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "Late fee configurations retrieved successfully",
  "data": {
    "configurations": [
      {
        "id": "0191e624-d6f8-75f7-9c8e-f3c3a2a1b0d9",
        "name": "Standard Double Rate (Active)",
        "fee_type": "MULTIPLIER",
        "fee_type_display": "Multiplier (e.g., 2x normal rate)",
        "multiplier": "2.00",
        "flat_rate_per_hour": "0.00",
        "grace_period_minutes": 15,
        "max_daily_rate": "1000.00",
        "is_active": true,
        "applicable_package_types": [],
        "metadata": {
          "examples": [
            "Hourly rental at NPR 2/minute becomes NPR 4/minute when late",
            "15-minute grace period - first 15 minutes late are free",
            "Maximum charge of NPR 1,000 even if very late"
          ],
          "description": "Current active configuration: 2x normal rate for late returns, 15-minute grace period, max NPR 1,000/day",
          "last_reviewed": "2025-01-01",
          "created_by_system": true
        },
        "description_text": ".1f",
        "created_at": "2025-01-01T05:45:00+05:45",
        "updated_at": "2025-01-01T05:45:00+05:45"
      },
      {
        "id": "0191e624-d6f8-75f7-9c8e-f3c3a2a1b0db",
        "name": "Holiday Triple Rate Example",
        "fee_type": "MULTIPLIER",
        "fee_type_display": "Multiplier (e.g., 2x normal rate)",
        "multiplier": "3.00",
        "flat_rate_per_hour": "0.00",
        "grace_period_minutes": 0,
        "max_daily_rate": "2000.00",
        "is_active": false,
        "applicable_package_types": [],
        "metadata": {
          "examples": [
            "Hourly rental at NPR 2/minute becomes NPR 6/minute when late",
            "No grace period - charges start immediately",
            "Higher cap of NPR 2,000/day for busy peak seasons"
          ],
          "use_case": "When demand is high and you want to discourage lateness strongly",
          "description": "Example for busy periods: 3x normal rate, no grace period, higher daily cap"
        },
        "description_text": ".1f",
        "created_at": "2025-01-03T05:45:00+05:45",
        "updated_at": "2025-01-03T05:45:00+05:45"
      },
      {
        "id": "0191e624-d6f8-75f7-9c8e-f3c3a2a1b0da",
        "name": "Flat Rate Example (NPR 50/hour)",
        "fee_type": "FLAT_RATE",
        "fee_type_display": "Flat rate per hour",
        "multiplier": "1.00",
        "flat_rate_per_hour": "50.00",
        "grace_period_minutes": 30,
        "max_daily_rate": "300.00",
        "is_active": false,
        "applicable_package_types": [],
        "metadata": {
          "examples": [
            "All rentals charge NPR 50 for each hour late (same for cheap and expensive packages)",
            "30-minute grace period - first 30 minutes late are free",
            "Maximum charge of NPR 300/day for fairness"
          ],
          "use_case": "When you want predictable, fair charges regardless of rental cost",
          "description": "Example alternative: Fixed NPR 50 per overdue hour, 30-minute grace period"
        },
        "description_text": "NPR 50.00 per hour after 30 minute grace period",
        "created_at": "2025-01-02T05:45:00+05:45",
        "updated_at": "2025-01-02T05:45:00+05:45"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 3,
      "page_size": 20,
      "has_next": false,
      "has_previous": false,
      "next_page": null,
      "previous_page": null
    },
    "summary": {
      "total_configurations": 3,
      "active_configurations": 1,
      "inactive_configurations": 2
    }
  }
}
Response headers
 allow: GET,POST,HEAD,OPTIONS
 connection: keep-alive
 content-length: 2748
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Mon,10 Nov 2025 01:18:02 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY

 POST
 /api/admin/late-fee-configs
 Create Late Fee Configuration
 api_admin_late_fee_configs_create


 Create a new late fee configuration

 Parameters
 Cancel
 Reset
 No parameters

 Request body

 multipart/form-data
 name *
 string
 Clear name for this fee setting (e.g., 'Standard Late Fee')

 string
 fee_type
 string
 Fee calculation method: MULTIPLIER, FLAT_RATE, or COMPOUND

 MULTIPLIER - Multiplier (e.g., 2x normal rate)
 FLAT_RATE - Flat rate per hour
 COMPOUND - Compound (multiplier + flat rate)

 MULTIPLIER
 Send empty value
 multiplier
 string($decimal)
 Multiplier for MULTIPLIER or COMPOUND types (e.g., 2.0 for 2x rate)

 2.00
 Send empty value
 flat_rate_per_hour
 string($decimal)
 Flat rate per overdue hour (NPR) for FLAT_RATE or COMPOUND types

 0.00
 Send empty value
 grace_period_minutes
 integer
 Minutes before late charges start (0 = immediate)

 0
 Send empty value
 max_daily_rate
 string($decimal)
 Maximum late fee per day (NPR) - leave empty for no limit

 6501101.55
 Send empty value
 is_active
 boolean
 Whether this configuration is currently active


 true
 Send empty value
 applicable_package_types
 array<string>
 Limit to specific package types (empty = all packages)

 string
 -
 Add string item
 Send empty value
 metadata
 Additional metadata for this configuration

 {"testing":"testing"}
 Send empty value
 Execute
 Clear
 Responses
 curl -X 'POST' \
   'https://main.chargeghar.com/api/admin/late-fee-configs' \
   -H 'accept: application/json' \
   -H 'Content-Type: multipart/form-data' \
   -H  "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1MTI0MjUyLCJpYXQiOjE3NjI1MzIyNTIsImp0aSI6ImNjYjNlMmI2ODdiMTRhYmI5NWJmNzA0Nzc4MzUxYTVjIiwidXNlcl9pZCI6IjciLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.0PFd5dj8r4uyjETFTOTCYR0_51m1UqLKWokurYa16YQ" \
   -F 'applicable_package_types=string' \
   -F 'max_daily_rate=6501101.55' \
   -F 'multiplier=2' \
   -F 'grace_period_minutes=0' \
   -F 'name=string' \
   -F 'metadata={"testing":"testing"}' \
   -F 'fee_type=MULTIPLIER' \
   -F 'is_active=true' \
   -F 'flat_rate_per_hour=0'
 {"success":true,"message":"Late fee configuration created successfully","data":{"configuration":{"id":"d0a1fa36-2c25-4d29-9232-0c8ce80a96d6","name":"string","fee_type":"MULTIPLIER","fee_type_display":"Multiplier (e.g., 2x normal rate)","multiplier":"2.00","flat_rate_per_hour":"0.00","grace_period_minutes":0,"max_daily_rate":"6501101.55","is_active":true,"applicable_package_types":["string"],"metadata":{"testing":"testing"},"description_text":".1f","created_at":"2025-11-10T07:06:36.619350+05:45","updated_at":"2025-11-10T07:06:36.619373+05:45"},"message":"Late fee configuration \"string\" created successfully"}}


 GET
 /api/admin/late-fee-configs/{config_id}
 Get Late Fee Configuration
 api_admin_late_fee_configs_retrieve_2


 Get details of a specific late fee configuration

 Parameters
 Cancel
 Name	Description
 config_id *
 string($uuid)
 (path)
 d0a1fa36-2c25-4d29-9232-0c8ce80a96d6
 Execute
 Clear
 Responses
 Curl

 curl -X 'GET' \
   'https://main.chargeghar.com/api/admin/late-fee-configs/d0a1fa36-2c25-4d29-9232-0c8ce80a96d6' \
   -H 'accept: application/json'
 Request URL
 https://main.chargeghar.com/api/admin/late-fee-configs/d0a1fa36-2c25-4d29-9232-0c8ce80a96d6
 Server response
 Code	Details
 200
 Response body
 Download
 {
   "success": true,
   "message": "Configuration retrieved successfully",
   "data": {
     "configuration": {
       "id": "d0a1fa36-2c25-4d29-9232-0c8ce80a96d6",
       "name": "string",
       "fee_type": "MULTIPLIER",
       "fee_type_display": "Multiplier (e.g., 2x normal rate)",
       "multiplier": "2.00",
       "flat_rate_per_hour": "0.00",
       "grace_period_minutes": 0,
       "max_daily_rate": "6501101.55",
       "is_active": true,
       "applicable_package_types": [
         "string"
       ],
       "metadata": {
         "testing": "testing"
       },
       "description_text": ".1f",
       "created_at": "2025-11-10T07:06:36.619350+05:45",
       "updated_at": "2025-11-10T07:06:36.619373+05:45"
     }
   }
 }
 Response headers
  allow: GET,PUT,DELETE,HEAD,OPTIONS
  connection: keep-alive
  content-length: 543
  content-type: application/json
  cross-origin-opener-policy: same-origin
  date: Mon,10 Nov 2025 01:22:38 GMT
  referrer-policy: same-origin
  server: nginx/1.24.0 (Ubuntu)
  vary: origin,Cookie
  x-content-type-options: nosniff
  x-frame-options: DENY


  PUT
  /api/admin/late-fee-configs/{config_id}
  Update Late Fee Configuration
  api_admin_late_fee_configs_update


  Update an existing late fee configuration

  Parameters
  Cancel
  Reset
  Name	Description
  config_id *
  string($uuid)
  (path)
  d0a1fa36-2c25-4d29-9232-0c8ce80a96d6
  Request body

  multipart/form-data
  name
  string
  Update configuration name

  string
  Send empty value
  fee_type
  string
  Update fee calculation method

  MULTIPLIER - Multiplier (e.g., 2x normal rate)
  FLAT_RATE - Flat rate per hour
  COMPOUND - Compound (multiplier + flat rate)

  MULTIPLIER
  Send empty value
  multiplier
  string($decimal)
  Update multiplier value

  122
  Send empty value
  flat_rate_per_hour
  string($decimal)
  Update flat rate per hour

  1.
  Send empty value
  grace_period_minutes
  integer
  Update grace period

  0
  Send empty value
  max_daily_rate
  string($decimal)
  Update maximum daily rate

  -85
  Send empty value
  is_active
  boolean
  Activate or deactivate this configuration


  true
  Send empty value
  applicable_package_types
  array<string>
  Update applicable package types

  string
  -
  Add string item
  Send empty value
  metadata
  Update metadata

  {"testing":"helloworld"}
  Send empty value
  Execute
  Clear
  Responses
  curl -X 'PUT' \
    'https://main.chargeghar.com/api/admin/late-fee-configs/d0a1fa36-2c25-4d29-9232-0c8ce80a96d6' \
    -H 'accept: application/json' \
    -H 'Content-Type: multipart/form-data' \
    -H  "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1MTI0MjUyLCJpYXQiOjE3NjI1MzIyNTIsImp0aSI6ImNjYjNlMmI2ODdiMTRhYmI5NWJmNzA0Nzc4MzUxYTVjIiwidXNlcl9pZCI6IjciLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.0PFd5dj8r4uyjETFTOTCYR0_51m1UqLKWokurYa16YQ" \
    -F 'applicable_package_types=string' \
    -F 'max_daily_rate=10' \
    -F 'multiplier=11' \
    -F 'grace_period_minutes=0' \
    -F 'name=string' \
    -F 'metadata={"testing":"helloworld"}' \
    -F 'fee_type=MULTIPLIER' \
    -F 'is_active=true' \
    -F 'flat_rate_per_hour=1'
  {"success":true,"message":"Configuration updated successfully","data":{"configuration":{"id":"d0a1fa36-2c25-4d29-9232-0c8ce80a96d6","name":"string","fee_type":"MULTIPLIER","fee_type_display":"Multiplier (e.g., 2x normal rate)","multiplier":"11.00","flat_rate_per_hour":"1.00","grace_period_minutes":0,"max_daily_rate":"10.00","is_active":true,"applicable_package_types":["string"],"metadata":{"testing":"helloworld"},"description_text":".1f","created_at":"2025-11-10T07:06:36.619350+05:45","updated_at":"2025-11-10T07:17:15.802851+05:45"},"message":"Configuration \"string\" updated successfully"}}

  DELETE
  /api/admin/late-fee-configs/{config_id}
  Delete Late Fee Configuration
  api_admin_late_fee_configs_destroy


  Delete a late fee configuration (cannot delete active configuration)

  Parameters
  Cancel
  Name	Description
  config_id *
  string($uuid)
  (path)
  d0a1fa36-2c25-4d29-9232-0c8ce80a96d6
  Execute
  Clear
  Responses
  curl -X 'DELETE' \
    'https://main.chargeghar.com/api/admin/late-fee-configs/d0a1fa36-2c25-4d29-9232-0c8ce80a96d6' \
    -H 'accept: application/json' \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1MTI0MjUyLCJpYXQiOjE3NjI1MzIyNTIsImp0aSI6ImNjYjNlMmI2ODdiMTRhYmI5NWJmNzA0Nzc4MzUxYTVjIiwidXNlcl9pZCI6IjciLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.0PFd5dj8r4uyjETFTOTCYR0_51m1UqLKWokurYa16YQ"
  {"success":true,"message":"Configuration deleted successfully","data":{"deleted_configuration":"string","message":"Configuration \"string\" deleted successfully"}}
