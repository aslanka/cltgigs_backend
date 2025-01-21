import os
import hashlib
import json
import requests

# Directories and files to skip
EXCLUDED_DIRS = {".venv", "node_modules", "dist", ".env", ".git", "__pycache__", "uploads"}
EXCLUDED_FILES = {"README.md", ".DS_Store", "index.json"}
EXCLUDED_EXTENSIONS = {".log", ".tmp", ".bak", ".txt", ".py"}

INDEX_FILE = "index.json"
global_request = "I need to make the homepage look better and add a new search feature"

# API configuration
API_URL = "http://localhost:11434/api/generate"  # Replace with your LLM API endpoint
MODEL_NAME = "qwen2.5-coder:14b"

def calculate_file_hash(file_path):
    """
    Calculate the SHA256 hash of a file's contents.
    """
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def list_local_files(directory="."):
    """
    List all file paths in the specified directory, skipping specified directories and files.
    """
    file_paths = []
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for file in files:
            # Skip excluded files and extensions
            if file in EXCLUDED_FILES or os.path.splitext(file)[1] in EXCLUDED_EXTENSIONS:
                continue
            file_paths.append(os.path.join(root, file))
    return file_paths

def load_index():
    """
    Load the index file if it exists, otherwise return an empty dictionary.
    """
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_index(index):
    """
    Save the index to a file.
    """
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=4)

def summarize_file(file_path):
    """
    Use the LLM to summarize a file, extract functions, variables, and determine the language.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # LLM prompt to summarize the file
        prompt = f"""
        Summarize the following file:
        File Path: {file_path}

        Content:
        {content[:1000]}  # Limiting the content to the first 1000 characters for brevity.

        Respond in JSON format with:
        {{
            "summary": "Short summary of the file.",
            "functions": ["function1", "function2"],
            "variables": ["variable1", "variable2"],
            "language": "Programming language of the file."
        }}
        """

        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "format": "json",
            "stream": False
        }

        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            return json.loads(response.json().get("response", "{}"))
        else:
            print(f"Error summarizing file {file_path}. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error reading or summarizing file {file_path}: {e}")
        return None

def summarize_all_files(file_paths, index):
    """
    Summarize all new or modified files and collect their metadata.
    Update index.json after each file is processed to ensure crash resilience.
    """
    for file_path in file_paths:
        file_hash = calculate_file_hash(file_path)
        if file_path in index and index[file_path]["hash"] == file_hash:
            print(f"Skipping unchanged file: {file_path}")
            continue

        print(f"Summarizing file: {file_path}")
        summary = summarize_file(file_path)
        if summary:
            index[file_path] = {
                "hash": file_hash,
                "summary": summary.get("summary", ""),
                "functions": summary.get("functions", []),
                "variables": summary.get("variables", []),
                "language": summary.get("language", "")
            }
            # Save index after processing each file
            save_index(index)

    return index

def get_relevant_files(user_request, summarized_files):
    """
    Use the LLM to determine which files are relevant to the user's request.
    """
    prompt = f"""
    The user has the following request:
    "{user_request}"

    Below is the summarized information of all files:
    {json.dumps(summarized_files, indent=4)}

    Your task is to determine which files are relevant to the user's request. Respond in the following JSON format:
    {{
        "relevant_files": [
            {{
                "file_path": "path/to/relevant/file",
                "reason": "Why this file is relevant."
            }},
            ...
        ]
    }}
    """

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "format": "json",
        "stream": False
    }

    response = requests.post(API_URL, json=payload)
    if response.status_code == 200:
        data = response.json()
        return json.loads(data.get("response", "{}"))
    else:
        print(f"Error determining relevant files. Status code: {response.status_code}")
        return None

def create_prompt_file(user_request, relevant_files, file_contents, output_file="prompt.txt"):
    """
    Create a combined prompt file with the user's request and relevant file contents.
    """
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"User Request:\n{user_request}\n\n")
        f.write("Relevant Files and Their Content:\n\n")
        for file in relevant_files.get("relevant_files", []):
            file_path = file["file_path"]
            content = file_contents.get(file_path, "")
            f.write(f"File: {file_path}\n\n{content}\n\n")
    print(f"Prompt saved to {output_file}")

def main():
    # User request
    user_request = global_request

    # Step 1: List all local files
    print("Listing local files...")
    file_paths = list_local_files()

    # Step 2: Load existing index and summarize new/modified files
    print("Loading index...")
    index = load_index()
    print("Summarizing files...")
    index = summarize_all_files(file_paths, index)

    # Step 3: Use the LLM to determine relevant files
    summarized_files = [
        {k: v for k, v in entry.items() if k != "hash"}
        for entry in index.values()
    ]
    print("Determining relevant files...")
    relevant_files = get_relevant_files(user_request, summarized_files)

    if relevant_files:
        print("Relevant files identified:", relevant_files)

        # Step 4: Read contents of all files
        print("Reading relevant file contents...")
        file_contents = {}
        for file in file_paths:
            try:
                with open(file, "r", encoding="utf-8") as f:
                    file_contents[file] = f.read()
            except Exception as e:
                print(f"Error reading file {file}: {e}")

        # Step 5: Create the prompt file
        print("Creating prompt file...")
        create_prompt_file(user_request, relevant_files, file_contents)
    else:
        print("Failed to identify relevant files.")

if __name__ == "__main__":
    main()
