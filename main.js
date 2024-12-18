const fs = require("fs/promises");
const contentArr = [];

// Instead of making it one file try to make it the whole folder
// If the file has double space (Y axis), it means it's a new section

const filePath = "text.txt"; // if the file is 10mb it takes around 7s

function addContentToObj(data, arr) {
  const segments = data.split("\r\n");
  let currentObj = {};

  // Go to the whole segment arr and separate the data into obj
  for (const content of segments) {
    // If content is equal to an empty string it means is a new line
    if (content === "") {
      if (Object.keys(currentObj).length > 0) {
        arr.push(currentObj);
        currentObj = {};
      }
    } else {
      if (content.includes(":")) {
        const key = content.substring(0, content.indexOf(":")).trim();
        const value = content.substring(content.indexOf(":") + 1);

        if (isNaN(Number(value))) {
          currentObj[key] = value; // Add as a string if it's not a number
        } else {
          currentObj[key] = Number(value); // Add as a number otherwise
        }
      }
    }
  }

  if (Object.keys(currentObj).length > 0) {
    arr.push(currentObj);
  }
}

async function readUserFile(path, arr) {
  const file = await fs.open(path, "r");
  try {
    const fileInfo = await file.stat(); // info of our file
    const fileSize = Buffer.alloc(fileInfo.size);
    if (fileInfo.size === 0) {
      throw new Error("File is empty");
    }

    const readFile = await file.read(fileSize, 0, fileSize.byteLength, 0);
    const content = await readFile.buffer.toString();
    addContentToObj(content, arr);
  } catch (error) {
    throw error.message;
  } finally {
    if (file) {
      await file.close();
    }
  }
}

// Create file with the data in JSON format
const transferNewData = async (newFilePath) => {
  let newFile = newFilePath.replace("txt", "json");
  const jsonFile = await fs.open(newFile, "w");

  let startFile = contentArr.length === 1 ? "{" : "[";
  let endFile = contentArr.length === 1 ? "}" : "]";

  await jsonFile.appendFile(Buffer.from(`${startFile}\r\n`));
  try {
    for (const objData of contentArr) {
      if (startFile === "[") await jsonFile.appendFile(Buffer.from("{ \r\n"));
      const objKey = Object.keys(objData);

      for (const [key, value] of Object.entries(objData)) {
        if (objKey[objKey.length - 1] === key) {
          await jsonFile.appendFile(
            Buffer.from(`${convertToJson(key, value)} \r\n`)
          );
        } else {
          await jsonFile.appendFile(
            Buffer.from(`${convertToJson(key, value)}, \r\n`)
          );
        }
      }
      if (endFile === "]") {
        if (objData !== contentArr[contentArr.length - 1]) {
          await jsonFile.appendFile(Buffer.from("}, \r\n"));
        } else {
          await jsonFile.appendFile(Buffer.from("} \r\n"));
        }
      }
    }
  } catch (error) {
    await fs.unlink(newFile);
    console.log("json file was deleted");
    throw error.message;
  } finally {
    if (jsonFile) {
      await jsonFile.appendFile(Buffer.from(`${endFile}`));

      await jsonFile.close();
    }
  }
};

(async () => {
  try {
    await readUserFile(filePath, contentArr);
    await transferNewData(filePath);
    console.log("all done");
  } catch (err) {
    console.log(err);
  }
})();

function convertToJson(key, value) {
  const checkForMultiplesValues = (arg) => {
    const val = String(arg);
    if (val.includes("||")) {
      const result = val.split("||");

      return result;
    }
    return val;
  };

  if (Array.isArray(checkForMultiplesValues(value))) {
    const newValue = checkForMultiplesValues(value).map((data) => {
      if (!isNaN(Number(data))) {
        return `${Number(data)}`;
      }
      return `"${data.trim()}"`;
    });
    return `"${key}": [${newValue}]`;
  }

  if (isNaN(Number(value))) {
    return `"${key}":"${checkForMultiplesValues(value)}"`;
  }
  return `"${key}":${Number(checkForMultiplesValues(value))}`;
}
