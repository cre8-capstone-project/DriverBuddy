# DriveBuddy (Mobile App)

DriveBuddy is AI-powered app with fatigue detection and real-time alerts to keep you safe on the road. It was built as the capstone project for Langara College's Web & Mobile App Design and Development program.

**Developers:**
- [Vin](https://github.com/vinsouza99) (Development Lead and Full-Stack Developer)
- [Cocoy Suguitan](https://github.com/cocoysg) (Project Manager and Full-Stack Developer)
- [Yosuke Hanaoka](https://github.com/yoshan0921) (Full-Stack Developer)
- [Teru Mori](https://github.com/terumori1206) (Full-Stack Developer)

## Problem
Drowsy driving is a serious safety risk, contributing to 21% of vehicular accidents in Canada, resulting in about 2,100 serious injuries and 400 fatalities annually. Fatigue slows reaction times, impairs focus, and affects judgment, making it one of the top three causes of collisions in the country. For industries requiring long driving hours, such as long-haul trucking and ride-share services, this risk is even greater

## Solution
DriveBuddy is an AI-powered mobile app designed to help drivers stay safe by detecting early signs of drowsiness. Face and eye monitoring technology tracks signs like frequent blinking or closed eyes. Instant sound and voice alerts notify drivers when signs of fatigue are detected. Nearby rest stop suggestions encourage timely breaks to recharge. Administrator Dashboard provides real-time insights into driver safety, alerting companies to potential risks before they become incidents.

## Main Features
1. **Face and Eye Monitoring & Alert**
DriveBuddy uses AI and machine learning to monitor a driver’s face and eyes in real-time to detect signs of drowsiness such as eyes closed for extended periods, or frequent blinking which are natural responses of drowsiness. Once signs of drowsiness are detected, the app delivers sound and voice alerts, which help drivers stay awake
2. **GPS Navigator & Nearby Rest Stop Suggestions**
   DriveBuddy displays the driver’s current location on the map, and suggests the best route to reach their destination efficiently, ensuring they stay on track and avoid unnecessary detours. 
3. **Administrator Dashboard**
  DriveBuddy provides an admin website that allows companies to monitor their drivers’ safety and well-being, providing insights such as drowsiness alerts to help identify potential safety risks before they escalate.

## System Architecture
Our system consists of a mobile app and a [web platform](https://github.com/cre8-capstone-project/DriveBuddyWeb) designed to ensure real-time drowsiness detection and provide actionable insights. The mobile app, built with React Native and Expo, uses the Google Maps API for navigation and Google ML Kit for real-time drowsiness detection.
![image](https://github.com/user-attachments/assets/ff726691-2ad3-46a7-a74b-0435d7aa69b0)

## Data Models
DriveBuddy uses two databases: Firebase’s Firestore and the device’s local storage with SQLite. The data generated during the drowsiness detection session is stored first in the local database to decrease the number of API requests and prevent data loss in areas with limited internet connection. When the detection session is finished, our app moves the data in the local tables to Firestore and empties them to avoid taking too much space in the device’s storage.
![image](https://github.com/user-attachments/assets/fac1fc33-d792-4043-bb6a-705c6e1310b4)

