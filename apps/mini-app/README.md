# Mini App

## Setup

### Developer Portal

1. Go to [Developer Portal](https://developer.worldcoin.org/)
2. Create new mini app and API key

### Project

1. Run `pnpm install`
2. Run `pnpm dev`
3. Install [ngrok](https://ngrok.com/)
4. Run `ngrok http http://localhost:3000` and copy the ngrok url
5. Copy `.env.example` to `.env` and fill in the values
6. Go back to the [Developer Portal](https://developer.worldcoin.org/) and paste the ngrok url into the `App URL` field

### Add mini app to World app

1. Open World app on your phone
2. Go to settings and click the version number 7 times
3. Accept the modal that appears, you are now in developer mode
4. Click on Developer Options and enter your app_id and api_key from the [Developer Portal](https://developer.worldcoin.org/)
5. You should get a success modal that the mini app was loaded successfully
6. On the main page of the World app, you should see your mini app