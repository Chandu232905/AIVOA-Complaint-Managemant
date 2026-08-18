import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [form, setForm] = useState({
    customer_name: "",
    product_name: "",
    batch_number: "",
    complaint_description: "",
  });

  const [result, setResult] = useState(null);

  const [complaints, setComplaints] =
    useState([]);

  const [selectedComplaint,
    setSelectedComplaint] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingHistory,
    setLoadingHistory] =
    useState(true);

  const [loadingDetails,
    setLoadingDetails] =
    useState(false);

  const [error, setError] =
    useState("");


  // =================================================
  // LOAD COMPLAINTS
  // =================================================

  const loadComplaints = async () => {

    try {

      setLoadingHistory(true);
      setError("");

      const response =
        await fetch(
          "/api/complaints"
        );

      const text =
        await response.text();

      let data;

      try {

        data = JSON.parse(text);

      } catch {

        throw new Error(
          `Server returned invalid JSON: ${text}`
        );

      }


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Unable to load complaints"
        );

      }


      setComplaints(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "History error:",
        error
      );

      setError(
        error.message
      );

    } finally {

      setLoadingHistory(false);

    }
  };


  // =================================================
  // LOAD ON PAGE OPEN
  // =================================================

  useEffect(() => {

    loadComplaints();

  }, []);


  // =================================================
  // HANDLE INPUT
  // =================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value
    } = event.target;


    setForm(
      (previousForm) => ({

        ...previousForm,

        [name]: value,

      })
    );
  };


  // =================================================
  // SUBMIT COMPLAINT
  // =================================================

  const submitComplaint = async (
    event
  ) => {

    event.preventDefault();

    setLoading(true);

    setError("");

    setResult(null);


    try {

      const response =
        await fetch(
          "/api/complaints",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              customer_name:
                form.customer_name,

              product_name:
                form.product_name,

              batch_number:
                form.batch_number,

              complaint_description:
                form.complaint_description,

            }),

          }
        );


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        throw new Error(
          `Server returned invalid JSON: ${text}`
        );

      }


      if (!response.ok) {

        if (
          Array.isArray(
            data.detail
          )
        ) {

          const messages =
            data.detail
              .map(
                (item) =>
                  item.msg
              )
              .join(", ");


          throw new Error(
            messages
          );

        }


        throw new Error(
          data.detail ||
          "Unable to submit complaint"
        );

      }


      setResult({

        ...data,

        complaint_id:
          data.complaint_id ??
          data.id,

      });


      setForm({

        customer_name: "",
        product_name: "",
        batch_number: "",
        complaint_description: "",

      });


      await loadComplaints();


    } catch (error) {

      console.error(
        "Complaint submission error:",
        error
      );

      setError(
        error.message
      );

    } finally {

      setLoading(false);

    }
  };


  // =================================================
  // VIEW COMPLAINT
  // =================================================

  const viewComplaint = async (
    complaintId
  ) => {

    try {

      setLoadingDetails(true);

      setError("");

      setSelectedComplaint(null);


      const response =
        await fetch(
          `/api/complaints/${complaintId}`
        );


      const text =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(text);

      } catch {

        throw new Error(
          `Server returned invalid JSON: ${text}`
        );

      }


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Unable to load complaint details"
        );

      }


      setSelectedComplaint(
        data
      );


    } catch (error) {

      console.error(
        "Complaint details error:",
        error
      );

      setError(
        error.message
      );

    } finally {

      setLoadingDetails(false);

    }
  };


  // =================================================
  // STATISTICS
  // =================================================

  const totalComplaints =
    complaints.length;


  const highRisk =
    complaints.filter(
      (complaint) =>
        complaint.risk_level
          ?.toLowerCase() ===
        "high"
    ).length;


  const mediumRisk =
    complaints.filter(
      (complaint) =>
        complaint.risk_level
          ?.toLowerCase() ===
        "medium"
    ).length;


  const lowRisk =
    complaints.filter(
      (complaint) =>
        complaint.risk_level
          ?.toLowerCase() ===
        "low"
    ).length;


  const criticalRisk =
    complaints.filter(
      (complaint) =>
        complaint.risk_level
          ?.toLowerCase() ===
        "critical"
    ).length;


  // =================================================
  // RISK CLASS
  // =================================================

  const getRiskClass = (
    risk
  ) => {

    if (!risk) {
      return "";
    }

    return risk
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );
  };


  // =================================================
  // CLOSE DETAILS
  // =================================================

  const closeDetails = () => {

    setSelectedComplaint(
      null
    );

  };


  // =================================================
  // UI
  // =================================================

  return (

    <div className="app">


      {/* HEADER */}

      <header>

        <h1>AIVOA</h1>

        <p>
          AI-Powered Customer
          Complaint Management
        </p>

      </header>


      <main>


        {/* DASHBOARD */}

        <section className="dashboard">

          <h2>
            Complaint Dashboard
          </h2>


          <div className="stats">


            <div className="stat-card">

              <h3>
                Total Complaints
              </h3>

              <strong>
                {totalComplaints}
              </strong>

            </div>


            <div className="stat-card">

              <h3>
                Critical Risk
              </h3>

              <strong>
                {criticalRisk}
              </strong>

            </div>


            <div className="stat-card">

              <h3>
                High Risk
              </h3>

              <strong>
                {highRisk}
              </strong>

            </div>


            <div className="stat-card">

              <h3>
                Medium Risk
              </h3>

              <strong>
                {mediumRisk}
              </strong>

            </div>


            <div className="stat-card">

              <h3>
                Low Risk
              </h3>

              <strong>
                {lowRisk}
              </strong>

            </div>


          </div>

        </section>


        {/* COMPLAINT FORM */}

        <section className="card">

          <h2>
            Log Customer Complaint
          </h2>


          <form
            onSubmit={
              submitComplaint
            }
          >


            <label
              htmlFor="customer_name"
            >
              Customer Name
            </label>


            <input

              id="customer_name"

              name="customer_name"

              type="text"

              value={
                form.customer_name
              }

              onChange={
                handleChange
              }

              placeholder=
                "Enter customer name"

              required

            />


            <label
              htmlFor="product_name"
            >
              Product Name
            </label>


            <input

              id="product_name"

              name="product_name"

              type="text"

              value={
                form.product_name
              }

              onChange={
                handleChange
              }

              placeholder=
                "Enter product name"

              required

            />


            <label
              htmlFor="batch_number"
            >
              Batch Number
            </label>


            <input

              id="batch_number"

              name="batch_number"

              type="text"

              value={
                form.batch_number
              }

              onChange={
                handleChange
              }

              placeholder=
                "Enter batch number"

            />


            <label
              htmlFor=
                "complaint_description"
            >
              Complaint Description
            </label>


            <textarea

              id=
                "complaint_description"

              name=
                "complaint_description"

              value={
                form.complaint_description
              }

              onChange={
                handleChange
              }

              placeholder=
                "Describe the customer complaint..."

              rows="6"

              required

            />


            <button

              type="submit"

              disabled={loading}

            >

              {loading
                ? "Analyzing Complaint..."
                : "Analyze Complaint"}

            </button>


          </form>


          {error && (

            <div className="error">

              <strong>
                Error:
              </strong>

              <p>
                {error}
              </p>

            </div>

          )}

        </section>


        {/* AI RESULT */}

        {result && (

          <section
            className="card result"
          >

            <h2>
              AI Copilot Risk Assessment
            </h2>


            <div className="result-box">

              <strong>
                Complaint ID
              </strong>

              <p>
                {
                  result.complaint_id
                }
              </p>

            </div>


            <div className="result-box">

              <strong>
                Risk Level
              </strong>

              <p>

                <span
                  className={
                    `risk ${
                      getRiskClass(
                        result.risk_level
                      )
                    }`
                  }
                >
                  {
                    result.risk_level
                  }
                </span>

              </p>

            </div>


            <div className="result-box">

              <strong>
                AI Assessment
              </strong>

              <p>
                {
                  result.ai_assessment
                }
              </p>

            </div>


            {result.recommendation && (

              <div
                className="result-box"
              >

                <strong>
                  Recommended Action
                </strong>

                <p>
                  {
                    result.recommendation
                  }
                </p>

              </div>

            )}

          </section>

        )}


        {/* COMPLAINT DETAILS */}

        {loadingDetails && (

          <section className="card">

            <h2>
              Complaint Details
            </h2>

            <p>
              Loading complaint details...
            </p>

          </section>

        )}


        {selectedComplaint &&
          !loadingDetails && (

          <section
            className="card result"
          >

            <div
              className="history-header"
            >

              <h2>
                Complaint #
                {
                  selectedComplaint.id
                }
              </h2>


              <button
                type="button"
                onClick={
                  closeDetails
                }
              >
                Close
              </button>

            </div>


            <div className="result-box">

              <strong>
                Customer
              </strong>

              <p>
                {
                  selectedComplaint
                    .customer_name
                }
              </p>

            </div>


            <div className="result-box">

              <strong>
                Product
              </strong>

              <p>
                {
                  selectedComplaint
                    .product_name
                }
              </p>

            </div>


            <div className="result-box">

              <strong>
                Batch Number
              </strong>

              <p>
                {
                  selectedComplaint
                    .batch_number ||
                  "-"
                }
              </p>

            </div>


            <div className="result-box">

              <strong>
                Complaint
              </strong>

              <p>
                {
                  selectedComplaint
                    .complaint_description
                }
              </p>

            </div>


            <div className="result-box">

              <strong>
                Risk Level
              </strong>

              <p>

                <span
                  className={
                    `risk ${
                      getRiskClass(
                        selectedComplaint
                          .risk_level
                      )
                    }`
                  }
                >
                  {
                    selectedComplaint
                      .risk_level ||
                    "Unknown"
                  }
                </span>

              </p>

            </div>


            <div className="result-box">

              <strong>
                AI Assessment
              </strong>

              <p>
                {
                  selectedComplaint
                    .ai_assessment ||
                  "No AI assessment available."
                }
              </p>

            </div>


          </section>

        )}


        {/* COMPLAINT HISTORY */}

        <section
          className="card history"
        >

          <div
            className="history-header"
          >

            <h2>
              Complaint History
            </h2>


            <button

              type="button"

              onClick={
                loadComplaints
              }

              disabled={
                loadingHistory
              }

            >

              {loadingHistory
                ? "Loading..."
                : "Refresh"}

            </button>

          </div>


          {loadingHistory ? (

            <p>
              Loading complaints...
            </p>

          ) : complaints.length === 0 ? (

            <p>
              No complaints found.
            </p>

          ) : (

            <div
              className="table-container"
            >

              <table>

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Customer</th>

                    <th>Product</th>

                    <th>Batch</th>

                    <th>Risk</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {complaints.map(
                    (complaint) => (

                    <tr
                      key={
                        complaint.id
                      }
                    >

                      <td>
                        #
                        {
                          complaint.id
                        }
                      </td>


                      <td>
                        {
                          complaint
                            .customer_name
                        }
                      </td>


                      <td>
                        {
                          complaint
                            .product_name
                        }
                      </td>


                      <td>
                        {
                          complaint
                            .batch_number ||
                          "-"
                        }
                      </td>


                      <td>

                        <span
                          className={
                            `risk ${
                              getRiskClass(
                                complaint
                                  .risk_level
                              )
                            }`
                          }
                        >
                          {
                            complaint
                              .risk_level ||
                            "Unknown"
                          }
                        </span>

                      </td>


                      <td>

                        <button

                          type="button"

                          onClick={() =>
                            viewComplaint(
                              complaint.id
                            )
                          }

                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>


      </main>

    </div>

  );
}


export default App;