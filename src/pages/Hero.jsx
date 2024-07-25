import { useState } from "react";
import "../style/Hero.css";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import iconJson from "../assets/IconJson.png";
import rocket from "../assets/rocket.gif";
import { jsonrepair } from "jsonrepair";

const Hero = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      method: "GET",
      url: "",
      token: "",
      textareaBody: "",
      apiResponse: "",
      apiError: "",
    },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [nextId, setNextId] = useState(2);
  const [entity, setEntity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e, id) => {
    const { name, value } = e.target;
    setTabs((prevTab) =>
      prevTab.map((tab) => (tab.id === id ? { ...tab, [name]: value } : tab))
    );
  };

  // Repair JSON
  const repair = () => {
    try {
      const json = tabs.find((tab) => tab.id === activeTab).textareaBody;
      const repaired = jsonrepair(json);
      setTabs((prevTab) =>
        prevTab.map((tab) =>
          tab.id === activeTab ? { ...tab, textareaBody: repaired } : tab
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestObj = tabs.filter((tab) => tab.id === activeTab);
    fetchData(requestObj[0]);
  };

  const handleAddTab = () => {
    setTabs((prev) => [
      ...prev,
      {
        id: nextId,
        method: "GET",
        url: "",
        token: "",
        textareaBody: "",
        apiResponse: "",
        apiError: "",
      },
    ]);
    setActiveTab(nextId);
    setNextId((prev) => prev + 1);
  };

  const handleRemoveTab = (id) => {
    const tabList = tabs.filter((item) => item.id !== id);
    setTabs(tabList);

    if (tabList.length === 0) {
      setActiveTab(null);
    } else if (activeTab === id) {
      setActiveTab(tabList[0].id);
    }
  };

  const handleActive = (id) => {
    setActiveTab(id);
  };

  const fetchData = async (obj) => {
    setLoading(true);

    const attachObj = {
      method: obj.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: obj.token,
      },
    };

    if (obj.method !== "GET") {
      attachObj.body = obj.textareaBody;
    }

    try {
      const response = await fetch(`${obj.url}`, attachObj);
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }
      const jsonData = await response.json();

      setTabs((prevTab) =>
        prevTab.map((tab) =>
          tab.id === obj.id
            ? { ...tab, apiResponse: jsonData, apiError: "" }
            : tab
        )
      );
    } catch (error) {
      setTabs((prevTab) =>
        prevTab.map((tab) =>
          tab.id === obj.id ? { ...tab, apiError: error, apiResponse: "" } : tab
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="hero-container">
      <div className="hero-tabParent">
        {tabs.map((item) => (
          <div
            key={item.id}
            className={`hero-tabChild ${activeTab === item.id ? "active" : ""}`}
            onClick={() => handleActive(item.id)}
          >
            <div className="tabChild-left">
              <span className="tabChildReq">{item.method}</span>
              <span>Request</span>
            </div>
            <div className="tabChild-right">
              <span
                className="tabChild-closeBtn"
                style={{ fontSize: "bold" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTab(item.id);
                }}
              >
                <IoMdClose size={20} fontWeight={800} />
              </span>
            </div>
          </div>
        ))}

        <IoMdAdd
          size={20}
          className="hero-addTabButton"
          onClick={handleAddTab}
        />
      </div>

      {activeTab && activeTabData && (
        <div className="hero-bodyBox">
          <form onSubmit={handleSubmit} className="hero-form">
            <select
              name="method"
              onChange={(e) => handleChange(e, activeTab)}
              value={activeTabData.method || "GET"}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="DELETE">DELETE</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              className="ui-url"
              value={activeTabData.url || ""}
              name="url"
              placeholder="Enter URL or paste text"
              onChange={(e) => handleChange(e, activeTab)}
            />
            <button type="submit">Send</button>
          </form>
          <div className="hero-entityBoxParent">
            <div className="hero-entityBox">
              <span onClick={() => setEntity(1)}>Headers</span>

              <span onClick={() => setEntity(2)}>Body</span>
            </div>
            <div className="hero-entityBoxBody">
              {entity === 1 ? (
                <div className="heroEntityHeaders">
                  <div>
                    <span>Authorization </span>
                  </div>
                  <span>:</span>
                  <div className="heroEntityHeaders-value">
                    <input
                      className=""
                      type="text"
                      placeholder=" Value"
                      name="token"
                      onChange={(e) => handleChange(e, activeTab)}
                      value={activeTabData.token || ""}
                    />
                  </div>
                </div>
              ) : (
                <div className="heroEntityBody">
                  <textarea
                    name="textareaBody"
                    id=""
                    placeholder="JSON"
                    onChange={(e) => handleChange(e, activeTab)}
                    value={activeTabData.textareaBody || ""}
                  ></textarea>
                  <img
                    src={iconJson}
                    alt="icon"
                    className="jsonFormatIcon"
                    title="Format JSON"
                    onClick={repair}
                  />
                </div>
              )}
            </div>
            <div className="hero-responseBox">
              {activeTabData.apiError === "" &&
              activeTabData.apiResponse === "" ? (
                <>
                  <img
                    src={rocket}
                    alt="rocket image"
                    className="responseImage"
                  />
                  <span>Enter the URL and click send to get a response</span>
                </>
              ) : loading ? (
                <div className="loader-box">
                  <div className="loader"></div>
                </div>
              ) : (
                <div className="responseOrError">
                  <pre className="json-pre">
                    {activeTabData.apiResponse === "" ? (
                      <code style={{ color: "red", fontWeight: "bold" }}>
                        {JSON.stringify(
                          activeTabData.apiError.message,
                          null,
                          2
                        )}
                      </code>
                    ) : (
                      <code>
                        {JSON.stringify(activeTabData.apiResponse, null, 2)}
                      </code>
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="hidingScroll"></div>
    </div>
  );
};

export default Hero;
