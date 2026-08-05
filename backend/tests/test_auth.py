def test_register(client):
    response = client.post(
        "/api/v1/register",
        json={"email": "test@example.com", "password": "password123", "username": "TestUser"}
    )
    assert response.status_code in [200, 400] # 400 if already exists

def test_login(client):
    response = client.post(
        "/api/v1/login",
        data={"username": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
