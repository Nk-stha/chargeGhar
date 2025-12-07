List and filter powerbanks with their current status and location (Staff only)

Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/powerbanks' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/powerbanks
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "message": "PowerBanks retrieved successfully",
  "data": {
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440401",
        "serial_number": "PB001",
        "model": "PowerBank Pro 10000",
        "capacity_mah": 10000,
        "status": "RENTED",
        "battery_level": 95,
        "rental_count": 0,
        "current_station": null,
        "current_slot": null,
        "current_rental": {
          "rental_code": "D955L1EM",
          "user_id": "5",
          "username": "Sudeep",
          "started_at": "2025-11-25T13:02:41.419519Z",
          "due_at": "2025-11-25T14:02:41.370710Z",
          "status": "OVERDUE"
        },
        "last_updated": "2025-11-25T13:02:41.413233Z"
      },
      {
        "id": "ada4b94b-0e62-4481-9ef9-8d9e08c0aadd",
        "serial_number": "40000001",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "b48ee2b1-5932-4204-8c7e-0c9e96ed5310",
          "name": "Station 5036",
          "serial_number": "864253060875036"
        },
        "current_slot": {
          "id": "e429f623-b57b-4c04-a311-60130e76db67",
          "slot_number": 4
        },
        "current_rental": null,
        "last_updated": "2025-12-03T06:19:13.030009Z"
      },
      {
        "id": "13a04d93-b91d-4a83-9004-7c8c0dd5489d",
        "serial_number": "40000065",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 100,
        "rental_count": 0,
        "current_station": {
          "id": "41a3a902-842e-407d-acff-ff4815ada6d8",
          "name": "Station 0540",
          "serial_number": "864253060870540"
        },
        "current_slot": {
          "id": "2b229a04-05f8-4c4a-ae2a-0237812e63f1",
          "slot_number": 8
        },
        "current_rental": null,
        "last_updated": "2025-11-21T14:52:01.680311Z"
      },
      {
        "id": "e1bfb275-2bf1-4564-97ba-a33d9142c99b",
        "serial_number": "40000553",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "a48ddcaa-8487-4d58-bde7-15ae0d928264",
          "name": "Station 5101",
          "serial_number": "864253060875101"
        },
        "current_slot": {
          "id": "f31a6734-9e18-4039-a618-95d3862726df",
          "slot_number": 8
        },
        "current_rental": null,
        "last_updated": "2025-12-03T06:09:52.387279Z"
      },
      {
        "id": "e4a6689d-9882-4ead-9def-7fddf1a29a18",
        "serial_number": "40003555",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 19,
        "rental_count": 0,
        "current_station": {
          "id": "d39b2eba-9429-4d5c-8490-6af72208aa41",
          "name": "Station 3197",
          "serial_number": "864253060873197"
        },
        "current_slot": {
          "id": "69e6139c-02d6-491e-9ff3-fabd735db7fd",
          "slot_number": 5
        },
        "current_rental": null,
        "last_updated": "2025-12-04T01:08:26.970012Z"
      },
      {
        "id": "6c42bfc9-740e-4f0d-8f4e-b602ce43a2d4",
        "serial_number": "40004122",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "3485be0d-92f2-4141-adbc-d0f2461bebaa",
          "name": "Station 3429",
          "serial_number": "864253060873429"
        },
        "current_slot": {
          "id": "10e190b3-2958-42e6-93b6-9f57fc5b8406",
          "slot_number": 2
        },
        "current_rental": null,
        "last_updated": "2025-12-03T03:25:06.528372Z"
      },
      {
        "id": "b64bb06b-b6ba-435c-a9da-d4439062f5b1",
        "serial_number": "40004708",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "2f5b1153-6b58-4715-8f9c-9dd38ef947b4",
          "name": "Station 3607",
          "serial_number": "868522071413607"
        },
        "current_slot": {
          "id": "63c8f4f1-a6a3-455e-90a1-7c19c91476c7",
          "slot_number": 3
        },
        "current_rental": null,
        "last_updated": "2025-12-04T01:06:30.209735Z"
      },
      {
        "id": "bc2ab4ae-1098-439f-a8c9-6cec6fdb9fd8",
        "serial_number": "40005705",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "679d00a7-a39b-4523-a0c2-d8d07e77dd90",
          "name": "Station 3452",
          "serial_number": "864253060873452"
        },
        "current_slot": {
          "id": "888fe986-410f-4316-aaba-eb618b92a0be",
          "slot_number": 1
        },
        "current_rental": null,
        "last_updated": "2025-12-03T07:10:48.682444Z"
      },
      {
        "id": "d56ed858-e636-486f-ac78-a358446a4ff4",
        "serial_number": "40005708",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 95,
        "rental_count": 0,
        "current_station": {
          "id": "d39b2eba-9429-4d5c-8490-6af72208aa41",
          "name": "Station 3197",
          "serial_number": "864253060873197"
        },
        "current_slot": {
          "id": "27ba767b-cfd9-40dc-8fdf-f04b76c6c791",
          "slot_number": 8
        },
        "current_rental": null,
        "last_updated": "2025-12-04T01:08:26.975980Z"
      },
      {
        "id": "f8853459-421d-4252-b594-4f7fa7c84c9b",
        "serial_number": "40054279",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 99,
        "rental_count": 0,
        "current_station": {
          "id": "41a3a902-842e-407d-acff-ff4815ada6d8",
          "name": "Station 0540",
          "serial_number": "864253060870540"
        },
        "current_slot": {
          "id": "f543e502-02b0-41e1-a96c-dd74c1ea2784",
          "slot_number": 3
        },
        "current_rental": null,
        "last_updated": "2025-11-25T06:12:44.201106Z"
      },
      {
        "id": "c5c5a735-05bb-46ef-b615-d73772508e71",
        "serial_number": "40054806",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "d39b2eba-9429-4d5c-8490-6af72208aa41",
          "name": "Station 3197",
          "serial_number": "864253060873197"
        },
        "current_slot": {
          "id": "2b0fc215-3eec-455d-a6f1-cafdd530f9f7",
          "slot_number": 2
        },
        "current_rental": null,
        "last_updated": "2025-12-04T01:09:12.208375Z"
      },
      {
        "id": "c62e0c0c-5678-47ac-947c-5a18777e3c3a",
        "serial_number": "40054832",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "3e9a2406-0be2-4de8-bc6c-f9e133e3f0b0",
          "name": "Station 1860",
          "serial_number": "864253060871860"
        },
        "current_slot": {
          "id": "8975bab5-ff72-4a3a-86ee-c94bedf41e0c",
          "slot_number": 6
        },
        "current_rental": null,
        "last_updated": "2025-12-04T02:55:41.763807Z"
      },
      {
        "id": "1acbb413-d002-4610-8209-1a1bcd1fb876",
        "serial_number": "40055322",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 36,
        "rental_count": 0,
        "current_station": {
          "id": "3e9a2406-0be2-4de8-bc6c-f9e133e3f0b0",
          "name": "Station 1860",
          "serial_number": "864253060871860"
        },
        "current_slot": {
          "id": "7b3842e0-b611-4ae4-b9f1-60424b86f7ce",
          "slot_number": 8
        },
        "current_rental": null,
        "last_updated": "2025-12-04T03:03:41.732742Z"
      },
      {
        "id": "2bf1434e-4e79-436c-9dc3-7d48442e25e0",
        "serial_number": "40061526",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 100,
        "rental_count": 0,
        "current_station": {
          "id": "41a3a902-842e-407d-acff-ff4815ada6d8",
          "name": "Station 0540",
          "serial_number": "864253060870540"
        },
        "current_slot": {
          "id": "fd869a6b-9dc3-4c59-bbfd-9b6cb3d1c25e",
          "slot_number": 5
        },
        "current_rental": null,
        "last_updated": "2025-11-27T07:55:25.528670Z"
      },
      {
        "id": "069ceaf0-0863-4ab9-90b5-b802ab5fdbda",
        "serial_number": "40072933",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 48,
        "rental_count": 0,
        "current_station": {
          "id": "41a3a902-842e-407d-acff-ff4815ada6d8",
          "name": "Station 0540",
          "serial_number": "864253060870540"
        },
        "current_slot": {
          "id": "1528ba76-7d8d-43c7-b63d-64f10345d0c8",
          "slot_number": 7
        },
        "current_rental": null,
        "last_updated": "2025-11-27T07:55:25.533066Z"
      },
      {
        "id": "72ed0a38-2d30-4617-8c3a-af70fc0ed5a0",
        "serial_number": "40073035",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 100,
        "rental_count": 0,
        "current_station": {
          "id": "41a3a902-842e-407d-acff-ff4815ada6d8",
          "name": "Station 0540",
          "serial_number": "864253060870540"
        },
        "current_slot": {
          "id": "f543e502-02b0-41e1-a96c-dd74c1ea2784",
          "slot_number": 3
        },
        "current_rental": null,
        "last_updated": "2025-11-21T16:51:52.206024Z"
      },
      {
        "id": "13e8daa9-adf8-4354-a2b1-7a966a356980",
        "serial_number": "40083480",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 98,
        "rental_count": 0,
        "current_station": {
          "id": "41a3a902-842e-407d-acff-ff4815ada6d8",
          "name": "Station 0540",
          "serial_number": "864253060870540"
        },
        "current_slot": {
          "id": "e8daf14a-1f0c-4b4e-80dc-54f9db8d8a55",
          "slot_number": 1
        },
        "current_rental": null,
        "last_updated": "2025-11-25T06:12:44.198604Z"
      },
      {
        "id": "2b5102d2-a67a-449f-b5e2-64a6dd99b7fb",
        "serial_number": "40106596",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "679d00a7-a39b-4523-a0c2-d8d07e77dd90",
          "name": "Station 3452",
          "serial_number": "864253060873452"
        },
        "current_slot": {
          "id": "888fe986-410f-4316-aaba-eb618b92a0be",
          "slot_number": 1
        },
        "current_rental": null,
        "last_updated": "2025-12-03T07:00:35.178558Z"
      },
      {
        "id": "4d53dced-2223-4eaf-ac1c-bbddbaf0d016",
        "serial_number": "40106610",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "d39b2eba-9429-4d5c-8490-6af72208aa41",
          "name": "Station 3197",
          "serial_number": "864253060873197"
        },
        "current_slot": {
          "id": "bab6de22-42d2-4a5c-9045-b73221e87777",
          "slot_number": 10
        },
        "current_rental": null,
        "last_updated": "2025-12-04T01:09:15.888686Z"
      },
      {
        "id": "df5cbfb8-192a-4b57-a548-b08b25c7543f",
        "serial_number": "40106638",
        "model": "Standard",
        "capacity_mah": 10000,
        "status": "AVAILABLE",
        "battery_level": 0,
        "rental_count": 0,
        "current_station": {
          "id": "c55c1482-b239-4157-a433-1dd62bfa8264",
          "name": "Station 0680",
          "serial_number": "864253060870680"
        },
        "current_slot": {
          "id": "802d7d68-65d9-4263-a23f-8cead7bdb4ed",
          "slot_number": 2
        },
        "current_rental": null,
        "last_updated": "2025-12-03T06:20:00.410142Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 4,
      "total_count": 69,
      "page_size": 20,
      "has_next": true,
      "has_previous": false,
      "next_page": 2,
      "previous_page": null
    }
  }
}
Response headers
 allow: GET,HEAD,OPTIONS 
 connection: keep-alive 
 content-length: 8917 
 content-type: application/json 
 cross-origin-opener-policy: same-origin 
 date: Sun,07 Dec 2025 05:49:27 GMT 
 referrer-policy: same-origin 
 server: nginx/1.24.0 (Ubuntu) 
 vary: origin,Cookie 
 x-content-type-options: nosniff 
 x-frame-options: DENY 

 Get detailed powerbank information including rental history (Staff only)

