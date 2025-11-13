Responses
Curl

curl -X 'GET' \
  'https://main.chargeghar.com/api/admin/transactions?page=1&page_size=20&source=all' \
  -H 'accept: application/json'
Request URL
https://main.chargeghar.com/api/admin/transactions?page=1&page_size=20&source=all
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "results": [
      {
        "source": "wallet",
        "id": "83dd26ca-1a6f-4f59-9bc0-798d16fca738",
        "transaction_id": "W-83dd26ca-1a6f-4f59-9bc0-798d16fca738",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "CREDIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 50,
        "balance_after": 150,
        "created_at": "2025-11-12T13:17:26.841737Z",
        "description": "Withdrawal rejected - WD2201HMUFCK"
      },
      {
        "source": "points",
        "id": "d207abc4-b013-473f-9b9b-9aa7bc176799",
        "transaction_id": "P-d207abc4-b013-473f-9b9b-9aa7bc176799",
        "user": {
          "id": "1",
          "username": "janak",
          "email": "janak@powerbank.com"
        },
        "type": "EARNED",
        "points": 25,
        "points_source": "COUPON",
        "status": "COMPLETED",
        "balance_before": 90,
        "balance_after": 115,
        "created_at": "2025-11-12T13:13:05.017849Z",
        "description": "Coupon applied: Festival Special"
      },
      {
        "source": "wallet",
        "id": "453f90e4-262d-49c2-abed-a85a7fd71c26",
        "transaction_id": "W-453f90e4-262d-49c2-abed-a85a7fd71c26",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "DEBIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 150,
        "balance_after": 50,
        "created_at": "2025-11-12T11:22:58.479414Z",
        "description": "Withdrawal request - WD2258R5T9AG"
      },
      {
        "source": "wallet",
        "id": "cfafb455-8db6-4dae-a53f-37a68ff8fe32",
        "transaction_id": "W-cfafb455-8db6-4dae-a53f-37a68ff8fe32",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "DEBIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 250,
        "balance_after": 150,
        "created_at": "2025-11-12T11:22:01.957546Z",
        "description": "Withdrawal request - WD2201HMUFCK"
      },
      {
        "source": "wallet",
        "id": "b63d46d9-d1d9-4e6a-87eb-7f243ad975fa",
        "transaction_id": "W-b63d46d9-d1d9-4e6a-87eb-7f243ad975fa",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "DEBIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 350,
        "balance_after": 250,
        "created_at": "2025-11-12T11:21:50.176923Z",
        "description": "Withdrawal request - WD2150I44BD0"
      },
      {
        "source": "points",
        "id": "45438b5b-d3f6-4ffb-a954-fc48f8baa6af",
        "transaction_id": "P-45438b5b-d3f6-4ffb-a954-fc48f8baa6af",
        "user": {
          "id": "2",
          "username": "testuser1",
          "email": "testuser1@example.com"
        },
        "type": "EARNED",
        "points": 100,
        "points_source": "ADMIN_ADJUSTMENT",
        "status": "COMPLETED",
        "balance_before": 150,
        "balance_after": 250,
        "created_at": "2025-11-12T11:16:37.253409Z",
        "description": "testing"
      },
      {
        "source": "points",
        "id": "9b16a1ae-3ce2-4ce1-a27c-66b74282ffeb",
        "transaction_id": "P-9b16a1ae-3ce2-4ce1-a27c-66b74282ffeb",
        "user": {
          "id": "2",
          "username": "testuser1",
          "email": "testuser1@example.com"
        },
        "type": "EARNED",
        "points": 100,
        "points_source": "ADMIN_ADJUSTMENT",
        "status": "COMPLETED",
        "balance_before": 150,
        "balance_after": 250,
        "created_at": "2025-11-12T10:58:07.468955Z",
        "description": "string"
      },
      {
        "source": "points",
        "id": "80cc9813-2e66-4a85-994a-4dd54982eef8",
        "transaction_id": "P-80cc9813-2e66-4a85-994a-4dd54982eef8",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "EARNED",
        "points": 10,
        "points_source": "TOPUP",
        "status": "COMPLETED",
        "balance_before": 75,
        "balance_after": 85,
        "created_at": "2025-11-12T08:46:41.741108Z",
        "description": "Top-up reward for NPR 100.00"
      },
      {
        "source": "wallet",
        "id": "e4e4b325-d2b7-487b-82b2-843c179088c3",
        "transaction_id": "W-e4e4b325-d2b7-487b-82b2-843c179088c3",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "CREDIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 250,
        "balance_after": 350,
        "created_at": "2025-11-12T08:46:41.629056Z",
        "description": "Wallet top-up via esewa"
      },
      {
        "source": "payment",
        "id": "218458ea-1179-46a2-bbd1-a7c38b0f64cd",
        "transaction_id": "TXN20251112084641GA23BV",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "TOPUP",
        "amount": 100,
        "status": "SUCCESS",
        "created_at": "2025-11-12T08:46:41.624724Z",
        "description": "Top Up - Success"
      },
      {
        "source": "points",
        "id": "9ca748ac-1095-4d61-8969-0b551395380c",
        "transaction_id": "P-9ca748ac-1095-4d61-8969-0b551395380c",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "EARNED",
        "points": 10,
        "points_source": "TOPUP",
        "status": "COMPLETED",
        "balance_before": 65,
        "balance_after": 75,
        "created_at": "2025-11-12T08:40:12.330897Z",
        "description": "Top-up reward for NPR 100.00"
      },
      {
        "source": "wallet",
        "id": "97510da9-43a3-4566-aaa7-2f6b384000bb",
        "transaction_id": "W-97510da9-43a3-4566-aaa7-2f6b384000bb",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "CREDIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 150,
        "balance_after": 250,
        "created_at": "2025-11-12T08:40:12.203106Z",
        "description": "Wallet top-up via khalti"
      },
      {
        "source": "payment",
        "id": "4ecccd01-b228-45eb-a5e7-2e6ff41135bc",
        "transaction_id": "TXN202511120840124XUI4O",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "TOPUP",
        "amount": 100,
        "status": "SUCCESS",
        "created_at": "2025-11-12T08:40:12.198311Z",
        "description": "Top Up - Success"
      },
      {
        "source": "points",
        "id": "079791d5-1bc6-4ab5-b022-0619b2b393cf",
        "transaction_id": "P-079791d5-1bc6-4ab5-b022-0619b2b393cf",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "EARNED",
        "points": 15,
        "points_source": "TOPUP",
        "status": "COMPLETED",
        "balance_before": 50,
        "balance_after": 65,
        "created_at": "2025-11-12T08:20:23.029815Z",
        "description": "Top-up reward for NPR 150.00"
      },
      {
        "source": "wallet",
        "id": "4ea86792-ee5c-461a-8021-ebb0b9eee14c",
        "transaction_id": "W-4ea86792-ee5c-461a-8021-ebb0b9eee14c",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "CREDIT",
        "amount": 150,
        "status": "COMPLETED",
        "balance_before": 0,
        "balance_after": 150,
        "created_at": "2025-11-12T08:20:22.450189Z",
        "description": "Wallet top-up via esewa"
      },
      {
        "source": "payment",
        "id": "975f6f3a-a095-46c6-b298-1d546df3ee6d",
        "transaction_id": "TXN20251112082022BHBUEG",
        "user": {
          "id": "4",
          "username": "sunarsudeep1999",
          "email": "sunarsudeep1999@gmail.com"
        },
        "type": "TOPUP",
        "amount": 150,
        "status": "SUCCESS",
        "created_at": "2025-11-12T08:20:22.444869Z",
        "description": "Top Up - Success"
      },
      {
        "source": "points",
        "id": "983e0257-9fc2-4624-80dd-a1701dd110bd",
        "transaction_id": "P-983e0257-9fc2-4624-80dd-a1701dd110bd",
        "user": {
          "id": "1",
          "username": "janak",
          "email": "janak@powerbank.com"
        },
        "type": "EARNED",
        "points": 10,
        "points_source": "TOPUP",
        "status": "COMPLETED",
        "balance_before": 80,
        "balance_after": 90,
        "created_at": "2025-11-12T07:06:14.452941Z",
        "description": "Top-up reward for NPR 100.00"
      },
      {
        "source": "wallet",
        "id": "616b1d33-6777-46dd-af15-face0eebc2e6",
        "transaction_id": "W-616b1d33-6777-46dd-af15-face0eebc2e6",
        "user": {
          "id": "1",
          "username": "janak",
          "email": "janak@powerbank.com"
        },
        "type": "CREDIT",
        "amount": 100,
        "status": "COMPLETED",
        "balance_before": 100,
        "balance_after": 200,
        "created_at": "2025-11-12T07:06:14.419014Z",
        "description": "Wallet top-up via esewa"
      },
      {
        "source": "payment",
        "id": "b0db7a9e-9423-4896-aec5-9548cc440556",
        "transaction_id": "TXN20251112070614UH2KB3",
        "user": {
          "id": "1",
          "username": "janak",
          "email": "janak@powerbank.com"
        },
        "type": "TOPUP",
        "amount": 100,
        "status": "SUCCESS",
        "created_at": "2025-11-12T07:06:14.414817Z",
        "description": "Top Up - Success"
      },
      {
        "source": "payment",
        "id": "d8baa29d-e923-49fd-b3d1-e858875d7051",
        "transaction_id": "TXN202511120613292HD00C",
        "user": {
          "id": "1",
          "username": "janak",
          "email": "janak@powerbank.com"
        },
        "type": "RENTAL",
        "amount": 8,
        "status": "SUCCESS",
        "created_at": "2025-11-12T06:13:29.680492Z",
        "description": "Rental - Success"
      }
    ],
    "pagination": {
      "total_count": 30,
      "page": 1,
      "page_size": 20,
      "total_pages": 2
    }
  }
}
Response headers
 allow: GET,HEAD,OPTIONS 
 connection: keep-alive 
 content-length: 7577 
 content-type: application/json 
 cross-origin-opener-policy: same-origin 
 date: Thu,13 Nov 2025 08:46:29 GMT 
 referrer-policy: same-origin 
 server: nginx/1.24.0 (Ubuntu) 
 vary: origin,Cookie 
 x-content-type-options: nosniff 
 x-frame-options: DENY 