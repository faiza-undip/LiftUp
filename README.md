<p align="center">
    <img width="250"
        src="./docs/images/LiftUp_App Icon_Rounded.png"
        alt="Tawk React logo">
</p>
<h1 align="center">LiftUp</h1>

## Introduction
Hey, y'all, what's cooking? I would love to introduce you on the app I made as a final project for my fifth semester computer engineering undergraduate program's mobile device programming practicum, it's LiftUp.

LiftUp is definitely a passion project of mine, I had a lot of fun making this on a super short amount of time, and it's the kind of app I would actually use after this on a daily basis when I work out.

It's also, safe to say, heavily inspired by **Liftoff** (shout out to the dev teams). Liftoff itself has a lot of features, from leaderboard with your friends or the entire fitness community on the app, workout tracker (yes, the full routine), calorie tracking, goals, and heavy analytics and gamification. 

But from their whole features, I cherry-picked the features I definitely need the most, remove the features I don't really use often or at all, and put it all and compressed it on LiftUp, which is the lift ranking, the gamified animation aspect, and the lift history so you can see your progress every time you logged your training.

LiftUp is super straight-forward and easy to use, I did tweak some of the original Liftoff workflow so that it'll be more user-friendly. Check out the preview of the app below!

<p align="center">
    <img width="100%"
        src="./docs/images/app_screenshots.png"
        alt="Tawk React logo">
</p>

## Setup
That's all for the background, let's get on for the setup of this application if you're interested to run this on your own device.

### 1. Setup the backend
I heavily recommend you to deploy the API yourself, do use ```npm install && npm run build``` as the build code, and ```npm run start``` as the run code whether it's on Vercel or any other platform.

Remember to setup your environment variables (or use the .env if you are just running it locally). If you're running locally:

#### 1. Navigate to the backend folder
```
cd backend
```

#### 2. Install the packages
```
npm install
```

#### 3. Remember to setup your .env
I'm using Supabase for the backend.
```
PORT=4000
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

#### 4. Execute these SQL commands on your Supabase project database:
I used SQL because I needed it fast, usually I would use an ORM like Prisma for managing the tables and migrations and everything.
##### 1. Create the tables

```
-- 1) Profiles (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  gender text not null,
  birth_date date not null,
  height_cm integer not null,
  weight_kg numeric(5,2) not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2) Exercises
create table if not exists exercises (
  id bigserial primary key,
  name text not null unique,
  category text,              -- e.g. "compound", "bodyweight"
  is_bodyweight boolean default false,
  is_default boolean default false
);

insert into exercises (name, category, is_bodyweight, is_default) values
  ('Pull Ups', 'compound', true, true),
  ('Push Ups', 'compound', true, true),
  ('Bench Press', 'compound', false, true),
  ('Squat', 'compound', false, true),
  ('Deadlift', 'compound', false, true)
on conflict (name) do nothing;

-- 3) Ranks master table
create table if not exists ranks (
  key text primary key,          -- e.g. 'OLYMPIAN', 'TITAN_III'
  label text not null,           -- 'Olympian', 'Titan III', etc.
  group_name text not null,      -- Titan, Champion, etc.
  tier integer not null,         -- 1,2,3
  icon_type text not null,       -- 'diamond' | 'gold' | 'wood'
  color_hex text not null,
  sort_order integer not null    -- 1 = highest
);

