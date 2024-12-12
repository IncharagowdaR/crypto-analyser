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
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState(user.email.split("@")[0]);

  useEffect(() => {
    if (user.isLoggedIn == false) {
      navigate("/");
    } if(user.role === "admin") {
      navigate("/");
    }
  }, [user]);

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

  const updateUserName = async (email) => {
    try {
      const docRef = doc(db, "usersData", email); // 'users' is the collection name
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Step 2: Update username
        await updateDoc(docRef, {
          username: userName,
        });
        console.log(`Updated username`);
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
              {isSuccess && (
                <div className="fixed top-80 w-[400px] h-[200px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-lg transition-all duration-300">
                  <div className="flex justify-end">
                    <button
                      className="text-lg text-gray-300"
                      onClick={() => setIsSuccess(false)}
                    >
                      X
                    </button>
                  </div>
                  <label
                    htmlFor="password"
                    className="block text-sm/6 pb-4 font-medium text-white"
                  >
                    Enter Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Enter username"
                    defaultValue={userName}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="block w-full rounded-md border-0 bg-white/5 px-2 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6"
                  />
                  <button
                    type="button"
                    onClick={() => updateUserName(user.email)}
                    className="block rounded-md bg-indigo-500 mt-4 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Submit
                  </button>
                </div>
              )}
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">
                  Name: {portfolioData.username}
                </h1>
                <h1 className="text-base font-semibold text-white">
                  Email: {user.email}
                </h1>
                <button
                  className="text-white bg-indigo-500 mt-2 py-1 px-4 rounded-lg"
                  onClick={() => setIsSuccess(true)}
                >
                  Edit
                </button>
                <p className="mt-8 text-sm text-gray-300">
                  List of all the cryptocurrency and tokens added to protfolio
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
                    {portfolioData.portfolio.length === 0 ? (
                      <tbody className="text-white">
                        <tr>
                          <td className="pt-8 text-lg font-bold">
                            No Data found, Please add tokens to protfolio
                          </td>
                        </tr>
                      </tbody>
                    ) : (
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
                    )}
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
