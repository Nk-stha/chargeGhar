Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/kyc/submissions' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0ODI3NTE5LCJpYXQiOjE3NjIyMzU1MTksImp0aSI6IjM3OTRmYmVlOWU3NjQ5ZGZhZmQwZjgxMDBhYzE0MDcxIiwidXNlcl9pZCI6IjEiLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.O1KeIY-4gd6INC2oDVXyAaEaP6DcZWGuN0-hOQc_jrY'
Request URL
https://main.chargeghar.com/api/admin/kyc/submissions
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "KYC submissions retrieved successfully",
  "data": {
    "kyc_submissions": [
      {
        "id": "c1891e73-b531-4ce6-9697-813b8cd61509",
        "user_id": "1",
        "username": "janak",
        "email": "janak@powerbank.com",
        "phone_number": null,
        "document_type": "CITIZENSHIP",
        "document_number": "ADMIN001",
        "document_front_url": "https://example.com/admin-doc.jpg",
        "document_back_url": null,
        "status": "APPROVED",
        "verified_at": "2025-11-05T13:04:36.254126+05:45",
        "verified_by_username": null,
        "rejection_reason": null,
        "created_at": "2025-11-05T13:04:36.256385+05:45",
        "updated_at": "2025-11-05T13:04:36.256396+05:45"
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
 content-length: 738
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Thu,06 Nov 2025 15:32:32 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY

Parameters
Cancel
Name	Description
kyc_id *
string($uuid)
(path)
c1891e73-b531-4ce6-9697-813b8cd61509
Request body

multipart/form-data
status
string
APPROVED - APPROVED
REJECTED - REJECTED

APPROVED
Send empty value
rejection_reason
string
Required when status is REJECTED

string
Send empty value
Execute
Clear
Responses
Curl

curl -X 'PATCH' \
  'https://main.chargeghar.com/api/admin/kyc/submissions/c1891e73-b531-4ce6-9697-813b8cd61509' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0ODI3NTE5LCJpYXQiOjE3NjIyMzU1MTksImp0aSI6IjM3OTRmYmVlOWU3NjQ5ZGZhZmQwZjgxMDBhYzE0MDcxIiwidXNlcl9pZCI6IjEiLCJpc3MiOiJDaGFyZ2VHaGFyLUFQSSJ9.O1KeIY-4gd6INC2oDVXyAaEaP6DcZWGuN0-hOQc_jrY' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRFTOKEN: LlzhTH4Gma24OwgDBVvT6Xj7y5boJvtrFHQguFe2g9z06PBAYM0vVWL5UQHfuXyF' \
  -F 'status=APPROVED' \
  -F 'rejection_reason=string'
Request URL
https://main.chargeghar.com/api/admin/kyc/submissions/c1891e73-b531-4ce6-9697-813b8cd61509
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "KYC status updated successfully",
  "data": {
    "kyc_id": "c1891e73-b531-4ce6-9697-813b8cd61509",
    "user": "janak",
    "old_status": "APPROVED",
    "new_status": "APPROVED",
    "verified_by": "janak"
  }
}
Response headers
 access-control-allow-origin: https://main.chargeghar.com
 allow: PATCH,OPTIONS
 connection: keep-alive
 content-length: 202
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Thu,06 Nov 2025 15:34:15 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY
