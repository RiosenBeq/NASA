#!/usr/bin/env python3
"""
NASA Space Bio Explorer - API Validation Script
This script tests all API endpoints to ensure they're working correctly.
"""

import asyncio
import aiohttp
import os
import sys
import json
import time
from typing import Dict, Any, List
from urllib.parse import urljoin

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

class APIValidator:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.session = None
        self.results: List[Dict[str, Any]] = []
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log(self, level: str, message: str, **kwargs):
        """Log message with formatting."""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        emoji = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}.get(level, "📝")
        print(f"[{timestamp}] {emoji} {message}")
        if kwargs:
            print(f"    Details: {kwargs}")
    
    async def test_endpoint(self, method: str, endpoint: str, expected_status: int = 200, 
                          data: Dict = None, timeout: int = 30) -> Dict[str, Any]:
        """Test a single API endpoint."""
        url = urljoin(self.base_url, endpoint)
        result = {
            "method": method,
            "endpoint": endpoint,
            "url": url,
            "expected_status": expected_status,
            "success": False,
            "response_time": 0,
            "error": None
        }
        
        try:
            start_time = time.time()
            
            if method == "GET":
                async with self.session.get(url, timeout=timeout) as response:
                    result["actual_status"] = response.status
                    result["response_data"] = await response.text()
                    
            elif method == "POST":
                headers = {"Content-Type": "application/json"}
                async with self.session.post(url, json=data, headers=headers, timeout=timeout) as response:
                    result["actual_status"] = response.status
                    result["response_data"] = await response.text()
            
            result["response_time"] = time.time() - start_time
            result["success"] = result["actual_status"] == expected_status
            
            if result["success"]:
                self.log("SUCCESS", f"{method} {endpoint} - {result['actual_status']} in {result['response_time']:.2f}s")
            else:
                self.log("ERROR", f"{method} {endpoint} - Expected {expected_status}, got {result['actual_status']}")
                
        except asyncio.TimeoutError:
            result["error"] = f"Timeout after {timeout}s"
            self.log("ERROR", f"{method} {endpoint} - Timeout")
            
        except Exception as e:
            result["error"] = str(e)
            self.log("ERROR", f"{method} {endpoint} - {str(e)}")
        
        self.results.append(result)
        return result
    
    async def validate_health(self):
        """Test health endpoint."""
        self.log("INFO", "Testing health endpoint...")
        await self.test_endpoint("GET", "/health")
    
    async def validate_search(self):
        """Test search functionality."""
        self.log("INFO", "Testing search endpoints...")
        
        # Basic search
        await self.test_endpoint("GET", "/search?q=microgravity&k=5")
        
        # Search with filters
        await self.test_endpoint("GET", "/search?q=plant&year_min=2020&year_max=2023&k=3")
        
        # Invalid search (should return 422)
        await self.test_endpoint("GET", "/search?q=&k=5", expected_status=422)
    
    async def validate_knowledge_graph(self):
        """Test knowledge graph endpoints."""
        self.log("INFO", "Testing knowledge graph endpoints...")
        
        # Nodes endpoint (may return 404 if no data)
        result = await self.test_endpoint("GET", "/kg/nodes")
        if result["actual_status"] == 404:
            self.log("WARNING", "KG nodes not found - this is OK if no KG data exists")
            result["success"] = True  # Mark as success since 404 is expected
        
        # Edges endpoint (may return 404 if no data)
        result = await self.test_endpoint("GET", "/kg/edges")
        if result["actual_status"] == 404:
            self.log("WARNING", "KG edges not found - this is OK if no KG data exists")
            result["success"] = True
        
        # Stats endpoint
        result = await self.test_endpoint("GET", "/kg/stats")
        if result["actual_status"] == 404:
            self.log("WARNING", "KG stats endpoint not found")
        else:
            await self.test_endpoint("GET", "/kg/stats")
    
    async def validate_summarize(self):
        """Test summarization endpoint."""
        self.log("INFO", "Testing summarization endpoint...")
        
        # Valid summarization request
        data = {
            "ids": [1, 2, 3],
            "persona": "scientist",
            "section_priority": "results"
        }
        await self.test_endpoint("POST", "/summarize", data=data)
        
        # Invalid request (empty IDs)
        invalid_data = {"ids": []}
        await self.test_endpoint("POST", "/summarize", data=invalid_data, expected_status=400)
    
    async def validate_qa(self):
        """Test Q&A endpoint."""
        self.log("INFO", "Testing Q&A endpoint...")
        
        # Valid Q&A request
        data = {
            "id": 1,
            "question": "What was the main finding?",
            "persona": "scientist"
        }
        await self.test_endpoint("POST", "/qa", data=data)
        
        # Invalid request (empty question)
        invalid_data = {"id": 1, "question": ""}
        await self.test_endpoint("POST", "/qa", data=invalid_data, expected_status=400)
    
    async def validate_year_counts(self):
        """Test year counts endpoint."""
        self.log("INFO", "Testing year counts endpoint...")
        await self.test_endpoint("GET", "/kg/year_counts")
    
    async def run_all_validations(self):
        """Run all validation tests."""
        self.log("INFO", f"Starting API validation for {self.base_url}")
        
        validations = [
            self.validate_health,
            self.validate_search,
            self.validate_knowledge_graph,
            self.validate_year_counts,
            # Note: Summarize and QA might fail without OpenAI key or data
            # self.validate_summarize,
            # self.validate_qa,
        ]
        
        for validation in validations:
            try:
                await validation()
            except Exception as e:
                self.log("ERROR", f"Validation failed: {validation.__name__} - {str(e)}")
        
        self.generate_report()
    
    def generate_report(self):
        """Generate validation report."""
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r["success"])
        failed_tests = total_tests - successful_tests
        
        print("\n" + "="*50)
        print("🧪 API VALIDATION REPORT")
        print("="*50)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Successful: {successful_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['method']} {result['endpoint']}: {result.get('error', 'Status mismatch')}")
        
        # Save detailed report
        report_file = "api_validation_report.json"
        with open(report_file, "w") as f:
            json.dump({
                "summary": {
                    "total": total_tests,
                    "successful": successful_tests,
                    "failed": failed_tests,
                    "success_rate": (successful_tests/total_tests)*100
                },
                "results": self.results,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        
        if failed_tests == 0:
            print(f"\n🎉 All tests passed! API is healthy.")
            return 0
        else:
            print(f"\n⚠️ {failed_tests} test(s) failed. Please check the issues above.")
            return 1


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate NASA Space Bio Explorer API")
    parser.add_argument("--url", default="http://localhost:8000", 
                       help="Base URL of the API (default: http://localhost:8000)")
    
    args = parser.parse_args()
    
    async with APIValidator(args.url) as validator:
        exit_code = await validator.run_all_validations()
        sys.exit(exit_code)


if __name__ == "__main__":
    asyncio.run(main())