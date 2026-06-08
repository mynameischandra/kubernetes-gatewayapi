#!/usr/bin/env bash

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Hospital Ingress and Routing Validation (MediCenter) ===${NC}"

# 1. Retrieve Gateway IP address
echo -ne "${YELLOW}Fetching Hospital Gateway IP address...${NC}"
GATEWAY_IP=$(kubectl get gateway hospital-gateway -n hospital-system -o jsonpath='{.status.addresses[0].value}')
echo -e " ${GREEN}$GATEWAY_IP${NC}"

# 2. Extract Root CA Cert
echo -e "${YELLOW}Extracting Root CA certificate from secret 'medicenter-root-ca-secret'...${NC}"
kubectl get secret medicenter-root-ca-secret -n hospital-system -o jsonpath='{.data.ca\.crt}' | base64 -d > hospital-ca.crt
echo -e "${GREEN}Root CA saved to 'hospital-ca.crt'${NC}"

# 3. Test HTTP to HTTPS Redirect
echo -e "\n${YELLOW}Test 1: HTTP-to-HTTPS redirect on medicenter.local...${NC}"
REDIRECT_URL=$(curl -s -o /dev/null -w "%{redirect_url}" --resolve medicenter.local:80:$GATEWAY_IP http://medicenter.local)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --resolve medicenter.local:80:$GATEWAY_IP http://medicenter.local)

if [ "$HTTP_CODE" -eq 301 ] && [ "$REDIRECT_URL" == "https://medicenter.local/" ]; then
  echo -e "${GREEN}✓ Success: HTTP Redirect to $REDIRECT_URL (HTTP 301)${NC}"
else
  echo -e "${RED}✗ Failure: Got status $HTTP_CODE redirecting to '$REDIRECT_URL'${NC}"
fi

# 4. Test Frontend HTTPS with certificate validation
echo -e "\n${YELLOW}Test 2: Secure Patient Portal HTTPS Connection (medicenter.local)...${NC}"
FRONTEND_RESPONSE=$(curl -s --cacert hospital-ca.crt --resolve medicenter.local:443:$GATEWAY_IP https://medicenter.local)
if [[ "$FRONTEND_RESPONSE" == *"Clinical Care"* ]] && [[ "$FRONTEND_RESPONSE" == *"MediCenter"* ]]; then
  echo -e "${GREEN}✓ Success: Correctly reached Patient Portal via SSL!${NC}"
  echo "Response Summary: Title contains 'Clinical Care | MediCenter'"
else
  echo -e "${RED}✗ Failure: Could not reach frontend or certificate validation failed.${NC}"
fi

# 5. Test Auth and Dashboard Subdomains
echo -e "\n${YELLOW}Test 3: Patient Auth Subdomain (auth.medicenter.local)...${NC}"
AUTH_RESPONSE=$(curl -s --cacert hospital-ca.crt --resolve auth.medicenter.local:443:$GATEWAY_IP https://auth.medicenter.local)
if [[ "$AUTH_RESPONSE" == *"Patient Authentication"* ]] && [[ "$AUTH_RESPONSE" == *"MediCenter"* ]]; then
  echo -e "${GREEN}✓ Success: Reached Patient Authentication Service via SSL!${NC}"
  echo "Response Summary: Title is 'Patient Authentication | MediCenter'"
else
  echo -e "${RED}✗ Failure: Could not reach auth service.${NC}"
fi

echo -e "\n${YELLOW}Test 4: Clinical Dashboard Subdomain (dashboard.medicenter.local)...${NC}"
DASHBOARD_RESPONSE=$(curl -s --cacert hospital-ca.crt --resolve dashboard.medicenter.local:443:$GATEWAY_IP https://dashboard.medicenter.local)
if [[ "$DASHBOARD_RESPONSE" == *"Clinical Dashboard"* ]] && [[ "$DASHBOARD_RESPONSE" == *"MediCenter"* ]]; then
  echo -e "${GREEN}✓ Success: Reached Clinical Dashboard Service via SSL!${NC}"
  echo "Response Summary: Title is 'Clinical Dashboard | MediCenter'"
else
  echo -e "${RED}✗ Failure: Could not reach dashboard.${NC}"
fi

# 6. Test Canary Routing to API Subdomain
echo -e "\n${YELLOW}Test 5: Canary EHR API Routing without Header (Should split ~90% V1, ~10% V2)...${NC}"
V1_COUNT=0
V2_COUNT=0
TOTAL_REQUESTS=20

for ((i=1; i<=TOTAL_REQUESTS; i++)); do
  API_RESPONSE=$(curl -s --cacert hospital-ca.crt --resolve api.medicenter.local:443:$GATEWAY_IP https://api.medicenter.local)
  if [[ "$API_RESPONSE" == *"2.0.0-canary"* ]]; then
    V2_COUNT=$((V2_COUNT + 1))
  elif [[ "$API_RESPONSE" == *"1.0.0"* ]]; then
    V1_COUNT=$((V1_COUNT + 1))
  fi
done

echo -e "Ran $TOTAL_REQUESTS requests:"
echo -e "  - V1 (medicenter-api v1.0.0): ${GREEN}$V1_COUNT${NC} times"
echo -e "  - V2 (medicenter-api v2.0.0-canary): ${GREEN}$V2_COUNT${NC} times"

# 7. Test Forced Canary Header Routing
echo -e "\n${YELLOW}Test 6: Forced Canary Routing via Header 'X-MediCenter-Canary: true'...${NC}"
CANARY_HEADER_RESPONSE=$(curl -s -H "X-MediCenter-Canary: true" --cacert hospital-ca.crt --resolve api.medicenter.local:443:$GATEWAY_IP https://api.medicenter.local)

if [[ "$CANARY_HEADER_RESPONSE" == *"2.0.0-canary"* ]]; then
  echo -e "${GREEN}✓ Success: Header-based routing successfully bypassed weights and reached Canary (V2)!${NC}"
  echo "Response: $CANARY_HEADER_RESPONSE"
else
  echo -e "${RED}✗ Failure: Header routing did not direct traffic to V2.${NC}"
fi

echo -e "\n${BLUE}=== Verification Finished ===${NC}"
chmod +x test-hospital-ingress.sh || true
