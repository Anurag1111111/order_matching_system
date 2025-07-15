import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../config/config";
import Loader from "./Loader";

const PendingOrdersTable = () => {
  const [pendingBuyer, setPendingBuyer] = useState([]);
  const [pendingSeller, setPendingSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/pending`);

      // Separate buyers and sellers
      const buyers = response.data.filter((order) => order.type === "buyer");
      const sellers = response.data.filter((order) => order.type === "seller");

      setPendingBuyer(buyers);
      setPendingSeller(sellers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-md">
          <h2 className="px-4 py-2 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700">
            Pending Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller Qty
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingBuyer.map((buyerOrder, index) => {
                  const correspondingSellerOrder = pendingSeller[index] || {};
                  return (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {buyerOrder.qty || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {buyerOrder.price || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {correspondingSellerOrder.price || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {correspondingSellerOrder.qty || "-"}
                      </td>
                    </tr>
                  );
                })}

                {pendingSeller
                  .slice(pendingBuyer.length)
                  .map((sellerOrder, index) => (
                    <tr
                      key={pendingBuyer.length + index}
                      className={
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">-</td>
                      <td className="px-6 py-4 whitespace-nowrap">-</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sellerOrder.price || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sellerOrder.qty || "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersTable;
