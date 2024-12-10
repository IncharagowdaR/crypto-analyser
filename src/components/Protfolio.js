import React, { useState, useEffect, useContext } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserContext } from "../UserContext";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Protfolio() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [portfolioData, setPortfolioData] = useState([]);
  const [docUpdate, setDocUpdated] = useState(false);
  const [loading, setLoading] = useState(true);

  const getUserData = async (email) => {
    try {
      setLoading(true);
      const docRef = doc(db, "usersData", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    } finally {
      setLoading(false); // Stop loading after fetch completes
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData(user.email);
      if (userData) {
        setPortfolioData(userData);
      }
    };
    fetchData();
    setDocUpdated(false);
  }, [user.email, docUpdate]);

  // Display loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  const deleteToken = async (email, tokenNameToDelete) => {
    try {
      // Step 1: Fetch the user's document from Firestore
      const docRef = doc(db, "usersData", email); // 'users' is the collection name
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Step 2: Remove the item by token name
        const updatedPortfolio = userData.portfolio.filter(
          (item) => item.name !== tokenNameToDelete
        );
        // Step 3: Update the document in Firestore
        await updateDoc(docRef, {
          portfolio: updatedPortfolio,
        });
        console.log(
          `Item with token name "${tokenNameToDelete}" deleted successfully from portfolio!`
        );
        setDocUpdated(true);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error deleting item from portfolio:", error);
    }
  };

  return (
    <div className="bg-gray-900 mt-24 py-10 mx-20">
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">
                  {user.email}
                </h1>
                <p className="mt-2 text-sm text-gray-300">
                  A list of all the users in your account including their name,
                  title, email and role.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => navigate("/market")}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Add crypto to protfolio
                </button>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                        >
                          Token ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        ></th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Symbol
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Launch Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Contract address
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {portfolioData?.portfolio.map((token, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {token.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            <img className="w-10 h-10" src={token.logo} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {token.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {token.symbol}
                          </td>

                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {new Date(token.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {token.contractAddress}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button
                              onClick={() =>
                                deleteToken(user.email, token.name)
                              }
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              Remove from protfolio
                              <span className="sr-only">, {token.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
