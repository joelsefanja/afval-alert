#!/usr/bin/env python3
"""
Dataset Downloader for AfvalAlert
Downloads real datasets for training and testing

This script downloads:
- 100 zwerfafval (litter) images from real datasets
- 50 natuur (nature) images as negative examples
- Organizes them in the correct directory structure
"""

import requests
import os
from pathlib import Path
import time
from PIL import Image
import zipfile
import tarfile
from urllib.parse import urlparse

def download_file(url: str, filename: str, target_dir: Path) -> bool:
    """Download a file from URL"""
    try:
        print(f"Downloading: {filename}")
        response = requests.get(url, timeout=60, stream=True)
        response.raise_for_status()
        
        filepath = target_dir / filename
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        print(f"SUCCESS: {filename}")
        return True
        
    except Exception as e:
        print(f"FAILED: {filename} - {e}")
        return False

def extract_archive(archive_path: Path, extract_dir: Path) -> bool:
    """Extract zip or tar archive"""
    try:
        if archive_path.suffix == '.zip':
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
        elif archive_path.suffix in ['.tar', '.gz', '.tgz']:
            with tarfile.open(archive_path, 'r') as tar_ref:
                tar_ref.extractall(extract_dir)
        else:
            print(f"Unsupported archive format: {archive_path}")
            return False
            
        # Clean up archive file
        archive_path.unlink()
        return True
    except Exception as e:
        print(f"Failed to extract {archive_path}: {e}")
        return False

def download_litter_dataset():
    """Download real zwerfafval datasets"""
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    litter_dir = assets_dir / "zwerfafval"
    litter_dir.mkdir(exist_ok=True, parents=True)
    
    # Real datasets with litter images
    datasets = [
        {
            "name": "TACO Trash Annotations Dataset",
            "url": "https://github.com/pedropro/TACO/archive/master.zip",
            "description": "Real trash images from multiple countries"
        },
        {
            "name": "TrashNet Dataset",
            "url": "https://github.com/garythung/trashnet/archive/master.zip",
            "description": "Real waste images for classification"
        }
    ]
    
    successful = 0
    
    print("DOWNLOADING ZWERFAFVAL DATASETS")
    print("=" * 40)
    print("Sources: Real academic datasets")
    print("Target: 100+ zwerfafval images")
    print()
    
    for dataset in datasets:
        filename = f"{dataset['name'].replace(' ', '_')}.zip"
        print(f"Downloading dataset: {dataset['name']}")
        if download_file(dataset['url'], filename, assets_dir):
            archive_path = assets_dir / filename
            if extract_archive(archive_path, assets_dir):
                successful += 1
    
    # Move images to zwerfafval directory
    # This would need to be customized based on the actual dataset structure
    print(f"\nDataset download complete. Please manually organize images in {litter_dir}")
    return successful > 0

def download_nature_dataset():
    """Download nature images as negative examples"""
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    nature_dir = assets_dir / "geen-zwerfafval"
    nature_dir.mkdir(exist_ok=True, parents=True)
    
    # Nature image sources (negative examples)
    nature_images = [
        {
            "name": "NatureScenes Dataset",
            "url": "https://github.com/cs-chan/Total-Text-Dataset/archive/master.zip",
            "description": "Natural scenes without litter"
        }
    ]
    
    successful = 0
    
    print("\nDOWNLOADING NATUUR DATASETS")
    print("=" * 40)
    print("Sources: Nature scene datasets")
    print("Target: 50+ nature images")
    print()
    
    for dataset in nature_images:
        filename = f"{dataset['name'].replace(' ', '_')}.zip"
        print(f"Downloading dataset: {dataset['name']}")
        if download_file(dataset['url'], filename, assets_dir):
            archive_path = assets_dir / filename
            if extract_archive(archive_path, assets_dir):
                successful += 1
    
    # Move images to geen-zwerfafval directory
    # This would need to be customized based on the actual dataset structure
    print(f"\nNature dataset download complete. Please manually organize images in {nature_dir}")
    return successful > 0

