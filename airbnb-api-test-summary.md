# SearchAPI Airbnb 成功呼叫紀錄

## 1. 搜尋體驗 — `airbnb_experiences_search`

**請求**

```
GET https://www.searchapi.io/api/v1/search
engine=airbnb_experiences
q=Tokyo cooking class
num=3
```

**回傳值**

```json
{
  "search_metadata": {
    "status": "Success",
    "request_url": "https://www.airbnb.com/s/Tokyo-cooking-class/experiences"
  },
  "search_parameters": {
    "engine": "airbnb_experiences",
    "airbnb_domain": "airbnb.com",
    "q": "Tokyo cooking class"
  },
  "search_information": {
    "query_displayed": "Experiences near Tokyo Cooking Class – Sushi Making & Sake Tasting Experience",
    "results": "Explore 834 experiences in Taito City",
    "time_period": "Anytime",
    "guests": "Add guests"
  },
  "experiences": [
    {
      "position": 1,
      "id": "4613909",
      "title": "Experience Tokyo's Car Culture in Iconic Jdm Cars",
      "rating": 4.87,
      "reviews": 1508,
      "duration": "3h",
      "category": "Cultural tours",
      "price": { "price": "$146", "extracted_price": 146.0, "qualifier": "/ guest" },
      "link": "https://www.airbnb.com/experiences/4613909"
    },
    {
      "position": 2,
      "id": "121104",
      "title": "Explore Tokyo by go-kart（Driving Documents Needed）",
      "rating": 4.81,
      "reviews": 631,
      "duration": "2h",
      "category": "Outdoors",
      "price": { "price": "$81", "extracted_price": 81.0, "qualifier": "/ guest" },
      "link": "https://www.airbnb.com/experiences/121104"
    },
    {
      "position": 3,
      "id": "6580805",
      "title": "Chopstick Making Workshop with Artisan",
      "rating": 4.87,
      "reviews": 163,
      "duration": "1h",
      "category": "Art workshops",
      "price": { "price": "$5", "extracted_price": 5.0, "qualifier": "/ guest" },
      "link": "https://www.airbnb.com/experiences/6580805"
    },
    {
      "position": 4,
      "id": "6957667",
      "title": "Take home a piece of your trip and Japanese history with a vintage coin ring",
      "rating": 4.91,
      "reviews": 32,
      "duration": "1h",
      "category": "Art workshops",
      "price": { "price": "$48", "extracted_price": 48.0, "qualifier": "/ guest" },
      "link": "https://www.airbnb.com/experiences/6957667"
    },
    {
      "position": 5,
      "id": "600596",
      "title": "Unlimited Local Night《ALL-Y-Can-DRINK》Shinjuku Gem",
      "rating": 4.98,
      "reviews": 1922,
      "duration": "3h 15m",
      "category": "Food tours",
      "price": { "price": "$103", "extracted_price": 103.0, "qualifier": "/ guest" },
      "link": "https://www.airbnb.com/experiences/600596"
    },
    {
      "position": 6,
      "id": "6980446",
      "title": "Tokyo go kart tour ride through Shibuya, Shinjuku",
      "rating": 4.38,
      "reviews": 16,
      "duration": "1h 15m",
      "category": "Outdoors",
      "price": { "price": "$70", "extracted_price": 70.0, "qualifier": "/ guest", "original_price": "$93" },
      "link": "https://www.airbnb.com/experiences/6980446"
    }
  ]
}
```

---

## 2. 體驗詳情 — `airbnb_experience_details`

**請求**

```
GET https://www.searchapi.io/api/v1/search
engine=airbnb_experience_details
experience_id=600596
currency=USD
```

**回傳值**

```json
{
  "search_parameters": {
    "engine": "airbnb_experience_details",
    "airbnb_domain": "airbnb.com",
    "experience_id": "600596"
  },
  "experience": {
    "id": "600596",
    "title": "Unlimited Local Night《ALL-Y-Can-DRINK》Shinjuku Gem",
    "category": "Food tours",
    "rating": 4.98,
    "reviews": 1922,
    "location": {
      "display_label": "Shinjuku City, Tokyo"
    },
    "price": {
      "price_label": "From $103, per guest",
      "price": "$103",
      "extracted_price": 103.0,
      "qualifier": "/ guest"
    },
    "link": "https://www.airbnb.com/experiences/600596",
    "next_available_start_at_utc": "2026-06-24T10:15:00.000Z",
    "availability": [
      {
        "day": "Tomorrow, June 24",
        "duration": "7:15 – 10:30 PM",
        "start_time": "7:15 PM",
        "availability_description": "6 spots available",
        "is_available": true,
        "remaining_capacity": 6,
        "maximum_capacity": 10
      },
      {
        "day": "Thursday, June 25",
        "duration": "7:15 – 10:30 PM",
        "start_time": "7:15 PM",
        "availability_description": "10 spots available",
        "is_available": true,
        "remaining_capacity": 10,
        "maximum_capacity": 10
      },
      {
        "day": "Friday, June 26",
        "duration": "7:15 – 10:30 PM",
        "start_time": "7:15 PM",
        "availability_description": "1 spot left",
        "is_available": true,
        "remaining_capacity": 1,
        "maximum_capacity": 10
      }
    ]
  },
  "host": {
    "name": "Koki Suemi"
  },
  "reviews": [
    {
      "user": { "name": "Edward" },
      "rating": 5,
      "text": "Maaya was an exceptional host. Given that it was a Monday, this usually large group became a very intimate experience wi..."
    },
    {
      "user": { "name": "Charles" },
      "rating": 5,
      "text": "Thank you to our wonderful host Reina, who showed us around the Shinjuku nightlife, including a couple of izakayas that ..."
    }
  ],
  "similar_experiences": [
    {
      "title": "Explore Tokyo's music scene with an insider",
      "price": "From $59, per guest",
      "extracted_price": 59.0
    },
    {
      "title": "Experience Tokyo's Car Culture in Iconic Jdm Cars",
      "price": "From $146, per guest",
      "extracted_price": 146.0
    },
    {
      "title": "Chopstick Making Workshop with Artisan",
      "price": "From $5, per guest",
      "extracted_price": 5.0
    }
  ]
}
```
