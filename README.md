### How auth works
we use [clerk](https://clerk.com) for auth, however since we already also use it in the [gdg-q](https://gdg-q.com) site we simply redirect signin/signup to there
this requires both sites to be on the same root domain (in this case [gdg-q.com](https://gdg-q.com)) 
and to use the same keys in the .env for both sites.

### Push Notifications
We use [OneSignal](https://onesignal.com) for web push notifications via the official `react-onesignal` library.
- **App ID**: `40436e0d-647a-4d57-8c3a-d4f71c4cdc54`
- **Service Worker**: Located at `/public/OneSignalSDKWorker.js` (must not be moved)

# Local dev
## .env
### clerk
theese need to be the same as the ones used in the main app
* NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
* CLERK_SECRET_KEY
### redirect site
since signin/signup are redirected this is where you set to what site to redirect them
by default it will point to [account.gdg-q.com]
* NEXT_PUBLIC_MAIN_APP_URL=http://localhost:3001