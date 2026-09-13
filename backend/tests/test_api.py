import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestGuruAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("app", data)
        self.assertEqual(len(data["agents"]), 5)

    def test_materials_empty_list(self):
        response = self.client.get("/api/materials")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_planner_endpoint(self):
        response = self.client.get("/api/planner/summary")
        self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main()
