import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/accommodations";

export default function CheckAccommodationForm() {
  const [allVacant, setAllVacant] = useState([]); // only Vacant from backend
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("");
  const [suburb, setSuburb] = useState("");

  useEffect(() => {
    const fetchVacant = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (res.ok) {
          // keep ONLY vacant
          const vacantOnly = data.filter(
            (a) => (a.vacant_status || "").toLowerCase() === "vacant"
          );
          setAllVacant(vacantOnly);
        }
      } catch (err) {
        console.error("Error fetching accommodations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVacant();
  }, []);

  // unique types from vacant list
  const typeOptions = Array.from(
    new Set(allVacant.map((a) => a.acc_type))
  ).filter(Boolean);

  // configs depend on selected type
  const configOptions = allVacant
    .filter((a) => a.acc_type === selectedType)
    .map((a) => a.configuration)
    .filter(Boolean);

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setSelectedType(val);
    // reset config when type changes
    setSelectedConfig("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // here you can call backend again or show result
    // for now just log
    console.log({
      type: selectedType,
      configuration: selectedConfig,
      suburb,
    });
  };

  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src="/logo.png"
            alt="Nurse Assist 24/7"
            className="h-10 object-contain"
          />
          <h2 className="text-lg font-semibold text-center">
            Find Your Accommodation
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Follow the steps below to check availability
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-6 text-sm">
            Loading available accommodations...
          </p>
        ) : typeOptions.length === 0 ? (
          <p className="text-center text-red-400 py-6 text-sm">
            No vacant accommodations right now.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* TYPE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Accommodation Type
              </label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-200 focus:outline-none"
              >
                <option value="">Choose accommodation type...</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* CONFIG */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Room Configuration
              </label>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                disabled={!selectedType}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-pink-200 focus:outline-none"
              >
                <option value="">Choose room configuration...</option>
                {configOptions.map((cfg) => (
                  <option key={cfg} value={cfg}>
                    {cfg}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBURB */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Suburb
              </label>
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="e.g., Sydney"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#D2138C] hover:bg-[#B01076] text-white rounded-lg py-2.5 font-medium"
              disabled={!selectedType || !selectedConfig}
            >
              Check Availability
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
