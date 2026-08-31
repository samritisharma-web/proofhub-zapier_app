#!/usr/bin/env bash
set -e

REDIRECT_URI="https://zapier.com/app/home?conversationId=11bfa3ee-79d6-4418-8fc7-f212b502f6ba"
STATE="manual-test-state-1"
ACCESS_TOKEN=$(grep -o '"access_token":"[^"]*"' token_response.json | cut -d'"' -f4)
CLIENT_ID="33760"
CLIENT_SECRET="8DtUKWctIx9q53UdeJxtXzWQzbOF6HYKqzFUM3jJ"

BASE_URL="https://app.indev2.proofhub.com/oauth/ss_zapier/public/"

# ============================================================
# 1. Generate PKCE
# ============================================================

CODE_VERIFIER=$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '=')

CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" \
    | openssl dgst -sha256 -binary \
    | openssl base64 \
    | tr '+/' '-_' \
    | tr -d '=')

echo "======================================"
echo "PKCE"
echo "======================================"
echo "code_verifier:  $CODE_VERIFIER"
echo "code_challenge: $CODE_CHALLENGE"
echo


# ============================================================
# 2. Start OAuth /connect-to-zapier
# ============================================================

echo "======================================"
echo "Step 2: GET /oauth/connect-to-zapier"
echo "======================================"

curl -s -i -G "$BASE_URL/zapier/oauth/connect-to-zapier" \
    --data-urlencode "redirect_uri=$REDIRECT_URI" \
    --data-urlencode "state=$STATE" \
    --data-urlencode "code_challenge=$CODE_CHALLENGE" \
    --data-urlencode "code_challenge_method=S256" \
    -c cookies.txt \
    | grep -i "^location:" || true

echo
echo "Open the Location URL in your browser."
echo
echo "Login to ProofHub."
echo "Grant permission."
echo "Select your workspace."
echo
echo "After allow(), you should be redirected to:"
echo "$REDIRECT_URI?code=...&state=..."
echo

read -p "Paste the authorization code here: " AUTH_CODE


# ============================================================
# 3. Exchange authorization code for tokens
# ============================================================

echo
echo "======================================"
echo "Step 3: POST /zapier/oauth/zapier/token-exchange"
echo "======================================"

curl -s -X POST \
    "$BASE_URL/zapier/oauth/token-exchange" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=authorization_code" \
    -d "code=$AUTH_CODE" \
    -d "code_verifier=$CODE_VERIFIER" \
    -d "redirect_uri=$REDIRECT_URI" \
    -d "client_id=$CLIENT_ID" \
    -d "client_secret=$CLIENT_SECRET" \
    | tee token_response.json

echo
echo

# ============================================================
# 4. Extract access token
# ============================================================

ACCESS_TOKEN=$(grep -o '"access_token":"[^"]*"' token_response.json \
    | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "ERROR: No access_token received."
    echo
    echo "Token response:"
    cat token_response.json
    exit 1
fi

echo "Access token received successfully."
echo "Token prefix: ${ACCESS_TOKEN:0:10}..."
echo


# ============================================================
# 5. ONLY TEST /me
# ============================================================

echo "======================================"
echo "Step 4: GET /me"
echo "======================================"

curl -i -s \
    -X GET \
    "$BASE_URL/zapier/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Accept: application/json"

echo
echo
echo "======================================"
echo "DONE"
echo "======================================"
echo "===== WORKSPACES SEARCH RESPONSE ====="

curl -s "https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search?type=workspaces" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | tee workspaces_response.json

echo
echo "===== END RESPONSE ====="
curl -s "https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search?type=projects&wsid=4598" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# curl -s -X POST "https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/action" \
#   -H "Authorization: Bearer $ACCESS_TOKEN" \
#   -H "Content-Type: application/x-www-form-urlencoded" \
#   -d "action=create_task" \
#   -d "wsid=4598" \
#   -d "project_id=PASTE_PROJECT_ID_HERE" \
#   -d "title=Test Task from Zapier" \
#   -d "description=This is a test description"

ACCESS_TOKEN=$(grep -o '"access_token":"[^"]*"' token_response.json | cut -d'"' -f4)

curl -s "https://app.indev2.proofhub.com/oauth/ss_zapier/public/zapier/search?type=subtask&wsid=4598&project_id=36290" \
  -H "Authorization: Bearer $ACCESS_TOKEN"