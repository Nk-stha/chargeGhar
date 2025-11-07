Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/rental-packages' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/rental-packages
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "Rental packages retrieved successfully",
  "data": {
    "rental_packages": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "1 Hour Package",
        "description": "Perfect for short trips",
        "duration_minutes": 60,
        "price": "50.00",
        "package_type": "HOURLY",
        "payment_model": "PREPAID",
        "is_active": true,
        "package_metadata": {},
        "duration_display": "1 hour",
        "created_at": "2024-01-01T05:45:00+05:45",
        "updated_at": "2024-01-01T05:45:00+05:45"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "4 Hour Package",
        "description": "Great for half-day activities",
        "duration_minutes": 240,
        "price": "150.00",
        "package_type": "HOURLY",
        "payment_model": "PREPAID",
        "is_active": true,
        "package_metadata": {},
        "duration_display": "4 hours",
        "created_at": "2024-01-01T05:45:00+05:45",
        "updated_at": "2024-01-01T05:45:00+05:45"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Daily Package",
        "description": "Best value for all-day use",
        "duration_minutes": 1440,
        "price": "300.00",
        "package_type": "DAILY",
        "payment_model": "PREPAID",
        "is_active": true,
        "package_metadata": {},
        "duration_display": "1 day",
        "created_at": "2024-01-01T05:45:00+05:45",
        "updated_at": "2024-01-01T05:45:00+05:45"
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
    }
  }
}
Response headers
 allow: GET,POST,HEAD,OPTIONS
 connection: keep-alive
 content-length: 1304
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Fri,07 Nov 2025 10:04:33 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY


 Parameters
 Cancel
 Reset
 No parameters

 Request body

 multipart/form-data
 name *
 string
 string
 description *
 string
 string
 duration_minutes *
 integer
 25
 price *
 string($decimal)
 2500
 package_type *
 string
 HOURLY - HOURLY
 DAILY - DAILY
 WEEKLY - WEEKLY
 MONTHLY - MONTHLY

 HOURLY
 payment_model *
 string
 PREPAID - PREPAID
 POSTPAID - POSTPAID

 PREPAID
 is_active
 boolean

 true
 Send empty value
 package_metadata
 {"anything":"anything"}
 Send empty value
 Execute
 Clear
 Responses
 Curl

 curl -X 'POST' \
   'https://main.chargeghar.com/api/admin/rental-packages' \
   -H 'accept: application/json' \
   -H 'Content-Type: multipart/form-data' \
   -H 'X-CSRFTOKEN: Cb4R0gZkryICepx2sFucbBrAIzdmVJbB8L7u8aywouQUWTentPQd6kKkUh0TPGwD' \
   -F 'name=string' \
   -F 'description=string' \
   -F 'duration_minutes=25' \
   -F 'price=2500' \
   -F 'package_type=HOURLY' \
   -F 'payment_model=PREPAID' \
   -F 'is_active=true' \
   -F 'package_metadata={"anything":"anything"}'
 Request URL
 https://main.chargeghar.com/api/admin/rental-packages
 Server response
 Code	Details
 200
 Response body
 Download
 {
   "success": true,
   "message": "Rental package created successfully",
   "data": {
     "id": "d74ead36-4c35-44a4-900e-6c219be8c8f8",
     "name": "string",
     "description": "string",
     "duration_minutes": 25,
     "price": "2500.00",
     "package_type": "HOURLY",
     "payment_model": "PREPAID",
     "is_active": true,
     "package_metadata": {
       "anything": "anything"
     },
     "duration_display": "25 minutes",
     "created_at": "2025-11-07T15:51:05.493451+05:45",
     "updated_at": "2025-11-07T15:51:05.493466+05:45"
   }
 }
 Response headers
  access-control-allow-origin: https://main.chargeghar.com
  allow: GET,POST,HEAD,OPTIONS
  connection: keep-alive
  content-length: 434
  content-type: application/json
  cross-origin-opener-policy: same-origin
  date: Fri,07 Nov 2025 10:06:05 GMT
  referrer-policy: same-origin
  server: nginx/1.24.0 (Ubuntu)
  vary: origin,Cookie
  x-content-type-options: nosniff
  x-frame-options: DENY

  Get, update, or delete a specific rental package

  Parameters
  Cancel
  Name	Description
  package_id *
  string($uuid)
  (path)
  d74ead36-4c35-44a4-900e-6c219be8c8f8
  Execute
  Clear
  Responses
  Curl

  curl -X 'GET' \
    'https://main.chargeghar.com/api/admin/rental-packages/d74ead36-4c35-44a4-900e-6c219be8c8f8' \
    -H 'accept: application/json'
  Request URL
  https://main.chargeghar.com/api/admin/rental-packages/d74ead36-4c35-44a4-900e-6c219be8c8f8
  Server response
  Code	Details
  200
  Response body
  Download
  {
    "success": true,
    "message": "Rental package retrieved successfully",
    "data": {
      "id": "d74ead36-4c35-44a4-900e-6c219be8c8f8",
      "name": "string",
      "description": "string",
      "duration_minutes": 25,
      "price": "2500.00",
      "package_type": "HOURLY",
      "payment_model": "PREPAID",
      "is_active": true,
      "package_metadata": {
        "anything": "anything"
      },
      "duration_display": "25 minutes",
      "created_at": "2025-11-07T15:51:05.493451+05:45",
      "updated_at": "2025-11-07T15:51:05.493466+05:45"
    }
  }
  Response headers
   allow: GET,PATCH,DELETE,HEAD,OPTIONS
   connection: keep-alive
   content-length: 436
   content-type: application/json
   cross-origin-opener-policy: same-origin
   date: Fri,07 Nov 2025 10:06:38 GMT
   referrer-policy: same-origin
   server: nginx/1.24.0 (Ubuntu)
   vary: origin,Cookie
   x-content-type-options: nosniff
   x-frame-options: DENY

