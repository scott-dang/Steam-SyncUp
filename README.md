![Backend Status](https://github.com/scott-dang/Steam-SyncUp/actions/workflows/backend-ci.yml/badge.svg)
![Frontend Status](https://github.com/scott-dang/Steam-SyncUp/actions/workflows/frontend-ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/scott-dang/Steam-SyncUp/graph/badge.svg?token=JZ3V32WSWM)](https://codecov.io/gh/scott-dang/Steam-SyncUp)

# Steam-SyncUp
Steam SyncUp enables users to find and join a game community, tailored to their specific game. By linking their Steam account, users can discuss, chat, and meet new users through the chat room feature. Users will also be able to find new games to play, discuss and learn about new content relevant to the game, and find others to play games together with one another.


<img src="https://github.com/scott-dang/Steam-SyncUp/assets/51427024/224735b2-3610-459a-b81d-a38b9aa6607a" width="49%" height="50%"/>
<span> </span>
<img src="https://github.com/scott-dang/Steam-SyncUp/assets/51427024/94f2d460-ff8e-4618-a58d-2874d422c27d" width="49%" height="50%"/>

## Requirements
A modern web browser with stable internet connection is needed along with a Steam account that has _game details_ set to public.

## Current functionality

- Login with Steam (Must have public accout)
- See account's games
- See logged in account's details in settings
- Create lobbies
- Send messages (currently just one messaging channel. More to come when more lobby management is integrated with frontend)
- Logout

## Local Installation

To install a local instance of Steam-SyncUp, refer to the frontend directory's [README](frontend/README.md) for further instructions.

## Structure & Technologies
![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Steam](https://img.shields.io/badge/steam-%23000000.svg?style=for-the-badge&logo=steam&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

This project is divided into a frontend folder that is hosted on Amplify and a backend folder that will contain the code for our Lambda Functions as part of our serverless approach.

Inside the **frontend** folder, it contains everything frontend related from all the React components, to hooks, frontend testing, and the CSS.
By itself, a person should be able to spin up a local version of our web app.<br> Refer to the frontend directory's [README](frontend/README.md) for more details.

Inside the **backend** folder, it contains all backend code that run on our Lambda Functions as part of our serverless architecture.<br>
Refer to the backend directory's [README](backend/README.md) for more details.

## Configuration
<img src="https://github.com/scott-dang/Steam-SyncUp/assets/51427024/d33e0a1d-a27f-416f-9c64-1f5426a19f0c" height="15%" width="15%" />
No configuration needed - duck

## Maintainers
[Scott D.](https://github.com/scott-dang)    [Donavan D.](https://github.com/ddoan-cs)   [Eric H.](https://github.com/EricHoelscher)   [Eric L.](https://github.com/Erik9113)   [Alan L.](https://github.com/Alananlan)
