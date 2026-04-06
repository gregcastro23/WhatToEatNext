import requests
import sys
import json

# User provided API Key
API_KEY = "napi_g4072vfz4jxwd6csbho4qui6okjsm5u1wv01oz0t1hk9mt7mxg7xg2g3kiakq7ca"
BASE_URL = "https://console.neon.tech/api/v2"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def log(msg):
    print(f"[*] {msg}")

def solve():
    log("Starting Neon API Exploration...")
    
    # 1. Get User Profile
    log("Fetching user profile...")
    user_resp = requests.get(f"{BASE_URL}/users/me", headers=headers)
    if user_resp.status_code != 200:
        log(f"Failed to fetch user profile: {user_resp.text}")
        return
    
    user_data = user_resp.json()
    user_id = user_data.get("id")
    log(f"Authenticated as: {user_data.get('email')} (ID: {user_id})")

    # 2. Keycloak/Default Org check - Often personal projects use the user ID or a default org
    # Let's try to list projects directly first
    log("Listing projects...")
    projects_resp = requests.get(f"{BASE_URL}/projects", headers=headers)
    
    # If it fails with org_id required, we need to find the org_id
    if projects_resp.status_code != 200:
        log("Direct project list failed. Searching for organizations...")
        orgs_resp = requests.get(f"{BASE_URL}/organizations", headers=headers)
        if orgs_resp.status_code == 200:
            orgs = orgs_resp.json().get("organizations", [])
            log(f"Found {len(orgs)} organizations.")
            
            project_list = []
            for org in orgs:
                org_id = org["id"]
                log(f"Checking projects in Org: {org.get('name', 'Unknown')} ({org_id})")
                p_resp = requests.get(f"{BASE_URL}/projects", headers=headers, params={"org_id": org_id})
                if p_resp.status_code == 200:
                    project_list.extend(p_resp.json().get("projects", []))
            
            if not project_list:
                log("No projects found in any organization. Checking personal projects...")
                # Sometimes personal projects are listed under the user's ID as org_id
                p_resp = requests.get(f"{BASE_URL}/projects", headers=headers, params={"org_id": user_id})
                if p_resp.status_code == 200:
                    project_list = p_resp.json().get("projects", [])
        else:
            log(f"Failed to fetch organizations: {orgs_resp.text}")
            return
    else:
        project_list = projects_resp.json().get("projects", [])

    if not project_list:
        log("❌ No projects found.")
        return

    log(f"✅ Found {len(project_list)} project(s).")

    for project in project_list:
        p_id = project["id"]
        p_name = project.get("name")
        log(f"Analyzing Project: {p_name} ({p_id})")
        
        # 3. Get Branches
        branches_resp = requests.get(f"{BASE_URL}/projects/{p_id}/branches", headers=headers)
        if branches_resp.status_code != 200:
            log(f"Failed to fetch branches for {p_id}: {branches_resp.text}")
            continue
            
        branches = branches_resp.json().get("branches", [])
        for branch in branches:
            b_id = branch["id"]
            if branch.get("parent_id"): continue # Focus on main branch
            
            log(f"  Branch: {branch.get('name')} ({b_id})")
            
            # 4. Get Endpoints
            endpoints_resp = requests.get(f"{BASE_URL}/projects/{p_id}/endpoints", headers=headers, params={"branch_id": b_id})
            if endpoints_resp.status_code == 200:
                endpoints = endpoints_resp.json().get("endpoints", [])
                for ep in endpoints:
                    log(f"    Endpoint: {ep['id']} ({ep['host']})")
                    
                    # 5. Get Connection URI
                    # Requesting URI for neondb_owner and neondb
                    uri_url = f"{BASE_URL}/projects/{p_id}/branches/{b_id}/roles/neondb_owner/databases/neondb/connection_uri"
                    uri_resp = requests.get(uri_url, headers=headers)
                    if uri_resp.status_code == 200:
                        uri = uri_resp.json().get("connection_uri")
                        if uri:
                            # Use a more robust masking: postgresql://user:***@host/db
                            masked = uri.split('@')[0].split(':')
                            if len(masked) > 2:
                                masked_uri = f"{masked[0]}:{masked[1]}:***@{uri.split('@')[-1]}"
                                log(f"    ✅ MATCH FOUND: {masked_uri}")
                            else:
                                log(f"    ✅ MATCH FOUND: {uri}")
                            
                            # Log the full secret for the script to use (internal only)
                            print(f"SECRET_CONNECTION_STRING={uri}")
                            return
                        else:
                            log("    ⚠️ Found role/db but connection_uri was null.")
                    else:
                        log(f"    ❌ Failed to get URI: {uri_resp.status_code}")

if __name__ == "__main__":
    solve()
