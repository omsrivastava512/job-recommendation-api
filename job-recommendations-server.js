const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());



/** MongoDB Schema and Connection */
mongoose.connect(
  "mongodb+srv://omsrivastava512:tg4phRVnj92IbQoB@cluster0.n4jhkac.mongodb.net/user_app"
);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skills: { type: [String], required: true },
  experience_level: { type: String, required: true },
  preferences: {
    desired_roles: [String],
    locations: [String],
    job_type: String,
  },
});

const JobSchema = new mongoose.Schema({
  job_title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  job_type: { type: String, required: true },
  required_skills: { type: [String], required: true },
  experience_level: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);
const Job = mongoose.model("Job", JobSchema);
/** */

/** Routing */
app.post("/api/recommendations", async (req, res) => {
  try {
    const dummyUser = {
        name: "John Doe",
        skills: ["JavaScript", "Node.js", "React"],
        experience_level: "Intermediate",
        preferences: {
          desired_roles: ["Software Engineer", "Full Stack Developer"],
          locations: ["San Francisco", "Remote"],
          job_type: "Full-Time"
        }
      }  ;      
    
    // const userProfile = validateUserProfile(dummyUser);
    const userProfile =(req.query?.dummyuser == "false") ? validateUserProfile(req.body): dummyUser;
    
    const canRelocate = req.query?.relocate == "true" ?? false ; // If user willing to relocate

    const recommendations = await getRecommendations(userProfile, canRelocate);
    res.json(recommendations);

  } catch (error) {
    console.error("Error in /api/recommendations:", error);
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({
          error: "Invalid user profile data",
          errorMessages: error.messages,
        });
    } else {
      res
        .status(500)
        .json({ error: "An error occurred while fetching recommendations" });
    }
  }
});

app.use((req, res) => {
  res.status(404).send(`
    <h1>404 Not Found</h1>
    <p>You seem to have lost your way. Please check the URL and try again.</p>
  `);
});

/** Job Recommendation Logic */
async function getRecommendations(userProfile, canRelocate) {
  console.log("Finding Jobs for " + userProfile.name);
  const jobs = await Job.find();

  let scoredJobs = jobs.map((job) => ({
    job,
    score: calculateJobScore(userProfile, job),
  }));

  if (!canRelocate)
    scoredJobs = scoredJobs.filter(({ job }) =>
      userProfile.preferences.locations.includes(job.location)
    );

  scoredJobs = scoredJobs.filter(({ score }) => score); // filtering for score is non-zero

  scoredJobs.sort((a, b) => b.score - a.score);
//   console.log(scoredJobs);

  return scoredJobs.map((sj) => sj.job);
}

function calculateJobScore(user, job) {
  let score = 0;

  // Skills match
  const skillsMatch = user.skills.filter((skill) =>
    job.required_skills.includes(skill)
  ).length;
  score = skillsMatch * 0.5

  // Experience level match
  if (user.experience_level === job.experience_level) {
    score += 0.3;
  }

  // Desired role match
  if (user.preferences.desired_roles.includes(job.job_title)) {
    score += 0.2;
  }

  // Job type match
  if (user.preferences.job_type === job.job_type) {
    score += 0.2;
  }

  // Location match
  if (user.preferences.locations.includes(job.location)) {
    score += 0.3;
  }

  // if no skills match, score = 0 
  return skillsMatch ? score : 0;
}
/** */

/** Error Handling */
function validateUserProfile(profile) {
  const errorMessages = [];
  if (
    !profile ||
    typeof profile !== "object" ||
    Object.keys(profile).length === 0
  ) {
    throw new ValidationError(["User profile is required"]);
  }

  // Ensure required fields are present
  const requiredFields = ["name", "skills", "experience_level", "preferences"];
  for (const field of requiredFields) {
    if (!(field in profile)) {
      errorMessages.push(`Missing required field: ${field}`);
    }
  }

  // Validate preferences
  const requiredPreferences = ["desired_roles", "locations", "job_type"];
  for (const pref of requiredPreferences) {
    if (!(pref in profile.preferences)) {
      errorMessages.push(`Missing required preference: ${pref}`);
    }
  }
  // Type Validation
  if (!Array.isArray(profile.skills))
    errorMessages.push("Skills must be an array");
  if (!Array.isArray(profile.preferences.desired_roles))
    errorMessages.push("Desired roles must be an array");
  if (!Array.isArray(profile.preferences.locations))
    errorMessages.push("Locations must be an array");

  if (errorMessages.length != 0) throw new ValidationError(errorMessages);

  return profile;
}

class ValidationError extends Error {
  constructor(messages) {
    super(messages);
    this.name = "ValidationError";
    this.messages = messages;
  }
}
/** */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
