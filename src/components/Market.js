import React, { useState, useEffect, useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import axios from "axios";
import TokenChart from "./TokenChart";
import ChartData from "../utils/chart.json";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserContext } from "../UserContext";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

export default function Market() {
  const { user } = useContext(UserContext);
  const [chartData, setChartData] = useState();
  const [open, setOpen] = useState(false);
  const [tokenData, setTokenData] = useState();
  const [data, setData] = useState([]); // Holds fetched data
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [fetchState, setFetchState] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10; // Items per page

  useEffect(() => {
    if (user.isLoggedIn == false) {
      navigate("/");
    } if(user.role === "admin") {
      navigate("/");
    }
  }, [user]);

  const fetchCoinData = async (slug, id) => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/cryptocurrency/info",
        {
          params: {
            name: slug,
          },
        }
      );
      const result = await response.data.data;
      setTokenData(result[id]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/cryptocurrency/map"
        );
        const result = await response.data;
        setData(result.data.slice(0, 50)); // Use only the first 50 items
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate data to display on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchCoinChart = async (cryptoSymbol) => {//view more feature
    try {
      const response = await axios.get(
        `http://localhost:5001/api/crypto/${cryptoSymbol}`
      );

      const chartData = response.data;
      const prices = chartData.prices; // Array of [timestamp, price]
      const labels = prices.map((item) =>
        new Date(item[0]).toLocaleDateString()
      );
      const priceData = prices.map((item) => item[1]);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: `${cryptoSymbol.toUpperCase()} Price (USD)`,
            data: priceData,
            color: "#000",
            borderColor: "rgba(77, 162, 124, 1)",
            backgroundColor: "rgba(77, 162, 124, 1)",
            fill: true,
          },
        ],
      });// local state - react(use state) - data to token chart 
    } catch (err) {
      console.error("Error fetching data");
      const chartData = ChartData;
      const prices = chartData.prices; // Array of [timestamp, price]
      const labels = prices.map((item) =>
        new Date(item[0]).toLocaleDateString()
      );
      const priceData = prices.map((item) => item[1]);
      setChartData({
        labels: labels,
        datasets: [
          {
            label: `${cryptoSymbol.toUpperCase()} Price (USD)`,
            data: priceData,
            color: "#000",
            borderColor: "rgba(77, 162, 124, 1)",
            backgroundColor: "rgba(77, 162, 124, 1)",
            fill: true,
          },
        ],
      });
    }
  };

  const saveUserData = async (email, portfolio) => {
    const username = email.split("@")[0];
    try {
      await setDoc(doc(db, "usersData", email), {
        email,
        username,
        portfolio: [portfolio],
        blocked: false
      });
      console.log("User data saved successfully.");
    } catch (error) {
      console.error("Error saving user data: ", error);
    }
  };

  // Add a new token to user's portfolio
  const addTokenToPortfolio = async (email, token) => {
    try {
      const docRef = doc(db, "usersData", email);
      const userDoc = await getDoc(docRef);
      if (userDoc.exists()) {
        const existingPortfolio = userDoc.data().portfolio || [];
        const updatedPortfolio = existingPortfolio.filter(
          (item) => item.name === token.name
        );
        if (!updatedPortfolio.length) {
          const updatedPortfolio = [...existingPortfolio, token];
          await updateDoc(docRef, {
            portfolio: updatedPortfolio,
          });
          setMessage("Token added successfully!");
          setIsSuccess(true);
          console.log("Token added to portfolio.");
        } else {
          setMessage("Token already exists!");
          setIsSuccess(true);
          console.log("dont update");
        }
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error adding token: ", error);
    }
  };

  const handlePortfolio = async (email) => {
    const address =
      tokenData.contract_address.length === 0
        ? "0x0000000000000000000000000000000000000000"
        : tokenData.contract_address[0].contract_address;
    const tokenDeatils = {
      id: tokenData.id,
      name: tokenData.name,
      symbol: tokenData.symbol,
      logo: tokenData.logo,
      date: tokenData.date_added,
      contractAddress: address,
    };
    if (fetchState) {
      const userDoc = doc(db, "usersData", email);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        addTokenToPortfolio(email, tokenDeatils);
      } else {
        saveUserData(email, tokenDeatils);
      }
    }
    setFetchState(false);
  };

  useEffect(() => {
    if (fetchState) {
      if (tokenData) {
        handlePortfolio(user.email);
      }
    }
  }, [tokenData, fetchState]);

  return (
    <div className="bg-gray-900 mt-24 py-10 mx-20">
      <p className="px-4 text-base/7 text-white sm:px-6 lg:px-8">
        Latest activity:{" "}
        <span className="text-lg font-semibold">
          {user.email}
        </span>
      </p>
      {isSuccess && (
        <div className="fixed top-80 w-[400px] h-[130px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-lg transition-all duration-300">
          <div className="flex justify-end">
            <button
              className="text-lg text-gray-300"
              onClick={() => setIsSuccess(false)}
            >
              X
            </button>
          </div>
          <p className="flex justify-center mt-4">{message}</p>
        </div>
      )}
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative max-w-[800px] transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="text-white">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-gray-900 text-white hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <div className="relative flex items-center space-x-3 w-[500px] rounded-lg">
                  <div className="shrink-0">
                    <img
                      alt=""
                      src={tokenData?.logo}
                      className="size-10 rounded-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a href="#" className="focus:outline-none">
                      <span aria-hidden="true" className="absolute inset-0" />
                      <p className="text-lg font-bold text-white">
                        {tokenData?.name}
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-500">
                        {tokenData?.symbol}
                      </p>
                    </a>
                  </div>
                </div>
                <div className="pt-4 text-base">
                  <div className="inline-flex">
                    <p>Website:&nbsp;</p>
                    <a
                      target="_blank"
                      className="text-blue-600 cursor-pointer"
                      href={tokenData?.urls.website}
                    >
                      {tokenData?.urls.website}
                    </a>
                  </div>
                  <p className="pt-2">
                    Launched Date:{" "}
                    {new Date(tokenData?.date_launched).toLocaleString()}
                  </p>
                </div>
              </div>

              {chartData && <TokenChart chartData={chartData} />}
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add to protfolio
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

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
              Rank
            </th>
            <th
              scope="col"
              className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
            >
              Name
            </th>
            <th
              scope="col"
              className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
            >
              Symbol
            </th>
            <th
              scope="col"
              className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
            >
              Active
            </th>
            <th
              scope="col"
              className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
            ></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {currentData.map((item, index) => (
            <tr key={index}>
              <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                <div className="flex items-center gap-x-4">
                  {/* <img alt="" src={item.user.imageUrl} className="size-8 rounded-full bg-gray-800" /> */}
                  <div className="truncate text-sm/6 font-medium text-white">
                    {item.id}
                  </div>
                </div>
              </td>
              <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="font-mono text-sm/6 text-gray-400">
                    {item.name}
                  </div>
                  {/* <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                    {item.rank}
                  </div> */}
                </div>
              </td>
              <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                  <div className="hidden text-white sm:block">
                    {item.symbol}
                  </div>
                </div>
              </td>
              <td
                className={`hidden py-4 pl-0 pr-8 text-sm/6 md:table-cell lg:pr-20 ${
                  item.is_active === 1 ? "text-green-500" : "text-gray-400"
                }`}
              >
                {item.is_active === 1 ? "Active" : "Inactive"}
              </td>
              <td className="hidden py-4 pl-0 pr-4 text-right text-sm/6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                <button
                  onClick={() => {
                    setOpen(true);
                    fetchCoinData(item.slug, item.id);
                    fetchCoinChart(item.slug);
                  }}
                >
                  View More
                </button>
              </td>
              <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                  <button
                    onClick={() => {
                      fetchCoinData(item.slug, item.id);
                      setFetchState(true);
                    }}
                    className="hidden text-white sm:block"
                  >
                    Add to protfolio
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        {/* Pagination */}
        <div className="mt-6 flex space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === index + 1
                  ? "bg-indigo-800 text-white"
                  : "bg-white text-blue-900"
              } hover:bg-blue-400`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </table>
    </div>
  );
}
