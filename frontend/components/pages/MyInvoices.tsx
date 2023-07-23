import React, { useState } from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import React, { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../../App"

export default function MyInvoices() {
  const { logout, isAuthenticated, actor, isOwner } = useContext(AppContext)
  console.log(isAuthenticated)

  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const navigate = useNavigate()

  const dummyData = [
    {
      id: "1",
      owner: "John Doe",
      amount: 100,
      currency: "USD",
      paymentMethod: "Credit Card",
      status: "Paid",
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      id: "2",
      owner: "Jane Smith",
      amount: 50,
      currency: "EUR",
      paymentMethod: "PayPal",
      status: "Pending",
      createdAt: Date.now() - 172800000, // 2 days ago
    },
    {
      id: "3",
      owner: "Michael Johnson",
      amount: 200,
      currency: "GBP",
      paymentMethod: "Bank Transfer",
      status: "Paid",
      createdAt: Date.now() - 259200000, // 3 days ago
    },
    {
      id: "4",
      owner: "Emily Brown",
      amount: 75,
      currency: "CAD",
      paymentMethod: "Credit Card",
      status: "Paid",
      createdAt: Date.now() - 345600000, // 4 days ago
    },
    {
      id: "5",
      owner: "William Lee",
      amount: 120,
      currency: "AUD",
      paymentMethod: "PayPal",
      status: "Pending",
      createdAt: Date.now() - 432000000, // 5 days ago
    },
  ]

  const [invoices, setInvoices] = useState(dummyData)
  if (!isAuthenticated) {
    navigate("/auth/login")
  }
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <div>
        <h2>My Invoices</h2>
      </div>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Invoice NO</th>
              <th>Amount</th>
              <th>currency</th>
              <th>Payment Method</th>
              <th>status</th>
              <th>Create At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((item) => (
              <tr key={item.id}>
                <td>{parseInt(item.id)}</td>
                <td>{item.amount}</td>
                <td>{item.currency}</td>
                <td>{item.paymentMethod}</td>
                <td>{item.status}</td>
                <td>
                  {new Date(
                    parseInt(item.createdAt) / (1000 * 1000),
                  ).toLocaleString()}
                </td>
                <td
                  className="d-flex justify-content-center align-items-center gap-1"
                  style={{ flexDirection: "column" }}
                >
                  {item.status == "Pending" ? (
                    <a href={item.paymentLink} target="_blank">
                      Go To Pay
                    </a>
                  ) : (
                    ""
                  )}
                  <>
                    <Button variant="primary" onClick={handleShow}>
                      View
                    </Button>

                    <Modal
                      show={show}
                      onHide={handleClose}
                      style={{ width: "100%" }}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>Invoice NO: {item.id}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <p>Amount: {item.amount}</p>
                        <p>Currency: {item.currency}</p>
                        <p>PaymentMethod: {item.paymentMethod}</p>
                        <p>Status: {item.status}</p>
                        <div className="table-container">
                          <h3>Table Title</h3>
                          <table
                            className="styled-table"
                            style={{ overflowY: "scroll" }}
                          >
                            <thead>
                              <tr>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                              </tr>
                              <tr>
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                          Close
                        </Button>
                        <Button variant="primary" onClick={handleClose}>
                          Save Changes
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
