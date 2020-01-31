# FitScribe Server 

## [Live Link](https://matt9663-fitscribe-app.now.sh/)

This repo contains all the files for the server of my Fitscribe app. FitScribe is designed to be an easy-to-use platform for users to build and plan workout routines. This Node/Express server connects to a PostgreSQL database that stores basic user info, lists of exercies, lists of workout routines, and weekly plan objects. The client side was constructed using React. [Client repo](https://github.com/matt9663/fitscribe-app)

## API
The base URL for the API is `https://quiet-woodland-91461.herokuapp.com/`

## Open Endpoints 
* ### **Login**: 
`POST /api/login`
  
  Example request: 
  ```json
    {
    "user_name": [valid-user-name],
    "password": [matching-password]
    }
  ```

* ### **Create Account**: 
`POST /api/users`

Example request: 
  ```json
  {
  "user_name": [valid-user-name],
  "email_address": [valid-email-address],
  "password": [must be greater than 8 characters, contain upper, lower case, number, symbol]
  }
  ```
* ### **Exercises**: 
`GET /api/exercises`
  Example response:
  ```json
  {
  "id": 1,
  "liftName": "Barbell Bench Press",
  "muscle_group": "Chest"
  }
  ```

## Protected Endpoints
Protected endpoints require a valid JWT token in the request header. One can be acquired through the Login endpoint above.

* ### **Workouts**: 
  `GET /api/workouts`
    
    Example response: 
    ```json
    {
        "id": 1,
        "author_id": 1,
        "title": "test-workout-1",
        "exercises": [
          { "liftName": "Barbell bench press", weight: "155", "reps": 8, "sets": 4, "order": 1 },
          { "liftName": "Cable chest flys", "weight": "20", "reps": 15, "sets": 4, "order": 2 }
        ]
    }
    ```

    `POST /api/workouts`

  Example request:
  ```json
    {
        "title": "test-workout-1",
        "exercises": [
          { "liftName": "Barbell bench press", weight: "155", "reps": 8, "sets": 4, "order": 1 },
          { "liftName": "Cable chest flys", "weight": "20", "reps": 15, "sets": 4, "order": 2 }
        ]
    }
  ```

* ### **Exercises**
  `POST /api/exercises`

  Example request:
  ```json
    {
    "liftName": "Barbell Bench Press",
    "muscle_group": "Chest"
    }
    ```
* ### **Weeks**

  `GET /api/weeks`

  Example response (pulls user_id to match from auth header):

  ```json
  {
    "id": 1,
    "user_id": 1,
    "sunday_workout": 1,
    "sunday_status": true,
    "monday_workout": 2,
    "monday_status": true,
    "tuesday_workout": 3,
    "tuesday_status": false,
    "wednesday_workout": 0,
    "wednesday_status": false,
    "thursday_workout": 1,
    "thursday_status": false,
    "friday_workout": 2,
    "friday_status": false,
    "saturday_workout": 3,
    "saturday_status": false
  }
  ```

  `PATCH /api/weeks/:week_id`

    Will update any field that is included in request body.
    Example request: 
    ```json
    {
      "tuesday_status": true,
      "friday_workout": 2
    }
    ```