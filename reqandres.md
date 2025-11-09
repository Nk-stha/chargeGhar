Get, update, or delete specific media upload (admin privileges)

Parameters
Cancel
Name	Description
upload_id *
string
(path)
Media upload ID

691d0258-1ef7-47b7-b3ae-ddc605ae67a4
Execute
Clear
Responses
Curl

curl -X 'DELETE' \
  'https://main.chargeghar.com/api/admin/media/uploads/691d0258-1ef7-47b7-b3ae-ddc605ae67a4' \
  -H 'accept: application/json' \
  -H 'X-CSRFTOKEN: oAZwgO3n2nJmlZaRopcjXgKxu7NHgEnPqPTYKbxGAamTTTa9S9DfHIDWZLhfiF2c'
Request URL
https://main.chargeghar.com/api/admin/media/uploads/691d0258-1ef7-47b7-b3ae-ddc605ae67a4
Server response
Code	Details
200
Response body
Download
{
  "success": true,
  "message": "Media upload deleted successfully",
  "data": {
    "upload_id": "691d0258-1ef7-47b7-b3ae-ddc605ae67a4",
    "message": "Media upload deleted successfully by admin"
  }
}
Response headers
 access-control-allow-origin: https://main.chargeghar.com
 allow: GET,DELETE,HEAD,OPTIONS
 connection: keep-alive
 content-length: 177
 content-type: application/json
 cross-origin-opener-policy: same-origin
 date: Sun,09 Nov 2025 08:23:38 GMT
 referrer-policy: same-origin
 server: nginx/1.24.0 (Ubuntu)
 vary: origin,Cookie
 x-content-type-options: nosniff
 x-frame-options: DENY
