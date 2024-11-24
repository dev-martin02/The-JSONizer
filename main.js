const fs = require("fs/promises");
const contentObj = {};

console.time();
// Instead of making it one file try to make it the whole folder
const filePath = "test.txt";

function addContentToObj(data, obj) {
  for (let i = 0; i <= data.length; i++) {
    if (data[i] == ":") {
      const key = data.substring(0, i).trim();
      const value = data.substring(i + 1, data.length).trim();
      if (isNaN(Number(value))) {
        obj[key] = value;
      } else {
        obj[key] = Number(value);
      }
    }
  }
  console.log(obj);
}

async function readUserFile(path, obj) {
  const file = await fs.open(path, "r");
  try {
    const fileInfo = await file.stat(); // info of our file
    const fileSize = Buffer.alloc(fileInfo.size);
    if (fileInfo.size === 0) {
      throw new Error("File is empty");
    }

    const readFile = await file.read(fileSize, 0, fileSize.byteLength, 0);
    const content = await readFile.buffer.toString().split("\r\n");
    content.map((data) => addContentToObj(data, obj));
  } catch (error) {
    throw error.message;
  } finally {
    if (file) {
      await file.close(); // Make sure to always close the file handle
    }
  }
}

// Create file with the data in JSON format
const transferNewData = async (newFilePath) => {
  let newFile = newFilePath.replace("txt", "json");
  const jsonFile = await fs.open(newFile, "w");
  try {
    const objKey = Object.keys(contentObj); // all keys in obj

    await jsonFile.appendFile(Buffer.from("{ \r\n"));
    for (const [key, value] of Object.entries(contentObj)) {
      console.log(convertToJson(key, value));
      if (objKey[objKey.length - 1] === key) {
        await jsonFile.appendFile(
          Buffer.from(`${convertToJson(key, value)} \r\n`)
        );
        await jsonFile.appendFile(Buffer.from("}"));

        return;
      }
      await jsonFile.appendFile(
        Buffer.from(`${convertToJson(key, value)}, \r\n`)
      );
    }
  } catch (error) {
    await fs.unlink(newFile);
    console.log("json file was deleted");
    throw error.message;
  } finally {
    if (jsonFile) {
      await jsonFile.close();
    }
  }
};

(async () => {
  try {
    await readUserFile(filePath, contentObj);
    await transferNewData(filePath);
    console.log("all done");
  } catch (err) {
    console.log(err);
  } finally {
    console.timeEnd();
  }
})();

function convertToJson(key, value) {
  if (isNaN(Number(value))) {
    return `"${key}" : "${value}"`;
  }
  return `"${key}" : ${value}`;
}
