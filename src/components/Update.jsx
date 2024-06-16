import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  collection,
} from "firebase/firestore";
import db, { storage } from "../firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

const Update = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const docRef = doc(db, "memorycards", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setEmail(data.email || "");
          setFile(data.file || null);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    fetchData();
  }, [id]);

  const checkIfFileExists = async (email, fileName) => {
    if (!email || !fileName) return false;

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

  const checkFormValidity = (title, email, fileURL) => {
    if (title && email && fileURL && !isUploading) {
      setIsSubmitDisabled(false);
      setErrorMessage("");
    } else {
      setIsSubmitDisabled(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !email || !file) {
      setErrorMessage("Please fill out all fields and upload a file.");
      return;
    }

    try {
      const data = {
        title,
        email,
        file,
        fileName: fileInputRef.current.files[0]?.name || "",
        created: Timestamp.now(),
      };

      // Get the document
      const docRef = doc(db, "memorycards", id);
      const docSnap = await getDoc(docRef);

      // Delete previous image if exists
      const previousFile = docSnap.data()?.file;
      if (previousFile) {
        const previousImageRef = ref(storage, previousFile);
        await deleteObject(previousImageRef);
      }

      // Update document with new data
      await updateDoc(docRef, data);
      setSuccessMessage("Card updated successfully");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update document", error);
    }
  };

  useEffect(() => {
    checkFormValidity(title, email, file);
  }, [title, email, file]);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [email]);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <h1 className="text-center mb-4 font-monospace">Update a Card</h1>

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
            <div>
              {file && (
                <div>
                  <img
                    className="m-2 rounded"
                    src={file}
                    alt={title}
                    width={100}
                  ></img>
                </div>
              )}
            </div>
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

export default Update;