insert into ranks (key, label, group_name, tier, icon_type, color_hex, sort_order) values
  ('OLYMPIAN', 'Olympian', 'Olympian', 1, 'diamond', '#5DD9E8', 1),
  ('TITAN_III', 'Titan III', 'Titan', 3, 'diamond', '#E63946', 2),
  ('TITAN_II', 'Titan II', 'Titan', 2, 'diamond', '#E63946', 3),
  ('TITAN_I', 'Titan I', 'Titan', 1, 'diamond', '#E63946', 4),
  ('CHAMPION_III', 'Champion III', 'Champion', 3, 'diamond', '#C77DFF', 5),
  ('CHAMPION_II', 'Champion II', 'Champion', 2, 'diamond', '#C77DFF', 6),
  ('CHAMPION_I', 'Champion I', 'Champion', 1, 'diamond', '#C77DFF', 7),
  ('DIAMOND_III', 'Diamond III', 'Diamond', 3, 'diamond', '#7B9FE8', 8),
  ('DIAMOND_II', 'Diamond II', 'Diamond', 2, 'diamond', '#7B9FE8', 9),
  ('DIAMOND_I', 'Diamond I', 'Diamond', 1, 'diamond', '#7B9FE8', 10),
  ('PLATINUM_III', 'Platinum III', 'Platinum', 3, 'diamond', '#4ECDC4', 11),
  ('PLATINUM_II', 'Platinum II', 'Platinum', 2, 'diamond', '#4ECDC4', 12),
  ('PLATINUM_I', 'Platinum I', 'Platinum', 1, 'diamond', '#4ECDC4', 13),
  ('GOLD_III', 'Gold III', 'Gold', 3, 'gold', '#F4C430', 14),
  ('GOLD_II', 'Gold II', 'Gold', 2, 'gold', '#F4C430', 15),
  ('GOLD_I', 'Gold I', 'Gold', 1, 'gold', '#F4C430', 16),
  ('SILVER_III', 'Silver III', 'Silver', 3, 'diamond', '#C0D6DF', 17),
  ('SILVER_II', 'Silver II', 'Silver', 2, 'diamond', '#C0D6DF', 18),
  ('SILVER_I', 'Silver I', 'Silver', 1, 'diamond', '#C0D6DF', 19),
  ('BRONZE_III', 'Bronze III', 'Bronze', 3, 'diamond', '#CD9575', 20),
  ('BRONZE_II', 'Bronze II', 'Bronze', 2, 'diamond', '#CD9575', 21),
  ('BRONZE_I', 'Bronze I', 'Bronze', 1, 'diamond', '#CD9575', 22),
  ('WOOD_III', 'Wood III', 'Wood', 3, 'wood', '#CD9575', 23),
  ('WOOD_II', 'Wood II', 'Wood', 2, 'wood', '#CD9575', 24),
  ('WOOD_I', 'Wood I', 'Wood', 1, 'wood', '#CD9575', 25);

-- 4) Exercise rankings (each entry = one history point)
create table if not exists exercise_rankings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id bigint not null references exercises(id),
  rank_key text not null references ranks(key),
  weight_kg numeric(6,2) not null,
  reps integer not null,
  estimated_1rm numeric(6,2) not null,
  created_at timestamptz default now()
);

create index on exercise_rankings (user_id, created_at desc);

```

##### 2. Create new bodyweight exercises (you can skip this if you want)
```
insert into exercises (name, category, is_bodyweight, is_default) values
  ('Chin Ups', 'compound', true, false),
  ('Neutral Grip Pull Ups', 'compound', true, false),
  ('Diamond Push Ups', 'isolation', true, false),
  ('Wide Push Ups', 'compound', true, false),
  ('Decline Push Ups', 'compound', true, false),
  ('Pike Push Ups', 'compound', true, false),
  ('Handstand Push Ups', 'compound', true, false),
  ('Bodyweight Squats', 'compound', true, false),
  ('Jump Squats', 'plyometric', true, false),
  ('Walking Lunges', 'compound', true, false),
  ('Bulgarian Split Squats (BW)', 'compound', true, false),
  ('Glute Bridge', 'compound', true, false),
  ('Single-Leg Glute Bridge', 'isolation', true, false),
  ('Calf Raises (BW)', 'isolation', true, false),
  ('Wall Sit', 'isometric', true, false),
  ('Plank', 'core', true, false),
  ('Side Plank', 'core', true, false),
  ('Hanging Leg Raises', 'core', true, false),
  ('Lying Leg Raises', 'core', true, false),
  ('Mountain Climbers', 'cardio', true, false),
  ('Burpees', 'plyometric', true, false),
  ('Bear Crawl', 'compound', true, false),
  ('Dips (Bodyweight)', 'compound', true, false)