Parameters
Cancel
Name	Description
powerbank_id *
string
(path)
550e8400-e29b-41d4-a716-446655440401
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/powerbanks/550e8400-e29b-41d4-a716-446655440401' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/powerbanks/550e8400-e29b-41d4-a716-446655440401
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "message": "PowerBank detail retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440401",
    "serial_number": "PB001",
    "model": "PowerBank Pro 10000",
    "capacity_mah": 10000,
    "status": "RENTED",
    "battery_level": 95,
    "hardware_info": {
      "version": "1.0",
      "manufacturer": "PowerTech"
    },
    "current_station": null,
    "current_slot": null,
    "current_rental": {
      "rental_code": "D955L1EM",
      "user": {
        "id": "5",
        "username": "Sudeep",
        "email": null
      },
      "pickup_station": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Kathmandu Mall Station"
      },
      "package": {
        "name": "1 Hour Package",
        "duration_minutes": 60,
        "price": "50.00"
      },
      "started_at": "2025-11-25T13:02:41.419519Z",
      "due_at": "2025-11-25T14:02:41.370710Z",
      "status": "OVERDUE",
      "payment_status": "PAID"
    },
    "statistics": {
      "total_rentals": 1,
      "completed_rentals": 0,
      "total_revenue": "0"
    },
    "recent_history": [
      {
        "rental_code": "D955L1EM",
        "user": "Sudeep",
        "pickup_station": "Kathmandu Mall Station",
        "return_station": null,
        "started_at": "2025-11-25T13:02:41.419519Z",
        "ended_at": null,
        "status": "OVERDUE",
        "amount_paid": "50.00"
      }
    ],
    "last_updated": "2025-11-25T13:02:41.413233Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
