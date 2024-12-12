import React, { useEffect, useState, useContext } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { AvatarGenerator } from "random-avatar-generator";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [showData, setShowData] = useState(false);
  const [idIndex, setIdIndex] = useState();
  const [protfolioData, setPortfolioData] = useState();
  const generator = new AvatarGenerator();

  const db = getFirestore();

  useEffect(() => {
    if (user.isLoggedIn == false) {
      navigate("/admin-login");
    } if(user.role === "user") {
      navigate("/admin-login");
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "usersData"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleBlockUser = async (userId, currentStatus) => {
    try {
      const docRef = doc(db, "usersData", userId); // 'users' is the collection name
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("currentStatus", currentStatus, !currentStatus);

        // Step 2: Update username
        await updateDoc(docRef, {
          blocked: !currentStatus,
        });
      }
      console.log(`Updated user activity`);
      fetchAllUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleData = (id, index) => {
    setShowData(true);
    const data = users.filter((item) => item.id == id);
    setPortfolioData(data[0]);
    setIdIndex(index);
  };

  return (
    <div className="bg-gray-900 mt-24 py-10 mx-20">
      <h2 className="px-4 text-base/7 font-semibold text-white sm:px-6 lg:px-8">
        Latest activity and user details
      </h2>
      <table className="mt-6 w-full whitespace-nowrap text-left">
        <colgroup>
          <col className="w-full sm:w-4/12" />
          <col className="lg:w-4/12" />
          <col className="lg:w-2/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm/6 text-white">
          <tr>
            <th
              scope="col"
              className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
            >
              Id
            </th>
            <th
              scope="col"
              className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
            >
              User
            </th>
            <th
              scope="col"
              className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
            >
              Email
            </th>
          </tr>
        </thead>

        {users.map((item, index) => (
          <tbody key={index} className="divide-y divide-white/5">
            <tr>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex justify-between gap-x-4">
                  <div className="truncate text-sm/6 font-medium text-white">
                    {index + 1}
                  </div>
                  <img
                    alt=""
                    src={generator.generateRandomAvatar()}
                    className="size-8 rounded-full bg-gray-800"
                  />
                </div>
              </td>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex items-center gap-x-4">
                  <div className="truncate text-sm/6 font-medium text-white">
                    {item.username}
                  </div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-mono text-sm/6 text-gray-100">
                    {item.email}
                  </div>
                </div>
              </td>
              {/* <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex items-center gap-x-4">
                  <button
                    onClick={() => {
                      handleData(item.id, index);
                    }}
                    className="truncate text-sm/6 font-medium text-white"
                  >
                    View More
                  </button>
                </div>
              </td> */}
              <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                  <button
                    onClick={() => toggleBlockUser(item.id, item.blocked)}
                    className={`px-8 py-2 w-[150px] rounded ${
                      item.blocked
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-700 hover:bg-gray-700"
                    } text-white`}
                  >
                    {item.blocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </td>
            </tr>
            {/* {showData &&
              protfolioData?.portfolio.map(
                (data) =>
                  idIndex == index && (
                    <div
                      key={data.id}
                      className="text-white py-4 pl-4 pr-8 sm:pl-6 lg:pl-8"
                    >
                      <p className="text-lg text-white">{data.name}</p>
                      <p className="text-lg text-white">{data.symbol}</p>
                      <p className="text-lg text-white">{data.name}</p>
                    </div>
                  )
              )} */}
          </tbody>
        ))}
      </table>
    </div>
  );
}