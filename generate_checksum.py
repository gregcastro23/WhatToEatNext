import hashlib
import os

def generate_checksum(directory):
    """
    Generates a SHA-256 checksum for all files in the given directory and its subdirectories.
    Files are processed in sorted order to ensure consistent checksums.
    """
    hasher = hashlib.sha256()
    filepaths = []
    for root, _, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)
            filepaths.append(filepath)

    # Sort filepaths to ensure consistent checksum generation regardless of OS or filesystem traversal order
    filepaths.sort()

    for filepath in filepaths:
        with open(filepath, 'rb') as f:
            while True:
                chunk = f.read(4096)  # Read in 4KB chunks
                if not chunk:
                    break
                hasher.update(chunk)
    return hasher.hexdigest()

if __name__ == "__main__":
    types_dir = "src/types/"
    utils_dir = "src/utils/"

    print(f"Generating SHA-256 checksum for {types_dir}...")
    types_checksum = generate_checksum(types_dir)
    print(f"Checksum for {types_dir}: {types_checksum}")

    print(f"\nGenerating SHA-256 checksum for {utils_dir}...")
    utils_checksum = generate_checksum(utils_dir)
    print(f"Checksum for {utils_dir}: {utils_checksum}")

    print("\nCombined Checksums:")
    print(f"Types Directory: {types_checksum}")
    print(f"Utils Directory: {utils_checksum}")
    # Corrected line for combined checksum
    print(f"Combined Golden State Checksum (Types+Utils): {hashlib.sha256((types_checksum + utils_checksum).encode()).hexdigest()}")