Response headers
 allow: GET,HEAD,OPTIONS 
 connection: keep-alive 
 content-length: 1108 
 content-type: application/json 
 cross-origin-opener-policy: same-origin 
 date: Sun,07 Dec 2025 05:56:07 GMT 
 referrer-policy: same-origin 
 server: nginx/1.24.0 (Ubuntu) 
 vary: origin,Cookie 
 x-content-type-options: nosniff 
 x-frame-options: DENY 

 Get complete rental history for a powerbank (Staff only)

Parameters
Cancel
Name	Description
powerbank_id *
string
(path)
550e8400-e29b-41d4-a716-446655440401
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/powerbanks/550e8400-e29b-41d4-a716-446655440401/history' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/powerbanks/550e8400-e29b-41d4-a716-446655440401/history
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "message": "PowerBank history retrieved successfully",
  "data": {
    "results": [
      {
        "rental_code": "D955L1EM",
        "user": {
          "id": "5",
          "username": "Sudeep",
          "email": null
        },
        "pickup_station": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Kathmandu Mall Station"
        },
        "return_station": null,
        "package": {
          "name": "1 Hour Package",
          "duration_minutes": 60
        },
        "started_at": "2025-11-25T13:02:41.419519Z",
        "ended_at": null,
        "due_at": "2025-11-25T14:02:41.370710Z",
        "status": "OVERDUE",
        "payment_status": "PAID",
        "amount_paid": "50.00",
        "overdue_amount": "0.00",
        "is_returned_on_time": false
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
    },
    "powerbank": {
      "serial_number": "PB001",
      "model": "PowerBank Pro 10000"
    }
  }
}
Response headers
 allow: GET,HEAD,OPTIONS 
 connection: keep-alive 
 content-length: 781 
 content-type: application/json 
 cross-origin-opener-policy: same-origin 
 date: Sun,07 Dec 2025 05:56:35 GMT 
 referrer-policy: same-origin 
 server: nginx/1.24.0 (Ubuntu) 
 vary: origin,Cookie 
 x-content-type-options: nosniff 
 x-frame-options: DENY 

 Update powerbank status (AVAILABLE/MAINTENANCE/DAMAGED) (Staff only)

