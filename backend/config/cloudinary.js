import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dc416fyyg",        // from your CLOUDINARY_URL
  api_key: "715582237269631",
  api_secret: "I-zAMc1w8ecAR4AMxhlRETeEEIw",
});

export default cloudinary;