Travel Diary Platform Backend Assignment
------------
This repository contains the backend API for a Travel Diary Platform. 
The API is built using Node.js and Express.js and uses SQLite as the database system.

Features
User registration: Allows users to register with their email and password. User login: Enables users to login with their registered credentials. 
Profile management: Users can update their profile information. 
Travel diary entry management: Users can create, read, update, and delete their travel diary entries. 
JWT authentication: Secure access to API endpoints using JSON Web Tokens.

Setup
Install dependencies by running "npm install". 
Start the server with "node app.js".

API Endpoints
POST /register: Register a new user. 
Request body : json { "email": "example@gmail.com", "password": "password" }

POST /login: Log in with existing user credentials. 
Request body : json { "email": "example@gmail.com", "password": "password" }

PUT /login/:emailId : To Update the profile details.
Request body : json { "email" : "example@gmail.com", "password":"password"}

DELETE /login/:emailId : Delete the user profile details from specific travek diary entry  (require authentication).


POST /travel : Add a new travel diary entry (requires authentication). 
Request body: json { "title": "Trip to Paris", "description": "Visited Eiffel Tower", "date": "2024-04-10", "location": "Paris, France" }

GET /travel : Get all travel diary entries for the authenticated user.

GET /travel/:travelId : Get specific travel diary entry for the authenticated user.

PUT /travel/:travelId : Update a specific travel diary entry (requires authentication). 
Request body: json { "title": "Updated Title", "description": "Updated Description", "date": "2024-04-10", "location": "Paris, France" }

DELETE /travel/:travelId : Delete a specific travel diary entry (requires authentication).

Authentication
Authentication is done using JWT (JSON Web Tokens). 
After successful login, a JWT token is generated and sent in the response. 
This token should be included in the Authorization header of subsequent requests to authenticated endpoints.

