const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");
const { BlobServiceClient } = require("@azure/storage-blob");
const { Readable } = require("stream");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
const multer = require("multer");
const basicAuth = require("basic-auth");

var mongoose = require("mongoose");
const { log } = require("console");
mongoose.set("strictQuery", true);
var url = "mongodb://172.17.4.11:27017/epaper";

// mongoose
//   .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected sucessfully"))
//   .catch((err) => console.log("MongoDB connection error: ", err));
// mongoose.Promise = global.Promise;

// Today date
const today = new Date();
const date = today.setDate(today.getDate());
const defaultValue = new Date(date).toISOString().split("T")[0];
// console.log(defaultValue);
const defaultPages = "Front";


//const port = 5500; //uat1 server port number
// const port = 4400; //live server port number
// const port = 3800;  // local test

app.use(
  cors({
    origin: "*",
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


//article view MYSQL connection code--------------------------------------
const pool = mysql.createPool({
  host: '192.168.90.31',
  user: 'root',
  // database: 'e-paper',
  database: 'test',
  // password: "VetriKodi#1",
  password: "MySQL123",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// // Attempt to establish a connection to the database
pool.getConnection((err, connection) => {
if (err) {
  console.error('Error connecting to the database:', err);
  return;
}
console.log('MySQL database connected successfully...!');
connection.release();

});


//Above is article view MYSQL connection code--------------------------------------


const authenticate = (req, res, next) => {
  const credentials = basicAuth(req);

  if (
    !credentials ||
    credentials.name !== "htt@apiurl$7!" ||
    credentials.pass !== "5dhg$ers1"
  ) {
    res.status(401).json({ Message: "Unauthorized for api" });
  } else {
    next();
  }
};


const AZURE_STORAGE_CONNECTION_STRING =
  "DefaultEndpointsProtocol=https;AccountName=stgtamilthisaicdn;AccountKey=PTYvDIznmFTJ0HJjAqJ+H2heVsr5PL53xPrzUVFD8Kg79GEuipJ3hB37kFAsZc9NEaLOJ3YfSCnnwTASWCGUCg==;EndpointSuffix=core.windows.net";

//Single and full page server API code below -----------------------------------------------------------------------------------------------------------------------

app.get("/helloUAT", (req, res) => {
  res.send("welcome to UAT Pages");
});

app.get("/api/htt/pdf", async (req, res) => {
  const { date } = req.query;
  console.log(date);

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    console.log("Azure Blob storage connection successfully");

    // Get a reference to the container where the PDF files are stored
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Construct the name of the PDF file based on the requested date
    const subfolderName = "MultipleViewPdf";
    const thumbnail = "ThumnailImages";
    const region = "Chennai";
    const pdfName = `${subfolderName}/${date}/${thumbnail}/${date}_${region}.png`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      res.status(404).send("PDF file not found");
      return;
    }

    // Set the response headers to indicate that this is a PDF file
    res.setHeader("Content-Type", "Image/png");
    res.setHeader("Content-Disposition", `inline; filename="${pdfName}"`);

    // Stream the PDF file to the client
    const downloadResponse = await blockBlobClient.download();
    const readableStream = downloadResponse.readableStreamBody;
    readableStream.pipe(res);
  } catch (error) {
    console.error("Azure Blob storage connection failed:", error);
    res.status(500).send("Error retrieving PDF file");
  }
});

app.get("/api/htt/fetchImages", async (req, res) => {
  const { date } = req.query;
  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the "ThumbnailImages" folder is located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the "ThumbnailImages" folder
    const prefix = `FrontpageImages/${date}/ThumnailImages/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Create an array to store image names
    const imageNames = [];

    // Iterate through the list of blobs and retrieve their names
    for await (const blob of blobs) {
      // Extract the image name from the blob's full name
      const imageName = blob.name.split("/").pop();
      // Add the image name to the array
      imageNames.push(imageName);
    }

    // Send the list of image names as JSON response
    res.json(imageNames);
  } catch (error) {
    console.error("Error fetching image names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/fetchProductFolders", async (req, res) => {
  const inputDate = req.query.date;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the "ThumbnailImages" folder is located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the "ThumbnailImages" folder based on the input date
    const prefix = `MultipleViewPdf/${inputDate}/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Extract folder names from the list of blobs
    const folderNames = new Set();

    for await (const blob of blobs) {
      const parts = blob.name.split("/");
      if (parts.length >= 3) {
        const folderName = parts[2]; // Assuming the folder name is the third part
        folderNames.add(folderName);
      }
    }

    // Convert the set of folder names to an array
    const folderNamesArray = Array.from(folderNames);

    // Send the list of folder names as JSON response
    res.json(folderNamesArray);
  } catch (error) {
    console.error("Error fetching folder names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/getEditionFilenames", async (req, res) => {
  const { date, product } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the folder based on the input date and product
    const prefix = `MultipleViewPdf/${date}/${product}/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Convert the asynchronous iterable to an array
    const blobArray = [];
    for await (const blob of blobs) {
      blobArray.push(blob);
    }

    // Extract file names from the list of blobs
    const fileNames = blobArray
      .map((blob) => {
        const parts = blob.name.split("/");
        if (parts.length >= 4) {
          const fileNameWithExtension = parts[3]; // Assuming the file name is the fourth part
          const fileNameWithoutExtension = fileNameWithExtension.split(".")[0];
          return fileNameWithoutExtension;
        }
        return null;
      })
      .filter(Boolean); // Filter out any null values

    // Send the list of file names as JSON response
    res.json(fileNames);
  } catch (error) {
    console.error("Error fetching file names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/htt/newPdf", async (req, res) => {
  const { date, product, edition } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the PDF files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Construct the PDF file name based on the provided parameters
    const pdfFileName = `MultipleViewPdf/${date}/${product}/${edition}.pdf`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfFileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      res.status(404).send("PDF file not found");
      return;
    }

    // Set the response headers to indicate that this is a PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${edition}.pdf"`);

    // Stream the PDF file to the client
    const downloadResponse = await blockBlobClient.download();
    const readableStream = downloadResponse.readableStreamBody;
    readableStream.pipe(res);
  } catch (error) {
    console.error("Error fetching PDF file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/files/count", async (req, res) => {
  const containerName = "httepaper"; // Replace with your container name
  const { date, product, edition } = req.query;
  const directoryPath = `SingleViewPdf/${date}/${product}/${edition}/`;

  try {
    const count = await getNumberOfFilesInDirectory(
      containerName,
      directoryPath
    );
    res.json({ count });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function getNumberOfFilesInDirectory(containerName, directoryPath) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const iterator = containerClient.listBlobsFlat({ prefix: directoryPath });

  let count = 0;
  for await (const blob of iterator) {
    count++;
  }

  return count;
}

app.get("/api/htt/getSingleFilenames", async (req, res) => {
  const { date, product,edition } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the folder based on the input date and product
    // const prefix = `SingleViewPdf/${date}/${product}/${edition}/`;

    const prefix = `SingleViewPdf/${date}/${product}/${edition}/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Convert the asynchronous iterable to an array
    const blobArray = [];
    for await (const blob of blobs) {
      blobArray.push(blob);
    }

    // Extract file names from the list of blobs
    const fileNames = blobArray
      .map((blob) => {
        const parts = blob.name.split("/");
        if (parts.length >= 5) {
          const fileNameWithExtension = parts[4]; // Assuming the file name is the fourth part
          const fileNameWithoutExtension = fileNameWithExtension.split(".")[0];
          return fileNameWithoutExtension;
        }
        return null;
      })
      .filter(Boolean); // Filter out any null values

    // Send the list of file names as JSON response
    res.json(fileNames);
  } catch (error) {
    console.error("Error fetching file names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/htt/singlepdf", async (req, res) => {
  const { date, product, edition, pagenumber } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the PDF files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Construct the PDF file name based on the provided parameters
    const pdfFileName = `SingleViewPdf/${date}/${product}/${edition}/${edition}_Page_${pagenumber}.pdf`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfFileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      res.status(404).send("PDF file not found");
      return;
    }

    // Set the response headers to indicate that this is a PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${edition}.pdf"`);

    // Stream the PDF file to the client
    const downloadResponse = await blockBlobClient.download();
    const readableStream = downloadResponse.readableStreamBody;
    readableStream.pipe(res);
  } catch (error) {
    console.error("Error fetching PDF file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/singlepdfupload", upload.single("pdfFile"), async (req, res) => {
  try {
    const { date, product, edition, pagenumber } = req.query;
    const folderName = `SingleViewPdf/${date}/${product}/${edition}`;
    const blobName = `${folderName}/${edition}_Page_${pagenumber}.pdf`;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("httepaper");
    const stream = Readable.from(req.file.buffer);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // Check if the blob exists, delete it if it does
    const blobExists = await blockBlobClient.exists();
    if (blobExists) {
      await blockBlobClient.delete();
    }
    await blockBlobClient.uploadStream(stream, undefined, undefined, {
      blobHTTPHeaders: { blobContentType: "application/pdf" },
      overwrite: true,
    });
    const uploadedUrl = blockBlobClient.url;
    console.log("File uploaded successfully. URL:", uploadedUrl);
    res.status(200).send(uploadedUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file to Azure Blob Storage.");
  }
});

app.post("/multiplepdfupload", upload.single("pdfFile"), async (req, res) => {
  try {
    const { date, product, edition } = req.query;
    const folderName = `MultipleViewPdf/${date}/${product}/${edition}.pdf`;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("httepaper");
    const blobName = `${folderName}`;
    const stream = Readable.from(req.file.buffer);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // Check if the blob exists, delete it if it does
    const blobExists = await blockBlobClient.exists();
    if (blobExists) {
      await blockBlobClient.delete();
    }
    await blockBlobClient.uploadStream(stream, undefined, undefined, {
      blobHTTPHeaders: { blobContentType: "application/pdf" },
      overwrite: true,
    });
    const uploadedUrl = blockBlobClient.url;
    console.log("File uploaded successfully. URL:", uploadedUrl);
    res.status(200).send(uploadedUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file to Azure Blob Storage.");
  }
});

app.post(
  "/thumbnailpngupload",
  upload.single("imageFile"),
  async (req, res) => {
    try {
      const { date, edition } = req.query;
      const folderName = `FrontpageImages/${date}/ThumnailImages/${date}_${edition}.png`;

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
      );
      const containerClient = blobServiceClient.getContainerClient("httepaper");
      const blobName = `${folderName}`;

      const stream = Readable.from(req.file.buffer);

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Check if the blob exists, delete it if it does
      const blobExists = await blockBlobClient.exists();
      if (blobExists) {
        await blockBlobClient.delete();
      }

      await blockBlobClient.uploadStream(stream, undefined, undefined, {
        blobHTTPHeaders: { blobContentType: "image/png" },
        overwrite: true,
      });

      const uploadedUrl = blockBlobClient.url;
      console.log("Image uploaded successfully. URL:", uploadedUrl);

      res.status(200).send(uploadedUrl);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading image to Azure Blob Storage.");
    }
  }
);

//-----------Fetch direct  pdf  url in blob --------//

app.get("/htt/multiplepdfView", async (req, res) => {
  const { date, product, edition } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the PDF files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");
    // Construct the PDF file name based on the provided parameters
    const pdfFileName = `MultipleViewPdf/${date}/${product}/${edition}.pdf`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfFileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).send("PDF file not found");
    }

    // Get the URL of the blob
    const blobUrl = blockBlobClient.url;

    // Return the blob URL in the response
    res.json({ blobUrl });
  } catch (error) {
    console.error("Error fetching PDF file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/singlepdfView", async (req, res) => {
  const { date, product, edition, pagenumber } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the PDF files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");
    // Construct the PDF file name based on the provided parameters
    // const pdfFileName = `SingleViewPdf/${date}/${product}/${edition}/${edition}_Page_${pagenumber}.pdf`;

    const pdfFileName = `SingleViewPdf/${date}/${product}/${edition}/${edition}_Page_${pagenumber}.pdf`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfFileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).send("PDF file not found");
    }

    // Get the URL of the blob
    const blobUrl = blockBlobClient.url;

    // Return the blob URL in the response
    res.json({ blobUrl });
  } catch (error) {
    console.error("Error fetching PDF file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/httauth", (req, res) => {
  try {
    // Access the request body
    const formData = req.body;
    const formDataJSON = JSON.stringify(formData);
    console.log(formData);

    if (formData !== null) {
      // Redirect to the specified URL with formData in the query string

      const redirectURL = `https://uat1.hindutamil.in/httauth?message=${encodeURIComponent(formData.message)}&formData=${encodeURIComponent(formDataJSON)}`;

      // const redirectURL = `https://uat1.hindutamil.in/httauth?message=${encodeURIComponent(formData.message)}&formData=${encodeURIComponent(formDataJSON)}`;
      
      // const redirectURL = `https://epaper.hindutamil.in/httauth?message=${encodeURIComponent(formData.message)}&formData=${encodeURIComponent(formDataJSON)}`;
      return res.redirect(redirectURL);
    }

    // Send the formData in a JSON response if not redirected
    res.json({
      message: "Form data received successfully",
      formData: formDataJSON,
    });
  } catch (error) {
    // Handle any errors or exceptions
    console.error("Error handling POST request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/htt/login", async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body
  const apiUrl = `https://api.hindutamil.in/epaper.php?do=login&Emailid=${email}&Password=${password}`;
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: apiUrl,
    headers: {
      Authorization: "Basic c3VtbWl0OkUxaDBwJCVodDRkeA==",
      Cookie:
        "ApplicationGatewayAffinity=c12045f6a862eded62794db72c2d25023b209fe19830727e4116316160767556; ApplicationGatewayAffinityCORS=c12045f6a862eded62794db72c2d25023b209fe19830727e4116316160767556; PHPSESSID=n5h04g8eobeg6r8kn0cnulpp54; _uid=n5h04g8eobeg6r8kn0cnulpp54; ApplicationGatewayAffinity=5397b5038941e8b816f0ba7afbb2a89c35525b11895b3542662754beb6be9a7b; ApplicationGatewayAffinityCORS=5397b5038941e8b816f0ba7afbb2a89c35525b11895b3542662754beb6be9a7b; PHPSESSID=q86b9eohlkk7lrontokmdk5a07",
    },
  };
  try {
    const response = await axios.request(config); // Use the config object for the request
    console.log(response.data);
    const data = response.data;
    res.send(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//-------------------Api for mobile app------------------------------

app.get("/apk/multiplepdfView", authenticate, async (req, res) => {
  const { date } = req.query;
  const [day, month, year] = date.split("-");
  const mappeddate = `${day.padStart(2, "0")}${month.padStart(
    2,
    "0"
  )}${year.slice(-2)}`;

  // console.log(mappeddate);

  function convertDateFormat(dateString) {
    const parts = dateString.split(/[-/]/);
  
    let day, month, year;
  
    if (parts.length === 3) {
      if (parts[0].length <= 2) {
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
      } else {
        day = parts[2].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[0];
      }
    } else {
      if (parts[2].length <= 2) {
        day = parts[2].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[0];
      } else {
        day = parts[3].padStart(2, '0');
        month = parts[2].padStart(2, '0');
        year = parts[0];
      }
    }
  
    return `${day}-${month}-${year}`;
  }
  
const ConvertDate = convertDateFormat(date);

console.log(ConvertDate);

  const products = [
    "HinduTamilThisai",
    "Supplementary",
    "Supplementary_1",
    "HinduTamilThisai_1",
  ];

  const productnameMapping = {
    HinduTamilThisai: "இந்து தமிழ் திசை",
    Supplementary: "இணைப்பிதழ்",
    Supplementary_1: "இணைப்பிதழ் 2",
    HinduTamilThisai_1: "இந்து தமிழ் திசை 2",
  };

  const CityMapping = {
    Chennai: "சென்னை",
    Coimbatore: "கோயம்புத்தூர்",
    Dharmapuri: "தருமபுரி",
    Kancheepuram: "காஞ்சிபுரம்",
    Madurai: "மதுரை",
    Puducherry: "புதுச்சேரி",
    Ramnad: "ராமநாதபுரம்",
    Salem: "சேலம்",
    Tanjavur: "தஞ்சாவூர்",
    Tiruchirapalli: "திருச்சி",
    Tirunelveli: "திருநெல்வேலி",
    Tirupur: "திருப்பூர்",
    Thiruvananthapuram: "கன்னியாகுமரி",
    Vellore: "வேலூர்",
  };

  const productMapping = {
    HinduTamilThisai: "0101",
    Supplementary: "02",
    Supplementary_1: "03",
    HinduTamilThisai_1: "0102",
  };

  const issueMapping = {
    Chennai: "01",
    Coimbatore: "02",
    Dharmapuri: "03",
    Kancheepuram: "04",
    Madurai: "05",
    Puducherry: "06",
    Ramnad: "07",
    Salem: "08",
    Tanjavur: "09",
    Tiruchirapalli: "10",
    Tirunelveli: "11",
    Tirupur: "12",
    Thiruvananthapuram: "13",
    Vellore: "14",
  };

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    const responseData = {
      status: 200,
      cached: 0,
      msg: "success",
      data: {},
    };

    for (const product of products) {
      const pdfFolderName = `MultipleViewPdf/${ConvertDate}/${product}/`;
      const blobsIterator = containerClient.listBlobsFlat({
        prefix: pdfFolderName,
      });

      const fileNames = [];
      for await (const blob of blobsIterator) {
        const parts = blob.name.split("/");
        if (parts.length >= 4) {
          const fileNameWithExtension = parts[3];
          const fileNameWithoutExtension = fileNameWithExtension.split(".")[0];
          fileNames.push(fileNameWithoutExtension);
        }
      }

      responseData.data[product] = {
        editions: fileNames.map((fileName) => {
          const issue_id = `${mappeddate}${productMapping[product]}${issueMapping[fileName]}`;
          return {
            city: CityMapping[fileName],
            img: `https://static.hindutamil.in/httepaper/FrontpageImages/${ConvertDate}/ThumnailImages/${ConvertDate}_${fileName}.png`,
            pdf: `https://static.hindutamil.in/httepaper/MultipleViewPdf/${ConvertDate}/${product}/${fileName}.pdf`,
            issue_id: issue_id,
            is_open: 0,
          };
        }),
      };
    }

    // Set response content type to explicitly specify UTF-8 encoding
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error(
      "Error checking folder existence or constructing PDF URLs:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Alter Page server code is below:---------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/htt/api/productfiles", async (req, res) => {
  const { date } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the "ThumbnailImages" folder is located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the "ThumbnailImages" folder based on the input date
    const prefix = `ImageView/${date}/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Extract folder names from the list of blobs
    const folderNames = new Set();

    for await (const blob of blobs) {
      const parts = blob.name.split("/");
      if (parts.length >= 3) {
        const folderName = parts[2]; // Assuming the folder name is the third part
        folderNames.add(folderName);
      }
    }

    // Convert the set of folder names to an array
    const folderNamesArray = Array.from(folderNames);

    // Send the list of folder names as JSON response
    res.json(folderNamesArray);
  } catch (error) {
    console.error("Error fetching folder names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/api/regionfiles", async (req, res) => {
  const { date, product } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the folder based on the input date and product
    const prefix = `ImageView/${date}/HinduTamilThisai/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Extract folder names from the list of blobs
    const folderNames = new Set();

    for await (const blob of blobs) {
      const parts = blob.name.split("/");
      if (parts.length >= 4) {
        const folderName = parts[3]; // Assuming the folder name is the third part
        folderNames.add(folderName);
      }
    }

    // Convert the set of folder names to an array
    const folderNamesArray = Array.from(folderNames);

    // Send the list of folder names as JSON response
    res.json(folderNamesArray);
  } catch (error) {
    console.error("Error fetching folder names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/api/imagefiles", async (req, res) => {
  const containerName = "httepaper"; // Replace with your container name
  const { date, region } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the folder based on the input date and product
    const prefix = `ImageView/${date}/HinduTamilThisai/${region}/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Convert the asynchronous iterable to an array
    const blobArray = [];
    for await (const blob of blobs) {
      blobArray.push(blob);
    }

    // Extract file names from the list of blobs
    const fileNames = blobArray
      .map((blob) => {
        const parts = blob.name.split("/");
        if (parts.length >= 5) {
          const fileNameWithExtension = parts[4]; // Assuming the file name is the fourth part
          // const fileNameWithoutExtension = fileNameWithExtension.split(".")[0];
          return fileNameWithExtension;
        }
        return null;
      })
      .filter(Boolean); // Filter out any null values

    // Send the list of file names as JSON response
    res.json(fileNames);
  } catch (error) {
    console.error("Error fetching file names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/api/subimagefiles", async (req, res) => {
  const containerName = "httepaper"; // Replace with your container name
  const { date, region } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Define the prefix to target the folder based on the input date and product
    const prefix = `ImageView/${date}/Supplementary/${region}/`;

    // List blobs with the specified prefix
    const blobs = containerClient.listBlobsFlat({ prefix });

    // Convert the asynchronous iterable to an array
    const blobArray = [];
    for await (const blob of blobs) {
      blobArray.push(blob);
    }

    // Extract file names from the list of blobs
    const fileNames = blobArray
      .map((blob) => {
        const parts = blob.name.split("/");
        if (parts.length >= 5) {
          const fileNameWithExtension = parts[4]; // Assuming the file name is the fourth part
          // const fileNameWithoutExtension = fileNameWithExtension.split(".")[0];
          return fileNameWithExtension;
        }
        return null;
      })
      .filter(Boolean); // Filter out any null values

    // Send the list of file names as JSON response
    res.json(fileNames);
  } catch (error) {
    console.error("Error fetching file names:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/api/jpeg", async (req, res) => {
  const { date, region, filename } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the PDF files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Construct the PDF file name based on the provided parameters
    const pdfFileName = `ImageView/${date}/HinduTamilThisai/${region}/${filename}`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfFileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      res.status(404).send("PNG file not found");
      return;
    }

    // Stream the PDF file to the client
    const downloadResponse = await blockBlobClient.download();
    const readableStream = downloadResponse.readableStreamBody;

    // Set the response headers to indicate that this is a PDF file
    res.setHeader("Content-Type", "image/png");

    // Pipe the readable stream directly to the response object
    readableStream.pipe(res);
  } catch (error) {
    console.error("Error fetching png file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/htt/api/subjpeg", async (req, res) => {
  const { date, region, filename } = req.query;

  try {
    // Create a BlobServiceClient object using the connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    // Get a reference to the container where the PDF files are located
    const containerClient = blobServiceClient.getContainerClient("httepaper");

    // Construct the PDF file name based on the provided parameters
    const pdfFileName = `ImageView/${date}/Supplementary/${region}/${filename}`;

    // Get a reference to the PDF file
    const blockBlobClient = containerClient.getBlockBlobClient(pdfFileName);

    // Check if the file exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      res.status(404).send("PNG file not found");
      return;
    }

    // Stream the PDF file to the client
    const downloadResponse = await blockBlobClient.download();
    const readableStream = downloadResponse.readableStreamBody;

    // Set the response headers to indicate that this is a PDF file
    res.setHeader("Content-Type", "image/png");

    // Pipe the readable stream directly to the response object
    readableStream.pipe(res);
  } catch (error) {
    console.error("Error fetching png file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//-------------------------------------Article View Api code------------------------------------
app.get('/article/news', (req, res) => {
  const { date } = req.query; // Retrieve the date parameter from the query

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND Zonename = "ALL" ', [date], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results); // Send the JSON response
        console.log(results); // Log the query results to the console
      });
    });
  } catch (error) {
    console.error('Error in getNewsByDate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/article/pagenumber', (req, res) => {
  const { date } = req.query; // Retrieve the date parameter from the query

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT DISTINCT PageNo FROM `httarticleview` WHERE Date = ? ORDER BY CAST(PageNo AS SIGNED) ASC', [date], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results); // Send the JSON response
        //console.log(results); // Log the query results to the console
      });
    });
  } catch (error) {
    console.error('Error in getNewsByDate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
app.get('/article/pagenews', (req, res) => {
  const { date, pageno } = req.query; // Retrieve the date parameter from the query

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND PageNo = ? ', [date, pageno], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results); // Send the JSON response
        // console.log(results); // Log the query results to the console
      });
    });
  } catch (error) {
    console.error('Error in getNewsByDate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/article/test', (req, res) => {
  const { date, id } = req.query; // Retrieve the date parameter from the query

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND id= ? ', [date, id], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results); // Send the JSON response
        // console.log(results); // Log the query results to the console
      });
    });
  } catch (error) {
    console.error('Error in getNewsByDate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/article/news/desam', (req, res) => {
  const { date } = req.query;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND Zonename = "ALL" AND (Pagename="Back" OR Pagename="National") LIMIT 3', [date], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results);
        // console.log(results);
      });
    });
  } catch (error) {
    console.error('Error in getNewsByDesam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/article/news/sports', (req, res) => {
  const { date } = req.query;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND Zonename = "ALL" AND Pagename="Sports" LIMIT 3 ', [date], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results);
        // console.log(results);
      });
    });
  } catch (error) {
    console.error('Error in getNewsBySports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/article/news/cinema', (req, res) => {
  const { date } = req.query;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND Zonename = "ALL" AND Pagename="Relax" LIMIT 3 ', [date], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results);
        // console.log(results);
      });
    });
  } catch (error) {
    console.error('Error in getNewsByCinema:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/article/news/inaipugal', (req, res) => {
  const { date } = req.query;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      connection.query('SELECT * FROM `httarticleview` WHERE Date = ? AND Zonename = "ALL" AND Pagename="MainSub" LIMIT 3 ', [date], (queryErr, results) => {
        connection.release();

        if (queryErr) {
          console.error('Error executing query:', queryErr);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        res.json(results);
        // console.log(results);
      });
    });
  } catch (error) {
    console.error('Error in getNewsByInaipugal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.use(express.static(path.join(__dirname, "/public")));

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "public/index.html"));
// });

app.listen(port, (req, res) => {
  console.log("Server is running port : " + port);
});