Parameters
Cancel
Reset
Name	Description
powerbank_id *
string
(path)
550e8400-e29b-41d4-a716-446655440401
Request body

multipart/form-data
status *
string
New status for the powerbank (cannot set to RENTED manually)

AVAILABLE - AVAILABLE
MAINTENANCE - MAINTENANCE
DAMAGED - DAMAGED

MAINTENANCE
reason
string
Reason for status change

testing
Send empty value
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://main.chargeghar.com/api/admin/powerbanks/550e8400-e29b-41d4-a716-446655440401/status' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -H 'X-CSRFTOKEN: eoo4unRjAkTahmWAv3iRHuBYf0iWpTOrB7Yyr23AYBLlPEZVyQLewi3VUcXvtr3U' \
  -F 'status=MAINTENANCE' \
  -F 'reason=testing'
Request URL
https://main.chargeghar.com/api/admin/powerbanks/550e8400-e29b-41d4-a716-446655440401/status
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "message": "PowerBank status updated successfully",
  "data": {
    "powerbank_id": "550e8400-e29b-41d4-a716-446655440401",
    "serial_number": "PB001",
    "new_status": "MAINTENANCE",
    "message": "PowerBank status updated to MAINTENANCE"
  }
}
Response headers
 access-control-allow-origin: https://main.chargeghar.com 
 allow: POST,OPTIONS 
 connection: keep-alive 
 content-length: 232 
 content-type: application/json 
 cross-origin-opener-policy: same-origin 
 date: Sun,07 Dec 2025 05:57:11 GMT 
 referrer-policy: same-origin 
 server: nginx/1.24.0 (Ubuntu) 
 vary: origin,Cookie 
 x-content-type-options: nosniff 
 x-frame-options: DENY 

 Get powerbank fleet analytics and statistics (Staff only)

Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/powerbanks/analytics/overview' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/powerbanks/analytics/overview
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "message": "PowerBank analytics retrieved successfully",
  "data": {
    "overview": {
      "total_powerbanks": 69,
      "status_breakdown": {
        "available": 68,
        "rented": 0,
        "maintenance": 1,
        "damaged": 0
      },
      "needs_attention": 29,
      "avg_battery_level": 54.26
    },
    "utilization": {
      "total_rentals": 2,
      "active_rentals": 0,
      "completed_rentals": 1,
      "total_revenue": "50.00",
      "utilization_rate": 0
    },
    "top_performers": [
      {
        "serial_number": "PB011",
        "model": "PowerBank Pro 10000",
        "status": "AVAILABLE",
        "rental_count": 1,
        "revenue": "50.00"
      },
      {
        "serial_number": "40083480",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "PB005",
        "model": "PowerBank Pro 10000",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "40004708",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "40055322",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "40998076",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "40054279",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "40000065",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "PB015",
        "model": "PowerBank Pro 10000",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      },
      {
        "serial_number": "40723197",
        "model": "Standard",
        "status": "AVAILABLE",
        "rental_count": 0,
        "revenue": "0"
      }
    ],
    "station_distribution": [
      {
        "station": "Station 0540",
        "count": 17
      },
      {
        "station": "Station 3197",
        "count": 9
      },
      {
        "station": "Station 1860",
        "count": 6
      },
      {
        "station": "Chitwan Mall Station",
        "count": 4
      },
      {
        "station": "Station 3452",
        "count": 4
      },
      {
        "station": "Pokhara Airport Station",
        "count": 4
      },
      {
        "station": "Lalitpur Tech Hub Station",
        "count": 4
      },
      {
        "station": "Kathmandu Mall Station",
        "count": 3
      },
      {
        "station": "Station 3607",
        "count": 3
      },
      {
        "station": "Station 1670",
        "count": 3
      }
    ]
  }
}
Response headers
 allow: GET,HEAD,OPTIONS 
 connection: keep-alive 
 content-length: 1844 
 content-type: application/json 
 cross-origin-opener-policy: same-origin 
 date: Sun,07 Dec 2025 05:57:31 GMT 
 referrer-policy: same-origin 
 server: nginx/1.24.0 (Ubuntu) 
 vary: origin,Cookie 
 x-content-type-options: nosniff 
 x-frame-options: DENY 