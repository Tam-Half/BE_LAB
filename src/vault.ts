import vault from "node-vault"
import * as dotenv from "dotenv"

dotenv.config()

const vaultClient = vault({
  apiVersion: "v1",
  endpoint:  process.env.VAULT_ADDR
})

export async function getDatabaseCredentials() {

  // login AppRole
  const login = await vaultClient.approleLogin({
    role_id: process.env.VAULT_ROLE_ID,
    secret_id: process.env.VAULT_SECRET_ID
  })

  console.log(`Token export:` ,login.auth.client_token)

  vaultClient.token = login.auth.client_token


  // get dynamic credential
  const creds = await vaultClient.read("database/creds/pgadmin-role")

  return {
    username: creds.data.username,
    password: creds.data.password
  }
}