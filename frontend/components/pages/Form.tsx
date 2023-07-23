import React, { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppContext } from "../../App"
import { toast } from "react-toastify"
import "./table.css" // Import the CSS file
import { Invoice } from "../../Hooks/UseAuthClient"

import { Row, Col } from "react-bootstrap"
export interface Item {
  id: number
  name: string
  price: number
}

export interface CreateInvoiceBody {
  amount: number
  paymentMethod: string
  currency: string
  items: Array<Item>
}

export default function Form() {
  const [currency, setCurrency] = useState("USD")

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
      image: "../../assets/img-placeholder.webp",
    },
    {
      id: 2,
      name: "Prodct 2",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../assets/img-placeholder.webp",
    },
    {
      id: 3,
      name: "Prodct 3",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../assets/img-placeholder.webp",
    },
    {
      id: 4,
      name: "Prodct 4",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../assets/img-placeholder.webp",
    },
    {
      id: 5,
      name: "Prodct 5",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../assets/img-placeholder.webp",
    },
    {
      id: 6,
      name: "Prodct 6",
      price: (10 + Math.random() * 190).toFixed(2),
      quntity: 12,
      image: "../../assets/img-placeholder.webp",
    },
  ])

  const [cart, setCart] = useState({
    products: [], // Array to store the products with ID, quantity, and total price
    totalPrice: 0, // Total cart price
  })

  const addToCart = (product) => {
    const existingProduct = cart.products.find((item) => item.id === product.id)

    if (existingProduct) {
      // If the product already exists in the cart, update its quantity
      existingProduct.quantity++
      existingProduct.totalPrice = (
        existingProduct.price * existingProduct.quantity
      ).toFixed(2)
      setCart((prevCart) => ({
        ...prevCart,
        totalPrice: (
          parseFloat(prevCart.totalPrice) + parseFloat(existingProduct.price)
        ).toFixed(2),
      }))
    } else {
      var carts = [...cart, { ...product }]
      // Product does not exist in the cart, add it with a quantity property set to 1
      const newProduct = {
        ...product,
        quantity: 1,
        totalPrice: product.price,
      }
      setCart((prevCart) => ({
        ...prevCart,
        products: [...prevCart.products, newProduct],
        totalPrice: (
          parseFloat(prevCart.totalPrice) + parseFloat(newProduct.price)
        ).toFixed(2),
      }))
    }

    toast.success(`${product.name} added successfully.`)
  }

  const removeFromCart = (productId) => {
    const updatedCart = { ...cart }

    const existingProductIndex = updatedCart.products.findIndex(
      (item) => item.id === productId,
    )
    if (existingProductIndex !== -1) {
      const removedProduct = updatedCart.products[existingProductIndex]
      updatedCart.products.splice(existingProductIndex, 1)
      updatedCart.totalPrice = (
        parseFloat(updatedCart.totalPrice) -
        parseFloat(removedProduct.totalPrice)
      ).toFixed(2)

      setCart(updatedCart)

      toast.success(
        `Product with ID ${productId} has been removed from the cart.`,
      )
    } else {
      toast.error(`Product with ID ${productId} does not exist in the cart.`)
    }
  }

  const decreaseQuantityInCart = (productId) => {
    const updatedCart = { ...cart }

    const existingProduct = updatedCart.products.find(
      (item) => item.id === productId,
    )
    if (existingProduct && existingProduct.quantity > 1) {
      existingProduct.quantity--
      existingProduct.totalPrice = (
        existingProduct.price * existingProduct.quantity
      ).toFixed(2)
      updatedCart.totalPrice = (
        parseFloat(updatedCart.totalPrice) - parseFloat(existingProduct.price)
      ).toFixed(2)

      setCart(updatedCart)

      toast.success(`Quantity of Product with ID ${productId} decreased by 1.`)
    } else {
      toast.error(
        `Quantity of Product with ID ${productId} cannot be decreased further.`,
      )
    }
  }

  const increaseQuantityInCart = (productId) => {
    const updatedCart = { ...cart }

    const existingProduct = updatedCart.products.find(
      (item) => item.id === productId,
    )
    if (existingProduct) {
      existingProduct.quantity++
      existingProduct.totalPrice = (
        existingProduct.price * existingProduct.quantity
      ).toFixed(2)
      updatedCart.totalPrice = (
        parseFloat(updatedCart.totalPrice) + parseFloat(existingProduct.price)
      ).toFixed(2)

      setCart(updatedCart)

      toast.success(`Quantity of Product with ID ${productId} increased by 1.`)
    } else {
      toast.error(`Product with ID ${productId} does not exist in the cart.`)
    }
  }

  const getQuantityInCart = (productId) => {
    const product = cart.products.find((item) => item.id === productId)
    return product ? product.quantity : 0
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

    var amount = 0
    var carts = cart.map((item) => {
      amount += parseFloat(item.price)
      return {
        id: parseInt(item.id),
        name: item.name,
        price: parseFloat(item.price),
      }
    })

    console.log(carts)

    let data: CreateInvoiceBody = {
      amount: amount,
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

  useEffect(() => {
    console.log(cart)
  }, [cart])

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Row className="justify-content-center">
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
                        Quntity: {getQuantityInCart(product.id)}
                      </p>
                      <div
                        className="d-flex "
                        style={{ flexDirection: "column" }}
                      >
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
                            margin: "5px",
                          }}
                        >
                          Add To Cart
                        </button>
                        <button
                          onClick={(e) => decreaseQuantityInCart(product.id)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            background: "#dc3545",
                            borderRadius: "8px",
                            fontSize: "14px",
                            margin: "5px",
                          }}
                        >
                          Remove From Cart
                        </button>
                        {/* <div className="d-flex justify-content-center">
                          
                           <button
                          onClick={(e) => removeFromCart(product.id)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            background: "#dc3545",
                            borderRadius: "8px",
                            fontSize: "14px",
                            margin: "5px",
                          }}
                        >
                          -
                        </button>
                          <button
                            onClick={(e) => increaseQuantityInCart(product.id)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#28a745",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              background: "#28a745",
                              borderRadius: "8px",
                              fontSize: "14px",
                              margin: "5px",
                            }}
                          >
                            +
                          </button>
                        </div> */}
                      </div>
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
    </>
  )
}
