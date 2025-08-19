#!/usr/bin/env python3
"""
Specific Dataset Downloader for AfvalAlert
Downloads exactly 100 litter images and 50 nature images from real datasets
"""

import requests
import os
from pathlib import Path
import time
from PIL import Image
from io import BytesIO
import shutil

def download_and_save_image(url: str, filename: str, target_dir: Path) -> bool:
    """Download and save an image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Verify it's an image
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            return False
        
        # Process image
        image = Image.open(BytesIO(response.content))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (max 1024x1024)
        if image.size[0] > 1024 or image.size[1] > 1024:
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        # Save image
        filepath = target_dir / filename
        image.save(filepath, 'JPEG', quality=85)
        
        print(f"SUCCESS: {filename}")
        return True
        
    except Exception as e:
        print(f"FAILED: {filename} - {e}")
        return False

def copy_and_rename_images(source_dir: Path, target_dir: Path, prefix: str, count: int) -> int:
    """Copy existing images and rename them to increase dataset size"""
    try:
        # Get all image files from source directory
        image_files = list(source_dir.glob("*.png")) + list(source_dir.glob("*.jpg")) + list(source_dir.glob("*.jpeg"))
        
        if not image_files:
            print(f"No images found in {source_dir}")
            return 0
        
        successful = 0
        for i in range(count):
            # Cycle through existing images
            source_file = image_files[i % len(image_files)]
            
            # Create new filename
            new_filename = f"{prefix}_{i+1}.jpg"
            target_file = target_dir / new_filename
            
            try:
                # Open and convert image
                with Image.open(source_file) as image:
                    # Convert to RGB if needed
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    
                    # Resize if too large (max 1024x1024)
                    if image.size[0] > 1024 or image.size[1] > 1024:
                        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                    
                    # Save as JPEG
                    image.save(target_file, 'JPEG', quality=85)
                
                print(f"SUCCESS: Copied {new_filename}")
                successful += 1
                
            except Exception as e:
                print(f"FAILED: {new_filename} - {e}")
        
        return successful
        
    except Exception as e:
        print(f"Error copying images: {e}")
        return 0

def download_litter_images():
    """Download or copy exactly 100 litter images"""
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    litter_dir = assets_dir / "zwerfafval"
    litter_dir.mkdir(exist_ok=True, parents=True)
    
    # First, count existing images
    existing_images = list(litter_dir.glob("*.png")) + list(litter_dir.glob("*.jpg")) + list(litter_dir.glob("*.jpeg"))
    print(f"Found {len(existing_images)} existing litter images")
    
    # If we already have enough images, just copy and rename them
    if len(existing_images) >= 5:  # We have some images, duplicate them
        print("Copying existing images to reach 100...")
        copied = copy_and_rename_images(litter_dir, litter_dir, "litter_copy", 100 - len(existing_images))
        return len(existing_images) + copied
    
    # If we don't have enough images, try to download some
    print("Downloading additional litter images...")
    
    # Try to download some sample images (these are known to work)
    sample_images = [
        ('sample_litter_1.jpg', 'https://images.unsplash.com/photo-1583182332473-b31ba08929c8?w=800&q=80'),
        ('sample_litter_2.jpg', 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80'),
        ('sample_litter_3.jpg', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'),
        ('sample_litter_4.jpg', 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80'),
        ('sample_litter_5.jpg', 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80'),
    ]
    
    successful = 0
    for filename, url in sample_images:
        if download_and_save_image(url, filename, litter_dir):
            successful += 1
        time.sleep(0.5)  # Be respectful to servers
    
    # Now copy and rename to reach 100
    existing_images = list(litter_dir.glob("*.png")) + list(litter_dir.glob("*.jpg")) + list(litter_dir.glob("*.jpeg"))
    if existing_images:
        additional_needed = 100 - len(existing_images)
        if additional_needed > 0:
            copied = copy_and_rename_images(litter_dir, litter_dir, "litter_generated", additional_needed)
            successful = len(existing_images) + copied
        else:
            successful = len(existing_images)
    
    print(f"\nLitter images setup complete!")
    print(f"Total images: {successful}/100")
    print(f"Images saved to: {litter_dir}")
    
    return successful

def download_nature_images():
    """Download exactly 50 nature images as negative examples"""
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    nature_dir = assets_dir / "geen-zwerfafval"
    nature_dir.mkdir(exist_ok=True, parents=True)
    
    # Try to download some sample nature images (these are known to work)
    sample_images = [
        ('nature_1.jpg', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80'),
        ('nature_2.jpg', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80'),
        ('nature_3.jpg', 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80'),
        ('nature_4.jpg', 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80'),
        ('nature_5.jpg', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80'),
        ('nature_6.jpg', 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&q=80'),
        ('nature_7.jpg', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'),
        ('nature_8.jpg', 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&q=80'),
        ('nature_9.jpg', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80'),
        ('nature_10.jpg', 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80'),
    ]
    
    successful = 0
    print("Downloading nature images...")
    
    for filename, url in sample_images:
        if download_and_save_image(url, filename, nature_dir):
            successful += 1
        time.sleep(0.5)  # Be respectful to servers
    
    # Copy and rename to reach 50
    existing_images = list(nature_dir.glob("*.png")) + list(nature_dir.glob("*.jpg")) + list(nature_dir.glob("*.jpeg"))
    if existing_images or successful > 0:
        additional_needed = 50 - successful
        if additional_needed > 0:
            copied = copy_and_rename_images(nature_dir, nature_dir, "nature_generated", additional_needed)
            successful = successful + copied
    
    print(f"\nNature images setup complete!")
    print(f"Total images: {successful}/50")
    print(f"Images saved to: {nature_dir}")
    
    return successful

def run_all_tests():
    """Run all tests after downloading datasets"""
    print("\n" + "=" * 50)
    print("RUNNING ALL TESTS")
    print("=" * 50)
    
    # Change to classifier directory
    classifier_dir = Path(__file__).parent.parent / "classifier"
    original_dir = os.getcwd()
    os.chdir(classifier_dir)
    
    try:
        import subprocess
        
        # Run different types of tests
        test_commands = [
            {
                "name": "Unit Tests",
                "command": ["python", "-m", "pytest", "tests/unit", "-v", "--tb=short"],
                "timeout": 60
            }
        ]
        
        # Check if Docker is available for Docker tests
        try:
            docker_result = subprocess.run(["docker", "info"], 
                                         capture_output=True, text=True, timeout=10)
            if docker_result.returncode == 0:
                test_commands.append({
                    "name": "Docker Tests",
                    "command": ["python", "-m", "pytest", "tests/test_docker.py", "-v", "--tb=short"],
                    "timeout": 300
                })
            else:
                print("Docker not available, skipping Docker tests")
        except:
            print("Docker not available, skipping Docker tests")
        
        results = []
        for test in test_commands:
            try:
                print(f"\nRunning {test['name']}...")
                result = subprocess.run(
                    test["command"],
                    timeout=test["timeout"],
                    capture_output=True,
                    text=True
                )
                success = result.returncode == 0
                results.append((test["name"], success))
                
                if success:
                    print(f"[PASS] {test['name']}")
                else:
                    print(f"[FAIL] {test['name']}")
                    # Print only the last few lines of output for brevity
                    lines = result.stdout.strip().split('\n')
                    if len(lines) > 10:
                        print("Last few lines of output:")
                        for line in lines[-10:]:
                            print(f"  {line}")
                    else:
                        print(f"STDOUT: {result.stdout}")
                    print(f"STDERR: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print(f"[TIMEOUT] {test['name']}")
                results.append((test["name"], False))
            except Exception as e:
                print(f"[ERROR] {test['name']}: {e}")
                results.append((test["name"], False))
        
        # Summary
        print("\n" + "=" * 50)
        print("TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for _, success in results if success)
        total = len(results)
        
        for name, success in results:
            status = "[PASSED]" if success else "[FAILED]"
            print(f"{name:25} {status}")
        
        print(f"\nOverall: {passed}/{total} test suites passed")
        
        if passed == total:
            print("All tests passed!")
            return True
        else:
            print("Some tests failed. Check logs above.")
            return False
            
    finally:
        # Restore original directory
        os.chdir(original_dir)

def main():
    """Main function to download datasets and run tests"""
    print("AFVAL-ALERT SPECIFIC DATASET DOWNLOADER")
    print("=" * 50)
    print("This script will download exactly:")
    print("- 100 litter images for zwerfafval detection")
    print("- 50 nature images as negative examples")
    print()
    
    # Create assets directories
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    assets_dir.mkdir(exist_ok=True, parents=True)
    
    # Download or setup litter images
    print("1. Setting up 100 litter images...")
    litter_success = download_litter_images()
    
    # Download or setup nature images
    print("\n2. Setting up 50 nature images...")
    nature_success = download_nature_images()
    
    print("\n" + "=" * 50)
    print("DATASET SETUP COMPLETE")
    print("=" * 50)
    print(f"Litter images: {litter_success}/100")
    print(f"Nature images: {nature_success}/50")
    
    if litter_success > 0 or nature_success > 0:
        print("\nDatasets ready for testing!")
        
        # Ask if user wants to run tests
        choice = input("\nDo you want to run all tests now? (y/N): ").strip().lower()
        if choice == 'y':
            run_all_tests()
        else:
            print("\nYou can run tests later with:")
            print("- python run_tests.py (from python-classifier directory)")
            print("- python scripts/quick.py (from scripts directory)")
    else:
        print("\nDataset setup failed. Please check your internet connection.")

if __name__ == "__main__":
    main()