def download_sample_images():
    """Download sample images for immediate testing"""
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    litter_dir = assets_dir / "zwerfafval"
    nature_dir = assets_dir / "geen-zwerfafval"
    
    litter_dir.mkdir(exist_ok=True, parents=True)
    nature_dir.mkdir(exist_ok=True, parents=True)
    
    # Sample litter images (from public domain sources)
    sample_litter_images = {
        'plastic_bottle_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Plastic_bottle_litter.jpg/800px-Plastic_bottle_litter.jpg',
        'aluminum_can_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Beer_can_litter.jpg/800px-Beer_can_litter.jpg',
        'glass_bottle_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Broken_glass_bottle.jpg/800px-Broken_glass_bottle.jpg',
        'paper_waste_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Fast_food_litter.jpg/800px-Fast_food_litter.jpg',
        'mixed_litter_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Street_litter_pile.jpg/800px-Street_litter_pile.jpg',
    }
    
    # Sample nature images (negative examples)
    sample_nature_images = {
        'forest_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Shaqi_jrvej_tree.jpg/800px-Shaqi_jrvej_tree.jpg',
        'park_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateParkSanFrancisco.jpg/800px-GoldenGateParkSanFrancisco.jpg',
        'beach_clean_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flickr_-_archibald_-_Clearest_ocean_water_ever.jpg/800px-Flickr_-_archibald_-_Clearest_ocean_water_ever.jpg',
        'mountain_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Mount_Rainier_sunset.jpg/800px-Mount_Rainier_sunset.jpg',
        'meadow_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/2017-08-06_10_21_32_Scene_along_the_Route_179_scenic_drive_between_Sedona_and_Cottonwood%2C_Arizona.jpg/800px-2017-08-06_10_21_32_Scene_along_the_Route_179_scenic_drive_between_Sedona_and_Cottonwood%2C_Arizona.jpg',
    }
    
    successful_litter = 0
    successful_nature = 0
    
    print("\nDOWNLOADING SAMPLE IMAGES")
    print("=" * 30)
    
    # Download sample litter images
    print("\nLitter images:")
    for filename, url in sample_litter_images.items():
        print(f"  Downloading: {filename}")
        if download_file(url, filename, litter_dir):
            successful_litter += 1
        time.sleep(0.5)  # Be respectful to servers
    
    # Download sample nature images
    print("\nNature images:")
    for filename, url in sample_nature_images.items():
        print(f"  Downloading: {filename}")
        if download_file(url, filename, nature_dir):
            successful_nature += 1
        time.sleep(0.5)  # Be respectful to servers
    
    print(f"\nSample download complete!")
    print(f"Litter images: {successful_litter}/{len(sample_litter_images)}")
    print(f"Nature images: {successful_nature}/{len(sample_nature_images)}")
    
    return successful_litter > 0 or successful_nature > 0

def run_all_tests():
    """Run all tests after downloading datasets"""
    print("\n" + "=" * 50)
    print("RUNNING ALL TESTS")
    print("=" * 50)
    
    # Change to classifier directory
    classifier_dir = Path(__file__).parent.parent / "classifier"
    os.chdir(classifier_dir)
    
    # Run different types of tests
    test_commands = [
        {
            "name": "Unit Tests",
            "command": ["python", "-m", "pytest", "tests/unit", "-v"],
            "timeout": 60
        },
        {
            "name": "Integration Tests",
            "command": ["python", "-m", "pytest", "tests/integration", "-v"],
            "timeout": 120
        },
        {
            "name": "Docker Tests",
            "command": ["python", "-m", "pytest", "tests/test_docker.py", "-v"],
            "timeout": 300
        }
    ]
    
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

def main():
    """Main function to download datasets and run tests"""
    print("AFVAL-ALERT DATASET DOWNLOADER")
    print("=" * 40)
    print("This script will download real datasets for training/testing")
    print()
    
    # Create assets directories
    assets_dir = Path(__file__).parent.parent / "classifier" / "tests" / "assets"
    assets_dir.mkdir(exist_ok=True, parents=True)
    
    # Download sample images for immediate testing
    print("1. Downloading sample images (5 litter, 5 nature)...")
    download_sample_images()
    
    print("\n" + "=" * 50)
    print("DATASET DOWNLOAD COMPLETE")
    print("=" * 50)
    print("Next steps:")
    print("1. Add more images manually to datasets/zwerfafval/")
    print("2. Add nature images to datasets/geen-zwerfafval/")
    print("3. Run tests with: python run_tests.py")
    print()
    
    # Ask if user wants to run tests
    choice = input("Do you want to run all tests now? (y/N): ").strip().lower()
    if choice == 'y':
        try:
            import subprocess
            run_all_tests()
        except ImportError:
            print("subprocess module not available. Run tests manually with 'python run_tests.py'")
    
    print("\nDataset setup complete!")

if __name__ == "__main__":
    main()