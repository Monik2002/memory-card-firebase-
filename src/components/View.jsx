import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import db from "../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";

const View = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({
    id: null,
    type: null,
  });

  const fetchCards = async () => {
    try {
      const response = await getDocs(collection(db, "memorycards"));
      const cardData = response.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCards(cardData);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <ClipLoader
          color={"#123abc"}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  const handleDelete = async (id, fileUrl) => {
    setLoadingActions({ id, type: "delete" });
    try {
      await deleteDoc(doc(db, "memorycards", id));
      const storage = getStorage();
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      fetchCards();
    } catch (error) {
      console.error("Error deleting card:", error);
    } finally {
      setLoadingActions({ id: null, type: null });
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {cards.length === 0 ? (
          <div className="col-12 text-center">
            <h5>No cards available</h5>
          </div>
        ) : (
          cards.map((card) => (
            <div className="col-md-4 mb-4" key={card.id}>
              <div className="card h-100">
                <img
                  src={card.file || "default_image_url.jpg"}
                  className="card-img-top"
                  alt={card.title || "Card image"}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title">{card.title || "Card title"}</h5>
                    <p className="card-text">
                      {card.created
                        ? card.created.toDate().toDateString()
                        : "Some date"}
                    </p>
                    <p className="card-text">
                      {card.email ||
                        "Some quick example text to build on the card title and make up the bulk of the card's content."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload(card.file, card.title)}
                    >
                      Download ⬇️
                    </button>
                  </div>
                  <div className="d-flex justify-content-between pt-2">
                    <button
                      className="btn btn-danger d-flex align-items-center"
                      onClick={() => handleDelete(card.id, card.file)}
                      disabled={
                        loadingActions.id === card.id &&
                        loadingActions.type === "delete"
                      }
                    >
                      Delete
                      {loadingActions.id === card.id &&
                        loadingActions.type === "delete" && (
                          <ClipLoader color={"#fff"} size={20} />
                        )}
                    </button>
                    <Link
                      to={`edit/${card.id}`}
                      className="btn btn-warning d-flex align-items-center"
                      disabled={
                        loadingActions.id === card.id &&
                        loadingActions.type === "edit"
                      }
                    >
                      Edit
                      {loadingActions.id === card.id &&
                        loadingActions.type === "edit" && (
                          <ClipLoader color={"#fff"} size={20} />
                        )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default View;
