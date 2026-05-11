import vault from "node-vault"

const vaultClient = vault({
  apiVersion: "v1",
  endpoint: 'http://localhost:8210'
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