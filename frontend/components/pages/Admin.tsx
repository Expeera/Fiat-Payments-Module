import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../../App"
import "./table.css" // Import the CSS file
import { toast } from "react-toastify"

export default function Admin() {
  const navigate = useNavigate()
  const { logout, isAuthenticated, actor, isOwner } = useContext(AppContext)

  useEffect(() => {
    const checkIsOwner = async () => {
      const ownerValue = await isOwner()
      console.log(ownerValue)

      if (!ownerValue) {
        navigate("/invoice")
      }
    }

    checkIsOwner()
  }, [isOwner, navigate])
  // const dummyData = [
  //   {
  //     id: "1",
  //     owner: "John Doe",
  //     amount: 100,
  //     currency: "USD",
  //     paymentMethod: "Credit Card",
  //     status: "Paid",
  //     createdAt: Date.now() - 86400000, // 1 day ago
  //   },
  //   {
  //     id: "2",
  //     owner: "Jane Smith",
  //     amount: 50,
  //     currency: "EUR",
  //     paymentMethod: "PayPal",
  //     status: "Pending",
  //     createdAt: Date.now() - 172800000, // 2 days ago
  //   },
  //   {
  //     id: "3",
  //     owner: "Michael Johnson",
  //     amount: 200,
  //     currency: "GBP",
  //     paymentMethod: "Bank Transfer",
  //     status: "Paid",
  //     createdAt: Date.now() - 259200000, // 3 days ago
  //   },
  //   {
  //     id: "4",
  //     owner: "Emily Brown",
  //     amount: 75,
  //     currency: "CAD",
  //     paymentMethod: "Credit Card",
  //     status: "Paid",
  //     createdAt: Date.now() - 345600000, // 4 days ago
  //   },
  //   {
  //     id: "5",
  //     owner: "William Lee",
  //     amount: 120,
  //     currency: "AUD",
  //     paymentMethod: "PayPal",
  //     status: "Pending",
  //     createdAt: Date.now() - 432000000, // 5 days ago
  //   },
  // ]

  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    async function invoices() {
      actor
        .get_all_invoices_to_admin()
        .then(async (data) => {
          console.log("woened ", { data })
          setInvoices(data)
        })
        .catch((err) => {
          console.log(err)
        })
    }

    isAuthenticated && actor && invoices()
  }, [isAuthenticated, actor])

  const handleClickLogout = () => {
    logout()
    navigate("/auth/login")
  }

  const handleStatusChange = (id, selectedValue) => {
    console.log(`Invoice ID ${id} status changed to: ${selectedValue}`)
    if (selectedValue === "Pending") {
      toast.error(`Invoice ID ${id} status changed to: ${selectedValue}`)
    } else if (selectedValue === "Completed") {
      toast.success(`Invoice ID ${id} status changed to: ${selectedValue}`)
    } else {
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={handleClickLogout}
        style={{
          padding: "15px 20px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
          fontSize: "18px",
        }}
      >
        Logout
      </button>
      <h1>All Invoices</h1>
      <div>
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Invoice NO</th>
                <th>Owner</th>
                <th>Amount</th>
                <th>currency</th>
                <th>Payment Method</th>
                <th>status</th>
                <th>Create At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((item) => (
                <tr key={item.id}>
                  <td>{parseInt(item.id)}</td>
                  <td>{item.owner.toString()}</td>
                  <td>{item.amount}</td>
                  <td>{item.currency}</td>
                  <td>{item.paymentMethod}</td>
                  <td>{item.status}</td>
                  <td>
                    {new Date(
                      parseInt(item.createdAt) / (1000 * 1000),
                    ).toLocaleString()}
                  </td>
                  <td>
                    <select
                      className="table-select"
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                    >
                      <option>Change Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
