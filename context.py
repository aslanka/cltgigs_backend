import os

def collect_context_files(prefix, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    repo_root = os.getcwd()
    
    regular_entries = []
    server_entries = []
    special_files = []

    # First pass: Collect all relevant files
    for root, dirs, files in os.walk(repo_root):
        # Skip node_modules directories
        dirs[:] = [d for d in dirs if d != 'node_modules']
        
        for file in files:
            file_path = os.path.join(root, file)
            if file_path == os.path.abspath(output_path):
                continue

            relative_path = os.path.relpath(file_path, start=repo_root)
            file_lower = file.lower()
            is_server_js = file_lower == 'server.js'
            is_setup_js = relative_path == os.path.join('tests', 'setup.js')
            is_env_test = file == '.env.test'
            is_jest_config = file == 'jest.config.js'
            is_prefix_match = file_lower.startswith(prefix.lower())

            if not any([is_prefix_match, is_server_js, is_setup_js, is_env_test, is_jest_config]):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    contents = f.read()
            except UnicodeDecodeError:
                print(f"Skipping binary file: {relative_path}")
                continue
            except Exception as e:
                print(f"Error reading {relative_path}: {str(e)}")
                continue

            entry = {
                'relative_path': relative_path,
                'file_path': file_path,
                'contents': contents
            }

            if is_server_js:
                server_entries.append(entry)
            else:
                regular_entries.append(entry)

    # Write all collected files to context
    with open(output_path, 'w', encoding='utf-8') as context_file:
        # Write header prompt
        context_file.write(
            "make all the tests. be super thorough. make all the files. just make backend tests.\n"
            f"My tests are going to be placed in\n"
            f"Backend:\n"
            f"/tests/{prefix}/\n\n"
            "---\n\n"
        )
        
        # Write regular entries first
        for entry in regular_entries:
            context_file.write(f"Path: {entry['relative_path']}\n")
            context_file.write(f"Full Route: {entry['file_path']}\n")
            context_file.write("Contents:\n")
            context_file.write(entry['contents'])
            context_file.write("\n\n---\n\n")
        
        # Write server.js entries last
        for entry in server_entries:
            context_file.write(f"Path: {entry['relative_path']}\n")
            context_file.write(f"Full Route: {entry['file_path']}\n")
            context_file.write("Contents:\n")
            context_file.write(entry['contents'])
            context_file.write("\n\n---\n\n")

if __name__ == "__main__":
    prefixes = ['Bid', 'Attachment', 'Auth', 'Book', 'Gig', 'Leaderboard',
                'Message', 'Notification', 'Report', 'Review', 'User']
    
    for prefix in prefixes:
        output_folder = os.path.join("tests", prefix)
        output_file = os.path.join(output_folder, f"{prefix}.context")
        
        collect_context_files(prefix, output_file)
        print(f"Created backend tests for {prefix} in {output_file}")