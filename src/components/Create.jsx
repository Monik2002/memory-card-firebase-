import { useState, useRef, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import db, { storage } from "../firebase/firebaseConfig";
import {
  Timestamp,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const Create = () => {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const fileInputRef = useRef(null);

  const checkIfFileExists = async (email, fileName) => {
    try {
      const q = query(
        collection(db, "memorycards"),
        where("email", "==", email),
        where("fileName", "==", fileName)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Failed to check existing files", error);
      return false;
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const confirmUpload = window.confirm(
        "Are you sure you want to upload this file?"
      );
      if (!confirmUpload) {
        setErrorMessage("File upload canceled");
        setFile(null);
        fileInputRef.current.value = "";
        return;
      }

      const fileName = selectedFile.name;
      const fileExists = await checkIfFileExists(email, fileName);
      if (fileExists) {
        setErrorMessage("Image already exists in your account");
        setIsSubmitDisabled(true);
        return;
      } else {
        setErrorMessage("");
      }

      const uniqueFileName = `${uuidv4()}-${fileName}`;
      const imageRef = ref(storage, `images/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(imageRef, selectedFile);

      setIsUploading(true);
      setIsSubmitDisabled(true);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed", error);
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFile(downloadURL);
            console.log("File available at", downloadURL);
            setIsUploading(false);
            setUploadProgress(0);
            checkFormValidity(title, email, downloadURL);
          } catch (error) {
            console.error("Failed to get download URL", error);
            setIsUploading(false);
          }
        }
      );
    }
  };

  const checkFormValidity = async (title, email, fileURL) => {
    if (title && email && fileURL && !isUploading) {
      const fileExists = await checkIfFileExists(
        email,
        fileInputRef.current.files[0]?.name
      );
      if (!fileExists) {
        setIsSubmitDisabled(false);
        setErrorMessage("");
      } else {
        setIsSubmitDisabled(true);
        setErrorMessage("Image already exists in your account");
      }
    } else {
      setIsSubmitDisabled(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        _id: new Date().getUTCMilliseconds().toString(),
        title,
        email,
        file,
        fileName: fileInputRef.current.files[0].name,
        created: Timestamp.now(),
      };
      const ref = collection(db, "memorycards");
      await addDoc(ref, data);
      setTitle("");
      setEmail("");
      setFile(null);
      fileInputRef.current.value = "";
      setIsSubmitDisabled(true);
      setSuccessMessage("Card added successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      console.log(title, email, file);
    } catch (error) {
      console.error("Failed to add document", error);
    }
  };

  useEffect(() => {
    checkFormValidity(title, email, file);
  }, [title, email, file]);

  useEffect(() => {
    checkFormValidity(title, email, file);
  }, [title, email, file, isUploading]);

  useEffect(() => {
    const clearFileInput = () => {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setErrorMessage("");
      setIsSubmitDisabled(true);
    };

    clearFileInput();
  }, [email]);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <h1 className="text-center mb-4 font-monospace">Add a Card</h1>

        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="Input_title" className="form-label">
              Title
            </label>
            <input
              type="text"
              className="form-control"
              id="Input_title"
              aria-describedby="Input_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="Input_Email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="Input_Email"
              aria-describedby="Input_Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div id="emailHelp" className="form-text">
              We&apos;ll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="Input_File" className="form-label">
              Input file
            </label>
            <input
              type="file"
              className="form-control"
              id="Input_File"
              onChange={handleUpload}
              ref={fileInputRef}
            />
          </div>
          {isUploading && (
            <div className="mb-3">
              <label htmlFor="uploadProgress" className="form-label">
                Upload Progress
              </label>
              <div className="progress" style={{ height: "30px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: "#0d6efd",
                    color: "white",
                  }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {Math.round(uploadProgress)}%
                </div>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitDisabled}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;
