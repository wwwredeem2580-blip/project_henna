import { google } from "googleapis"
import dotenv from "dotenv"
dotenv.config()

const oauth2ClientPayload: any = {
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUri: `${process.env.SERVER_URL}/auth/google/callback`,
}

const GoogleClient = new google.auth.OAuth2(oauth2ClientPayload)

google.options({ auth: GoogleClient })

export { GoogleClient }
