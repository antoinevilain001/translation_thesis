import csv

def read_first_10_lines(csv_file_path):
    try:
        with open(csv_file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            for i, row in enumerate(reader):
                print(row)
                if i >= 9:  # Stop after reading 10 lines (0-indexed)
                    break
    except FileNotFoundError:
        print(f"Error: The file '{csv_file_path}' does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Replace 'your_file.csv' with the path to your CSV file
csv_file_path = 'data.csv'
read_first_10_lines(csv_file_path)
