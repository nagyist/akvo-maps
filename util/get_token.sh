#!/usr/bin/env bash

test -n "${2}" || {
  echo "Usage: $0 <email> <password>" >&2
  exit 1
}

ACCESS_TOKEN=$(curl -s \
		   -d "client_id=curl" \
		   -d "username=${1}" \
		   -d "password=${2}" \
		   -d "grant_type=password" \
		   "https://kc.akvotest.org/auth/realms/akvo/protocol/openid-connect/token" | \
		   jq .access_token | sed 's/"//g')

printf "%s\n" ${ACCESS_TOKEN}