on conflict (name) do nothing;

```
##### 3. Add new weighted exercies (completely optional)
```
insert into exercises (name, category, is_bodyweight, is_default) values
  ('Overhead Press', 'compound', false, false),
  ('Incline Bench Press', 'compound', false, false),
  ('Decline Bench Press', 'compound', false, false),
  ('Dumbbell Bench Press', 'compound', false, false),
  ('Chest Fly', 'isolation', false, false),

  ('Barbell Rows', 'compound', false, false),
  ('Dumbbell Rows', 'compound', false, false),
  ('Lat Pulldown', 'compound', false, false),
  ('Cable Rows', 'compound', false, false),
  ('Face Pulls', 'isolation', false, false),

  ('Goblet Squat', 'compound', false, false),
  ('Front Squat', 'compound', false, false),
  ('Romanian Deadlift', 'compound', false, false),
  ('Sumo Deadlift', 'compound', false, false),
  ('Hip Thrusts', 'compound', false, false),
  ('Leg Press', 'compound', false, false),
  ('Leg Curl', 'isolation', false, false),
  ('Leg Extension', 'isolation', false, false),
  ('Standing Calf Raises', 'isolation', false, false),
  ('Seated Calf Raises', 'isolation', false, false),

  ('Dumbbell Lateral Raise', 'isolation', false, false),
  ('Rear Delt Fly', 'isolation', false, false),
  ('Front Raise', 'isolation', false, false),

  ('Bicep Curl', 'isolation', false, false),
  ('Hammer Curl', 'isolation', false, false),
  ('Preacher Curl', 'isolation', false, false),

  ('Triceps Pushdown', 'isolation', false, false),
  ('Skullcrushers', 'isolation', false, false),
  ('Overhead Triceps Extension', 'isolation', false, false),

  ('Weighted Sit Ups', 'core', false, false),
  ('Cable Crunches', 'core', false, false),
  ('Russian Twists (Weighted)', 'core', false, false)
on conflict (name) do nothing;

```

##### 4. Add new functional exercies (also optional)
```
insert into exercises (name, category, is_bodyweight, is_default) values
  ('Farmer''s Carry', 'functional', false, false),
  ('Sled Push', 'functional', false, false),
  ('Sled Pull', 'functional', false, false),
  ('Kettlebell Swings', 'power', false, false),
  ('Box Jumps', 'plyometric', true, false),
  ('Battle Ropes', 'conditioning', false, false),
  ('Tire Flips', 'power', false, false)
on conflict (name) do nothing;

```
##### 5. Then add a new column on exercise_rankings
Yes, it's because I realized I needed this halfway when coding the backend. 
```
ALTER TABLE exercise_rankings 
ADD COLUMN normalized_score DECIMAL(10, 2);
```

#### 5. Build the server
```
npm run build
```

#### 6. Then, run the server
```
npm run start
```

It will then show like this, if you have followed all the steps when the server is successfully running:
```
> start
> node dist/index.js
LiftUp backend running on port 4000
```

### 2. Run the app with Expo
I heavily recommend you to build it first as a legit application on Android if you really wanna use it day-to-day, but if you just wanna check it out, follow these steps:

#### 1. Navigate to the frontend's folder
```
cd frontend/liftup-app
```

#### 2. Setup the environment variables (.env)
```
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
EXPO_PUBLIC_API_URL=YOUR_API_URL
```

#### 3. Install the packages
```
npm install
```

#### 4. Then run it with Expo
```
npx expo start
```

## Download

Wanna skip the whole setup and just wanna try the application? I got you, you can download the APK here below.

<a href="./releases/liftup-v1.apk">
  <img src="https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android" alt="Download APK">
</a>

And that's it, thanks for stopping by and reading this documentation. Hopefully, I'll see you soon on my next git project

*- Faiza*

