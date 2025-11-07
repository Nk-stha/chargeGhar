

Get details of a specific coupon including usage stats

Parameters
Cancel
Name	Description
coupon_code *
string
(path)
WELCOME51
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/coupons/WELCOME51' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/coupons/WELCOME51
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "Coupon details retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440901",
    "code": "WELCOME51",
    "name": "Welcome Bonus",
    "points_value": 50,
    "max_uses_per_user": 1,
    "valid_from": "2024-01-01T05:45:00+05:45",
    "valid_until": "2027-01-01T05:44:59+05:45",
    "status": "active",
    "created_at": "2024-01-01T05:45:00+05:45",
    "is_currently_valid": true,
    "days_remaining": 419,
    "total_uses": 0,
    "usage_stats": {
      "total_uses": 0,
      "unique_users": 0,
      "total_points_awarded": 0
    }
  }
}
Response headers
 allow: GET,PATCH,DELETE,HEAD,OPTIONS
 connection: keep-alive
 content-length: 478
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Fri,07 Nov 2025 17:18:36 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY

 Update coupon status (activate/deactivate)

Parameters
Cancel
Reset
Name	Description
coupon_code *
string
(path)
WELCOME51
Request body

multipart/form-data
status
string
ACTIVE - ACTIVE
INACTIVE - INACTIVE
EXPIRED - EXPIRED

INACTIVE
Send empty value
Execute
Clear
Responses
Curl

curl -X 'PATCH' \
  'https://main.chargeghar.com/api/admin/coupons/WELCOME51' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -H  'Authorization: Bearer                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1MTI0MjUyLCJpYXQiOjE3NjI1MzIyNTIsImp0aSI6ImNjYjNlMmI2ODdiMTRhYmI5NWJmNzA0Nzc4MzUxYTVjIiwidXNlcl9pZCI6IjciLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.0PFd5dj8r4uyjETFTOTCYR0_51m1UqLKWokurYa16YQ' \
  -F 'status=INACTIVE'
Request URL
https://main.chargeghar.com/api/admin/coupons/WELCOME51

{"success":true,"message":"Coupon status updated successfully","data":{"id":"550e8400-e29b-41d4-a716-446655440901","code":"WELCOME51","name":"Welcome Bonus","points_value":50,"max_uses_per_user":1,"valid_from":"2024-01-01T05:45:00+05:45","valid_until":"2027-01-01T05:44:59+05:45","status":"INACTIVE","created_at":"2024-01-01T05:45:00+05:45","is_currently_valid":false,"days_remaining":0,"total_uses":0}}

Delete a coupon (soft delete)

Parameters
Cancel
Name	Description
coupon_code *
string
(path)
WELCOME51
Execute
Clear
Responses
Curl
curl -X 'DELETE' \
  'https://main.chargeghar.com/api/admin/coupons/WELCOME51' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer                     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY1MTI0MjUyLCJpYXQiOjE3NjI1MzIyNTIsImp0aSI6ImNjYjNlMmI2ODdiMTRhYmI5NWJmNzA0Nzc4MzUxYTVjIiwidXNlcl9pZCI6IjciLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.0PFd5dj8r4uyjETFTOTCYR0_51m1UqLKWokurYa16YQ'
Request URL
https://main.chargeghar.com/api/admin/coupons/WELCOME51

{"success":true,"message":"Coupon deleted successfully","data":{"message":"Coupon WELCOME51 deleted successfully"}}

Get usage history for a specific coupon

Parameters
Cancel
Name	Description
coupon_code *
string
(path)
ROHAN
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/coupons/ROHAN/usages' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/coupons/ROHAN/usages
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "Coupon usage history retrieved successfully",
  "data": {
    "results": [
      {
        "id": "c2ef5b7b-f92a-4e8e-b4e8-c74790fbf721",
        "coupon_code": "ROHAN",
        "coupon_name": "Rohan",
        "user_username": "nikeshshrestha405",
        "points_awarded": 10000,
        "used_at": "2025-11-07T23:26:02.455394+05:45"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 1,
      "page_size": 20,
      "has_next": false,
      "has_previous": false,
      "next_page": null,
      "previous_page": null
    }
  }
}
Response headers
 allow: GET,HEAD,OPTIONS
 connection: keep-alive
 content-length: 442
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Fri,07 Nov 2025 17:45:17 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY
