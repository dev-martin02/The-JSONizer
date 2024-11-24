# The JSONizer

A NodeJS program that will extract all of the text from a ".txt" file and transfer it into a new JSON file following the JSON format.

## Tech Stack

There are no additional packages or dependencies used in this script; it solely uses pure NodeJS and his built in functions.

- NodeJS v21.5.0

## Features

- Convert text files to JSON format
- Automatic type detection (numbers vs strings)
- Error handling and cleanup
- Memory-efficient processing using buffers

## Usage

- For now the file has to be text.txt (you can change it to your desired file on line 6)
- The content must use a `:` to separate the content between key and value. The content previous that will be the key and the the content after that will be the value
- In order to have a key with multiple values you have to use `||`

## Error Handling

The application handles various error scenarios:

- Empty files
- File read/write errors
- Invalid file paths
- Data parsing errors

### **Steps to Run the Application**

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/file-processor.git
   cd file-processor

   ```

2. Create a text file named text.txt in the root directory with the following format:

   ```bash
   key1: value1
   key2: value2 || value3
   key3: 123

   ```

3. Run the application:

   ```bash
   node index.js
   ```

## Contact

Feel free to reach out with any questions or suggestions:

- GitHub: dev-martin02
- Email: martinmore2024@gmail.com
