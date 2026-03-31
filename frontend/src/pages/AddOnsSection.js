import React, { useEffect, useState } from "react";
import "./AddOns.css";
import { getAddOns } from "../utils/api";



const TABS = [
  { key: "meal", label: "Meals" },
  { key: "baggage", label: "Excess Baggage" },
];

export default function AddOnsSection({selected,setSelected}) {
  const [tab, setTab] = useState("meal");
  const [addons, setAddons] = useState([]);
  const [veg, setVeg] = useState(null);

  useEffect(() => {
    fetchAddons();
  }, [tab, veg]);

  const fetchAddons = async () => {
  try {
    const params = { type: tab };

    if (tab === "meal" && veg !== null) {
      params.veg = veg;
    }

    const res = await getAddOns(params);
    setAddons(res.data);
    console.log("DATA:", res.data);
  } catch (err) {
    console.error(err);
  }
};

  const toggleAdd = (item) => {
  const safe = Array.isArray(selected) ? selected : [];

  const exists = safe.find(i => i._id === item._id);

  const updated = exists
    ? safe.filter(i => i._id !== item._id)
    : [...safe, item];

  setSelected(updated);
};

  return (
    <div className="addons-container card">
      <h3 className="sc-title">Add-ons</h3>

      {/* Tabs */}
      <div className="addons-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Veg filter */}
      {tab === "meal" && (
  <div className="addons-filter">
    <button
      className={`filter-btn ${veg === true ? "active veg" : ""}`}
      onClick={() => setVeg(true)}
    >
      <span className="dot veg"></span>
      Veg
    </button>

    <button
      className={`filter-btn ${veg === false ? "active nonveg" : ""}`}
      onClick={() => setVeg(false)}
    >
      <span className="dot nonveg"></span>
      Non-Veg
    </button>

    <button
      className={`filter-btn ${veg === null ? "active" : ""}`}
      onClick={() => setVeg(null)}
    >
      All
    </button>
  </div>
)}

      {/* Cards */}
      <div className="addons-list">
  {addons.map((item) => {
    const safeSelected = Array.isArray(selected) ? selected : [];
const isSelected = safeSelected.find(i => i._id === item._id);

    return (
      <div key={item._id} className={`addon-row ${isSelected ? "selected" : ""}`}>
        
        {/* LEFT */}
        <div className="addon-img-wrap">
          {item.type === "meal" ? (
            <>
              <img src={item.image} alt="" />
              <span className={`veg-dot ${item.veg ? "veg" : "nonveg"}`} />
            </>
          ) : (
            <div className="baggage-box">{item.baggageWeight}kg</div>
          )}
        </div>

        {/* CENTER */}
        <div className="addon-info">
          <div className="addon-name">{item.name}</div>
          <div className="addon-price">₹{item.price}</div>
          <div className="addon-more">More info</div>
        </div>

        {/* RIGHT */}
        <button
          className={`addon-btn ${isSelected ? "added" : ""}`}
          onClick={() => toggleAdd(item)}
        >
          {isSelected ? "Added" : "Add"}
        </button>

      </div>
    );
  })}
</div>
    </div>
  );
}