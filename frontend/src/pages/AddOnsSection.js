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
      if (veg !== null) params.veg = veg;

      const res = await getAddOns(params);
      setAddons(res.data);
      console.log(res.data)
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAdd = (item) => {
    setSelected((prev) =>
      prev.find((i) => i._id === item._id)
        ? prev.filter((i) => i._id !== item._id)
        : [...prev, item]
    );
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
          <button onClick={() => setVeg(true)}>Veg</button>
          <button onClick={() => setVeg(false)}>Non-Veg</button>
          <button onClick={() => setVeg(null)}>All</button>
        </div>
      )}

      {/* Cards */}
      <div className="addons-grid">
        {addons.map((item) => (
          <div key={item._id} className="addon-card">
            
            {item.type === "baggage" ? (
              <h3>{item.baggageWeight} kg Extra</h3>
            ) : (
              <img src={item.image} alt="" />
            )}

            <div className="addon-info">
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>

            <button onClick={() => toggleAdd(item)}>
              {selected.find((i) => i._id === item._id)
                ? "Remove"
                : "Add"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}