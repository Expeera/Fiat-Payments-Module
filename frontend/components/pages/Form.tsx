import React, { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../../App"
import { toast } from "react-toastify"
import "./table.css" // Import the CSS file
import { Invoice } from "../../Hooks/UseAuthClient"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { Row, Col } from "react-bootstrap"

export interface CreateInvoiceBody {
  amount: number
  paymentMethod: string
  currency: string
  items: [
    {
      id: number
      name: string
      price: number
    },
  ]
}

export default function Form() {
  const [currency, setCurrency] = useState("USD")
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const { logout, isAuthenticated, actor, isOwner } = useContext(AppContext)
  const [formData, setFormData] = useState({
    paymentMethod: "",
    amount: "",
    currency: currency,
  })
  const navigate = useNavigate()
  const sessionId = 1000

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Prodct 1",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../images/img-placeholder.webp",
    },
    {
      id: 2,
      name: "Prodct 2",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../images/img-placeholder.webp",
    },
    {
      id: 3,
      name: "Prodct 3",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../images/img-placeholder.webp",
    },
    {
      id: 4,
      name: "Prodct 4",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../images/img-placeholder.webp",
    },
    {
      id: 5,
      name: "Prodct 5",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../images/img-placeholder.webp",
    },
    {
      id: 6,
      name: "Prodct 6",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../images/img-placeholder.webp",
    },
  ])

  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    // Check if the product already exists in the cart
    const existingProduct = cart.find((item) => item.id === product.id)

    if (existingProduct) {
      toast.error(`${product.name} is already in the cart.`)
    } else {
      // Product does not exist in the cart, add it with a quantity property set to 1
      setCart([...cart, { ...product }])
      toast.success(`${product.name} added successfully.`)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))

    if (name == "currency") {
      setCurrency(value)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let data: CreateInvoiceBody = {
      amount: parseFloat(formData.amount.toString()),
      paymentMethod: formData.paymentMethod,
      currency: formData.currency,
      items: carts,
    }

    actor
      .create_invoice(data)
      .then((data) => {
        console.log({ data })

        if (data.status) {
          if ("success" in data.body) {
            window.open(data.body.success.payment.redirectUrl, "_blank")
          }
          toast.success(data.message)
        } else {
          toast.error(data.message)
        }
      })
      .catch((err) => {
        console.log({ err })
        toast.error(err.message)
      })
  }
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

  useEffect(() => {
    async function myInvoice() {
      var isOwnerVal = await isOwner()
      if (isOwnerVal) {
        navigate("/admin")
      }

      actor
        .get_my_invoices()
        .then(async (data) => {
          console.log("woened ", { data })
          setInvoices(data)
        })
        .catch((err) => {
          console.log(err)
        })
    }

    isAuthenticated && actor && myInvoice()
  }, [isAuthenticated, actor])

  const handleClickLogout = () => {
    logout()
    navigate("/auth/login")
  }

  if (!isAuthenticated) {
    navigate("/auth/login")
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Row>
          <Col lg={8}>
            <div
              style={{
                margin: "5px 30px",
                textAlign: "center",
                justifyContent: "center",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <Row>
                {products.map((product) => (
                  <Col lg={4}>
                    <div
                      style={{
                        padding: "10px",
                        margin: "10px",
                        background: "#fff",
                        borderRadius: "8px",
                        boxShadow:
                          "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
                      }}
                    >
                      <img src={product.image} style={{ width: "100%" }} />
                      <h2
                        style={{
                          marginTop: "5px",
                          fontSize: "22px",
                          fontWeight: "bold",
                        }}
                      >
                        {product.name}
                      </h2>
                      <p style={{ fontWeight: 600, fontSize: "14px" }}>
                        {product.price} {currency}
                      </p>
                      <p style={{ fontWeight: 600, fontSize: "14px" }}>
                        Quntity: {product.quntity}
                      </p>
                      <button
                        onClick={(e) => addToCart(product)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          background: "#28a745",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      >
                        Add To Cart
                      </button>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
          <Col lg={4} className="d-flex align-items-center">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // height: "700px",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <h2>Create New Invoice</h2>
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "50%",
                  padding: "10px",
                }}
              >
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={{
                    marginBottom: "10px",
                    padding: "5px 10px",
                    width: "100%",
                    height: "50px",
                    borderRadius: "8px",
                  }}
                >
                  <option value="default">Select payment method</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                </select>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  disabled
                  style={{
                    marginBottom: "10px",
                    padding: "5px 2px",
                    width: "100%",
                    height: "50px",
                    borderRadius: "8px",
                    border: "1px solid #888",
                  }}
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  style={{
                    marginBottom: "10px",
                    padding: "5px 10px",
                    width: "100%",
                    height: "50px",
                    borderRadius: "8px",
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <button
                  type="submit"
                  style={{
                    padding: "15px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    background: "#007bff",
                    borderRadius: "8px",
                    fontSize: "18px",
                  }}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </form>
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
            </div>
          </Col>
        </Row>
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",

            // height: "700px",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              margin: "5px 30px",
              textAlign: "center",
              justifyContent: "center",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {products.map((product) => (
              <div
                style={{
                  width: "25%",
                  padding: "10px",
                  margin: "10px",
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow:
                    "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
                }}
              >
                <h2>{product.name}</h2>
                <p style={{ fontWeight: 600 }}>
                  {product.price} {currency}
                </p>
                <button
                  onClick={(e) => addToCart(product)}
                  style={{
                    padding: "15px 20px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    background: "#28a745",
                    borderRadius: "8px",
                    fontSize: "18px",
                  }}
                >
                  Add To Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // height: "700px",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <h2>Create New Invoice</h2>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "50%",
              padding: "10px",
            }}
          >
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              style={{
                marginBottom: "10px",
                padding: "5px 10px",
                width: "100%",
                height: "50px",
                borderRadius: "8px",
              }}
            >
              <option value="default">Select payment method</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </select>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount"
              disabled
              style={{
                marginBottom: "10px",
                padding: "5px 2px",
                width: "100%",
                height: "50px",
                borderRadius: "8px",
                border: "1px solid #888",
              }}
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              style={{
                marginBottom: "10px",
                padding: "5px 10px",
                width: "100%",
                height: "50px",
                borderRadius: "8px",
              }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <button
              type="submit"
              style={{
                padding: "15px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                background: "#007bff",
                borderRadius: "8px",
                fontSize: "18px",
              }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </form>
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
        </div> */}
      </div>
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
                  <td className="d-flex justify-content-center align-items-center gap-1">
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

                      <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                          <Modal.Title>Invoice NO: {item.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <p>Amount: {item.amount}</p>
                          <p>Currency: {item.currency}</p>
                          <p>PaymentMethod: {item.paymentMethod}</p>
                          <p>Status: {item.status}</p>
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
    </>
  )
}
