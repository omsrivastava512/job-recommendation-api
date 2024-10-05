# Job Recommendation API

## Overview
This project is an API service for recommending relevant job postings to users based on their profiles, including skills, experience, and preferences. The backend is developed using Node.js and Express, and it interacts with a MongoDB to store job postings.

---

## Features
- **POST /api/recommendations**: Takes user profile data and returns a list of job recommendations.
- **Database Support**: MongoDB is used to store job postings. 
- **Matching Algorithm**: Matches jobs based on skill sets, experience levels, preferred job locations, and job types.
- **Error Handling**: Ensures the API is robust and handles various invalid inputs gracefully.
- **Dummy Profile as query**: Users can send their profiles as body using Postman or simple, see the results using a dummy profile 

---

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Steps
1. Clone the repository:
```bash
git clone https://github.com/your-repo/job-recommendation-api.git
```

2. Navigate to the project directory:
```bash
cd job-recommendation-api
```

3. Install dependencies:
```bash
npm install
```

4. Start the server:
```bash
npm start
```

5. Use Postman to send post request (along with user profile in the request body) over these links
```bash
http://localhost:3000/api/recommendations
http://localhost:3000/api/recommendations?relocate=true
http://localhost:3000/api/recommendations?dummyuser=true
```

---

## Recommendation Algorithm
The algorithm is based on a simple weighted scoring where each job is given a score based on the user's profile.

1. **Scoring Jobs** 
Jobs are assigned scores based on skill overlap, experience match, and location match.
A weighted formula is used to compute the score for each job:
```scss
Job Score = (0.5 * Skills Match) + (0.3 * Experience Match) + (0.2 * Job Role Match) + (0.2 * Job Type Match) + (0.3 * Location Match)
```

2. **Relocation Preference**
Relocation preference of the user can be sent through the `?relocate` query. When selected `true`, the algorithm sends jobs beyond user's location preferences.

3. **Mandator Skills Match** 
User must have at least one matching skill to get the job recommendation.


### Assumptions & Design Decisions
- **Skills are Key**: The most critical factor in job recommendations is the skill match. Users will only see jobs with _at least one_ skill match. 
- **Flexibility**: The scores conclude a holistic match based on variable weightage that provides the user to explore job beyond preferences. 
- **Location**: Exact matches on location are enforced during the filtering phase based on the user's willingness to relocate. The property is selected `false` by default
- **Sorting**: The jobs are sorted based on their matching score with the top matches on the top. Jobs with zero score are filtered out.

### Challenges
- The assignment was very simple and I kept on writing the code without getting stuck at any specific issue. However, the algorithm took a bit of time to decide the ideal weightage for each property.
- The error handling and debugging also took lots of thoughts and testing.