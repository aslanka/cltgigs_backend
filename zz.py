import os

# Directories to include
directories = ["controllers", "middlewares", "models", "routes", "strategies", "utils"]
# File to include
server_file = "server.js"
# Output file
output_file = "combined_output.txt"

def combine_files():
    try:
        with open(output_file, "w", encoding="utf-8") as outfile:
            # Loop through directories
            for directory in directories:
                if os.path.exists(directory) and os.path.isdir(directory):
                    for root, _, files in os.walk(directory):
                        for file in files:
                            file_path = os.path.join(root, file)
                            if os.path.isfile(file_path):
                                with open(file_path, "r", encoding="utf-8") as infile:
                                    outfile.write(f"\n--- {file_path} ---\n")
                                    outfile.write(infile.read())
                                    outfile.write("\n")
                else:
                    print(f"Directory not found: {directory}")

            # Include server.js if it exists
            if os.path.exists(server_file) and os.path.isfile(server_file):
                with open(server_file, "r", encoding="utf-8") as infile:
                    outfile.write(f"\n--- {server_file} ---\n")
                    outfile.write(infile.read())
                    outfile.write("\n")
            else:
                print(f"File not found: {server_file}")
        
        print(f"Contents combined into {output_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    combine_files()