Parameters
Cancel
Reset
Name	Description
package_id *
string($uuid)
(path)
d74ead36-4c35-44a4-900e-6c219be8c8f8
Request body

multipart/form-data
name
string
string
Send empty value
description
string
string
Send empty value
duration_minutes
integer
25
Send empty value
price
string($decimal)
7000
Send empty value
package_type
string
HOURLY - HOURLY
DAILY - DAILY
WEEKLY - WEEKLY
MONTHLY - MONTHLY

HOURLY
Send empty value
payment_model
string
PREPAID - PREPAID
POSTPAID - POSTPAID

PREPAID
Send empty value
is_active
boolean

true
Send empty value
package_metadata
{"testing":"testing"}
Send empty value
Execute
Clear
Responses
Curl

curl -X 'PATCH' \
  'https://main.chargeghar.com/api/admin/rental-packages/d74ead36-4c35-44a4-900e-6c219be8c8f8' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRFTOKEN: Cb4R0gZkryICepx2sFucbBrAIzdmVJbB8L7u8aywouQUWTentPQd6kKkUh0TPGwD' \
  -F 'name=string' \
  -F 'description=string' \
  -F 'duration_minutes=25' \
  -F 'price=7000' \
  -F 'package_type=HOURLY' \
  -F 'payment_model=PREPAID' \
  -F 'is_active=true' \
  -F 'package_metadata={"testing":"testing"}'
Request URL
https://main.chargeghar.com/api/admin/rental-packages/d74ead36-4c35-44a4-900e-6c219be8c8f8
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "Rental package updated successfully",
  "data": {
    "id": "d74ead36-4c35-44a4-900e-6c219be8c8f8",
    "name": "string",
    "description": "string",
    "duration_minutes": 25,
    "price": "7000.00",
    "package_type": "HOURLY",
    "payment_model": "PREPAID",
    "is_active": true,
    "package_metadata": {
      "testing": "testing"
    },
    "duration_display": "25 minutes",
    "created_at": "2025-11-07T15:51:05.493451+05:45",
    "updated_at": "2025-11-07T15:52:27.733395+05:45"
  }
}
Response headers
 access-control-allow-origin: https://main.chargeghar.com
 allow: GET,PATCH,DELETE,HEAD,OPTIONS
 connection: keep-alive
 content-length: 432
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Fri,07 Nov 2025 10:07:27 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY


 Get, update, or delete a specific rental package

 Parameters
 Cancel
 Name	Description
 package_id *
 string($uuid)
 (path)
 d74ead36-4c35-44a4-900e-6c219be8c8f8
 Execute
 Clear
 Responses
 Curl

 curl -X 'DELETE' \
   'https://main.chargeghar.com/api/admin/rental-packages/d74ead36-4c35-44a4-900e-6c219be8c8f8' \
   -H 'accept: application/json' \
   -H 'X-CSRFTOKEN: Cb4R0gZkryICepx2sFucbBrAIzdmVJbB8L7u8aywouQUWTentPQd6kKkUh0TPGwD'
 Request URL
 https://main.chargeghar.com/api/admin/rental-packages/d74ead36-4c35-44a4-900e-6c219be8c8f8
 Server response
 Code	Details
 200
 Response body
 Download
 {
   "success": true,
   "message": "Rental package deleted successfully",
   "data": {
     "id": "d74ead36-4c35-44a4-900e-6c219be8c8f8",
     "name": "string",
     "deleted": true
   }
 }
 Response headers
  access-control-allow-origin: https://main.chargeghar.com
  allow: GET,PATCH,DELETE,HEAD,OPTIONS
  connection: keep-alive
  content-length: 148
  content-type: application/json
  cross-origin-opener-policy: same-origin
  date: Fri,07 Nov 2025 10:07:52 GMT
  referrer-policy: same-origin
  server: nginx/1.24.0 (Ubuntu)
  vary: origin,Cookie
  x-content-type-options: nosniff
  x-frame-options: DENY
